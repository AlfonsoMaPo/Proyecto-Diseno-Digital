import ProductModel from '../models/product.model.js'
import { jsonResponse } from '../helpers/jsonResponse.js'

export const getAllProducts = async (req, res) => {
    try {
        const products = await ProductModel.getAllActive()
        return res.status(200).json(jsonResponse({
            status: 200,
            message: 'Productos obtenidos correctamente',
            data: products
        }))
    } catch (error) {
        return res.status(500).json(jsonResponse({
            status: 500,
            message: 'Error interno al obtener productos',
            data: error.message
        }))
    }
}

export const createProduct = async (req, res) => {
    try {
        const { code, name, price, stock } = req.body

        if (!code || !name || price === undefined || stock === undefined) {
            return res.status(400).json(jsonResponse({
                status: 400,
                message: 'Faltan campos requeridos: code, name, price, stock',
                data: null
            }))
        }

        const priceNumber = Number(price)
        const stockNumber = Number(stock)

        if (!code.trim() || !name.trim() || Number.isNaN(priceNumber) || Number.isNaN(stockNumber) || priceNumber < 0 || stockNumber < 0) {
            return res.status(400).json(jsonResponse({
                status: 400,
                message: 'Datos inválidos: revisa code, name, price y stock',
                data: null
            }))
        }

        const product = await ProductModel.create({
            code: code.trim(),
            name: name.trim(),
            price: priceNumber,
            stock: stockNumber
        })

        return res.status(201).json(jsonResponse({
            status: 201,
            message: 'Producto creado correctamente',
            data: product
        }))
    } catch (error) {
        return res.status(500).json(jsonResponse({
            status: 500,
            message: 'Error interno al crear producto',
            data: error.message
        }))
    }
}

export const addStock = async (req, res) => {
    try {
        const { id } = req.params
        const { stock_to_add } = req.body

        const productId = Number(id)
        const stockToAdd = Number(stock_to_add)

        if (!productId || Number.isNaN(productId) || stockToAdd === undefined || Number.isNaN(stockToAdd) || stockToAdd <= 0) {
            return res.status(400).json(jsonResponse({
                status: 400,
                message: 'Datos inválidos: id y stock_to_add deben ser números válidos',
                data: null
            }))
        }

        const updatedProduct = await ProductModel.addStock(productId, stockToAdd)

        if (!updatedProduct) {
            return res.status(404).json(jsonResponse({
                status: 404,
                message: 'Producto no encontrado o no activo',
                data: null
            }))
        }

        return res.status(200).json(jsonResponse({
            status: 200,
            message: 'Stock actualizado correctamente',
            data: updatedProduct
        }))
    } catch (error) {
        return res.status(500).json(jsonResponse({
            status: 500,
            message: 'Error interno al actualizar stock',
            data: error.message
        }))
    }
}
