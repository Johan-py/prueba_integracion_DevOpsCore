import { Prisma, RolNombre } from '@prisma/client'
import { prisma } from '../../db'

interface CreateUserInput {
  nombre: string
  apellido: string
  correo: string
  password: string
  telefono?: string
}

const ensureVisitorRole = async () => {
  const rol = await prisma.rol.findUnique({
    where: { nombre: RolNombre.VISITANTE }
  })

  if (rol) {
    return rol
  }

  return await prisma.rol.create({
    data: {
      nombre: RolNombre.VISITANTE
    }
  })
}

export const createUser = async (data: CreateUserInput) => {
  const rol = await ensureVisitorRole()

  try {
    return await prisma.usuario.create({
      data: {
        nombre: data.nombre,
        apellido: data.apellido,
        correo: data.correo,
        password: data.password,
        rolId: rol.id,
        telefonos: data.telefono
          ? {
              create: {
                codigoPais: '+591',
                numero: data.telefono,
                principal: true
              }
            }
          : undefined
      },
      include: {
        telefonos: true
      }
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new Error('El correo ya está registrado')
    }

    throw error
  }
}

export const findUser = async (correo: string) => {
  return await prisma.usuario.findUnique({
    where: { correo }
  })
}

export const findUserByCorreo = async (correo: string) => {
  return await prisma.usuario.findUnique({
    where: { correo }
  })
}

export const findUserById = async (id: number) => {
  return await prisma.usuario.findUnique({
    where: { id },
    include: {
      rol: true
    }
  })
}

export const createSession = async ({
  token,
  usuarioId,
  fechaExpiracion
}: {
  token: string
  usuarioId: number
  fechaExpiracion: Date
}) => {
  return await prisma.sesion.create({
    data: {
      token,
      usuarioId,
      fechaExpiracion,
      estado: true
    }
  })
}

export const findActiveSessionByToken = async (token: string) => {
  return await prisma.sesion.findFirst({
    where: {
      token,
      estado: true,
      fechaExpiracion: { gt: new Date() }
    },
    include: {
      usuario: {
        include: {
          rol: true
        }
      }
    }
  })
}

export const desactiveSessionByToken = async (token: string) => {
  return await prisma.sesion.updateMany({
    where: {
      token,
      estado: true
    },
    data: {
      estado: false
    }
  })
}
