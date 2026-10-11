import { Router } from 'express';
import { getAchievements } from '../controllers/achievementsController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);
router.get('/', getAchievements);

export default router;
