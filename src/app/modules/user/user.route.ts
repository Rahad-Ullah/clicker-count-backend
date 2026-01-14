import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { UserController } from './user.controller';
import { UserValidation } from './user.validation';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import { USER_ROLES } from './user.constant';
const router = express.Router();

// create user
router.post(
  '/create-user',
  validateRequest(UserValidation.createUserZodSchema),
  UserController.createUser
);

// update profile
router.patch(
  '/profile',
  auth(),
  fileUploadHandler(),
  validateRequest(UserValidation.updateUserZodSchema),
  UserController.updateProfile
);

// toggle user status
router.patch(
  '/toggle-status/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  UserController.toggleUserStatus
);

// get profile
router.get('/profile', auth(), UserController.getUserProfile);

// get single user by id
router.get('/single/:id', auth(), UserController.getUserById);

// get all users
router.get('/', auth(), UserController.getAllUsers);

export const UserRoutes = router;
