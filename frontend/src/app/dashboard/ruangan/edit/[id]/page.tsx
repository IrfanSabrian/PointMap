"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import RuanganForm from "@/components/dashboard/RuanganForm";

export default function EditRuanganPage() {
  const params = useParams();
  const id = params?.id;

  const [ruangan, setRuangan] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchRuangan = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ruangan/${id}`
        );
        if (res.ok) {
          const data = await res.json();
          setRuangan(data);
        }
      } catch (error) {
        console.error("Error fetching room:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRuangan();
  }, [id]);

  if (isLoading) return <div className="p-8 text-center">Loading...</div>;
  if (!ruangan)
    return (
      <div className="p-8 text-center text-red-500">
        Data ruangan tidak ditemukan
      </div>
    );

  return (
    <div className="w-full">
      <RuanganForm initialData={ruangan} isEdit={true} />
    </div>
  );
}
