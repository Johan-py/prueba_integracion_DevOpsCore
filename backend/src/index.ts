import express from 'express'
import publicacionRoutes from './modules/publicacion/publicacion.routes.js'

const app = express()

app.use(express.json())
app.use('/api/publicaciones', publicacionRoutes)

// ✅ HEALTH CHECK
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Server running'
  })
})

// ✅ ENDPOINT
app.post('/api/users', (req, res) => {
  const user = req.body

  res.json({
    message: 'User created',
    user
  })
})

const PORT = 5000

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
