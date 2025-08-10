/**
 * Lantai Gambar service API helpers
 *
 * Untuk mengambil, membuat, dan menghapus gambar denah lantai per bangunan.
 */
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

const defaultHeaders: Record<string, string> = {
  "ngrok-skip-browser-warning": "true",
};

/**
 * Ambil daftar gambar lantai untuk suatu bangunan.
 * @param bangunanId ID bangunan
 * @param token JWT bearer token (opsional)
 */
export async function getLantaiGambarByBangunan(
  bangunanId: number,
  token?: string
) {
  const res = await fetch(
    `${API_BASE}/api/lantai-gambar/bangunan/${bangunanId}`,
    {
      headers: {
        ...defaultHeaders,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  );
  if (!res.ok) return [];
  return res.json();
}

/**
 * Buat entri gambar lantai baru.
 * @param params file, nomor lantai, dan id bangunan
 * @param token JWT bearer token
 */
export async function createLantaiGambar(
  params: { file: File; lantaiNumber: number; bangunanId: number },
  token: string
) {
  const formData = new FormData();
  formData.append("gambar_lantai", params.file);
  formData.append("nomor_lantai", String(params.lantaiNumber));
  formData.append("id_bangunan", String(params.bangunanId));

  const url = `${API_BASE}/api/lantai-gambar`;
  console.log("Uploading to:", url);
  console.log("FormData:", {
    file: params.file.name,
    lantaiNumber: params.lantaiNumber,
    bangunanId: params.bangunanId,
  });

  const res = await fetch(url, {
    method: "POST",
    headers: {
      ...defaultHeaders,
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  console.log("Response status:", res.status);
  console.log("Response headers:", res.headers);

  if (!res.ok) {
    const text = await res.text();
    console.error("Error response:", text);
    throw new Error(`HTTP ${res.status}: ${text}`);
  }

  const result = await res.json();
  console.log("Success response:", result);
  return result;
}

/**
 * Hapus gambar lantai.
 * @param lantaiGambarId ID gambar lantai
 * @param token JWT bearer token
 */
export async function deleteLantaiGambar(
  lantaiGambarId: number,
  token: string
) {
  const res = await fetch(`${API_BASE}/api/lantai-gambar/${lantaiGambarId}`, {
    method: "DELETE",
    headers: {
      ...defaultHeaders,
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return true;
}

/**
 * Update gambar lantai.
 * @param lantaiGambarId ID gambar lantai
 * @param params data yang akan diupdate
 * @param token JWT bearer token
 */
export async function updateLantaiGambar(
  lantaiGambarId: number,
  params: {
    nama_file?: string;
    nomor_lantai?: number;
    id_bangunan?: number;
  },
  token: string
) {
  const res = await fetch(`${API_BASE}/api/lantai-gambar/${lantaiGambarId}`, {
    method: "PUT",
    headers: {
      ...defaultHeaders,
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }

  return res.json();
}
