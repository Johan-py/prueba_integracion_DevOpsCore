// frontend/src/components/VisualFilters/VisualFiltersSection.tsx
"use client";

import { useEffect, useState } from "react";
import PropertyCarousel from "./PropertyCarousel";
import PropertyTypeGrid from "./PropertyTypeGrid";

const CITY_IMAGES: Record<string, string> = {
  "SANTA CRUZ": "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400&q=80",
  "LA PAZ": "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&q=80",
  "COCHABAMBA": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&q=80",
  "ORURO": "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=400&q=80",
  "POTOSÍ": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80",
  "SUCRE": "https://images.unsplash.com/photo-1549417229-aa67d3263ad5?w=400&q=80",
  "BENI": "https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=400&q=80",
  "TARIJA": "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=400&q=80",
  "PANDO": "https://images.unsplash.com/photo-1516939884455-1445c8652f83?w=400&q=80",
  default: "https://images.unsplash.com/photo-1560448075-bb485b067938?w=400&q=80",
};

// Bolivia tiene 9 departamentos — estos siempre se muestran aunque tengan 0
const DEPARTAMENTOS_BASE = [
  "SANTA CRUZ",
  "LA PAZ",
  "COCHABAMBA",
  "ORURO",
  "POTOSÍ",
  "SUCRE",
  "TARIJA",
  "BENI",
  "PANDO",
];

function getCityImage(dept: string): string {
  const key = dept.toUpperCase();
  return CITY_IMAGES[key] ?? CITY_IMAGES.default;
}

// Formato que viene del backend
interface BackendItem {
  name: string;
  count: number;
  previews?: Array<{ imagen: string; titulo: string }>;
}

interface BackendResponse {
  rentals: BackendItem[];
  sales: BackendItem[];
  categories: BackendItem[];
}

interface FilterData {
  nombre: string;
  total: number;
  previews?: Array<{ imagen: string; titulo: string }>;

}

function normalizeName(name: string): string {
  return name.trim().toUpperCase();
}

function mergeDepartamentos(
  base: string[],
  datos: BackendItem[]
): FilterData[] {
  const result = base.map((dept) => {
    const found = datos.find(
      (d) => normalizeName(d.name) === normalizeName(dept)
    );
    return {
      nombre: dept,
      total: found?.count ?? 0,
      previews: found?.previews ?? [],
    };
  });

  // Ordenar de mayor a menor para mostrar primero las ciudades con más inmuebles
  return result.sort((a, b) => b.total - a.total);
}

export default function VisualFiltersSection() {
  const [alquileres, setAlquileres] = useState<FilterData[]>([]);
  const [ventas, setVentas] = useState<FilterData[]>([]);
  const [tipos, setTipos] = useState<FilterData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"}/api/filters`
        );

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json: BackendResponse = await res.json();

        // El backend puede envolver en { success, data } o directo
        const payload: BackendResponse =
          (json as any).data ?? json;

        setAlquileres(mergeDepartamentos(DEPARTAMENTOS_BASE, payload.rentals ?? []));
        setVentas(mergeDepartamentos(DEPARTAMENTOS_BASE, payload.sales ?? []));

        // Tipos: mapear categories del backend
        const tiposBase = ["casa", "departamento", "cuarto", "terreno", "terreno_mortuorio"];
        const tiposMapped = tiposBase.map((base) => {
          const found = (payload.categories ?? []).find((c) =>
            normalizeName(c.name).includes(base.toUpperCase())
          );

          let label = base.charAt(0).toUpperCase() + base.slice(1) + "s";
          if (base === "terreno_mortuorio") label = "Espacios Cementerios";

          return {
            nombre: label,
            total: found?.count ?? 0,
          };
        });
        setTipos(tiposMapped.sort((a, b) => b.total - a.total));

      } catch (err) {
        console.warn("VisualFiltersSection: backend no disponible.", err);
        // Sin datos reales → mostrar departamentos en 0, nunca romper la UI
        setAlquileres(mergeDepartamentos(DEPARTAMENTOS_BASE, []));
        setVentas(mergeDepartamentos(DEPARTAMENTOS_BASE, []));
        setTipos([
          { nombre: "Casas", total: 0 },
          { nombre: "Departamentos", total: 0 },
          { nombre: "Cuartos", total: 0 },
          { nombre: "Terrenos", total: 0 },
          { nombre: "Espacios Cementerios", total: 0 },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchFilters();
  }, []);

  if (loading) {
    return (
      <section className="w-full px-4 md:px-8 py-8 flex justify-center">
        <div className="w-full max-w-[1100px] animate-pulse space-y-8">
          <div className="h-4 w-24 bg-gray-200 rounded" />
          <div className="flex gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="min-w-[200px] h-[200px] bg-gray-200 rounded-xl" />
            ))}
          </div>
          <div className="h-4 w-24 bg-gray-200 rounded" />
          <div className="flex gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="min-w-[160px] h-[160px] bg-gray-200 rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  const alquilerItems = alquileres.map((item) => ({
    image: getCityImage(item.nombre),
    title: item.nombre,
    location: item.total > 0
      ? `${item.total.toLocaleString()} propiedades`
      : "Sin propiedades",
    count: item.total,
    filterParam: item.nombre,
    previews: item.previews ?? [],
  })).sort((a, b) => b.count - a.count);

  const ventaItems = ventas.map((item) => ({
    image: getCityImage(item.nombre),
    title: item.nombre,
    location: item.total > 0
      ? `${item.total.toLocaleString()} propiedades`
      : "Sin propiedades",
    count: item.total,
    filterParam: item.nombre,
    previews: item.previews ?? [],
  })).sort((a, b) => b.count - a.count);

  const tipoItems = tipos.map((item) => ({
    key: item.nombre.toLowerCase().replace(/\s+/g, ""),
    label: item.nombre,
    count: item.total,
  })).sort((a, b) => b.count - a.count);

  return (
    <section id="tour-filtros-visuales" className="w-full px-4 md:px-8 py-8 flex justify-center">
      <div className="w-full max-w-[1100px]">
        <PropertyCarousel title="Alquileres" items={alquilerItems} category="alquiler" />
        <PropertyCarousel title="En Venta" items={ventaItems} category="venta" />
        <PropertyTypeGrid items={tipoItems} />
      </div>
    </section>
  );
}