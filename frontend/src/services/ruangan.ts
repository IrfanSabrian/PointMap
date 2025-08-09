/**
 * Ruangan service API helpers
 *
 * Berisi fungsi CRUD ruangan terhadap REST API backend.
 */
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

const defaultHeaders: Record<string, string> = {
  "ngrok-skip-browser-warning": "true",
};

/**
 * Buat ruangan baru.
 * @param data Payload ruangan
 * @param token JWT bearer token
 */
export async function createRuangan(data: Record<string, any>, token: string) {
  const res = await fetch(`${API_BASE}/api/ruangan`, {
    method: "POST",
    headers: {
      ...defaultHeaders,
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json();
}

/**
 * Update ruangan.
 * @param idRuangan ID ruangan
 * @param data Payload ruangan
 * @param token JWT bearer token
 */
export async function updateRuangan(
  idRuangan: number | string,
  data: Record<string, any>,
  token: string
) {
  const res = await fetch(`${API_BASE}/api/ruangan/${idRuangan}`, {
    method: "PUT",
    headers: {
      ...defaultHeaders,
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json();
}

/**
 * Ambil daftar ruangan berdasarkan ID bangunan.
 * @param idBangunan ID bangunan
 */
export async function getRuanganByBangunan(idBangunan: number) {
  const res = await fetch(`${API_BASE}/api/ruangan/bangunan/${idBangunan}`, {
    headers: {
      ...defaultHeaders,
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
