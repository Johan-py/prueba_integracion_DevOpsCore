# 🚀 SOCIAL_IS - Premium Social Network & DevOps Engineering Lab

Un laboratorio de ingeniería de software que combina una **red social de clase mundial** con un **entorno de prácticas DevOps realistas**. Este proyecto no es solo otra app más - es un ecosistema completo diseñado para que los equipos de desarrollo y operaciones puedan simular, practicar y dominar escenarios complejos del mundo real.

## 🏗️ Arquitectura del Sistema

Este proyecto implementa **Screaming Architecture** - donde la estructura del código grita su propósito:

```
SOCIAL_IS/
├── frontend/           # UI Premium con Next.js 14 App Router
│   ├── src/
│   │   ├── app/        # Páginas y layouts
│   │   ├── components/ # Componentes reutilizables
│   │   └── features/   # Lógica de negocio (feed, stories, etc.)
├── backend/            # API REST con Express + Prisma
│   ├── src/modules/    # Módulos auto-explicativos
│   └── prisma/         # Base de datos type-safe
├── infra/              # Laboratorio de pruebas de estrés
│   ├── stress-lab/     # Scripts de caos y simulación
│   └── docker/         # Contenedores y orquestación
└── scripts/            # Command Center para automatización
```

### Tecnologías Core

| Componente       | Tecnología            | Razón de elección                      |
| ---------------- | --------------------- | -------------------------------------- |
| **Runtime**      | Bun v1.3+             | Performance extrema, monorepos nativos |
| **Frontend**     | Next.js 16 + React 19 | App Router, Server Components          |
| **Backend**      | Express + Prisma      | API REST robusta, type-safe            |
| **Estilos**      | TailwindCSS v4        | Utility-first, diseño premium          |
| **Testing**      | Bun Test              | Integración nativa, velocidad          |
| **Contenedores** | Docker                | Despliegue consistente                 |

---

## 🚀 Quick Start

### Prerrequisitos

```bash
# Instalar Bun (si no lo tienes)
curl -fsSL https://bun.sh/install | bash

# Clonar y configurar
git clone https://github.com/Johan-py/prueba_integracion_DevOpsCore.git
cd prueba_integracion_DevOpsCore
bun install
```

### Levantar todo el ecosistema

```bash
# Iniciar frontend + backend + servicios
bun run dev:all

# O individualmente
cd frontend
bun run dev    # :3000

cd backend
bun run dev     # :5000
```

### Comandos esenciales

| Comando             | Propósito                                 |
| ------------------- | ----------------------------------------- |
| `bun run dev:all`   | Inicia todo el stack (frontend + backend) |
| `bun test`          | Ejecuta suite de tests completo           |
| `bun run build`     | Build de producción optimizado            |
| `docker-compose up` | Levanta infraestructura completa          |

---

## 🌐 API RESTful

El backend expone endpoints RESTful con manejo robusto de errores:

### Posts API

```bash
# Obtener todos los posts
GET http://localhost:5000/api/posts

# Crear nuevo post
POST http://localhost:5000/api/posts
Content-Type: application/json
{
  "content": "Mi primer post en SOCIAL_IS",
  "authorId": 1
}
```

---

## 🧪 Laboratorio DevOps

Este es el corazón del proyecto - donde los equipos practican escenarios reales:

### DevOps 1: Infraestructura y Contenedores

- **Simulación de caídas**: Docker containers que fallan intencionalmente
- **Recovery procedures**: Scripts para restaurar servicios automáticamente
- **Load testing**: Pruebas de estrés con k6 y Artillery

### DevOps 2: Pipelines y Calidad

- **Tests rotos intencionales**: Escenarios para debugging de CI/CD
- **Builds fallidos**: Simulación de problemas de compilación
- **Conflictos de merge**: Prácticas de resolución realistas

### DevOps 3: Monitoreo y Respuesta

- **Alertas falsas**: Distinguir entre problemas reales y falsos positivos
- **Métricas en tiempo real**: Dashboards con Prometheus + Grafana
- **Incident response**: Procedimientos de escalado

### Scripts de Caos

```bash
# Inyectar latencia en el backend
./scripts/chaos-injector.sh --service=backend --failure=latency

# Simular caída de base de datos
./scripts/chaos-injector.sh --service=database --failure=crash

# Recuperación automática
./scripts/recovery.sh --service=all
```

---

## 🐳 Docker y Despliegue

### Desarrollo local

```bash
# Build y run completo
docker-compose up --build

# Acceso a servicios
# Frontend: http://localhost:3000
# Backend:  http://localhost:5000
# Database: localhost:5432
```

### Producción

```bash
# Build optimizado
docker build -t social-is:latest .

# Deploy con health checks
docker run -d \
  --name social-is-prod \
  --health-cmd="curl -f http://localhost:3000/api/health" \
  -p 3000:3000 \
  social-is:latest
```

---

## 🎨 Frontend

La interfaz sigue los estándares de las redes sociales modernas:

### Características

- **Design System**: Componentes consistentes y reutilizables
- **Responsive First**: Mobile-first con breakpoints inteligentes
- **Micro-interactions**: Animaciones sutiles y feedback inmediato
- **Performance**: Lazy loading, code splitting, optimización automática

### Estructura de Componentes

```
src/
├── components/
│   ├── layout/          # Navbar, Footer, Sidebar
│   └── ui/             # Botones, inputs, modales
├── features/
│   ├── feed/           # Timeline de posts
│   ├── stories/        # Historias tipo Instagram
│   └── profile/        # Perfiles de usuario
└── app/               # Páginas y layouts Next.js
```

---

## 🔧 Backend - Arquitectura Escalable

### Módulos Desacoplados

Cada módulo es una unidad independiente con su propia lógica:

```
src/modules/
├── posts/
│   ├── routes/         # Endpoints REST
│   ├── services/       # Lógica de negocio
│   └── validators/     # Validación de datos
├── users/
│   ├── auth/           # JWT y sesiones
│   ├── profiles/       # Gestión de perfiles
│   └── permissions/    # RBAC
└── notifications/
    └── real-time/      # WebSockets
```

### Base de Datos con Prisma

```typescript
// Schema type-safe
model Post {
  id        Int      @id @default(autoincrement())
  content   String
  author    User     @relation(fields: [authorId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

---
