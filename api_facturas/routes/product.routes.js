import { Router } from 'express'
import { getAllProducts, createProduct, addStock } from '../controllers/product.controller.js'

const productRoutes = Router()

// GET /api/v1/products — listado de productos activos
productRoutes.get('/', getAllProducts)

// POST /api/v1/products — crear producto
productRoutes.post('/', createProduct)

// PATCH /api/v1/products/:id/stock — aumentar stock
productRoutes.patch('/:id/stock', addStock)

export default productRoutes
