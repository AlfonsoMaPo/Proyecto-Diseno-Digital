import { pool } from '../db/db.js'

export default class FacturaModel {

    static createFactura = async ({ user_id, customer_name, customer_rtn_id, items }) => {
        const conn = await pool.getConnection()

        try {
            await conn.beginTransaction()

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

            const subtotal = items.reduce((acc, item) => acc + (item.unit_price * item.quantity), 0)
            const tax = parseFloat((subtotal * 0.15).toFixed(2))
            const total = parseFloat((subtotal + tax).toFixed(2))

            const timestamp = Date.now()
            const random = Math.floor(1000 + Math.random() * 9000)
            const invoice_number = `FAC-${timestamp}-${random}`

            const [invoiceResult] = await conn.execute(
                `INSERT INTO invoices (invoice_number, user_id, customer_name, customer_rtn_id, subtotal, tax, total)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [invoice_number, user_id, customer_name, customer_rtn_id ?? 'CONSUMIDOR FINAL', subtotal.toFixed(2), tax, total]
            )

            const invoice_id = invoiceResult.insertId

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
        } finally {
            if (conn) conn.release()
        }
    }

    static getAllFacturas = async (user_id = null, role = null) => {
        let conn
        try {
            conn = await pool.getConnection()

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
            `

            const params = []

            if (role === 'CASHIER') {
                query += ` WHERE i.status != 'VOIDED' AND i.user_id = ?`
                params.push(user_id)
            }

            query += ` ORDER BY i.created_at DESC`

            const [rows] = await conn.execute(query, params)
            return rows
        } catch (e) {
            throw e
        } finally {
            if (conn) conn.release()
        }
    }

    static getFacturaById = async (id) => {
        let conn
        try {
            conn = await pool.getConnection()

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
                WHERE i.id = ?`, [id]
            )

            if (invoiceRows.length === 0) return null

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
        } finally {
            if (conn) conn.release()
        }
    }

    static voidFactura = async (id) => {
        const conn = await pool.getConnection()

        try {
            await conn.beginTransaction()

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

            const [detailRows] = await conn.execute(
                `SELECT product_id, quantity FROM invoice_details WHERE invoice_id = ?`,
                [id]
            )

            for (const detail of detailRows) {
                await conn.execute(
                    `UPDATE products SET stock = stock + ? WHERE id = ?`,
                    [detail.quantity, detail.product_id]
                )
            }

            await conn.execute(
                `UPDATE invoices SET status = 'VOIDED' WHERE id = ?`,
                [id]
            )

            await conn.commit()

            return await FacturaModel.getFacturaById(id)

        } catch (e) {
            await conn.rollback()
            throw e
        } finally {
            if (conn) conn.release()
        }
    }
}
