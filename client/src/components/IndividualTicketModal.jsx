import React, { useState, useEffect } from 'react';
import { 
  X, 
  Printer, 
  MapPin, 
  Calendar, 
  Phone, 
  User, 
  Truck, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink, 
  FileText, 
  Navigation,
  ShieldCheck,
  CreditCard,
  MessageCircle,
  Copy
} from 'lucide-react';
import { api } from '../services/api';

const getStatusBadge = (status = '') => {
  const s = status.toLowerCase();
  if (s.includes('reject')) {
    return { bg: 'bg-rose-100 text-rose-800 border-rose-300', text: 'Rejected' };
  }
  if (s.includes('delivered') || s.includes('completed')) {
    return { bg: 'bg-emerald-100 text-emerald-800 border-emerald-300', text: 'Delivered & Installed' };
  }
  if (s.includes('route') || s.includes('dispatch') || s.includes('out for delivery')) {
    return { bg: 'bg-indigo-100 text-indigo-800 border-indigo-300', text: 'Out for Delivery / En Route' };
  }
  if (s.includes('partner') || s.includes('assigned')) {
    return { bg: 'bg-purple-100 text-purple-800 border-purple-300', text: 'Delivery Partner Assigned' };
  }
  if (s.includes('approv')) {
    return { bg: 'bg-blue-100 text-blue-800 border-blue-300', text: 'Approved by Admin' };
  }
  return { bg: 'bg-amber-100 text-amber-800 border-amber-300', text: 'Pending Admin Approval' };
};

const IndividualTicketModal = ({ ticket, ticketId, isOpen, onClose, onTrackOrder }) => {
  const [data, setData] = useState(ticket || null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (ticket) {
      setData(ticket);
    } else if (ticketId && isOpen) {
      setLoading(true);
      api.trackOrder(ticketId)
        .then(res => {
          if (res.success && res.data) {
            setData(res.data);
          }
        })
        .catch(err => {
          console.error('Failed to load ticket:', err);
        })
        .finally(() => setLoading(false));
    }
  }, [ticket, ticketId, isOpen]);

  if (!isOpen) return null;

  const handleCopyId = () => {
    if (!data?.id) return;
    navigator.clipboard?.writeText(data.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const badge = getStatusBadge(data?.status || data?.deliveryStatus);
  const fullAddress = [data?.eventVenueAddress, data?.locality, 'Lucknow, Uttar Pradesh']
    .filter(Boolean)
    .join(', ');

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#240046] via-[#3c096c] to-[#7c3aed] text-white p-5 flex items-center justify-between border-b border-purple-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <FileText className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider text-amber-300 font-bold">Individual Ticket</span>
                <span className="text-xs text-white/60">•</span>
                <button 
                  onClick={handleCopyId}
                  className="font-mono text-xs bg-white/10 px-2 py-0.5 rounded text-white hover:bg-white/20 transition flex items-center gap-1"
                  title="Click to copy ticket reference"
                >
                  {data?.id || ticketId || 'TKT-PENDING'}
                  <Copy className="w-3 h-3 text-amber-300" />
                </button>
                {copied && <span className="text-[10px] text-emerald-300 font-bold">Copied!</span>}
              </div>
              <h2 className="text-lg font-serif font-bold text-white tracking-tight">
                {data?.serviceRequired || 'Rental Equipment & Event Logistics Ticket'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium border border-white/20 transition"
              title="Print Official Ticket / Receipt"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition"
              aria-label="Close ticket"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Status Bar */}
        <div className="bg-neutral-50 px-6 py-3 border-b border-neutral-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-600">Ticket Status:</span>
            <span className={`px-2.5 py-0.5 rounded-full border text-xs font-bold ${badge.bg}`}>
              {badge.text}
            </span>
          </div>

          <div className="flex items-center gap-4 text-neutral-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-neutral-400" />
              Event Date: <strong className="text-neutral-700">{data?.eventDate || data?.startDate || 'Not specified'}</strong>
            </span>
            {data?.createdAt && (
              <span className="hidden md:inline">
                Issued: {new Date(data.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {loading ? (
            <div className="py-16 text-center text-neutral-500 flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-3 border-[#7c3aed] border-t-transparent rounded-full animate-spin" />
              <p>Loading ticket records...</p>
            </div>
          ) : !data ? (
            <div className="py-12 text-center text-neutral-500">
              <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-2" />
              <p className="font-semibold text-neutral-700">Ticket records not found.</p>
              <p className="text-[11px] text-neutral-500 mt-1">Please confirm the reference ID or contact official support.</p>
            </div>
          ) : (
            <>
              {/* Rejection Alert if rejected */}
              {data.status === 'Rejected' && (
                <div className="p-4 bg-rose-50 border border-rose-300 rounded-xl text-rose-800 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-sm text-rose-900">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    <span>Order Rejected by Operations Desk</span>
                  </div>
                  <p className="text-xs">
                    <strong>Reason:</strong> {data.rejectionReason || 'Equipment or schedule constraint.'}
                  </p>
                  <p className="text-[11px] text-rose-700">
                    No charges have been levied. Please reach out to our toll-free desk for alternate dates.
                  </p>
                </div>
              )}

              {/* Grid 1: Customer Details & Venue */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Customer Information Card */}
                <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/60 space-y-2.5">
                  <div className="flex items-center gap-2 text-neutral-700 font-bold uppercase tracking-wider text-[11px] border-b border-neutral-200 pb-1.5">
                    <User className="w-3.5 h-3.5 text-[#7c3aed]" />
                    <span>Customer & Contact</span>
                  </div>
                  <div className="space-y-1 text-neutral-700">
                    <p><span className="text-neutral-500">Name:</span> <strong>{data.customerName || 'Guest User'}</strong></p>
                    <p><span className="text-neutral-500">Phone:</span> <strong>{data.phone || 'N/A'}</strong></p>
                    {data.whatsappNumber && (
                      <p><span className="text-neutral-500">WhatsApp:</span> {data.whatsappNumber}</p>
                    )}
                    {data.email && (
                      <p><span className="text-neutral-500">Email:</span> {data.email}</p>
                    )}
                  </div>
                </div>

                {/* Venue & Delivery Navigation Card */}
                <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/60 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-neutral-200 pb-1.5">
                    <div className="flex items-center gap-2 text-neutral-700 font-bold uppercase tracking-wider text-[11px]">
                      <MapPin className="w-3.5 h-3.5 text-[#7c3aed]" />
                      <span>Delivery Venue & Navigation</span>
                    </div>
                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-[#7c3aed] font-semibold flex items-center gap-1 hover:underline"
                    >
                      <Navigation className="w-3 h-3" />
                      <span>Google Maps</span>
                    </a>
                  </div>
                  <div className="space-y-1 text-neutral-700">
                    <p><span className="text-neutral-500">Locality:</span> <strong>{data.locality || 'Kanpur Road, Lucknow'}</strong></p>
                    <p><span className="text-neutral-500">Venue / Street:</span> {data.eventVenueAddress || 'Address on file'}</p>
                    {data.landmark && (
                      <p><span className="text-neutral-500">Landmark:</span> {data.landmark}</p>
                    )}
                  </div>
                </div>

              </div>

              {/* Delivery Partner Details (if assigned) */}
              {data.deliveryPartner && (
                <div className="p-4 rounded-xl border-2 border-purple-200 bg-purple-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-[#7c3aed] text-xs uppercase tracking-wider">
                      <Truck className="w-4 h-4 text-[#7c3aed]" />
                      <span>Assigned Delivery Fleet Partner</span>
                    </div>
                    <span className="text-[11px] font-bold bg-purple-200 text-purple-900 px-2 py-0.5 rounded-full">
                      ★ {data.deliveryPartner.rating || '4.9'} Star Rated
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-neutral-800">
                    <div>
                      <p className="text-[11px] text-neutral-500">Driver Name</p>
                      <p className="font-bold text-sm text-neutral-900">{data.deliveryPartner.name}</p>
                      <a 
                        href={`tel:${data.deliveryPartner.phone?.replace(/\s+/g, '')}`}
                        className="inline-flex items-center gap-1 text-[11px] text-[#7c3aed] font-bold hover:underline mt-0.5"
                      >
                        <Phone className="w-3 h-3" />
                        {data.deliveryPartner.phone}
                      </a>
                    </div>
                    <div>
                      <p className="text-[11px] text-neutral-500">Vehicle / Truck</p>
                      <p className="font-bold text-neutral-900">{data.deliveryPartner.vehicleType}</p>
                      <p className="font-mono text-xs font-semibold text-neutral-600">{data.deliveryPartner.vehicleNumber}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-neutral-500">Base Depot</p>
                      <p className="text-xs text-neutral-700">{data.deliveryPartner.baseHub || 'Kanpur Road Depot (Opp. Pillar 37)'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Itemized Line Items Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-neutral-800 uppercase tracking-wider text-[11px]">
                    Itemized Rental Equipment Bill
                  </span>
                  <span className="text-neutral-500 text-[11px]">
                    Duration: <strong>{data.rentalDays || 1} {data.rentalDays === 1 ? 'Day' : 'Days'}</strong>
                  </span>
                </div>

                <div className="border border-neutral-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-neutral-100 text-neutral-600 border-b border-neutral-200 text-[11px] uppercase">
                      <tr>
                        <th className="py-2.5 px-3">Item Description</th>
                        <th className="py-2.5 px-3 text-center">Qty</th>
                        <th className="py-2.5 px-3 text-right">Unit Rate</th>
                        <th className="py-2.5 px-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                      {Array.isArray(data.items) && data.items.length > 0 ? (
                        data.items.map((it, idx) => (
                          <tr key={idx} className="hover:bg-neutral-50">
                            <td className="py-2 px-3">
                              <p className="font-semibold text-neutral-800">{it.name}</p>
                              {it.dimensions && (
                                <p className="text-[10px] text-neutral-500">{it.dimensions}</p>
                              )}
                            </td>
                            <td className="py-2 px-3 text-center font-medium text-neutral-700">
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
                            General service enquiry / no itemized equipment selected
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Bill Breakdown Cards */}
                <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 space-y-2 mt-3">
                  <div className="flex justify-between text-neutral-600">
                    <span>Equipment Subtotal:</span>
                    <span className="font-semibold text-neutral-800">₹{(data.subtotal || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>Cartage & Transportation:</span>
                    <span className="font-semibold text-neutral-800">₹{(data.cartage || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>Labour, Loading & Installation:</span>
                    <span className="font-semibold text-neutral-800">₹{(data.labour || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>GST (18% Goods & Services Tax):</span>
                    <span className="font-semibold text-neutral-800">₹{(data.gst || Math.round(((data.subtotal || 0) + (data.cartage || 0) + (data.labour || 0)) * 0.18)).toLocaleString('en-IN')}</span>
                  </div>
                  {data.discount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Discount / Voucher Applied:</span>
                      <span>- ₹{data.discount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-neutral-200 flex justify-between items-baseline font-bold text-neutral-900 text-sm">
                    <span className="font-serif">Grand Total Payable:</span>
                    <span className="text-base text-[#7c3aed]">₹{(data.grandTotal || 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Dispatch Timeline Log */}
              {Array.isArray(data.deliveryTimeline) && data.deliveryTimeline.length > 0 && (
                <div className="space-y-2">
                  <span className="font-bold text-neutral-800 uppercase tracking-wider text-[11px]">
                    Audit & Dispatch Timeline
                  </span>
                  <div className="border border-neutral-200 rounded-xl p-3 bg-white space-y-2">
                    {data.deliveryTimeline.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                        <div className="flex-1">
                          <p className="font-bold text-neutral-800">{step.status}</p>
                          <p className="text-neutral-500 text-[11px]">{step.note}</p>
                        </div>
                        <span className="text-[10px] text-neutral-400 shrink-0">
                          {step.timestamp ? new Date(step.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Official Guarantee Badge */}
              <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-amber-700 shrink-0" />
                <p className="text-[11px] text-amber-900 leading-snug">
                  <strong>Official Kandhari Tent House Guarantee:</strong> Every item is audited for spotless fabric, sanitized seating, and structural integrity. Helpline: <strong>1800-890-3456</strong>.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-neutral-50 p-4 border-t border-neutral-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="text-neutral-500 flex items-center gap-2">
            <span>Toll-Free Desk:</span>
            <strong className="text-neutral-800">1800-890-3456</strong>
          </div>

          <div className="flex items-center gap-2">
            {onTrackOrder && data?.id && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onTrackOrder(data.id);
                }}
                className="px-4 py-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm"
              >
                <Truck className="w-4 h-4" />
                <span>Track Live (Zomato Flow)</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-neutral-300 hover:bg-neutral-100 text-neutral-700 font-semibold rounded-xl transition"
            >
              Close Ticket
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default IndividualTicketModal;