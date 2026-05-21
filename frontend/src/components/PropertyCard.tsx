import React from "react";
import { Eye, Share2 } from "lucide-react";

interface Property {
  image?: string;
  title: string;
  price: string | number;
  location: string;
  beds?: number | string;
  baths?: number | string;
  area?: string;

  // Estadísticas individuales de la publicación
  visualizaciones?: number;
  compartidos?: number;
}

interface PropertyCardProps {
  property: Property;
  canEdit: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export default function PropertyCard({
  property,
  canEdit,
  onEdit,
  onDelete,
}: PropertyCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
      <img
        src={
          property.image ||
          "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&q=80"
        }
        alt={property.title}
        className="w-full h-64 object-cover"
      />

      <div className="p-5">
        <div className="flex items-start justify-between gap-4 mb-2">
          <h2 className="text-2xl font-semibold text-gray-800 leading-tight">
            {property.title}
          </h2>

          <span className="text-xl font-bold text-[#c97a1e] whitespace-nowrap">
            ${Number(property.price).toLocaleString("en-US")}
          </span>
        </div>

        {/* Estadísticas individuales de la publicación */}
        <div className="mb-4 flex items-center justify-end gap-5 text-black">
          <div className="flex items-center gap-2">
            <Share2 size={22} strokeWidth={2.2} />
            <span className="text-base font-medium">
              {property.compartidos ?? 0}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Eye size={23} strokeWidth={2.2} />
            <span className="text-base font-medium">
              {property.visualizaciones ?? 0}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-gray-500 mb-4">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span>{property.location}</span>
        </div>

        <div className="flex items-center gap-5 text-gray-600 mb-5">
          <div className="flex items-center gap-1">
            <span>🛏️</span>
            <span>{property.beds || 0}</span>
          </div>

          <div className="flex items-center gap-1">
            <span>🛁</span>
            <span>{property.baths || 0}</span>
          </div>

          <div className="flex items-center gap-1">
            <span>⬜</span>
            <span>{property.area || "N/A"}</span>
          </div>
        </div>

        <div className="flex gap-3">
          {canEdit ? (
            <button
              className="flex-1 py-2.5 rounded-xl border border-gray-400 bg-white text-gray-700 font-medium hover:bg-gray-100 transition"
              onClick={onEdit}
            >
              Editar
            </button>
          ) : (
            <button
              className="flex-1 py-2.5 rounded-xl bg-gray-200 text-gray-500 font-medium cursor-not-allowed"
              disabled
            >
              Editar
            </button>
          )}

          <button
            className="flex-1 py-2.5 rounded-xl bg-[#d8891c] text-white font-medium hover:bg-[#bf7718] transition"
            onClick={onDelete}
          >
            Eliminar
          </button>
        </div>

        <div className="mt-4">
          <button className="text-[#d8891c] font-semibold text-lg hover:underline transition">
            + Añadir otros parámetros
          </button>
        </div>
      </div>
    </div>
  );
}