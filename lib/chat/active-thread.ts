/**
 * Module-level tracking of the currently active thread ID.
 * Updated by the Thread component via setActiveThreadId().
 * Read by CustomChatTransport (non-React context) to attach X-Session-ID headers.
 */
let _activeThreadId: string | null = null;

export function setActiveThreadId(id: string | null): void {
  _activeThreadId = id;
}

export function getActiveThreadId(): string | null {
  return _activeThreadId;
}
