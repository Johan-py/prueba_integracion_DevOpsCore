import { Phone, MessageCircle } from "lucide-react";

export default function PropertyRow({
  title,
  price,
  size,
  contactType,
  image
}: {
  title: string;
  price: string;
  size: string;
  contactType: string;
  image: string;
}) {
  return (
    <div className="grid grid-cols-[40px_70px_minmax(0,1fr)_50px] gap-2 px-3 py-2 items-center">
      
      {/* FOTO */}
      <div className="w-[40px] h-[40px] rounded-md overflow-hidden bg-gray-200">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* PRECIO */}
      <span className="text-[11px] font-semibold text-gray-700">
        {price}
      </span>

      {/* DETALLE */}
      <div className="flex flex-col overflow-hidden min-w-0">
        <span className="text-[11px] font-medium text-gray-800 truncate">
          {title}
        </span>
        <span className="text-[10px] text-gray-500">
          {size}
        </span>
      </div>

      {/* CONTACTO */}
      <div className="flex justify-center">
        {contactType === "whatsapp" ? (
          <MessageCircle className="w-4 h-4 text-green-500 cursor-pointer" />
        ) : (
          <Phone className="w-4 h-4 text-blue-500 cursor-pointer" />
        )}
      </div>
    </div>
  );
}



