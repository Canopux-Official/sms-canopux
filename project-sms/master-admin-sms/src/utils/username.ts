// Keep in sync with the server's rule (organizationController.isValidUsernameFormat).
// 3-32 chars: lowercase letters, numbers, hyphens, underscores; must start and end with a letter or number.
export const USERNAME_REGEX = /^[a-z0-9](?:[a-z0-9_-]{1,30}[a-z0-9])?$/;

export const sanitizeUsername = (value: string): string =>
  value.toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 32);