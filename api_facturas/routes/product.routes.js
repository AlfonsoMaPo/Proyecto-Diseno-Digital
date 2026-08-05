import { Router } from 'express'
import { getAllProducts, createProduct, addStock } from '../controllers/product.controller.js'
import { isAuth } from '../middlewares/isAuth.js'
import { isAdmin } from '../middlewares/isAdmin.js'

const productRoutes = Router()

// GET /api/v1/products — listado de productos activos
productRoutes.get('/', getAllProducts)

// POST /api/v1/products — crear producto
productRoutes.post('/', isAuth, isAdmin, createProduct)

// PATCH /api/v1/products/:id/stock — aumentar stock
productRoutes.patch('/:id/stock', isAuth, isAdmin, addStock)

export default productRoutes
