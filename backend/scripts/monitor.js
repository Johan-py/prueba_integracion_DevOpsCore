// Ruta: scripts/monitor.ts
// Ejecución: bun run scripts/monitor.ts
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";
// SLAs definidos en las Historias de Usuario
const MAX_LATENCY_MS = 2000; // HU4: Actualizar pines en tiempo máximo de 2 segundos
async function checkServiceStatus(name, url) {
  try {
    const start = performance.now();
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
    const end = performance.now();
    const latency = Math.round(end - start);
    if (response.ok) {
      console.log(`✅ [${name}] ONLINE - Latencia: ${latency}ms`);
    } else {
      console.error(`❌ [${name}] ERROR - Status: ${response.status}`);
    }
  } catch (error) {
    console.error(`🚨 [${name}] DOWN - No se pudo conectar a ${url}`);
  }
}
async function checkFilterLatency() {
  console.log("\n🔍 Monitoreando SLA de Filtros (HU4 - Máx 2 segundos)...");
  // Endpoint simulado para la búsqueda de propiedades con filtros
  const searchEndpoint = `${BACKEND_URL}/api/properties?type=Casa&minPrice=80000&maxPrice=100000`;
  try {
    const start = performance.now();
    const response = await fetch(searchEndpoint);
    const end = performance.now();
    const latency = Math.round(end - start);
    if (latency <= MAX_LATENCY_MS) {
      console.log(
        `✅ [API Filtros] CUMPLE SLA - Tiempo: ${latency}ms (Límite: ${MAX_LATENCY_MS}ms)`,
      );
    } else {
      console.warn(
        `⚠️ [API Filtros] INCUMPLE SLA - Tiempo: ${latency}ms (Límite: ${MAX_LATENCY_MS}ms). ¡Requiere optimización/paginación!`,
      );
    }
  } catch (error) {
    console.error(`❌ [API Filtros] Falló la petición de búsqueda:`, error);
  }
}
async function simulateDebounceStress() {
  console.log(
    "\n🌪️ Simulando estrés de inputs rápidos (HU4 - Debounce 300ms)...",
  );
  // Simula un usuario escribiendo rápido o moviendo el slider continuamente
  let requests = [];
  for (let i = 0; i < 10; i++) {
    requests.push(
      fetch(`${BACKEND_URL}/api/properties?search=Cochabamba&step=${i}`),
    );
  }
  const start = performance.now();
  await Promise.allSettled(requests);
  const end = performance.now();
  console.log(
    `✅ [Estrés Debounce] 10 peticiones concurrentes procesadas en ${Math.round(end - start)}ms.`,
  );
  console.log(
    `💡 Nota DevOps: El Frontend debe asegurar que estas 10 peticiones NO salgan simultáneamente gracias al debounce de 300ms.`,
  );
}
async function runMonitor() {
  console.log("=========================================");
  console.log("🛰️ Iniciando Monitoreo de PropBol (Bun) 🛰️");
  console.log("=========================================\n");
  await checkServiceStatus("Frontend", FRONTEND_URL);
  await checkServiceStatus(
    "Backend API",
    `${BACKEND_URL}/api/calculator?a=1&b=1&op=add`,
  );
  await checkFilterLatency();
  await simulateDebounceStress();
  console.log("\n=========================================");
  console.log("🏁 Monitoreo Finalizado");
  console.log("=========================================");
}
runMonitor();
export {};
