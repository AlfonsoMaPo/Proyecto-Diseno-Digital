import * as z from 'zod'

// schema completo para crear un producto
const productSchema = z.object({
    code: z.string().min(1, 'El código es requerido').max(50),
    name: z.string().min(2, 'El nombre debe tener mínimo 2 caracteres').max(100),
    price: z.number().positive('El precio debe ser un número positivo'),
    stock: z.number().int().min(0, 'El stock no puede ser negativo')
}).strict()

// schema parcial para actualizar stock (solo stock_to_add)
const stockSchema = z.object({
    stock_to_add: z.number().int().positive('La cantidad a agregar debe ser un número positivo entero')
})

export const validateProduct = (payload) => {
    return productSchema.safeParse(payload)
}

export const validateStockUpdate = (payload) => {
    return stockSchema.safeParse(payload)
}
