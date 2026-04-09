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
export function validatePassword(password: string): string {
  if (!password) {
    return 'La contraseña es obligatoria'
  }
  if (password.length < 8) {
    return 'La contraseña debe tener mínimo 8 caracteres'
  }
  if (!/[A-Z]/.test(password)) {
    return 'La contraseña debe contener al menos una mayúscula'
  }
  if (!/[0-9]/.test(password)) {
    return 'La contraseña debe contener al menos un número'
  }
  return ''
}
