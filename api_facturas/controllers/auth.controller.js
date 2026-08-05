import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import UserModel from '../models/user.model.js'
import { validateLogin } from '../schemas/auth.schema.js'
import { jsonResponse } from '../helpers/jsonResponse.js'

export const login = async (req, res) => {
    try {
        const validation = validateLogin(req.body)

        if (!validation.success) {
            return res.status(400).json(jsonResponse({
                status: 400,
                message: 'Datos de entrada inválidos',
                data: validation.error.issues
            }))
        }

        const { email, password } = validation.data

        const user = await UserModel.findByEmail(email)

        if (!user) {
            return res.status(401).json(jsonResponse({
                status: 401,
                message: 'Credenciales inválidas',
                data: null
            }))
        }

        const isPasswordValid = await bcrypt.compare(password, user.password_hash)

        if (!isPasswordValid) {
            return res.status(401).json(jsonResponse({
                status: 401,
                message: 'Credenciales inválidas',
                data: null
            }))
        }

        const jwtSecret = process.env.JWT_KEY || 'secret_key_123'

        // Payload según especificación de proyecto2.md: { id, email, role }
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            jwtSecret,
            { expiresIn: '8h' }
        )

        return res.status(200).json(jsonResponse({
            status: 200,
            message: 'Inicio de sesión exitoso',
            data: {
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            }
        }))
    } catch (error) {
        return res.status(500).json(jsonResponse({
            status: 500,
            message: 'Error interno al procesar el inicio de sesión',
            data: error.message
        }))
    }
}
