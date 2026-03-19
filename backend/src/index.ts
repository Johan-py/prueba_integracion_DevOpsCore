import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import healthRoutes from './modules/health/health.routes'
import postsRoutes from './modules/posts/posts.routes'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

// Main Routes
app.use('/', healthRoutes)
app.use('/api', postsRoutes)

app.listen(PORT, () => {
  console.log(`Expert Social API running on http://localhost:${PORT} (Screaming Architecture)`)
})
