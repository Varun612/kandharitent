const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const { requireAdminAuth } = require('../middleware/authMiddleware');
const { validateItemInput } = require('../middleware/validation');

// Public routes
router.get('/', itemController.getItems);
router.get('/categories', itemController.getCategories);
router.get('/:id', itemController.getItemById);

// Protected Admin routes
router.post('/', requireAdminAuth, validateItemInput, itemController.createItem);
router.put('/:id', requireAdminAuth, itemController.updateItem);
router.delete('/:id', requireAdminAuth, itemController.deleteItem);

module.exports = router;
