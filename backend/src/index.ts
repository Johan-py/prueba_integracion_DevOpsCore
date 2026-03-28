import express from 'express'
import cors from 'cors'
import { getPropertiesMapController } from './modules/properties/properties.controller.js'

const app = express()

app.use(express.json())
app.use(cors())

app.get('/api/properties/map', getPropertiesMapController)

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
