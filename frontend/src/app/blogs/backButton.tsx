"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

export default function BackButton() {
  const router = useRouter();

  return (
    <button
    onClick={() => router.back()}
    className="group inline-flex items-center gap-1 px-2 py-1 text-sm font-semibold text-stone-600 transition-colors duration-200 hover:text-[#a56400]"
    >
      <ChevronLeft
        size={18}
        className="transition-transform duration-200 group-hover:-translate-x-1"
        />
      Volver
    </button>
  );
}