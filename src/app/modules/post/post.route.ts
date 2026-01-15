import express from 'express';
import { PostController } from './post.controller';

const router = express.Router();

router.get('/', PostController);

export const postRoutes = router;