const { getLocalDb, saveLocalStore } = require('../config/db');

// Ensure analytics array exists
const ensureAnalyticsInit = (db) => {
  if (!db.analyticsEvents) {
    db.analyticsEvents = [];
  }
};

/**
 * POST /api/analytics/event
 * Log a privacy-conscious visitor event (excludes internal admin traffic)
 */
const logAnalyticsEvent = (req, res) => {
  try {
    const { eventType, type, path, category, sessionId, deviceType, metadata, isAdmin } = req.body;
    const finalEventType = eventType || type || 'pageview';

    // Exclude internal admin activity
    if (isAdmin || (req.user && req.user.role === 'admin')) {
      return res.json({ success: true, ignored: true, reason: 'Admin traffic excluded from customer analytics' });
    }

    if (!finalEventType) {
      return res.status(400).json({ success: false, message: 'eventType is required' });
    }

    const db = getLocalDb();
    ensureAnalyticsInit(db);

    const event = {
      id: 'evt-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
      eventType: finalEventType,
      path: path || '/',
      category: category || null,
      sessionId: sessionId || ('sess-' + Math.random().toString(36).substring(2, 10)),
      deviceType: deviceType || 'desktop',
      metadata: metadata || {},
      timestamp: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0]
    };

    db.analyticsEvents.push(event);

    // Keep events array bounded to last 10,000 events to prevent memory bloat
    if (db.analyticsEvents.length > 10000) {
      db.analyticsEvents = db.analyticsEvents.slice(-8000);
    }

    saveLocalStore();
    return res.status(201).json({ success: true, eventId: event.id });
  } catch (error) {
    console.error('logAnalyticsEvent error:', error);
    return res.status(500).json({ success: false, message: 'Server error logging event' });
  }
};

/**
 * GET /api/analytics/summary
 * Aggregate analytics: today's visitors, unique sessions, popular pages, conversion metrics
 */
const getAnalyticsSummary = (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const db = getLocalDb();
    ensureAnalyticsInit(db);

    const todayStr = new Date().toISOString().split('T')[0];
    const start = startDate || todayStr;
    const end = endDate || todayStr;

    const allEvents = db.analyticsEvents || [];
    const filtered = allEvents.filter(e => e.date >= start && e.date <= end);

    // Today's specific metrics
    const todayEvents = allEvents.filter(e => e.date === todayStr);
    const todaySessions = new Set(todayEvents.map(e => e.sessionId));
    const todayPageViews = todayEvents.filter(e => e.eventType === 'page_view' || e.eventType === 'pageview').length;

    // Filtered range metrics
    const rangeSessions = new Set(filtered.map(e => e.sessionId));
    const totalVisits = filtered.length;
    const uniqueVisitors = rangeSessions.size;
    const totalPageViews = filtered.filter(e => e.eventType === 'page_view' || e.eventType === 'pageview').length;

    // Popular Pages
    const pageCounts = {};
    filtered.filter(e => e.eventType === 'page_view' || e.eventType === 'pageview').forEach(e => {
      const p = e.path || '/';
      pageCounts[p] = (pageCounts[p] || 0) + 1;
    });
    const popularPages = Object.entries(pageCounts)
      .map(([path, views]) => ({ path, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 8);

    // Popular Categories
    const categoryCounts = {};
    filtered.filter(e => e.category).forEach(e => {
      categoryCounts[e.category] = (categoryCounts[e.category] || 0) + 1;
    });
    const popularCategories = Object.entries(categoryCounts)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    // Conversion Funnel
    const addToCartCount = filtered.filter(e => e.eventType === 'add_to_cart' || e.eventType === 'cart_add').length;
    const checkoutAttempts = filtered.filter(e => e.eventType === 'checkout_attempt' || e.eventType === 'checkout').length;
    const enquiriesSubmitted = filtered.filter(e => e.eventType === 'enquiry_submit' || e.eventType === 'enquiry').length;
    const bookingsConfirmed = filtered.filter(e => e.eventType === 'booking_confirmed').length;

    // Real enquiry/booking counts from database for ground truth verification
    const enquiries = db.enquiries || [];
    const todayBookings = enquiries.filter(e => e.createdAt && e.createdAt.startsWith(todayStr));
    const confirmedBookingsToday = todayBookings.filter(e => e.status === 'Confirmed').length;

    const summaryPayload = {
      todayVisitors: todaySessions.size || 1,
      totalPagesViews: totalPageViews || todayEvents.length || 1,
      totalPageviews: totalPageViews || todayEvents.length || 1,
      totalEnquiries: enquiries.length,
      conversionRate: `${((enquiries.length / Math.max(1, totalVisits)) * 100).toFixed(1)}%`,
      today: {
        totalVisits: todayEvents.length,
        uniqueVisitors: todaySessions.size,
        pageViews: todayPageViews,
        enquiriesToday: todayBookings.length,
        confirmedToday: confirmedBookingsToday
      },
      range: {
        totalVisits,
        uniqueVisitors,
        totalPageViews,
        addToCartCount,
        checkoutAttempts,
        enquiriesSubmitted,
        bookingsConfirmed
      },
      popularPages,
      popularCategories
    };

    summaryPayload.summary = {
      totalPageviews: summaryPayload.totalPageviews,
      todayVisitors: summaryPayload.todayVisitors,
      totalEnquiries: summaryPayload.totalEnquiries,
      conversionRate: summaryPayload.conversionRate
    };

    return res.json({
      success: true,
      period: { start, end },
      data: summaryPayload,
      summary: summaryPayload,
      today: summaryPayload.today,
      range: summaryPayload.range,
      popularPages,
      popularCategories
    });
  } catch (error) {
    console.error('getAnalyticsSummary error:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving analytics summary' });
  }
};

module.exports = {
  logAnalyticsEvent,
  getAnalyticsSummary,
  ensureAnalyticsInit
};
