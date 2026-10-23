import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Truck, 
  MapPin, 
  Calendar, 
  Phone, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  ExternalLink, 
  Navigation, 
  Search, 
  FileText, 
  ShieldCheck, 
  RefreshCw, 
  ChevronRight,
  Package,
  XCircle,
  HelpCircle
} from 'lucide-react';
import { api } from '../services/api';
import IndividualTicketModal from '../components/IndividualTicketModal';

const OrderTrackingPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [searchId, setSearchId] = useState(orderId || '');
  const [currentId, setCurrentId] = useState(orderId || '');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  // Fetch live order tracking status
  const fetchOrder = useCallback(async (idToFetch, isSilent = false) => {
    if (!idToFetch) return;
    if (!isSilent) setLoading(true);
    setError('');

    try {
      const res = await api.trackOrder(idToFetch);
      if (res.success && res.data) {
        setOrder(res.data);
        setLastUpdated(new Date());
      } else {
        setOrder(null);
        setError(res.message || 'Order reference not found.');
      }
    } catch (err) {
      console.error('Tracking fetch error:', err);
      if (!isSilent) {
        setOrder(null);
        setError(err.message || 'Unable to track order. Please check the reference ID.');
      }
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  // Sync route param with state
  useEffect(() => {
    if (orderId) {
      setSearchId(orderId);
      setCurrentId(orderId);
      fetchOrder(orderId);
    } else {
      // Check localStorage for most recent booking if user opened /track without ID
      try {
        const lastOrder = localStorage.getItem('last_kandhari_enquiry_id');
        if (lastOrder) {
          setSearchId(lastOrder);
          setCurrentId(lastOrder);
          fetchOrder(lastOrder);
        }
      } catch (e) {}
    }
  }, [orderId, fetchOrder]);

  // Live polling every 6 seconds to reflect real-time Admin actions
  useEffect(() => {
    if (!currentId) return;
    const interval = setInterval(() => {
      fetchOrder(currentId, true);
    }, 6000);
    return () => clearInterval(interval);
  }, [currentId, fetchOrder]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const clean = searchId.trim();
    if (!clean) return;
    navigate(`/track/${encodeURIComponent(clean)}`);
  };

  // Determine active stage in Zomato flow (1 to 5)
  const getStageStatus = () => {
    if (!order) return { stage: 1, isRejected: false };
    const status = (order.status || '').toLowerCase();
    const delStatus = (order.deliveryStatus || '').toLowerCase();

    if (status.includes('reject')) {
      return { stage: 2, isRejected: true };
    }
    if (status.includes('delivered') || delStatus.includes('delivered') || status.includes('completed')) {
      return { stage: 5, isRejected: false };
    }
    if (status.includes('route') || delStatus.includes('route') || delStatus.includes('out for delivery')) {
      return { stage: 4, isRejected: false };
    }
    if (order.deliveryPartner || status.includes('assigned') || delStatus.includes('assigned')) {
      return { stage: 3, isRejected: false };
    }
    if (status.includes('approv')) {
      return { stage: 2, isRejected: false, isApproved: true };
    }
    // Default: Pending Admin Approval
    return { stage: 1, isRejected: false };
  };

  const stageInfo = getStageStatus();
  const fullAddress = [order?.eventVenueAddress, order?.locality, 'Lucknow, UP'].filter(Boolean).join(', ');
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;

  return (
    <div className="min-h-screen bg-neutral-100 py-8 px-4 sm:px-6 lg:px-8 animate-fadeIn">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Top Breadcrumb & Live Refresh Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-600 bg-white p-3.5 rounded-2xl shadow-xs border border-neutral-200">
          <div className="flex items-center gap-2">
            <Link to="/" className="text-[#7c3aed] font-semibold hover:underline">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
            <Link to="/catalogue" className="text-[#7c3aed] font-semibold hover:underline">Catalogue</Link>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
            <span className="font-bold text-neutral-800">Live Order & Delivery Tracker</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Live Polling Active (6s)
            </span>
            {lastUpdated && (
              <span className="text-[10px] text-neutral-400 hidden sm:inline">
                Synced: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={() => fetchOrder(currentId)}
              className="p-1 rounded-lg text-neutral-500 hover:text-[#7c3aed] hover:bg-neutral-100 transition"
              title="Refresh status now"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Order ID Lookup Bar */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-200">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value.toUpperCase())}
                placeholder="Enter Order or Ticket Reference ID (e.g. ENQ-748921)"
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm font-mono border border-neutral-300 rounded-xl focus:ring-2 focus:ring-[#7c3aed] outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !searchId.trim()}
              className="px-6 py-2.5 bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold text-xs sm:text-sm rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-xs"
            >
              <Truck className="w-4 h-4" />
              <span>Track Delivery</span>
            </button>
          </form>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-300 rounded-2xl text-rose-800 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <div className="text-xs">
              <p className="font-bold">Lookup Unsuccessful</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Initial Empty / Guide State */}
        {!order && !loading && !error && (
          <div className="bg-white p-12 rounded-2xl border border-neutral-200 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-purple-50 border border-purple-200 flex items-center justify-center mx-auto text-[#7c3aed]">
              <Package className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-serif font-bold text-neutral-800">
              Track Your Kandhari Tent House Rental
            </h2>
            <p className="text-xs text-neutral-600 max-w-md mx-auto leading-relaxed">
              Enter your booking reference ID from your quotation or inquiry message to inspect live admin approval, delivery driver assignment, vehicle registration, and venue dispatch status.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <Link
                to="/catalogue"
                className="px-4 py-2 bg-[#7c3aed] text-white text-xs font-bold rounded-xl hover:bg-[#6d28d9] transition"
              >
                Explore Catalogue
              </Link>
              <a
                href="tel:18008903456"
                className="px-4 py-2 border border-neutral-300 text-neutral-700 text-xs font-semibold rounded-xl hover:bg-neutral-50 transition"
              >
                Call Desk: 1800-890-3456
              </a>
            </div>
          </div>
        )}

        {/* Main Live Tracking Dashboard */}
        {order && (
          <div className="space-y-6">

            {/* Zomato-Style Live Banner */}
            <div className={`p-5 rounded-2xl border shadow-sm transition-all ${
              stageInfo.isRejected 
                ? 'bg-rose-50 border-rose-300 text-rose-900'
                : stageInfo.stage >= 3 
                  ? 'bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-800 text-white border-purple-700'
                  : stageInfo.isApproved
                    ? 'bg-gradient-to-r from-emerald-800 to-teal-800 text-white border-emerald-700'
                    : 'bg-amber-50 border-amber-300 text-amber-900'
            }`}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/20">
                      Order Reference: {order.id}
                    </span>
                    <span className="text-xs opacity-75">•</span>
                    <span className="text-xs font-semibold">
                      Event Date: {order.eventDate || order.startDate}
                    </span>
                  </div>

                  {/* Core Status Message according to user requirements */}
                  <h1 className="text-lg sm:text-xl font-serif font-bold tracking-tight">
                    {stageInfo.isRejected ? (
                      'Rental Order Could Not Be Accepted'
                    ) : stageInfo.stage === 5 ? (
                      'Equipment Delivered & Successfully Installed! 🎉'
                    ) : stageInfo.stage === 4 ? (
                      'Delivery Partner En Route to Your Venue 🚚'
                    ) : stageInfo.stage === 3 ? (
                      'Delivery Partner Assigned & Preparing Load 🚛'
                    ) : stageInfo.isApproved ? (
                      'Your rental order has been accepted and soon a delivery partner will be assigned to you shortly'
                    ) : (
                      'Rental Order Placed — Pending Admin Review & Approval'
                    )}
                  </h1>

                  <p className={`text-xs ${stageInfo.stage >= 2 && !stageInfo.isRejected ? 'text-white/80' : 'text-neutral-700'}`}>
                    {stageInfo.isRejected ? (
                      <span>Reason: {order.rejectionReason || 'Equipment unavailable on requested dates.'}</span>
                    ) : stageInfo.isApproved && stageInfo.stage < 3 ? (
                      <span>Operations dispatch desk has verified stock. Assigning our nearest vehicle (Kanpur Road / Transport Nagar hub).</span>
                    ) : stageInfo.stage >= 3 ? (
                      <span>{order.estimatedDeliveryTime || 'Scheduled for punctual delivery prior to celebration.'}</span>
                    ) : (
                      <span>Your order has been routed to Kandhari Tent House administration for item verification.</span>
                    )}
                  </p>
                </div>

                {/* 1-Click Ticket Action */}
                <button
                  type="button"
                  onClick={() => setIsTicketModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-white text-neutral-900 font-bold text-xs hover:bg-neutral-100 transition shadow-sm flex items-center gap-1.5 shrink-0"
                >
                  <FileText className="w-3.5 h-3.5 text-[#7c3aed]" />
                  <span>View Full Ticket</span>
                </button>
              </div>
            </div>

            {/* 5-Stage Stepper (Zomato-Like Delivery Progress) */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 space-y-4">
              <h2 className="text-xs font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#7c3aed]" />
                <span>Live Order & Dispatch Timeline</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
                
                {/* Step 1: Placed */}
                <div className="p-3 rounded-xl border border-emerald-300 bg-emerald-50/70 space-y-1">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>1. Placed</span>
                  </div>
                  <p className="text-[11px] text-neutral-600">Order received</p>
                </div>

                {/* Step 2: Admin Approval */}
                <div className={`p-3 rounded-xl border space-y-1 ${
                  stageInfo.isRejected 
                    ? 'border-rose-300 bg-rose-50 text-rose-800'
                    : stageInfo.stage >= 2 || stageInfo.isApproved
                      ? 'border-emerald-300 bg-emerald-50/70 text-emerald-800'
                      : 'border-neutral-200 bg-neutral-50 text-neutral-500'
                }`}>
                  <div className="flex items-center gap-2 font-bold text-xs">
                    {stageInfo.isRejected ? (
                      <XCircle className="w-4 h-4 text-rose-600" />
                    ) : stageInfo.stage >= 2 || stageInfo.isApproved ? (
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Clock className="w-4 h-4 text-neutral-400" />
                    )}
                    <span>2. Admin Review</span>
                  </div>
                  <p className="text-[11px] text-neutral-600">
                    {stageInfo.isRejected ? 'Rejected' : stageInfo.stage >= 2 || stageInfo.isApproved ? 'Approved by Admin' : 'Reviewing...'}
                  </p>
                </div>

                {/* Step 3: Partner Assigned */}
                <div className={`p-3 rounded-xl border space-y-1 ${
                  stageInfo.stage >= 3 
                    ? 'border-purple-300 bg-purple-50 text-purple-900 font-bold'
                    : 'border-neutral-200 bg-neutral-50 text-neutral-500'
                }`}>
                  <div className="flex items-center gap-2 font-bold text-xs">
                    {stageInfo.stage >= 3 ? (
                      <CheckCircle className="w-4 h-4 text-[#7c3aed]" />
                    ) : (
                      <Truck className="w-4 h-4 text-neutral-400" />
                    )}
                    <span>3. Partner Assigned</span>
                  </div>
                  <p className="text-[11px] text-neutral-600">
                    {stageInfo.stage >= 3 ? (order.deliveryPartner?.name || 'Driver Assigned') : 'Pending Fleet Assign'}
                  </p>
                </div>

                {/* Step 4: Out for Delivery */}
                <div className={`p-3 rounded-xl border space-y-1 ${
                  stageInfo.stage >= 4 
                    ? 'border-indigo-300 bg-indigo-50 text-indigo-900 font-bold'
                    : 'border-neutral-200 bg-neutral-50 text-neutral-500'
                }`}>
                  <div className="flex items-center gap-2 font-bold text-xs">
                    {stageInfo.stage >= 4 ? (
                      <CheckCircle className="w-4 h-4 text-indigo-600" />
                    ) : (
                      <Navigation className="w-4 h-4 text-neutral-400" />
                    )}
                    <span>4. En Route</span>
                  </div>
                  <p className="text-[11px] text-neutral-600">
                    {stageInfo.stage >= 4 ? 'En route to venue' : 'In Transit Queue'}
                  </p>
                </div>

                {/* Step 5: Delivered & Installed */}
                <div className={`p-3 rounded-xl border space-y-1 ${
                  stageInfo.stage === 5 
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-900 font-bold'
                    : 'border-neutral-200 bg-neutral-50 text-neutral-500'
                }`}>
                  <div className="flex items-center gap-2 font-bold text-xs">
                    {stageInfo.stage === 5 ? (
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <ShieldCheck className="w-4 h-4 text-neutral-400" />
                    )}
                    <span>5. Setup Done</span>
                  </div>
                  <p className="text-[11px] text-neutral-600">
                    {stageInfo.stage === 5 ? 'Verified on-site' : 'Pending On-Site Setup'}
                  </p>
                </div>

              </div>
            </div>

            {/* Delivery Partner Profile Card (when partner is assigned) */}
            {order.deliveryPartner && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border-2 border-purple-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#7c3aed]">
                    <Truck className="w-4 h-4" />
                    <span>Your Dedicated Delivery Partner & Fleet</span>
                  </div>
                  <span className="text-xs font-bold bg-purple-100 text-[#7c3aed] px-3 py-1 rounded-full border border-purple-200">
                    ★ {order.deliveryPartner.rating || '4.9'} Verified Driver
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                  
                  {/* Driver Name & Phone */}
                  <div className="space-y-1">
                    <p className="text-[11px] text-neutral-500 uppercase font-semibold">Driver in Charge</p>
                    <p className="text-base font-bold text-neutral-900">{order.deliveryPartner.name}</p>
                    <a
                      href={`tel:${order.deliveryPartner.phone?.replace(/\s+/g, '')}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-bold text-xs border border-emerald-300 transition mt-1"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Call Driver: {order.deliveryPartner.phone}</span>
                    </a>
                  </div>

                  {/* Vehicle details */}
                  <div className="space-y-1">
                    <p className="text-[11px] text-neutral-500 uppercase font-semibold">Assigned Fleet Vehicle</p>
                    <p className="text-sm font-bold text-neutral-900">{order.deliveryPartner.vehicleType}</p>
                    <p className="font-mono text-xs font-semibold text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded w-fit">
                      {order.deliveryPartner.vehicleNumber}
                    </p>
                  </div>

                  {/* Dispatch Hub */}
                  <div className="space-y-1">
                    <p className="text-[11px] text-neutral-500 uppercase font-semibold">Dispatched From</p>
                    <p className="text-xs font-medium text-neutral-800">
                      {order.deliveryPartner.baseHub || 'Kanpur Road Depot (Opp. Pillar 37)'}
                    </p>
                    <p className="text-[11px] text-neutral-500 mt-1">
                      Expected Arrival: <strong>{order.estimatedDeliveryTime || 'Punctual morning setup'}</strong>
                    </p>
                  </div>

                </div>
              </div>
            )}

            {/* Address & Navigation Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-800">
                  <MapPin className="w-4 h-4 text-[#7c3aed]" />
                  <span>Venue Address & Navigation</span>
                </div>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-purple-50 text-[#7c3aed] hover:bg-purple-100 text-xs font-bold transition border border-purple-200"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Open in Google Maps</span>
                  <ExternalLink className="w-3 h-3 ml-0.5" />
                </a>
              </div>

              <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 text-xs space-y-1.5 text-neutral-700">
                <p>
                  <span className="text-neutral-500">Locality in Lucknow:</span>{' '}
                  <strong className="text-neutral-900">{order.locality || 'Kanpur Road, Lucknow'}</strong>
                </p>
                <p>
                  <span className="text-neutral-500">Street / Venue Address:</span>{' '}
                  <span className="text-neutral-800">{order.eventVenueAddress || 'Dwarka Shri Lawn / Specified Venue'}</span>
                </p>
                {order.landmark && (
                  <p>
                    <span className="text-neutral-500">Landmark & Navigation Notes:</span>{' '}
                    <span className="text-neutral-800 font-medium">{order.landmark}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Itemized Bill with Subtotal, Cartage, Labour & GST */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#7c3aed]" />
                  <span>Item Cost Per Bill & Logistics Breakdown</span>
                </h3>
                <span className="text-xs text-neutral-500">
                  Duration: <strong>{order.rentalDays || 1} {order.rentalDays === 1 ? 'Day' : 'Days'}</strong>
                </span>
              </div>

              {/* Items List */}
              <div className="border border-neutral-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-100 text-neutral-600 uppercase text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3">Equipment / Item Description</th>
                      <th className="py-2.5 px-3 text-center">Qty</th>
                      <th className="py-2.5 px-3 text-right">Unit Rate</th>
                      <th className="py-2.5 px-3 text-right">Line Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {Array.isArray(order.items) && order.items.length > 0 ? (
                      order.items.map((it, idx) => (
                        <tr key={idx} className="hover:bg-neutral-50">
                          <td className="py-2 px-3 font-semibold text-neutral-800">
                            {it.name}
                            {it.dimensions && <span className="block text-[10px] text-neutral-500 font-normal">{it.dimensions}</span>}
                          </td>
                          <td className="py-2 px-3 text-center text-neutral-700 font-medium">
                            {it.quantity || 1}
                          </td>
                          <td className="py-2 px-3 text-right text-neutral-600">
                            ₹{(it.unitRate || it.ratePerSqFt || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="py-2 px-3 text-right font-bold text-neutral-900">
                            ₹{(it.lineTotal || ((it.unitRate || 0) * (it.quantity || 1)) || 0).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="py-4 text-center text-neutral-400">
                          Standard event service quotation
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Financial Breakdown Summary */}
              <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 space-y-2 text-xs">
                <div className="flex justify-between text-neutral-600">
                  <span>Equipment Item Subtotal:</span>
                  <span className="font-semibold text-neutral-800">₹{(order.subtotal || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Cartage (Delivery & Return Transit):</span>
                  <span className="font-semibold text-neutral-800">₹{(order.cartage || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Labour, Setup & Inspection Crew:</span>
                  <span className="font-semibold text-neutral-800">₹{(order.labour || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Goods & Services Tax (GST 18%):</span>
                  <span className="font-semibold text-neutral-800">
                    ₹{(order.gst || Math.round(((order.subtotal || 0) + (order.cartage || 0) + (order.labour || 0)) * 0.18)).toLocaleString('en-IN')}
                  </span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Discount Applied:</span>
                    <span>- ₹{order.discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-neutral-200 flex justify-between items-baseline font-bold text-sm">
                  <span className="text-neutral-900 font-serif">Total Bill Amount:</span>
                  <span className="text-base text-[#7c3aed]">₹{(order.grandTotal || 0).toLocaleString('en-IN')}</span>
                </div>
              </div>

            </div>

            {/* Support Desk Footer */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-[#7c3aed]">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-neutral-800">Need Immediate Assistance with this Delivery?</p>
                  <p className="text-neutral-500 text-[11px]">Direct Operations Desk on Kanpur Road, Lucknow</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href="tel:18008903456"
                  className="px-4 py-2 rounded-xl bg-neutral-900 text-white font-bold hover:bg-neutral-800 transition flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  <span>Call Toll-Free 1800-890-3456</span>
                </a>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* 1-Click Individual Ticket Modal */}
      <IndividualTicketModal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        ticket={order}
      />
    </div>
  );
};

export default OrderTrackingPage;