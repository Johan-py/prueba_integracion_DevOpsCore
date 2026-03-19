import { Request, Response } from 'express'
import fs from 'fs'
import path from 'path'

export const getPosts = async (req: Request, res: Response) => {
  try {
    const postsDataPath = path.resolve(__dirname, 'data', 'posts.json')
    const fileContent = fs.readFileSync(postsDataPath, 'utf-8')
    const posts = JSON.parse(fileContent)
    res.json(posts)
  } catch (error) {
    console.error('Error al leer posts.json:', error)
    res.status(500).json({ error: 'Error al obtener el feed (Git Practice Mode)' })
  }
}
