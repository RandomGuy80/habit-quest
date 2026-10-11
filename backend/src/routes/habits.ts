import { Router } from 'express';
import {
  getHabits, createHabit, updateHabit, deleteHabit,
  completeHabit, uncompleteHabit, getTodayCompletions,
  getHeatmap, getStats,
} from '../controllers/habitsController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', getHabits);
router.post('/', createHabit);
router.put('/:id', updateHabit);
router.delete('/:id', deleteHabit);
router.post('/:id/complete', completeHabit);
router.post('/:id/uncomplete', uncompleteHabit);
router.get('/completions/today', getTodayCompletions);
router.get('/stats/heatmap', getHeatmap);
router.get('/stats/summary', getStats);

export default router;
