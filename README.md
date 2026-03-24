# 📦 Next.js TSX DevOps Stress Lab

Proyecto base para **simulaciones de estrés DevOps**. Incluye:

- Frontend y Backend en **Next.js + TSX** (App Router)
- API REST simple (`/api/calculator`)
- Tests con **Bun**
- Docker para contenedores
- Scripts de desarrollo y CI/CD listos para pipelines

Este proyecto permite simular: fallos en pipelines, tests rotos, conflictos de merge y despliegues fallidos.

---

## 🗂 Estructura del repositorio

```
nextjs-stress-lab/
├── app/
│   ├── api/calculator/route.ts   # API REST
│   ├── page.tsx                  # Página principal
│   └── layout.tsx                # Layout obligatorio
├── tests/
│   └── calculator.test.ts        # Tests de funciones
├── Dockerfile
├── package.json
├── bun.lockb
├── tsconfig.json
└── .github/workflows/ci.yml      # Pipeline CI/CD
```

---

## ⚡ Requisitos

- **Bun** (v1.3+) → [https://bun.sh](https://bun.sh)
- Git
- Docker (opcional para pruebas de despliegue)

> No necesitas Node.js, Bun reemplaza todo.

---

## 🚀 Comandos principales

| Acción                | Comando Bun         |
| --------------------- | ------------------- |
| Levantar dev server   | `bun run dev`       |
| Build de producción   | `bun run build`     |
| Start de producción   | `bun run start`     |
| Correr tests          | `bun test`          |
| Instalar dependencias | `bun install`       |
| Agregar dependencia   | `bun add <package>` |

---

## 🧪 API Example

**Sumar 2 números**:

```
GET /api/calculator?a=10&b=2&op=add
```

**Respuesta:**

```json
{ "result": 12 }
```

**División:**

```
GET /api/calculator?a=10&b=2&op=divide
```

> Maneja errores: divide por 0 o números inválidos → status 400

---

## 🛠 Estructura de pruebas para DevOps

- **DevOps 1**: Infraestructura y Docker, simular despliegues y caídas de servicios
- **DevOps 2**: Pipelines y tests, inyectar tests rotos o builds fallidos
- **DevOps 3**: Repositorio y monitoreo, crear PR con conflictos y revisar alertas

---

## 🐳 Docker

Levantar contenedor de desarrollo:

```bash
docker build -t nextjs-stress-lab .
docker run -p 3000:3000 nextjs-stress-lab
```

- Acceder a `http://localhost:3000/`
- API: `http://localhost:3000/api/calculator`

---

## ✅ Notas finales

- Usa `bun test` para todos los tests; no es necesario configurar Jest manualmente
- Toda la lógica de API está en `app/api/calculator/route.ts`
- Layout obligatorio en `app/layout.tsx` para evitar errores de Next.js con App Router

> Este repositorio sirve como **base para construir escenarios de estrés realistas para el equipo de DevOps**.
