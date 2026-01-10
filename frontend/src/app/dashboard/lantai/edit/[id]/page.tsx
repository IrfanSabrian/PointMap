"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import LantaiForm from "@/components/dashboard/LantaiForm";

export default function EditLantaiPage() {
  const params = useParams();
  const id = params?.id;

  const [lantai, setLantai] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchLantai = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/lantai-gambar/${id}`
        );
        if (res.ok) {
          const data = await res.json();
          setLantai(data);
        }
      } catch (error) {
        console.error("Error fetching floor:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLantai();
  }, [id]);

  if (isLoading) return <div className="p-8 text-center">Loading...</div>;
  if (!lantai)
    return (
      <div className="p-8 text-center text-red-500">
        Data lantai tidak ditemukan
      </div>
    );

  return (
    <div className="w-full">
      <LantaiForm initialData={lantai} isEdit={true} />
    </div>
  );
}
