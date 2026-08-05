import { Router } from 'express'
import { login } from '../controllers/auth.controller.js'

const authRoutes = Router()

// POST /api/v1/auth/login — Inicio de sesión público
authRoutes.post('/login', login)

export default authRoutes
