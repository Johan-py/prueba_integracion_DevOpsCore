import express from 'express'
import multimediaRoutes from './modules/multimedia/multimedia.routes.js'

const app = express()

app.use(express.json())

app.post('/api/users', (req, res) => {
  const user = req.body

  res.json({
    message: 'User created',
    user
  })
})

app.use('/api/publicaciones', multimediaRoutes)

const PORT = Number(process.env.PORT) || 5000

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})