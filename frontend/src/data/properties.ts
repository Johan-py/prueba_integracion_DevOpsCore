export const currentUser = {
  id: 1,
  name: "Cuenta",
  authenticated: true,
};

export const emptyErrors = {
  title: "",
  details: "",
  operationType: "",
  price: "",
  location: "",
};

export const initialProperties = [
  {
    id: 1,
    ownerId: 1,
    title: "Residencia Moderna",
    details: "Hermosa residencia con jardín amplio y piscina.",
    operationType: "Venta",
    price: "150000",
    location: "Cochabamba, Zona Norte",
    image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&q=80",
    beds: 3,
    baths: 4,
    area: "300m",
  },
  {
    id: 2,
    ownerId: 1,
    title: "Residencia Moderna",
    details: "Casa amplia con dos plantas y garaje doble.",
    operationType: "Alquiler",
    price: "180000",
    location: "Cochabamba, Sacaba",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80",
    beds: 4,
    baths: 5,
    area: "320m",
  },
  {
    id: 3,
    ownerId: 2,
    title: "Residencia Moderna",
    details: "Propiedad exclusiva en zona residencial.",
    operationType: "Venta",
    price: "190000",
    location: "Cochabamba, Zona Norte Tiquipaya",
    image: "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=600&q=80",
    beds: 5,
    baths: 6,
    area: "350m",
  },
];