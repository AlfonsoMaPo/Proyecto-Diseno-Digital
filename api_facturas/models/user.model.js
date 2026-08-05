import { pool } from '../db/db.js'

export default class UserModel {

    // Buscar un usuario por su email
    static findByEmail = async (email) => {
        let conn
        try {
            conn = await pool.getConnection()

            const [rows] = await conn.execute(
                `SELECT id, name, email, password_hash, role, created_at FROM users WHERE email = ?`,
                [email]
            )

            return rows[0] ?? null
        } catch (e) {
            throw e
        } finally {
            if (conn) conn.release()
        }
    }

    // Buscar un usuario por su ID
    static findById = async (id) => {
        let conn
        try {
            conn = await pool.getConnection()

            const [rows] = await conn.execute(
                `SELECT id, name, email, role, created_at FROM users WHERE id = ?`,
                [id]
            )

            return rows[0] ?? null
        } catch (e) {
            throw e
        } finally {
            if (conn) conn.release()
        }
    }
}
