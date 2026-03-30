import type { VercelRequest, VercelResponse } from '@vercel/node'
import {
  getUsersController,
  createUserController
} from '../../src/modules/users/users.controller.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    switch (req.method) {
      case 'GET':
        const users = await getUsersController()
        return res.json(users)

      case 'POST':
        const newUser = await createUserController(req.body)
        return res.status(201).json(newUser)

      default:
        res.status(405).json({ message: 'Method not allowed' })
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message })
    }

    return res.status(500).json({ error: 'Internal server error' })
  }
}
