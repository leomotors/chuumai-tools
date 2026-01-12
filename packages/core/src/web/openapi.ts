/**
 * Common OpenAPI constants and definitions
 * Shared across chuni-web and maimai-web
 */

/**
 * Security scheme name for API key authentication
 */
export const API_KEY_SECURITY_SCHEME = "BearerAuth";

/**
 * Security scheme name for session authentication
 */
export const SESSION_SECURITY_SCHEME = "SessionAuth";

/**
 * OpenAPI tag definitions
 */
export const OPENAPI_TAGS = {
  JOBS: {
    name: "Jobs",
    description: "Endpoints for scraper job management",
  },
  USERS: {
    name: "Users",
    description: "Endpoints for user data and statistics",
  },
} as const;

/**
 * Security scheme definitions for OpenAPI
 */
export const SECURITY_SCHEMES = {
  [API_KEY_SECURITY_SCHEME]: {
    type: "http" as const,
    scheme: "bearer",
    bearerFormat: "API Key",
    description:
      "API key for authentication. Can be generated from dashboard. Use format: Authorization: Bearer <api-key>",
  },
  [SESSION_SECURITY_SCHEME]: {
    type: "apiKey" as const,
    in: "cookie" as const,
    name: "authjs.session-token",
    description: "Session cookie from Auth.js login.",
  },
};
