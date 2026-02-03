import express from 'express';
import { AdvertisementController } from './advertisement.controller';

const router = express.Router();

router.get('/', AdvertisementController);

export const advertisementRoutes = router;