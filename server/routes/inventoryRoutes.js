const express = require('express');
const router = express.Router();
const {
  getInventory,
  adjustInventory,
  updateInventoryItem,
  getInventoryLogs
} = require('../controllers/inventoryController');
const { protectAdmin } = require('../middleware/authMiddleware');

router.get('/', protectAdmin, getInventory);
router.get('/logs', protectAdmin, getInventoryLogs);
router.post('/adjust', protectAdmin, adjustInventory);
router.put('/:id', protectAdmin, updateInventoryItem);

module.exports = router;
