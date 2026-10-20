const express = require('express');
const router = express.Router();
const { 
  searchMedia, 
  createPortfolio, 
  getPortfolios, 
  renderMarketingReel, 
  getRenderedReels 
} = require('../controllers/marketingController');
const { requireAdminAuth } = require('../middleware/authMiddleware');

router.get('/media', searchMedia);
router.get('/portfolios', getPortfolios);
router.post('/portfolios', requireAdminAuth, createPortfolio);
router.post('/reels/render', requireAdminAuth, renderMarketingReel);
router.post('/render-reel', requireAdminAuth, renderMarketingReel);
router.get('/reels', getRenderedReels);
router.get('/rendered-reels', getRenderedReels);

module.exports = router;
