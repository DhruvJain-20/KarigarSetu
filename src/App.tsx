/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Hammer,
  Zap,
  Wrench,
  Layers,
  Paintbrush,
  Sparkles,
  Coffee,
  Shield,
  Scissors,
  Compass,
  Search,
  MapPin,
  Filter,
  CheckCircle2,
  Star,
  Users,
  Briefcase,
  Calculator,
  CalendarCheck,
  UserPlus,
  Plus,
  Globe,
  SlidersHorizontal,
  X,
  Phone,
  MessageSquare,
  Award,
  ShieldCheck,
  Clock,
  ArrowRight,
  TrendingUp,
  Home,
  Package,
  ShoppingBag,
  User,
  Mic,
  Store,
  ArrowLeft
} from 'lucide-react';

import {
  Karigar,
  JobPost,
  BookingRequest,
  Language,
  TradeCategory,
  ReadyProduct,
  ProductOrder,
  ArtisanUserProfile
} from './types';
import { INITIAL_KARIGARS, INITIAL_JOB_POSTS } from './data/mockKarigars';
import {
  INITIAL_READY_PRODUCTS,
  INITIAL_PRODUCT_ORDERS,
  DEFAULT_ARTISAN_PROFILE
} from './data/mockProducts';
import { TRADE_META, TRANSLATIONS } from './data/translations';
import { KarigarCard } from './components/KarigarCard';
import { KarigarProfileModal } from './components/KarigarProfileModal';
import { PostJobModal } from './components/PostJobModal';
import { RegisterKarigarModal } from './components/RegisterKarigarModal';
import { WageCalculator } from './components/WageCalculator';
import { BookingsView } from './components/BookingsView';
import { AddProductWizard } from './components/AddProductWizard';
import { ArtisanHomeHub } from './components/ArtisanHomeHub';
import { ProductsCatalogView } from './components/ProductsCatalogView';
import { OrdersManagementView } from './components/OrdersManagementView';
import { UserProfileView } from './components/UserProfileView';
import { MarketplaceStorefront } from './components/MarketplaceStorefront';
import { VoiceAssistantModal } from './components/VoiceAssistantModal';

const INITIAL_BOOKINGS: BookingRequest[] = [
  {
    id: 'bk-1',
    karigarId: 'k-1',
    karigarName: 'Rameshwar Sharma',
    karigarTrade: 'carpentry',
    clientName: 'Sanjay Chawla',
    clientPhone: '+91 98290 11223',
    clientAddress: 'C-44, Vaishali Nagar, Jaipur',
    serviceDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    jobDescription: 'Modular wardrobe installation and hydraulic kitchen fitting checkup.',
    estimatedBudget: 4500,
    status: 'accepted',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'bk-2',
    karigarId: 'k-4',
    karigarName: 'Balwinder Singh',
    karigarTrade: 'electrical',
    clientName: 'Rajeev Singhal',
    clientPhone: '+91 98100 44556',
    clientAddress: 'Tower B, Sector 62, Noida',
    serviceDate: new Date(Date.now() + 172800000).toISOString().split('T')[0],
    jobDescription: '3-phase distribution panel rewire and inverter connection.',
    estimatedBudget: 2500,
    status: 'pending',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  }
];

export default function App() {
  const [language, setLanguage] = useState<Language>('en');

  // Modes: 'artisan_hub' (Screenshots 1-7), 'marketplace' (Buy Ready Products), 'hire_services' (Find trade karigars)
  const [appMode, setAppMode] = useState<'artisan_hub' | 'marketplace' | 'hire_services'>('artisan_hub');
  const [artisanTab, setArtisanTab] = useState<'home' | 'products' | 'orders' | 'profile'>('home');
  const [hireServicesTab, setHireServicesTab] = useState<'explore' | 'jobs' | 'calculator' | 'bookings'>('explore');

  // Persistence for products, orders, profile
  const [products, setProducts] = useState<ReadyProduct[]>(() => {
    const saved = localStorage.getItem('ks_ready_products');
    return saved ? JSON.parse(saved) : INITIAL_READY_PRODUCTS;
  });

  const [orders, setOrders] = useState<ProductOrder[]>(() => {
    const saved = localStorage.getItem('ks_product_orders');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCT_ORDERS;
  });

  const [artisanProfile, setArtisanProfile] = useState<ArtisanUserProfile>(() => {
    const saved = localStorage.getItem('ks_artisan_profile');
    return saved ? JSON.parse(saved) : DEFAULT_ARTISAN_PROFILE;
  });

  // Persistence for karigars, jobs, bookings
  const [karigars, setKarigars] = useState<Karigar[]>(() => {
    const saved = localStorage.getItem('ks_karigars');
    return saved ? JSON.parse(saved) : INITIAL_KARIGARS;
  });

  const [jobs, setJobs] = useState<JobPost[]>(() => {
    const saved = localStorage.getItem('ks_jobs');
    return saved ? JSON.parse(saved) : INITIAL_JOB_POSTS;
  });

  const [bookings, setBookings] = useState<BookingRequest[]>(() => {
    const saved = localStorage.getItem('ks_bookings');
    return saved ? JSON.parse(saved) : INITIAL_BOOKINGS;
  });

  useEffect(() => {
    localStorage.setItem('ks_ready_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('ks_product_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('ks_artisan_profile', JSON.stringify(artisanProfile));
  }, [artisanProfile]);

  useEffect(() => {
    localStorage.setItem('ks_karigars', JSON.stringify(karigars));
  }, [karigars]);

  useEffect(() => {
    localStorage.setItem('ks_jobs', JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    localStorage.setItem('ks_bookings', JSON.stringify(bookings));
  }, [bookings]);

  // Modal states
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isVoiceAssistantOpen, setIsVoiceAssistantOpen] = useState(false);
  const [selectedKarigarForProfile, setSelectedKarigarForProfile] = useState<Karigar | null>(null);
  const [isPostJobOpen, setIsPostJobOpen] = useState(false);
  const [isRegisterKarigarOpen, setIsRegisterKarigarOpen] = useState(false);

  // Filters for Hire Services tab
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrade, setSelectedTrade] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [availableTodayOnly, setAvailableTodayOnly] = useState(false);
  const [minRating, setMinRating] = useState(0);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const t = TRANSLATIONS[language];
  const allCities = Array.from(new Set(karigars.map((k) => k.city)));

  // Filtered Karigars
  const filteredKarigars = karigars.filter((k) => {
    const matchesSearch =
      k.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      k.hindiName.includes(searchQuery) ||
      k.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      k.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      k.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTrade = selectedTrade === 'all' ? true : k.trade === selectedTrade;
    const matchesCity = selectedCity === 'all' ? true : k.city === selectedCity;
    const matchesVerified = verifiedOnly ? k.isAadhaarVerified || k.isSkillCertified : true;
    const matchesAvailable = availableTodayOnly ? k.isAvailableToday : true;
    const matchesRating = k.rating >= minRating;

    return (
      matchesSearch &&
      matchesTrade &&
      matchesCity &&
      matchesVerified &&
      matchesAvailable &&
      matchesRating
    );
  });

  // Handlers for Products & Orders
  const handleProductCreated = (newProduct: ReadyProduct) => {
    setProducts([newProduct, ...products]);
    setArtisanProfile((prev) => ({
      ...prev,
      productsListedCount: prev.productsListedCount + 1,
    }));
    showToast(
      language === 'hi'
        ? `बधाई! '${newProduct.name}' सफलता से प्रकाशित हुआ!`
        : `Congratulations! '${newProduct.name}' is now live in the catalog!`
    );
    setAppMode('artisan_hub');
    setArtisanTab('products');
  };

  const handleProductOrdered = (newOrder: ProductOrder) => {
    setOrders([newOrder, ...orders]);
    setArtisanProfile((prev) => ({
      ...prev,
      salesTotal: prev.salesTotal + newOrder.totalAmount,
      activeOrdersCount: prev.activeOrdersCount + 1,
    }));
    showToast(
      language === 'hi'
        ? `ऑर्डर सफलतापूर्वक दर्ज हुआ! कारीगर को सूचना भेज दी गई है।`
        : `Order placed successfully! Artisan notified for packaging.`
    );
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: ProductOrder['status']) => {
    setOrders(
      orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    showToast(`Order status updated to ${newStatus.toUpperCase()}`);
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts(products.filter((p) => p.id !== productId));
    showToast('Product removed from catalog');
  };

  const handleCancelOrder = (orderId: string) => {
    setOrders(
      orders.map((o) => (o.id === orderId ? { ...o, status: 'cancelled' } : o))
    );
    showToast('Order has been cancelled');
  };

  // Handlers for Hire & Jobs
  const handleJobPosted = (newJob: JobPost) => {
    setJobs([newJob, ...jobs]);
    showToast(language === 'hi' ? 'काम की आवश्यकता सफलतापूर्वक पोस्ट हुई!' : 'Work requirement posted successfully!');
    setAppMode('hire_services');
    setHireServicesTab('jobs');
  };

  const handleKarigarRegistered = (newKarigar: Karigar) => {
    setKarigars([newKarigar, ...karigars]);
    showToast(
      language === 'hi'
        ? `बधाई! ${newKarigar.name} की कारीगर प्रोफाइल लाइव हो गई है!`
        : `Congratulations! ${newKarigar.name}'s profile is now live!`
    );
    setAppMode('hire_services');
    setHireServicesTab('explore');
  };

  const handleBookingCreated = (bookingData: {
    karigarId: string;
    karigarName: string;
    karigarTrade: Karigar['trade'];
    clientName: string;
    clientPhone: string;
    clientAddress: string;
    serviceDate: string;
    jobDescription: string;
    estimatedBudget: number;
  }) => {
    const newBooking: BookingRequest = {
      id: `bk-${Date.now()}`,
      ...bookingData,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    setBookings([newBooking, ...bookings]);
    showToast(language === 'hi' ? 'बुकिंग अनुरोध कारीगर को भेजा गया!' : 'Booking request sent to artisan!');
  };

  const handleUpdateBookingStatus = (id: string, status: BookingRequest['status']) => {
    setBookings(bookings.map((b) => (b.id === id ? { ...b, status } : b)));
    showToast(`Booking status updated to ${status}`);
  };

  const handleApplyToJob = (job: JobPost) => {
    setJobs(
      jobs.map((j) => (j.id === job.id ? { ...j, applicantsCount: j.applicantsCount + 1 } : j))
    );
    showToast(language === 'hi' ? 'आवेदन भेजा गया! नियोक्ता आपसे संपर्क करेंगे।' : 'Proposal submitted! Client has been notified.');
  };

  return (
    <div id="karigarsetu-root" className="min-h-screen bg-[#FAF7F2] text-slate-900 flex flex-col font-sans selection:bg-amber-200 selection:text-amber-950">
      
      {/* Toast alert */}
      {toastMessage && (
        <div id="app-toast" className="fixed top-5 right-5 z-50 bg-[#963E20] text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/20 text-sm font-medium animate-in fade-in">
          <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Bar matching Screenshots */}
      <header id="main-header" className="bg-white/95 backdrop-blur-md border-b border-amber-900/10 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 gap-3">
            
            {/* Logo */}
            <div
              onClick={() => {
                setAppMode('artisan_hub');
                setArtisanTab('home');
              }}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-[#963E20] flex items-center justify-center text-white shadow-xs">
                <Hammer className="w-5 h-5 text-amber-200" />
              </div>
              <div>
                <span className="font-serif font-extrabold text-xl sm:text-2xl text-[#963E20] tracking-tight">
                  KarigarSetu
                </span>
                <span className="text-[10px] font-bold text-amber-900 ml-1.5 hidden md:inline">
                  कारीगर सेतु
                </span>
              </div>
            </div>

            {/* Platform Mode Tabs */}
            <div className="flex items-center bg-stone-100/90 p-1 rounded-2xl border border-stone-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setAppMode('artisan_hub');
                  setArtisanTab('home');
                }}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  appMode === 'artisan_hub'
                    ? 'bg-[#963E20] text-white shadow-xs'
                    : 'text-stone-700 hover:text-stone-900'
                }`}
              >
                Artisan Hub
              </button>

              <button
                type="button"
                onClick={() => setAppMode('marketplace')}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  appMode === 'marketplace'
                    ? 'bg-[#963E20] text-white shadow-xs'
                    : 'text-stone-700 hover:text-stone-900'
                }`}
              >
                <span>Shop Crafts</span>
                {orders.filter(o => o.status === 'shipped' || o.status === 'processing' || o.status === 'new').length > 0 && (
                  <span className={`w-2 h-2 rounded-full ${appMode === 'marketplace' ? 'bg-amber-300' : 'bg-[#1D5C4A]'}`} title="Active orders in delivery" />
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setAppMode('hire_services');
                  setHireServicesTab('explore');
                }}
                className={`px-3 py-1.5 rounded-xl transition-all hidden sm:inline-block ${
                  appMode === 'hire_services'
                    ? 'bg-[#963E20] text-white shadow-xs'
                    : 'text-stone-700 hover:text-stone-900'
                }`}
              >
                Hire Karigars
              </button>
            </div>

            {/* Language Toggle & Actions */}
            <div className="flex items-center gap-2">
              <button
                id="btn-language-toggle"
                onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
                className="px-3 py-1 bg-[#D1EBE1] text-[#1D5C4A] hover:bg-[#c2e4d8] text-xs font-bold rounded-full transition-colors"
                title="Switch Language"
              >
                {language === 'en' ? 'हिन्दी' : 'English'}
              </button>

              <button
                onClick={() => setIsVoiceAssistantOpen(true)}
                className="w-9 h-9 rounded-full bg-amber-100/70 hover:bg-amber-200 text-[#963E20] flex items-center justify-center transition-colors"
                title="AI Voice Assistant"
              >
                <Mic className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* Sub Navigation if in Hire Services mode */}
          {appMode === 'hire_services' && (
            <nav className="flex space-x-2 border-t border-stone-200/80 py-1.5 overflow-x-auto no-scrollbar">
              {[
                { id: 'explore', label: t.exploreKarigars, icon: Users, badge: karigars.length },
                { id: 'jobs', label: 'Work Requirements (काम)', icon: Briefcase, badge: jobs.length },
                { id: 'calculator', label: t.fairWageCalc, icon: Calculator },
                { id: 'bookings', label: t.myBookings, icon: CalendarCheck, badge: bookings.length },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = hireServicesTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setHireServicesTab(tab.id as typeof hireServicesTab)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                      isActive
                        ? 'text-white bg-[#963E20] shadow-xs'
                        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          )}
        </div>
      </header>

      {/* Main Content Sections */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-2 sm:px-4 py-4">
        
        {/* MODE 1: ARTISAN HUB (Matches Screenshots 1, 5, 6, 7) */}
        {appMode === 'artisan_hub' && (
          <div>
            {artisanTab === 'home' && (
              <ArtisanHomeHub
                language={language}
                artisanProfile={artisanProfile}
                products={products}
                orders={orders}
                onOpenAddProduct={() => setIsAddProductOpen(true)}
                onNavigateToProducts={() => setArtisanTab('products')}
                onNavigateToOrders={() => setArtisanTab('orders')}
                onNavigateToProfile={() => setArtisanTab('profile')}
                onOpenVoiceAssistant={() => setIsVoiceAssistantOpen(true)}
                onSwitchToMarketplace={() => setAppMode('marketplace')}
              />
            )}

            {artisanTab === 'products' && (
              <ProductsCatalogView
                language={language}
                products={products}
                onOpenAddProduct={() => setIsAddProductOpen(true)}
                onDeleteProduct={handleDeleteProduct}
                onViewAsBuyer={(prod) => {
                  setAppMode('marketplace');
                }}
              />
            )}

            {artisanTab === 'orders' && (
              <OrdersManagementView
                language={language}
                orders={orders}
                onUpdateOrderStatus={handleUpdateOrderStatus}
              />
            )}

            {artisanTab === 'profile' && (
              <UserProfileView
                language={language}
                profile={artisanProfile}
                onUpdateProfile={(updated) => {
                  setArtisanProfile(updated);
                  showToast('Profile details updated successfully');
                }}
                onToggleLanguage={() => setLanguage(language === 'en' ? 'hi' : 'en')}
                onOpenVoiceAssistant={() => setIsVoiceAssistantOpen(true)}
                onSwitchToMarketplace={() => setAppMode('marketplace')}
                onBack={() => setArtisanTab('home')}
              />
            )}
          </div>
        )}

        {/* MODE 2: READY PRODUCTS MARKETPLACE (See and Buy Products & Track Deliveries) */}
        {appMode === 'marketplace' && (
          <MarketplaceStorefront
            language={language}
            products={products}
            orders={orders}
            onProductOrdered={handleProductOrdered}
            onCancelOrder={handleCancelOrder}
            onSwitchToArtisan={() => {
              setAppMode('artisan_hub');
              setArtisanTab('home');
            }}
          />
        )}

        {/* MODE 3: HIRE SKILLED KARIGARS & TRADES */}
        {appMode === 'hire_services' && (
          <div className="space-y-6">
            {hireServicesTab === 'explore' && (
              <div className="space-y-6">
                {/* Hero Search */}
                <div className="bg-gradient-to-r from-[#963E20] via-[#80341A] to-[#602510] text-white rounded-3xl p-6 sm:p-8 shadow-lg relative overflow-hidden">
                  <div className="max-w-2xl space-y-3">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 rounded-full text-xs font-semibold backdrop-blur-xs">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-200" />
                      <span>Direct Karigar Connection • Zero Middlemen</span>
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                      {language === 'hi'
                        ? 'कुशल कारीगरों से सीधे जुड़ें'
                        : 'Hire Verified Master Craftspeople & Technicians'}
                    </h2>
                    <p className="text-xs sm:text-sm text-amber-100">
                      {t.subTagline}
                    </p>
                    <div className="pt-2 flex flex-col sm:flex-row gap-2">
                      <div className="relative flex-1">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder={t.searchPlaceholder}
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-white text-slate-900 text-xs sm:text-sm rounded-xl focus:outline-none shadow-md font-medium"
                        />
                      </div>
                      <select
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        className="px-3.5 py-3 bg-stone-900 text-white rounded-xl text-xs sm:text-sm font-semibold"
                      >
                        <option value="all">📍 {t.allCities}</option>
                        {allCities.map((city) => (
                          <option key={city} value={city}>📍 {city}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Trade filters */}
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                  <button
                    onClick={() => setSelectedTrade('all')}
                    className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap border ${
                      selectedTrade === 'all'
                        ? 'bg-[#963E20] text-white border-[#80341A]'
                        : 'bg-white text-stone-700 border-stone-200'
                    }`}
                  >
                    All Trades ({karigars.length})
                  </button>
                  {Object.entries(TRADE_META).map(([key, item]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedTrade(key)}
                      className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap border ${
                        selectedTrade === key
                          ? 'bg-[#963E20] text-white border-[#80341A]'
                          : 'bg-white text-stone-700 border-stone-200'
                      }`}
                    >
                      {language === 'hi' ? item.nameHi : item.nameEn}
                    </button>
                  ))}
                </div>

                {/* Karigars Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredKarigars.map((karigar) => (
                    <KarigarCard
                      key={karigar.id}
                      karigar={karigar}
                      language={language}
                      onSelectProfile={setSelectedKarigarForProfile}
                      onRequestBooking={(k) => setSelectedKarigarForProfile(k)}
                    />
                  ))}
                </div>
              </div>
            )}

            {hireServicesTab === 'jobs' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-stone-200">
                  <div>
                    <h3 className="font-bold text-stone-900">Work Requirements</h3>
                    <p className="text-xs text-stone-500">Post a job or view local assignments</p>
                  </div>
                  <button
                    onClick={() => setIsPostJobOpen(true)}
                    className="px-4 py-2 rounded-xl bg-[#963E20] text-white text-xs font-bold flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Post Requirement</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {jobs.map((job) => (
                    <div key={job.id} className="bg-white p-5 rounded-2xl border border-stone-200 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-stone-900">{job.title}</h4>
                          <p className="text-xs text-stone-500">{job.city} • {job.locality}</p>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-amber-100 text-[#963E20] font-bold text-xs">
                          ₹{job.budgetAmount}
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 leading-relaxed">{job.description}</p>
                      <button
                        onClick={() => handleApplyToJob(job)}
                        className="w-full py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs transition-colors"
                      >
                        Apply for this Job ({job.applicantsCount} applicants)
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {hireServicesTab === 'calculator' && (
              <WageCalculator language={language} />
            )}

            {hireServicesTab === 'bookings' && (
              <BookingsView
                bookings={bookings}
                language={language}
                onUpdateStatus={handleUpdateBookingStatus}
              />
            )}
          </div>
        )}

      </main>

      {/* Floating Bottom Navigation Bar matching Mobile Screenshots 1, 5, 6, 7 */}
      {appMode === 'artisan_hub' && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-amber-900/10 py-2 px-3 shadow-lg">
          <div className="max-w-md mx-auto flex items-center justify-around">
            
            {/* Home Tab */}
            <button
              type="button"
              onClick={() => setArtisanTab('home')}
              className={`flex flex-col items-center gap-1 transition-all ${
                artisanTab === 'home'
                  ? 'text-[#1D5C4A]'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <div
                className={`w-10 h-8 rounded-full flex items-center justify-center ${
                  artisanTab === 'home' ? 'bg-[#D1EBE1]' : ''
                }`}
              >
                <Home className="w-5 h-5 stroke-[2]" />
              </div>
              <span className="text-[10px] font-bold">Home</span>
            </button>

            {/* Products Tab */}
            <button
              type="button"
              onClick={() => setArtisanTab('products')}
              className={`flex flex-col items-center gap-1 transition-all ${
                artisanTab === 'products'
                  ? 'text-[#1D5C4A]'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <div
                className={`w-10 h-8 rounded-full flex items-center justify-center ${
                  artisanTab === 'products' ? 'bg-[#D1EBE1]' : ''
                }`}
              >
                <Package className="w-5 h-5 stroke-[2]" />
              </div>
              <span className="text-[10px] font-bold">Products</span>
            </button>

            {/* Add Product Button (Center) */}
            <button
              type="button"
              onClick={() => setIsAddProductOpen(true)}
              className="flex flex-col items-center gap-1 -mt-3 group"
            >
              <div className="w-12 h-12 rounded-full bg-[#963E20] group-hover:bg-[#80341A] text-white flex items-center justify-center shadow-lg border-2 border-white transition-transform active:scale-90">
                <Plus className="w-6 h-6 stroke-[3]" />
              </div>
              <span className="text-[10px] font-bold text-stone-700">Add</span>
            </button>

            {/* Orders Tab */}
            <button
              type="button"
              onClick={() => setArtisanTab('orders')}
              className={`flex flex-col items-center gap-1 transition-all relative ${
                artisanTab === 'orders'
                  ? 'text-[#1D5C4A]'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <div
                className={`w-10 h-8 rounded-full flex items-center justify-center ${
                  artisanTab === 'orders' ? 'bg-[#D1EBE1]' : ''
                }`}
              >
                <ShoppingBag className="w-5 h-5 stroke-[2]" />
              </div>
              <span className="text-[10px] font-bold">Orders</span>
              {orders.filter((o) => o.status === 'new').length > 0 && (
                <span className="absolute top-0 right-1 w-4 h-4 rounded-full bg-[#963E20] text-white text-[9px] font-bold flex items-center justify-center">
                  {orders.filter((o) => o.status === 'new').length}
                </span>
              )}
            </button>

            {/* Profile Tab */}
            <button
              type="button"
              onClick={() => setArtisanTab('profile')}
              className={`flex flex-col items-center gap-1 transition-all ${
                artisanTab === 'profile'
                  ? 'text-[#1D5C4A]'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <div
                className={`w-10 h-8 rounded-full flex items-center justify-center ${
                  artisanTab === 'profile' ? 'bg-[#D1EBE1]' : ''
                }`}
              >
                <User className="w-5 h-5 stroke-[2]" />
              </div>
              <span className="text-[10px] font-bold">Profile</span>
            </button>

          </div>
        </div>
      )}

      {/* MODALS */}
      {/* 1. Multi-Step Add Product Wizard (Photo Studio -> Smart Pricing -> Review & Publish) */}
      {isAddProductOpen && (
        <AddProductWizard
          language={language}
          onClose={() => setIsAddProductOpen(false)}
          onProductCreated={handleProductCreated}
        />
      )}

      {/* 2. Voice Assistant Modal */}
      {isVoiceAssistantOpen && (
        <VoiceAssistantModal
          language={language}
          onClose={() => setIsVoiceAssistantOpen(false)}
          onNavigateToAddProduct={() => {
            setIsVoiceAssistantOpen(false);
            setIsAddProductOpen(true);
          }}
          onNavigateToOrders={() => {
            setIsVoiceAssistantOpen(false);
            setAppMode('artisan_hub');
            setArtisanTab('orders');
          }}
        />
      )}

      {/* 3. Trade Karigar Profile Modal */}
      {selectedKarigarForProfile && (
        <KarigarProfileModal
          karigar={selectedKarigarForProfile}
          language={language}
          onClose={() => setSelectedKarigarForProfile(null)}
          onSubmitBooking={handleBookingCreated}
        />
      )}

      {/* 4. Post Job Requirement Modal */}
      {isPostJobOpen && (
        <PostJobModal
          language={language}
          onClose={() => setIsPostJobOpen(false)}
          onJobPosted={handleJobPosted}
        />
      )}

      {/* 5. Register Karigar Modal */}
      {isRegisterKarigarOpen && (
        <RegisterKarigarModal
          language={language}
          onClose={() => setIsRegisterKarigarOpen(false)}
          onKarigarRegistered={handleKarigarRegistered}
        />
      )}

    </div>
  );
}
