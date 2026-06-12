export function isAdminUser(
  userId: string | null | undefined,
  adminUserId: string | null | undefined,
): boolean {
  const normalizedAdminUserId = adminUserId?.trim();

  return Boolean(
    userId && normalizedAdminUserId && userId === normalizedAdminUserId,
  );
}
