
export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

/**
 * Redirect unauthenticated users to the application's
 * Supabase login page.
 */
export const getLoginUrl = (): string => {
  return "/login";
};
