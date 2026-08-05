
export const jsonResponse = ({ status = 200, message = 'Información no encontrada', data = null }) => {
    return {
        success: status >= 200 && status < 300,
        status,
        message,
        data
    }
}
