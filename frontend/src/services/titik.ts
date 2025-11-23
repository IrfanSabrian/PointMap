const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface Titik {
  id_titik: number;
  nama: string | null;
  koordinat_x: number;
  koordinat_y: number;
  geometri: string;
  created_at: string;
}

export const getTitik = async (): Promise<Titik[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/titik`, {
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
    console.error("Error fetching titik data:", error);
    return [];
  }
};

export const getTitikById = async (id: number): Promise<Titik | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/titik/${id}`, {
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
    console.error("Error fetching titik by ID:", error);
    return null;
  }
};
