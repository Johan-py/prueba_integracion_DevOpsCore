// Agrega una variable no usada
// const variableSinUsar = "test"
export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="container mx-auto px-4 py-6 text-center">
        <p>&copy; {new Date().getFullYear()} PropBol. Todos los derechos reservados.</p>
      </div>
    </footer>
  )
}
