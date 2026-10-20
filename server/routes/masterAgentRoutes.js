const express = require('express');
const router = express.Router();
const {
  handleAgentQuery,
  confirmAgentAction
} = require('../controllers/masterAgentController');
const { protectAdmin } = require('../middleware/authMiddleware');

router.post('/query', protectAdmin, handleAgentQuery);
router.post('/confirm-action', protectAdmin, confirmAgentAction);

module.exports = router;
