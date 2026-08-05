
import { jsonResponse } from '../helpers/jsonResponse.js'

// verifica que tenga el rol ADMIN
export const isAdmin = (req, res, next) => {

    if (!req.user || req.user.role !== 'ADMIN') {
        return res.status(403).json(jsonResponse({
            status: 403,
            message: 'Acceso denegado. Se requiere rol de Administrador',
            data: null
        }))
    }

    next()
}
