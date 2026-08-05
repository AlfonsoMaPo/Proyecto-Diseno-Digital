import express from 'express'
import dotenv from 'dotenv/config'
import FacturasRoutes from './routes/facturasRouter.js'
import productRoutes from './routes/product.routes.js'

const app = express()

app.use(express.json())

app.use('/api/v1/Facturas', FacturasRoutes)
app.use('/api/v1/products', productRoutes)

app.get('/', (req, res) => {
    res.send({ message: 'Funca' })
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`)
})
