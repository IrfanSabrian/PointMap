const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://pointmap-production.up.railway.app";

export interface Jalur {
  id_jalur: number;
  mode: "both" | "pejalan";
  arah: "oneway" | "twoway";
  panjang: number;
  waktu_kaki: number;
  waktu_kendara: number;
  geometri: string;
  created_at: string;
}

export const getJalur = async (): Promise<Jalur[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/jalur`, {
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching jalur data:", error);
    return [];
  }
};

export const getJalurById = async (id: number): Promise<Jalur | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/jalur/${id}`, {
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching jalur by ID:", error);
    return null;
  }
};
