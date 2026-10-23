// server/middleware/rateLimiter.js
// In-memory sliding-window rate limiting middleware for sensitive endpoints

const createRateLimiter = (options = {}) => {
  const windowMs = options.windowMs || 15 * 60 * 1000; // default 15 minutes
  const max = options.max || 100;
  const message = options.message || 'Too many requests from this IP, please try again later.';
  
  // IP -> array of timestamps
  const hits = new Map();

  // Periodic cleanup to avoid memory leak
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [ip, timestamps] of hits.entries()) {
      const valid = timestamps.filter(t => now - t < windowMs);
      if (valid.length === 0) {
        hits.delete(ip);
      } else {
        hits.set(ip, valid);
      }
    }
  }, Math.min(windowMs, 5 * 60 * 1000));
  if (timer.unref) timer.unref();

  return (req, res, next) => {
    // Bypass in test environment or health checks
    if (process.env.NODE_ENV === 'test' || req.path === '/health' || req.path === '/api/health') {
      return next();
    }

    const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket?.remoteAddress || '127.0.0.1';
    const now = Date.now();
    
    let timestamps = hits.get(ip) || [];
    timestamps = timestamps.filter(t => now - t < windowMs);

    if (timestamps.length >= max) {
      const oldestHit = timestamps[0];
      const resetTime = Math.ceil((oldestHit + windowMs - now) / 1000);
      res.setHeader('Retry-After', resetTime > 0 ? resetTime : 1);
      return res.status(429).json({
        success: false,
        message,
        retryAfterSeconds: resetTime > 0 ? resetTime : 1
      });
    }

    timestamps.push(now);
    hits.set(ip, timestamps);

    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - timestamps.length));
    next();
  };
};

module.exports = {
  createRateLimiter,
  authLimiter: createRateLimiter({ windowMs: 15 * 60 * 1000, max: 25, message: 'Too many authentication attempts. Please try again after 15 minutes.' }),
  enquiryLimiter: createRateLimiter({ windowMs: 15 * 60 * 1000, max: 40, message: 'Too many enquiries submitted from this IP. Please wait before submitting again.' }),
  chatLimiter: createRateLimiter({ windowMs: 10 * 60 * 1000, max: 80, message: 'AI chat rate limit reached. Please wait a moment.' }),
  receptionistLimiter: createRateLimiter({ windowMs: 10 * 60 * 1000, max: 60, message: 'Receptionist call simulation rate limit reached.' })
};
