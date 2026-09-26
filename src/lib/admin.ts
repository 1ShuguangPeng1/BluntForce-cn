type UserWithEmail = {
  email: string;
};

function configuredAdminEmails() {
  return new Set(
    (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function isAdminUser(user: UserWithEmail | null | undefined) {
  return Boolean(user && configuredAdminEmails().has(user.email.toLowerCase()));
}
