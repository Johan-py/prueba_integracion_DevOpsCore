import express from 'express'
import cors from 'cors'
import { registerController } from './modules/auth/auth.controller.js'

const app = express()

app.use(express.json())
app.use(cors())
// ✅ ENDPOINT
app.post('/api/users', (req, res) => {
  const user = req.body

  res.json({
    message: 'User created',
    user
  })
})

app.post('/api/auth/register', registerController)

const PORT = 5000

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
