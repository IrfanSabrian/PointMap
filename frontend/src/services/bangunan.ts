/**
 * Bangunan service API helpers
 *
 * Berisi fungsi-fungsi pemanggilan REST API terkait data bangunan.
 * Seluruh fungsi melempar Error saat HTTP response bukan 2xx.
 */
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

const defaultHeaders: Record<string, string> = {
  "ngrok-skip-browser-warning": "true",
};

/**
 * Update data bangunan.
 * @param idBangunan ID bangunan
 * @param data Payload JSON yang akan diupdate
 * @param token JWT bearer token
 * @returns Response JSON dari server
 */
export async function updateBangunan(
  idBangunan: number | string,
  data: Record<string, any>,
  token: string
) {
  const res = await fetch(`${API_BASE}/api/bangunan/${idBangunan}`, {
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
 * Upload thumbnail bangunan.
 * @param idBangunan ID bangunan
 * @param file File gambar thumbnail
 * @param token JWT bearer token
 * @returns Response JSON dari server
 */
export async function uploadBangunanThumbnail(
  idBangunan: number | string,
  file: File,
  token: string
) {
  const formData = new FormData();
  formData.append("thumbnail", file);

  const res = await fetch(
    `${API_BASE}/api/bangunan/${idBangunan}/upload-thumbnail`,
    {
      method: "POST",
      headers: {
        ...defaultHeaders,
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json();
}
