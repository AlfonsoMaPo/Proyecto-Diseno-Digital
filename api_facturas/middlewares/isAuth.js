
import jwt from 'jsonwebtoken'
import { jsonResponse } from '../helpers/json_response.js'


export const isAuth = async (req, res, next) => {

    // capturar la req y obtener los encabezados
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json(jsonResponse({
            status: 401,
            message: 'Acceso denegado. Token no proporcionado',
            data: null
        }))
    }

    const token = authHeader.split(' ')[1]

    // validar el token
    try {
        const { id, email, role } = jwt.verify(token, process.env.JWT_KEY)

        // sacar datos del token
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