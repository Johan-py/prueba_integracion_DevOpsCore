import express from 'express'
import cors from 'cors'
import { registerController, loginController } from '../../src/modules/auth/auth.controller.js'

const app = express()

app.use(express.json())
app.use(cors())

app.post('/api/auth/register', registerController)
app.post('/api/auth/login', loginController)

const PORT = 5000

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
