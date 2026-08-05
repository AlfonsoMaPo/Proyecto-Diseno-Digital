import * as z from 'zod'

const loginSchema = z.object({
    email: z.string().min(1, 'El correo electrónico es requerido').email('El formato del correo es inválido'),
    password: z.string().min(1, 'La contraseña es requerida')
}).strict()

export const validateLogin = (payload) => {
    return loginSchema.safeParse(payload)
}
