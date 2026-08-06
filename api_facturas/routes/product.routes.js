import { Router } from 'express'
import { getAllProducts, createProduct, addStock } from '../controllers/product.controller.js'
import { isAuth } from '../middlewares/isAuth.js'
import { isAdmin } from '../middlewares/isAdmin.js'

const productRoutes = Router()

productRoutes.get('/', getAllProducts)
productRoutes.post('/', isAuth, isAdmin, createProduct)
productRoutes.patch('/:id/stock', isAuth, isAdmin, addStock)

export default productRoutes
