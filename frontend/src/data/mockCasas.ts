// frontend/src/data/mockCasas.ts

const casasBase = [
  {
    imagen:
      "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    estado: "EN VENTA",
    precio: "$US 180.000",
    descripcion: "Casa Obra Gruesa Sobre terreno de 272m2 en Urbanización Bisa",
    camas: 4,
    banos: 3,
    metros: 272,
  },
  {
    imagen:
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80",
    estado: "EN ALQUILER",
    precio: "$US 800 / mes",
    descripcion: "Hermosa casa minimalista en zona norte con jardín amplio",
    camas: 3,
    banos: 2,
    metros: 150,
  },
  {
    imagen: "",
    estado: "ANTICRÉTICO",
    precio: "$US 35.000",
    descripcion: "Departamento a estrenar, excelente iluminación, céntrico",
    camas: 2,
    banos: 1,
    metros: 85,
  },
];

// Multiplicamos para tener 50 resultados exactos
export const mockCasas = Array.from({ length: 17 })
  .flatMap((_, index) =>
    casasBase.map((prop, subIndex) => ({
      ...prop,
      id: `casa-${index}-${subIndex}`,
    })),
  )
  .slice(0, 50); // Aseguramos que sean exactamente 50
