
import { Router } from 'express'
import { createFactura, getAllFacturas, getFacturaById, voidFactura } from '../controllers/facturasController.js'
import { isAuth } from '../middlewares/isAuth.js'
import { isAdmin } from '../middlewares/isAdmin.js'


const FacturaRoutes = Router()

// crear factura 
FacturaRoutes.post('/', isAuth, createFactura)

// listado de facturas 
FacturaRoutes.get('/', isAuth, getAllFacturas)

// detalle de una factura 
FacturaRoutes.get('/:id', isAuth, getFacturaById)

// Anular factura 
FacturaRoutes.patch('/:id/void', isAuth, isAdmin, voidFactura)

export default FacturaRoutes