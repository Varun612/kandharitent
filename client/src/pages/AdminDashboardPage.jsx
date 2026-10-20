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
  CreditCard
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES, LUCKNOW_LOCALITIES, SERVICES_LIST } from '../data/seedItems';

const AdminDashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview'); // overview, enquiries, customers, reports, inventory, venue, gallery, catering
  
  // Enquiries state
  const [enquiries, setEnquiries] = useState([]);
  const [enquiryStatusFilter, setEnquiryStatusFilter] = useState('all');
  const [enquiryServiceFilter, setEnquiryServiceFilter] = useState('all');
  const [enquiryLocalityFilter, setEnquiryLocalityFilter] = useState('all');
  const [enquirySearchQuery, setEnquirySearchQuery] = useState('');

  // Customers registry state
  const [customers, setCustomers] = useState([]);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');

  // Financial Reports state
  const [reportSummary, setReportSummary] = useState(null);
  const [reportDateRange, setReportDateRange] = useState({ startDate: '', endDate: '' });

  // Offline Payment Modal state
  const [offlinePayModalOrder, setOfflinePayModalOrder] = useState(null);
  const [offlinePayForm, setOfflinePayForm] = useState({
    amount: 0,
    paymentMethod: 'Cash',
    referenceNumber: '',
    notes: ''
  });

  // Rejection Modal state
  const [rejectionModalOrder, setRejectionModalOrder] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Inventory state
  const [items, setItems] = useState([]);
  const [itemSearchQuery, setItemSearchQuery] = useState('');
  const [itemCategoryFilter, setItemCategoryFilter] = useState('all');
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemFormData, setItemFormData] = useState({
    name: '',
    category: 'Chairs & Seating',
    description: '',
    availableQuantity: 10,
    availabilityStatus: 'Available',
    internalNotes: '',
    imageUrl: '/media/seating/seating-1.jpg',
    featured: false
  });

  // Venue state
  const [venue, setVenue] = useState(null);
  const [newAmenity, setNewAmenity] = useState({ title: '', description: '', icon: 'CheckCircle' });

  // Gallery state (7 Sections)
  const [galleryItems, setGalleryItems] = useState([]);
  const [galleryCategories, setGalleryCategories] = useState([]);
  const [gallerySectionFilter, setGallerySectionFilter] = useState('all');
  const [isGalleryEditModalOpen, setIsGalleryEditModalOpen] = useState(false);
  const [editingGalleryItem, setEditingGalleryItem] = useState(null);
  const [galleryEditFormData, setGalleryEditFormData] = useState({
    title: '',
    category: 'Actual wedding and reception setups',
    imageUrl: '',
    caption: '',
    eventType: 'Wedding',
    tags: '',
    featured: false
  });
  const [newGalleryPhoto, setNewGalleryPhoto] = useState({
    title: '',
    category: 'Actual wedding and reception setups',
    imageUrl: '/media/catering/catering-1.jpg',
    caption: '',
    eventType: 'Wedding',
    tags: 'Wedding, Setup',
    featured: false
  });

  // Catering Menu state (14 Categories)
  const [cateringDishes, setCateringDishes] = useState([]);
  const [cateringCategories, setCateringCategories] = useState([]);
  const [cateringCategoryFilter, setCateringCategoryFilter] = useState('all');
  const [cateringSearchQuery, setCateringSearchQuery] = useState('');
  const [isCateringModalOpen, setIsCateringModalOpen] = useState(false);
  const [editingCateringDish, setEditingCateringDish] = useState(null);
  const [cateringFormData, setCateringFormData] = useState({
    name: '',
    category: 'Welcome Drinks and Starters',
    description: '',
    selectionRule: 'Any 3',
    maxSelect: 3,
    dietary: 'Veg',
    isPopular: false,
    isActive: true,
    order: 1
  });

  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Quotation & Order Billing state
  const [selectedOrderForQuote, setSelectedOrderForQuote] = useState(null);
  const [isQuoteEditModalOpen, setIsQuoteEditModalOpen] = useState(false);
  const [isBillPrintModalOpen, setIsBillPrintModalOpen] = useState(false);
  const [isGeneratingFoodImage, setIsGeneratingFoodImage] = useState(false);
  const [quoteFormData, setQuoteFormData] = useState({
    lineItems: [],
    cartage: 500,
    labour: 500,
    discount: 0,
    discountReason: '',
    manualAdjustment: 0,
    adjustmentReason: '',
    advancePaid: 0,
    status: 'Quotation Prepared',
    quotationNotes: ''
  });

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleOpenQuoteModal = (enq) => {
    setSelectedOrderForQuote(enq);
    const items = enq.lineItems || enq.items || [];
    setQuoteFormData({
      lineItems: items.map(it => ({
        itemId: it.itemId || it.id || `custom-${Date.now()}`,
        name: it.name || '',
        quantity: Math.max(1, parseInt(it.quantity || 1, 10)),
        unitRate: it.unitRate || 0,
        ratePerSqFt: it.ratePerSqFt || 0,
        billingUnit: it.billingUnit || '',
        isAreaBased: !!it.isAreaBased,
        dimensions: it.dimensions || '',
        length: it.length || 0,
        width: it.width || 0,
        areaSqFt: it.areaSqFt || 0,
        durationSensitive: !!it.durationSensitive,
        rentalDays: enq.rentalDays || 1,
        effectiveDays: it.durationSensitive ? (enq.rentalDays || 1) : 1,
        lineTotal: it.lineTotal || (it.unitRate ? Math.round(it.unitRate * (it.quantity || 1)) : 0)
      })),
      cartage: enq.cartage !== undefined ? enq.cartage : 500,
      labour: enq.labour !== undefined ? enq.labour : 500,
      discount: enq.discount || 0,
      discountReason: enq.discountReason || '',
      manualAdjustment: enq.manualAdjustment || 0,
      adjustmentReason: enq.adjustmentReason || '',
      advancePaid: enq.advancePaid || 0,
      status: enq.status || 'Quotation Prepared',
      quotationNotes: enq.quotationNotes || ''
    });
    setIsQuoteEditModalOpen(true);
  };

  const handleOpenBillPrintModal = (enq) => {
    setSelectedOrderForQuote(enq);
    setIsBillPrintModalOpen(true);
  };

  const handleAddCustomQuoteLine = () => {
    setQuoteFormData(prev => ({
      ...prev,
      lineItems: [
        ...prev.lineItems,
        {
          itemId: `custom-${Date.now()}`,
          name: 'Custom Service / Equipment',
          quantity: 1,
          unitRate: 500,
          ratePerSqFt: 0,
          billingUnit: 'per service',
          isAreaBased: false,
          dimensions: '',
          length: 0,
          width: 0,
          areaSqFt: 0,
          durationSensitive: false,
          rentalDays: selectedOrderForQuote?.rentalDays || 1,
          effectiveDays: 1,
          lineTotal: 500
        }
      ]
    }));
  };

  const handleRemoveQuoteLine = (idx) => {
    setQuoteFormData(prev => ({
      ...prev,
      lineItems: prev.lineItems.filter((_, i) => i !== idx)
    }));
  };

  const handleUpdateQuoteLine = (idx, field, value) => {
    setQuoteFormData(prev => {
      const updated = [...prev.lineItems];
      updated[idx] = { ...updated[idx], [field]: value };
      const it = updated[idx];
      const q = Math.max(1, parseInt(it.quantity || 1, 10));
      const days = it.durationSensitive ? (selectedOrderForQuote?.rentalDays || 1) : 1;
      if (it.isAreaBased && it.areaSqFt && it.ratePerSqFt) {
        it.lineTotal = Math.round(it.areaSqFt * it.ratePerSqFt * days * q);
      } else if (it.unitRate !== undefined) {
        it.lineTotal = Math.round(parseFloat(it.unitRate || 0) * days * q);
      }
      return { ...prev, lineItems: updated };
    });
  };

  const handleSaveQuotation = async (e) => {
    if (e) e.preventDefault();
    if (!selectedOrderForQuote) return;
    try {
      const res = await api.updateEnquiryQuotation(selectedOrderForQuote.id, quoteFormData);
      if (res.success) {
        showNotification('Quotation and order billing updated successfully!');
        setIsQuoteEditModalOpen(false);
        const enqRes = await api.getEnquiries();
        if (enqRes.success) setEnquiries(enqRes.data);
      }
    } catch (err) {
      showNotification(err.message || 'Error updating quotation', 'error');
    }
  };

  const handleApproveWithQuotation = async () => {
    if (!selectedOrderForQuote) return;
    try {
      const res = await api.reviewEnquiry(selectedOrderForQuote.id, {
        action: 'approve',
        quotationData: quoteFormData
      });
      if (res.success) {
        showNotification('Quotation revised and sent to customer for review!');
        setIsQuoteEditModalOpen(false);
        loadDashboardData();
      }
    } catch (err) {
      showNotification(err.message || 'Error updating and approving quotation', 'error');
    }
  };

  const handleDirectApprove = async (orderId) => {
    try {
      const res = await api.reviewEnquiry(orderId, { action: 'approve' });
      if (res.success) {
        showNotification('Order directly approved! Advance deposit unlocked for client.');
        loadDashboardData();
      }
    } catch (err) {
      showNotification(err.message || 'Error approving order', 'error');
    }
  };

  const handleOpenRejectionModal = (enq) => {
    setRejectionModalOrder(enq);
    setRejectionReason('Selected event date has overlapping bookings at Dwarka Shri Lawn.');
  };

  const handleConfirmReject = async () => {
    if (!rejectionModalOrder) return;
    try {
      const res = await api.reviewEnquiry(rejectionModalOrder.id, {
        action: 'reject',
        rejectionReason: rejectionReason || 'Unavailable on selected dates'
      });
      if (res.success) {
        showNotification('Order declined and customer notification sent.');
        setRejectionModalOrder(null);
        setRejectionReason('');
        loadDashboardData();
      }
    } catch (err) {
      showNotification(err.message || 'Error rejecting order', 'error');
    }
  };

  const handleOpenOfflinePayModal = (enq) => {
    setOfflinePayModalOrder(enq);
    const total = enq.grandTotal || enq.estimatedCost || 0;
    const due = Math.max(0, total - (enq.advancePaid || 0));
    setOfflinePayForm({
      amount: due > 0 ? (enq.advancePaid > 0 ? due : Math.ceil(total * 0.5)) : total,
      paymentMethod: 'Cash',
      referenceNumber: `REC-${Date.now().toString().slice(-6)}`,
      notes: 'Received in person at Lucknow branch'
    });
  };

  const handleRecordOfflinePayment = async (e) => {
    if (e) e.preventDefault();
    if (!offlinePayModalOrder) return;
    try {
      const res = await api.recordOfflinePayment({
        enquiryId: offlinePayModalOrder.id,
        amount: parseFloat(offlinePayForm.amount),
        paymentMethod: offlinePayForm.paymentMethod,
        referenceNumber: offlinePayForm.referenceNumber,
        notes: offlinePayForm.notes
      });
      if (res.success) {
        showNotification(`Recorded offline payment of ₹${offlinePayForm.amount}! Order status is now ${res.data?.status || 'Confirmed'}.`);
        setOfflinePayModalOrder(null);
        loadDashboardData();
      }
    } catch (err) {
      showNotification(err.message || 'Error recording offline payment', 'error');
    }
  };

  const handleGenerateFoodImage = async (dishId) => {
    setIsGeneratingFoodImage(true);
    try {
      const res = await api.generateFoodImage(dishId);
      if (res.success) {
        showNotification('Dish photograph generated and updated!');
        const catRes = await api.getCateringMenu({ activeOnly: 'false' });
        if (catRes.success) setCateringDishes(catRes.data || []);
      }
    } catch (err) {
      showNotification(err.message || 'Error generating image', 'error');
    } finally {
      setIsGeneratingFoodImage(false);
    }
  };

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const enqRes = await api.getEnquiries();
      if (enqRes.success) setEnquiries(enqRes.data);

      const itemsRes = await api.getItems();
      if (itemsRes.success) setItems(itemsRes.data);

      const venueRes = await api.getVenue();
      if (venueRes.success) setVenue(venueRes.data);

      const galRes = await api.getGallery();
      if (galRes.success) {
        setGalleryItems(galRes.data || []);
        if (galRes.categories) setGalleryCategories(galRes.categories);
      }

      const catRes = await api.getCateringMenu({ activeOnly: 'false' });
      if (catRes.success) {
        setCateringDishes(catRes.data || []);
        setCateringCategories(catRes.categories || []);
      }

      const custRes = await api.getCustomers().catch(() => ({ customers: [] }));
      if (custRes && custRes.success) {
        setCustomers(custRes.customers || []);
      }

      const repRes = await api.getReportSummary().catch(() => ({ success: false }));
      if (repRes && repRes.success) {
        setReportSummary(repRes.data);
      }
    } catch (err) {
      console.warn('Dashboard data fetch error:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  // --- ENQUIRY ACTIONS ---
  const handleUpdateEnquiry = async (enquiryId, updates) => {
    try {
      const res = await api.updateEnquiryStatus(enquiryId, updates);
      if (res.success) {
        setEnquiries(prev => prev.map(e => e.id === enquiryId ? { ...e, ...updates } : e));
        showNotification('Enquiry updated successfully');
      }
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const handleDeleteEnquiry = async (enquiryId) => {
    if (!window.confirm('Are you sure you want to delete this enquiry record?')) return;
    try {
      const res = await api.deleteEnquiry(enquiryId);
      if (res.success) {
        setEnquiries(prev => prev.filter(e => e.id !== enquiryId));
        showNotification('Enquiry deleted');
      }
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const handleExportCSV = async () => {
    try {
      showNotification('Generating CSV export...');
      await api.exportCSV();
      showNotification('CSV exported successfully!');
    } catch (err) {
      showNotification(err.message || 'Error exporting CSV', 'error');
    }
  };

  // --- ITEM ACTIONS ---
  const handleOpenItemModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setItemFormData({
        name: item.name,
        category: item.category,
        description: item.description,
        availableQuantity: item.availableQuantity,
        availabilityStatus: item.availabilityStatus,
        internalNotes: item.internalNotes || '',
        imageUrl: item.imageUrl,
        featured: item.featured || false
      });
    } else {
      setEditingItem(null);
      setItemFormData({
        name: '',
        category: 'Chairs & Seating',
        description: '',
        availableQuantity: 10,
        availabilityStatus: 'Available',
        internalNotes: '',
        imageUrl: '/media/seating/seating-1.jpg',
        featured: false
      });
    }
    setIsItemModalOpen(true);
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        const res = await api.updateItem(editingItem.id, itemFormData);
        if (res.success) {
          setItems(prev => prev.map(it => it.id === editingItem.id ? res.data : it));
          showNotification('Item updated successfully');
        }
      } else {
        const res = await api.createItem(itemFormData);
        if (res.success) {
          setItems(prev => [res.data, ...prev]);
          showNotification('New item added to inventory');
        }
      }
      setIsItemModalOpen(false);
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this inventory item?')) return;
    try {
      const res = await api.deleteItem(itemId);
      if (res.success) {
        setItems(prev => prev.filter(it => it.id !== itemId));
        showNotification('Item removed from inventory');
      }
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  // --- VENUE ACTIONS ---
  const handleSaveVenueInfo = async (e) => {
    e.preventDefault();
    try {
      const res = await api.updateVenue(venue);
      if (res.success) {
        showNotification('Venue details updated successfully');
      }
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const handleAddAmenity = async (e) => {
    e.preventDefault();
    if (!newAmenity.title || !newAmenity.description) return;
    try {
      const res = await api.addAmenity(newAmenity);
      if (res.success) {
        setVenue(prev => ({ ...prev, amenities: res.data }));
        setNewAmenity({ title: '', description: '', icon: 'CheckCircle' });
        showNotification('Amenity added');
      }
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const handleDeleteAmenity = async (amenityId) => {
    try {
      const res = await api.deleteAmenity(amenityId);
      if (res.success) {
        setVenue(prev => ({ ...prev, amenities: prev.amenities.filter(a => a.id !== amenityId) }));
        showNotification('Amenity removed');
      }
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  // --- GALLERY ACTIONS (7 Sections) ---
  const handleAddGalleryPhoto = async (e) => {
    e.preventDefault();
    if (!newGalleryPhoto.title || !newGalleryPhoto.imageUrl) return;
    try {
      const res = await api.addGalleryItem(newGalleryPhoto);
      if (res.success) {
        setGalleryItems(prev => [res.data, ...prev]);
        setNewGalleryPhoto({
          title: '',
          category: 'Actual wedding and reception setups',
          imageUrl: '/media/catering/catering-1.jpg',
          caption: '',
          eventType: 'Wedding',
          tags: 'Wedding, Setup',
          featured: false
        });
        showNotification('Photo added to gallery successfully');
      }
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const handleEditGalleryPhoto = (item) => {
    setEditingGalleryItem(item);
    setGalleryEditFormData({
      title: item.title || '',
      category: item.category || 'Actual wedding and reception setups',
      imageUrl: item.imageUrl || '',
      caption: item.caption || '',
      eventType: item.eventType || 'Wedding',
      tags: Array.isArray(item.tags) ? item.tags.join(', ') : (item.tags || ''),
      featured: Boolean(item.featured)
    });
    setIsGalleryEditModalOpen(true);
  };

  const handleSaveGalleryEdit = async (e) => {
    e.preventDefault();
    if (!editingGalleryItem) return;
    try {
      const tagsArr = typeof galleryEditFormData.tags === 'string'
        ? galleryEditFormData.tags.split(',').map(t => t.trim()).filter(Boolean)
        : galleryEditFormData.tags;

      const updates = {
        title: galleryEditFormData.title,
        category: galleryEditFormData.category,
        caption: galleryEditFormData.caption,
        eventType: galleryEditFormData.eventType,
        tags: tagsArr,
        featured: galleryEditFormData.featured
      };

      const res = await api.updateGalleryItem(editingGalleryItem.id, updates);
      if (res.success) {
        setGalleryItems(prev => prev.map(g => g.id === editingGalleryItem.id ? res.data : g));
        showNotification('Gallery photo updated successfully');
        setIsGalleryEditModalOpen(false);
        setEditingGalleryItem(null);
      }
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const handleToggleGalleryFeatured = async (item) => {
    try {
      const nextFeatured = !item.featured;
      const res = await api.updateGalleryItem(item.id, { featured: nextFeatured });
      if (res.success) {
        setGalleryItems(prev => prev.map(g => g.id === item.id ? { ...g, featured: nextFeatured } : g));
        showNotification(`Photo ${nextFeatured ? 'marked as Featured' : 'unmarked from Featured'}`);
      }
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const handleDeleteGalleryPhoto = async (id) => {
    if (!window.confirm('Delete this photo from gallery?')) return;
    try {
      const res = await api.deleteGalleryItem(id);
      if (res.success) {
        setGalleryItems(prev => prev.filter(g => g.id !== id));
        showNotification('Photo removed from gallery');
      }
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  // --- CATERING MENU ACTIONS ---
  const handleOpenAddCateringModal = () => {
    setEditingCateringDish(null);
    setCateringFormData({
      name: '',
      category: cateringCategories[0]?.name || 'Welcome Drinks and Starters',
      description: '',
      selectionRule: 'Any 2',
      maxSelect: 2,
      dietary: 'Veg',
      isPopular: false,
      isActive: true,
      order: cateringDishes.length + 1
    });
    setIsCateringModalOpen(true);
  };

  const handleOpenEditCateringModal = (dish) => {
    setEditingCateringDish(dish);
    setCateringFormData({
      name: dish.name || '',
      category: dish.category || 'Welcome Drinks and Starters',
      description: dish.description || '',
      selectionRule: dish.selectionRule || 'Any 2',
      maxSelect: dish.maxSelect || 2,
      dietary: dish.dietary || 'Veg',
      isPopular: Boolean(dish.isPopular),
      isActive: dish.isActive !== false,
      order: dish.order || 1
    });
    setIsCateringModalOpen(true);
  };

  const handleSaveCateringDish = async (e) => {
    e.preventDefault();
    if (!cateringFormData.name.trim()) return;
    try {
      if (editingCateringDish) {
        const res = await api.updateCateringItem(editingCateringDish.id, cateringFormData);
        if (res.success) {
          setCateringDishes(prev => prev.map(d => d.id === editingCateringDish.id ? res.data : d));
          showNotification('Catering dish updated successfully');
        }
      } else {
        const res = await api.addCateringItem(cateringFormData);
        if (res.success) {
          setCateringDishes(prev => [...prev, res.data]);
          showNotification('New catering dish added successfully');
        }
      }
      setIsCateringModalOpen(false);
      setEditingCateringDish(null);
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const handleToggleCateringActive = async (dish) => {
    try {
      const nextStatus = !dish.isActive;
      const res = await api.updateCateringItem(dish.id, { isActive: nextStatus });
      if (res.success) {
        setCateringDishes(prev => prev.map(d => d.id === dish.id ? { ...d, isActive: nextStatus } : d));
        showNotification(`Dish marked as ${nextStatus ? 'Active' : 'Inactive'}`);
      }
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const handleDeleteCateringDish = async (id) => {
    if (!window.confirm('Are you sure you want to delete this dish from the menu?')) return;
    try {
      const res = await api.deleteCateringItem(id);
      if (res.success) {
        setCateringDishes(prev => prev.filter(d => d.id !== id));
        showNotification('Dish removed from catering menu');
      }
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  // Filtered enquiries
  const filteredEnquiries = enquiries.filter(e => {
    const matchesStatus = enquiryStatusFilter === 'all' || e.status === enquiryStatusFilter;
    const matchesService = enquiryServiceFilter === 'all' || e.serviceRequired === enquiryServiceFilter;
    const matchesLocality = enquiryLocalityFilter === 'all' || e.locality === enquiryLocalityFilter;
    const q = enquirySearchQuery.toLowerCase();
    const matchesSearch = !q || 
      e.customerName.toLowerCase().includes(q) || 
      e.phone.includes(q) || 
      (e.id && e.id.toLowerCase().includes(q)) ||
      (e.locality && e.locality.toLowerCase().includes(q));
    return matchesStatus && matchesService && matchesLocality && matchesSearch;
  });

  // Filtered inventory items
  const filteredItems = items.filter(it => {
    const matchesCat = itemCategoryFilter === 'all' || it.category === itemCategoryFilter || it.categoryId === itemCategoryFilter;
    const q = itemSearchQuery.toLowerCase();
    const matchesSearch = !q || it.name.toLowerCase().includes(q) || it.description.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-brand-cream/50 pb-20 animate-fadeIn">
      
      {/* Top Header */}
      <div className="bg-brand-dark text-white border-b border-brand-purple/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl royal-gradient flex items-center justify-center text-brand-gold border border-brand-gold/40">
              <span className="font-serif font-black text-xl">K</span>
            </div>
            <div>
              <h1 className="text-xl font-serif font-bold text-white">
                Admin Control Dashboard
              </h1>
              <p className="text-xs text-brand-goldLight">
                Kandhari Tent & Caterers | Dwarka Shri Lawn, Lucknow
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 transition"
              title="Download CSV for Excel"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <span className="text-xs text-neutral-300 hidden md:inline">
              Admin: <strong className="text-white">{user?.username || 'admin'}</strong>
            </span>

            <button
              onClick={handleLogout}
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-rose-900/40 text-neutral-200 hover:text-white border border-white/20 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Navigation Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto gap-2 border-t border-white/10 pt-2 pb-1 scrollbar-none">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-brand-cream/90 text-brand-primary border-t-2 border-brand-gold shadow-xs'
                : 'text-neutral-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-brand-gold" />
            <span>Executive Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('enquiries')}
            className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'enquiries'
                ? 'bg-brand-cream/90 text-brand-primary border-t-2 border-brand-gold shadow-xs'
                : 'text-neutral-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-brand-gold" />
            <span>Orders & Enquiries ({enquiries.length})</span>
            {enquiries.filter(e => e.status === 'Pending Admin Approval' || e.status === 'New').length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-rose-500 text-white font-extrabold animate-pulse">
                {enquiries.filter(e => e.status === 'Pending Admin Approval' || e.status === 'New').length} Pending
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('customers')}
            className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'customers'
                ? 'bg-brand-cream/90 text-brand-primary border-t-2 border-brand-gold shadow-xs'
                : 'text-neutral-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-4 h-4 text-brand-gold" />
            <span>Customer Directory ({customers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'reports'
                ? 'bg-brand-cream/90 text-brand-primary border-t-2 border-brand-gold shadow-xs'
                : 'text-neutral-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Receipt className="w-4 h-4 text-brand-gold" />
            <span>Financial Reports</span>
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'inventory'
                ? 'bg-brand-cream/90 text-brand-primary border-t-2 border-brand-gold shadow-xs'
                : 'text-neutral-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Package className="w-4 h-4 text-brand-gold" />
            <span>Rental Inventory ({items.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('venue')}
            className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'venue'
                ? 'bg-brand-cream/90 text-brand-primary border-t-2 border-brand-gold shadow-xs'
                : 'text-neutral-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <MapPin className="w-4 h-4 text-brand-gold" />
            <span>Dwarka Shri Lawn Settings</span>
          </button>

          <button
            onClick={() => setActiveTab('gallery')}
            className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'gallery'
                ? 'bg-brand-cream/90 text-brand-primary border-t-2 border-brand-gold shadow-xs'
                : 'text-neutral-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-brand-gold" />
            <span>Photo Gallery ({galleryItems.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('catering')}
            className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'catering'
                ? 'bg-brand-cream/90 text-brand-primary border-t-2 border-brand-gold shadow-xs'
                : 'text-neutral-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <UtensilsCrossed className="w-4 h-4 text-brand-gold" />
            <span>Catering Menu ({cateringDishes.length})</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-md ${
            notification.type === 'error' ? 'bg-rose-100 text-rose-800 border border-rose-300' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
          }`}>
            {notification.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            <span>{notification.msg}</span>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* STATS SUMMARY BAR */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs">
            <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Total Enquiries</p>
            <p className="text-2xl font-serif font-black text-brand-primary mt-1">{enquiries.length}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs">
            <p className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider">New (Unactioned)</p>
            <p className="text-2xl font-serif font-black text-rose-600 mt-1">{enquiries.filter(e => e.status === 'New').length}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs">
            <p className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider">Quoted / Pending</p>
            <p className="text-2xl font-serif font-black text-amber-600 mt-1">{enquiries.filter(e => e.status === 'Quoted' || e.status === 'Contacted').length}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs">
            <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">Confirmed</p>
            <p className="text-2xl font-serif font-black text-emerald-600 mt-1">{enquiries.filter(e => e.status === 'Confirmed').length}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs">
            <p className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider">Referred Out</p>
            <p className="text-2xl font-serif font-black text-indigo-600 mt-1">{enquiries.filter(e => e.status === 'Referred').length}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs">
            <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Inventory Items</p>
            <p className="text-2xl font-serif font-black text-neutral-900 mt-1">{items.length}</p>
          </div>
        </div>

        {/* ========================================================
            TAB 0: EXECUTIVE OVERVIEW & BUSINESS METRICS
           ======================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Top Key Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Gross Bookings Revenue</p>
                  <p className="text-2xl font-serif font-black text-brand-primary mt-1">
                    ₹{(reportSummary?.totalRevenue || 0).toLocaleString('en-IN')}
                  </p>
                  <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" /> Direct INR Settled
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                  <IndianRupee className="w-6 h-6 text-brand-gold" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-rose-600 uppercase tracking-wider">Pending Admin Approval</p>
                  <p className="text-2xl font-serif font-black text-rose-600 mt-1">
                    {enquiries.filter(e => e.status === 'Pending Admin Approval' || e.status === 'New').length}
                  </p>
                  <span className="text-[11px] text-neutral-500 font-medium mt-1 inline-block">
                    Requires stock & date verification
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600">
                  <Clock className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Confirmed Bookings</p>
                  <p className="text-2xl font-serif font-black text-emerald-600 mt-1">
                    {enquiries.filter(e => e.status === 'Confirmed').length}
                  </p>
                  <span className="text-[11px] text-emerald-700 font-medium mt-1 inline-block">
                    Dates secured on event calendar
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Registered Clients</p>
                  <p className="text-2xl font-serif font-black text-indigo-600 mt-1">
                    {customers.length}
                  </p>
                  <span className="text-[11px] text-neutral-500 font-medium mt-1 inline-block">
                    Verified customer directory
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <Users className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Pending Approvals Section */}
            <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-600" />
                  <h3 className="text-base font-bold text-neutral-900">
                    Bookings Pending Admin Approval ({enquiries.filter(e => e.status === 'Pending Admin Approval' || e.status === 'New').length})
                  </h3>
                </div>
                <button
                  onClick={() => { setActiveTab('enquiries'); setEnquiryStatusFilter('Pending Admin Approval'); }}
                  className="text-xs font-bold text-brand-primary hover:underline flex items-center gap-1"
                >
                  <span>View All Orders</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {enquiries.filter(e => e.status === 'Pending Admin Approval' || e.status === 'New').length === 0 ? (
                <div className="py-8 text-center text-neutral-400 text-xs">
                  <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
                  <span>All customer booking requests have been reviewed and actioned!</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {enquiries.filter(e => e.status === 'Pending Admin Approval' || e.status === 'New').slice(0, 5).map((enq) => (
                    <div
                      key={enq.id}
                      className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-brand-primary bg-white px-2 py-0.5 rounded border border-neutral-200">
                            {enq.id}
                          </span>
                          <span className="font-bold text-neutral-900 text-sm">
                            {enq.customerName}
                          </span>
                          <span className="text-xs text-neutral-500">
                            (+91 {enq.phone})
                          </span>
                        </div>
                        <p className="text-xs text-neutral-600 mt-1">
                          Date: <strong>{enq.eventDate}</strong> &bull; Service: <strong>{enq.serviceRequired}</strong> &bull; Locality: <strong>{enq.locality || 'Lucknow'}</strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDirectApprove(enq.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Direct Approve</span>
                        </button>
                        <button
                          onClick={() => handleOpenQuoteModal(enq)}
                          className="px-3 py-1.5 bg-brand-primary hover:bg-brand-primary/95 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-xs"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-brand-gold" />
                          <span>Revise & Approve</span>
                        </button>
                        <button
                          onClick={() => handleOpenRejectionModal(enq)}
                          className="px-3 py-1.5 bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-bold transition"
                        >
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 1: CUSTOMER ENQUIRIES MANAGER
           ======================================================== */}
        {activeTab === 'enquiries' && (
          <div className="space-y-6">
            
            {/* Filter & Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-sm flex flex-col gap-3">
              
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={enquirySearchQuery}
                    onChange={(e) => setEnquirySearchQuery(e.target.value)}
                    placeholder="Search name, phone, ref, locality..."
                    className="w-full pl-9 pr-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-accent outline-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportCSV}
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm hover:bg-emerald-700 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Enquiries CSV</span>
                  </button>
                </div>
              </div>

              {/* Status and Locality Filter Chips */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-neutral-100">
                <span className="text-[11px] font-bold text-neutral-500">Status:</span>
                {['all', 'Pending Admin Approval', 'Approved — Awaiting Customer Acceptance', 'Approved — Awaiting Payment', 'Confirmed', 'Rejected', 'Cancelled', 'New'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setEnquiryStatusFilter(st)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                      enquiryStatusFilter === st
                        ? 'royal-gradient text-white shadow-xs'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    {st === 'all' ? 'All' : st}
                  </button>
                ))}
              </div>

            </div>

            {/* Enquiries List */}
            {filteredEnquiries.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-neutral-300 p-8 space-y-2">
                <ShoppingBag className="w-10 h-10 text-neutral-300 mx-auto" />
                <h4 className="text-sm font-bold text-neutral-800">No customer enquiries match this filter</h4>
                <p className="text-xs text-neutral-500">Try clearing search terms or selecting "All" statuses.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {filteredEnquiries.map((enq) => (
                  <div
                    key={enq.id}
                    className="bg-white rounded-3xl border border-neutral-200/80 shadow-xs hover:shadow-md transition p-6 space-y-4"
                  >
                    {/* Top Row: Ref ID, Service Badge, Status Dropdown */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 pb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-brand-purple bg-purple-50 px-2.5 py-1 rounded-md border border-purple-200">
                          {enq.id}
                        </span>
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                          {enq.serviceRequired || 'Event Rentals'}
                        </span>
                        {enq.conversationId && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            <span>AI Chat Lead</span>
                          </span>
                        )}
                        <span className="text-xs text-neutral-400">
                          Received: {new Date(enq.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Status Selector */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-neutral-600">Status:</span>
                        <select
                          value={enq.status}
                          onChange={(e) => handleUpdateEnquiry(enq.id, { status: e.target.value })}
                          className={`text-xs font-bold px-3 py-1.5 rounded-xl border outline-none cursor-pointer ${
                            enq.status === 'New' ? 'bg-rose-50 text-rose-700 border-rose-300' :
                            enq.status === 'Under Review' ? 'bg-amber-50 text-amber-700 border-amber-300' :
                            enq.status === 'Quotation Prepared' ? 'bg-blue-50 text-blue-700 border-blue-300' :
                            enq.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' :
                            enq.status === 'Advance Pending' ? 'bg-orange-50 text-orange-700 border-orange-300' :
                            enq.status === 'Partially Paid' ? 'bg-purple-50 text-purple-700 border-purple-300' :
                            enq.status === 'Fully Paid' ? 'bg-emerald-100 text-emerald-800 border-emerald-400' :
                            enq.status === 'Completed' ? 'bg-teal-50 text-teal-700 border-teal-300' :
                            enq.status === 'Cancelled' ? 'bg-neutral-100 text-neutral-500 border-neutral-300' :
                            'bg-neutral-100 text-neutral-600 border-neutral-300'
                          }`}
                        >
                          <option value="New">🔴 New</option>
                          <option value="Under Review">🟡 Under Review</option>
                          <option value="Quotation Prepared">🔵 Quotation Prepared</option>
                          <option value="Confirmed">🟢 Confirmed</option>
                          <option value="Advance Pending">🟠 Advance Pending</option>
                          <option value="Partially Paid">🟣 Partially Paid</option>
                          <option value="Fully Paid">✅ Fully Paid</option>
                          <option value="Completed">🎉 Completed</option>
                          <option value="Cancelled">❌ Cancelled</option>
                          <option value="Contacted">📞 Contacted</option>
                          <option value="In Discussion">💬 In Discussion</option>
                          <option value="Closed">⚪ Closed</option>
                        </select>
                      </div>
                    </div>

                    {/* Customer & Event Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      
                      {/* Customer Info & Direct Calls */}
                      <div className="space-y-1.5">
                        <p className="font-bold text-neutral-900 text-sm flex items-center gap-1.5">
                          <User className="w-4 h-4 text-brand-purple" />
                          <span>{enq.customerName}</span>
                        </p>
                        
                        <div className="flex items-center gap-3 pt-1">
                          <a
                            href={`tel:${enq.phone}`}
                            className="inline-flex items-center gap-1 font-bold text-brand-primary hover:underline"
                          >
                            <Phone className="w-3.5 h-3.5 text-brand-gold" />
                            <span>{enq.phone}</span>
                          </a>
                          <a
                            href={`https://wa.me/91${(enq.whatsappNumber || enq.phone).replace(/[^0-9]/g, '').slice(-10)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </a>
                        </div>

                        {enq.email && <p className="text-neutral-500">{enq.email}</p>}
                        
                        <div className="pt-1">
                          <span className="text-[10px] text-neutral-400">
                            Consent Verified: {enq.consentGiven ? '✅ Yes' : '—'}
                          </span>
                        </div>
                      </div>

                      {/* Event Details */}
                      <div className="space-y-1.5 text-neutral-700">
                        <p><strong className="text-neutral-900">Event Date:</strong> {enq.eventDate}</p>
                        <p><strong className="text-neutral-900">Locality:</strong> <span className="text-brand-purple font-semibold">{enq.locality || 'Kanpur Road'}</span></p>
                        {enq.eventVenueAddress && (
                          <p><strong className="text-neutral-900">Venue/Address:</strong> {enq.eventVenueAddress}</p>
                        )}
                        {enq.guestCount > 0 && <p><strong className="text-neutral-900">Est. Guests:</strong> {enq.guestCount}</p>}
                        {enq.budgetRange && <p><strong className="text-neutral-900">Budget:</strong> {enq.budgetRange}</p>}
                      </div>

                      {/* Customer Notes */}
                      <div>
                        <strong className="text-neutral-900 block mb-1">Customer Requirements / Notes:</strong>
                        <p className="text-neutral-600 italic bg-neutral-50 p-2.5 rounded-xl border border-neutral-200">
                          {enq.notes || 'No additional instructions provided.'}
                        </p>
                      </div>

                    </div>

                    {/* Requested Equipment Items */}
                    {((enq.lineItems && enq.lineItems.length > 0) || (enq.items && enq.items.length > 0)) && (
                      <div className="bg-purple-50/60 p-3.5 rounded-2xl border border-purple-100 text-xs">
                        <strong className="text-brand-primary block mb-2 font-bold flex items-center justify-between">
                          <span>Requested Rental Inventory ({(enq.lineItems || enq.items).length} items):</span>
                          {enq.rentalDays && (
                            <span className="text-[10px] bg-purple-200/80 text-brand-purple px-2 py-0.5 rounded-md font-bold">
                              {enq.rentalDays} Day{enq.rentalDays > 1 ? 's' : ''} Duration
                            </span>
                          )}
                        </strong>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                          {(enq.lineItems || enq.items).map((it, idx) => (
                            <div key={idx} className="bg-white px-3 py-2 rounded-xl border border-neutral-200 flex flex-col justify-between shadow-xs">
                              <div className="flex justify-between items-start gap-1">
                                <span className="font-semibold text-neutral-800 text-xs">{it.name}</span>
                                <span className="font-bold text-brand-purple shrink-0 text-xs">Qty: {it.quantity}</span>
                              </div>
                              <div className="flex items-center justify-between mt-1 text-[11px] text-neutral-500">
                                <span>{it.dimensions ? <span className="text-amber-800 font-medium bg-amber-50 px-1 rounded">{it.dimensions}</span> : (it.billingUnit || 'per piece')}</span>
                                <span className="font-bold text-neutral-900">
                                  {it.lineTotal ? `₹${it.lineTotal.toLocaleString('en-IN')}` : (it.unitRate ? `₹${(it.unitRate * it.quantity).toLocaleString('en-IN')}` : '—')}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Order Financial Breakdown & Quotation Engine Bar */}
                    <div className="bg-amber-50/40 rounded-2xl border border-amber-200/80 p-4 text-xs space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200/60 pb-2">
                        <div className="flex items-center gap-2">
                          <Receipt className="w-4 h-4 text-brand-gold" />
                          <span className="font-bold text-neutral-900 text-sm">
                            Billing & Quotation Overview
                          </span>
                          {enq.quotationNumber && (
                            <span className="bg-brand-primary/10 text-brand-primary font-mono text-[10px] font-bold px-2 py-0.5 rounded-md">
                              {enq.quotationNumber}
                            </span>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-wrap items-center gap-2">
                          {(enq.status === 'Pending Admin Approval' || enq.status === 'New') && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleDirectApprove(enq.id)}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-xs"
                                title="Approve booking as-is without price revision"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Direct Approve</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOpenRejectionModal(enq)}
                                className="px-3 py-1.5 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 font-bold text-xs transition"
                              >
                                <span>Reject</span>
                              </button>
                            </>
                          )}

                          {enq.status !== 'Confirmed' && enq.status !== 'Cancelled' && enq.status !== 'Rejected' && (
                            <button
                              type="button"
                              onClick={() => handleOpenOfflinePayModal(enq)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 font-bold text-xs transition flex items-center gap-1.5 shadow-xs"
                              title="Log Cash, Cheque, or Bank Transfer deposit"
                            >
                              <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Record Offline Payment</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleOpenQuoteModal(enq)}
                            className="px-3 py-1.5 rounded-xl bg-brand-primary text-white font-bold text-xs hover:bg-brand-primary/90 transition flex items-center gap-1.5 shadow-xs"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-brand-gold" />
                            <span>Edit Quotation & Rates</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenBillPrintModal(enq)}
                            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-brand-primary font-bold text-xs transition flex items-center gap-1.5 shadow-xs"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Print Letterhead Bill</span>
                          </button>
                        </div>
                      </div>

                      {/* Pricing figures grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 pt-1 text-center">
                        <div className="bg-white/80 p-2 rounded-xl border border-amber-100">
                          <span className="text-[10px] text-neutral-500 font-semibold block">Subtotal</span>
                          <span className="font-bold text-neutral-900 text-sm">₹{(enq.subtotal || 0).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="bg-white/80 p-2 rounded-xl border border-amber-100">
                          <span className="text-[10px] text-neutral-500 font-semibold block">Cartage (Round)</span>
                          <span className="font-bold text-neutral-900 text-sm">₹{(enq.cartage !== undefined ? enq.cartage : 500).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="bg-white/80 p-2 rounded-xl border border-amber-100">
                          <span className="text-[10px] text-neutral-500 font-semibold block">Labour & Setup</span>
                          <span className="font-bold text-neutral-900 text-sm">₹{(enq.labour !== undefined ? enq.labour : 500).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="bg-white/80 p-2 rounded-xl border border-amber-100">
                          <span className="text-[10px] text-neutral-500 font-semibold block">Discount</span>
                          <span className="font-bold text-emerald-600 text-sm">{enq.discount > 0 ? `-₹${enq.discount.toLocaleString('en-IN')}` : '₹0'}</span>
                        </div>
                        <div className="bg-brand-primary/5 p-2 rounded-xl border border-brand-primary/20">
                          <span className="text-[10px] text-brand-primary font-bold block uppercase tracking-wider">Grand Total</span>
                          <span className="font-bold text-brand-primary text-sm">₹{(enq.grandTotal || 0).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="bg-emerald-50 p-2 rounded-xl border border-emerald-200">
                          <span className="text-[10px] text-emerald-700 font-semibold block">Advance Paid</span>
                          <span className="font-bold text-emerald-700 text-sm">₹{(enq.advancePaid || 0).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="bg-rose-50 p-2 rounded-xl border border-rose-200">
                          <span className="text-[10px] text-rose-700 font-semibold block">Balance Due</span>
                          <span className="font-bold text-rose-700 text-sm">₹{((enq.grandTotal || 0) - (enq.advancePaid || 0)).toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Custom Catering Menu Dishes */}
                    {enq.customMenu && enq.customMenu.length > 0 && (
                      <div className="bg-amber-50/60 p-3.5 rounded-2xl border border-amber-200 text-xs">
                        <strong className="text-brand-primary block mb-2 font-bold flex items-center gap-1.5">
                          <UtensilsCrossed className="w-4 h-4 text-brand-gold" />
                          <span>Custom Catering Menu Selected ({enq.customMenu.length} dishes):</span>
                        </strong>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                          {enq.customMenu.map((d, idx) => (
                            <div key={idx} className="bg-white px-3 py-1.5 rounded-xl border border-amber-200 flex justify-between items-center shadow-xs">
                              <span className="font-semibold text-neutral-800 truncate pr-2">{d.name}</span>
                              <span className="text-[10px] text-amber-800 bg-amber-100/60 px-1.5 py-0.5 rounded font-medium">{d.category}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Follow-up, Referral & Team Notes Row */}
                    <div className="pt-3 border-t border-neutral-100 grid grid-cols-1 sm:grid-cols-3 gap-3 items-center text-xs">
                      
                      {/* Next Follow-Up Date */}
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-brand-purple shrink-0" />
                        <span className="font-bold text-neutral-600 whitespace-nowrap">Follow-Up:</span>
                        <input
                          type="date"
                          defaultValue={enq.nextFollowUpDate || ''}
                          onBlur={(e) => handleUpdateEnquiry(enq.id, { nextFollowUpDate: e.target.value })}
                          className="p-1 border border-neutral-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-brand-accent bg-neutral-50"
                        />
                      </div>

                      {/* Referral Vendor Tracking */}
                      <div className="flex items-center gap-1.5">
                        <Share2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span className="font-bold text-neutral-600 whitespace-nowrap">Referral:</span>
                        <input
                          type="text"
                          defaultValue={enq.referredTo || ''}
                          onBlur={(e) => handleUpdateEnquiry(enq.id, { referredTo: e.target.value })}
                          placeholder="Partner vendor name (if referred)..."
                          className="w-full p-1 border border-neutral-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-brand-accent bg-neutral-50"
                        />
                      </div>

                      {/* Delete */}
                      <div className="text-right">
                        <button
                          onClick={() => handleDeleteEnquiry(enq.id)}
                          className="text-xs text-rose-600 hover:text-rose-700 font-semibold inline-flex items-center gap-1 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Record</span>
                        </button>
                      </div>

                    </div>

                    {/* Internal Operational Notes */}
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[11px] font-bold text-neutral-500 whitespace-nowrap">Team Notes:</span>
                      <input
                        type="text"
                        defaultValue={enq.internalNotes || ''}
                        onBlur={(e) => handleUpdateEnquiry(enq.id, { internalNotes: e.target.value })}
                        placeholder="Internal communication note (e.g. called client, quote shared on WhatsApp)..."
                        className="w-full text-xs bg-neutral-50 border border-neutral-200 rounded-lg px-2.5 py-1 text-neutral-700 outline-none focus:bg-white focus:ring-1 focus:ring-brand-accent"
                      />
                    </div>

                  </div>
                ))}
              </div>
            )}

          </div>
        )}

        {/* ========================================================
            TAB: CUSTOMER DIRECTORY & REGISTRY
           ======================================================== */}
        {activeTab === 'customers' && (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={customerSearchQuery}
                  onChange={(e) => setCustomerSearchQuery(e.target.value)}
                  placeholder="Search customer name, mobile, email..."
                  className="w-full pl-9 pr-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-accent outline-none"
                />
              </div>
              <span className="text-xs text-neutral-500 font-semibold">
                Total Registered Clients: <strong>{customers.length}</strong>
              </span>
            </div>

            <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-bold uppercase tracking-wider">
                      <th className="p-4">Customer Name</th>
                      <th className="p-4">Mobile Number</th>
                      <th className="p-4">Email Address</th>
                      <th className="p-4">Registered On</th>
                      <th className="p-4">Total Bookings</th>
                      <th className="p-4">Total Paid (₹)</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {customers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-neutral-400">
                          No registered customer accounts found.
                        </td>
                      </tr>
                    ) : (
                      customers
                        .filter(c => {
                          const q = customerSearchQuery.toLowerCase();
                          return !q || c.name.toLowerCase().includes(q) || c.phone.includes(q) || (c.email && c.email.toLowerCase().includes(q));
                        })
                        .map((cust) => (
                          <tr key={cust.id} className="hover:bg-neutral-50/70 transition">
                            <td className="p-4 font-bold text-neutral-900 flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold text-xs shrink-0">
                                {cust.name?.charAt(0)?.toUpperCase() || 'C'}
                              </div>
                              <span>{cust.name}</span>
                            </td>
                            <td className="p-4 font-semibold text-neutral-700">
                              <a href={`tel:${cust.phone}`} className="hover:text-brand-primary hover:underline">
                                +91 {cust.phone}
                              </a>
                            </td>
                            <td className="p-4 text-neutral-500">
                              {cust.email || '—'}
                            </td>
                            <td className="p-4 text-neutral-500">
                              {new Date(cust.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </td>
                            <td className="p-4 font-bold text-neutral-800">
                              {cust.totalOrders || 0}
                            </td>
                            <td className="p-4 font-bold text-emerald-700">
                              ₹{(cust.totalPaid || 0).toLocaleString('en-IN')}
                            </td>
                            <td className="p-4 text-right">
                              <button
                                onClick={() => {
                                  setEnquirySearchQuery(cust.phone);
                                  setActiveTab('enquiries');
                                }}
                                className="px-3 py-1.5 rounded-xl bg-brand-primary/10 text-brand-primary font-bold text-xs hover:bg-brand-primary hover:text-white transition"
                              >
                                View Enquiries
                              </button>
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB: FINANCIAL REPORTS & ANALYTICS
           ======================================================== */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            {/* Date Range Picker & Controls */}
            <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-bold text-neutral-700 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-brand-gold" />
                  <span>Date Range:</span>
                </span>
                <input
                  type="date"
                  value={reportDateRange.startDate}
                  onChange={(e) => setReportDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  className="px-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-xl outline-none"
                />
                <span className="text-xs text-neutral-400">to</span>
                <input
                  type="date"
                  value={reportDateRange.endDate}
                  onChange={(e) => setReportDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  className="px-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-xl outline-none"
                />
                <button
                  onClick={async () => {
                    const res = await api.getReportSummary(reportDateRange);
                    if (res.success) setReportSummary(res.data);
                  }}
                  className="px-4 py-1.5 rounded-xl bg-brand-primary text-white font-bold text-xs hover:bg-brand-primary/95 transition shadow-xs"
                >
                  Apply Filter
                </button>
                {(reportDateRange.startDate || reportDateRange.endDate) && (
                  <button
                    onClick={async () => {
                      setReportDateRange({ startDate: '', endDate: '' });
                      const res = await api.getReportSummary({});
                      if (res.success) setReportSummary(res.data);
                    }}
                    className="px-3 py-1.5 rounded-xl border border-neutral-300 text-neutral-600 text-xs font-semibold hover:bg-neutral-50"
                  >
                    Reset
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => api.exportReportCSV(reportDateRange)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm hover:bg-emerald-700 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download CSV</span>
                </button>
                <a
                  href={api.getReportPrintableUrl(reportDateRange)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-brand-primary text-white font-bold text-xs flex items-center gap-1.5 shadow-sm hover:bg-brand-primary/95 transition"
                >
                  <Printer className="w-3.5 h-3.5 text-brand-gold" />
                  <span>Print Formal Report (HTML/PDF)</span>
                </a>
              </div>
            </div>

            {/* Financial Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-xs">
                <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">Total Billed Revenue</span>
                <span className="text-2xl font-serif font-black text-brand-primary mt-1 block">
                  ₹{(reportSummary?.totalRevenue || 0).toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-neutral-400 mt-1 block">From confirmed & active bookings</span>
              </div>
              <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-xs">
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">Total Advance Collected</span>
                <span className="text-2xl font-serif font-black text-emerald-700 mt-1 block">
                  ₹{(reportSummary?.totalAdvanceCollected || 0).toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-emerald-600 mt-1 block">Online & offline recorded</span>
              </div>
              <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-xs">
                <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider block">Average Order Value (AOV)</span>
                <span className="text-2xl font-serif font-black text-indigo-700 mt-1 block">
                  ₹{(reportSummary?.averageOrderValue || 0).toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-neutral-400 mt-1 block">Across {reportSummary?.totalOrders || 0} event bookings</span>
              </div>
              <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-xs">
                <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider block">Pending Receivables</span>
                <span className="text-2xl font-serif font-black text-rose-700 mt-1 block">
                  ₹{Math.max(0, (reportSummary?.totalRevenue || 0) - (reportSummary?.totalAdvanceCollected || 0)).toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-rose-600 mt-1 block">Due on event execution</span>
              </div>
            </div>

            {/* Status Breakdown Table */}
            <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                Bookings Status Distribution
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {Object.entries(reportSummary?.statusBreakdown || {}).map(([st, cnt]) => (
                  <div key={st} className="p-3 rounded-2xl bg-neutral-50 border border-neutral-200/70 text-center">
                    <span className="text-[10px] font-semibold text-neutral-500 block truncate">{st}</span>
                    <span className="text-lg font-black text-brand-primary block mt-0.5">{cnt}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 2: RENTAL INVENTORY MANAGER
           ======================================================== */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            
            <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
              
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={itemSearchQuery}
                    onChange={(e) => setItemSearchQuery(e.target.value)}
                    placeholder="Search equipment name..."
                    className="w-full pl-9 pr-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-accent outline-none"
                  />
                </div>

                <select
                  value={itemCategoryFilter}
                  onChange={(e) => setItemCategoryFilter(e.target.value)}
                  className="bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs font-semibold text-neutral-700 outline-none"
                >
                  <option value="all">All Categories</option>
                  {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => handleOpenItemModal()}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl royal-gradient text-white text-xs font-bold shadow-md hover:opacity-95 transition flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4 text-brand-gold" />
                <span>Add New Rental Item</span>
              </button>

            </div>

            {/* Inventory Items Table */}
            <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-bold uppercase tracking-wider">
                      <th className="p-4">Item & Image</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Available Quantity</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Internal Notes</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {filteredItems.map((it) => (
                      <tr key={it.id} className="hover:bg-neutral-50/70 transition">
                        <td className="p-4 flex items-center gap-3">
                          <img
                            src={it.imageUrl}
                            alt={it.name}
                            className="w-12 h-12 object-cover rounded-lg border border-neutral-200 shrink-0"
                          />
                          <div>
                            <p className="font-bold text-neutral-900 text-sm">{it.name}</p>
                            <p className="text-[11px] text-neutral-400 line-clamp-1 max-w-xs">{it.description}</p>
                          </div>
                        </td>
                        <td className="p-4 font-medium text-neutral-700">
                          {it.category}
                        </td>
                        <td className="p-4 font-bold text-neutral-900">
                          {it.availableQuantity} units
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            it.availabilityStatus === 'Available' ? 'bg-emerald-100 text-emerald-800' :
                            it.availabilityStatus === 'Limited' ? 'bg-amber-100 text-amber-800' :
                            'bg-neutral-100 text-neutral-600'
                          }`}>
                            {it.availabilityStatus}
                          </span>
                        </td>
                        <td className="p-4 text-neutral-500 max-w-xs truncate">
                          {it.internalNotes || '—'}
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => handleOpenItemModal(it)}
                            className="p-1.5 rounded-lg text-brand-purple hover:bg-purple-50 transition"
                            title="Edit Item"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(it.id)}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition"
                            title="Delete Item"
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

          </div>
        )}

        {/* ========================================================
            TAB 3: DWARKA SHRI LAWN VENUE SETTINGS
           ======================================================== */}
        {activeTab === 'venue' && venue && (
          <div className="space-y-8">
            
            <form onSubmit={handleSaveVenueInfo} className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-sm space-y-4">
              <h3 className="text-base font-serif font-bold text-brand-primary flex items-center gap-2">
                <MapPin className="w-5 h-5 text-brand-gold" />
                <span>Dwarka Shri Lawn Venue Information</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Headline</label>
                  <input
                    type="text"
                    value={venue.headline}
                    onChange={(e) => setVenue({ ...venue, headline: e.target.value })}
                    className="w-full p-2.5 text-sm border border-neutral-300 rounded-xl focus:ring-2 focus:ring-brand-accent outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Detailed Venue Description</label>
                  <textarea
                    rows={4}
                    value={venue.description}
                    onChange={(e) => setVenue({ ...venue, description: e.target.value })}
                    className="w-full p-2.5 text-sm border border-neutral-300 rounded-xl focus:ring-2 focus:ring-brand-accent outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Address</label>
                  <input
                    type="text"
                    value={venue.address}
                    onChange={(e) => setVenue({ ...venue, address: e.target.value })}
                    className="w-full p-2.5 text-sm border border-neutral-300 rounded-xl focus:ring-2 focus:ring-brand-accent outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="py-2.5 px-6 rounded-xl royal-gradient text-white text-xs font-bold shadow-md hover:opacity-95 transition flex items-center gap-2"
              >
                <Save className="w-4 h-4 text-brand-gold" />
                <span>Save Venue Details</span>
              </button>
            </form>

            {/* Editable Amenities List */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-sm space-y-6">
              <div>
                <h3 className="text-base font-serif font-bold text-brand-primary">
                  Manage Lawn Amenities & Facilities
                </h3>
                <p className="text-xs text-neutral-500">Live on the public Dwarka Shri Lawn page</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {(venue.amenities || []).map((amenity) => (
                  <div key={amenity.id} className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 relative group">
                    <button
                      onClick={() => handleDeleteAmenity(amenity.id)}
                      className="absolute top-3 right-3 text-neutral-400 hover:text-rose-600 transition"
                      title="Remove Amenity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <h4 className="font-bold text-xs text-neutral-800 pr-6">{amenity.title}</h4>
                    <p className="text-[11px] text-neutral-500 mt-1">{amenity.description}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddAmenity} className="pt-4 border-t border-neutral-200 space-y-3">
                <h4 className="text-xs font-bold text-brand-primary uppercase tracking-wider">
                  Add New Amenity
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Amenity Title (e.g. VIP Green Room)"
                    value={newAmenity.title}
                    onChange={(e) => setNewAmenity({ ...newAmenity, title: e.target.value })}
                    className="p-2 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-brand-accent outline-none"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Short Description..."
                    value={newAmenity.description}
                    onChange={(e) => setNewAmenity({ ...newAmenity, description: e.target.value })}
                    className="p-2 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-brand-accent outline-none sm:col-span-2"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-100 hover:bg-purple-200 text-brand-purple text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Amenity to Lawn</span>
                </button>
              </form>

            </div>

          </div>
        )}

        {/* ========================================================
            TAB 4: PHOTO GALLERY MANAGER
           ======================================================== */}
        {activeTab === 'gallery' && (
          <div className="space-y-8">
            
            {/* Filter by 7 Key Sections */}
            <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 overflow-x-auto w-full pb-1 sm:pb-0 scrollbar-none">
                <span className="text-[11px] font-bold text-neutral-500 whitespace-nowrap">Section:</span>
                {['all', 'Actual wedding and reception setups', 'Dwarka Shri Lawn venue and grounds', 'Stage and mandap designs', 'Tent structures and canopy layouts', 'Seating and furniture arrangements', 'Floral and lighting decor', 'Catering and food counters'].map((sec) => (
                  <button
                    key={sec}
                    onClick={() => setGallerySectionFilter(sec)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                      gallerySectionFilter === sec
                        ? 'royal-gradient text-white shadow-xs'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    {sec === 'all' ? 'All Sections' : sec}
                  </button>
                ))}
              </div>
            </div>

            {/* Add Real Event Photo Form */}
            <form onSubmit={handleAddGalleryPhoto} className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-sm space-y-4">
              <h3 className="text-base font-serif font-bold text-brand-primary flex items-center gap-2">
                <Plus className="w-5 h-5 text-brand-gold" />
                <span>Add Real Lucknow Event Photo to Gallery</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Photo Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Royal Laser-Cut Buffet Line"
                    value={newGalleryPhoto.title}
                    onChange={(e) => setNewGalleryPhoto({ ...newGalleryPhoto, title: e.target.value })}
                    className="w-full p-2.5 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-brand-accent outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Gallery Section *</label>
                  <select
                    value={newGalleryPhoto.category}
                    onChange={(e) => setNewGalleryPhoto({ ...newGalleryPhoto, category: e.target.value })}
                    className="w-full p-2.5 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-brand-accent outline-none bg-white"
                  >
                    <option value="Actual wedding and reception setups">1. Actual wedding and reception setups</option>
                    <option value="Dwarka Shri Lawn venue and grounds">2. Dwarka Shri Lawn venue and grounds</option>
                    <option value="Stage and mandap designs">3. Stage and mandap designs</option>
                    <option value="Tent structures and canopy layouts">4. Tent structures and canopy layouts</option>
                    <option value="Seating and furniture arrangements">5. Seating and furniture arrangements</option>
                    <option value="Floral and lighting decor">6. Floral and lighting decor</option>
                    <option value="Catering and food counters">7. Catering and food counters</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Image URL / Path *</label>
                  <input
                    type="text"
                    required
                    placeholder="/media/catering/catering-1.jpg"
                    value={newGalleryPhoto.imageUrl}
                    onChange={(e) => setNewGalleryPhoto({ ...newGalleryPhoto, imageUrl: e.target.value })}
                    className="w-full p-2.5 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-brand-accent outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Event Type</label>
                  <input
                    type="text"
                    placeholder="Wedding, Reception, Catering..."
                    value={newGalleryPhoto.eventType}
                    onChange={(e) => setNewGalleryPhoto({ ...newGalleryPhoto, eventType: e.target.value })}
                    className="w-full p-2.5 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-brand-accent outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Tags (Comma separated)</label>
                  <input
                    type="text"
                    placeholder="Buffet, Luxury, Gold..."
                    value={newGalleryPhoto.tags}
                    onChange={(e) => setNewGalleryPhoto({ ...newGalleryPhoto, tags: e.target.value })}
                    className="w-full p-2.5 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-brand-accent outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="newPhotoFeatured"
                    checked={newGalleryPhoto.featured}
                    onChange={(e) => setNewGalleryPhoto({ ...newGalleryPhoto, featured: e.target.checked })}
                    className="w-4 h-4 text-brand-purple rounded"
                  />
                  <label htmlFor="newPhotoFeatured" className="font-semibold text-neutral-700 cursor-pointer">
                    Feature in Showcase
                  </label>
                </div>

                <div className="sm:col-span-3">
                  <label className="block font-semibold text-neutral-700 mb-1">Caption / Description</label>
                  <input
                    type="text"
                    placeholder="Detailed description of banquet counter, tent structure, or stage decor..."
                    value={newGalleryPhoto.caption}
                    onChange={(e) => setNewGalleryPhoto({ ...newGalleryPhoto, caption: e.target.value })}
                    className="w-full p-2.5 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-brand-accent outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="py-2.5 px-6 rounded-xl royal-gradient text-white text-xs font-bold shadow-md hover:opacity-95 transition flex items-center gap-2"
              >
                <Plus className="w-4 h-4 text-brand-gold" />
                <span>Upload Photograph to Gallery</span>
              </button>
            </form>

            {/* Gallery Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {galleryItems
                .filter(it => gallerySectionFilter === 'all' || it.category === gallerySectionFilter)
                .map((item) => (
                  <div key={item.id} className="bg-white rounded-2xl overflow-hidden border border-neutral-200 shadow-xs relative group flex flex-col justify-between">
                    <div className="relative aspect-4/3 bg-neutral-100">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      {item.featured && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500 text-white uppercase tracking-wider shadow">
                          Featured
                        </span>
                      )}
                    </div>

                    <div className="p-3.5 space-y-1.5 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-brand-purple bg-purple-50 px-2 py-0.5 rounded truncate block">
                          {item.category}
                        </span>
                        <h4 className="font-bold text-xs text-neutral-900 mt-1 line-clamp-1">{item.title}</h4>
                        {item.caption && (
                          <p className="text-[11px] text-neutral-500 line-clamp-2 mt-0.5">{item.caption}</p>
                        )}
                      </div>

                      <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs">
                        <button
                          type="button"
                          onClick={() => handleToggleGalleryFeatured(item)}
                          className={`text-[11px] font-bold px-2 py-1 rounded-md transition ${
                            item.featured 
                              ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' 
                              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                          }`}
                        >
                          {item.featured ? '★ Featured' : '☆ Feature'}
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleEditGalleryPhoto(item)}
                            className="p-1.5 rounded-lg text-neutral-600 hover:text-brand-purple hover:bg-neutral-100 transition"
                            title="Edit Photo Details"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteGalleryPhoto(item.id)}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="Remove Photo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

          </div>
        )}

        {/* ========================================================
            TAB 5: CATERING MENU MANAGER (14 Categories)
           ======================================================== */}
        {activeTab === 'catering' && (
          <div className="space-y-6">

            {/* Stats Header */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs">
                <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Total Catering Dishes</p>
                <p className="text-2xl font-serif font-black text-brand-primary mt-1">{cateringDishes.length}</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs">
                <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Banqueting Categories</p>
                <p className="text-2xl font-serif font-black text-amber-600 mt-1">{cateringCategories.length}</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs">
                <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Active on Public Menu</p>
                <p className="text-2xl font-serif font-black text-emerald-600 mt-1">
                  {cateringDishes.filter(d => d.isActive !== false).length}
                </p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs">
                <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Banquet Specials</p>
                <p className="text-2xl font-serif font-black text-purple-600 mt-1">
                  {cateringDishes.filter(d => d.isPopular).length}
                </p>
              </div>
            </div>

            {/* Filter, Search & Add Dish Bar */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row gap-3 items-center w-full md:w-auto flex-1">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={cateringSearchQuery}
                    onChange={(e) => setCateringSearchQuery(e.target.value)}
                    placeholder="Search dish name, description..."
                    className="w-full pl-9 pr-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-accent outline-none"
                  />
                </div>

                <select
                  value={cateringCategoryFilter}
                  onChange={(e) => setCateringCategoryFilter(e.target.value)}
                  className="w-full sm:w-auto p-2 text-xs border border-neutral-200 rounded-xl bg-neutral-50 outline-none focus:bg-white"
                >
                  <option value="all">All 14 Categories ({cateringDishes.length})</option>
                  {cateringCategories.map(c => (
                    <option key={c.id} value={c.name}>{c.name} ({c.selectionRule})</option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleOpenAddCateringModal}
                className="w-full sm:w-auto py-2.5 px-5 rounded-xl royal-gradient text-white text-xs font-bold shadow-md hover:opacity-95 transition flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4 text-brand-gold" />
                <span>Add New Catering Dish</span>
              </button>
            </div>

            {/* Catering Dishes Cards / Table */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cateringDishes
                .filter(d => {
                  const matchesCat = cateringCategoryFilter === 'all' || d.category === cateringCategoryFilter;
                  const q = cateringSearchQuery.toLowerCase();
                  const matchesSearch = !q || d.name.toLowerCase().includes(q) || (d.description && d.description.toLowerCase().includes(q));
                  return matchesCat && matchesSearch;
                })
                .map((dish) => (
                  <div
                    key={dish.id}
                    className={`bg-white rounded-2xl p-5 border transition shadow-xs flex flex-col justify-between ${
                      dish.isActive === false ? 'opacity-60 bg-neutral-50 border-neutral-200' : 'border-neutral-200/90'
                    }`}
                  >
                    <div className="space-y-2">
                      {dish.imageUrl && (
                        <div className="w-full h-32 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-100 mb-2">
                          <img
                            src={dish.imageUrl}
                            alt={dish.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      )}

                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 inline-block mb-1">
                            {dish.category} ({dish.selectionRule})
                          </span>
                          <h4 className="text-sm font-bold text-neutral-900 leading-snug">
                            {dish.name}
                          </h4>
                        </div>

                        <span className="w-3.5 h-3.5 rounded-xs border border-emerald-600 flex items-center justify-center shrink-0 mt-1" title="100% Pure Vegetarian">
                          <span className="w-2 h-2 rounded-full bg-emerald-600" />
                        </span>
                      </div>

                      <p className="text-xs text-neutral-500 leading-relaxed line-clamp-3">
                        {dish.description}
                      </p>
                    </div>

                    <div className="pt-4 mt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleToggleCateringActive(dish)}
                          className={`text-[10px] font-bold px-2 py-1 rounded-md transition ${
                            dish.isActive !== false
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                          }`}
                        >
                          {dish.isActive !== false ? '● Active' : '○ Inactive'}
                        </button>

                        {dish.isPopular && (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                            Special
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={isGeneratingFoodImage}
                          onClick={() => handleGenerateFoodImage(dish.id)}
                          className="px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-300 transition flex items-center gap-1 disabled:opacity-50"
                          title="Generate Dish Photography with Gemini AI"
                        >
                          <Sparkles className="w-3 h-3 text-amber-600" />
                          <span>{isGeneratingFoodImage ? 'Generating...' : 'AI Photo'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenEditCateringModal(dish)}
                          className="p-1.5 rounded-lg text-neutral-600 hover:text-brand-purple hover:bg-neutral-100 transition"
                          title="Edit Dish"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCateringDish(dish.id)}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Delete Dish"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

          </div>
        )}

      </div>

      {/* CREATE / EDIT ITEM MODAL */}
      {isItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-neutral-200 flex flex-col max-h-[90vh]">
            
            <div className="royal-gradient p-5 text-white flex justify-between items-center">
              <h3 className="font-serif font-bold text-lg">
                {editingItem ? 'Edit Rental Item' : 'Add New Rental Equipment'}
              </h3>
              <button
                onClick={() => setIsItemModalOpen(false)}
                className="p-1 text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Item Name *</label>
                <input
                  type="text"
                  required
                  value={itemFormData.name}
                  onChange={(e) => setItemFormData({ ...itemFormData, name: e.target.value })}
                  placeholder="e.g. VIP Maharaja Dual Seater"
                  className="w-full p-2.5 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-brand-accent outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Category *</label>
                  <select
                    value={itemFormData.category}
                    onChange={(e) => setItemFormData({ ...itemFormData, category: e.target.value })}
                    className="w-full p-2.5 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-brand-accent outline-none bg-white"
                  >
                    {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Availability Status</label>
                  <select
                    value={itemFormData.availabilityStatus}
                    onChange={(e) => setItemFormData({ ...itemFormData, availabilityStatus: e.target.value })}
                    className="w-full p-2.5 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-brand-accent outline-none bg-white"
                  >
                    <option value="Available">Available</option>
                    <option value="Limited">Limited Stock</option>
                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Available Quantity (units)</label>
                <input
                  type="number"
                  min="0"
                  value={itemFormData.availableQuantity}
                  onChange={(e) => setItemFormData({ ...itemFormData, availableQuantity: parseInt(e.target.value, 10) || 0 })}
                  className="w-full p-2.5 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-brand-accent outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Description *</label>
                <textarea
                  rows={2}
                  required
                  value={itemFormData.description}
                  onChange={(e) => setItemFormData({ ...itemFormData, description: e.target.value })}
                  placeholder="Specs, dimensions, material details..."
                  className="w-full p-2.5 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-brand-accent outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Image URL / Local Media Path *</label>
                <input
                  type="text"
                  required
                  value={itemFormData.imageUrl}
                  onChange={(e) => setItemFormData({ ...itemFormData, imageUrl: e.target.value })}
                  placeholder="e.g. /media/rich-decor/decor-1.jpg"
                  className="w-full p-2.5 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-brand-accent outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Internal Notes (Optional)</label>
                <input
                  type="text"
                  value={itemFormData.internalNotes}
                  onChange={(e) => setItemFormData({ ...itemFormData, internalNotes: e.target.value })}
                  placeholder="Warehouse location, maintenance schedule..."
                  className="w-full p-2.5 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-brand-accent outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="featuredCheck"
                  checked={itemFormData.featured}
                  onChange={(e) => setItemFormData({ ...itemFormData, featured: e.target.checked })}
                  className="w-4 h-4 text-brand-purple rounded"
                />
                <label htmlFor="featuredCheck" className="text-xs font-semibold text-neutral-700">
                  Feature on Homepage ("Popular Choice")
                </label>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl royal-gradient text-white font-bold text-xs shadow-md hover:opacity-95 transition"
                >
                  {editingItem ? 'Save Changes' : 'Create Item'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsItemModalOpen(false)}
                  className="w-full py-3 rounded-xl border border-neutral-300 text-neutral-700 text-xs font-bold hover:bg-neutral-50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* EDIT GALLERY PHOTO MODAL */}
      {isGalleryEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-neutral-200 flex flex-col max-h-[90vh]">
            <div className="royal-gradient p-5 text-white flex justify-between items-center">
              <h3 className="font-serif font-bold text-lg">Edit Gallery Photograph</h3>
              <button
                onClick={() => setIsGalleryEditModalOpen(false)}
                className="p-1 text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGalleryEdit} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={galleryEditFormData.title}
                  onChange={(e) => setGalleryEditFormData({ ...galleryEditFormData, title: e.target.value })}
                  className="w-full p-2.5 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-brand-accent outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Gallery Section *</label>
                <select
                  value={galleryEditFormData.category}
                  onChange={(e) => setGalleryEditFormData({ ...galleryEditFormData, category: e.target.value })}
                  className="w-full p-2.5 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-brand-accent outline-none bg-white"
                >
                  <option value="Actual wedding and reception setups">1. Actual wedding and reception setups</option>
                  <option value="Dwarka Shri Lawn venue and grounds">2. Dwarka Shri Lawn venue and grounds</option>
                  <option value="Stage and mandap designs">3. Stage and mandap designs</option>
                  <option value="Tent structures and canopy layouts">4. Tent structures and canopy layouts</option>
                  <option value="Seating and furniture arrangements">5. Seating and furniture arrangements</option>
                  <option value="Floral and lighting decor">6. Floral and lighting decor</option>
                  <option value="Catering and food counters">7. Catering and food counters</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Event Type</label>
                  <input
                    type="text"
                    value={galleryEditFormData.eventType}
                    onChange={(e) => setGalleryEditFormData({ ...galleryEditFormData, eventType: e.target.value })}
                    className="w-full p-2.5 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-brand-accent outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Tags (Comma-separated)</label>
                  <input
                    type="text"
                    value={galleryEditFormData.tags}
                    onChange={(e) => setGalleryEditFormData({ ...galleryEditFormData, tags: e.target.value })}
                    className="w-full p-2.5 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-brand-accent outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Caption</label>
                <textarea
                  rows={2}
                  value={galleryEditFormData.caption}
                  onChange={(e) => setGalleryEditFormData({ ...galleryEditFormData, caption: e.target.value })}
                  className="w-full p-2.5 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-brand-accent outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="modalGalleryFeatured"
                  checked={galleryEditFormData.featured}
                  onChange={(e) => setGalleryEditFormData({ ...galleryEditFormData, featured: e.target.checked })}
                  className="w-4 h-4 text-brand-purple rounded"
                />
                <label htmlFor="modalGalleryFeatured" className="text-xs font-semibold text-neutral-700 cursor-pointer">
                  Featured in Highlights
                </label>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl royal-gradient text-white font-bold text-xs shadow-md hover:opacity-95 transition"
                >
                  Save Photo Details
                </button>
                <button
                  type="button"
                  onClick={() => setIsGalleryEditModalOpen(false)}
                  className="w-full py-3 rounded-xl border border-neutral-300 text-neutral-700 text-xs font-bold hover:bg-neutral-50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE / EDIT CATERING DISH MODAL */}
      {isCateringModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-neutral-200 flex flex-col max-h-[90vh]">
            <div className="royal-gradient p-5 text-white flex justify-between items-center">
              <h3 className="font-serif font-bold text-lg">
                {editingCateringDish ? 'Edit Catering Dish' : 'Add New Dish to Catering Menu'}
              </h3>
              <button
                onClick={() => setIsCateringModalOpen(false)}
                className="p-1 text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCateringDish} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Dish Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shahi Paneer Awadhi Khas"
                  value={cateringFormData.name}
                  onChange={(e) => setCateringFormData({ ...cateringFormData, name: e.target.value })}
                  className="w-full p-2.5 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-brand-accent outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Category *</label>
                  <select
                    value={cateringFormData.category}
                    onChange={(e) => {
                      const selectedCat = cateringCategories.find(c => c.name === e.target.value);
                      setCateringFormData({
                        ...cateringFormData,
                        category: e.target.value,
                        selectionRule: selectedCat?.selectionRule || cateringFormData.selectionRule,
                        maxSelect: selectedCat?.maxSelect || cateringFormData.maxSelect
                      });
                    }}
                    className="w-full p-2.5 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-brand-accent outline-none bg-white"
                  >
                    {cateringCategories.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Category Rule & Limit</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Any 2"
                      value={cateringFormData.selectionRule}
                      onChange={(e) => setCateringFormData({ ...cateringFormData, selectionRule: e.target.value })}
                      className="w-2/3 p-2.5 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-brand-accent outline-none"
                    />
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={cateringFormData.maxSelect}
                      onChange={(e) => setCateringFormData({ ...cateringFormData, maxSelect: Number(e.target.value) })}
                      className="w-1/3 p-2.5 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-brand-accent outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Dish Description & Ingredients</label>
                <textarea
                  rows={2}
                  placeholder="Authentic preparation style, spices, garnishing..."
                  value={cateringFormData.description}
                  onChange={(e) => setCateringFormData({ ...cateringFormData, description: e.target.value })}
                  className="w-full p-2.5 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-brand-accent outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3 pt-1">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="catDishPopular"
                    checked={cateringFormData.isPopular}
                    onChange={(e) => setCateringFormData({ ...cateringFormData, isPopular: e.target.checked })}
                    className="w-4 h-4 text-brand-purple rounded"
                  />
                  <label htmlFor="catDishPopular" className="font-semibold text-neutral-700 cursor-pointer">
                    Banquet Special
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="catDishActive"
                    checked={cateringFormData.isActive}
                    onChange={(e) => setCateringFormData({ ...cateringFormData, isActive: e.target.checked })}
                    className="w-4 h-4 text-brand-purple rounded"
                  />
                  <label htmlFor="catDishActive" className="font-semibold text-neutral-700 cursor-pointer">
                    Active on Menu
                  </label>
                </div>

                <div>
                  <input
                    type="number"
                    min="1"
                    placeholder="Order"
                    value={cateringFormData.order}
                    onChange={(e) => setCateringFormData({ ...cateringFormData, order: Number(e.target.value) })}
                    className="w-full p-2 border border-neutral-300 rounded-xl text-center"
                    title="Display Sort Order"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl royal-gradient text-white font-bold text-xs shadow-md hover:opacity-95 transition"
                >
                  {editingCateringDish ? 'Save Changes' : 'Add Dish to Menu'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsCateringModalOpen(false)}
                  className="w-full py-3 rounded-xl border border-neutral-300 text-neutral-700 text-xs font-bold hover:bg-neutral-50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: QUOTATION & ORDER BILLING EDITOR
         ======================================================== */}
      {isQuoteEditModalOpen && selectedOrderForQuote && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-5 sm:p-7 shadow-2xl border border-neutral-200 my-8 max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-neutral-100 pb-4 shrink-0">
              <div>
                <span className="text-[10px] font-bold text-brand-purple bg-purple-50 px-2.5 py-1 rounded-md uppercase tracking-wider">
                  Order & Quotation Engine
                </span>
                <h3 className="text-xl font-bold font-serif text-brand-primary mt-1">
                  Edit Quotation — {selectedOrderForQuote.customerName}
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Event Date: <strong>{selectedOrderForQuote.eventDate}</strong> • Duration: <strong>{selectedOrderForQuote.rentalDays || 1} Day(s)</strong> • Locality: <strong>{selectedOrderForQuote.locality || 'Kanpur Road'}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsQuoteEditModalOpen(false)}
                className="p-2 text-neutral-400 hover:text-neutral-700 rounded-full hover:bg-neutral-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <form onSubmit={handleSaveQuotation} className="flex-1 overflow-y-auto py-4 space-y-6 pr-1">
              
              {/* Line Items Table */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-brand-gold" />
                    <span>Rental & Catering Line Items ({quoteFormData.lineItems.length})</span>
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddCustomQuoteLine}
                    className="px-3 py-1 rounded-lg bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary text-xs font-bold transition flex items-center gap-1"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-brand-gold" />
                    <span>Add Custom Line Item</span>
                  </button>
                </div>

                <div className="border border-neutral-200 rounded-2xl overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-neutral-50 text-neutral-600 font-bold border-b border-neutral-200">
                        <tr>
                          <th className="py-2.5 px-3">Item / Service Name</th>
                          <th className="py-2.5 px-3">Specs / Dimensions</th>
                          <th className="py-2.5 px-3 w-20">Rate (₹)</th>
                          <th className="py-2.5 px-3 w-16">Qty</th>
                          <th className="py-2.5 px-3 w-24">Total (₹)</th>
                          <th className="py-2.5 px-2 text-center w-10"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {quoteFormData.lineItems.map((item, idx) => (
                          <tr key={idx} className="hover:bg-neutral-50/60 transition">
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                value={item.name}
                                onChange={(e) => handleUpdateQuoteLine(idx, 'name', e.target.value)}
                                className="w-full p-1.5 border border-neutral-200 rounded-lg text-xs font-semibold text-neutral-800 focus:bg-white focus:ring-1 focus:ring-brand-accent outline-none"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                placeholder="e.g. 20x30 ft, VIP setup"
                                value={item.dimensions || ''}
                                onChange={(e) => handleUpdateQuoteLine(idx, 'dimensions', e.target.value)}
                                className="w-full p-1.5 border border-neutral-200 rounded-lg text-xs text-neutral-600 focus:bg-white focus:ring-1 focus:ring-brand-accent outline-none"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="number"
                                min="0"
                                value={item.unitRate !== undefined ? item.unitRate : (item.ratePerSqFt || 0)}
                                onChange={(e) => handleUpdateQuoteLine(idx, 'unitRate', parseFloat(e.target.value) || 0)}
                                className="w-20 p-1.5 border border-neutral-200 rounded-lg text-xs font-bold text-neutral-800 text-right focus:bg-white focus:ring-1 focus:ring-brand-accent outline-none"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => handleUpdateQuoteLine(idx, 'quantity', parseInt(e.target.value, 10) || 1)}
                                className="w-16 p-1.5 border border-neutral-200 rounded-lg text-xs font-bold text-brand-purple text-center focus:bg-white focus:ring-1 focus:ring-brand-accent outline-none"
                              />
                            </td>
                            <td className="py-2 px-3 font-bold text-neutral-900 text-right">
                              ₹{(item.lineTotal || 0).toLocaleString('en-IN')}
                            </td>
                            <td className="py-2 px-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveQuoteLine(idx)}
                                className="p-1 rounded-md text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition"
                                title="Remove line item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Logistics, Adjustments & Payment Breakdown */}
              <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 space-y-4">
                <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Receipt className="w-4 h-4 text-brand-gold" />
                  <span>Logistics, Adjustments & Payment Status</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Cartage (Round Trip ₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={quoteFormData.cartage}
                      onChange={(e) => setQuoteFormData({ ...quoteFormData, cartage: parseFloat(e.target.value) || 0 })}
                      className="w-full p-2 border border-neutral-300 rounded-xl bg-white text-xs font-bold outline-none focus:ring-2 focus:ring-brand-accent"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Labour & Setup (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={quoteFormData.labour}
                      onChange={(e) => setQuoteFormData({ ...quoteFormData, labour: parseFloat(e.target.value) || 0 })}
                      className="w-full p-2 border border-neutral-300 rounded-xl bg-white text-xs font-bold outline-none focus:ring-2 focus:ring-brand-accent"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Discount Amount (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={quoteFormData.discount}
                      onChange={(e) => setQuoteFormData({ ...quoteFormData, discount: parseFloat(e.target.value) || 0 })}
                      className="w-full p-2 border border-neutral-300 rounded-xl bg-white text-xs font-bold text-emerald-600 outline-none focus:ring-2 focus:ring-brand-accent"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Advance Received (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={quoteFormData.advancePaid}
                      onChange={(e) => setQuoteFormData({ ...quoteFormData, advancePaid: parseFloat(e.target.value) || 0 })}
                      className="w-full p-2 border border-neutral-300 rounded-xl bg-white text-xs font-bold text-emerald-700 outline-none focus:ring-2 focus:ring-brand-accent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Discount Reason / Reference</label>
                    <input
                      type="text"
                      placeholder="e.g. Returning client, Dwarka lawn full combo package"
                      value={quoteFormData.discountReason}
                      onChange={(e) => setQuoteFormData({ ...quoteFormData, discountReason: e.target.value })}
                      className="w-full p-2 border border-neutral-300 rounded-xl bg-white text-xs outline-none focus:ring-2 focus:ring-brand-accent"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">Order Status</label>
                    <select
                      value={quoteFormData.status}
                      onChange={(e) => setQuoteFormData({ ...quoteFormData, status: e.target.value })}
                      className="w-full p-2 border border-neutral-300 rounded-xl bg-white text-xs font-bold outline-none focus:ring-2 focus:ring-brand-accent"
                    >
                      <option value="New">🔴 New</option>
                      <option value="Under Review">🟡 Under Review</option>
                      <option value="Quotation Prepared">🔵 Quotation Prepared</option>
                      <option value="Confirmed">🟢 Confirmed</option>
                      <option value="Advance Pending">🟠 Advance Pending</option>
                      <option value="Partially Paid">🟣 Partially Paid</option>
                      <option value="Fully Paid">✅ Fully Paid</option>
                      <option value="Completed">🎉 Completed</option>
                      <option value="Cancelled">❌ Cancelled</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Quotation Terms & Special Notes</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. All Snacks served for 2 to 2.5 hours. Generator diesel provided by client."
                    value={quoteFormData.quotationNotes}
                    onChange={(e) => setQuoteFormData({ ...quoteFormData, quotationNotes: e.target.value })}
                    className="w-full p-2 border border-neutral-300 rounded-xl bg-white text-xs outline-none focus:ring-2 focus:ring-brand-accent"
                  />
                </div>
              </div>

              {/* Realtime Financial Summary Footer Card */}
              {(() => {
                const sub = (quoteFormData.lineItems || []).reduce((acc, it) => acc + (parseFloat(it.lineTotal) || 0), 0);
                const gTotal = Math.max(0, sub + (parseFloat(quoteFormData.cartage) || 0) + (parseFloat(quoteFormData.labour) || 0) - (parseFloat(quoteFormData.discount) || 0) + (parseFloat(quoteFormData.manualAdjustment) || 0));
                const bal = Math.max(0, gTotal - (parseFloat(quoteFormData.advancePaid) || 0));
                return (
                  <div className="bg-brand-primary/5 p-4 rounded-2xl border border-brand-primary/20 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="text-neutral-500 font-semibold block">Inventory Subtotal:</span>
                      <span className="text-base font-bold text-neutral-900">₹{sub.toLocaleString('en-IN')}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 font-semibold block">Cartage + Labour:</span>
                      <span className="text-base font-bold text-neutral-900">₹{((parseFloat(quoteFormData.cartage) || 0) + (parseFloat(quoteFormData.labour) || 0)).toLocaleString('en-IN')}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 font-semibold block">Grand Total:</span>
                      <span className="text-lg font-black text-brand-primary font-serif">₹{gTotal.toLocaleString('en-IN')}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 font-semibold block">Balance Payable:</span>
                      <span className="text-lg font-black text-rose-700 font-serif">₹{bal.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                );
              })()}

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl royal-gradient text-white font-bold text-xs shadow-md hover:opacity-95 transition flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4 text-brand-gold" />
                  <span>Save Quotation (Internal)</span>
                </button>
                <button
                  type="button"
                  onClick={handleApproveWithQuotation}
                  className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Approve & Send to Customer</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsQuoteEditModalOpen(false)}
                  className="px-5 py-3 rounded-xl border border-neutral-300 text-neutral-700 text-xs font-bold hover:bg-neutral-50 transition"
                >
                  Cancel
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: OFFICIAL PRINTABLE LETTERHEAD BILL & TAX INVOICE
         ======================================================== */}
      {isBillPrintModalOpen && selectedOrderForQuote && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-neutral-100 rounded-3xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl my-6 max-h-[95vh] flex flex-col">
            
            {/* Top Toolbar (Hidden on Print) */}
            <div className="no-print flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-neutral-200 mb-4 shadow-xs shrink-0">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-brand-gold" />
                <span className="font-bold text-xs text-neutral-800">
                  Official Letterhead Invoice / Quotation Preview
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-brand-primary text-white font-bold text-xs shadow-sm hover:bg-brand-primary/90 transition flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5 text-brand-gold" />
                  <span>Print Letterhead / Save PDF</span>
                </button>

                <a
                  href={`https://wa.me/91${(selectedOrderForQuote.whatsappNumber || selectedOrderForQuote.phone || '').replace(/[^0-9]/g, '').slice(-10)}?text=${encodeURIComponent(
                    `*KANDHARI TENT & CATERERS / DWARKA SHRI LAWN*\n` +
                    `Kanpur Road, Opp. Pillar No. 37, Lucknow\n\n` +
                    `*Official Quotation / Invoice #${selectedOrderForQuote.quotationNumber || ('KTC-' + selectedOrderForQuote.id.slice(-6).toUpperCase())}*\n` +
                    `Customer: ${selectedOrderForQuote.customerName}\n` +
                    `Event Date: ${selectedOrderForQuote.eventDate}\n` +
                    `Rental Duration: ${selectedOrderForQuote.rentalDays || 1} day(s)\n\n` +
                    `*Total Amount:* ₹${(selectedOrderForQuote.grandTotal || 0).toLocaleString('en-IN')}\n` +
                    `*Advance Paid:* ₹${(selectedOrderForQuote.advancePaid || 0).toLocaleString('en-IN')}\n` +
                    `*Balance Due:* ₹${((selectedOrderForQuote.grandTotal || 0) - (selectedOrderForQuote.advancePaid || 0)).toLocaleString('en-IN')}\n\n` +
                    `UPI ID: 9305465848@upi (Varun Kandhari)\n` +
                    `Phone: +91 9305465848\n\n` +
                    `_Terms: All Snacks & Starters served for 2 to 2.5 hours only. Generator diesel provided by client._`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-sm hover:bg-emerald-700 transition flex items-center gap-1.5"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Share on WhatsApp</span>
                </a>

                <button
                  type="button"
                  onClick={() => setIsBillPrintModalOpen(false)}
                  className="p-2 text-neutral-400 hover:text-neutral-700 rounded-full hover:bg-neutral-100 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Print Stylesheet */}
            <style>{`
              @media print {
                body * {
                  visibility: hidden !important;
                }
                #kandhari-letterhead-document, #kandhari-letterhead-document * {
                  visibility: visible !important;
                }
                #kandhari-letterhead-document {
                  position: absolute !important;
                  left: 0 !important;
                  top: 0 !important;
                  width: 100% !important;
                  margin: 0 !important;
                  padding: 24px !important;
                  box-shadow: none !important;
                  border: none !important;
                  background: white !important;
                  color: black !important;
                }
                .no-print {
                  display: none !important;
                }
              }
            `}</style>

            {/* The Actual Printable Letterhead Document */}
            <div className="flex-1 overflow-y-auto bg-neutral-200/50 p-2 sm:p-4 rounded-2xl flex justify-center">
              <div
                id="kandhari-letterhead-document"
                className="bg-white max-w-3xl w-full p-8 sm:p-10 shadow-lg rounded-2xl border border-neutral-300 text-neutral-900 font-sans space-y-6"
              >
                
                {/* Official Letterhead Header */}
                <div className="border-b-2 border-brand-primary pb-5 text-center relative">
                  <div className="flex justify-center mb-1.5">
                    <span className="w-10 h-10 rounded-full bg-brand-primary text-brand-gold flex items-center justify-center font-serif font-black text-xl border-2 border-brand-gold shadow-xs">
                      K
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-serif font-black tracking-tight text-brand-primary uppercase">
                    Kandhari Tent & Caterers
                  </h1>
                  <p className="text-xs font-serif italic text-brand-gold font-bold tracking-wide">
                    Dwarka Shri Lawn & Complete Wedding Infrastructure
                  </p>
                  <p className="text-[11px] text-neutral-600 mt-1.5 max-w-xl mx-auto leading-relaxed">
                    Kanpur Road, Opp. Pillar No. 37, Daroga Kheda, Lucknow, Uttar Pradesh - 226008<br />
                    Phone / WhatsApp: <strong>+91 9305465848</strong> | <strong>+91 9839012345</strong> • Email: <strong>kandharitenthouse@gmail.com</strong>
                  </p>
                  <div className="flex justify-center gap-4 text-[10px] text-neutral-500 font-semibold mt-1">
                    <span>GSTIN: <strong>09AABCK1234F1Z5</strong></span>
                    <span>•</span>
                    <span>State: <strong>Uttar Pradesh (09)</strong></span>
                  </div>
                </div>

                {/* Document Type & Metadata Banner */}
                <div className="flex flex-wrap justify-between items-center bg-brand-cream/60 px-4 py-2.5 rounded-xl border border-brand-gold/40 text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">Document Type</span>
                    <strong className="text-brand-primary text-sm font-serif">
                      OFFICIAL ESTIMATE & TAX INVOICE
                    </strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">Quotation / Invoice Ref</span>
                    <strong className="font-mono text-xs text-neutral-900">
                      {selectedOrderForQuote.quotationNumber || ('KTC-' + selectedOrderForQuote.id.slice(-6).toUpperCase())}
                    </strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">Date of Issue</span>
                    <strong className="text-xs text-neutral-900">
                      {selectedOrderForQuote.quotationDate ? new Date(selectedOrderForQuote.quotationDate).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN')}
                    </strong>
                  </div>
                </div>

                {/* Client & Event Particulars */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs border border-neutral-200 rounded-xl p-4 bg-neutral-50/50">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">Billed To / Client</span>
                    <p className="text-sm font-bold text-neutral-900">{selectedOrderForQuote.customerName}</p>
                    <p className="text-neutral-700">Phone: <strong>{selectedOrderForQuote.phone}</strong></p>
                    {selectedOrderForQuote.email && <p className="text-neutral-500">{selectedOrderForQuote.email}</p>}
                  </div>

                  <div className="space-y-1 sm:text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">Function & Rental Particulars</span>
                    <p className="text-neutral-900">Event Date: <strong>{selectedOrderForQuote.eventDate}</strong></p>
                    <p className="text-neutral-700">Duration: <strong>{selectedOrderForQuote.rentalDays || 1} Day(s)</strong></p>
                    <p className="text-neutral-700">Venue: <strong>{selectedOrderForQuote.eventVenueAddress || selectedOrderForQuote.locality || 'Dwarka Shri Lawn, Kanpur Road'}</strong></p>
                  </div>
                </div>

                {/* Line Items Table */}
                <div className="border border-neutral-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-brand-primary text-white font-bold text-[11px]">
                      <tr>
                        <th className="py-2 px-3 w-8 text-center">#</th>
                        <th className="py-2 px-3">Item / Service Description</th>
                        <th className="py-2 px-3">Specifications</th>
                        <th className="py-2 px-3 text-right">Rate (₹)</th>
                        <th className="py-2 px-3 text-center">Qty</th>
                        <th className="py-2 px-3 text-right">Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                      {((selectedOrderForQuote.lineItems && selectedOrderForQuote.lineItems.length > 0) ? selectedOrderForQuote.lineItems : (selectedOrderForQuote.items || [])).map((it, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-neutral-50/50'}>
                          <td className="py-2 px-3 text-center font-semibold text-neutral-500">{idx + 1}</td>
                          <td className="py-2 px-3 font-bold text-neutral-900">{it.name}</td>
                          <td className="py-2 px-3 text-neutral-600">{it.dimensions || it.billingUnit || 'Standard'}</td>
                          <td className="py-2 px-3 text-right font-medium">₹{it.unitRate || it.ratePerSqFt || '—'}</td>
                          <td className="py-2 px-3 text-center font-bold text-brand-purple">{it.quantity}</td>
                          <td className="py-2 px-3 text-right font-bold text-neutral-900">
                            ₹{(it.lineTotal ? it.lineTotal : (it.unitRate ? it.unitRate * it.quantity : 0)).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Catering Menu Summary if present */}
                {selectedOrderForQuote.customMenu && selectedOrderForQuote.customMenu.length > 0 && (
                  <div className="border border-amber-200 bg-amber-50/50 p-3 rounded-xl text-xs">
                    <span className="font-bold text-brand-primary block mb-1">
                      Catering Menu Inclusion ({selectedOrderForQuote.customMenu.length} dishes):
                    </span>
                    <p className="text-neutral-700 text-[11px] leading-relaxed">
                      {selectedOrderForQuote.customMenu.map(d => d.name).join(' • ')}
                    </p>
                  </div>
                )}

                {/* Financial Summary & Breakdown Table */}
                <div className="flex justify-end">
                  <div className="w-full sm:w-80 space-y-1.5 text-xs">
                    <div className="flex justify-between py-1 border-b border-neutral-100">
                      <span className="text-neutral-600">Subtotal:</span>
                      <span className="font-bold">₹{(selectedOrderForQuote.subtotal || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-neutral-100">
                      <span className="text-neutral-600">Cartage / Transport (Round Trip):</span>
                      <span className="font-bold">₹{(selectedOrderForQuote.cartage !== undefined ? selectedOrderForQuote.cartage : 500).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-neutral-100">
                      <span className="text-neutral-600">Labour, Setup & Loading:</span>
                      <span className="font-bold">₹{(selectedOrderForQuote.labour !== undefined ? selectedOrderForQuote.labour : 500).toLocaleString('en-IN')}</span>
                    </div>
                    {selectedOrderForQuote.discount > 0 && (
                      <div className="flex justify-between py-1 border-b border-neutral-100 text-emerald-700">
                        <span>Special Discount:</span>
                        <span className="font-bold">-₹{selectedOrderForQuote.discount.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-1.5 border-t-2 border-brand-primary text-sm font-bold text-brand-primary">
                      <span>Total Invoice Amount:</span>
                      <span className="text-base font-serif">₹{(selectedOrderForQuote.grandTotal || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between py-1 text-emerald-700 font-semibold">
                      <span>Advance Received:</span>
                      <span>₹{(selectedOrderForQuote.advancePaid || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between py-1.5 bg-rose-50 px-2 rounded-lg text-rose-800 font-bold border border-rose-200">
                      <span>Balance Due:</span>
                      <span className="text-sm">₹{((selectedOrderForQuote.grandTotal || 0) - (selectedOrderForQuote.advancePaid || 0)).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {/* Bank / UPI Payment Info & Official Terms */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
                  <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200 space-y-1">
                    <strong className="text-brand-primary block text-[11px] uppercase tracking-wider">
                      Bank & UPI Payment Details
                    </strong>
                    <p className="text-neutral-700">UPI ID: <strong className="font-mono text-brand-purple">9305465848@upi</strong></p>
                    <p className="text-neutral-700">Google Pay / PhonePe: <strong>+91 9305465848</strong></p>
                    <p className="text-[10px] text-neutral-500">Payee: Kandhari Tent & Caterers / Varun Kandhari</p>
                  </div>

                  <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200 space-y-1 text-[10px] text-neutral-600">
                    <strong className="text-brand-primary block text-[11px] uppercase tracking-wider">
                      Standard Terms & Conditions
                    </strong>
                    <ol className="list-decimal pl-3 space-y-0.5">
                      <li><strong>All Snacks & Starters served for 2 to 2.5 hours only.</strong></li>
                      <li>Generator diesel to be provided or borne by client.</li>
                      <li>50% advance payable on confirmation; balance on event day.</li>
                      <li>Breakage or loss of equipment charged at replacement value.</li>
                      <li>Subject to Lucknow jurisdiction.</li>
                    </ol>
                  </div>
                </div>

                {/* Official Signatures */}
                <div className="pt-8 grid grid-cols-2 text-center text-xs text-neutral-600">
                  <div>
                    <div className="border-t border-neutral-400 w-40 mx-auto mb-1"></div>
                    <span>Customer Acceptance</span>
                  </div>
                  <div>
                    <div className="border-t border-neutral-400 w-44 mx-auto mb-1"></div>
                    <span className="font-bold text-neutral-900">For Kandhari Tent & Caterers</span>
                    <span className="block text-[10px] text-neutral-500">(Authorized Signatory)</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: RECORD OFFLINE PAYMENT
         ======================================================== */}
      {offlinePayModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-neutral-200 animate-scaleUp">
            <div className="flex justify-between items-center pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-neutral-900">Record Offline Payment</h3>
              </div>
              <button
                onClick={() => setOfflinePayModalOrder(null)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordOfflinePayment} className="space-y-4 pt-4 text-xs">
              <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200">
                <span className="text-neutral-500 block">Enquiry / Client:</span>
                <strong className="text-neutral-900 block font-serif text-sm">
                  {offlinePayModalOrder.id} — {offlinePayModalOrder.customerName}
                </strong>
                <span className="text-neutral-500 block mt-1">
                  Grand Total: <strong>₹{(offlinePayModalOrder.grandTotal || offlinePayModalOrder.estimatedCost || 0).toLocaleString('en-IN')}</strong> &bull; Already Paid: <strong>₹{(offlinePayModalOrder.advancePaid || 0).toLocaleString('en-IN')}</strong>
                </span>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Amount Received (₹) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={offlinePayForm.amount}
                  onChange={(e) => setOfflinePayForm({ ...offlinePayForm, amount: e.target.value })}
                  className="w-full p-2.5 border border-neutral-300 rounded-xl bg-white text-sm font-bold text-brand-primary outline-none focus:ring-2 focus:ring-brand-accent"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Payment Method *</label>
                <select
                  value={offlinePayForm.paymentMethod}
                  onChange={(e) => setOfflinePayForm({ ...offlinePayForm, paymentMethod: e.target.value })}
                  className="w-full p-2.5 border border-neutral-300 rounded-xl bg-white font-semibold outline-none focus:ring-2 focus:ring-brand-accent"
                >
                  <option value="Cash">Cash (Received in Person)</option>
                  <option value="Cheque">Bank Cheque</option>
                  <option value="RTGS / NEFT">RTGS / NEFT Bank Transfer</option>
                  <option value="Direct UPI">Direct UPI / QR Code Transfer</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Receipt / Transaction Ref *</label>
                <input
                  type="text"
                  required
                  value={offlinePayForm.referenceNumber}
                  onChange={(e) => setOfflinePayForm({ ...offlinePayForm, referenceNumber: e.target.value })}
                  placeholder="e.g. CASH-78192 or UTR/Cheque No"
                  className="w-full p-2.5 border border-neutral-300 rounded-xl bg-white outline-none focus:ring-2 focus:ring-brand-accent font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Audit Notes / Comments</label>
                <textarea
                  rows={2}
                  value={offlinePayForm.notes}
                  onChange={(e) => setOfflinePayForm({ ...offlinePayForm, notes: e.target.value })}
                  placeholder="e.g. Received 50% booking deposit at lawn office"
                  className="w-full p-2.5 border border-neutral-300 rounded-xl bg-white outline-none focus:ring-2 focus:ring-brand-accent"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Log Payment & Confirm</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOfflinePayModalOrder(null)}
                  className="px-4 py-3 rounded-xl border border-neutral-300 text-neutral-600 font-bold hover:bg-neutral-50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: REJECT ORDER WITH REASON
         ======================================================== */}
      {rejectionModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-neutral-200 animate-scaleUp">
            <div className="flex justify-between items-center pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-600" />
                <h3 className="text-base font-bold text-neutral-900">Decline Event Booking</h3>
              </div>
              <button
                onClick={() => setRejectionModalOrder(null)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 pt-4 text-xs">
              <p className="text-neutral-600">
                You are declining booking request <strong>{rejectionModalOrder.id}</strong> for <strong>{rejectionModalOrder.customerName}</strong> ({rejectionModalOrder.eventDate}).
              </p>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Reason for Decline *</label>
                <textarea
                  rows={3}
                  required
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain why this booking cannot be accepted (e.g. Lawn fully booked, inventory reserved, out of radius)..."
                  className="w-full p-2.5 border border-neutral-300 rounded-xl bg-white outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={handleConfirmReject}
                  className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition"
                >
                  Confirm Decline & Notify Client
                </button>
                <button
                  type="button"
                  onClick={() => setRejectionModalOrder(null)}
                  className="px-4 py-3 rounded-xl border border-neutral-300 text-neutral-600 font-bold hover:bg-neutral-50 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboardPage;
