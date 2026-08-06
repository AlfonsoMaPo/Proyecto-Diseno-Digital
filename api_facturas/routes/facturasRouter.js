import { Router } from 'express'
import { createFactura, getAllFacturas, getFacturaById, voidFactura } from '../controllers/facturasController.js'
import { isAuth } from '../middlewares/isAuth.js'
import { isAdmin } from '../middlewares/isAdmin.js'

const FacturaRoutes = Router()

FacturaRoutes.post('/', isAuth, createFactura)
FacturaRoutes.get('/', isAuth, getAllFacturas)
FacturaRoutes.get('/:id', isAuth, getFacturaById)
FacturaRoutes.patch('/:id/void', isAuth, isAdmin, voidFactura)

export default FacturaRoutes