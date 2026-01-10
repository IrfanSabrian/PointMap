"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import BangunanForm from "@/components/dashboard/BangunanForm";

export default function EditBangunanPage() {
  const params = useParams();
  const id = params?.id;

  const [bangunan, setBangunan] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchBangunan = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bangunan/${id}`
        );
        if (res.ok) {
          const data = await res.json();
          setBangunan(data);
        } else {
          console.error("Failed to fetch building data");
        }
      } catch (error) {
        console.error("Error fetching building:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBangunan();
  }, [id]);

  if (isLoading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (!bangunan) {
    return (
      <div className="p-8 text-center text-red-500">
        Data gedung tidak ditemukan
      </div>
    );
  }

  return (
    <div className="w-full">
      <BangunanForm initialData={bangunan} isEdit={true} />
    </div>
  );
}
