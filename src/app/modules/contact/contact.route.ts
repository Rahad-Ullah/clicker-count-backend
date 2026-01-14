import express from 'express';
import { ContactController } from './contact.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import { ContactValidations } from './contact.validation';

const router = express.Router();

// create/update contact
router.post(
  '/',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  validateRequest(ContactValidations.contactValidation),
  ContactController.createUpdateContact
);

// get contact
router.get('/', ContactController.getContact);

export const contactRoutes = router;
