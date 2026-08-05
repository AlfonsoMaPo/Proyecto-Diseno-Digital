import { pool } from '../db/db.js'

// modelo de productos — clase estática igual que MovieModel en la referencia
export default class ProductModel {

    // listar todos los productos activos del catálogo
    static getAllActive = async () => {
        let conn
        try {
            conn = await pool.getConnection()

            const [rows] = await conn.query(
                `SELECT id, code, name, price, stock, is_active, created_at
                 FROM products
                 WHERE is_active = TRUE
                 ORDER BY name ASC`
            )

            return rows
        } catch (e) {
            throw e
        } finally {
            if (conn) conn.release()
        }
    }

    // obtener un producto por ID (usado internamente para validaciones)
    static findById = async (id) => {
        let conn
        try {
            conn = await pool.getConnection()

            const [rows] = await conn.execute(
                `SELECT id, code, name, price, stock, is_active FROM products WHERE id = ?`,
                [id]
            )

            return rows[0] ?? null
        } catch (e) {
            throw e
        } finally {
            if (conn) conn.release()
        }
    }

    // crear un nuevo producto en el catálogo
    static create = async ({ code, name, price, stock }) => {
        let conn
        try {
            conn = await pool.getConnection()

            const [result] = await conn.execute(
                `INSERT INTO products (code, name, price, stock) VALUES (?, ?, ?, ?)`,
                [code, name, price, stock]
            )

            const [rows] = await conn.execute(
                `SELECT id, code, name, price, stock, is_active, created_at FROM products WHERE id = ?`,
                [result.insertId]
            )

            return rows[0]
        } catch (e) {
            throw e
        } finally {
            if (conn) conn.release()
        }
    }

    // incrementar el stock de un producto existente
    static addStock = async (id, stock_to_add) => {
        let conn
        try {
            conn = await pool.getConnection()

            const [existing] = await conn.execute(
                `SELECT id, stock FROM products WHERE id = ? AND is_active = TRUE`,
                [id]
            )

            if (existing.length === 0) return null

            await conn.execute(
                `UPDATE products SET stock = stock + ? WHERE id = ?`,
                [stock_to_add, id]
            )

            const [rows] = await conn.execute(
                `SELECT id, code, name, price, stock, is_active FROM products WHERE id = ?`,
                [id]
            )

            return rows[0]
        } catch (e) {
            throw e
        } finally {
            if (conn) conn.release()
        }
    }
}
