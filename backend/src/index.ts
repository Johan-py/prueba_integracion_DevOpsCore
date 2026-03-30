import express from 'express'

const app = express()

app.use(express.json())


const filtersController = new FiltersHomepageController();
app.get('/api/filters', filtersController.getFilters);

const bannersController = new BannersController()

app.post('/api/users', (req, res) => {
  const user = req.body
  res.json({ message: 'User created', user })
})

app.get('/api/banners', (req, res) => bannersController.getBanners(req, res))

app.get('/api/locations/search', async (req, res) => {
  await locationSearchHandler(req as any, res as any)
})

const PORT = 5000

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})