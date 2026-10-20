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
import { useAuth } from '../context/AuthContext';
import { CATEGORIES, LUCKNOW_LOCALITIES, SERVICES_LIST } from '../data/seedItems';
import MasterAgentVoiceWidget from '../components/MasterAgentVoiceWidget';

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
  const [agentSubtab, setAgentSubtab] = useState('voice'); // voice, memory, workflows

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
        venRes
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
        api.getVenue().catch(() => ({ data: null }))
      ]);

      setEnquiries(enqRes.data || []);
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
    } catch (err) {
      console.error('Error loading admin data:', err);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [attendanceDate]);

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
      await api.updateEnquiryStatus(orderId, { status: 'Approved — Awaiting Payment' });
      showToast('Booking approved! Advance payment unlocked for customer.');
      loadAllData();
    } catch (e) {
      showToast(e.message || 'Failed to approve', 'error');
    }
  };

  const handleRecordOutsidePayment = async (e) => {
    e.preventDefault();
    try {
      await api.recordOutsidePayment(outsidePaymentForm);
      showToast(`भुगतान दर्ज किया गया: ${outsidePaymentForm.recipientName} को ₹${outsidePaymentForm.amount}`);
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
      showToast(err.message || 'भुगतान दर्ज करने में विफल', 'error');
    }
  };

  const handleGenerateInvoice = async (e) => {
    e.preventDefault();
    try {
      const res = await api.generateInvoice(invoiceForm);
      showToast(`इनवॉइस तैयार: ${res.data?.invoiceNumber || 'INV'}`);
      setIsGenerateInvoiceModalOpen(false);
      loadAllData();
    } catch (err) {
      showToast(err.message || 'इनवॉइस बनाने में विफल', 'error');
    }
  };

  const handleRenderReel = async (e) => {
    e.preventDefault();
    setIsRenderingReel(true);
    try {
      const res = await api.renderMarketingReel(reelFormData);
      showToast('🎬 FFmpeg रील सफलतापूर्वक रेंडर हो गई!');
      loadAllData();
      if (res.data?.videoUrl) {
        setActivePreviewVideo(res.data);
      }
    } catch (err) {
      showToast(err.message || 'रील रेंडरिंग विफल रही', 'error');
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
      showToast(`स्टॉक अपडेट किया गया: ${stockModalItem.name}`);
      setIsStockModalOpen(false);
      loadAllData();
    } catch (err) {
      showToast(err.message || 'स्टॉक समायोजन विफल', 'error');
    }
  };

  const handleSaveStaffMember = async (e) => {
    e.preventDefault();
    try {
      if (editingStaffMember) {
        await api.updateStaff(editingStaffMember.id, staffFormData);
        showToast('स्टाफ विवरण अपडेट हो गया');
      } else {
        await api.createStaff(staffFormData);
        showToast('नया स्टाफ सदस्य सफलतापूर्वक जोड़ा गया');
      }
      setIsStaffModalOpen(false);
      setEditingStaffMember(null);
      loadAllData();
    } catch (err) {
      showToast(err.message || 'स्टाफ सुरक्षित करने में विफल', 'error');
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
      showToast(`हाजिरी दर्ज: ${status}`);
      loadAllData();
    } catch (err) {
      showToast(err.message || 'हाजिरी दर्ज करने में त्रुटि', 'error');
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
      showToast('मजदूरी भुगतान रसीद दर्ज हो गई');
      setIsDisbursementModalOpen(false);
      loadAllData();
    } catch (err) {
      showToast(err.message || 'भुगतान दर्ज करने में त्रुटि', 'error');
    }
  };

  const handleToggleMemoryApproval = async (mem) => {
    try {
      const nextStatus = mem.approvalStatus === 'approved' ? 'pending_review' : 'approved';
      await api.updateAgentMemory(mem.id, { approvalStatus: nextStatus });
      showToast(`नियम स्थिति: ${nextStatus}`);
      loadAllData();
    } catch (err) {
      showToast('नियम अपडेट करने में विफल', 'error');
    }
  };

  const handleDeleteMemory = async (id) => {
    if (!window.confirm('क्या आप इस नियम को हटाना चाहते हैं?')) return;
    try {
      await api.deleteAgentMemory(id);
      showToast('नियम हटा दिया गया');
      loadAllData();
    } catch (err) {
      showToast('हटाने में विफल', 'error');
    }
  };

  // Nav Items Definition
  const navItems = [
    { id: 'dashboard', label: 'डैशबोर्ड (Dashboard)', icon: LayoutDashboard, badge: enquiries.filter(e => e.status === 'New').length },
    { id: 'staff', label: 'स्टाफ व हाजिरी (Staff & Attendance)', icon: Users, badge: staffList.length },
    { id: 'payments', label: 'मजदूरी व बाहर भुगतान (Wages & Payments)', icon: IndianRupee },
    { id: 'customers', label: 'ग्राहक व कोट्स (Customers & Quotes)', icon: MessageCircle, badge: customers.length },
    { id: 'bookings', label: 'बुकिंग व पूछताछ (Bookings & Orders)', icon: ShoppingBag, badge: enquiries.length },
    { id: 'inventory', label: 'सामान व किराया (Inventory & Rentals)', icon: Package, badge: physicalInventory.filter(i => (i.damagedQuantity || 0) > 0).length ? 'Repair' : null },
    { id: 'analytics', label: 'विज़िटर एनालिटिक्स (Analytics)', icon: BarChart3 },
    { id: 'agent', label: 'बोलकर चलाएं AI (Master Agent)', icon: Mic, highlight: true },
    { id: 'marketing', label: 'मार्केटिंग व रील स्टूडियो (Marketing Studio)', icon: Clapperboard, highlight: true },
    { id: 'invoices', label: 'बिल व इनवॉइस (Bills & Documents)', icon: FileText, badge: invoices.length },
    { id: 'settings', label: 'लॉन सेटिंग (Settings & Venue)', icon: Settings }
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
            <span>व्यवस्थापक: <strong className="text-white">{user?.username || 'माताजी (Admin)'}</strong></span>
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
            <p>Ph: 9305465848</p>
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
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">आज के जरूरी काम (Daily Urgent Tasks)</span>
                  </div>
                  <h2 className="text-lg font-serif font-bold text-white">
                    {attendanceRecords.length === 0 ? '⚠️ आज की हाजिरी अभी दर्ज नहीं हुई है।' : `✅ आज ${attendanceRecords.filter(a => a.status === 'Present').length} कारीगर काम पर मौजूद हैं।`}
                  </h2>
                  <p className="text-xs text-neutral-300">
                    अपुष्ट बुकिंग्स: <strong>{enquiries.filter(e => e.status === 'Pending Admin Approval' || e.status === 'New').length}</strong> &bull; मरम्मत योग्य सामान: <strong>{physicalInventory.filter(i => (i.damagedQuantity || 0) > 0).length}</strong>
                  </p>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  <button
                    onClick={() => setActiveTab('staff')}
                    className="px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
                  >
                    <ClipboardCheck className="w-4 h-4" />
                    <span>हाजिरी लगाएं (Mark Attendance)</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('agent')}
                    className="px-4 py-2.5 rounded-2xl royal-gradient text-white font-bold text-xs flex items-center gap-1.5 shadow-sm border border-brand-gold/40 transition"
                  >
                    <Mic className="w-4 h-4 text-brand-gold" />
                    <span>बोलकर पूछें (Voice AI)</span>
                  </button>
                </div>
              </div>

              {/* 4 Key Business Metrics */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-neutral-950 p-5 rounded-3xl border border-neutral-800 shadow-xs space-y-1">
                  <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">कुल पूछताछ / बुकिंग्स</span>
                  <p className="text-3xl font-serif font-black text-white">{enquiries.length}</p>
                  <span className="text-[10px] text-amber-400 font-semibold block">{enquiries.filter(e => e.status === 'Confirmed').length} पक्की बुकिंग्स</span>
                </div>

                <div className="bg-neutral-950 p-5 rounded-3xl border border-neutral-800 shadow-xs space-y-1">
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">पंजीकृत कारीगर (Staff)</span>
                  <p className="text-3xl font-serif font-black text-white">{staffList.length}</p>
                  <span className="text-[10px] text-neutral-400 font-semibold block">मानक मजदूरी: ₹500/दिन</span>
                </div>

                <div className="bg-neutral-950 p-5 rounded-3xl border border-neutral-800 shadow-xs space-y-1">
                  <span className="text-[11px] font-bold text-brand-gold uppercase tracking-wider">गोदाम सामान (Assets)</span>
                  <p className="text-3xl font-serif font-black text-white">{physicalInventory.length}</p>
                  <span className="text-[10px] text-neutral-400 font-semibold block">किराया सूची: {rentalItems.length} उत्पाद</span>
                </div>

                <div className="bg-neutral-950 p-5 rounded-3xl border border-neutral-800 shadow-xs space-y-1">
                  <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">तैयार इनवॉइस बिल</span>
                  <p className="text-3xl font-serif font-black text-white">{invoices.length}</p>
                  <span className="text-[10px] text-neutral-400 font-semibold block">बाहरी भुगतान: {outsidePayments.length} प्रविष्टियां</span>
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
                    <h3 className="font-serif font-bold text-base text-white">बुकिंग व कोटेशन पाइपलाइन</h3>
                    <p className="text-xs text-neutral-400 mt-1">नई पूछताछ देखें, रेट कोटेशन बदलें, एडवांस जमा करें और बिल तैयार करें।</p>
                  </div>
                  <div className="text-xs font-bold text-brand-gold flex items-center gap-1">
                    <span>खोलें (Manage Bookings)</span>
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
                    <h3 className="font-serif font-bold text-base text-white">मार्केटिंग व FFmpeg रील स्टूडियो</h3>
                    <p className="text-xs text-neutral-400 mt-1">तस्वीरों से इंस्टाग्राम रील (9:16) बनाएं, लखनऊ हैशटैग्स पाएं और डाउनलोड करें।</p>
                  </div>
                  <div className="text-xs font-bold text-amber-300 flex items-center gap-1">
                    <span>खोलें (Render Reels)</span>
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
                    <h3 className="font-serif font-bold text-base text-white">मजदूरी व धोबी खर्च</h3>
                    <p className="text-xs text-neutral-400 mt-1">दैनिक हाजिरी मजदूरी, धोबी धुलाई बिल और बांस-बल्ली सप्लायर भुगतान दर्ज करें।</p>
                  </div>
                  <div className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <span>खोलें (Wages &amp; Expenses)</span>
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-white">👷 स्टाफ रोस्टर व दैनिक हाजिरी</h2>
                  <p className="text-xs text-neutral-400">दैनिक मानक मजदूरी ₹500/दिन (Labourer, Fitter, Driver)। हाजिरी लगाएं व मजदूरी गिनें।</p>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="date"
                    value={attendanceDate}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                    className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-700 text-xs text-white font-mono font-bold"
                  />
                  <button
                    onClick={() => { setEditingStaffMember(null); setIsStaffModalOpen(true); }}
                    className="px-4 py-2.5 rounded-xl royal-gradient text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
                  >
                    <Plus className="w-4 h-4 text-brand-gold" />
                    <span>+ नया स्टाफ जोड़ें</span>
                  </button>
                </div>
              </div>

              {/* Attendance Daily Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 text-center">
                  <p className="text-[11px] font-bold text-neutral-400">कुल कर्मचारी</p>
                  <p className="text-2xl font-serif font-bold text-white">{staffList.length}</p>
                </div>
                <div className="bg-neutral-950 p-4 rounded-2xl border border-emerald-900/60 text-center">
                  <p className="text-[11px] font-bold text-emerald-400">उपस्थित (Full Day ₹500)</p>
                  <p className="text-2xl font-serif font-bold text-emerald-400">
                    {attendanceRecords.filter(a => a.status === 'Present').length}
                  </p>
                </div>
                <div className="bg-neutral-950 p-4 rounded-2xl border border-amber-900/60 text-center">
                  <p className="text-[11px] font-bold text-amber-400">आधा दिन (Half-day ₹250)</p>
                  <p className="text-2xl font-serif font-bold text-amber-400">
                    {attendanceRecords.filter(a => a.status === 'Half-day').length}
                  </p>
                </div>
                <div className="bg-neutral-950 p-4 rounded-2xl border border-indigo-900/60 text-center">
                  <p className="text-[11px] font-bold text-indigo-400">आज की कुल मजदूरी</p>
                  <p className="text-2xl font-serif font-bold text-indigo-400">
                    ₹{wageSummary?.totalWage?.toLocaleString('en-IN') || 0}
                  </p>
                </div>
              </div>

              {/* Staff Table */}
              <div className="bg-neutral-950 rounded-3xl border border-neutral-800 overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs text-neutral-300">
                  <thead className="bg-neutral-900/90 text-neutral-400 uppercase text-[10px] tracking-wider border-b border-neutral-800">
                    <tr>
                      <th className="p-4">नाम व पद (Staff &amp; Role)</th>
                      <th className="p-4">मोबाइल नंबर</th>
                      <th className="p-4">दैनिक दर</th>
                      <th className="p-4">दिनांक {attendanceDate} हाजिरी</th>
                      <th className="p-4 text-right">भुगतान रसीद</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/80">
                    {staffList.map(st => {
                      const att = attendanceRecords.find(a => a.staffId === st.id);
                      const currentStatus = att?.status || 'Not Marked';
                      return (
                        <tr key={st.id} className="hover:bg-neutral-900/40 transition">
                          <td className="p-4">
                            <strong className="text-white text-sm block font-serif">{st.name}</strong>
                            <span className="text-[10px] text-brand-gold uppercase">{st.role || st.category}</span>
                          </td>
                          <td className="p-4 font-mono">{st.phone}</td>
                          <td className="p-4 font-mono font-bold text-white">₹{st.dailyWage || 500}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleAttendanceMark(st.id, 'Present')}
                                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition ${
                                  currentStatus === 'Present'
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                                }`}
                              >
                                उपस्थित (₹500)
                              </button>
                              <button
                                onClick={() => handleAttendanceMark(st.id, 'Half-day')}
                                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition ${
                                  currentStatus === 'Half-day'
                                    ? 'bg-amber-600 text-white shadow-xs'
                                    : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                                }`}
                              >
                                आधा (₹250)
                              </button>
                              <button
                                onClick={() => handleAttendanceMark(st.id, 'Absent')}
                                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition ${
                                  currentStatus === 'Absent'
                                    ? 'bg-rose-600 text-white shadow-xs'
                                    : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                                }`}
                              >
                                गैरहाजिर (₹0)
                              </button>
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => {
                                setDisbursementFormData({
                                  staffId: st.id,
                                  staffName: st.name,
                                  amount: att?.status === 'Half-day' ? 250 : 500,
                                  paymentMethod: 'Cash',
                                  referenceNumber: 'CASH-' + Math.floor(1000 + Math.random() * 9000),
                                  notes: `दरोगा खेड़ा गोदाम में दिनांक ${attendanceDate} की मजदूरी नकद दी गई।`
                                });
                                setIsDisbursementModalOpen(true);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition inline-flex items-center gap-1"
                            >
                              <Receipt className="w-3.5 h-3.5" />
                              <span>रसीद काटें</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================
              SECTION 3: WAGES & OUTSIDE PAYMENTS
             ======================================================== */}
          {activeTab === 'payments' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-white">💰 मजदूरी व बाहर खर्च (Payments &amp; Expenses)</h2>
                  <p className="text-xs text-neutral-400">आंतरिक कारीगर मजदूरी और बाहरी सप्लायर/धोबी भुगतान को अलग-अलग व्यवस्थित रखें।</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-neutral-950 p-1 rounded-2xl border border-neutral-800 flex">
                    <button
                      onClick={() => setPaymentSubtab('staff_wages')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                        paymentSubtab === 'staff_wages' ? 'bg-brand-primary text-white shadow-xs' : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      कारीगर मजदूरी ({wageDisbursements.length})
                    </button>
                    <button
                      onClick={() => setPaymentSubtab('outside_payments')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                        paymentSubtab === 'outside_payments' ? 'bg-brand-primary text-white shadow-xs' : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      धोबी व सप्लायर खर्च ({outsidePayments.length})
                    </button>
                  </div>
                  {paymentSubtab === 'outside_payments' && (
                    <button
                      onClick={() => setIsOutsidePaymentModalOpen(true)}
                      className="px-4 py-2 rounded-xl royal-gradient text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
                    >
                      <Plus className="w-4 h-4 text-brand-gold" />
                      <span>+ बाहरी भुगतान दर्ज करें</span>
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
                          <th className="p-4">रसीद सं.</th>
                          <th className="p-4">कारीगर नाम</th>
                          <th className="p-4">दिनांक</th>
                          <th className="p-4">राशि (₹)</th>
                          <th className="p-4">माध्यम</th>
                          <th className="p-4">टिप्पणी</th>
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
                      <span className="text-[11px] font-bold text-neutral-400">धोबी (लॉन्ड्री धुलाई)</span>
                      <p className="text-xl font-serif font-bold text-white mt-1">
                        ₹{outsidePayments.filter(p => p.category === 'dhobi').reduce((acc, p) => acc + (parseFloat(p.amount) || 0), 0).toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800">
                      <span className="text-[11px] font-bold text-neutral-400">सप्लायर (बांस, बल्ली, हार्डवेयर)</span>
                      <p className="text-xl font-serif font-bold text-white mt-1">
                        ₹{outsidePayments.filter(p => p.category === 'supplier').reduce((acc, p) => acc + (parseFloat(p.amount) || 0), 0).toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800">
                      <span className="text-[11px] font-bold text-neutral-400">कुल बाहरी खर्च</span>
                      <p className="text-xl font-serif font-bold text-emerald-400 mt-1">
                        ₹{outsidePayments.reduce((acc, p) => acc + (parseFloat(p.amount) || 0), 0).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>

                  <div className="bg-neutral-950 rounded-3xl border border-neutral-800 overflow-hidden shadow-xs">
                    <table className="w-full text-left text-xs text-neutral-300">
                      <thead className="bg-neutral-900/90 text-neutral-400 uppercase text-[10px] tracking-wider border-b border-neutral-800">
                        <tr>
                          <th className="p-4">प्राप्तकर्ता (Recipient)</th>
                          <th className="p-4">श्रेणी</th>
                          <th className="p-4">उद्देश्य / मद (Purpose)</th>
                          <th className="p-4">राशि (₹)</th>
                          <th className="p-4">माध्यम व रसीद</th>
                          <th className="p-4">दिनांक</th>
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
                  <h2 className="text-2xl font-serif font-bold text-white">👥 ग्राहक संपर्क व ब्रांडेड कोटेशन</h2>
                  <p className="text-xs text-neutral-400">ग्राहकों को मैन्युअल रूप से जोड़ें, आइटम दरें चुनें और WhatsApp पर शेयर करने योग्य कोट भेजें।</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="ग्राहक नाम या फोन नंबर..."
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
                    <span>+ नया ग्राहक जोड़ें</span>
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
                          {customerEnquiries.length} बुकिंग्स
                        </span>
                      </div>

                      {customerEnquiries.length > 0 && (
                        <div className="p-3 bg-neutral-900/60 rounded-2xl border border-neutral-800/80 text-xs space-y-1">
                          <span className="text-neutral-400 text-[10px] block uppercase font-bold">हालिया आयोजन:</span>
                          <p className="font-semibold text-white">{customerEnquiries[0].serviceRequired || 'Wedding Setup'}</p>
                          <p className="text-neutral-400 font-mono text-[11px]">{customerEnquiries[0].eventDate} &bull; {customerEnquiries[0].eventVenue || 'Dwarka Shri Lawn'}</p>
                        </div>
                      )}

                      <div className="pt-2 flex gap-2">
                        <a
                          href={`https://wa.me/91${c.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`नमस्ते ${c.name} जी! कंधारी टेंट एंड कैटरर्स व द्वारका श्री लॉन की ओर से आपका स्वागत है। आपके विवाह आयोजन के लिए हम तैयार हैं।`)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold text-center flex items-center justify-center gap-1.5 transition"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp संदेश</span>
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
                  <h2 className="text-2xl font-serif font-bold text-white">📋 शादी बुकिंग व पूछताछ पाइपलाइन</h2>
                  <p className="text-xs text-neutral-400">ग्राहक के अनुरोध की समीक्षा करें, रेट संशोधित करें, एडवांस अनलॉक करें या रसीद निकालें।</p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={enquiryStatusFilter}
                    onChange={(e) => setEnquiryStatusFilter(e.target.value)}
                    className="p-2 rounded-xl bg-neutral-950 border border-neutral-700 text-xs text-white outline-none"
                  >
                    <option value="all">सभी स्थितियां (All Statuses)</option>
                    <option value="Pending Admin Approval">प्रतीक्षारत (Pending Approval)</option>
                    <option value="Approved — Awaiting Payment">भुगतान प्रतीक्षारत (Awaiting Payment)</option>
                    <option value="Confirmed">पक्की बुकिंग (Confirmed)</option>
                    <option value="Rejected">अस्वीकृत (Rejected)</option>
                  </select>
                </div>
              </div>

              {/* Bookings List */}
              <div className="space-y-4">
                {enquiries.filter(e => enquiryStatusFilter === 'all' || e.status === enquiryStatusFilter).map(enq => (
                  <div key={enq.id} className="bg-neutral-950 p-6 rounded-3xl border border-neutral-800 space-y-4 shadow-xs">
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
                          Ref: <strong className="font-mono text-white">{enq.id}</strong> &bull; दिनांक: <strong className="text-white">{enq.eventDate}</strong> &bull; स्थान: <strong className="text-white">{enq.eventVenue || enq.locality || 'Dwarka Shri Lawn'}</strong>
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-[11px] text-neutral-400 block">कुल कोटेशन:</span>
                        <span className="text-xl font-serif font-black text-brand-gold">
                          ₹{(enq.grandTotal || enq.estimatedCost || 0).toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-emerald-400 block font-mono">जमा एडवांस: ₹{(enq.advancePaid || 0).toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {enq.status === 'Pending Admin Approval' && (
                        <button
                          onClick={() => handleApproveQuotation(enq.id)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
                        >
                          <Check className="w-4 h-4" />
                          <span>स्वीकार करें (Direct Approve)</span>
                        </button>
                      )}

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
                        <span>कोटेशन संशोधित करें</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedOrderForQuote(enq);
                          setIsBillPrintModalOpen(true);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 text-xs font-semibold flex items-center gap-1.5 transition"
                      >
                        <Printer className="w-3.5 h-3.5 text-neutral-300" />
                        <span>लेटरहेड रसीद / बिल</span>
                      </button>

                      <button
                        onClick={() => {
                          setOfflinePayModalOrder(enq);
                          setOfflinePayForm({
                            amount: Math.round((enq.grandTotal || enq.estimatedCost || 25000) * 0.5),
                            paymentMethod: 'Cash',
                            referenceNumber: 'CASH-' + Math.floor(1000 + Math.random() * 9000),
                            notes: 'दरोगा खेड़ा कार्यालय में 50% नकद जमा प्राप्त।'
                          });
                        }}
                        className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 text-xs font-semibold flex items-center gap-1.5 transition"
                      >
                        <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                        <span>नकद / ऑफलाइन भुगतान दर्ज करें</span>
                      </button>

                      <a
                        href={`https://wa.me/91${enq.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`नमस्ते ${enq.customerName} जी! कंधारी टेंट एंड कैटरर्स द्वारा आपकी बुकिंग ${enq.id} की स्थिति: ${enq.status}। कुल राशि: ₹${enq.grandTotal || enq.estimatedCost}। द्वारका श्री लॉन, कानपुर रोड, लखनऊ।`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp कोट भेजें</span>
                      </a>
                    </div>
                  </div>
                ))}
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
                  <h2 className="text-2xl font-serif font-bold text-white">📦 इन्वेंट्री व किराया कैटलॉग</h2>
                  <p className="text-xs text-neutral-400">गोदाम में रखा भौतिक सामान (टूटी हुई कुर्सियां/पंडाल) और ग्राहकों के लिए दैनिक किराया दरें।</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-neutral-950 p-1 rounded-2xl border border-neutral-800 flex">
                    <button
                      onClick={() => setInventorySubtab('physical')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                        inventorySubtab === 'physical' ? 'bg-brand-primary text-white shadow-xs' : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      गोदाम भौतिक स्टॉक ({physicalInventory.length})
                    </button>
                    <button
                      onClick={() => setInventorySubtab('catalogue')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                        inventorySubtab === 'catalogue' ? 'bg-brand-primary text-white shadow-xs' : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      किराया कैटलॉग दरें ({rentalItems.length})
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
                              {item.damagedQuantity} क्षतिग्रस्त
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-3 gap-2 py-2 border-y border-neutral-800/80 text-center text-xs">
                          <div>
                            <span className="text-neutral-400 text-[10px] block">कुल स्टॉक</span>
                            <strong className="text-white font-mono text-sm">{item.totalStock || item.totalQuantity || 0}</strong>
                          </div>
                          <div>
                            <span className="text-emerald-400 text-[10px] block font-bold">उपलब्ध</span>
                            <strong className="text-emerald-400 font-mono text-sm">{item.availableStock || item.availableQuantity || 0}</strong>
                          </div>
                          <div>
                            <span className="text-rose-400 text-[10px] block font-bold">क्षतिग्रस्त</span>
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
                              notes: 'दरोगा खेड़ा गोदाम में नया माल जोड़ा गया'
                            });
                            setIsStockModalOpen(true);
                          }}
                          className="w-full py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 text-xs font-bold transition flex items-center justify-center gap-1.5"
                        >
                          <Wrench className="w-3.5 h-3.5 text-brand-gold" />
                          <span>स्टॉक समायोजित करें (Adjust Stock)</span>
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
                          <p className="text-base font-bold text-brand-gold font-mono mt-1">₹{item.pricePerDay || item.price || 50} <span className="text-xs text-neutral-400">/ दिन</span></p>
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
                <h2 className="text-2xl font-serif font-bold text-white">📈 प्रथम-पक्षीय विज़िटर एनालिटिक्स</h2>
                <p className="text-xs text-neutral-400">100% गोपनीय व आंतरिक ट्रैकिंग — व्यवस्थापक (Admin) के अपने दौरे इसमें शामिल नहीं होते।</p>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-neutral-950 p-5 rounded-3xl border border-neutral-800 space-y-1">
                  <span className="text-[11px] font-bold text-neutral-400">आज के वास्तविक विज़िटर्स</span>
                  <p className="text-3xl font-serif font-bold text-white">{analyticsSummary?.todayVisitors || 1}</p>
                </div>
                <div className="bg-neutral-950 p-5 rounded-3xl border border-neutral-800 space-y-1">
                  <span className="text-[11px] font-bold text-neutral-400">कुल पेज व्यूज (Pageviews)</span>
                  <p className="text-3xl font-serif font-bold text-white">{analyticsSummary?.totalPageviews || 1}</p>
                </div>
                <div className="bg-neutral-950 p-5 rounded-3xl border border-neutral-800 space-y-1">
                  <span className="text-[11px] font-bold text-emerald-400">कुल प्राप्त पूछताछ</span>
                  <p className="text-3xl font-serif font-bold text-emerald-400">{enquiries.length}</p>
                </div>
                <div className="bg-neutral-950 p-5 rounded-3xl border border-neutral-800 space-y-1">
                  <span className="text-[11px] font-bold text-brand-gold">रूपांतरण दर (Conversion)</span>
                  <p className="text-3xl font-serif font-bold text-brand-gold">{analyticsSummary?.conversionRate || '12.5%'}</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-400">
                🔒 <strong>सुरक्षित व आंतरिक:</strong> कोई बाहरी Google Analytics या तृतीय-पक्ष कुकीज़ नहीं हैं। सारा डेटा सीधे आपके निजी सर्वर पर प्रोसेस होता है।
              </div>
            </div>
          )}

          {/* ========================================================
              SECTION 8: MASTER AGENT & LEARNED WORKFLOWS
             ======================================================== */}
          {activeTab === 'agent' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-white">🎙️ मास्टर बिजनेस AI एजेंट (Master Agent)</h2>
                  <p className="text-xs text-neutral-400">हिंदी व अंग्रेजी में बोलकर दुकान, गोदाम व कारीगरों का काम चलाएं। याद रखे गए नियम व वर्कफ़्लो प्रबंधित करें।</p>
                </div>
                <div className="bg-neutral-950 p-1 rounded-2xl border border-neutral-800 flex">
                  <button
                    onClick={() => setAgentSubtab('voice')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                      agentSubtab === 'voice' ? 'bg-brand-primary text-white shadow-xs' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    बोलकर चलाएं (Voice AI)
                  </button>
                  <button
                    onClick={() => setAgentSubtab('memory')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                      agentSubtab === 'memory' ? 'bg-brand-primary text-white shadow-xs' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    व्यापार नियम (Learned Memories: {agentMemories.length})
                  </button>
                  <button
                    onClick={() => setAgentSubtab('workflows')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                      agentSubtab === 'workflows' ? 'bg-brand-primary text-white shadow-xs' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    कार्यप्रणाली (Workflows: {agentWorkflows.length})
                  </button>
                </div>
              </div>

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
                    <p className="text-xs text-neutral-400">एजेंट द्वारा याद रखे गए व्यापारिक नियम (छूट नीति, धोबी रेट, जनरेटर शर्तें):</p>
                    <button
                      onClick={() => setIsAddMemoryModalOpen(true)}
                      className="px-3.5 py-1.5 rounded-xl royal-gradient text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5 text-brand-gold" />
                      <span>+ नया नियम जोड़ें</span>
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
                            {mem.approvalStatus === 'approved' ? 'स्वीकृत (Approved)' : 'प्रतीक्षारत'}
                          </span>
                        </div>
                        <p className="text-xs text-white font-medium leading-relaxed">{mem.content}</p>
                        <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-xs">
                          <button
                            onClick={() => handleToggleMemoryApproval(mem)}
                            className="text-[11px] text-brand-gold hover:underline font-bold"
                          >
                            {mem.approvalStatus === 'approved' ? 'स्वीकृति वापस लें' : 'स्वीकार करें'}
                          </button>
                          <button
                            onClick={() => handleDeleteMemory(mem.id)}
                            className="text-[11px] text-rose-400 hover:text-rose-300 font-bold"
                          >
                            नियम हटाएं
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
                          <strong className="text-neutral-300 block text-[10px] uppercase">अनुक्रमित चरण (Steps):</strong>
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
                  <h2 className="text-2xl font-serif font-bold text-white">🎬 एआई मार्केटिंग व रील स्टूडियो</h2>
                  <p className="text-xs text-neutral-400">वास्तविक गैलरी तस्वीरों से वास्तविक MP4 रील रेंडर करें (FFmpeg Ken Burns ज़ूम, लखनऊ ब्रांडिंग व 5 हैशटैग्स)।</p>
                </div>
                <div className="bg-neutral-950 p-1 rounded-2xl border border-neutral-800 flex">
                  <button
                    onClick={() => setMarketingSubtab('lawn_reels')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                      marketingSubtab === 'lawn_reels' ? 'bg-brand-primary text-white shadow-xs' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    🌿 द्वारका श्री लॉन रील्स ({lawnReels.length})
                  </button>
                  <button
                    onClick={() => setMarketingSubtab('reels')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                      marketingSubtab === 'reels' ? 'bg-brand-primary text-white shadow-xs' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    सिनेमैटिक रील्स ({renderedReels.length})
                  </button>
                  <button
                    onClick={() => setMarketingSubtab('media')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                      marketingSubtab === 'media' ? 'bg-brand-primary text-white shadow-xs' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    मीडिया लाइब्रेरी ({marketingMedia.length})
                  </button>
                  <button
                    onClick={() => setMarketingSubtab('portfolios')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                      marketingSubtab === 'portfolios' ? 'bg-brand-primary text-white shadow-xs' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    ग्राहक पोर्टफोलियो ({portfolios.length})
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
                        <h3 className="font-serif font-bold text-base text-white">द्वारका श्री लॉन — 7 प्रमाणित वीडियो रील्स (9:16)</h3>
                      </div>
                      <p className="text-xs text-neutral-400 mt-1">
                        वास्तविक वीडियो फुटेज से तैयार की गई 9:16 वर्टिकल रील्स। इन्हें वेबसाइट पर प्रदर्शित किया गया है।
                      </p>
                    </div>
                    <a
                      href="/media/lawn/DwarakaShreevideo.mp4"
                      download="Dwarka_Shri_Lawn_Master.mp4"
                      className="px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-brand-gold hover:text-white text-xs font-bold transition flex items-center gap-2 self-start sm:self-auto"
                    >
                      <Download className="w-4 h-4" />
                      <span>मास्टर सोर्स वीडियो (19.3 MB)</span>
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
                                const shareText = `द्वारका श्री लॉन (कानपुर रोड, लखनऊ) की वीडियो रील: ${window.location.origin}/lawn#${reel.id} — ${reel.title}`;
                                window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
                              }}
                              className="flex-1 py-1.5 px-2 rounded-lg bg-green-600/20 hover:bg-green-600/30 text-green-400 font-bold text-[11px] flex items-center justify-center gap-1"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                              <span>व्हाट्सएप</span>
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
                        <h3 className="font-serif font-bold text-base text-white">FFmpeg 6.1.1 रील रेंडरिंग इंजन</h3>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                        Ken Burns Slow Zoompan
                      </span>
                    </div>

                    <form onSubmit={handleRenderReel} className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                      <div className="sm:col-span-2">
                        <label className="block text-neutral-400 mb-1 font-semibold">रील का शीर्षक (Title)</label>
                        <input
                          type="text"
                          required
                          value={reelFormData.title}
                          onChange={(e) => setReelFormData({ ...reelFormData, title: e.target.value })}
                          className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-neutral-400 mb-1 font-semibold">फॉर्मेट (Aspect Ratio)</label>
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
                        <label className="block text-neutral-400 mb-1 font-semibold">समय (Duration)</label>
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
                              <span>FFmpeg वीडियो रेंडर हो रहा है (कृपया प्रतीक्षा करें)...</span>
                            </>
                          ) : (
                            <>
                              <Clapperboard className="w-4 h-4 text-neutral-950" />
                              <span>🎬 वीडियो रील रेंडर करें (Render Real MP4 Video)</span>
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
                                showToast('कैप्शन व हैशटैग्स कॉपी हो गए!');
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
                          <span className="text-neutral-400 text-[10px]">लिंक: {p.shareableUrl}</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(p.whatsappMessage);
                              showToast('WhatsApp संदेश कॉपी हो गया!');
                            }}
                            className="px-3 py-1 rounded-xl bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 font-bold flex items-center gap-1"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                            <span>WhatsApp शेयर</span>
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
                  <h2 className="text-2xl font-serif font-bold text-white">📄 व्यावसायिक बिल व इनवॉइस</h2>
                  <p className="text-xs text-neutral-400">औपचारिक इनवॉइस (INV-YYYY-XXXX), भुगतान स्थिति व प्रिंट करने योग्य लेटरहेड बिल।</p>
                </div>
                <button
                  onClick={() => setIsGenerateInvoiceModalOpen(true)}
                  className="px-4 py-2 rounded-xl royal-gradient text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
                >
                  <Plus className="w-4 h-4 text-brand-gold" />
                  <span>+ नया इनवॉइस बिल बनाएं</span>
                </button>
              </div>

              {/* Invoices Table */}
              <div className="bg-neutral-950 rounded-3xl border border-neutral-800 overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs text-neutral-300">
                  <thead className="bg-neutral-900/90 text-neutral-400 uppercase text-[10px] tracking-wider border-b border-neutral-800">
                    <tr>
                      <th className="p-4">इनवॉइस नंबर</th>
                      <th className="p-4">ग्राहक नाम व फोन</th>
                      <th className="p-4">आयोजन दिनांक</th>
                      <th className="p-4">कुल राशि (₹)</th>
                      <th className="p-4">जमा एडवांस</th>
                      <th className="p-4">बकाया (Balance)</th>
                      <th className="p-4">स्थिति</th>
                      <th className="p-4 text-right">प्रिंट / रसीद</th>
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
                            <span>देखें / प्रिंट</span>
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
                <h2 className="text-2xl font-serif font-bold text-white">⚙️ द्वारका श्री लॉन व प्रतिष्ठान सेटिंग्स</h2>
                <p className="text-xs text-neutral-400">कानपुर रोड, लखनऊ प्रतिष्ठान की आधिकारिक जानकारी, क्षमता और संपर्क सूत्र।</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-neutral-950 p-6 rounded-3xl border border-neutral-800 space-y-4">
                  <div className="flex items-center gap-2">
                    <Building className="w-5 h-5 text-brand-gold" />
                    <h3 className="font-serif font-bold text-base text-white">आधिकारिक व्यावसायिक पता (NAP)</h3>
                  </div>
                  <div className="text-xs space-y-2 text-neutral-300">
                    <p><strong>प्रतिष्ठान:</strong> कंधारी टेंट एंड कैटरर्स (Kandhari Tent &amp; Caterers)</p>
                    <p><strong>वेन्यू:</strong> द्वारका श्री लॉन (Dwarka Shri Lawn)</p>
                    <p><strong>पता:</strong> कानपुर रोड, पिलर न. 37 के सामने, दरोगा खेड़ा, लखनऊ, उत्तर प्रदेश 226008</p>
                    <p><strong>हेल्पलाइन फोन:</strong> 9305465848</p>
                    <p><strong>WhatsApp:</strong> +91 9305465848</p>
                  </div>
                </div>

                <div className="bg-neutral-950 p-6 rounded-3xl border border-neutral-800 space-y-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <h3 className="font-serif font-bold text-base text-white">लॉन क्षमता व सुविधाएं</h3>
                  </div>
                  <div className="text-xs space-y-2 text-neutral-300">
                    <p><strong>मेहमान क्षमता:</strong> 1,200+ Guests (विशाल प्राकृतिक लॉन)</p>
                    <p><strong>पार्किंग:</strong> 200+ चार पहिया वाहन पार्किंग</p>
                    <p><strong>वाटरप्रूफ कैनोपी:</strong> जर्मन हैंगर शेड (ऑल-वेदर)</p>
                    <p><strong>कमरे:</strong> 2 वातानुकूलित (AC) सुइट्स दुल्हन व परिवार हेतु</p>
                    <p><strong>पावर बैकअप:</strong> 62.5 KVA साइलेंट जनरेटर</p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

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
              <h3 className="font-serif font-bold text-base text-white">बाहरी खर्च / भुगतान दर्ज करें</h3>
              <button onClick={() => setIsOutsidePaymentModalOpen(false)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleRecordOutsidePayment} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block text-neutral-300 mb-1 font-bold">प्राप्तकर्ता का नाम (Recipient) *</label>
                <input
                  type="text"
                  required
                  placeholder="उदा. Ramesh Dhobi (लॉन्ड्री)"
                  value={outsidePaymentForm.recipientName}
                  onChange={(e) => setOutsidePaymentForm({ ...outsidePaymentForm, recipientName: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 mb-1 font-bold">श्रेणी (Category) *</label>
                  <select
                    value={outsidePaymentForm.category}
                    onChange={(e) => setOutsidePaymentForm({ ...outsidePaymentForm, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white"
                  >
                    <option value="dhobi">धोबी (लॉन्ड्री धुलाई)</option>
                    <option value="supplier">सप्लायर (बांस, बल्ली, पाइप)</option>
                    <option value="outside_worker">बाहरी कारीगर / जनरेटर</option>
                    <option value="logistics">ट्रांसपोर्ट / पिकअप भाड़ा</option>
                    <option value="other">अन्य खर्च</option>
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-300 mb-1 font-bold">राशि (₹ Amount) *</label>
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
                <label className="block text-neutral-300 mb-1 font-bold">उद्देश्य व विवरण (Purpose) *</label>
                <input
                  type="text"
                  required
                  placeholder="उदा. 100 कुर्सी कवर व 20 टेबल क्लॉथ धुलाई"
                  value={outsidePaymentForm.purpose}
                  onChange={(e) => setOutsidePaymentForm({ ...outsidePaymentForm, purpose: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 mb-1 font-bold">भुगतान माध्यम *</label>
                  <select
                    value={outsidePaymentForm.paymentMethod}
                    onChange={(e) => setOutsidePaymentForm({ ...outsidePaymentForm, paymentMethod: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white"
                  >
                    <option value="Cash">नकद (Cash)</option>
                    <option value="Direct UPI">UPI (GPay / PhonePe)</option>
                    <option value="Bank Transfer">बैंक ट्रांसफर (NEFT)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-300 mb-1 font-bold">रसीद सं. (Ref No.)</label>
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
                  भुगतान सुरक्षित करें
                </button>
                <button
                  type="button"
                  onClick={() => setIsOutsidePaymentModalOpen(false)}
                  className="px-4 py-3 rounded-xl border border-neutral-700 text-neutral-400 hover:text-white"
                >
                  रद्द करें
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
              <h3 className="font-serif font-bold text-base text-white">नया ग्राहक जोड़ें (Add Customer)</h3>
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
                showToast(`ग्राहक जोड़ा गया: ${newCustomerForm.name}`);
                setIsAddCustomerModalOpen(false);
                setNewCustomerForm({ name: '', phone: '', email: '', notes: '' });
                loadAllData();
              } catch (err) {
                showToast(err.message || 'ग्राहक जोड़ने में विफल', 'error');
              }
            }} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block text-neutral-300 mb-1 font-bold">ग्राहक का नाम (Customer Name) *</label>
                <input
                  type="text"
                  required
                  placeholder="उदा. राजेश वर्मा"
                  value={newCustomerForm.name}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white"
                />
              </div>

              <div>
                <label className="block text-neutral-300 mb-1 font-bold">मोबाइल नंबर (10 Digits) *</label>
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
                <label className="block text-neutral-300 mb-1 font-bold">ईमेल (वैकल्पिक)</label>
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
                  ग्राहक सुरक्षित करें
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddCustomerModalOpen(false)}
                  className="px-4 py-3 rounded-xl border border-neutral-700 text-neutral-400 hover:text-white"
                >
                  रद्द करें
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
              <h3 className="font-serif font-bold text-base text-white">औपचारिक इनवॉइस बिल बनाएं (Generate Invoice)</h3>
              <button onClick={() => setIsGenerateInvoiceModalOpen(false)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleGenerateInvoice} className="space-y-4 pt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 mb-1 font-bold">ग्राहक नाम *</label>
                  <input
                    type="text"
                    required
                    value={invoiceForm.customerName}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, customerName: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 mb-1 font-bold">मोबाइल नंबर *</label>
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
                  <label className="block text-neutral-300 mb-1 font-bold">आयोजन दिनांक *</label>
                  <input
                    type="date"
                    required
                    value={invoiceForm.eventDate}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, eventDate: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 mb-1 font-bold">स्थान (Venue)</label>
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
                  <label className="block text-neutral-300 mb-1 font-bold">सामान राशि (₹)</label>
                  <input
                    type="number"
                    value={invoiceForm.subtotal}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, subtotal: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 mb-1 font-bold">भाड़ा व मजदूरी (₹)</label>
                  <input
                    type="number"
                    value={invoiceForm.cartage + invoiceForm.labour}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, cartage: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 mb-1 font-bold">एडवांस प्राप्त (₹)</label>
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
                  इनवॉइस बिल जारी करें
                </button>
                <button
                  type="button"
                  onClick={() => setIsGenerateInvoiceModalOpen(false)}
                  className="px-4 py-3 rounded-xl border border-neutral-700 text-neutral-400 hover:text-white"
                >
                  रद्द करें
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
                <h2 className="font-serif font-black text-2xl text-brand-primary">कंधारी टेंट एंड कैटरर्स</h2>
                <p className="text-xs font-semibold text-brand-goldDark">द्वारका श्री लॉन &bull; कानपुर रोड, लखनऊ</p>
                <p className="text-[11px] text-neutral-500 mt-1">पिलर न. 37 के सामने, दरोगा खेड़ा, लखनऊ &bull; Ph: 9305465848</p>
              </div>
              <div className="text-right">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-brand-primary text-white font-mono">
                  {viewingInvoice.invoiceNumber}
                </span>
                <p className="text-[11px] text-neutral-500 font-mono mt-1">दिनांक: {viewingInvoice.createdAt?.split('T')[0]}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 py-4 border-b border-neutral-200 text-xs">
              <div>
                <span className="text-neutral-500 block">बिल प्राप्तकर्ता:</span>
                <strong className="text-sm font-serif block">{viewingInvoice.customerName}</strong>
                <span className="font-mono text-neutral-700">{viewingInvoice.phone}</span>
                <p className="text-neutral-600 mt-0.5">{viewingInvoice.billingAddress}</p>
              </div>
              <div className="text-right">
                <span className="text-neutral-500 block">आयोजन स्थल:</span>
                <strong className="block">{viewingInvoice.eventVenue}</strong>
                <span className="font-mono text-neutral-700">दिनांक: {viewingInvoice.eventDate}</span>
                <p className="text-neutral-600 mt-0.5">सेवा: {viewingInvoice.serviceRequired}</p>
              </div>
            </div>

            <div className="py-4 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-neutral-100">
                <span className="font-semibold text-neutral-700">सामान व कैटरिंग उप-योग (Subtotal):</span>
                <span className="font-mono font-bold">₹{viewingInvoice.subtotal?.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-100">
                <span className="font-semibold text-neutral-700">ट्रांसपोर्ट व मजदूरी (Cartage &amp; Labour):</span>
                <span className="font-mono">₹{((viewingInvoice.cartage || 0) + (viewingInvoice.labour || 0)).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-2 border-b-2 border-neutral-900 text-sm">
                <span className="font-black text-brand-primary">कुल बिल राशि (Grand Total):</span>
                <span className="font-black text-brand-primary font-mono">₹{viewingInvoice.grandTotal?.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1 text-emerald-700 font-bold">
                <span>जमा एडवांस राशि (Advance Paid):</span>
                <span className="font-mono">₹{viewingInvoice.advancePaid?.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-2 bg-rose-50 p-3 rounded-xl border border-rose-200 text-sm font-bold text-rose-800">
                <span>बकाया देय राशि (Balance Payable):</span>
                <span className="font-mono">₹{viewingInvoice.balanceDue?.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="pt-4 flex justify-between items-center text-xs">
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primaryDark text-white font-bold flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>प्रिंट करें (Print / PDF)</span>
              </button>
              <button
                onClick={() => setViewingInvoice(null)}
                className="px-4 py-2.5 rounded-xl border border-neutral-300 text-neutral-600 font-bold"
              >
                बंद करें
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
              <h3 className="font-serif font-bold text-base text-white">मजदूरी भुगतान रसीद काटें</h3>
              <button onClick={() => setIsDisbursementModalOpen(false)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleRecordDisbursement} className="space-y-4 pt-4 text-xs">
              <div className="p-3 bg-neutral-900 rounded-2xl border border-neutral-800">
                <p className="font-bold text-white text-sm">{disbursementFormData.staffName}</p>
                <p className="text-neutral-400 mt-0.5">हाजिरी दिनांक: <strong className="text-white">{attendanceDate}</strong></p>
              </div>

              <div>
                <label className="block text-neutral-300 mb-1 font-bold">भुगतान राशि (₹ Amount) *</label>
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
                <label className="block text-neutral-300 mb-1 font-bold">भुगतान माध्यम *</label>
                <select
                  value={disbursementFormData.paymentMethod}
                  onChange={(e) => setDisbursementFormData({ ...disbursementFormData, paymentMethod: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-semibold"
                >
                  <option value="Cash">नकद दिया (Cash in Hand)</option>
                  <option value="Direct UPI">सीधा UPI (GPay / PhonePe / Paytm)</option>
                  <option value="Bank Transfer">बैंक ट्रांसफर (IMPS / NEFT)</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-300 mb-1 font-bold">रसीद / संदर्भ संख्या</label>
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
                  भुगतान दर्ज करें
                </button>
                <button
                  type="button"
                  onClick={() => setIsDisbursementModalOpen(false)}
                  className="px-4 py-3 rounded-xl border border-neutral-700 text-neutral-400 hover:text-white"
                >
                  रद्द करें
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
              <h3 className="font-serif font-bold text-base text-white">स्टॉक समायोजन (Stock Adjustment)</h3>
              <button onClick={() => setIsStockModalOpen(false)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleStockAdjustSubmit} className="space-y-4 pt-4 text-xs">
              <div className="p-3 bg-neutral-900 rounded-2xl border border-neutral-800">
                <p className="font-bold text-white text-sm">{stockModalItem.name}</p>
                <p className="text-neutral-400 mt-0.5">वर्तमान कुल स्टॉक: <strong className="text-white">{stockModalItem.totalStock}</strong> &bull; उपलब्ध: <strong className="text-emerald-400">{stockModalItem.availableStock}</strong></p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 mb-1 font-bold">क्रिया का प्रकार *</label>
                  <select
                    value={stockAdjustmentForm.actionType}
                    onChange={(e) => setStockAdjustmentForm({ ...stockAdjustmentForm, actionType: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white"
                  >
                    <option value="restock">नया माल जोड़ा (+ Purchase)</option>
                    <option value="damage">शादी में टूटा / क्षतिग्रस्त (+ Damage)</option>
                    <option value="repair">मरम्मत होकर वापस आया (Repair Done)</option>
                    <option value="audit_correction">ऑडिट सुधार (Audit Set)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-300 mb-1 font-bold">मात्रा (Quantity) *</label>
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
                <label className="block text-neutral-300 mb-1 font-bold">कारण / टिप्पणी (Reason &amp; Notes)</label>
                <input
                  type="text"
                  value={stockAdjustmentForm.notes}
                  onChange={(e) => setStockAdjustmentForm({ ...stockAdjustmentForm, notes: e.target.value })}
                  placeholder="उदा. शादी स्थल पर टूट-फूट या नया स्टॉक डिपो में आया"
                  className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl royal-gradient text-white font-bold text-xs shadow-md transition"
                >
                  स्टॉक अपडेट करें
                </button>
                <button
                  type="button"
                  onClick={() => setIsStockModalOpen(false)}
                  className="px-4 py-3 rounded-xl border border-neutral-700 text-neutral-400 hover:text-white"
                >
                  रद्द करें
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
              <h3 className="font-serif font-bold text-base text-white">कारीगर / स्टाफ विवरण</h3>
              <button onClick={() => setIsStaffModalOpen(false)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveStaffMember} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block text-neutral-300 mb-1 font-bold">स्टाफ का नाम *</label>
                <input
                  type="text"
                  required
                  value={staffFormData.name}
                  onChange={(e) => setStaffFormData({ ...staffFormData, name: e.target.value })}
                  placeholder="उदा. राम प्रकाश"
                  className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 mb-1 font-bold">मोबाइल नंबर *</label>
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
                  <label className="block text-neutral-300 mb-1 font-bold">श्रेणी (Role) *</label>
                  <select
                    value={staffFormData.role}
                    onChange={(e) => setStaffFormData({ ...staffFormData, role: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white"
                  >
                    <option value="Labourer">मजदूर (Labourer)</option>
                    <option value="Fitter">टेंट व लाइट फिटर (Fitter)</option>
                    <option value="Driver">पिकअप ड्राइवर (Driver)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-300 mb-1 font-bold">दैनिक मजदूरी दर (₹ Daily Wage) *</label>
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
                  कारीगर सुरक्षित करें
                </button>
                <button
                  type="button"
                  onClick={() => setIsStaffModalOpen(false)}
                  className="px-4 py-3 rounded-xl border border-neutral-700 text-neutral-400 hover:text-white"
                >
                  रद्द करें
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
              <h3 className="font-serif font-bold text-base text-white">नया व्यापारिक नियम जोड़ें (Add Rule)</h3>
              <button onClick={() => setIsAddMemoryModalOpen(false)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                await api.createAgentMemory(memoryForm);
                showToast('नया नियम सुरक्षित कर लिया गया');
                setIsAddMemoryModalOpen(false);
                setMemoryForm({ category: 'pricing_rule', type: 'business_preference', content: '' });
                loadAllData();
              } catch (err) {
                showToast('नियम जोड़ने में विफल', 'error');
              }
            }} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block text-neutral-300 mb-1 font-bold">श्रेणी (Category) *</label>
                <select
                  value={memoryForm.category}
                  onChange={(e) => setMemoryForm({ ...memoryForm, category: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white"
                >
                  <option value="pricing_rule">छूट व दर नियम (Pricing Rule)</option>
                  <option value="supplier_rate">सप्लायर व धोबी दर (Supplier Rate)</option>
                  <option value="quotation_term">कोटेशन शर्तें व नोट्स (Quotation Terms)</option>
                  <option value="operational_rule">गोदाम व संचालन नियम (Operational)</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-300 mb-1 font-bold">नियम का विवरण (Memory Content) *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="उदा. 400 से अधिक मेहमानों के लिए स्टेज डेकोरेशन पर 10% की विशेष छूट दी जाती है।"
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
                  नियम सुरक्षित करें
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddMemoryModalOpen(false)}
                  className="px-4 py-3 rounded-xl border border-neutral-700 text-neutral-400 hover:text-white"
                >
                  रद्द करें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboardPage;
