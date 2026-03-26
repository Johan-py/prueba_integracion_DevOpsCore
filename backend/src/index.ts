import express from 'express'
import {
  getPublicationMultimediaController,
  registerVideoLinkController
} from './modules/multimedia/multimedia.controller.js'

const app = express()

app.use(express.json())

app.post('/api/users', (req, res) => {
  const user = req.body

  res.json({
    message: 'User created',
    user
  })
})

app.get('/api/publicaciones/:id_publicacion/multimedia', async (req, res) => {
  try {
    const id_publicacion = Number(req.params.id_publicacion)
    const usuario_id = Number(req.query.usuario_id)

    const result = await getPublicationMultimediaController({
      id_publicacion,
      usuario_id
    })

    res.json({
      message: 'Multimedia obtenida correctamente',
      data: result
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Error interno del servidor'

    res.status(400).json({ message })
  }
})

app.post('/api/publicaciones/:id_publicacion/multimedia/video-link', async (req, res) => {
  try {
    const id_publicacion = Number(req.params.id_publicacion)
    const { usuario_id, videoUrl } = req.body

    const result = await registerVideoLinkController({
      id_publicacion,
      usuario_id: Number(usuario_id),
      videoUrl
    })

    res.json({
      message: 'Video registrado correctamente',
      data: result
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Error interno del servidor'

    res.status(400).json({ message })
  }
})

const PORT = 5000

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})