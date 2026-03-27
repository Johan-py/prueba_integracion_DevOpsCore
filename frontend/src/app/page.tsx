import PropertyCard from "../components/layout/PropertyCard";export default function Home() {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-4xl font-bold text-center mb-8">Bienvenido</h1>
      <p className="text-lg text-center text-gray-600 mb-12">
        Esta es la página de inicio. Comienza a construir tu...
      </p>
      
      {/* ¡Aquí estamos poniendo tu tarjeta para probarla! */}
      <div className="flex justify-center">
        <PropertyCard />
      </div>
      
    </div>
  );
}