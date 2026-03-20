import express, { Application, Request, Response } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'

// Import routes
import healthRoutes from './modules/health/health.routes'

const app: Application = express()
const PORT = process.env.PORT || 5000

// Middlewares
app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))

// Routes
app.use('/api/health', healthRoutes)

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Route not found' })
})

// Error handler
app.use((err: Error, req: Request, res: Response) => {
  console.error(err.stack)
  res.status(500).json({ message: 'Internal server error' })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`)
})
