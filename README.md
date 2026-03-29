# 🏠 PropBol

## 📌 Descripción General

**PropBol** es una plataforma web enfocada en la **compra, venta y gestión de inmuebles** en Bolivia.

Permite a usuarios:

- Publicar propiedades (casas, departamentos, terrenos)
- Explorar listados disponibles
- Gestionar información de usuarios
- Autenticarse y operar de forma segura

El sistema está diseñado bajo una arquitectura moderna, escalable y desacoplada.

---

## 🧱 Arquitectura

El proyecto sigue un enfoque **monorepo** con separación clara por capas:

- **Frontend** → Next.js (App Router + TypeScript)
- **Backend** → API REST (Node.js + TypeScript)
- **Infraestructura** → Docker + CI/CD (GitHub Actions)

---

## 📂 Estructura del Proyecto

```bash
.
├── backend/      # API (lógica de negocio, autenticación, usuarios, propiedades)
├── frontend/     # Aplicación web (UI + interacción con el usuario)
├── infra/        # herramientas de testing y entornos de prueba
├── scripts/      # utilidades (stress testing, simulación, etc.)
└── .github/      # pipelines CI/CD
```

---

## ⚙️ Requisitos

Asegúrate de tener instalado:

- Bun >= 1.x
- Node.js >= 18
- Docker (opcional)

---

## 🚀 Ejecución Local

### 1. Clonar el repositorio

```bash
git clone <repo-url>
cd <repo>
```

---

### 2. Instalar dependencias

```bash
bun install
```

---

### 3. Configurar variables de entorno

Crear archivo:

```bash
backend/.env
```

Ejemplo:

```env
PORT=5000
JWT_SECRET=your_secret_key
```

---

### 4. Ejecutar Backend

```bash
cd backend
bun run dev
```

Disponible en:

```bash
http://localhost:5000
```

---

### 5. Ejecutar Frontend

En otra terminal:

```bash
cd frontend
bun run dev
```

### 6. Ejecucion general (back y front)

En la raiz del proyecto:

```bash
bun run dev
```

Disponible en:

```bash
## frontend
http://localhost:3000
## backend
http://localhost:5000

```

---

## 🌿 Flujo de Trabajo

- `main` → producción
- `develop` → integración

### Convención de commits

```bash
feat: nueva funcionalidad
fix: corrección de errores
chore: tareas internas
```

---

## 📦 Buenas Prácticas

- No subir archivos `.env`
- No modificar configuraciones críticas sin aprobación
- Mantener commits pequeños:
  - máximo permitido: 250 líneas

- Seguir arquitectura por capas en backend
- Separar lógica y UI en frontend

---

## 🔐 Seguridad

- No hardcodear credenciales
- Uso obligatorio de variables de entorno
- Revisar scripts antes de ejecutarlos (`/scripts`)

---

## 🚧 Estado del Proyecto

En desarrollo activo.

---

## 🎯 Objetivo del Proyecto

Construir una plataforma robusta y escalable que facilite el mercado inmobiliario en Bolivia, permitiendo:

- Mayor visibilidad de propiedades
- Gestión eficiente de usuarios
- Experiencia moderna y rápida

---

## 👥 Contribución

Para contribuir:

1. Crear una rama desde `develop` feature/nombre_HU o feature
2. Implementar cambios siguiendo los estándares
3. Abrir un Pull Request a su lead de equipo

---

## 📄 Licencia

Pendiente de definición.
