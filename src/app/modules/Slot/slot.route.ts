import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { SlotController } from './slot.controller';
import { authenticateUser, authorizeAdmin } from '../../middlewares/auth';
import { SlotValidation } from './slot.validation';

const router = express.Router();

router.post(
  '/',
  authenticateUser,
  authorizeAdmin,
  validateRequest(SlotValidation.createSlotValidationSchema),
  SlotController.createSlot,
);

router.get('/availability', SlotController.getAvailableSlots);

router.get('/', SlotController.getAllSlots);

router.patch(
  '/:id',
  authenticateUser,
  authorizeAdmin,
  validateRequest(SlotValidation.updateSlotValidationSchema),
  SlotController.updateSlot,
);

// Delete Slot
router.delete(
  '/:id',
  authenticateUser,
  authorizeAdmin,
  SlotController.deleteSlot,
);

export const SlotRoutes = router;
