// Lightweight auth helpers (framework-agnostic)
//
// Utilitas sederhana untuk validasi token JWT di sisi client dan
// penjadwalan auto-logout saat token kedaluwarsa.

/** Decode payload JWT tanpa verifikasi signature. */
function decodeJwt(token: string): any | null {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch (_err) {
    return null;
  }
}

/**
 * Validasi token JWT berdasarkan field exp (expiry).
 * Menghapus token dari localStorage jika sudah kedaluwarsa.
 */
export function validateToken(token: string): boolean {
  const payload = decodeJwt(token);
  if (!payload || typeof payload.exp !== "number") return false;
  const nowSec = Math.floor(Date.now() / 1000);
  if (nowSec > payload.exp) {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } catch (_err) {
      // ignore
    }
    return false;
  }
  return true;
}

/**
 * Jadwalkan logout otomatis pada saat token kedaluwarsa.
 * Menghapus token, memicu event `login-status-changed`, dan redirect ke /login.
 * @param token JWT bearer token
 * @param onExpire Callback opsional yang dipanggil saat token habis
 */
export function setupAutoLogout(token: string, onExpire?: () => void) {
  const payload = decodeJwt(token);
  if (!payload || typeof payload.exp !== "number") return;
  const nowSec = Math.floor(Date.now() / 1000);
  const msUntilExpiry = Math.max((payload.exp - nowSec) * 1000, 0);

  // Schedule logout at expiry
  setTimeout(() => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } catch (_err) {
      // ignore
    }
    if (typeof onExpire === "function") onExpire();
    try {
      window.dispatchEvent(new Event("login-status-changed"));
    } catch (_err) {
      // ignore
    }
    // Optional: redirect to login
    try {
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    } catch (_err) {
      // ignore
    }
  }, msUntilExpiry);
}
