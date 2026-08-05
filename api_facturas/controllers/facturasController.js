
import { jsonResponse } from '../helpers/jsonResponse.js'
import { validateFactura } from '../schemas/factura.schema.js'
import FacturaModel from '../models/facturaModel.js'


export const createFactura = async (req, res) => {

    const payload = req.body

    const { success, data, error } = validateFactura(payload)

    if (!success) {
        return res.status(400).json(jsonResponse({
            status: 400,
            message: error,
            data: null
        }))
    }

    try {

        // el usuario que emite la factura es el que está autenticado
        const result = await FacturaModel.createFactura({
            user_id: req.user.id,
            customer_name: data.customer_name,
            customer_rtn_id: data.customer_rtn_id,
            items: data.items
        })

        // si el modelo retorna un error 
        if (result?.error) {
            return res.status(result.status).json(jsonResponse({
                status: result.status,
                message: result.message,
                data: null
            }))
        }

        return res.status(201).json(jsonResponse({
            status: 201,
            message: 'Factura emitida exitosamente',
            data: result
        }))
    } catch (e) {
        return res.status(500).json(jsonResponse({ status: 500, message: e.message, data: null }))
    }
}


export const getAllFacturas = async (req, res) => {

    try {

        const facturas = await FacturaModel.getAllFacturas(req.user.id, req.user.role)
        res.json(jsonResponse({ message: 'Listado de facturas', data: facturas }))

    } catch (e) {
        res.status(500).json(jsonResponse({ status: 500, message: e.message, data: null }))
    }
}


export const getFacturaById = async (req, res) => {

    const { id } = req.params

    try {

        const factura = await FacturaModel.getFacturaById(id)

        if (!factura) {
            return res.status(404).json(jsonResponse({
                status: 404,
                message: 'Factura no encontrada',
                data: null
            }))
        }

        return res.json(jsonResponse({ message: 'Detalle de factura', data: factura }))
    } catch (e) {
        return res.status(500).json(jsonResponse({ status: 500, message: e.message, data: null }))
    }
}

// anular factura
export const voidFactura = async (req, res) => {
    
    const { id } = req.params

    try {

        const result = await FacturaModel.voidFactura(Number(id))

        // si el modelo retorna un error
        if (result?.error) {
            return res.status(result.status).json(jsonResponse({
                status: result.status,
                message: result.message,
                data: null
            }))
        }

        return res.json(jsonResponse({
            message: 'Factura anulada exitosamente. El inventario ha sido restituido.',
            data: result
        }))
    } catch (e) {
        return res.status(500).json(jsonResponse({ status: 500, message: e.message, data: null }))
    }
}
