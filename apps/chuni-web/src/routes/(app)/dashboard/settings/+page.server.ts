import { fail } from "@sveltejs/kit";
import { eq, sql } from "drizzle-orm";
import { nanoid } from "nanoid";

import { db } from "$lib/db";

import {
  parseManualRatingCsv,
  validateManualRatingUploadRecords,
} from "@repo/core/web";
import { apiKey, manualRatingTable } from "@repo/database/chuni";

import type { Actions, PageServerLoad } from "./$types";

const MAX_UPLOAD_SIZE = 5 * 1024 * 1024;

export const load: PageServerLoad = async ({ parent }) => {
  const { user } = await parent();

  const [apiKeyResult] = await db
    .select({ apiKey: apiKey.apiKey, createdAt: apiKey.createdAt })
    .from(apiKey)
    .where(eq(apiKey.userId, user.id));

  return {
    apiKey: apiKeyResult?.apiKey ?? null,
    apiKeyCreatedAt: apiKeyResult?.createdAt ?? null,
  };
};

export const actions: Actions = {
  generateApiKey: async ({ locals }) => {
    const session = await locals.auth();

    if (!session?.user?.id) {
      return fail(401, { error: "Unauthorized" });
    }

    const newApiKey = nanoid(32);

    await db
      .insert(apiKey)
      .values({
        userId: session.user.id,
        apiKey: newApiKey,
      })
      .onConflictDoUpdate({
        target: apiKey.userId,
        set: {
          apiKey: newApiKey,
          createdAt: sql`now()`,
        },
      });

    return { success: true, apiKey: newApiKey };
  },

  previewManualRatingUpload: async ({ request, locals }) => {
    const session = await locals.auth();

    if (!session?.user?.id) {
      return fail(401, {
        manualRatingUpload: {
          status: "error" as const,
          message: "Unauthorized",
        },
      });
    }
    const formData = await request.formData();
    const file = formData.get("ratingCsv");

    if (!(file instanceof File) || file.size === 0) {
      return fail(400, {
        manualRatingUpload: {
          status: "error" as const,
          message: "Choose a CSV file first.",
        },
      });
    }

    if (file.size > MAX_UPLOAD_SIZE) {
      return fail(400, {
        manualRatingUpload: {
          status: "error" as const,
          message: "CSV file is too large. Please keep it under 5 MB.",
        },
      });
    }

    try {
      const preview = parseManualRatingCsv(await file.text(), "chuni", {
        localTimeZone: formData.get("localTimeZone"),
        timeZoneMode: formData.get("timeZoneMode"),
      });
      const recordsJson = JSON.stringify(
        preview.records.map((record) => ({
          timestamp: record.timestamp,
          rating: record.rating,
        })),
      );

      return {
        manualRatingUpload: {
          status: "preview" as const,
          fileName: file.name,
          preview,
          recordsJson,
        },
      };
    } catch (error) {
      return fail(400, {
        manualRatingUpload: {
          status: "error" as const,
          message:
            error instanceof Error
              ? error.message
              : "Could not read this CSV file.",
        },
      });
    }
  },

  insertManualRatingUpload: async ({ request, locals }) => {
    const session = await locals.auth();

    if (!session?.user?.id) {
      return fail(401, {
        manualRatingUpload: {
          status: "error" as const,
          message: "Unauthorized",
        },
      });
    }
    const userId = session.user.id;

    const formData = await request.formData();
    const payload = formData.get("records");

    if (typeof payload !== "string") {
      return fail(400, {
        manualRatingUpload: {
          status: "error" as const,
          message: "Preview the CSV before inserting records.",
        },
      });
    }

    try {
      const records = validateManualRatingUploadRecords(
        JSON.parse(payload),
        "chuni",
      );

      if (records.length === 0) {
        return fail(400, {
          manualRatingUpload: {
            status: "error" as const,
            message: "No rating rows are available to insert.",
          },
        });
      }

      await db.insert(manualRatingTable).values(
        records.map((record) => ({
          userId,
          rating: record.rating.toFixed(4),
          timestamp: new Date(record.timestamp),
        })),
      );

      return {
        manualRatingUpload: {
          status: "inserted" as const,
          insertedCount: records.length,
        },
      };
    } catch (error) {
      return fail(400, {
        manualRatingUpload: {
          status: "error" as const,
          message:
            error instanceof Error
              ? error.message
              : "Could not insert manual ratings.",
        },
      });
    }
  },
};
