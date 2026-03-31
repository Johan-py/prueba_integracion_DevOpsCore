import Link from "next/link";
import link from "next/link";
// se realizo el pago Qr
export default function Home() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl f0ont-bold text-center mb-8">
        Historia de usuarios
      </h1>
      <p className="text-lg text-center text-gray-600 mb-12">
        Esta es la página de inicio. Comienza a construir tu aplicación aquí.
      </p>
      <div className="flex justify-center">
        <Link
          href="/pago-qr"
          className="bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-7 00 transition"
        >
          Realizar QR
        </Link>
      </div>
    </div>
  );
}
