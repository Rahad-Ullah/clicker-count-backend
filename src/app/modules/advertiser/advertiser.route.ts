import express from 'express';
import { AdvertiserController } from './advertiser.controller';

const router = express.Router();

router.get('/', AdvertiserController);

export const advertiserRoutes = router;