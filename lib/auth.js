import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, isValidSessionToken } from "./webCryptoAuth";

export { SESSION_COOKIE_NAME } from "./webCryptoAuth";
export { createSessionToken } from "./webCryptoAuth";

export async function isAuthenticated() {
  const store = cookies();
  const token = store.get(SESSION_COOKIE_NAME)?.value;
  return isValidSessionToken(token);
}
