import { fileURLToPath } from "url";
import fs from "fs";
import path from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ENV_PATH = path.resolve(__dirname, "../.env");
async function simulateDBDown() {
  console.log("💣 [Chaos] Simulando DB abajo...");
  const originalEnv = fs.readFileSync(ENV_PATH, "utf-8");
  const corruptedEnv = originalEnv.replace(
    /DATABASE_URL=".+"/,
    'DATABASE_URL="postgresql://invalid:invalid@localhost:5432/wrong"',
  );
  fs.writeFileSync(ENV_PATH, corruptedEnv);
  console.log("⚠️  DATABASE_URL corrompido temporalmente.");
  setTimeout(() => {
    fs.writeFileSync(ENV_PATH, originalEnv);
    console.log("✅  Restaurando DATABASE_URL original.");
    process.exit(0);
  }, 10000); // 10 segundos de caos
}
async function simulateLatency(ms) {
  console.log(
    `🐢 [Chaos] Inyectando latencia de ${ms}ms en el servidor local...`,
  );
  // Nota: Esto requiere que el index.ts tenga un middleware de delay opcional.
  // Como DevOps, sugeriremos añadir un middleware condicional.
  console.log(
    "💡 Para ver esto en acción, el Backend debe procesar env.CHAOS_LATENCY.",
  );
}
async function breakAuth() {
  console.log("🔑 [Chaos] Corrompiendo JWT_SECRET...");
  const originalEnv = fs.readFileSync(ENV_PATH, "utf-8");
  const brokenEnv = originalEnv.replace(
    /JWT_SECRET=".+"/,
    'JWT_SECRET="BADDATA_HACKED_SECRET"',
  );
  fs.writeFileSync(ENV_PATH, brokenEnv);
  setTimeout(() => {
    fs.writeFileSync(ENV_PATH, originalEnv);
    console.log("✅  JWT_SECRET restaurado.");
    process.exit(0);
  }, 15000);
}
const arg = process.argv[2];
if (arg === "--kill-db") {
  simulateDBDown();
} else if (arg === "--break-auth") {
  breakAuth();
} else if (arg === "--latency") {
  const ms = parseInt(process.argv[3]) || 5000;
  simulateLatency(ms);
} else {
  console.log(`
🌪️  PropBol Chaos Monkey Help:
--kill-db     : Corrompe DATABASE_URL por 10s.
--break-auth  : Corrompe JWT_SECRET por 15s.
--latency <ms>: Sugiere latencia (Requiere middleware).
  `);
}
