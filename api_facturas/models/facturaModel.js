import { pool } from '../db/db.js'

export default class FacturaModel {

    static createFactura = async ({ user_id, customer_name, customer_rtn_id, items }) => {
        const conn = await pool.getConnection()

        try {

            await conn.beginTransaction()

            // Validar stock
            for (const item of items) {
                const [rows] = await conn.execute(
                    `SELECT id, name, price, stock FROM products WHERE id = ? AND is_active = TRUE FOR UPDATE`,
                    [item.product_id]
                )

                if (rows.length === 0) {
                    await conn.rollback()

                    return {
                        error: true,
                        status: 400,
                        message: `El producto con ID ${item.product_id} no existe o está inactivo`
                    }
                }

                const product = rows[0]

                if (product.stock < item.quantity) {
                    await conn.rollback()
                    return {
                        error: true,
                        status: 400,
                        message: `Stock insuficiente para "${product.name}". Disponible: ${product.stock}, solicitado: ${item.quantity}`
                    }
                }

                item.unit_price = product.price
                item.name = product.name
            }

            // Calcular totales 
            const subtotal = items.reduce((acc, item) => acc + (item.unit_price * item.quantity), 0)
            const tax = parseFloat((subtotal * 0.15).toFixed(2))
            const total = parseFloat((subtotal + tax).toFixed(2))

            // Generar número de factura
            const timestamp = Date.now()
            const random = Math.floor(1000 + Math.random() * 9000)
            const invoice_number = `FAC-${timestamp}-${random}`

            // Encabezado de la factura
            const [invoiceResult] = await conn.execute(
                `INSERT INTO invoices (invoice_number, user_id, customer_name, customer_rtn_id, subtotal, tax, total)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [invoice_number, user_id, customer_name, customer_rtn_id ?? 'CONSUMIDOR FINAL', subtotal.toFixed(2), tax, total]
            )

            const invoice_id = invoiceResult.insertId

            // Bajar el stock
            for (const item of items) {

                await conn.execute(
                    `INSERT INTO invoice_details (invoice_id, product_id, quantity, unit_price, subtotal)
                     VALUES (?, ?, ?, ?, ?)`,
                    [invoice_id, item.product_id, item.quantity, item.unit_price, (item.unit_price * item.quantity).toFixed(2)]
                )

                await conn.execute(
                    `UPDATE products SET stock = stock - ? WHERE id = ?`,
                    [item.quantity, item.product_id]
                )
            }

            await conn.commit()

            return await FacturaModel.getFacturaById(invoice_id)

        } catch (e) {
            await conn.rollback()
            throw e
        } 
    }

    // Listado de facturas 
    static getAllFacturas = async (user_id = null, role = null) => {
        try {

            await using conn = await pool.getConnection()

            //si es Cashier solo mostrara las suyas
            let query = `SELECT
                    i.id,
                    i.invoice_number,
                    i.customer_name,
                    i.customer_rtn_id,
                    i.subtotal,
                    i.tax,
                    i.total,
                    i.status,
                    i.created_at,
                    u.name AS cashier_name,
                    u.email AS cashier_email
                FROM invoices i
                INNER JOIN users u ON i.user_id = u.id
                WHERE i.status != 'VOIDED'
            `

            const params = []

            if (role === 'CASHIER') {
                query += ` WHERE i.user_id = ?`
                params.push(user_id)
            }

            query += ` ORDER BY i.created_at DESC`

            const [rows] = await conn.execute(query, params)
            return rows
        } catch (e) {
            throw e
        }
    }

    static getFacturaById = async (id) => {
        try {

            await using conn = await pool.getConnection()
            //  encabezado
            const [invoiceRows] = await conn.execute(
                `SELECT
                    i.id,
                    i.invoice_number,
                    i.customer_name,
                    i.customer_rtn_id,
                    i.subtotal,
                    i.tax,
                    i.total,
                    i.status,
                    i.created_at,
                    u.name AS cashier_name,
                    u.email AS cashier_email
                FROM invoices i
                INNER JOIN users u ON i.user_id = u.id
                WHERE i.id = ?`,[id]
            )

            if (invoiceRows.length === 0) return null
            //  detalle
            const [detailRows] = await conn.execute(
                `SELECT
                    d.id,
                    d.quantity,
                    d.unit_price,
                    d.subtotal,
                    p.id AS product_id,
                    p.code AS product_code,
                    p.name AS product_name
                FROM invoice_details d
                INNER JOIN products p ON d.product_id = p.id
                WHERE d.invoice_id = ?`,
                [id]
            )

            return {
                ...invoiceRows[0],
                items: detailRows
            }
        } catch (e) {
            throw e
        }
    }

    // anular factura
    static voidFactura = async (id) => {

        const conn = await pool.getConnection()

        try {
            await conn.beginTransaction()
            // buscar q exista
            const [invoiceRows] = await conn.execute(
                `SELECT id, status FROM invoices WHERE id = ? FOR UPDATE`,
                [id]
            )

            if (invoiceRows.length === 0) {
                await conn.rollback()
                return { error: true, status: 404, message: 'Factura no encontrada' }
            }

            if (invoiceRows[0].status === 'VOIDED') {
                await conn.rollback()
                return { error: true, status: 400, message: 'La factura ya fue anulada anteriormente' }
            }

            // detalle para restituir stock
            const [detailRows] = await conn.execute(
                `SELECT product_id, quantity FROM invoice_details WHERE invoice_id = ?`,
                [id]
            )

            // restitucion de stock
            for (const detail of detailRows) {
                await conn.execute(
                    `UPDATE products SET stock = stock + ? WHERE id = ?`,
                    [detail.quantity, detail.product_id]
                )
            }

            // cambiar a VOIDED
            await conn.execute(
                `UPDATE invoices SET status = 'VOIDED' WHERE id = ?`,
                [id]
            )

            await conn.commit()

            return await FacturaModel.getFacturaById(id)

        } catch (e) {

            await conn.rollback()
            throw e
        } 
    }
}
