const express = require('express');
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const validateUser = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

// Public routes
router.get('/', userController.getUsers);
router.get('/:id', userController.getUserById);
router.post('/', validateUser, userController.createUser);

// Protected routes (example)
// router.put('/:id', protect, validateUser, userController.updateUser);
// router.delete('/:id', protect, userController.deleteUser);

module.exports = router;
