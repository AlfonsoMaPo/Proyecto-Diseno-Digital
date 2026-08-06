import jwt from 'jsonwebtoken'
import { jsonResponse } from '../helpers/jsonResponse.js'

export const isAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json(jsonResponse({
            status: 401,
            message: 'Acceso denegado. Token no proporcionado',
            data: null
        }))
    }

    const token = authHeader.split(' ')[1]

    try {
        const jwtSecret = process.env.JWT_KEY || 'secret_key_123'
        const { id, email, role } = jwt.verify(token, jwtSecret)

        req.user = { id, email, role }

        next()
    } catch (e) {
        return res.status(401).json(jsonResponse({
            status: 401,
            message: 'Token inválido o expirado',
            data: null
        }))
    }
}