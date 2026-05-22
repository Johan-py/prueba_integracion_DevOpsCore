export const USER_STORAGE_KEY = 'propbol_user'

type SessionUserInput = {
  correo?: string
  nombre?: string
  apellido?: string
  avatar?: string | null
  rol?: string | { nombre: string }
  controlador?: boolean | null
}

export type SessionUser = {
  name: string
  email: string
  avatar: string | null
  role: string | null
  controlador: boolean | null
}

export function buildSessionUser(user?: SessionUserInput): SessionUser {
  const fullName = [user?.nombre, user?.apellido].filter(Boolean).join(' ').trim()
  const roleName = typeof user?.rol === 'object' ? user.rol.nombre : user?.rol

  return {
    name: fullName || user?.correo || 'Usuario',
    email: user?.correo ?? '',
    avatar: user?.avatar ?? null,
    role: roleName ?? null,
    controlador: user?.controlador ?? null
  }
}
