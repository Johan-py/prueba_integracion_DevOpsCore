"use client";

import { useState } from "react";
import MapView from "./MapView";

import type { PropertyMapPin } from "@/types/property";

export default function Page() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const properties: PropertyMapPin[] = [
    {
      id: "1",
      title: "Propiedad 1",
      lat: -17.39,
      lng: -66.14,
      price: 100000,
      currency: "USD",
      type: "casa", // ✅ CORREGIDO
    },
  ];

  return (
    <div className="w-full h-screen">
      <MapView
        properties={properties}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />
    </div>
  );
}