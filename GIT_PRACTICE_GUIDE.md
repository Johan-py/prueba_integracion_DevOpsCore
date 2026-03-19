# 📚 Git Practice Guide - SOCIAL_IS

## 🎯 Objetivo del Laboratorio
Este laboratorio está diseñado para que múltiples grupos de estudiantes practiquen **Git Workflow** subiendo publicaciones a una red social simulada.

## 📋 Pasos para Practicar Git

### 1. Clonar el Repositorio
<<<<<<< HEAD

=======
>>>>>>> 5d6356d1d2404c57b50040af4933f60d0c0891f3
```bash
git clone [URL_DEL_REPOSITORIO]
cd prueba_estres_devops
```

### 2. Configurar Tu Entorno
```bash
# Instalar dependencias
bun install

# Iniciar servicios
bun run dev:all
```

### 3. Crear Tu Publicación
Edita el archivo: `backend/src/modules/posts/data/posts.json`

**Importante:** Usa un ID único para tu grupo:
- Grupo 1: IDs 2001-2999
- Grupo 2: IDs 3001-3999  
- Grupo 3: IDs 4001-4999
- etc...

### 4. Formato de Publicación
```json
{
  "id": 2001,
  "username": "nombre_grupo",
  "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=tu_grupo",
  "content": "Tu mensaje aquí...",
  "image": "URL de imagen (opcional)",
  "time": "Hace X minutos",
  "tags": ["#tag1", "#tag2"]
}
```

### 5. Flujo de Git
```bash
# 1. Ver estado
git status

# 2. Agregar cambios
git add backend/src/modules/posts/data/posts.json

# 3. Hacer commit
git commit -m "feat: add post by Grupo [TuNombre]"

# 4. Subir al repositorio
git push origin [tu-branch]
```

## 🚀 Comandos Útiles

### Iniciar Servicios:
- `bun run dev:all` - Todos los servicios
- `bun run dev:back` - Solo backend
- `bun run dev:front` - Solo frontend

### Ver Resultados:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Posts API: http://localhost:5000/api/posts

## ⚠️ Reglas Importantes

1. **IDs Únicos:** Cada grupo debe usar su rango de IDs
2. **No modificar posts existentes:** Solo agregar nuevos posts
3. **Commits descriptivos:** Usa prefijos como `feat:`, `fix:`, etc.
4. **Pull Requests:** Si trabajas en branches, crea PRs

## 🔍 Troubleshooting

### Si no ves tu post:
- Revisa que el JSON esté bien formateado
- Verifica que el ID sea único
- Reinicia el backend: `bun run dev:back`

### Conflictos de Git:
```bash
git pull origin main
# Resuelve conflictos manualmente
git add .
git commit -m "resolve merge conflicts"
git push
```

## 📖 Recursos Adicionales

- [Git Documentation](https://git-scm.com/doc)
- [Next.js Docs](https://nextjs.org/docs)
- [Bun Docs](https://bun.sh/docs)

---
**¡Diviértete practicando Git!** 🚀💻
