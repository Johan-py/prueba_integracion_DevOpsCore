export type PropertyType = "casa" | "departamento" | "terreno" | "local";
export interface PropertyMapPin {
  id: string;
  title: string;
  price: number;
  type: "casa" | "departamento" | "terreno" | "local";
  operation: "venta" | "alquiler" | "anticretico";
  rooms: number;
  bathrooms: number;
  lat: number;
  lng: number;
}
export const mockProperties: PropertyMapPin[] = [
  {
    id: "1",
    title: "Casa moderna",
    price: 80000,
    type: "casa",
    operation: "venta",
    rooms: 3,
    bathrooms: 2,
    lat: -17.38,
    lng: -66.16,
  },
  {
    id: "2",
    title: "Departamento céntrico",
    price: 65000,
    type: "departamento",
    operation: "alquiler",
    rooms: 2,
    bathrooms: 1,
    lat: -17.39,
    lng: -66.15,
  },
  {
    id: "3",
    title: "Terreno amplio",
    price: 50000,
    type: "terreno",
    operation: "venta",
    rooms: 0,
    bathrooms: 0,
    lat: -17.37,
    lng: -66.17,
  },
  {
    id: "4",
    title: "Local comercial",
    price: 120000,
    type: "local",
    operation: "anticretico",
    rooms: 1,
    bathrooms: 1,
    lat: -17.4,
    lng: -66.14,
  },
  ...Array.from({ length: 21 }, (_, i) => {
    const types = ["casa", "departamento", "terreno", "local"] as const;
    const operations = ["venta", "alquiler", "anticretico"] as const;

    const type = types[i % types.length];
    const operation = operations[i % operations.length];

    return {
      id: (i + 5).toString(),
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} ${i + 5}`,
      price: 40000 + i * 5000,
      type,
      operation,
      rooms: type === "terreno" ? 0 : (i % 4) + 1,
      bathrooms: type === "terreno" ? 0 : (i % 3) + 1,
      lat: -17.39 + (Math.random() - 0.5) * 0.05,
      lng: -66.15 + (Math.random() - 0.5) * 0.05,
    };
  }),
];
