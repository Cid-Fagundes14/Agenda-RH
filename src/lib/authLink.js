const setupKey = "agenda-rh:password-setup";

export function readPasswordSetup() {
  try {
    const state = JSON.parse(sessionStorage.getItem(setupKey) || "null");
    if (state && state.expiresAt > Date.now() && ["invite", "recovery"].includes(state.flow)) return state;
  } catch {
    // An unavailable or incomplete tab session cannot resume a link.
  }
  return null;
}

export function rememberPasswordSetup(userId, flow) {
  sessionStorage.setItem(setupKey, JSON.stringify({ userId, flow, expiresAt: Date.now() + 15 * 60_000 }));
}

export function pendingPasswordSetup(userId) {
  const state = readPasswordSetup();
  return state?.userId === userId ? state.flow : null;
}

export function clearPasswordSetup() {
  sessionStorage.removeItem(setupKey);
}

export function stripAuthToken() {
  const url = new URL(window.location.href);
  url.searchParams.delete("token_hash");
  window.history.replaceState(window.history.state, "", url.pathname + url.search);
}

export function readInvitationSession(hash) {
  const params = new URLSearchParams(hash.replace(/^#/, ""));
  if (params.get("type") !== "invite") return null;
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");
  return accessToken && refreshToken ? { access_token: accessToken, refresh_token: refreshToken } : null;
}
