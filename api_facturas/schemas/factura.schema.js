
import * as z from 'zod'


const detalleFacturaSchema = z.object({
    product_id: z.number().int().positive('El ID del producto debe ser un entero positivo'),
    quantity: z.number().int().positive('La cantidad debe ser un entero positivo')
}).strict()


const FacturaSchema = z.object({
    customer_name: z.string().min(2, 'El nombre del cliente es requerido').max(40),
    customer_rtn_id: z.string().max(20).default('CONSUMIDOR FINAL'),
    items: z.array(detalleFacturaSchema).min(1, 'La factura debe tener al menos un producto')
}).strict()

export const validateFactura = (payload) => {
    return FacturaSchema.safeParse(payload)
}
