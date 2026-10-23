import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  ShoppingBag, 
  MapPin, 
  Image as ImageIcon, 
  LogOut, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Filter, 
  Phone,
  PhoneCall, 
  MessageCircle, 
  Calendar, 
  User, 
  Eye, 
  Save, 
  Download,
  Sparkles,
  Layers,
  ChevronDown,
  X,
  Share2,
  Clock,
  UtensilsCrossed,
  Flame,
  Tag,
  Check,
  Printer,
  FileText,
  Receipt,
  IndianRupee,
  PlusCircle,
  BarChart3,
  Users,
  DollarSign,
  ArrowUpRight,
  TrendingUp,
  CreditCard,
  Mic,
  MicOff,
  Wrench,
  ShieldAlert,
  ShieldCheck,
  ClipboardCheck,
  Truck,
  HardHat,
  Volume2,
  VolumeX,
  CheckCircle,
  LayoutDashboard,
  Video,
  Clapperboard,
  Settings,
  Brain,
  Bot,
  History,
  Workflow,
  Send,
  Play,
  Film,
  Building,
  Menu,
  ChevronRight,
  ExternalLink,
  Copy
} from 'lucide-react';
import { api } from '../services/api';
import VeronicaCallSimulatorModal from '../components/VeronicaCallSimulatorModal';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES, LUCKNOW_LOCALITIES, SERVICES_LIST } from '../data/seedItems';
import MasterAgentVoiceWidget from '../components/MasterAgentVoiceWidget';
import AdminAgentCopilot from '../components/AdminAgentCopilot';
import MasterAgentWorkspace from '../components/MasterAgentWorkspace';
import IndividualTicketModal from '../components/IndividualTicketModal';

const AdminDashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Navigation State - 11 Main Sections
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile drawer
  const [notification, setNotification] = useState(null);

  // Subtabs
  const [paymentSubtab, setPaymentSubtab] = useState('staff_wages'); // staff_wages, outside_payments
  const [inventorySubtab, setInventorySubtab] = useState('physical'); // physical, catalogue
  const [marketingSubtab, setMarketingSubtab] = useState('reels'); // reels, media, portfolios
  const [agentSubtab, setAgentSubtab] = useState('orchestration'); // orchestration, voice, memory, workflows

  // ==========================================
  // STATE DEFINITIONS
  // ==========================================

  // 1. Enquiries & Bookings
  const [enquiries, setEnquiries] = useState([]);
  const [enquiryStatusFilter, setEnquiryStatusFilter] = useState('all');
  const [enquirySearchQuery, setEnquirySearchQuery] = useState('');
  const [selectedOrderForQuote, setSelectedOrderForQuote] = useState(null);
  const [isQuoteEditModalOpen, setIsQuoteEditModalOpen] = useState(false);
  const [quoteFormData, setQuoteFormData] = useState({
    status: '',
    cartage: 0,
    labour: 0,
    discount: 0,
    manualAdjustment: 0,
    quotationNotes: '',
    lineItems: []
  });
  const [isBillPrintModalOpen, setIsBillPrintModalOpen] = useState(false);
  const [offlinePayModalOrder, setOfflinePayModalOrder] = useState(null);
  const [offlinePayForm, setOfflinePayForm] = useState({
    amount: 0,
    paymentMethod: 'Cash',
    referenceNumber: '',
    notes: ''
  });
  const [rejectionModalOrder, setRejectionModalOrder] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // 2. Customers
  const [customers, setCustomers] = useState([]);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
  const [newCustomerForm, setNewCustomerForm] = useState({ name: '', phone: '', email: '', notes: '' });

  // 3. Physical Inventory & Rental Items
  const [physicalInventory, setPhysicalInventory] = useState([]);
  const [physicalInventoryLogs, setPhysicalInventoryLogs] = useState([]);
  const [inventorySearchQuery, setInventorySearchQuery] = useState('');
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [stockModalItem, setStockModalItem] = useState(null);
  const [stockAdjustmentForm, setStockAdjustmentForm] = useState({
    actionType: 'restock',
    quantity: 10,
    reason: 'Purchase',
    notes: ''
  });
  const [rentalItems, setRentalItems] = useState([]);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemFormData, setItemFormData] = useState({
    name: '',
    category: 'Chairs & Seating',
    description: '',
    pricePerDay: 50,
    availableQuantity: 50,
    availabilityStatus: 'Available',
    imageUrl: '/media/seating/seating-1.jpg',
    featured: false
  });

  // 4. Staff & Attendance
  const [staffList, setStaffList] = useState([]);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [wageSummary, setWageSummary] = useState(null);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingStaffMember, setEditingStaffMember] = useState(null);
  const [staffFormData, setStaffFormData] = useState({
    name: '',
    phone: '',
    role: 'Labourer',
    dailyWage: 500,
    emergencyContact: '',
    address: '',
    notes: ''
  });
  const [isDisbursementModalOpen, setIsDisbursementModalOpen] = useState(false);
  const [disbursementFormData, setDisbursementFormData] = useState({
    staffId: '',
    staffName: '',
    amount: 500,
    paymentMethod: 'Cash',
    referenceNumber: '',
    notes: ''
  });
  const [wageDisbursements, setWageDisbursements] = useState([]);

  // 4.1 Daya 1..31 Attendance Grid, Advances & Payroll State
  const [staffSubtab, setStaffSubtab] = useState('register'); // 'register', 'advances', 'payroll', 'roster'
  const [gridYear, setGridYear] = useState(new Date().getFullYear());
  const [gridMonth, setGridMonth] = useState(new Date().getMonth() + 1);
  const [gridData, setGridData] = useState(null);
  const [advancesList, setAdvancesList] = useState([]);
  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);
  const [advanceFormData, setAdvanceFormData] = useState({
    staffId: '',
    amount: 500,
    date: new Date().toISOString().split('T')[0],
    notes: 'Staff cash advance'
  });
  const [payrollData, setPayrollData] = useState(null);

  // 4.2 Promo Coupons & Telephony Simulator
  const [couponsList, setCouponsList] = useState([]);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [couponFormData, setCouponFormData] = useState({
    code: '',
    discountType: 'fixed',
    discountValue: 100,
    minOrderValue: 2000,
    description: '',
    active: true,
    expiryDate: '2026-12-31'
  });
  const [telephonyConfig, setTelephonyConfig] = useState(null);
  const [isSimulatingCall, setIsSimulatingCall] = useState(false);

  // 5. Outside Payments (Dhobi, Suppliers)
  const [outsidePayments, setOutsidePayments] = useState([]);
  const [outsideCategoryFilter, setOutsideCategoryFilter] = useState('all');
  const [isOutsidePaymentModalOpen, setIsOutsidePaymentModalOpen] = useState(false);
  const [outsidePaymentForm, setOutsidePaymentForm] = useState({
    recipientName: '',
    category: 'dhobi',
    amount: '',
    purpose: '',
    paymentMethod: 'Cash',
    referenceNumber: '',
    notes: ''
  });

  // 6. Invoices & Commercial Bills
  const [invoices, setInvoices] = useState([]);
  const [isGenerateInvoiceModalOpen, setIsGenerateInvoiceModalOpen] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState({
    customerName: '',
    phone: '',
    billingAddress: '',
    eventDate: new Date().toISOString().split('T')[0],
    eventVenue: 'Dwarka Shri Lawn, Kanpur Road, Lucknow',
    serviceRequired: 'Wedding Setup & Catering',
    subtotal: 50000,
    cartage: 2000,
    labour: 3000,
    discount: 2000,
    advancePaid: 20000,
    notes: 'Official bill of Kandhari Tent & Caterers'
  });
  const [viewingInvoice, setViewingInvoice] = useState(null);

  // 7. Marketing Studio & FFmpeg Reels
  const [marketingMedia, setMarketingMedia] = useState([]);
  const [mediaCategoryFilter, setMediaCategoryFilter] = useState('all');
  const [portfolios, setPortfolios] = useState([]);
  const [renderedReels, setRenderedReels] = useState([]);
  const [lawnReels, setLawnReels] = useState([]);
  const [isRenderingReel, setIsRenderingReel] = useState(false);
  const [reelFormData, setReelFormData] = useState({
    title: 'Royal Wedding Setup at Dwarka Shri Lawn',
    format: '9:16',
    duration: 15,
    theme: 'Royal Luxury'
  });
  const [activePreviewVideo, setActivePreviewVideo] = useState(null);
  const [isCreatePortfolioModalOpen, setIsCreatePortfolioModalOpen] = useState(false);
  const [portfolioForm, setPortfolioForm] = useState({
    title: '',
    subtitle: '',
    category: 'Weddings',
    eventDate: new Date().toISOString().split('T')[0],
    description: '',
    selectedMediaIds: []
  });

  // 8. Master Agent Memory & Workflows
  const [agentMemories, setAgentMemories] = useState([]);
  const [agentWorkflows, setAgentWorkflows] = useState([]);
  const [isAddMemoryModalOpen, setIsAddMemoryModalOpen] = useState(false);
  const [memoryForm, setMemoryForm] = useState({
    category: 'pricing_rule',
    type: 'business_preference',
    content: ''
  });

  // 9. Analytics & Venue
  const [analyticsSummary, setAnalyticsSummary] = useState(null);
  const [venue, setVenue] = useState(null);
  const [isVeronicaModalOpen, setIsVeronicaModalOpen] = useState(false);
  const [receptionistCalls, setReceptionistCalls] = useState([]);
  const [receptionistAppointments, setReceptionistAppointments] = useState([]);
  const [receptionistTickets, setReceptionistTickets] = useState([]);
  const [receptionistCallbacks, setReceptionistCallbacks] = useState([]);
  const [businessSettings, setBusinessSettings] = useState(null);
  const [viewingTranscriptCall, setViewingTranscriptCall] = useState(null);
  const [receptionistActiveSubTab, setReceptionistActiveSubTab] = useState('calls');

  // 10. Delivery Fleet & Logistics (Zomato-like workflow)
  const [deliveryPartners, setDeliveryPartners] = useState([]);
  const [deliveryLoading, setDeliveryLoading] = useState(false);
  const [isAddPartnerModalOpen, setIsAddPartnerModalOpen] = useState(false);
  const [newPartnerForm, setNewPartnerForm] = useState({
    name: '',
    phone: '',
    vehicleType: 'Tata Ace Gold / Utility Truck',
    vehicleNumber: '',
    maxLoadCapacity: '1.0 Tonne',
    baseHub: 'Kanpur Road Depot (Opp. Pillar 37)',
    status: 'Available'
  });
  const [assignPartnerModalOrder, setAssignPartnerModalOrder] = useState(null);
  const [selectedPartnerIdForAssign, setSelectedPartnerIdForAssign] = useState('');
  const [estimatedDeliveryTimeInput, setEstimatedDeliveryTimeInput] = useState('');

  // Location Detection & Embedded Map View Modal State
  const [locationModalEnquiry, setLocationModalEnquiry] = useState(null);
  const [locationModalData, setLocationModalData] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [lastApprovedWhatsAppLink, setLastApprovedWhatsAppLink] = useState(null);

  // 1-Click Individual Ticket Modal State
  const [selectedTicketForModal, setSelectedTicketForModal] = useState(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  // Show Toast Notification
  const showToast = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Initial Data Fetch
  const loadAllData = async () => {
    try {
      const [
        enqRes,
        custRes,
        itemsRes,
        physRes,
        physLogsRes,
        staffRes,
        attRes,
        wageSumRes,
        disbRes,
        outsideRes,
        invRes,
        mediaRes,
        portRes,
        reelsRes,
        lawnReelsRes,
        memRes,
        wfRes,
        anaRes,
        venRes,
        recCallsRes,
        recAptsRes,
        recTcksRes,
        recCbksRes,
        settingsRes,
        deliveryRes
      ] = await Promise.all([
        api.getEnquiries().catch(() => ({ data: [] })),
        api.getCustomers().catch(() => ({ data: [] })),
        api.getItems().catch(() => ({ data: [] })),
        api.getPhysicalInventory().catch(() => ({ data: [] })),
        api.getInventoryLogs().catch(() => ({ data: [] })),
        api.getStaffList().catch(() => ({ data: [] })),
        api.getAttendance({ date: attendanceDate }).catch(() => ({ data: [] })),
        api.getWageSummary({ date: attendanceDate }).catch(() => ({ data: { totalWage: 0 } })),
        api.getWageDisbursements().catch(() => ({ data: [] })),
        api.getOutsidePayments().catch(() => ({ data: [] })),
        api.getInvoices().catch(() => ({ data: [] })),
        api.searchMarketingMedia().catch(() => ({ data: [] })),
        api.getMarketingPortfolios().catch(() => ({ data: [] })),
        api.getRenderedReels().catch(() => ({ data: [] })),
        api.getLawnReels().catch(() => ({ data: [] })), // 7 Lawn Reels
        api.getAgentMemories().catch(() => ({ data: [] })),
        api.getAgentWorkflows().catch(() => ({ data: [] })),
        api.getAnalyticsSummary().catch(() => ({ data: null })),
        api.getVenue().catch(() => ({ data: null })),
        api.getReceptionistCalls().catch(() => ({ data: [] })),
        api.getReceptionistAppointments().catch(() => ({ data: [] })),
        api.getReceptionistTickets().catch(() => ({ data: [] })),
        api.getReceptionistCallbacks().catch(() => ({ data: [] })),
        api.getSettings().catch(() => ({ data: null })),
        api.getDeliveryPartners().catch(() => ({ data: [] }))
      ]);

      setEnquiries(enqRes.data || []);
      setDeliveryPartners(deliveryRes?.data || []);
      setCustomers(custRes.data || []);
      setRentalItems(itemsRes.data || []);
      setPhysicalInventory(physRes.data || []);
      setPhysicalInventoryLogs(physLogsRes.data || []);
      setStaffList(staffRes.data || []);
      setAttendanceRecords(attRes.data || []);
      setWageSummary(wageSumRes.data || null);
      setWageDisbursements(disbRes.data || []);
      setOutsidePayments(outsideRes.data || []);
      setInvoices(invRes.data || []);
      setMarketingMedia(mediaRes.data || []);
      setPortfolios(portRes.data || []);
      setRenderedReels(reelsRes.data || []);
      setLawnReels(lawnReelsRes.data || []);
      setAgentMemories(memRes.data || []);
      setAgentWorkflows(wfRes.data || []);
      setAnalyticsSummary(anaRes.data || anaRes.summary || null);
      setVenue(venRes.data || null);

      // Load Grid & Advances
      try {
        const [gRes, advRes, payRes, cpnRes, telRes] = await Promise.all([
          api.getAttendanceGrid({ year: gridYear, month: gridMonth }),
          api.getAdvances(),
          api.getPayroll(),
          api.getCoupons(),
          api.getTelephonyConfig()
        ]);
        if (gRes.success) setGridData(gRes);
        if (advRes.success) setAdvancesList(advRes.data || []);
        if (payRes.success) setPayrollData(payRes);
        if (cpnRes.success) setCouponsList(cpnRes.data || []);
        if (telRes.success) setTelephonyConfig(telRes.data || null);
      } catch (e) {
        console.warn('Additional staff/coupon data load error:', e);
      }
    } catch (err) {
      console.error('Error loading admin data:', err);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [attendanceDate]);

  
  // Grid Attendance Cell Click Toggle: P -> 1/2 -> A -> -
  const handleToggleGridCell = async (staffId, dayNumber) => {
    if (!gridData) return;
    const monthStr = gridMonth.toString().padStart(2, '0');
    const dayStr = dayNumber.toString().padStart(2, '0');
    const targetDate = `${gridYear}-${monthStr}-${dayStr}`;

    const emp = (gridData.grid || []).find(e => e.staffId === staffId);
    const currentMark = emp?.days ? emp.days[dayNumber] : '-';

    let nextStatus = 'Present';
    if (currentMark === 'P') nextStatus = 'Half-day';
    else if (currentMark === '1/2') nextStatus = 'Absent';
    else if (currentMark === 'A') nextStatus = 'Present';
    else nextStatus = 'Present';

    try {
      await api.recordAttendance({
        staffId,
        date: targetDate,
        status: nextStatus
      });
      // Refresh grid
      const gRes = await api.getAttendanceGrid({ year: gridYear, month: gridMonth });
      if (gRes.success) setGridData(gRes);
    } catch (e) {
      showToast('Error updating attendance mark', 'error');
    }
  };

  const handleRecordAdvanceSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.recordAdvance(advanceFormData);
      showToast(`Advance recorded: ₹${advanceFormData.amount}`);
      setIsAdvanceModalOpen(false);
      setAdvanceFormData({ staffId: '', amount: 500, date: new Date().toISOString().split('T')[0], notes: 'Staff cash advance' });
      loadAllData();
    } catch (err) {
      showToast(err.message || 'Failed to record advance', 'error');
    }
  };

  const handleDeleteAdvance = async (id) => {
    if (!window.confirm('Are you sure you want to delete this advance entry?')) return;
    try {
      await api.deleteAdvance(id);
      showToast('Advance entry removed');
      loadAllData();
    } catch (err) {
      showToast(err.message || 'Failed to delete advance', 'error');
    }
  };

  const handleFinalizePayrollSubmit = async () => {
    const monthStr = gridMonth.toString().padStart(2, '0');
    const daysInMonth = new Date(gridYear, gridMonth, 0).getDate();
    const periodStart = `${gridYear}-${monthStr}-01`;
    const periodEnd = `${gridYear}-${monthStr}-${daysInMonth.toString().padStart(2, '0')}`;

    try {
      const res = await api.finalizePayroll({
        periodStart,
        periodEnd,
        notes: `Finalized monthly payroll for ${monthStr}/${gridYear}`
      });
      showToast(`Payroll finalized successfully! Net: ₹${res.data?.totalNet?.toLocaleString('en-IN')}`);
      loadAllData();
    } catch (err) {
      showToast(err.message || 'Failed to finalize payroll', 'error');
    }
  };

  const handleCreateCouponSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createCoupon(couponFormData);
      showToast(`Coupon ${couponFormData.code} created`);
      setIsCouponModalOpen(false);
      setCouponFormData({ code: '', discountType: 'fixed', discountValue: 100, minOrderValue: 2000, description: 'Promotional discount' });
      loadAllData();
    } catch (err) {
      showToast(err.message || 'Failed to create coupon', 'error');
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;
    try {
      await api.deleteCoupon(id);
      showToast('Coupon deleted');
      loadAllData();
    } catch (err) {
      showToast('Failed to delete coupon', 'error');
    }
  };

  const handleTriggerSimulateCall = async () => {
    setIsSimulatingCall(true);
    try {
      const res = await api.simulateIncomingCall({
        callerPhone: '+91 98765 43210',
        callerName: 'Telecom Walkthrough Caller',
        userMessages: [
          'Hello, I want to book Dwarka Shri Lawn for a wedding on 28 November 2026',
          'We expect around 500 guests and need royal stage decor and catering',
          'Please schedule an appointment for me to visit the lawn next Monday'
        ]
      });
      showToast(`Simulated call verified! Ref: ${res.callId}`);
      loadAllData();
    } catch (err) {
      showToast('Simulation failed', 'error');
    } finally {
      setIsSimulatingCall(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  // CSV Export
  const handleExportCSV = async () => {
    try {
      const blob = await api.exportReportCSV();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kandhari-business-report-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      showToast('CSV export downloaded successfully!');
    } catch (e) {
      showToast('Failed to export CSV', 'error');
    }
  };

  // Quick Action Handlers
  const handleApproveQuotation = async (orderId) => {
    try {
      await api.reviewEnquiry(orderId, { action: 'approve' });
      showToast('Booking approved! Customer alerted with Zomato acceptance status.');
      loadAllData();
    } catch (e) {
      try {
        await api.updateEnquiryStatus(orderId, { status: 'Approved — Awaiting Payment' });
        showToast('Booking approved! Advance payment unlocked for customer.');
        loadAllData();
      } catch (err2) {
        showToast(e.message || 'Failed to approve', 'error');
      }
    }
  };

  const handleRejectQuotation = async (orderId) => {
    const reason = window.prompt('Please enter the reason for rejecting this rental request:');
    if (!reason || !reason.trim()) return;
    try {
      await api.reviewEnquiry(orderId, { action: 'reject', rejectionReason: reason.trim() });
      showToast('Rental request rejected. Customer notified.');
      loadAllData();
    } catch (e) {
      showToast(e.message || 'Failed to reject request', 'error');
    }
  };

  const handleCreatePartner = async (e) => {
    e.preventDefault();
    if (!newPartnerForm.name.trim() || !newPartnerForm.phone.trim() || !newPartnerForm.vehicleNumber.trim()) {
      showToast('Driver name, phone, and vehicle registration are required.', 'error');
      return;
    }
    try {
      const res = await api.createDeliveryPartner(newPartnerForm);
      if (res.success) {
        showToast(res.message || 'Delivery partner added to fleet!');
        setIsAddPartnerModalOpen(false);
        setNewPartnerForm({
          name: '',
          phone: '',
          vehicleType: 'Tata Ace Gold / Utility Truck',
          vehicleNumber: '',
          maxLoadCapacity: '1.0 Tonne',
          baseHub: 'Kanpur Road Depot (Opp. Pillar 37)',
          status: 'Available'
        });
        loadAllData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to create partner', 'error');
    }
  };

  const handleDeletePartner = async (partnerId) => {
    if (!window.confirm('Are you sure you want to remove this delivery driver from the fleet?')) return;
    try {
      const res = await api.deleteDeliveryPartner(partnerId);
      if (res.success) {
        showToast('Delivery partner removed from fleet.');
        loadAllData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to remove partner', 'error');
    }
  };

  const handleOpenLocationModal = async (enquiry) => {
    setLocationModalEnquiry(enquiry);
    setLocationLoading(true);
    try {
      const res = await api.getEnquiryRouteInfo(enquiry.id);
      if (res && res.success && res.locationInfo) {
        setLocationModalData(res.locationInfo);
      } else {
        setLocationModalData(enquiry.locationInfo || null);
      }
    } catch (err) {
      setLocationModalData(enquiry.locationInfo || null);
    } finally {
      setLocationLoading(false);
    }
  };

  const handleConnectDriverRequest = async () => {
    if (!assignPartnerModalOrder || !selectedPartnerIdForAssign) {
      showToast('Please select a driver from the fleet', 'error');
      return;
    }
    try {
      const res = await api.connectDriverRequest({
        enquiryId: assignPartnerModalOrder.id,
        partnerId: selectedPartnerIdForAssign,
        quotedDeliveryTime: estimatedDeliveryTimeInput || 'Punctual morning setup on event date'
      });
      if (res.success) {
        showToast(res.message || 'Driver connection request sent!');
        loadAllData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to connect driver', 'error');
    }
  };

  const handleDriverApproveSubmit = async (actionType = 'accept') => {
    if (!assignPartnerModalOrder) return;
    if (actionType === 'reject') {
      const reason = window.prompt('Please enter rejection reason:', 'Vehicles booked / Capacity unavailable');
      if (reason === null) return;
      try {
        const res = await api.driverApproveOrder({
          enquiryId: assignPartnerModalOrder.id,
          action: 'reject',
          rejectionReason: reason
        });
        showToast(res.message || 'Order rejected.');
        setAssignPartnerModalOrder(null);
        loadAllData();
      } catch (err) {
        showToast(err.message || 'Failed to reject order', 'error');
      }
      return;
    }

    if (!selectedPartnerIdForAssign) {
      showToast('Please select an available fleet driver', 'error');
      return;
    }

    try {
      const res = await api.driverApproveOrder({
        enquiryId: assignPartnerModalOrder.id,
        partnerId: selectedPartnerIdForAssign,
        quotedDeliveryTime: estimatedDeliveryTimeInput || 'Punctual morning setup on event date',
        action: 'accept'
      });
      if (res.success) {
        showToast(res.message || 'Order accepted and driver assigned!');
        if (res.customerWhatsAppLink) {
          setLastApprovedWhatsAppLink({
            link: res.customerWhatsAppLink,
            customerName: assignPartnerModalOrder.customerName,
            orderId: assignPartnerModalOrder.id
          });
        }
        setAssignPartnerModalOrder(null);
        setSelectedPartnerIdForAssign('');
        setEstimatedDeliveryTimeInput('');
        loadAllData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to accept order and assign driver', 'error');
    }
  };

  const handleAssignPartnerSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    await handleDriverApproveSubmit('accept');
  };

  const handleUpdateDeliveryDispatch = async (enquiryId, status, note = '') => {
    try {
      const res = await api.updateOrderDeliveryStatus({
        enquiryId,
        status,
        note
      });
      if (res.success) {
        showToast(`Delivery status updated to: ${status}`);
        loadAllData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update delivery status', 'error');
    }
  };

  const handleRecordOutsidePayment = async (e) => {
    e.preventDefault();
    try {
      await api.recordOutsidePayment(outsidePaymentForm);
      showToast(`Payment recorded: ₹${outsidePaymentForm.amount} to ${outsidePaymentForm.recipientName}`);
      setIsOutsidePaymentModalOpen(false);
      setOutsidePaymentForm({
        recipientName: '',
        category: 'dhobi',
        amount: '',
        purpose: '',
        paymentMethod: 'Cash',
        referenceNumber: '',
        notes: ''
      });
      loadAllData();
    } catch (err) {
      showToast(err.message || 'Failed to record payment', 'error');
    }
  };

  const handleGenerateInvoice = async (e) => {
    e.preventDefault();
    try {
      const res = await api.generateInvoice(invoiceForm);
      showToast(`Invoice generated: ${res.data?.invoiceNumber || 'INV'}`);
      setIsGenerateInvoiceModalOpen(false);
      loadAllData();
    } catch (err) {
      showToast(err.message || 'Failed to generate invoice', 'error');
    }
  };

  const handleRenderReel = async (e) => {
    e.preventDefault();
    setIsRenderingReel(true);
    try {
      const res = await api.renderMarketingReel(reelFormData);
      showToast('🎬 FFmpeg Reel rendered successfully!');
      loadAllData();
      if (res.data?.videoUrl) {
        setActivePreviewVideo(res.data);
      }
    } catch (err) {
      showToast(err.message || 'Reel rendering failed', 'error');
    } finally {
      setIsRenderingReel(false);
    }
  };

  const handleStockAdjustSubmit = async (e) => {
    e.preventDefault();
    if (!stockModalItem) return;
    try {
      await api.adjustInventory({
        itemId: stockModalItem.id,
        actionType: stockAdjustmentForm.actionType,
        quantity: parseInt(stockAdjustmentForm.quantity, 10),
        reason: stockAdjustmentForm.reason,
        notes: stockAdjustmentForm.notes
      });
      showToast(`Stock updated: ${stockModalItem.name}`);
      setIsStockModalOpen(false);
      loadAllData();
    } catch (err) {
      showToast(err.message || 'Stock adjustment failed', 'error');
    }
  };

  const handleSaveStaffMember = async (e) => {
    e.preventDefault();
    try {
      if (editingStaffMember) {
        await api.updateStaff(editingStaffMember.id, staffFormData);
        showToast('Staff member details updated successfully');
      } else {
        await api.createStaff(staffFormData);
        showToast('New staff member added successfully');
      }
      setIsStaffModalOpen(false);
      setEditingStaffMember(null);
      loadAllData();
    } catch (err) {
      showToast(err.message || 'Failed to save staff member', 'error');
    }
  };

  const handleAttendanceMark = async (staffId, status) => {
    try {
      await api.markAttendance({
        staffId,
        date: attendanceDate,
        status,
        notes: 'Marked from Attendance Roster'
      });
      showToast(`Attendance recorded: ${status}`);
      loadAllData();
    } catch (err) {
      showToast(err.message || 'Error recording attendance', 'error');
    }
  };

  const handleRecordDisbursement = async (e) => {
    e.preventDefault();
    try {
      await api.recordWageDisbursement({
        staffId: disbursementFormData.staffId,
        date: attendanceDate,
        amount: parseFloat(disbursementFormData.amount),
        paymentMethod: disbursementFormData.paymentMethod,
        referenceNumber: disbursementFormData.referenceNumber,
        notes: disbursementFormData.notes
      });
      showToast('Wage payment receipt recorded successfully');
      setIsDisbursementModalOpen(false);
      loadAllData();
    } catch (err) {
      showToast(err.message || 'Error recording payment', 'error');
    }
  };

  const handleToggleMemoryApproval = async (mem) => {
    try {
      const nextStatus = mem.approvalStatus === 'approved' ? 'pending_review' : 'approved';
      await api.updateAgentMemory(mem.id, { approvalStatus: nextStatus });
      showToast(`Rule status: ${nextStatus}`);
      loadAllData();
    } catch (err) {
      showToast('Failed to update rule', 'error');
    }
  };

  const handleDeleteMemory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this business rule?')) return;
    try {
      await api.deleteAgentMemory(id);
      showToast('Business rule deleted successfully');
      loadAllData();
    } catch (err) {
      showToast('Failed to delete rule', 'error');
    }
  };

  // Nav Items Definition
  const navItems = [
    { id: 'dashboard', label: 'Overview & Dashboard', icon: LayoutDashboard, badge: enquiries.filter(e => e.status === 'New').length },
    { id: 'receptionist', label: 'Receptionist Operations (Veronica)', icon: PhoneCall, highlight: true, badge: receptionistAppointments.length ? `${receptionistAppointments.length} Visits` : null },
    { id: 'staff', label: 'Workforce & Attendance', icon: Users, badge: staffList.length },
    { id: 'payments', label: 'Wages & Expenses', icon: IndianRupee },
    { id: 'customers', label: 'Customers & CRM', icon: MessageCircle, badge: customers.length },
    { id: 'bookings', label: 'Quotes & Inquiries', icon: ShoppingBag, badge: enquiries.length },
    { id: 'delivery', label: 'Delivery Fleet & Logistics', icon: Truck, badge: deliveryPartners.length ? `${deliveryPartners.length} Fleet` : null },
    { id: 'inventory', label: 'Rental Inventory', icon: Package, badge: physicalInventory.filter(i => (i.damagedQuantity || 0) > 0).length ? 'Repair' : null },
    { id: 'analytics', label: 'Visitor Analytics', icon: BarChart3 },
    { id: 'admin_copilot', label: 'Admin Agent Copilot', icon: Bot, highlight: true },
    { id: 'agent', label: 'Master Agent Supervision', icon: Brain, highlight: true },
    { id: 'marketing', label: 'Marketing & Reel Studio', icon: Clapperboard, highlight: true },
    { id: 'invoices', label: 'Invoices & Billing', icon: FileText, badge: invoices.length },
    { id: 'settings', label: 'Venue & Business Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 flex flex-col md:flex-row antialiased">
      
      {/* ========================================================
          DESKTOP & MOBILE SIDEBAR NAVIGATION
         ======================================================== */}
      {/* Mobile Top Header */}
      <div className="md:hidden bg-neutral-950 border-b border-neutral-800 p-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl bg-neutral-800 text-neutral-200 hover:text-white"
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-serif font-black text-sm text-white">Kandhari Tent Admin</h1>
            <p className="text-[10px] text-brand-gold">Dwarka Shri Lawn, Lucknow</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setActiveTab('agent'); setSidebarOpen(false); }}
            className="p-2 rounded-xl bg-amber-400 text-neutral-950 font-bold text-xs flex items-center gap-1 shadow-sm"
          >
            <Mic className="w-4 h-4 animate-pulse" />
            <span>AI</span>
          </button>
          <button onClick={handleLogout} className="p-2 rounded-xl bg-neutral-800 text-neutral-400 hover:text-rose-400">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sidebar Container */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-neutral-950 border-r border-neutral-800 flex flex-col transition-transform duration-300 md:static md:translate-x-0 ${
        sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
      }`}>
        {/* Brand Header */}
        <div className="p-5 border-b border-neutral-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl royal-gradient text-brand-gold border border-brand-gold/40 flex items-center justify-center font-serif font-black text-xl shadow-md">
              K
            </div>
            <div>
              <h2 className="font-serif font-bold text-base text-white">Kandhari &amp; Sons</h2>
              <p className="text-[10px] text-brand-gold">Master Business Operating System</p>
            </div>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-neutral-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Admin Operator Banner - Mother Friendly */}
        <div className="px-5 py-3 bg-neutral-900/60 border-b border-neutral-800/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-neutral-300">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Administrator: <strong className="text-white">{user?.username || 'Executive Admin'}</strong></span>
          </div>
          <button 
            onClick={handleExportCSV}
            title="Download CSV for Excel"
            className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
          >
            <Download className="w-3 h-3" />
            <span>CSV</span>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto scrollbar-none text-xs font-semibold">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full px-3.5 py-3 rounded-2xl flex items-center justify-between transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-brand-primary to-brand-primaryDark text-white shadow-md border border-brand-gold/30 font-bold'
                    : item.highlight
                    ? 'bg-amber-400/10 text-amber-300 hover:bg-amber-400/20 border border-amber-400/20 font-bold'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/90'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-brand-gold' : item.highlight ? 'text-amber-400' : 'text-neutral-400'}`} />
                  <span className="text-left text-xs">{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge !== null && item.badge > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    item.badge === 'Repair' ? 'bg-amber-500 text-neutral-950' : 'bg-rose-500 text-white'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between text-xs">
          <div className="text-[10px] text-neutral-500">
            <p>Dwarka Shri Lawn, Lucknow</p>
            <p>Helpline: 1800-890-3456</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-rose-950/40 text-neutral-300 hover:text-rose-300 border border-neutral-800 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ========================================================
          MAIN CONTENT AREA
         ======================================================== */}
      <main className="flex-1 bg-neutral-900 min-h-screen overflow-y-auto">
        
        {/* Notification Toast */}
        {notification && (
          <div className="fixed top-5 right-5 z-50 animate-bounce">
            <div className={`px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-xl border ${
              notification.type === 'error'
                ? 'bg-rose-950/90 text-rose-200 border-rose-700'
                : 'bg-emerald-950/90 text-emerald-200 border-emerald-700'
            }`}>
              {notification.type === 'error' ? <AlertCircle className="w-4 h-4 text-rose-400" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              <span>{notification.msg}</span>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">

          {/* ========================================================
              SECTION 1: DASHBOARD OVERVIEW & URGENT TASKS
             ======================================================== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Daily Urgent Alert Banner */}
              <div className="bg-gradient-to-r from-amber-500/20 via-neutral-900 to-brand-primary/20 p-5 rounded-3xl border border-amber-500/30 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Daily Urgent Action Items</span>
                  </div>
                  <h2 className="text-lg font-serif font-bold text-white">
                    {attendanceRecords.length === 0 ? "⚠️ Today's attendance has not been recorded yet." : `✅ Today ${attendanceRecords.filter(a => a.status === 'Present').length} workers present on duty today.`}
                  </h2>
                  <p className="text-xs text-neutral-300">
                    Pending Inquiries: <strong>{enquiries.filter(e => e.status === 'Pending Admin Approval' || e.status === 'New').length}</strong> &bull; Items Needing Repair: <strong>{physicalInventory.filter(i => (i.damagedQuantity || 0) > 0).length}</strong>
                  </p>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  <button
                    onClick={() => setActiveTab('staff')}
                    className="px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
                  >
                    <ClipboardCheck className="w-4 h-4" />
                    <span>Mark Daily Attendance</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('agent')}
                    className="px-4 py-2.5 rounded-2xl royal-gradient text-white font-bold text-xs flex items-center gap-1.5 shadow-sm border border-brand-gold/40 transition"
                  >
                    <Mic className="w-4 h-4 text-brand-gold" />
                    <span>Voice Agent Commands</span>
                  </button>
                </div>
              </div>

              {/* 4 Key Business Metrics */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-neutral-950 p-5 rounded-3xl border border-neutral-800 shadow-xs space-y-1">
                  <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Total Inquiries / Bookings</span>
                  <p className="text-3xl font-serif font-black text-white">{enquiries.length}</p>
                  <span className="text-[10px] text-amber-400 font-semibold block">{enquiries.filter(e => e.status === 'Confirmed').length} Confirmed Bookings</span>
                </div>

                <div className="bg-neutral-950 p-5 rounded-3xl border border-neutral-800 shadow-xs space-y-1">
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Registered Workforce</span>
                  <p className="text-3xl font-serif font-black text-white">{staffList.length}</p>
                  <span className="text-[10px] text-neutral-400 font-semibold block">Standard Wage: ₹500/day</span>
                </div>

                <div className="bg-neutral-950 p-5 rounded-3xl border border-neutral-800 shadow-xs space-y-1">
                  <span className="text-[11px] font-bold text-brand-gold uppercase tracking-wider">Warehouse Assets</span>
                  <p className="text-3xl font-serif font-black text-white">{physicalInventory.length}</p>
                  <span className="text-[10px] text-neutral-400 font-semibold block">Rental Catalogue: {rentalItems.length} items</span>
                </div>

                <div className="bg-neutral-950 p-5 rounded-3xl border border-neutral-800 shadow-xs space-y-1">
                  <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">Generated Invoices</span>
                  <p className="text-3xl font-serif font-black text-white">{invoices.length}</p>
                  <span className="text-[10px] text-neutral-400 font-semibold block">External Expenses: {outsidePayments.length} entries</span>
                </div>
              </div>

              {/* Fast Action Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div 
                  onClick={() => setActiveTab('bookings')}
                  className="bg-neutral-950 p-6 rounded-3xl border border-neutral-800 hover:border-neutral-700 cursor-pointer shadow-xs transition hover:-translate-y-0.5 space-y-3"
                >
                  <div className="w-10 h-10 rounded-2xl bg-brand-primary/20 text-brand-gold flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base text-white">Booking & Quotation Pipeline</h3>
                    <p className="text-xs text-neutral-400 mt-1">Review incoming inquiries, adjust line-item quotes, log advance deposits, and generate formal invoices.</p>
                  </div>
                  <div className="text-xs font-bold text-brand-gold flex items-center gap-1">
                    <span>Manage Bookings</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>

                <div 
                  onClick={() => setActiveTab('marketing')}
                  className="bg-neutral-950 p-6 rounded-3xl border border-neutral-800 hover:border-neutral-700 cursor-pointer shadow-xs transition hover:-translate-y-0.5 space-y-3"
                >
                  <div className="w-10 h-10 rounded-2xl bg-amber-400/20 text-amber-300 flex items-center justify-center">
                    <Clapperboard className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base text-white">Marketing & FFmpeg Reel Studio</h3>
                    <p className="text-xs text-neutral-400 mt-1">Render 9:16 vertical reels from gallery photos with Ken Burns zoom, Lucknow hashtags, and MP4 downloads.</p>
                  </div>
                  <div className="text-xs font-bold text-amber-300 flex items-center gap-1">
                    <span>Open Studio</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>

                <div 
                  onClick={() => setActiveTab('payments')}
                  className="bg-neutral-950 p-6 rounded-3xl border border-neutral-800 hover:border-neutral-700 cursor-pointer shadow-xs transition hover:-translate-y-0.5 space-y-3"
                >
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <IndianRupee className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base text-white">Wages & Operational Expenses</h3>
                    <p className="text-xs text-neutral-400 mt-1">Track daily staff wages, laundry washing bills, and hardware/bamboo supplier payments.</p>
                  </div>
                  <div className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <span>Open Expenses</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================
              SECTION 2: STAFF & ATTENDANCE
             ======================================================== */}
          {activeTab === 'staff' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Header & Subtabs */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-white flex items-center gap-2">
                    <HardHat className="w-6 h-6 text-brand-gold" />
                    <span>Workforce Register & Payroll Management</span>
                  </h2>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Digital replacement for Daya handwritten register: 1..31 monthly grid, advances ledger, daily wages (₹500/₹450), and transparent payroll deductions.
                  </p>
                </div>
                
                {/* Subtab Switcher */}
                <div className="bg-neutral-950 p-1 rounded-2xl border border-neutral-800 flex flex-wrap gap-1">
                  <button
                    onClick={() => setStaffSubtab('register')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      staffSubtab === 'register' ? 'bg-[#7c3aed] text-white shadow-xs' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    📅 Attendance Register (1..31 Grid)
                  </button>
                  <button
                    onClick={() => setStaffSubtab('advances')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      staffSubtab === 'advances' ? 'bg-[#7c3aed] text-white shadow-xs' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    💵 Advances Ledger ({advancesList.length})
                  </button>
                  <button
                    onClick={() => setStaffSubtab('payroll')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      staffSubtab === 'payroll' ? 'bg-[#7c3aed] text-white shadow-xs' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    🧾 Payroll Settlement
                  </button>
                  <button
                    onClick={() => setStaffSubtab('roster')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      staffSubtab === 'roster' ? 'bg-[#7c3aed] text-white shadow-xs' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    👷 Worker Roster ({staffList.length})
                  </button>
                </div>
              </div>

              {/* ========================================================
                  SUBTAB 1: DAYA-STYLE 1..31 MONTHLY ATTENDANCE REGISTER GRID
                 ======================================================== */}
              {staffSubtab === 'register' && (
                <div className="space-y-4">
                  {/* Register Controls & Month Navigation */}
                  <div className="bg-neutral-950 p-4 rounded-3xl border border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-amber-400/10 border border-amber-400/30 text-brand-gold">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-serif font-bold text-white text-base">
                          Attendance for Month of: {new Date(gridYear, gridMonth - 1, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                        </h3>
                        <p className="text-[11px] text-neutral-400">
                          Click any cell (1..{gridData?.daysInMonth || 31}) to toggle status: P (Present) → ½ (Half Day) → A (Absent) → – (Clear)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const prev = gridMonth === 1 ? 12 : gridMonth - 1;
                          const yr = gridMonth === 1 ? gridYear - 1 : gridYear;
                          setGridMonth(prev);
                          setGridYear(yr);
                          api.getAttendanceGrid({ year: yr, month: prev }).then(r => r.success && setGridData(r));
                        }}
                        className="px-3 py-1.5 rounded-xl border border-neutral-700 text-xs font-bold text-neutral-300 hover:text-white hover:bg-neutral-900"
                      >
                        ◀ Previous Month
                      </button>
                      <button
                        onClick={() => {
                          const next = gridMonth === 12 ? 1 : gridMonth + 1;
                          const yr = gridMonth === 12 ? gridYear + 1 : gridYear;
                          setGridMonth(next);
                          setGridYear(yr);
                          api.getAttendanceGrid({ year: yr, month: next }).then(r => r.success && setGridData(r));
                        }}
                        className="px-3 py-1.5 rounded-xl border border-neutral-700 text-xs font-bold text-neutral-300 hover:text-white hover:bg-neutral-900"
                      >
                        Next Month ▶
                      </button>
                      <button
                        onClick={() => setIsAdvanceModalOpen(true)}
                        className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs flex items-center gap-1 shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Give Advance</span>
                      </button>
                    </div>
                  </div>

                  {/* Register Status Legend */}
                  <div className="flex flex-wrap items-center gap-3 px-2 text-[11px] text-neutral-400">
                    <span className="font-bold text-neutral-300">Legend:</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-700"><strong>P</strong> = Present (1.0)</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-900/60 text-amber-300 border border-amber-700"><strong>½</strong> = Half Day (0.5)</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-900/60 text-rose-300 border border-rose-700"><strong>A</strong> = Absent (0.0)</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-900/60 text-purple-300 border border-purple-700"><strong>L</strong> = Approved Leave</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-neutral-800 text-neutral-400 border border-neutral-700"><strong>–</strong> = Not Marked</span>
                  </div>

                  {/* 1..31 Daya Grid Table (Horizontal Scroll) */}
                  <div className="bg-neutral-950 rounded-3xl border border-neutral-800 overflow-x-auto shadow-2xl">
                    <table className="min-w-max text-left text-[11px] text-neutral-300 border-collapse">
                      <thead className="bg-neutral-900/90 text-neutral-400 uppercase text-[10px] tracking-wider border-b border-neutral-800 sticky top-0">
                        <tr>
                          <th className="p-3 sticky left-0 z-20 bg-neutral-900 border-r border-neutral-800 w-10 text-center">S.No</th>
                          <th className="p-3 sticky left-10 z-20 bg-neutral-900 border-r border-neutral-800 min-w-[160px]">Worker Name &amp; Designation</th>
                          <th className="p-3 border-r border-neutral-800 text-right min-w-[80px]">Daily Wage</th>
                          {Array.from({ length: gridData?.daysInMonth || 31 }, (_, i) => i + 1).map(day => (
                            <th key={day} className="p-2 border-r border-neutral-800/60 text-center w-8 font-mono">
                              {day}
                            </th>
                          ))}
                          <th className="p-3 border-r border-neutral-800 text-center bg-neutral-900/60">Present (P)</th>
                          <th className="p-3 border-r border-neutral-800 text-center bg-neutral-900/60">Half (½)</th>
                          <th className="p-3 border-r border-neutral-800 text-center bg-neutral-900/60 font-bold text-white">Payable Days</th>
                          <th className="p-3 border-r border-neutral-800 text-right font-bold text-indigo-300">Gross Wages</th>
                          <th className="p-3 border-r border-neutral-800 text-right font-bold text-amber-300">Total Advance</th>
                          <th className="p-3 border-r border-neutral-800 text-right font-bold text-rose-300">Deduction</th>
                          <th className="p-3 text-right font-bold text-emerald-400 bg-emerald-950/20">Net Payable</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-800/60">
                        {(gridData?.grid || []).map((row, idx) => (
                          <tr key={row.staffId} className="hover:bg-neutral-900/40 transition">
                            <td className="p-2.5 sticky left-0 z-10 bg-neutral-950 border-r border-neutral-800 text-center text-neutral-400 font-mono">
                              {idx + 1}
                            </td>
                            <td className="p-2.5 sticky left-10 z-10 bg-neutral-950 border-r border-neutral-800">
                              <strong className="text-white text-xs block font-serif">{row.name}</strong>
                              <span className="text-[10px] text-brand-gold uppercase">{row.category}</span>
                            </td>
                            <td className="p-2.5 border-r border-neutral-800 text-right font-mono font-bold text-neutral-200">
                              ₹{row.dailyWage}
                            </td>
                            {Array.from({ length: gridData?.daysInMonth || 31 }, (_, i) => i + 1).map(day => {
                              const mark = row.days ? row.days[day] : '-';
                              let badgeClass = 'text-neutral-500 hover:bg-neutral-800';
                              if (mark === 'P') badgeClass = 'bg-emerald-900/80 text-emerald-200 font-bold border border-emerald-600 shadow-xs';
                              else if (mark === '1/2') badgeClass = 'bg-amber-900/80 text-amber-200 font-bold border border-amber-600';
                              else if (mark === 'A') badgeClass = 'bg-rose-900/80 text-rose-200 font-bold border border-rose-600';
                              else if (mark === 'L') badgeClass = 'bg-purple-900/80 text-purple-200 font-bold';

                              return (
                                <td key={day} className="p-1 border-r border-neutral-800/40 text-center">
                                  <button
                                    onClick={() => handleToggleGridCell(row.staffId, day)}
                                    title={`Day ${day}: ${mark} (Click to toggle)`}
                                    className={`w-7 h-7 rounded text-[11px] transition flex items-center justify-center mx-auto ${badgeClass}`}
                                  >
                                    {mark}
                                  </button>
                                </td>
                              );
                            })}
                            <td className="p-2.5 border-r border-neutral-800 text-center font-bold text-emerald-400">
                              {row.presentCount}
                            </td>
                            <td className="p-2.5 border-r border-neutral-800 text-center font-bold text-amber-400">
                              {row.halfDayCount}
                            </td>
                            <td className="p-2.5 border-r border-neutral-800 text-center font-bold text-white font-mono">
                              {row.payableUnits}
                            </td>
                            <td className="p-2.5 border-r border-neutral-800 text-right font-mono font-bold text-indigo-300">
                              ₹{row.grossWages?.toLocaleString('en-IN')}
                            </td>
                            <td className="p-2.5 border-r border-neutral-800 text-right font-mono font-bold text-amber-300">
                              ₹{row.totalAdvance?.toLocaleString('en-IN') || 0}
                            </td>
                            <td className="p-2.5 border-r border-neutral-800 text-right font-mono font-bold text-rose-300">
                              -₹{row.advancesDeducted?.toLocaleString('en-IN') || 0}
                            </td>
                            <td className="p-2.5 text-right font-mono font-black text-emerald-400 bg-emerald-950/20 text-xs">
                              ₹{row.netPayable?.toLocaleString('en-IN')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ========================================================
                  SUBTAB 2: EMPLOYEE ADVANCES LEDGER
                 ======================================================== */}
              {staffSubtab === 'advances' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-neutral-950 p-4 rounded-3xl border border-neutral-800">
                    <div>
                      <h3 className="font-serif font-bold text-white text-base">Cash Advances Ledger</h3>
                      <p className="text-xs text-neutral-400">Track all cash advances given to labourers, drivers, and fitters before salary day.</p>
                    </div>
                    <button
                      onClick={() => setIsAdvanceModalOpen(true)}
                      className="px-4 py-2.5 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Record New Advance</span>
                    </button>
                  </div>

                  <div className="bg-neutral-950 rounded-3xl border border-neutral-800 overflow-hidden shadow-xs">
                    <table className="w-full text-left text-xs text-neutral-300">
                      <thead className="bg-neutral-900/90 text-neutral-400 uppercase text-[10px] tracking-wider border-b border-neutral-800">
                        <tr>
                          <th className="p-4">Advance ID</th>
                          <th className="p-4">Worker Name</th>
                          <th className="p-4">Transaction Date</th>
                          <th className="p-4">Advance Amount</th>
                          <th className="p-4">Balance Owed</th>
                          <th className="p-4">Settlement Status</th>
                          <th className="p-4">Notes</th>
                          <th className="p-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-800/80">
                        {advancesList.map(adv => (
                          <tr key={adv.id} className="hover:bg-neutral-900/40 transition">
                            <td className="p-4 font-mono font-bold text-brand-gold">{adv.id}</td>
                            <td className="p-4">
                              <strong className="text-white text-sm font-serif block">{adv.staffName}</strong>
                            </td>
                            <td className="p-4 font-mono text-neutral-400">{adv.date}</td>
                            <td className="p-4 font-mono font-bold text-amber-300">₹{adv.amount?.toLocaleString('en-IN')}</td>
                            <td className="p-4 font-mono font-bold text-rose-300">₹{adv.balance?.toLocaleString('en-IN')}</td>
                            <td className="p-4">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                adv.status === 'settled' ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-600' : 'bg-amber-900/60 text-amber-300 border border-amber-600'
                              }`}>
                                {adv.status}
                              </span>
                            </td>
                            <td className="p-4 text-neutral-400">{adv.notes}</td>
                            <td className="p-4 text-right">
                              {adv.status === 'outstanding' && (
                                <button
                                  onClick={() => handleDeleteAdvance(adv.id)}
                                  className="text-rose-400 hover:text-rose-300 text-xs font-bold"
                                >
                                  Delete
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ========================================================
                  SUBTAB 3: PAYROLL SETTLEMENT ENGINE
                 ======================================================== */}
              {staffSubtab === 'payroll' && (
                <div className="space-y-6">
                  <div className="bg-neutral-950 p-6 rounded-3xl border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-serif font-bold text-white text-base">Monthly Payroll Finalization &amp; Settlement</h3>
                      <p className="text-xs text-neutral-400 mt-1">
                        Review gross earnings, automatically deduct advances, and freeze payroll periods to prevent double-deductions.
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleFinalizePayrollSubmit}
                        className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition flex items-center gap-1.5"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Finalize &amp; Lock Month Payroll</span>
                      </button>
                    </div>
                  </div>

                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800">
                      <p className="text-[11px] font-bold text-neutral-400">Total Staff Active</p>
                      <p className="text-2xl font-serif font-bold text-white mt-1">{payrollData?.summary?.totalStaff || staffList.length}</p>
                    </div>
                    <div className="bg-neutral-950 p-4 rounded-2xl border border-indigo-900/60">
                      <p className="text-[11px] font-bold text-indigo-400">Gross Wages Earned</p>
                      <p className="text-2xl font-serif font-bold text-indigo-400 mt-1">₹{payrollData?.summary?.totalGross?.toLocaleString('en-IN') || 0}</p>
                    </div>
                    <div className="bg-neutral-950 p-4 rounded-2xl border border-rose-900/60">
                      <p className="text-[11px] font-bold text-rose-400">Advances Deducted</p>
                      <p className="text-2xl font-serif font-bold text-rose-400 mt-1">-₹{payrollData?.summary?.totalDeductions?.toLocaleString('en-IN') || 0}</p>
                    </div>
                    <div className="bg-neutral-950 p-4 rounded-2xl border border-emerald-900/60">
                      <p className="text-[11px] font-bold text-emerald-400">Net Salary Payable</p>
                      <p className="text-2xl font-serif font-bold text-emerald-400 mt-1">₹{payrollData?.summary?.totalNet?.toLocaleString('en-IN') || 0}</p>
                    </div>
                  </div>

                  {/* Employee Breakdown Table */}
                  <div className="bg-neutral-950 rounded-3xl border border-neutral-800 overflow-hidden shadow-xs">
                    <table className="w-full text-left text-xs text-neutral-300">
                      <thead className="bg-neutral-900/90 text-neutral-400 uppercase text-[10px] tracking-wider border-b border-neutral-800">
                        <tr>
                          <th className="p-4">Employee</th>
                          <th className="p-4">Daily Wage</th>
                          <th className="p-4 text-center">Days Worked</th>
                          <th className="p-4 text-right">Gross Wages</th>
                          <th className="p-4 text-right">Advances Deducted</th>
                          <th className="p-4 text-right">Net Payable</th>
                          <th className="p-4 text-right">Advance Balance Carried</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-800/80">
                        {(payrollData?.breakdown || []).map(emp => (
                          <tr key={emp.staffId} className="hover:bg-neutral-900/40 transition">
                            <td className="p-4">
                              <strong className="text-white text-sm font-serif block">{emp.name}</strong>
                              <span className="text-[10px] text-brand-gold uppercase">{emp.category}</span>
                            </td>
                            <td className="p-4 font-mono">₹{emp.dailyWage}</td>
                            <td className="p-4 text-center font-mono font-bold text-white">{emp.payableUnits}</td>
                            <td className="p-4 text-right font-mono font-bold text-indigo-300">₹{emp.grossWage?.toLocaleString('en-IN')}</td>
                            <td className="p-4 text-right font-mono font-bold text-rose-300">-₹{emp.advanceDeducted?.toLocaleString('en-IN')}</td>
                            <td className="p-4 text-right font-mono font-black text-emerald-400 text-sm">₹{emp.netPayable?.toLocaleString('en-IN')}</td>
                            <td className="p-4 text-right font-mono text-amber-300">₹{emp.carryForwardAdvance?.toLocaleString('en-IN') || 0}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ========================================================
                  SUBTAB 4: WORKER ROSTER
                 ======================================================== */}
              {staffSubtab === 'roster' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-neutral-950 p-4 rounded-3xl border border-neutral-800">
                    <div>
                      <h3 className="font-serif font-bold text-white text-base">Worker Profiles &amp; Designations</h3>
                      <p className="text-xs text-neutral-400">Add, edit, or configure individual daily wage rates for workers.</p>
                    </div>
                    <button
                      onClick={() => { setEditingStaffMember(null); setIsStaffModalOpen(true); }}
                      className="px-4 py-2.5 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Add New Worker</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {staffList.map(st => (
                      <div key={st.id} className="bg-neutral-950 p-5 rounded-2xl border border-neutral-800 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-serif font-bold text-white text-base">{st.name}</h4>
                            <span className="text-[10px] uppercase font-bold text-brand-gold">{st.category || st.role}</span>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-900/60 text-emerald-300 border border-emerald-700">
                            {st.status || 'Active'}
                          </span>
                        </div>
                        <div className="pt-2 border-t border-neutral-800/80 space-y-1 text-xs">
                          <p className="flex justify-between text-neutral-400"><span>Daily Wage Rate:</span> <strong className="text-white font-mono">₹{st.dailyWage || 500}/day</strong></p>
                          <p className="flex justify-between text-neutral-400"><span>Phone Number:</span> <strong className="text-neutral-200 font-mono">{st.phone || 'N/A'}</strong></p>
                          <p className="text-[11px] text-neutral-500 italic mt-2">{st.notes || 'Warehouse tent crew specialist.'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-white">💰 Wages & External Operational Expenses</h2>
                  <p className="text-xs text-neutral-400">Maintain separate, auditable ledgers for internal worker wages and external supplier/laundry expenses.</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-neutral-950 p-1 rounded-2xl border border-neutral-800 flex">
                    <button
                      onClick={() => setPaymentSubtab('staff_wages')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                        paymentSubtab === 'staff_wages' ? 'bg-brand-primary text-white shadow-xs' : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      Worker Wages ({wageDisbursements.length})
                    </button>
                    <button
                      onClick={() => setPaymentSubtab('outside_payments')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                        paymentSubtab === 'outside_payments' ? 'bg-brand-primary text-white shadow-xs' : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      Laundry & Supplier Expenses ({outsidePayments.length})
                    </button>
                  </div>
                  {paymentSubtab === 'outside_payments' && (
                    <button
                      onClick={() => setIsOutsidePaymentModalOpen(true)}
                      className="px-4 py-2 rounded-xl royal-gradient text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
                    >
                      <Plus className="w-4 h-4 text-brand-gold" />
                      <span>+ Record External Expense</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Subtab 1: Staff Wage Disbursements */}
              {paymentSubtab === 'staff_wages' && (
                <div className="space-y-4">
                  <div className="bg-neutral-950 rounded-3xl border border-neutral-800 overflow-hidden shadow-xs">
                    <table className="w-full text-left text-xs text-neutral-300">
                      <thead className="bg-neutral-900/90 text-neutral-400 uppercase text-[10px] tracking-wider border-b border-neutral-800">
                        <tr>
                          <th className="p-4">Receipt No.</th>
                          <th className="p-4">Worker Name</th>
                          <th className="p-4">Date</th>
                          <th className="p-4">Amount (₹)</th>
                          <th className="p-4">Payment Mode</th>
                          <th className="p-4">Notes / Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-800/80">
                        {wageDisbursements.map(d => (
                          <tr key={d.id} className="hover:bg-neutral-900/40 transition">
                            <td className="p-4 font-mono font-bold text-brand-gold">{d.referenceNumber || d.id}</td>
                            <td className="p-4 font-serif font-bold text-white">{d.staffName}</td>
                            <td className="p-4 font-mono">{d.date}</td>
                            <td className="p-4 font-mono font-bold text-emerald-400">₹{d.amount}</td>
                            <td className="p-4">{d.paymentMethod}</td>
                            <td className="p-4 text-neutral-400">{d.notes || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Subtab 2: Outside Payments (Dhobi, Suppliers) */}
              {paymentSubtab === 'outside_payments' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800">
                      <span className="text-[11px] font-bold text-neutral-400">Laundry (Cloth Washing)</span>
                      <p className="text-xl font-serif font-bold text-white mt-1">
                        ₹{outsidePayments.filter(p => p.category === 'dhobi').reduce((acc, p) => acc + (parseFloat(p.amount) || 0), 0).toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800">
                      <span className="text-[11px] font-bold text-neutral-400">Suppliers (Bamboo, Hardware, Poles)</span>
                      <p className="text-xl font-serif font-bold text-white mt-1">
                        ₹{outsidePayments.filter(p => p.category === 'supplier').reduce((acc, p) => acc + (parseFloat(p.amount) || 0), 0).toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800">
                      <span className="text-[11px] font-bold text-neutral-400">Total External Expenses</span>
                      <p className="text-xl font-serif font-bold text-emerald-400 mt-1">
                        ₹{outsidePayments.reduce((acc, p) => acc + (parseFloat(p.amount) || 0), 0).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>

                  <div className="bg-neutral-950 rounded-3xl border border-neutral-800 overflow-hidden shadow-xs">
                    <table className="w-full text-left text-xs text-neutral-300">
                      <thead className="bg-neutral-900/90 text-neutral-400 uppercase text-[10px] tracking-wider border-b border-neutral-800">
                        <tr>
                          <th className="p-4">Recipient Name</th>
                          <th className="p-4">Category</th>
                          <th className="p-4">Purpose / Expense Head</th>
                          <th className="p-4">Amount (₹)</th>
                          <th className="p-4">Payment Mode &amp; Receipt</th>
                          <th className="p-4">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-800/80">
                        {outsidePayments.map(p => (
                          <tr key={p.id} className="hover:bg-neutral-900/40 transition">
                            <td className="p-4 font-serif font-bold text-white">{p.recipientName}</td>
                            <td className="p-4">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-800 text-brand-gold uppercase">
                                {p.category}
                              </span>
                            </td>
                            <td className="p-4 text-neutral-300">{p.purpose}</td>
                            <td className="p-4 font-mono font-bold text-emerald-400">₹{p.amount?.toLocaleString('en-IN')}</td>
                            <td className="p-4 font-mono text-[11px]">
                              <span>{p.paymentMethod}</span> &bull; <span className="text-neutral-400">{p.referenceNumber}</span>
                            </td>
                            <td className="p-4 font-mono">{p.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================
              SECTION 4: CUSTOMERS & QUOTATIONS
             ======================================================== */}
          {activeTab === 'customers' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-white">👥 Customer Directory & Direct Quotations</h2>
                  <p className="text-xs text-neutral-400">Add customer records, customize itemized quotation packages, and share direct WhatsApp estimates.</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Search customer name or phone..."
                      value={customerSearchQuery}
                      onChange={(e) => setCustomerSearchQuery(e.target.value)}
                      className="pl-9 pr-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-xs text-white outline-none w-52 sm:w-64"
                    />
                  </div>
                  <button
                    onClick={() => setIsAddCustomerModalOpen(true)}
                    className="px-4 py-2 rounded-xl royal-gradient text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
                  >
                    <Plus className="w-4 h-4 text-brand-gold" />
                    <span>+ Add Customer</span>
                  </button>
                </div>
              </div>

              {/* Customers Directory */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {customers.filter(c => {
                  const q = customerSearchQuery.toLowerCase();
                  return !q || c.name?.toLowerCase().includes(q) || c.phone?.includes(q);
                }).map(c => {
                  const customerEnquiries = enquiries.filter(e => e.phone === c.phone || e.customerId === c.id);
                  return (
                    <div key={c.id || c.phone} className="bg-neutral-950 p-5 rounded-3xl border border-neutral-800 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-serif font-bold text-base text-white">{c.name}</h3>
                          <p className="text-xs font-mono text-brand-gold">{c.phone}</p>
                          {c.email && <p className="text-[11px] text-neutral-400">{c.email}</p>}
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-neutral-900 text-neutral-300 border border-neutral-700">
                          {customerEnquiries.length} Bookings
                        </span>
                      </div>

                      {customerEnquiries.length > 0 && (
                        <div className="p-3 bg-neutral-900/60 rounded-2xl border border-neutral-800/80 text-xs space-y-1">
                          <span className="text-neutral-400 text-[10px] block uppercase font-bold">Recent Event:</span>
                          <p className="font-semibold text-white">{customerEnquiries[0].serviceRequired || 'Wedding Setup'}</p>
                          <p className="text-neutral-400 font-mono text-[11px]">{customerEnquiries[0].eventDate} &bull; {customerEnquiries[0].eventVenue || 'Dwarka Shri Lawn'}</p>
                        </div>
                      )}

                      <div className="pt-2 flex gap-2">
                        <a
                          href={`https://wa.me/91${c.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hello ${c.name}, greetings from Kandhari Tent & Caterers and Dwarka Shri Lawn! We are ready to assist you with your wedding and celebration arrangements.`)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold text-center flex items-center justify-center gap-1.5 transition"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp Message</span>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================
              SECTION 5: BOOKINGS & ORDERS PIPELINE
             ======================================================== */}
          {activeTab === 'bookings' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-white">📋 Event Booking & Quotation Pipeline</h2>
                  <p className="text-xs text-neutral-400">Review customer requirements, adjust line-item quotes, unlock advance payments, and generate official invoices.</p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={enquiryStatusFilter}
                    onChange={(e) => setEnquiryStatusFilter(e.target.value)}
                    className="p-2 rounded-xl bg-neutral-950 border border-neutral-700 text-xs text-white outline-none"
                  >
                    <option value="all">All Statuses</option>
                    <option value="Pending Admin Approval">Pending Approval</option>
                    <option value="Approved — Awaiting Payment">Approved — Awaiting Payment</option>
                    <option value="Confirmed">Confirmed Booking</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              {/* Bookings List */}
              <div className="space-y-4">
                {lastApprovedWhatsAppLink && (
                  <div className="p-4 bg-emerald-950/70 border border-emerald-500/50 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-fadeIn">
                    <div className="flex items-center gap-2.5 text-emerald-300">
                      <MessageCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                      <span>
                        Order <strong>#{lastApprovedWhatsAppLink.orderId}</strong> accepted! Driver details and live tracking link prepared for <strong>{lastApprovedWhatsAppLink.customerName}</strong>.
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={lastApprovedWhatsAppLink.link}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Send WhatsApp Update</span>
                      </a>
                      <button
                        onClick={() => setLastApprovedWhatsAppLink(null)}
                        className="text-neutral-400 hover:text-white p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {enquiries.filter(e => enquiryStatusFilter === 'all' || e.status === enquiryStatusFilter).map(enq => (
                  <div 
                    key={enq.id} 
                    onClick={() => handleOpenLocationModal(enq)}
                    className="bg-neutral-950 p-6 rounded-3xl border border-neutral-800 hover:border-neutral-700 transition cursor-pointer space-y-4 shadow-xs"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-neutral-800/60">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-serif font-bold text-lg text-white">{enq.customerName}</h3>
                          <span className="text-xs font-mono text-brand-gold">({enq.phone})</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            enq.status === 'Confirmed' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                            enq.status === 'Pending Admin Approval' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse' :
                            'bg-neutral-800 text-neutral-300'
                          }`}>
                            {enq.status}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-400 mt-1">
                          Ref: <strong className="font-mono text-white">{enq.id}</strong> &bull; Date: <strong className="text-white">{enq.eventDate}</strong> &bull; Venue: <strong className="text-white">{enq.eventVenue || enq.locality || 'Dwarka Shri Lawn'}</strong> &bull; Distance: <strong className="text-brand-gold font-mono">{enq.distanceKm || enq.locationInfo?.distanceKm || 3} km</strong>
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-[11px] text-neutral-400 block">Total Quotation:</span>
                        <span className="text-xl font-serif font-black text-brand-gold">
                          ₹{(enq.grandTotal || enq.estimatedCost || 0).toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-emerald-400 block font-mono">Advance Paid: ₹{(enq.advancePaid || 0).toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
                      {/* 1-Click Detect Location & Route */}
                      <button
                        onClick={() => handleOpenLocationModal(enq)}
                        className="px-3.5 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
                        title="Detect venue location, distance & embedded interactive mapview"
                      >
                        <Navigation className="w-3.5 h-3.5 text-blue-400" />
                        <span>🗺️ Route & Distance ({enq.distanceKm || enq.locationInfo?.distanceKm || 3} km)</span>
                      </button>

                      {/* 1-Click Individual Ticket */}
                      <button
                        onClick={() => {
                          setSelectedTicketForModal(enq);
                          setIsTicketModalOpen(true);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
                        title="One-click individual ticket view"
                      >
                        <FileText className="w-3.5 h-3.5 text-purple-400" />
                        <span>View Ticket (1-Click)</span>
                      </button>

                      {enq.status === 'Pending Admin Approval' && (
                        <>
                          <button
                            onClick={() => handleApproveQuotation(enq.id)}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
                          >
                            <Check className="w-4 h-4" />
                            <span>Approve Order</span>
                          </button>

                          <button
                            onClick={() => handleRejectQuotation(enq.id)}
                            className="px-3 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
                          >
                            <X className="w-3.5 h-3.5 text-rose-400" />
                            <span>Reject Order</span>
                          </button>
                        </>
                      )}

                      {/* Connect to Driver with Customer Details & Location */}
                      {enq.status !== 'Rejected' && !enq.deliveryPartner && (
                        <button
                          onClick={() => {
                            setAssignPartnerModalOrder(enq);
                            setSelectedPartnerIdForAssign(deliveryPartners[0]?.id || '');
                            setEstimatedDeliveryTimeInput('Punctual morning setup on ' + (enq.eventDate || 'event day'));
                          }}
                          className="px-3.5 py-2 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
                        >
                          <Truck className="w-3.5 h-3.5 text-amber-300" />
                          <span>Connect to Driver</span>
                        </button>
                      )}

                      {/* Active Delivery Partner Badge & Dispatch Controls */}
                      {enq.deliveryPartner && (
                        <div className="flex flex-wrap items-center gap-2 bg-purple-950/40 p-2 rounded-xl border border-purple-800/40 text-xs">
                          <span className="text-purple-300 font-semibold flex items-center gap-1">
                            <Truck className="w-3.5 h-3.5 text-amber-300" />
                            Driver: <strong>{enq.deliveryPartner.name}</strong> ({enq.deliveryPartner.vehicleNumber})
                          </span>
                          {enq.deliveryStatus !== 'Out for Delivery / En Route' && enq.deliveryStatus !== 'Delivered & Installed' && (
                            <button
                              onClick={() => handleUpdateDeliveryDispatch(enq.id, 'Out for Delivery / En Route', 'Vehicle dispatched from Kanpur Road Depot')}
                              className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] transition"
                            >
                              Out for Delivery
                            </button>
                          )}
                          {enq.deliveryStatus !== 'Delivered & Installed' && (
                            <button
                              onClick={() => handleUpdateDeliveryDispatch(enq.id, 'Delivered & Installed', 'Setup verified at venue')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition"
                            >
                              Delivered & Installed
                            </button>
                          )}
                        </div>
                      )}

                      <a
                        href={`/track/${enq.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-700 text-xs font-semibold flex items-center gap-1.5 transition"
                        title="Open customer live tracking screen"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-[#7c3aed]" />
                        <span>Live Tracker</span>
                      </a>

                      <button
                        onClick={() => {
                          setSelectedOrderForQuote(enq);
                          setQuoteFormData({
                            status: enq.status,
                            cartage: enq.cartage || 0,
                            labour: enq.labour || 0,
                            discount: enq.discount || 0,
                            manualAdjustment: enq.manualAdjustment || 0,
                            quotationNotes: enq.quotationNotes || '',
                            lineItems: enq.lineItems || []
                          });
                          setIsQuoteEditModalOpen(true);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 text-xs font-semibold flex items-center gap-1.5 transition"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-brand-gold" />
                        <span>Modify Quotation</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedOrderForQuote(enq);
                          setIsBillPrintModalOpen(true);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 text-xs font-semibold flex items-center gap-1.5 transition"
                      >
                        <Printer className="w-3.5 h-3.5 text-neutral-300" />
                        <span>Letterhead Invoice</span>
                      </button>

                      <button
                        onClick={() => {
                          setOfflinePayModalOrder(enq);
                          setOfflinePayForm({
                            amount: Math.round((enq.grandTotal || enq.estimatedCost || 25000) * 0.5),
                            paymentMethod: 'Cash',
                            referenceNumber: 'CASH-' + Math.floor(1000 + Math.random() * 9000),
                            notes: '50% advance cash deposit received at Daroga Kheda office.'
                          });
                        }}
                        className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 text-xs font-semibold flex items-center gap-1.5 transition"
                      >
                        <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Record Cash / Offline Advance</span>
                      </button>

                      <a
                        href={`https://wa.me/91${enq.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hello ${enq.customerName}, regarding your booking ${enq.id} at Kandhari Tent & Caterers / Dwarka Shri Lawn: Status is ${enq.status}, total quote is ₹${enq.grandTotal || enq.estimatedCost}. Kanpur Road, Lucknow.`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Send WhatsApp Quote</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================
              SECTION: DELIVERY FLEET & LOGISTICS (Zomato-Like Tracking)
             ======================================================== */}
          {activeTab === 'delivery' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-white flex items-center gap-2">
                    <Truck className="w-6 h-6 text-[#7c3aed]" />
                    <span>Delivery Fleet & Logistics Management</span>
                  </h2>
                  <p className="text-xs text-neutral-400">
                    Manage transportation vehicles, delivery drivers, real-time dispatch status, and assign delivery partners to customer orders.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsAddPartnerModalOpen(true)}
                    className="px-4 py-2.5 rounded-2xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Register Delivery Partner</span>
                  </button>
                </div>
              </div>

              {/* Fleet Overview KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-neutral-950 p-5 rounded-3xl border border-neutral-800 space-y-1">
                  <span className="text-xs text-neutral-400">Total Fleet Vehicles</span>
                  <p className="text-2xl font-serif font-bold text-white">{deliveryPartners.length}</p>
                  <span className="text-[10px] text-purple-400">Tata Ace, Bolero Maxi, Canter</span>
                </div>

                <div className="bg-neutral-950 p-5 rounded-3xl border border-neutral-800 space-y-1">
                  <span className="text-xs text-neutral-400">Available for Dispatch</span>
                  <p className="text-2xl font-serif font-bold text-emerald-400">
                    {deliveryPartners.filter(p => (p.status || '').toLowerCase() === 'available').length}
                  </p>
                  <span className="text-[10px] text-emerald-400">Ready at base hubs</span>
                </div>

                <div className="bg-neutral-950 p-5 rounded-3xl border border-neutral-800 space-y-1">
                  <span className="text-xs text-neutral-400">Vehicles on Active Trips</span>
                  <p className="text-2xl font-serif font-bold text-indigo-400">
                    {deliveryPartners.filter(p => (p.status || '').toLowerCase() === 'on trip').length}
                  </p>
                  <span className="text-[10px] text-indigo-400">En route to event venues</span>
                </div>

                <div className="bg-neutral-950 p-5 rounded-3xl border border-neutral-800 space-y-1">
                  <span className="text-xs text-neutral-400">Central Hub Depot</span>
                  <p className="text-base font-bold text-amber-300">Kanpur Road Hub</p>
                  <span className="text-[10px] text-neutral-400">Opp. Metro Pillar No. 37, Lucknow</span>
                </div>
              </div>

              {/* Fleet Drivers Roster Table */}
              <div className="bg-neutral-950 p-6 rounded-3xl border border-neutral-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-lg text-white">Registered Fleet Partners</h3>
                  <span className="text-xs text-neutral-400">{deliveryPartners.length} registered drivers</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-neutral-900 text-neutral-400 uppercase text-[11px] border-b border-neutral-800">
                      <tr>
                        <th className="py-3 px-4">Driver Name</th>
                        <th className="py-3 px-4">Contact Phone</th>
                        <th className="py-3 px-4">Vehicle Model</th>
                        <th className="py-3 px-4">Registration No.</th>
                        <th className="py-3 px-4">Capacity & Hub</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800">
                      {deliveryPartners.map((partner) => (
                        <tr key={partner.id} className="hover:bg-neutral-900/50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-purple-900/60 text-purple-300 font-bold flex items-center justify-center text-xs border border-purple-700/50">
                                {partner.name?.charAt(0) || 'D'}
                              </div>
                              <div>
                                <p className="font-bold text-white">{partner.name}</p>
                                <span className="text-[10px] text-amber-400 font-semibold">★ {partner.rating || '4.9'}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <a href={`tel:${partner.phone?.replace(/\s+/g, '')}`} className="text-[#7c3aed] font-semibold hover:underline">
                              {partner.phone}
                            </a>
                          </td>
                          <td className="py-3 px-4 text-neutral-200 font-medium">
                            {partner.vehicleType}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-mono text-xs bg-neutral-900 text-amber-300 px-2 py-0.5 rounded border border-neutral-800">
                              {partner.vehicleNumber}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-neutral-400">
                            <p>{partner.maxLoadCapacity}</p>
                            <p className="text-[10px] text-neutral-500">{partner.baseHub}</p>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              partner.status === 'On Trip' 
                                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                : partner.status === 'Available'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-neutral-800 text-neutral-400'
                            }`}>
                              {partner.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => handleDeletePartner(partner.id)}
                              className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-rose-950/30 transition"
                              title="Delete partner"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Active Delivery Dispatches Board */}
              <div className="bg-neutral-950 p-6 rounded-3xl border border-neutral-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif font-bold text-lg text-white">Active Order Deliveries (Zomato-Like Workflow)</h3>
                    <p className="text-xs text-neutral-400">Live order dispatches, driver navigation links, and setup status</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {enquiries.filter(e => e.status !== 'Rejected' && e.status !== 'New').map((enq) => (
                    <div key={enq.id} className="p-4 rounded-2xl border border-neutral-800 bg-neutral-900/60 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[#7c3aed]">{enq.id}</span>
                          <span className="text-white font-bold">{enq.customerName}</span>
                          <span className="text-neutral-400">({enq.phone})</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-800 text-neutral-300">
                            {enq.status}
                          </span>
                        </div>
                        <p className="text-neutral-400">
                          📍 Venue: <strong className="text-neutral-200">{enq.eventVenueAddress || enq.locality || 'Kanpur Road, Lucknow'}</strong> &bull; Event: <strong className="text-white">{enq.eventDate}</strong>
                        </p>
                        {enq.deliveryPartner && (
                          <p className="text-purple-300 font-semibold flex items-center gap-1.5 pt-0.5">
                            <Truck className="w-3.5 h-3.5 text-amber-300" />
                            Assigned to: {enq.deliveryPartner.name} ({enq.deliveryPartner.vehicleType} - {enq.deliveryPartner.vehicleNumber})
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <button
                          onClick={() => {
                            setSelectedTicketForModal(enq);
                            setIsTicketModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 font-semibold transition flex items-center gap-1"
                        >
                          <FileText className="w-3 h-3 text-purple-400" />
                          <span>Ticket</span>
                        </button>

                        <a
                          href={`/track/${enq.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 font-semibold transition flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3 text-[#7c3aed]" />
                          <span>Track</span>
                        </a>

                        {!enq.deliveryPartner ? (
                          <button
                            onClick={() => {
                              setAssignPartnerModalOrder(enq);
                              setSelectedPartnerIdForAssign(deliveryPartners[0]?.id || '');
                              setEstimatedDeliveryTimeInput('Punctual morning setup on ' + (enq.eventDate || 'event day'));
                            }}
                            className="px-3 py-1.5 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold transition flex items-center gap-1"
                          >
                            <Truck className="w-3 h-3" />
                            <span>Assign Partner</span>
                          </button>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            {enq.deliveryStatus !== 'Out for Delivery / En Route' && enq.deliveryStatus !== 'Delivered & Installed' && (
                              <button
                                onClick={() => handleUpdateDeliveryDispatch(enq.id, 'Out for Delivery / En Route', 'Dispatched from depot')}
                                className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition text-[11px]"
                              >
                                Dispatch
                              </button>
                            )}
                            {enq.deliveryStatus !== 'Delivered & Installed' && (
                              <button
                                onClick={() => handleUpdateDeliveryDispatch(enq.id, 'Delivered & Installed', 'Setup verified at venue')}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition text-[11px]"
                              >
                                Complete Setup
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              SECTION 6: INVENTORY & RENTAL PRICING
             ======================================================== */}
          {activeTab === 'inventory' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-white">📦 Rental Inventory & Warehouse Stock</h2>
                  <p className="text-xs text-neutral-400">Manage physical warehouse equipment counts (available, damaged) and public rental catalogue rates.</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-neutral-950 p-1 rounded-2xl border border-neutral-800 flex">
                    <button
                      onClick={() => setInventorySubtab('physical')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                        inventorySubtab === 'physical' ? 'bg-brand-primary text-white shadow-xs' : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      Warehouse Physical Stock ({physicalInventory.length})
                    </button>
                    <button
                      onClick={() => setInventorySubtab('catalogue')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                        inventorySubtab === 'catalogue' ? 'bg-brand-primary text-white shadow-xs' : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      Rental Catalogue Rates ({rentalItems.length})
                    </button>
                  </div>
                </div>
              </div>

              {/* Subtab 1: Physical Warehouse Stock */}
              {inventorySubtab === 'physical' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {physicalInventory.map(item => (
                      <div key={item.id} className="bg-neutral-950 p-5 rounded-3xl border border-neutral-800 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[10px] font-bold text-brand-gold uppercase">{item.category}</span>
                            <h3 className="font-serif font-bold text-base text-white">{item.name}</h3>
                          </div>
                          {(item.damagedQuantity || 0) > 0 && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                              {item.damagedQuantity} Damaged
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-3 gap-2 py-2 border-y border-neutral-800/80 text-center text-xs">
                          <div>
                            <span className="text-neutral-400 text-[10px] block">Total Stock</span>
                            <strong className="text-white font-mono text-sm">{item.totalStock || item.totalQuantity || 0}</strong>
                          </div>
                          <div>
                            <span className="text-emerald-400 text-[10px] block font-bold">Available</span>
                            <strong className="text-emerald-400 font-mono text-sm">{item.availableStock || item.availableQuantity || 0}</strong>
                          </div>
                          <div>
                            <span className="text-rose-400 text-[10px] block font-bold">Damaged</span>
                            <strong className="text-rose-400 font-mono text-sm">{item.damagedQuantity || 0}</strong>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setStockModalItem(item);
                            setStockAdjustmentForm({
                              actionType: 'restock',
                              quantity: 20,
                              reason: 'Purchase',
                              notes: 'New stock added at Daroga Kheda warehouse'
                            });
                            setIsStockModalOpen(true);
                          }}
                          className="w-full py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 text-xs font-bold transition flex items-center justify-center gap-1.5"
                        >
                          <Wrench className="w-3.5 h-3.5 text-brand-gold" />
                          <span>Adjust Stock</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Subtab 2: Rental Catalogue Rates */}
              {inventorySubtab === 'catalogue' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {rentalItems.map(item => (
                      <div key={item.id} className="bg-neutral-950 rounded-2xl overflow-hidden border border-neutral-800 space-y-2 pb-3">
                        <div className="aspect-16/10 bg-neutral-900 relative">
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-[10px] font-bold text-brand-gold">
                            {item.category}
                          </span>
                        </div>
                        <div className="px-4">
                          <h4 className="font-serif font-bold text-sm text-white">{item.name}</h4>
                          <p className="text-base font-bold text-brand-gold font-mono mt-1">₹{item.pricePerDay || item.price || 50} <span className="text-xs text-neutral-400">/ day</span></p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================
              SECTION 7: BUSINESS ANALYTICS
             ======================================================== */}
          {activeTab === 'analytics' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="pb-4 border-b border-neutral-800">
                <h2 className="text-2xl font-serif font-bold text-white">📈 First-Party Visitor Analytics</h2>
                <p className="text-xs text-neutral-400">100% private first-party analytics — Admin internal browsing sessions are excluded.</p>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-neutral-950 p-5 rounded-3xl border border-neutral-800 space-y-1">
                  <span className="text-[11px] font-bold text-neutral-400">Today's Unique Visitors</span>
                  <p className="text-3xl font-serif font-bold text-white">{analyticsSummary?.todayVisitors || 1}</p>
                </div>
                <div className="bg-neutral-950 p-5 rounded-3xl border border-neutral-800 space-y-1">
                  <span className="text-[11px] font-bold text-neutral-400">Total Pageviews</span>
                  <p className="text-3xl font-serif font-bold text-white">{analyticsSummary?.totalPageviews || 1}</p>
                </div>
                <div className="bg-neutral-950 p-5 rounded-3xl border border-neutral-800 space-y-1">
                  <span className="text-[11px] font-bold text-emerald-400">Inquiries Generated</span>
                  <p className="text-3xl font-serif font-bold text-emerald-400">{enquiries.length}</p>
                </div>
                <div className="bg-neutral-950 p-5 rounded-3xl border border-neutral-800 space-y-1">
                  <span className="text-[11px] font-bold text-brand-gold">Conversion Rate</span>
                  <p className="text-3xl font-serif font-bold text-brand-gold">{analyticsSummary?.conversionRate || '12.5%'}</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-400">
                🔒 <strong>Secure & Private:</strong> Zero third-party trackers or external cookies. All analytics reside exclusively on your private server.
              </div>
            </div>
          )}

          {/* ========================================================
              SECTION 7.5: ADMIN AGENT OPERATIONS COPILOT
             ======================================================== */}
          {activeTab === 'admin_copilot' && (
            <div className="space-y-6 animate-fadeIn">
              <AdminAgentCopilot onCatalogueUpdated={loadAllData} />
            </div>
          )}

          {/* ========================================================
              SECTION 8: MASTER AGENT & MULTI-AGENT SUPERVISION
             ======================================================== */}
          {activeTab === 'agent' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-white">👑 Master Agent Supervision &amp; Orchestration</h2>
                  <p className="text-xs text-neutral-400">Owner-level multi-agent supervision, prompt rule versioning, and voice operations console.</p>
                </div>
                <div className="bg-neutral-950 p-1 rounded-2xl border border-neutral-800 flex">
                  <button
                    onClick={() => setAgentSubtab('orchestration')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                      agentSubtab === 'orchestration' ? 'bg-brand-primary text-white shadow-xs' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Agent Supervision
                  </button>
                  <button
                    onClick={() => setAgentSubtab('voice')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                      agentSubtab === 'voice' ? 'bg-brand-primary text-white shadow-xs' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Voice Agent Console
                  </button>
                  <button
                    onClick={() => setAgentSubtab('memory')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                      agentSubtab === 'memory' ? 'bg-brand-primary text-white shadow-xs' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Learned Rules ({agentMemories.length})
                  </button>
                  <button
                    onClick={() => setAgentSubtab('workflows')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                      agentSubtab === 'workflows' ? 'bg-brand-primary text-white shadow-xs' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Workflows ({agentWorkflows.length})
                  </button>
                </div>
              </div>

              {/* Subtab 0: Master Agent Orchestration Workspace */}
              {agentSubtab === 'orchestration' && (
                <div className="space-y-4">
                  <MasterAgentWorkspace />
                </div>
              )}

              {/* Subtab 1: Voice & Chat Interface */}
              {agentSubtab === 'voice' && (
                <div className="space-y-4">
                  <MasterAgentVoiceWidget onActionCompleted={loadAllData} />
                </div>
              )}

              {/* Subtab 2: Layer B - Learned Business Memories */}
              {agentSubtab === 'memory' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-neutral-400">Learned business policies remembered by the AI (discount structures, laundry rates, power backup rules):</p>
                    <button
                      onClick={() => setIsAddMemoryModalOpen(true)}
                      className="px-3.5 py-1.5 rounded-xl royal-gradient text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5 text-brand-gold" />
                      <span>+ Add Business Rule</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {agentMemories.map(mem => (
                      <div key={mem.id} className="bg-neutral-950 p-5 rounded-3xl border border-neutral-800 space-y-3">
                        <div className="flex items-start justify-between">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-neutral-900 text-brand-gold uppercase">
                            {mem.category}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            mem.approvalStatus === 'approved' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                          }`}>
                            {mem.approvalStatus === 'approved' ? 'Approved' : 'Pending Approval'}
                          </span>
                        </div>
                        <p className="text-xs text-white font-medium leading-relaxed">{mem.content}</p>
                        <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-xs">
                          <button
                            onClick={() => handleToggleMemoryApproval(mem)}
                            className="text-[11px] text-brand-gold hover:underline font-bold"
                          >
                            {mem.approvalStatus === 'approved' ? 'Revoke Approval' : 'Approve Rule'}
                          </button>
                          <button
                            onClick={() => handleDeleteMemory(mem.id)}
                            className="text-[11px] text-rose-400 hover:text-rose-300 font-bold"
                          >
                            Delete Rule
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Subtab 3: Layer C - Learned Executable Workflows */}
              {agentSubtab === 'workflows' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {agentWorkflows.map(wf => (
                      <div key={wf.id} className="bg-neutral-950 p-5 rounded-3xl border border-neutral-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-brand-gold uppercase">{wf.id}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300">Active</span>
                        </div>
                        <h4 className="font-serif font-bold text-sm text-white">{wf.name}</h4>
                        <p className="text-xs text-neutral-400">{wf.description}</p>
                        <div className="space-y-1.5 pt-2 border-t border-neutral-800 text-[11px]">
                          <strong className="text-neutral-300 block text-[10px] uppercase">Sequential Execution Steps:</strong>
                          {(wf.steps || []).map(s => (
                            <div key={s.step} className="flex items-center gap-2 text-neutral-400">
                              <span className="w-4 h-4 rounded-full bg-neutral-900 text-brand-gold font-bold flex items-center justify-center text-[10px]">
                                {s.step}
                              </span>
                              <span>{s.description || s.tool}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================
              SECTION 9: MARKETING STUDIO & REAL FFMPEG REELS
             ======================================================== */}
          {activeTab === 'marketing' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-white">🎬 AI Marketing & Video Reel Studio</h2>
                  <p className="text-xs text-neutral-400">Render real MP4 video reels from genuine gallery photos with FFmpeg Ken Burns zoom, Lucknow branding, and hashtags.</p>
                </div>
                <div className="bg-neutral-950 p-1 rounded-2xl border border-neutral-800 flex">
                  <button
                    onClick={() => setMarketingSubtab('lawn_reels')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                      marketingSubtab === 'lawn_reels' ? 'bg-brand-primary text-white shadow-xs' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    🌿 Dwarka Shri Lawn Reels ({lawnReels.length})
                  </button>
                  <button
                    onClick={() => setMarketingSubtab('reels')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                      marketingSubtab === 'reels' ? 'bg-brand-primary text-white shadow-xs' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Cinematic Reels ({renderedReels.length})
                  </button>
                  <button
                    onClick={() => setMarketingSubtab('media')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                      marketingSubtab === 'media' ? 'bg-brand-primary text-white shadow-xs' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Media Library ({marketingMedia.length})
                  </button>
                  <button
                    onClick={() => setMarketingSubtab('portfolios')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                      marketingSubtab === 'portfolios' ? 'bg-brand-primary text-white shadow-xs' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Client Portfolios ({portfolios.length})
                  </button>
                </div>
              </div>

              
              {/* Subtab 0: Dwarka Shri Lawn Verified 7 Reels */}
              {marketingSubtab === 'lawn_reels' && (
                <div className="space-y-6">
                  <div className="bg-neutral-950 p-6 rounded-3xl border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Film className="w-5 h-5 text-amber-400" />
                        <h3 className="font-serif font-bold text-base text-white">Dwarka Shri Lawn — 7 Verified Video Reels (9:16)</h3>
                      </div>
                      <p className="text-xs text-neutral-400 mt-1">
                        Vertical 9:16 reels produced from genuine venue footage, featured live across the customer website.
                      </p>
                    </div>
                    <a
                      href="/media/lawn/DwarakaShreevideo.mp4"
                      download="Dwarka_Shri_Lawn_Master.mp4"
                      className="px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-brand-gold hover:text-white text-xs font-bold transition flex items-center gap-2 self-start sm:self-auto"
                    >
                      <Download className="w-4 h-4" />
                      <span>Master Source Video (19.3 MB)</span>
                    </a>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {lawnReels.map((reel) => (
                      <div key={reel.id} className="bg-neutral-950 rounded-3xl overflow-hidden border border-neutral-800 flex flex-col justify-between group">
                        <div className="relative aspect-[9/16] max-h-80 w-full bg-neutral-900 overflow-hidden flex items-center justify-center">
                          <img src={reel.coverUrl} alt={reel.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
                          <button
                            onClick={() => setActivePreviewVideo({ ...reel, format: '9:16' })}
                            className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-black/70 backdrop-blur-xs text-white flex items-center justify-center border border-white/30 hover:scale-110 transition shadow-xl"
                          >
                            <Play className="w-6 h-6 text-brand-gold fill-brand-gold ml-1" />
                          </button>
                          <div className="absolute top-3 left-3 right-3 flex justify-between items-center text-xs">
                            <span className="px-2 py-0.5 rounded-full bg-black/70 text-[10px] font-bold text-brand-gold">
                              {reel.category}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-black/70 text-[10px] font-mono text-neutral-300">
                              {reel.duration}s
                            </span>
                          </div>
                          <div className="absolute bottom-3 left-3 right-3 text-white">
                            <p className="text-[10px] text-brand-gold font-bold uppercase">{reel.areaTag}</p>
                            <h4 className="text-xs font-serif font-bold line-clamp-1">{reel.title}</h4>
                          </div>
                        </div>

                        <div className="p-4 space-y-3">
                          <p className="text-[11px] text-neutral-400 line-clamp-2">{reel.description}</p>
                          <div className="pt-2 border-t border-neutral-800 flex items-center justify-between gap-2 text-xs">
                            <button
                              onClick={() => {
                                const shareText = `Dwarka Shri Lawn (Kanpur Road, Lucknow) Video Reel: ${window.location.origin}/lawn#${reel.id} — ${reel.title}`;
                                window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
                              }}
                              className="flex-1 py-1.5 px-2 rounded-lg bg-green-600/20 hover:bg-green-600/30 text-green-400 font-bold text-[11px] flex items-center justify-center gap-1"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                              <span>WhatsApp</span>
                            </button>
                            <a
                              href={reel.videoUrl}
                              download={reel.filename}
                              className="p-2 rounded-lg bg-neutral-900 border border-neutral-700 text-neutral-300 hover:text-white"
                              title="Download MP4"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Subtab 1: Reel Creator & Rendered Reels */}
              {marketingSubtab === 'reels' && (
                <div className="space-y-6">
                  {/* Reel Generator Card */}
                  <div className="bg-neutral-950 p-6 rounded-3xl border border-neutral-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Film className="w-5 h-5 text-amber-400" />
                        <h3 className="font-serif font-bold text-base text-white">FFmpeg Reel Rendering Engine</h3>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                        Ken Burns Slow Zoompan
                      </span>
                    </div>

                    <form onSubmit={handleRenderReel} className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                      <div className="sm:col-span-2">
                        <label className="block text-neutral-400 mb-1 font-semibold">Reel Title</label>
                        <input
                          type="text"
                          required
                          value={reelFormData.title}
                          onChange={(e) => setReelFormData({ ...reelFormData, title: e.target.value })}
                          className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-neutral-400 mb-1 font-semibold">Aspect Ratio</label>
                        <select
                          value={reelFormData.format}
                          onChange={(e) => setReelFormData({ ...reelFormData, format: e.target.value })}
                          className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-semibold"
                        >
                          <option value="9:16">Vertical Reel (9:16 - 1080x1920)</option>
                          <option value="1:1">Square Post (1:1 - 1080x1080)</option>
                          <option value="16:9">Landscape Video (16:9 - 1920x1080)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-neutral-400 mb-1 font-semibold">Duration</label>
                        <select
                          value={reelFormData.duration}
                          onChange={(e) => setReelFormData({ ...reelFormData, duration: parseInt(e.target.value, 10) })}
                          className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-semibold"
                        >
                          <option value="15">15 Seconds (Story / Shorts)</option>
                          <option value="30">30 Seconds (Instagram Reel)</option>
                          <option value="60">60 Seconds (Showcase Video)</option>
                        </select>
                      </div>

                      <div className="sm:col-span-4 pt-2">
                        <button
                          type="submit"
                          disabled={isRenderingReel}
                          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 font-black text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {isRenderingReel ? (
                            <>
                              <div className="w-4 h-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                              <span>Rendering FFmpeg Video (Please wait)...</span>
                            </>
                          ) : (
                            <>
                              <Clapperboard className="w-4 h-4 text-neutral-950" />
                              <span>🎬 Render Real MP4 Video Reel</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Rendered Reels Gallery */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {renderedReels.map(reel => (
                      <div key={reel.id} className="bg-neutral-950 rounded-3xl overflow-hidden border border-neutral-800 space-y-3 flex flex-col justify-between">
                        <div className="relative aspect-9/16 max-h-80 w-full bg-neutral-900 overflow-hidden flex items-center justify-center">
                          <img src={reel.coverUrl} alt={reel.title} className="w-full h-full object-cover" />
                          <button
                            onClick={() => setActivePreviewVideo(reel)}
                            className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-black/70 backdrop-blur-xs text-white flex items-center justify-center border border-white/30 hover:scale-110 transition shadow-xl"
                          >
                            <Play className="w-6 h-6 text-brand-gold fill-brand-gold ml-1" />
                          </button>
                          <span className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-black/80 text-[10px] font-bold text-amber-300">
                            {reel.format} &bull; {reel.duration}s
                          </span>
                        </div>

                        <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="font-serif font-bold text-sm text-white">{reel.title}</h4>
                            <p className="text-[11px] text-neutral-400 line-clamp-2 mt-1">{reel.caption}</p>
                          </div>

                          <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-xs">
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(reel.caption);
                                showToast('Caption and hashtags copied to clipboard!');
                              }}
                              className="text-neutral-400 hover:text-white flex items-center gap-1 font-semibold"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy Tags</span>
                            </button>
                            <a
                              href={reel.videoUrl}
                              download
                              className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold flex items-center gap-1 shadow-xs"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download MP4</span>
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Subtab 2: Media Library */}
              {marketingSubtab === 'media' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                    {marketingMedia.slice(0, 36).map(m => (
                      <div key={m.id} className="bg-neutral-950 rounded-2xl overflow-hidden border border-neutral-800 space-y-1 pb-2">
                        <div className="aspect-square bg-neutral-900 relative">
                          <img src={m.filePath} alt={m.title} className="w-full h-full object-cover" />
                          <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[8px] bg-black/80 text-brand-gold uppercase font-bold">
                            {m.category.split(' ')[0]}
                          </span>
                        </div>
                        <p className="text-[10px] font-semibold text-neutral-300 px-2 truncate">{m.title}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Subtab 3: Portfolios */}
              {marketingSubtab === 'portfolios' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {portfolios.map(p => (
                      <div key={p.id} className="bg-neutral-950 p-5 rounded-3xl border border-neutral-800 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[10px] font-bold text-brand-gold uppercase">{p.category}</span>
                            <h3 className="font-serif font-bold text-base text-white">{p.title}</h3>
                            <p className="text-xs text-neutral-400">{p.subtitle}</p>
                          </div>
                        </div>
                        <p className="text-xs text-neutral-300 leading-relaxed">{p.description}</p>
                        <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-xs">
                          <span className="text-neutral-400 text-[10px]">Link: {p.shareableUrl}</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(p.whatsappMessage);
                              showToast('WhatsApp share message copied to clipboard!');
                            }}
                            className="px-3 py-1 rounded-xl bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 font-bold flex items-center gap-1"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                            <span>WhatsApp Share</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================
              SECTION 10: BILLS & INVOICES
             ======================================================== */}
          {activeTab === 'invoices' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-white">📄 Formal Invoices & Billing</h2>
                  <p className="text-xs text-neutral-400">Official GST invoices (INV-YYYY-XXXX), balance tracking, and printable letterhead billing.</p>
                </div>
                <button
                  onClick={() => setIsGenerateInvoiceModalOpen(true)}
                  className="px-4 py-2 rounded-xl royal-gradient text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
                >
                  <Plus className="w-4 h-4 text-brand-gold" />
                  <span>+ Generate New Invoice</span>
                </button>
              </div>

              {/* Invoices Table */}
              <div className="bg-neutral-950 rounded-3xl border border-neutral-800 overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs text-neutral-300">
                  <thead className="bg-neutral-900/90 text-neutral-400 uppercase text-[10px] tracking-wider border-b border-neutral-800">
                    <tr>
                      <th className="p-4">Invoice Number</th>
                      <th className="p-4">Customer Name & Phone</th>
                      <th className="p-4">Event Date</th>
                      <th className="p-4">Total Amount (₹)</th>
                      <th className="p-4">Advance Paid</th>
                      <th className="p-4">Balance Due</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Print / Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/80">
                    {invoices.map(inv => (
                      <tr key={inv.id} className="hover:bg-neutral-900/40 transition">
                        <td className="p-4 font-mono font-bold text-brand-gold">{inv.invoiceNumber}</td>
                        <td className="p-4">
                          <strong className="text-white block font-serif">{inv.customerName}</strong>
                          <span className="font-mono text-neutral-400 text-[11px]">{inv.phone}</span>
                        </td>
                        <td className="p-4 font-mono">{inv.eventDate}</td>
                        <td className="p-4 font-mono font-bold text-white">₹{inv.grandTotal?.toLocaleString('en-IN')}</td>
                        <td className="p-4 font-mono text-emerald-400 font-bold">₹{inv.advancePaid?.toLocaleString('en-IN')}</td>
                        <td className="p-4 font-mono text-rose-400 font-bold">₹{inv.balanceDue?.toLocaleString('en-IN')}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            inv.paymentStatus === 'Fully Paid' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                          }`}>
                            {inv.paymentStatus}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => setViewingInvoice(inv)}
                            className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 text-xs font-bold transition inline-flex items-center gap-1"
                          >
                            <Printer className="w-3.5 h-3.5 text-brand-gold" />
                            <span>View / Print</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================
              SECTION 11: SETTINGS & VENUE PROFILE
             ======================================================== */}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="pb-4 border-b border-neutral-800">
                <h2 className="text-2xl font-serif font-bold text-white">⚙️ Dwarka Shri Lawn & Business Settings</h2>
                <p className="text-xs text-neutral-400">Official business specifications, guest capacity metrics, and contact hotline on Kanpur Road, Lucknow.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-neutral-950 p-6 rounded-3xl border border-neutral-800 space-y-4">
                  <div className="flex items-center gap-2">
                    <Building className="w-5 h-5 text-brand-gold" />
                    <h3 className="font-serif font-bold text-base text-white">Official Business Address (NAP)</h3>
                  </div>
                  <div className="text-xs space-y-2 text-neutral-300">
                    <p><strong>Business Entity:</strong> Kandhari Tent & Caterers</p>
                    <p><strong>Signature Venue:</strong> Dwarka Shri Lawn</p>
                    <p><strong>Address:</strong> Opp. Pillar No. 37, Daroga Kheda, Kanpur Road, Lucknow, UP 226008</p>
                    <p><strong>Helpline Phone:</strong> 1800-890-3456</p>
                    <p><strong>WhatsApp Support:</strong> +91-1800-890-3456</p>
                  </div>
                </div>

                <div className="bg-neutral-950 p-6 rounded-3xl border border-neutral-800 space-y-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <h3 className="font-serif font-bold text-base text-white">Lawn Capacity & Specifications</h3>
                  </div>
                  <div className="text-xs space-y-2 text-neutral-300">
                    <p><strong>Guest Capacity:</strong> 1,200+ Guests (Expansive Natural Lawn)</p>
                    <p><strong>Parking Facility:</strong> 200+ Four-Wheeler Parking Bays</p>
                    <p><strong>Weatherproof Canopy:</strong> German Hangar Shed (All-Weather)</p>
                    <p><strong>Guest Rooms:</strong> 2 Air-Conditioned (AC) Suites for Bride & Family</p>
                    <p><strong>Power Backup:</strong> 62.5 KVA Silent Generator Backup</p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      
      {/* Transcript Viewing Modal */}
      {viewingTranscriptCall && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-neutral-950 rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-neutral-800 max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center pb-4 border-b border-neutral-800">
              <div>
                <h3 className="font-serif font-bold text-base text-white">Call Transcript: {viewingTranscriptCall.callId}</h3>
                <p className="text-xs text-neutral-400 font-mono mt-0.5">Caller: {viewingTranscriptCall.callerName} ({viewingTranscriptCall.callerPhone})</p>
              </div>
              <button onClick={() => setViewingTranscriptCall(null)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 py-4">
              {(viewingTranscriptCall.transcript || []).map((t, idx) => (
                <div key={idx} className={`p-3 rounded-2xl text-xs ${t.speaker === 'Veronica' ? 'bg-purple-950/40 border border-purple-800/40 text-purple-200' : 'bg-neutral-900 border border-neutral-800 text-neutral-200'}`}>
                  <div className="font-bold text-[10px] uppercase tracking-wider text-neutral-400 mb-1">{t.speaker} &bull; {t.timestamp}</div>
                  <div className="leading-relaxed font-sans">{t.text}</div>
                </div>
              ))}
            </div>
            <div className="pt-4 border-t border-neutral-800 flex justify-end">
              <button onClick={() => setViewingTranscriptCall(null)} className="py-2 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-Browser Telephony Call Simulator Modal */}
      <VeronicaCallSimulatorModal
        isOpen={isVeronicaModalOpen}
        onClose={() => setIsVeronicaModalOpen(false)}
        onCallCompleted={loadAllData}
      />

      {/* ========================================================
          VIDEO REEL PREVIEW MODAL
         ======================================================== */}
      {activePreviewVideo && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-neutral-950 rounded-3xl max-w-sm w-full overflow-hidden border border-neutral-700 shadow-2xl flex flex-col">
            <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
              <h3 className="font-serif font-bold text-sm text-white truncate">{activePreviewVideo.title}</h3>
              <button onClick={() => setActivePreviewVideo(null)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="relative aspect-9/16 max-h-[70vh] bg-black">
              <video
                src={activePreviewVideo.videoUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>
            <div className="p-4 border-t border-neutral-800 flex items-center justify-between text-xs">
              <span className="text-neutral-400 text-[11px] font-mono">{activePreviewVideo.format} &bull; {activePreviewVideo.duration}s</span>
              <a
                href={activePreviewVideo.videoUrl}
                download
                className="px-4 py-2 rounded-xl bg-amber-400 text-neutral-950 font-bold flex items-center gap-1.5 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save to Phone/PC</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: RECORD OUTSIDE PAYMENT
         ======================================================== */}
      {isOutsidePaymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-neutral-950 rounded-3xl max-w-md w-full p-6 border border-neutral-700 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-neutral-800">
              <h3 className="font-serif font-bold text-base text-white">Record External Operational Expense</h3>
              <button onClick={() => setIsOutsidePaymentModalOpen(false)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleRecordOutsidePayment} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block text-neutral-300 mb-1 font-bold">Recipient Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Dhobi (Laundry)"
                  value={outsidePaymentForm.recipientName}
                  onChange={(e) => setOutsidePaymentForm({ ...outsidePaymentForm, recipientName: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 mb-1 font-bold">Category (Category) *</label>
                  <select
                    value={outsidePaymentForm.category}
                    onChange={(e) => setOutsidePaymentForm({ ...outsidePaymentForm, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white"
                  >
                    <option value="dhobi">Laundry (Cloth Washing)</option>
                    <option value="supplier">Suppliers (Bamboo, Hardware, Pipes)</option>
                    <option value="outside_worker">External Technician / Generator Operator</option>
                    <option value="logistics">Vehicle Transport / Cartage</option>
                    <option value="other">Other Expenses</option>
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-300 mb-1 font-bold">Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="1200"
                    value={outsidePaymentForm.amount}
                    onChange={(e) => setOutsidePaymentForm({ ...outsidePaymentForm, amount: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-300 mb-1 font-bold">Purpose & Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Washing 100 chair covers and 20 table cloths"
                  value={outsidePaymentForm.purpose}
                  onChange={(e) => setOutsidePaymentForm({ ...outsidePaymentForm, purpose: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 mb-1 font-bold">Payment Method *</label>
                  <select
                    value={outsidePaymentForm.paymentMethod}
                    onChange={(e) => setOutsidePaymentForm({ ...outsidePaymentForm, paymentMethod: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white"
                  >
                    <option value="Cash">Cash in Hand</option>
                    <option value="Direct UPI">UPI (GPay / PhonePe)</option>
                    <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-300 mb-1 font-bold">Receipt No. (Ref No.)</label>
                  <input
                    type="text"
                    placeholder="CASH-4912"
                    value={outsidePaymentForm.referenceNumber}
                    onChange={(e) => setOutsidePaymentForm({ ...outsidePaymentForm, referenceNumber: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition"
                >
                  Save Payment
                </button>
                <button
                  type="button"
                  onClick={() => setIsOutsidePaymentModalOpen(false)}
                  className="px-4 py-3 rounded-xl border border-neutral-700 text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: ADD NEW CUSTOMER
         ======================================================== */}
      {isAddCustomerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-neutral-950 rounded-3xl max-w-md w-full p-6 border border-neutral-700 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-neutral-800">
              <h3 className="font-serif font-bold text-base text-white">Add New Customer Profile</h3>
              <button onClick={() => setIsAddCustomerModalOpen(false)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                await api.registerCustomer({
                  name: newCustomerForm.name,
                  phone: newCustomerForm.phone,
                  email: newCustomerForm.email || `${newCustomerForm.phone}@kandhariclient.com`,
                  password: 'client@kandhari2026'
                });
                showToast(`Customer profile created: ${newCustomerForm.name}`);
                setIsAddCustomerModalOpen(false);
                setNewCustomerForm({ name: '', phone: '', email: '', notes: '' });
                loadAllData();
              } catch (err) {
                showToast(err.message || 'Failed to create customer profile', 'error');
              }
            }} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block text-neutral-300 mb-1 font-bold">Customer Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rajesh Verma"
                  value={newCustomerForm.name}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white"
                />
              </div>

              <div>
                <label className="block text-neutral-300 mb-1 font-bold">Mobile Number (10 Digits) *</label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="98390XXXXX"
                  value={newCustomerForm.phone}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, phone: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-neutral-300 mb-1 font-bold">Email Address (Optional)</label>
                <input
                  type="email"
                  placeholder="rajesh@example.com"
                  value={newCustomerForm.email}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, email: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl royal-gradient text-white font-bold text-xs shadow-md transition"
                >
                  Save Customer
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddCustomerModalOpen(false)}
                  className="px-4 py-3 rounded-xl border border-neutral-700 text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: GENERATE INVOICE BILL
         ======================================================== */}
      {isGenerateInvoiceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-neutral-950 rounded-3xl max-w-lg w-full p-6 border border-neutral-700 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-neutral-800">
              <h3 className="font-serif font-bold text-base text-white">Generate Formal Invoice (INV)</h3>
              <button onClick={() => setIsGenerateInvoiceModalOpen(false)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleGenerateInvoice} className="space-y-4 pt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 mb-1 font-bold">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={invoiceForm.customerName}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, customerName: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 mb-1 font-bold">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={invoiceForm.phone}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 mb-1 font-bold">Event Date *</label>
                  <input
                    type="date"
                    required
                    value={invoiceForm.eventDate}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, eventDate: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 mb-1 font-bold">Event Venue</label>
                  <input
                    type="text"
                    value={invoiceForm.eventVenue}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, eventVenue: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-neutral-300 mb-1 font-bold">Items &amp; Service Total (₹)</label>
                  <input
                    type="number"
                    value={invoiceForm.subtotal}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, subtotal: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 mb-1 font-bold">Cartage & Labour Charges (₹)</label>
                  <input
                    type="number"
                    value={invoiceForm.cartage + invoiceForm.labour}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, cartage: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 mb-1 font-bold">Advance Deposit Received (₹)</label>
                  <input
                    type="number"
                    value={invoiceForm.advancePaid}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, advancePaid: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-mono font-bold text-emerald-400"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl royal-gradient text-white font-bold text-xs shadow-md transition"
                >
                  Issue Invoice
                </button>
                <button
                  type="button"
                  onClick={() => setIsGenerateInvoiceModalOpen(false)}
                  className="px-4 py-3 rounded-xl border border-neutral-700 text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: VIEW & PRINT INVOICE LETTERHEAD
         ======================================================== */}
      {viewingInvoice && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white text-neutral-900 rounded-3xl max-w-2xl w-full p-8 shadow-2xl border border-neutral-300 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-start pb-6 border-b-2 border-brand-primary">
              <div>
                <h2 className="font-serif font-black text-2xl text-brand-primary">Kandhari Tent & Caterers</h2>
                <p className="text-xs font-semibold text-brand-goldDark">Dwarka Shri Lawn &bull; Kanpur Road, Lucknow</p>
                <p className="text-[11px] text-neutral-500 mt-1">Opp. Pillar No. 37, Daroga Kheda, Lucknow &bull; Helpline: 1800-890-3456</p>
              </div>
              <div className="text-right">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-brand-primary text-white font-mono">
                  {viewingInvoice.invoiceNumber}
                </span>
                <p className="text-[11px] text-neutral-500 font-mono mt-1">Date: {viewingInvoice.createdAt?.split('T')[0]}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 py-4 border-b border-neutral-200 text-xs">
              <div>
                <span className="text-neutral-500 block">Billed To:</span>
                <strong className="text-sm font-serif block">{viewingInvoice.customerName}</strong>
                <span className="font-mono text-neutral-700">{viewingInvoice.phone}</span>
                <p className="text-neutral-600 mt-0.5">{viewingInvoice.billingAddress}</p>
              </div>
              <div className="text-right">
                <span className="text-neutral-500 block">Event Venue:</span>
                <strong className="block">{viewingInvoice.eventVenue}</strong>
                <span className="font-mono text-neutral-700">Date: {viewingInvoice.eventDate}</span>
                <p className="text-neutral-600 mt-0.5">Service: {viewingInvoice.serviceRequired}</p>
              </div>
            </div>

            <div className="py-4 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-neutral-100">
                <span className="font-semibold text-neutral-700">Items & Catering Subtotal:</span>
                <span className="font-mono font-bold">₹{viewingInvoice.subtotal?.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-100">
                <span className="font-semibold text-neutral-700">Transport, Cartage & Labour:</span>
                <span className="font-mono">₹{((viewingInvoice.cartage || 0) + (viewingInvoice.labour || 0)).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-2 border-b-2 border-neutral-900 text-sm">
                <span className="font-black text-brand-primary">Grand Total Bill Amount:</span>
                <span className="font-black text-brand-primary font-mono">₹{viewingInvoice.grandTotal?.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1 text-emerald-700 font-bold">
                <span>Advance Amount Received:</span>
                <span className="font-mono">₹{viewingInvoice.advancePaid?.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-2 bg-rose-50 p-3 rounded-xl border border-rose-200 text-sm font-bold text-rose-800">
                <span>Balance Payable Due:</span>
                <span className="font-mono">₹{viewingInvoice.balanceDue?.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="pt-4 flex justify-between items-center text-xs">
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primaryDark text-white font-bold flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Save PDF</span>
              </button>
              <button
                onClick={() => setViewingInvoice(null)}
                className="px-4 py-2.5 rounded-xl border border-neutral-300 text-neutral-600 font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: RECORD WAGE DISBURSEMENT
         ======================================================== */}
      {isDisbursementModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-neutral-950 rounded-3xl max-w-md w-full p-6 border border-neutral-700 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-neutral-800">
              <h3 className="font-serif font-bold text-base text-white">Issue Worker Wage Payment Receipt</h3>
              <button onClick={() => setIsDisbursementModalOpen(false)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleRecordDisbursement} className="space-y-4 pt-4 text-xs">
              <div className="p-3 bg-neutral-900 rounded-2xl border border-neutral-800">
                <p className="font-bold text-white text-sm">{disbursementFormData.staffName}</p>
                <p className="text-neutral-400 mt-0.5">Attendance Date: <strong className="text-white">{attendanceDate}</strong></p>
              </div>

              <div>
                <label className="block text-neutral-300 mb-1 font-bold">Payment Amount (₹) *</label>
                <input
                  type="number"
                  required
                  min="50"
                  value={disbursementFormData.amount}
                  onChange={(e) => setDisbursementFormData({ ...disbursementFormData, amount: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-emerald-400 font-mono font-bold text-base"
                />
              </div>

              <div>
                <label className="block text-neutral-300 mb-1 font-bold">Payment Method *</label>
                <select
                  value={disbursementFormData.paymentMethod}
                  onChange={(e) => setDisbursementFormData({ ...disbursementFormData, paymentMethod: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-semibold"
                >
                  <option value="Cash">Cash in Hand</option>
                  <option value="Direct UPI">Direct UPI (GPay / PhonePe / Paytm)</option>
                  <option value="Bank Transfer">Bank Transfer (IMPS / NEFT)</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-300 mb-1 font-bold">Receipt / Reference Number</label>
                <input
                  type="text"
                  value={disbursementFormData.referenceNumber}
                  onChange={(e) => setDisbursementFormData({ ...disbursementFormData, referenceNumber: e.target.value })}
                  placeholder="CASH-9821"
                  className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-mono"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition"
                >
                  Record Payment
                </button>
                <button
                  type="button"
                  onClick={() => setIsDisbursementModalOpen(false)}
                  className="px-4 py-3 rounded-xl border border-neutral-700 text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: ADJUST PHYSICAL STOCK
         ======================================================== */}
      {isStockModalOpen && stockModalItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-neutral-950 rounded-3xl max-w-md w-full p-6 border border-neutral-700 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-neutral-800">
              <h3 className="font-serif font-bold text-base text-white">Warehouse Stock Adjustment</h3>
              <button onClick={() => setIsStockModalOpen(false)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleStockAdjustSubmit} className="space-y-4 pt-4 text-xs">
              <div className="p-3 bg-neutral-900 rounded-2xl border border-neutral-800">
                <p className="font-bold text-white text-sm">{stockModalItem.name}</p>
                <p className="text-neutral-400 mt-0.5">Current Total Stock: <strong className="text-white">{stockModalItem.totalStock}</strong> &bull; Available: <strong className="text-emerald-400">{stockModalItem.availableStock}</strong></p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 mb-1 font-bold">Adjustment Action *</label>
                  <select
                    value={stockAdjustmentForm.actionType}
                    onChange={(e) => setStockAdjustmentForm({ ...stockAdjustmentForm, actionType: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white"
                  >
                    <option value="restock">New Stock Purchase (+ Purchase)</option>
                    <option value="damage">Damaged at Event (+ Damage)</option>
                    <option value="repair">Repaired Stock Returned (Repair Done)</option>
                    <option value="audit_correction">Physical Audit Recount (Set Stock)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-300 mb-1 font-bold">Quantity *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={stockAdjustmentForm.quantity}
                    onChange={(e) => setStockAdjustmentForm({ ...stockAdjustmentForm, quantity: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-300 mb-1 font-bold">Reason &amp; Operational Notes</label>
                <input
                  type="text"
                  value={stockAdjustmentForm.notes}
                  onChange={(e) => setStockAdjustmentForm({ ...stockAdjustmentForm, notes: e.target.value })}
                  placeholder="e.g. Broken at wedding venue or fresh stock shipment arrived"
                  className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl royal-gradient text-white font-bold text-xs shadow-md transition"
                >
                  Update Stock
                </button>
                <button
                  type="button"
                  onClick={() => setIsStockModalOpen(false)}
                  className="px-4 py-3 rounded-xl border border-neutral-700 text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: RECORD CASH ADVANCE
         ======================================================== */}
      {isAdvanceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-neutral-950 rounded-3xl max-w-md w-full p-6 border border-neutral-700 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-neutral-800">
              <h3 className="font-serif font-bold text-base text-white">Record Worker Cash Advance</h3>
              <button onClick={() => setIsAdvanceModalOpen(false)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleRecordAdvanceSubmit} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block text-neutral-300 mb-1 font-bold">Select Employee *</label>
                <select
                  required
                  value={advanceFormData.staffId}
                  onChange={(e) => setAdvanceFormData({ ...advanceFormData, staffId: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-semibold"
                >
                  <option value="">-- Choose Worker --</option>
                  {staffList.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.category})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-neutral-300 mb-1 font-bold">Advance Amount (₹) *</label>
                <input
                  type="number"
                  required
                  min="50"
                  step="50"
                  value={advanceFormData.amount}
                  onChange={(e) => setAdvanceFormData({ ...advanceFormData, amount: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-amber-400 font-mono font-bold text-base"
                />
              </div>

              <div>
                <label className="block text-neutral-300 mb-1 font-bold">Date of Advance *</label>
                <input
                  type="date"
                  required
                  value={advanceFormData.date}
                  onChange={(e) => setAdvanceFormData({ ...advanceFormData, date: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-neutral-300 mb-1 font-bold">Reason / Notes</label>
                <input
                  type="text"
                  value={advanceFormData.notes}
                  onChange={(e) => setAdvanceFormData({ ...advanceFormData, notes: e.target.value })}
                  placeholder="e.g. Festival travel advance, medical emergency"
                  className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold text-xs shadow-md transition"
                >
                  Save Advance
                </button>
                <button
                  type="button"
                  onClick={() => setIsAdvanceModalOpen(false)}
                  className="px-4 py-3 rounded-xl border border-neutral-700 text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: ADD / EDIT STAFF
         ======================================================== */}
      {isStaffModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-neutral-950 rounded-3xl max-w-md w-full p-6 border border-neutral-700 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-neutral-800">
              <h3 className="font-serif font-bold text-base text-white">Worker & Staff Profile</h3>
              <button onClick={() => setIsStaffModalOpen(false)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveStaffMember} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block text-neutral-300 mb-1 font-bold">Worker Full Name *</label>
                <input
                  type="text"
                  required
                  value={staffFormData.name}
                  onChange={(e) => setStaffFormData({ ...staffFormData, name: e.target.value })}
                  placeholder="e.g. Ram Prakash"
                  className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 mb-1 font-bold">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={staffFormData.phone}
                    onChange={(e) => setStaffFormData({ ...staffFormData, phone: e.target.value })}
                    placeholder="98390XXXXX"
                    className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 mb-1 font-bold">Category (Role) *</label>
                  <select
                    value={staffFormData.role}
                    onChange={(e) => setStaffFormData({ ...staffFormData, role: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white"
                  >
                    <option value="Labourer">Labourer</option>
                    <option value="Fitter">Tent & Lighting Fitter</option>
                    <option value="Driver">Transport Driver</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-300 mb-1 font-bold">Daily Wage Rate (₹) *</label>
                <input
                  type="number"
                  min="100"
                  required
                  value={staffFormData.dailyWage}
                  onChange={(e) => setStaffFormData({ ...staffFormData, dailyWage: parseInt(e.target.value, 10) || 500 })}
                  className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-brand-gold font-mono font-bold"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl royal-gradient text-white font-bold text-xs shadow-md transition"
                >
                  Save Worker Profile
                </button>
                <button
                  type="button"
                  onClick={() => setIsStaffModalOpen(false)}
                  className="px-4 py-3 rounded-xl border border-neutral-700 text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: ADD NEW BUSINESS MEMORY
         ======================================================== */}
      {isAddMemoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-neutral-950 rounded-3xl max-w-md w-full p-6 border border-neutral-700 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-neutral-800">
              <h3 className="font-serif font-bold text-base text-white">Add New Business Rule</h3>
              <button onClick={() => setIsAddMemoryModalOpen(false)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                await api.createAgentMemory(memoryForm);
                showToast('New business rule saved successfully');
                setIsAddMemoryModalOpen(false);
                setMemoryForm({ category: 'pricing_rule', type: 'business_preference', content: '' });
                loadAllData();
              } catch (err) {
                showToast('Failed to add rule', 'error');
              }
            }} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block text-neutral-300 mb-1 font-bold">Category (Category) *</label>
                <select
                  value={memoryForm.category}
                  onChange={(e) => setMemoryForm({ ...memoryForm, category: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white"
                >
                  <option value="pricing_rule">Pricing & Discount Rule</option>
                  <option value="supplier_rate">Supplier & Laundry Rates</option>
                  <option value="quotation_term">Quotation Terms & Conditions</option>
                  <option value="operational_rule">Operational & Warehouse Rules</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-300 mb-1 font-bold">Rule Description (Memory Content) *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Special 10% discount on stage decoration for events with over 400 guests."
                  value={memoryForm.content}
                  onChange={(e) => setMemoryForm({ ...memoryForm, content: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl royal-gradient text-white font-bold text-xs shadow-md transition"
                >
                  Save Business Rule
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddMemoryModalOpen(false)}
                  className="px-4 py-3 rounded-xl border border-neutral-700 text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: REGISTER NEW DELIVERY FLEET PARTNER
         ======================================================== */}
      {isAddPartnerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-neutral-950 rounded-3xl max-w-md w-full p-6 border border-neutral-700 shadow-2xl text-xs space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#7c3aed]" />
                <h3 className="font-serif font-bold text-base text-white">Register Delivery Fleet Driver</h3>
              </div>
              <button onClick={() => setIsAddPartnerModalOpen(false)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePartner} className="space-y-3 pt-1">
              <div>
                <label className="block text-neutral-300 mb-1 font-semibold">Driver Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Yadav"
                  value={newPartnerForm.name}
                  onChange={(e) => setNewPartnerForm({ ...newPartnerForm, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white outline-none focus:border-[#7c3aed]"
                />
              </div>

              <div>
                <label className="block text-neutral-300 mb-1 font-semibold">Contact Mobile Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 98390 11223"
                  value={newPartnerForm.phone}
                  onChange={(e) => setNewPartnerForm({ ...newPartnerForm, phone: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white outline-none focus:border-[#7c3aed]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-300 mb-1 font-semibold">Vehicle Type *</label>
                  <select
                    value={newPartnerForm.vehicleType}
                    onChange={(e) => setNewPartnerForm({ ...newPartnerForm, vehicleType: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white outline-none"
                  >
                    <option value="Tata Ace Gold / Utility Truck">Tata Ace Gold (750 Kg)</option>
                    <option value="Mahindra Bolero Maxi Truck">Mahindra Bolero Maxi (1.5 Tonne)</option>
                    <option value="14ft Eicher Heavy Canter">14ft Eicher Canter (4.0 Tonne)</option>
                    <option value="Piaggio Ape Auto Pickup">Piaggio Ape Auto Pickup</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-300 mb-1 font-semibold">Plate Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="UP 32 BK 4821"
                    value={newPartnerForm.vehicleNumber}
                    onChange={(e) => setNewPartnerForm({ ...newPartnerForm, vehicleNumber: e.target.value.toUpperCase() })}
                    className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-700 font-mono text-amber-300 uppercase outline-none focus:border-[#7c3aed]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-300 mb-1 font-semibold">Load Capacity</label>
                  <input
                    type="text"
                    placeholder="e.g. 1.5 Tonnes"
                    value={newPartnerForm.maxLoadCapacity}
                    onChange={(e) => setNewPartnerForm({ ...newPartnerForm, maxLoadCapacity: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-neutral-200 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 mb-1 font-semibold">Base Hub</label>
                  <input
                    type="text"
                    placeholder="Kanpur Road Depot"
                    value={newPartnerForm.baseHub}
                    onChange={(e) => setNewPartnerForm({ ...newPartnerForm, baseHub: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-neutral-200 outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold transition shadow-sm"
                >
                  Save Partner to Fleet
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddPartnerModalOpen(false)}
                  className="px-4 py-3 rounded-xl border border-neutral-700 text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: CONNECT DRIVER & ORDER APPROVAL (ZOMATO FLOW)
         ======================================================== */}
      {assignPartnerModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-neutral-950 rounded-3xl max-w-lg w-full p-6 border border-neutral-700 shadow-2xl text-xs space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-amber-300" />
                <h3 className="font-serif font-bold text-base text-white">Connect with Driver & Approve Order</h3>
              </div>
              <button onClick={() => setAssignPartnerModalOrder(null)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-neutral-900 rounded-2xl border border-neutral-800 space-y-1.5">
              <div className="flex justify-between items-center">
                <p className="font-bold text-white text-sm">Order #{assignPartnerModalOrder.id}</p>
                <span className="px-2 py-0.5 rounded-full bg-brand-primary/20 text-brand-gold font-mono font-bold text-[10px]">
                  ₹{(assignPartnerModalOrder.grandTotal || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <p className="text-neutral-300">
                Customer: <strong>{assignPartnerModalOrder.customerName}</strong> ({assignPartnerModalOrder.phone})
              </p>
              <p className="text-neutral-300">
                📍 Venue: <strong>{assignPartnerModalOrder.eventVenueAddress || assignPartnerModalOrder.locality || 'Kanpur Road, Lucknow'}</strong>
              </p>
              <div className="flex items-center gap-3 text-[11px] text-neutral-400 pt-1 border-t border-neutral-800">
                <span>Distance: <strong className="text-white">{assignPartnerModalOrder.distanceKm || assignPartnerModalOrder.locationInfo?.distanceKm || 3} km</strong></span>
                <span>Est. Transit: <strong className="text-white">{assignPartnerModalOrder.transitMinutes || 15} mins</strong></span>
                <span>Event Date: <strong className="text-white">{assignPartnerModalOrder.eventDate}</strong></span>
              </div>
            </div>

            <form onSubmit={handleAssignPartnerSubmit} className="space-y-3">
              <div>
                <label className="block text-neutral-300 mb-1 font-semibold">Select Available Fleet Driver *</label>
                <select
                  required
                  value={selectedPartnerIdForAssign}
                  onChange={(e) => setSelectedPartnerIdForAssign(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white outline-none focus:border-[#7c3aed]"
                >
                  <option value="">-- Choose available driver --</option>
                  {deliveryPartners.map((partner) => (
                    <option key={partner.id} value={partner.id}>
                      {partner.name} &bull; {partner.vehicleType} ({partner.vehicleNumber}) [{partner.status}]
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-neutral-300 mb-1 font-semibold">Quoted Delivery & Setup Time *</label>
                <input
                  type="text"
                  placeholder="e.g. Tomorrow 8:00 AM or Within 45 mins"
                  value={estimatedDeliveryTimeInput}
                  onChange={(e) => setEstimatedDeliveryTimeInput(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white outline-none focus:border-[#7c3aed]"
                />
              </div>

              <div className="p-3 bg-purple-950/40 rounded-xl border border-purple-800/40 text-[11px] text-purple-200 space-y-1">
                <p>🔔 Customer will immediately receive:</p>
                <ul className="list-disc pl-4 space-y-0.5 text-neutral-300">
                  <li>Portal Notification that order has been accepted with driver details.</li>
                  <li>Pre-filled WhatsApp message with live tracking link and driver contact.</li>
                  <li>Real-time Zomato-style tracking on website at <code>/track/{assignPartnerModalOrder.id}</code>.</li>
                </ul>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={handleConnectDriverRequest}
                  className="flex-1 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold transition flex items-center justify-center gap-1.5"
                >
                  <span>Connect with Driver</span>
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Accept & Assign Driver</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDriverApproveSubmit('reject')}
                  className="px-3 py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 font-bold transition"
                >
                  Reject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: LOCATION DETECTION & EMBEDDED MAPVIEW
         ======================================================== */}
      {locationModalEnquiry && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-neutral-950 rounded-3xl max-w-2xl w-full p-6 border border-neutral-700 shadow-2xl text-xs space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <Navigation className="w-5 h-5 text-blue-400" />
                <h3 className="font-serif font-bold text-base text-white">Requirement Location & Embedded Map View</h3>
              </div>
              <button onClick={() => setLocationModalEnquiry(null)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Geolocation & Distance Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 bg-neutral-900 rounded-2xl border border-neutral-800 space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-brand-gold flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Depot Hub Origin</span>
                </span>
                <p className="font-bold text-white text-xs">
                  {locationModalData?.origin?.name || 'Kandhari Tent House & Dwarka Shri Lawn Hub'}
                </p>
                <p className="text-[11px] text-neutral-400">
                  {locationModalData?.origin?.address || 'Opp. Pillar No. 37, Daroga Kheda, Kanpur Road, Lucknow'}
                </p>
                <p className="text-[10px] font-mono text-neutral-500">
                  Coords: {locationModalData?.origin?.lat || 26.7645}° N, {locationModalData?.origin?.lng || 80.8842}° E
                </p>
              </div>

              <div className="p-3.5 bg-neutral-900 rounded-2xl border border-neutral-800 space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-blue-400 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Customer Event Destination</span>
                </span>
                <p className="font-bold text-white text-xs">
                  {locationModalEnquiry.customerName} ({locationModalEnquiry.phone})
                </p>
                <p className="text-[11px] text-neutral-300">
                  {locationModalEnquiry.eventVenueAddress || locationModalEnquiry.locality || 'Kanpur Road, Lucknow'}
                </p>
                <p className="text-[10px] font-mono text-neutral-500">
                  Coords: {locationModalData?.destination?.lat || 26.8467}° N, {locationModalData?.destination?.lng || 80.9462}° E
                </p>
              </div>
            </div>

            {/* Metric Callouts */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 bg-neutral-900/80 rounded-xl border border-neutral-800 text-center">
                <span className="text-[10px] text-neutral-400 block uppercase font-semibold">Haversine Distance</span>
                <span className="text-lg font-bold text-brand-gold font-mono">
                  {locationModalData?.distanceKm || locationModalEnquiry.distanceKm || 3} km
                </span>
              </div>
              <div className="p-3 bg-neutral-900/80 rounded-xl border border-neutral-800 text-center">
                <span className="text-[10px] text-neutral-400 block uppercase font-semibold">Est. Transit Time</span>
                <span className="text-lg font-bold text-blue-300 font-mono">
                  {locationModalData?.transitMinutes || locationModalEnquiry.transitMinutes || 15} mins
                </span>
              </div>
              <div className="p-3 bg-neutral-900/80 rounded-xl border border-neutral-800 text-center">
                <span className="text-[10px] text-neutral-400 block uppercase font-semibold">Guest Headcount</span>
                <span className="text-lg font-bold text-emerald-400 font-mono">
                  {locationModalEnquiry.guestCount || 'Flexible'}
                </span>
              </div>
            </div>

            {/* Embedded Route Visualization */}
            <div className="p-4 bg-neutral-900 rounded-2xl border border-neutral-800 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-blue-400" />
                  <span>Depot to Venue Logistics Path</span>
                </span>
                <span className="text-[11px] text-emerald-400 font-medium">Clear Route via Kanpur Road Corridor</span>
              </div>

              {/* Visual Route Schematic SVG */}
              <div className="h-28 w-full bg-neutral-950 rounded-xl border border-neutral-800 flex items-center justify-between px-6 relative overflow-hidden">
                <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-blue-500/50" />
                <div className="z-10 flex flex-col items-center gap-1 bg-neutral-950 px-2 py-1 rounded-lg border border-neutral-800">
                  <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500 text-amber-400 flex items-center justify-center font-bold text-[10px]">
                    🏢
                  </div>
                  <span className="text-[10px] font-bold text-amber-300">Depot Hub</span>
                  <span className="text-[9px] text-neutral-500">Pillar 37</span>
                </div>

                <div className="z-10 bg-neutral-900 border border-neutral-700 px-3 py-1 rounded-full text-[10px] font-mono text-neutral-300 flex items-center gap-1 shadow-xs">
                  <Truck className="w-3 h-3 text-amber-400 animate-pulse" />
                  <span>{locationModalData?.distanceKm || locationModalEnquiry.distanceKm || 3} km</span>
                </div>

                <div className="z-10 flex flex-col items-center gap-1 bg-neutral-950 px-2 py-1 rounded-lg border border-neutral-800">
                  <div className="w-7 h-7 rounded-full bg-blue-500/20 border border-blue-500 text-blue-400 flex items-center justify-center font-bold text-[10px]">
                    📍
                  </div>
                  <span className="text-[10px] font-bold text-blue-300">Event Venue</span>
                  <span className="text-[9px] text-neutral-500 truncate max-w-[90px]">
                    {locationModalEnquiry.locality || 'Lucknow'}
                  </span>
                </div>
              </div>

              {/* Embedded Mapview Iframe */}
              <div className="rounded-xl overflow-hidden border border-neutral-800 h-48 bg-neutral-950">
                <iframe
                  title="Lucknow Route Map"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  marginHeight="0"
                  marginWidth="0"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=80.85%2C26.74%2C81.02%2C26.92&layer=mapnik&marker=${locationModalData?.destination?.lat || 26.8467}%2C${locationModalData?.destination?.lng || 80.9462}`}
                  className="opacity-85 hover:opacity-100 transition"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <a
                href={`https://www.google.com/maps/dir/?api=1&origin=26.7645,80.8842&destination=${encodeURIComponent(locationModalEnquiry.eventVenueAddress || locationModalEnquiry.locality || 'Lucknow')}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white font-semibold transition text-center flex items-center justify-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                <span>Open in Google Maps</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  const targetEnq = locationModalEnquiry;
                  setLocationModalEnquiry(null);
                  setAssignPartnerModalOrder(targetEnq);
                  setSelectedPartnerIdForAssign(deliveryPartners[0]?.id || '');
                  setEstimatedDeliveryTimeInput('Punctual morning setup on ' + (targetEnq.eventDate || 'event day'));
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold transition shadow-sm flex items-center justify-center gap-1.5"
              >
                <Truck className="w-4 h-4 text-amber-300" />
                <span>Connect to Driver for this Location</span>
              </button>

              <button
                type="button"
                onClick={() => setLocationModalEnquiry(null)}
                className="px-4 py-2.5 rounded-xl border border-neutral-700 text-neutral-400 hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: 1-CLICK INDIVIDUAL TICKET MODAL
         ======================================================== */}
      <IndividualTicketModal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        ticket={selectedTicketForModal}
        onTrackOrder={(id) => {
          setIsTicketModalOpen(false);
          window.open(`/track/${encodeURIComponent(id)}`, '_blank');
        }}
      />

    </div>
  );
};

export default AdminDashboardPage;
