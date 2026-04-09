import ContactButton from "./ContactButton";
import Image from "next/image";
import { useState } from "react";
import { MapPin } from "lucide-react";

export default function PropertyRow({
  title,
  price,
  size,
  contactType,
  image
}: {
  title: string
  price: string
  size: string
  contactType: string
  image: string
}) {

  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative grid grid-cols-[40px_70px_minmax(0,1fr)_50px] gap-2 px-3 py-2 items-center transition-all duration-200 hover:bg-gray-50 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >

      {/* PIN EN HOVER */}
      {isHovered && (
        <div className="absolute top-1 right-1 z-20 bg-white rounded-full shadow p-1 border border-gray-200">
          <MapPin className="w-4 h-4 text-[#ea580c]" />
        </div>
      )}

      {/* FOTO */}
      <div className="w-[40px] h-[40px] rounded-md overflow-hidden bg-gray-200">
        <Image
          src={image}
          alt={title}
          className="w-full h-full object-cover"
          width={40}
          height={40}
        />
      </div>

      {/* PRECIO */}
      <span
        className={`font-semibold text-gray-700 transition-all duration-300 ease-in-out ${
          isHovered ? "text-sm" : "text-[11px]"
        }`}
      >
        {price}
      </span>

      {/* DETALLE */}
      <div className="flex flex-col overflow-hidden min-w-0">
        <span className="text-[11px] font-medium text-gray-800 truncate">{title}</span>
        <span className="text-[10px] text-gray-500">{size}</span>
      </div>

      {/* CONTACTO */}
      <div className="flex justify-center">
        <ContactButton type={contactType} variant="table" />
      </div>

    </div>
);
}
