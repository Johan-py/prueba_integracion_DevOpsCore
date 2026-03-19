import { Router } from 'express'
import * as postsController from './posts.controller'

const router = Router()

router.get('/posts', postsController.getPosts)

export default router
