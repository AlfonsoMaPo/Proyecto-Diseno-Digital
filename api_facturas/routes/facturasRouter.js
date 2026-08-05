
import { Router } from 'express'
import { createFactura, getAllFacturas, getFacturaById, voidFactura } from '../controllers/facturasController.js'

const FacturaRoutes = Router()

// crear factura 
FacturaRoutes.post('/', createFactura)

// listado de facturas 
FacturaRoutes.get('/', getAllFacturas)

// detalle de una factura 
FacturaRoutes.get('/:id', getFacturaById)

// Anular factura 
FacturaRoutes.patch('/:id/void', voidFactura)

export default FacturaRoutes