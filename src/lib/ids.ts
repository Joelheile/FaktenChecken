/**
 * Anonymous identifiers for the Neon dataset.
 *
 * - visitor: persistent random uuid in localStorage, lets us see returning users
 *   without any PII.
 * - session: per-visit random uuid in sessionStorage, resets when the tab closes.
 * - check: a fresh uuid per fact check, ties its claims and follow-ups together.
 */

const VISITOR_KEY = "fc_visitor";
const SESSION_KEY = "fc_session";

const read = (storage: Storage, key: string): string => {
  const existing = storage.getItem(key);
  if (existing) {
    return existing;
  }
  const id = crypto.randomUUID();
  storage.setItem(key, id);
  return id;
};

export const getVisitorId = (): string => read(localStorage, VISITOR_KEY);

export const getSessionId = (): string => read(sessionStorage, SESSION_KEY);

export const newCheckId = (): string => crypto.randomUUID();
