export const usePopularidad = () => {
  const registrarConsulta = async (locationId: string | number) => {
    // ESTO APARECERÁ EN TU CONSOLA F12
    console.log("🚀 [FRONTEND] Intentando enviar incremento para ID:", locationId);

    try {
      const res = await fetch(`http://localhost:5000/api/locations/popularidad`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: locationId }),
      });

      // ESTO NOS DIRÁ SI EL SERVIDOR ENCONTRÓ LA RUTA
      console.log("📡 [BACKEND] Respuesta del servidor:", res.status, res.statusText);

      if (!res.ok) {
        console.warn("⚠️ El servidor respondió con un error (posible 404 o 500)");
      }
    } catch (error) {
      console.error("❌ [ERROR] Fallo total en la conexión:", error);
    }
  };

  return { registrarConsulta };
};