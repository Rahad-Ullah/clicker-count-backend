import express from 'express';
import { JoinRequestController } from './joinRequest.controller';

const router = express.Router();

router.get('/', JoinRequestController);

export const joinRequestRoutes = router;