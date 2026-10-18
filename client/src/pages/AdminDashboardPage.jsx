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
  Clock
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES, LUCKNOW_LOCALITIES, SERVICES_LIST } from '../data/seedItems';

const AdminDashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('enquiries'); // enquiries, inventory, venue, gallery
  
  // Enquiries state
  const [enquiries, setEnquiries] = useState([]);
  const [enquiryStatusFilter, setEnquiryStatusFilter] = useState('all');
  const [enquiryServiceFilter, setEnquiryServiceFilter] = useState('all');
  const [enquiryLocalityFilter, setEnquiryLocalityFilter] = useState('all');
  const [enquirySearchQuery, setEnquirySearchQuery] = useState('');

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

  // Gallery state
  const [galleryItems, setGalleryItems] = useState([]);
  const [newGalleryPhoto, setNewGalleryPhoto] = useState({
    title: '',
    category: 'Weddings',
    imageUrl: '/media/stage/stage-1.jpg',
    caption: ''
  });

  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
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
      if (galRes.success) setGalleryItems(galRes.data);
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

  // --- GALLERY ACTIONS ---
  const handleAddGalleryPhoto = async (e) => {
    e.preventDefault();
    if (!newGalleryPhoto.title || !newGalleryPhoto.imageUrl) return;
    try {
      const res = await api.addGalleryItem(newGalleryPhoto);
      if (res.success) {
        setGalleryItems(prev => [res.data, ...prev]);
        setNewGalleryPhoto({
          title: '',
          category: 'Weddings',
          imageUrl: '/media/stage/stage-1.jpg',
          caption: ''
        });
        showNotification('Photo added to gallery');
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
        showNotification('Photo removed');
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
            onClick={() => setActiveTab('enquiries')}
            className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'enquiries'
                ? 'bg-brand-cream/90 text-brand-primary border-t-2 border-brand-gold shadow-xs'
                : 'text-neutral-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-brand-gold" />
            <span>Customer Enquiries ({enquiries.length})</span>
            {enquiries.filter(e => e.status === 'New').length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-rose-500 text-white font-extrabold animate-pulse">
                {enquiries.filter(e => e.status === 'New').length} New
              </span>
            )}
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
                {['all', 'New', 'Contacted', 'In Discussion', 'Quoted', 'Converted', 'Confirmed', 'Closed'].map((st) => (
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
                            enq.status === 'Contacted' ? 'bg-amber-50 text-amber-700 border-amber-300' :
                            enq.status === 'In Discussion' ? 'bg-purple-50 text-purple-700 border-purple-300' :
                            enq.status === 'Quoted' ? 'bg-indigo-50 text-indigo-700 border-indigo-300' :
                            enq.status === 'Converted' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' :
                            enq.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' :
                            'bg-neutral-100 text-neutral-600 border-neutral-300'
                          }`}
                        >
                          <option value="New">🔴 New</option>
                          <option value="Contacted">🟡 Contacted</option>
                          <option value="In Discussion">🟣 In Discussion</option>
                          <option value="Quoted">🔵 Quoted</option>
                          <option value="Converted">🟢 Converted</option>
                          <option value="Confirmed">🟢 Confirmed</option>
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
                    {enq.items && enq.items.length > 0 && (
                      <div className="bg-purple-50/60 p-3.5 rounded-2xl border border-purple-100 text-xs">
                        <strong className="text-brand-primary block mb-2 font-bold">
                          Requested Rental Inventory ({enq.items.length} items):
                        </strong>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                          {enq.items.map((it, idx) => (
                            <div key={idx} className="bg-white px-3 py-1.5 rounded-xl border border-neutral-200 flex justify-between items-center shadow-xs">
                              <span className="font-semibold text-neutral-800 truncate pr-2">{it.name}</span>
                              <span className="font-bold text-brand-purple shrink-0">Qty: {it.quantity}</span>
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
            
            <form onSubmit={handleAddGalleryPhoto} className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-sm space-y-4">
              <h3 className="text-base font-serif font-bold text-brand-primary flex items-center gap-2">
                <Plus className="w-5 h-5 text-brand-gold" />
                <span>Add Real Event Photo to Gallery</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Photo Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Evening Mandap Setup"
                    value={newGalleryPhoto.title}
                    onChange={(e) => setNewGalleryPhoto({ ...newGalleryPhoto, title: e.target.value })}
                    className="w-full p-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-brand-accent outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Category</label>
                  <select
                    value={newGalleryPhoto.category}
                    onChange={(e) => setNewGalleryPhoto({ ...newGalleryPhoto, category: e.target.value })}
                    className="w-full p-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-brand-accent outline-none bg-white"
                  >
                    <option value="Weddings">Weddings</option>
                    <option value="Lawn Setups">Lawn Setups</option>
                    <option value="Stage Decor">Stage Decor</option>
                    <option value="Lighting">Lighting</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 mb-1">Image URL / Path *</label>
                  <input
                    type="text"
                    required
                    placeholder="/media/..."
                    value={newGalleryPhoto.imageUrl}
                    onChange={(e) => setNewGalleryPhoto({ ...newGalleryPhoto, imageUrl: e.target.value })}
                    className="w-full p-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-brand-accent outline-none"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block font-semibold text-neutral-700 mb-1">Caption (Optional)</label>
                  <input
                    type="text"
                    placeholder="Brief description of the setup..."
                    value={newGalleryPhoto.caption}
                    onChange={(e) => setNewGalleryPhoto({ ...newGalleryPhoto, caption: e.target.value })}
                    className="w-full p-2 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-brand-accent outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="py-2.5 px-6 rounded-xl royal-gradient text-white text-xs font-bold shadow-md hover:opacity-95 transition flex items-center gap-2"
              >
                <Plus className="w-4 h-4 text-brand-gold" />
                <span>Upload to Gallery</span>
              </button>
            </form>

            {/* Gallery Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {galleryItems.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl overflow-hidden border border-neutral-200 shadow-xs relative group">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full aspect-4/3 object-cover"
                  />
                  <div className="p-3">
                    <span className="text-[10px] font-bold text-brand-purple bg-purple-50 px-2 py-0.5 rounded">
                      {item.category}
                    </span>
                    <h4 className="font-bold text-xs text-neutral-900 mt-1 truncate">{item.title}</h4>
                  </div>
                  <button
                    onClick={() => handleDeleteGalleryPhoto(item.id)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white hover:bg-rose-600 transition"
                    title="Remove Photo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
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
                  placeholder="/media/..."
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

    </div>
  );
};

export default AdminDashboardPage;
