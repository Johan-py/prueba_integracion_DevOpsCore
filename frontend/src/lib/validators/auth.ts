export function validateEmail(email: string): string {
  const value = email.trim()

  if (!value) {
    return 'El correo es obligatorio'
  }

  // Validación simple y suficiente para frontend
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!emailRegex.test(value)) {
    return 'El formato del correo no es válido'
  }

  return ''
}