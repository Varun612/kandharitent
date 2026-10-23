const { isMongoConnected, getLocalDb } = require('../config/db');

/**
 * 1. GET /api/reports/summary
 */
const getReportSummary = async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;
    const db = getLocalDb();
    let enquiries = db.enquiries || [];

    // Filter by date range
    if (startDate) {
      const s = new Date(startDate);
      enquiries = enquiries.filter(e => new Date(e.createdAt || e.eventDate) >= s);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      enquiries = enquiries.filter(e => new Date(e.createdAt || e.eventDate) <= end);
    }

    if (status && status !== 'all') {
      enquiries = enquiries.filter(e => e.status === status);
    }

    const totalOrders = enquiries.length;
    const totalRevenue = enquiries.reduce((sum, e) => sum + (Number(e.advancePaid) || 0), 0);
    const totalOutstanding = enquiries.reduce((sum, e) => sum + (Number(e.balanceDue) || 0), 0);
    const grossBookingsValue = enquiries.reduce((sum, e) => sum + (Number(e.grandTotal) || 0), 0);
    const averageOrderValue = totalOrders > 0 ? Math.round(grossBookingsValue / totalOrders) : 0;

    // Status breakdown
    const statusCounts = {};
    enquiries.forEach(e => {
      const st = e.status || 'Unknown';
      statusCounts[st] = (statusCounts[st] || 0) + 1;
    });

    // Top requested items
    const itemCounts = {};
    enquiries.forEach(e => {
      (e.items || []).forEach(it => {
        const name = it.name || 'Custom';
        itemCounts[name] = (itemCounts[name] || 0) + Number(it.quantity || 1);
      });
    });

    const topItems = Object.entries(itemCounts)
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 8);

    // Top localities
    const localityCounts = {};
    enquiries.forEach(e => {
      const loc = e.locality || 'Kanpur Road';
      localityCounts[loc] = (localityCounts[loc] || 0) + 1;
    });

    const topLocalities = Object.entries(localityCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    return res.json({
      success: true,
      data: {
        totalOrders,
        totalRevenue,
        totalOutstanding,
        grossBookingsValue,
        averageOrderValue,
        statusCounts,
        topItems,
        topLocalities,
        filter: { startDate, endDate, status }
      }
    });
  } catch (err) {
    console.error('Error getting report summary:', err);
    return res.status(500).json({ success: false, message: 'Server error generating report summary' });
  }
};

/**
 * 2. GET /api/reports/export-csv
 */
const exportReportCSV = async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;
    const db = getLocalDb();
    let enquiries = db.enquiries || [];

    if (startDate) {
      const s = new Date(startDate);
      enquiries = enquiries.filter(e => new Date(e.createdAt || e.eventDate) >= s);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      enquiries = enquiries.filter(e => new Date(e.createdAt || e.eventDate) <= end);
    }
    if (status && status !== 'all') {
      enquiries = enquiries.filter(e => e.status === status);
    }

    const headers = [
      'Order Ref',
      'Booking Date',
      'Customer Name',
      'Phone',
      'Email',
      'Event Date',
      'Locality',
      'Service',
      'Grand Total (INR)',
      'Advance Paid (INR)',
      'Balance Due (INR)',
      'Status',
      'Payment Status'
    ];

    const escapeCsv = (str) => {
      if (str === null || str === undefined) return '""';
      const s = String(str).replace(/"/g, '""');
      return `"${s}"`;
    };

    const rows = enquiries.map(e => [
      escapeCsv(e.id),
      escapeCsv(e.createdAt ? new Date(e.createdAt).toLocaleDateString('en-IN') : ''),
      escapeCsv(e.customerName),
      escapeCsv(e.phone),
      escapeCsv(e.email),
      escapeCsv(e.eventDate),
      escapeCsv(e.locality),
      escapeCsv(e.serviceRequired),
      escapeCsv(e.grandTotal || 0),
      escapeCsv(e.advancePaid || 0),
      escapeCsv(e.balanceDue || 0),
      escapeCsv(e.status),
      escapeCsv(e.paymentStatus || 'Pending')
    ].join(','));

    const csv = [headers.join(','), ...rows].join('\r\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=kandhari_business_report_${Date.now()}.csv`);
    return res.send(csv);
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error exporting CSV' });
  }
};

/**
 * 3. GET /api/reports/printable-html
 * Returns a complete styled printable report
 */
const getPrintableReportHtml = async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;
    const db = getLocalDb();
    let enquiries = db.enquiries || [];

    if (startDate) {
      const s = new Date(startDate);
      enquiries = enquiries.filter(e => new Date(e.createdAt || e.eventDate) >= s);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      enquiries = enquiries.filter(e => new Date(e.createdAt || e.eventDate) <= end);
    }
    if (status && status !== 'all') {
      enquiries = enquiries.filter(e => e.status === status);
    }

    const totalRevenue = enquiries.reduce((sum, e) => sum + (Number(e.advancePaid) || 0), 0);
    const totalOutstanding = enquiries.reduce((sum, e) => sum + (Number(e.balanceDue) || 0), 0);
    const grossBookings = enquiries.reduce((sum, e) => sum + (Number(e.grandTotal) || 0), 0);

    const rowsHtml = enquiries.map((e, idx) => `
      <tr style="border-bottom: 1px solid #e5e7eb; font-size: 11px;">
        <td style="padding: 6px 8px; font-weight: bold; font-family: monospace;">${e.id}</td>
        <td style="padding: 6px 8px;">${e.customerName}<br><span style="color: #6b7280; font-size: 10px;">${e.phone}</span></td>
        <td style="padding: 6px 8px;">${e.eventDate}</td>
        <td style="padding: 6px 8px;">${e.locality || 'Lucknow'}</td>
        <td style="padding: 6px 8px; text-align: right; font-weight: bold;">₹${(e.grandTotal || 0).toLocaleString('en-IN')}</td>
        <td style="padding: 6px 8px; text-align: right; color: #047857; font-weight: bold;">₹${(e.advancePaid || 0).toLocaleString('en-IN')}</td>
        <td style="padding: 6px 8px; text-align: right; color: #b91c1c;">₹${(e.balanceDue || 0).toLocaleString('en-IN')}</td>
        <td style="padding: 6px 8px; text-align: center;"><span style="display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: bold; background: #f3f4f6;">${e.status}</span></td>
      </tr>
    `).join('');

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Kandhari Tent & Caterers - Official Business Report</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #1f2937; margin: 20px; }
        .header { border-bottom: 2px solid #C5A059; padding-bottom: 12px; margin-bottom: 16px; }
        .title { color: #4A0E2E; font-size: 20px; font-weight: 800; }
        .subtitle { font-size: 12px; color: #6b7280; }
        .metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
        .metric-card { background: #FAF7F2; border: 1px solid #C5A059; padding: 10px; border-radius: 8px; }
        .metric-card h4 { margin: 0; font-size: 10px; color: #6b7280; text-transform: uppercase; }
        .metric-card p { margin: 4px 0 0; font-size: 18px; font-weight: bold; color: #4A0E2E; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th { background: #4A0E2E; color: white; text-align: left; padding: 8px; font-size: 10px; text-transform: uppercase; }
        @media print {
          .no-print { display: none; }
          body { margin: 0; }
        }
      </style>
    </head>
    <body>
      <div class="no-print" style="margin-bottom: 15px;">
        <button onclick="window.print()" style="padding: 8px 16px; background: #4A0E2E; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">Print / Save as PDF</button>
      </div>
      <div class="header">
        <div class="title">KANDHARI TENT & CATERERS &bull; DWARKA SHRI LAWN</div>
        <div class="subtitle">Kanpur Road, Opp. Pillar No. 37, Daroga Kheda, Lucknow - 226023 | Lucknow, Uttar Pradesh</div>
        <div style="margin-top: 6px; font-size: 12px; font-weight: bold; color: #C5A059;">OFFICIAL BUSINESS & REVENUE REPORT</div>
        <div style="font-size: 10px; color: #9ca3af;">Generated on: ${new Date().toLocaleString('en-IN')}</div>
      </div>

      <div class="metrics-grid">
        <div class="metric-card">
          <h4>Total Bookings</h4>
          <p>${enquiries.length}</p>
        </div>
        <div class="metric-card">
          <h4>Gross Order Value</h4>
          <p>₹${grossBookings.toLocaleString('en-IN')}</p>
        </div>
        <div class="metric-card">
          <h4>Total Revenue Received</h4>
          <p style="color: #047857;">₹${totalRevenue.toLocaleString('en-IN')}</p>
        </div>
        <div class="metric-card">
          <h4>Outstanding Balance</h4>
          <p style="color: #b91c1c;">₹${totalOutstanding.toLocaleString('en-IN')}</p>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Order Ref</th>
            <th>Client</th>
            <th>Event Date</th>
            <th>Locality</th>
            <th style="text-align: right;">Total</th>
            <th style="text-align: right;">Advance</th>
            <th style="text-align: right;">Balance</th>
            <th style="text-align: center;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>

      <div style="margin-top: 40px; display: flex; justify-content: space-between; font-size: 11px; color: #6b7280;">
        <div>Verified by Kandhari Tent & Caterers Management</div>
        <div style="border-top: 1px solid #9ca3af; width: 160px; text-align: center; padding-top: 4px;">Authorized Signatory</div>
      </div>
    </body>
    </html>
    `;

    res.setHeader('Content-Type', 'text/html');
    return res.send(html);
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error generating printable report' });
  }
};

module.exports = {
  getReportSummary,
  exportReportCSV,
  getPrintableReportHtml
};
