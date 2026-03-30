import express from 'express'

const app = express()

app.use(express.json())

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
