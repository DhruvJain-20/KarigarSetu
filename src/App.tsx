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
  ArrowLeft,
  LogOut,
  Loader2
} from 'lucide-react';

import {
  Karigar,
  JobPost,
  BookingRequest,
  Language,
  TradeCategory,
  ReadyProduct,
  ProductOrder,
  ArtisanUserProfile,
  UserProfile,
  UserRole
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
import { AuthPage } from './components/AuthPage';
import { supabase } from './supabaseClient';
import { supabaseService } from './services/supabaseService';
import { safeGetItem, safeSetItem } from './utils/safeStorage';

const INITIAL_BOOKINGS: BookingRequest[] = [
  {
    id: 'bk-1',
    karigarId: 'k-1',
    karigarName: 'Rameshwar Sharma',
    karigarTrade: 'handloom',
    clientName: 'Sanjay Chawla',
    clientPhone: '+91 98290 11223',
    clientAddress: 'C-44, Vaishali Nagar, Jaipur',
    serviceDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    jobDescription: 'Custom handloom textile weaving and silk curtain tailoring.',
    estimatedBudget: 4500,
    status: 'accepted',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'bk-2',
    karigarId: 'k-3',
    karigarName: 'Suresh Kumar Prajapati',
    karigarTrade: 'pottery',
    clientName: 'Rajeev Singhal',
    clientPhone: '+91 98100 44556',
    clientAddress: 'Tower B, Sector 62, Noida',
    serviceDate: new Date(Date.now() + 172800000).toISOString().split('T')[0],
    jobDescription: 'Custom terracotta planter pottery craft for heritage home.',
    estimatedBudget: 2500,
    status: 'pending',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  }
];

export default function App() {
  const [language, setLanguage] = useState<Language>('en');

  // Supabase Auth State
  const [session, setSession] = useState<any>(null);
  const [authUser, setAuthUser] = useState<any>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Modes: 'artisan_hub' (Screenshots 1-7), 'marketplace' (Buy Ready Products), 'hire_services' (Find trade karigars)
  const [appMode, setAppMode] = useState<'artisan_hub' | 'marketplace' | 'hire_services'>('artisan_hub');
  const [artisanTab, setArtisanTab] = useState<'home' | 'products' | 'orders' | 'profile'>('home');
  const [hireServicesTab, setHireServicesTab] = useState<'explore' | 'jobs' | 'calculator' | 'bookings'>('explore');

  // Persistence for products, orders, profile
  const [products, setProducts] = useState<ReadyProduct[]>(() => {
    return safeGetItem('ks_ready_products', INITIAL_READY_PRODUCTS);
  });

  const [orders, setOrders] = useState<ProductOrder[]>(() => {
    return safeGetItem('ks_product_orders', INITIAL_PRODUCT_ORDERS);
  });

  const [artisanProfile, setArtisanProfile] = useState<ArtisanUserProfile>(() => {
    return safeGetItem('ks_artisan_profile', DEFAULT_ARTISAN_PROFILE);
  });

  // Persistence for karigars, jobs, bookings
  const [karigars, setKarigars] = useState<Karigar[]>(() => {
    return safeGetItem('ks_karigars', INITIAL_KARIGARS);
  });

  const [jobs, setJobs] = useState<JobPost[]>(() => {
    return safeGetItem('ks_jobs', INITIAL_JOB_POSTS);
  });

  const [bookings, setBookings] = useState<BookingRequest[]>(() => {
    return safeGetItem('ks_bookings', INITIAL_BOOKINGS);
  });

  // Fetch or upsert real profile from Supabase
  const loadUserProfile = async (user: any) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      let profileData: UserProfile;

      if (data) {
        profileData = data as UserProfile;
      } else {
        let storedOAuthRole: UserRole | null = null;
        try {
          storedOAuthRole = localStorage.getItem('ks_pending_oauth_role') as UserRole | null;
          localStorage.removeItem('ks_pending_oauth_role');
        } catch (e) {
          // ignore
        }

        const defaultRole: UserRole = storedOAuthRole || (user.user_metadata?.role as UserRole) || 'artisan';
        const defaultName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Artisan';
        const defaultAvatar = user.user_metadata?.avatar_url || user.user_metadata?.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(defaultName)}&backgroundColor=963e20,1d5c4a`;

        const newProfile: UserProfile = {
          id: user.id,
          full_name: defaultName,
          email: user.email || '',
          role: defaultRole,
          language: language,
          avatar_url: defaultAvatar,
          created_at: new Date().toISOString(),
        };

        const { error: insertError } = await supabase
          .from('profiles')
          .upsert(newProfile, { onConflict: 'id' });

        if (insertError) {
          console.warn('Could not insert profile in Supabase:', insertError.message);
        }
        profileData = newProfile;
      }

      setCurrentUserProfile(profileData);

      // Automatically sync artisan profile view data with real Supabase user
      setArtisanProfile((prev) => ({
        ...prev,
        id: profileData.id,
        name: profileData.full_name || 'Artisan',
        hindiName: profileData.full_name || 'कारीगर',
        avatarUrl: profileData.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profileData.full_name || 'User')}&backgroundColor=963e20,1d5c4a`,
        businessDetails: {
          ...prev.businessDetails,
          businessName: profileData.business_name || '',
          workshopAddress: profileData.workshop_address || '',
          city: profileData.city || '',
          state: profileData.state || '',
          phone: profileData.phone || '',
          email: profileData.email || user.email || '',
          udyamRegNo: profileData.udyam_reg_no || '',
          aboutStory: profileData.about_story || '',
        },
        bankDetails: {
          ...prev.bankDetails,
          upiId: profileData.upi_id || '',
          bankName: profileData.bank_name || '',
          accountNumber: profileData.account_number || '',
          accountHolder: profileData.account_holder || profileData.full_name || '',
          ifscCode: profileData.ifsc_code || '',
        }
      }));

      // Role-based screen selection
      if (profileData.role === 'buyer') {
        setAppMode('marketplace');
      } else if (profileData.role === 'admin') {
        setAppMode('hire_services');
        setHireServicesTab('explore');
      } else {
        setAppMode('artisan_hub');
        setArtisanTab('home');
      }

      // Load products, orders, bookings, jobs, and karigars from Supabase
      loadAppDataFromSupabase(user.id);
    } catch (err) {
      console.error('Error loading user profile:', err);
    }
  };

  // Hydrate application state from Supabase tables
  const loadAppDataFromSupabase = async (userId: string) => {
    try {
      // 1. Fetch Products
      const dbProducts = await supabaseService.fetchProducts();
      if (dbProducts && dbProducts.length > 0) {
        setProducts(dbProducts);
      }

      // 2. Fetch Orders
      const dbOrders = await supabaseService.fetchOrders(userId);
      if (dbOrders && dbOrders.length > 0) {
        setOrders(dbOrders);
      }

      // 3. Fetch Bookings
      const dbBookings = await supabaseService.fetchBookings();
      if (dbBookings && dbBookings.length > 0) {
        setBookings(dbBookings);
      }

      // 4. Fetch Job Posts
      const dbJobs = await supabaseService.fetchJobPosts();
      if (dbJobs && dbJobs.length > 0) {
        setJobs(dbJobs);
      }

      // 5. Fetch Karigars
      const dbKarigars = await supabaseService.fetchKarigars();
      if (dbKarigars && dbKarigars.length > 0) {
        setKarigars(dbKarigars);
      }
    } catch (err) {
      console.warn('Notice loading Supabase datasets:', err);
    }
  };

  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (!isMounted) return;

        if (initialSession?.user) {
          setSession(initialSession);
          setAuthUser(initialSession.user);
          await loadUserProfile(initialSession.user);
        } else {
          setSession(null);
          setAuthUser(null);
          setCurrentUserProfile(null);
        }
      } catch (err) {
        console.error('Failed to get Supabase session:', err);
      } finally {
        if (isMounted) setIsAuthLoading(false);
      }
    }

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
      if (!isMounted) return;

      if (currentSession?.user) {
        setSession(currentSession);
        setAuthUser(currentSession.user);
        await loadUserProfile(currentSession.user);
      } else {
        setSession(null);
        setAuthUser(null);
        setCurrentUserProfile(null);
      }
      setIsAuthLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Sign out error:', err);
    }
    setSession(null);
    setAuthUser(null);
    setCurrentUserProfile(null);
    showToast(language === 'hi' ? 'आप सफलतापूर्वक लॉगआउट हो गए हैं' : 'Logged out successfully');
  };

  useEffect(() => {
    safeSetItem('ks_ready_products', products);
  }, [products]);

  useEffect(() => {
    safeSetItem('ks_product_orders', orders);
  }, [orders]);

  useEffect(() => {
    safeSetItem('ks_artisan_profile', artisanProfile);
  }, [artisanProfile]);

  useEffect(() => {
    safeSetItem('ks_karigars', karigars);
  }, [karigars]);

  useEffect(() => {
    safeSetItem('ks_jobs', jobs);
  }, [jobs]);

  useEffect(() => {
    safeSetItem('ks_bookings', bookings);
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

  // Identify current logged-in user / artisan ID
  const currentUserId = authUser?.id || artisanProfile.id;

  // Filter products that belong exclusively to this artisan's account for their Artisan Hub & Catalog
  const myArtisanProducts = products.filter(
    (p) => p.artisanId === currentUserId || (authUser?.id && p.artisanId === authUser.id)
  );

  // Filter orders that belong exclusively to this artisan's products
  const myArtisanOrders = orders.filter(
    (o) => o.artisanId === currentUserId || (authUser?.id && o.artisanId === authUser.id)
  );

  // Handlers for Products & Orders
  const handleProductCreated = async (newProduct: ReadyProduct) => {
    const finalProduct: ReadyProduct = {
      ...newProduct,
      artisanId: authUser?.id || artisanProfile.id,
      artisanName: artisanProfile.name || newProduct.artisanName,
      artisanCity: artisanProfile.businessDetails?.city || newProduct.artisanCity,
      artisanAvatar: artisanProfile.avatarUrl || newProduct.artisanAvatar,
    };

    setProducts([finalProduct, ...products]);
    setArtisanProfile((prev) => ({
      ...prev,
      productsListedCount: prev.productsListedCount + 1,
    }));
    showToast(
      language === 'hi'
        ? `बधाई! '${finalProduct.name}' सफलता से प्रकाशित हुआ!`
        : `Congratulations! '${finalProduct.name}' is now live in your catalog!`
    );
    setAppMode('artisan_hub');
    setArtisanTab('products');

    // Persist to Supabase
    await supabaseService.createProduct(finalProduct, authUser?.id);
  };

  const handleProductOrdered = async (newOrder: ProductOrder) => {
    setOrders([newOrder, ...orders]);
    
    // Decrement stock for the ordered product and mark as sold_out if 0
    let updatedProductStock = 0;
    let updatedProductStatus: 'published' | 'sold_out' = 'published';

    setProducts((prevProducts) =>
      prevProducts.map((p) => {
        if (p.id === newOrder.productId) {
          const newStock = Math.max(0, p.stock - newOrder.quantity);
          const newStatus: 'published' | 'sold_out' = newStock === 0 ? 'sold_out' : p.status;
          updatedProductStock = newStock;
          updatedProductStatus = newStatus;
          return { ...p, stock: newStock, status: newStatus };
        }
        return p;
      })
    );

    if (newOrder.artisanId === currentUserId) {
      setArtisanProfile((prev) => ({
        ...prev,
        salesTotal: prev.salesTotal + newOrder.totalAmount,
        activeOrdersCount: prev.activeOrdersCount + 1,
      }));
    }

    showToast(
      language === 'hi'
        ? `ऑर्डर सफलतापूर्वक दर्ज हुआ! कारीगर को सूचना भेज दी गई है।`
        : `Order placed successfully! Stock updated and artisan notified.`
    );

    // Persist to Supabase
    await supabaseService.createOrder(newOrder, authUser?.id);

    // Update stock in Supabase
    if (newOrder.productId) {
      await supabaseService.updateProductStock(newOrder.productId, updatedProductStock, updatedProductStatus);
    }
  };

  const handleUpdateProductStock = async (productId: string, newStock: number) => {
    const newStatus: 'published' | 'sold_out' = newStock > 0 ? 'published' : 'sold_out';
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: newStock, status: newStatus } : p))
    );
    showToast(
      newStock > 0
        ? `Stock updated to ${newStock} units. Product is now available in Shop Crafts!`
        : `Product marked as Out of Stock.`
    );

    // Persist stock update in Supabase
    await supabaseService.updateProductStock(productId, newStock, newStatus);
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: ProductOrder['status']) => {
    setOrders(
      orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    showToast(`Order status updated to ${newStatus.toUpperCase()}`);

    // Persist to Supabase
    await supabaseService.updateOrderStatus(orderId, newStatus);
  };

  const handleDeleteProduct = async (productId: string) => {
    setProducts(products.filter((p) => p.id !== productId));
    showToast('Product removed from catalog');

    // Persist to Supabase
    await supabaseService.deleteProduct(productId);
  };

  const handleCancelOrder = async (orderId: string) => {
    setOrders(
      orders.map((o) => (o.id === orderId ? { ...o, status: 'cancelled' } : o))
    );
    showToast('Order has been cancelled');

    // Persist to Supabase
    await supabaseService.updateOrderStatus(orderId, 'cancelled');
  };

  // Handlers for Hire & Jobs
  const handleJobPosted = async (newJob: JobPost) => {
    setJobs([newJob, ...jobs]);
    showToast(language === 'hi' ? 'काम की आवश्यकता सफलतापूर्वक पोस्ट हुई!' : 'Work requirement posted successfully!');
    setAppMode('hire_services');
    setHireServicesTab('jobs');

    // Persist to Supabase
    await supabaseService.createJobPost(newJob, authUser?.id);
  };

  const handleKarigarRegistered = async (newKarigar: Karigar) => {
    setKarigars([newKarigar, ...karigars]);
    showToast(
      language === 'hi'
        ? `बधाई! ${newKarigar.name} की कारीगर प्रोफाइल लाइव हो गई है!`
        : `Congratulations! ${newKarigar.name}'s profile is now live!`
    );
    setAppMode('hire_services');
    setHireServicesTab('explore');

    // Persist to Supabase
    await supabaseService.registerKarigar(newKarigar, authUser?.id);
  };

  const handleBookingCreated = async (bookingData: {
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

    // Persist to Supabase
    await supabaseService.createBooking(newBooking, authUser?.id);
  };

  const handleUpdateBookingStatus = async (id: string, status: BookingRequest['status']) => {
    setBookings(bookings.map((b) => (b.id === id ? { ...b, status } : b)));
    showToast(`Booking status updated to ${status}`);

    // Persist to Supabase
    await supabaseService.updateBookingStatus(id, status);
  };

  const handleApplyToJob = async (job: JobPost) => {
    setJobs(
      jobs.map((j) => (j.id === job.id ? { ...j, applicantsCount: j.applicantsCount + 1 } : j))
    );
    showToast(language === 'hi' ? 'आवेदन भेजा गया! नियोक्ता आपसे संपर्क करेंगे।' : 'Proposal submitted! Client has been notified.');

    // Persist to Supabase
    await supabaseService.incrementJobApplicants(job.id, job.applicantsCount);
  };

  // Auth Loading Splash Screen
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 rounded-3xl bg-[#963E20] flex items-center justify-center text-white shadow-xl shadow-amber-950/15 animate-bounce">
            <Hammer className="w-8 h-8 text-amber-200" />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-bold font-serif text-[#963E20]">KarigarSetu</h2>
            <p className="text-xs text-stone-600 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-[#963E20]" />
              <span>Verifying Supabase Session & Profile...</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If not authenticated, show real Supabase Auth Screen
  if (!session || !authUser) {
    return (
      <AuthPage
        language={language}
        onToggleLanguage={() => setLanguage(language === 'en' ? 'hi' : 'en')}
        onAuthSuccess={async () => {
          const { data: { session: freshSession } } = await supabase.auth.getSession();
          if (freshSession?.user) {
            setSession(freshSession);
            setAuthUser(freshSession.user);
            await loadUserProfile(freshSession.user);
          }
        }}
      />
    );
  }

  return (
    <div id="karigarsetu-root" className="min-h-screen bg-[#FAF7F2] text-slate-900 flex flex-col font-sans selection:bg-amber-200 selection:text-amber-950">
      
      {/* Toast alert */}
      {toastMessage && (
        <div id="app-toast" className="fixed top-5 right-5 z-50 bg-[#963E20] text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/20 text-sm font-medium animate-in fade-in">
          <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Bar fully responsive for mobile and desktop */}
      <header id="main-header" className="bg-white/95 backdrop-blur-md border-b border-amber-900/10 sticky top-0 z-40 shadow-xs w-full max-w-full">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-2.5 space-y-2 sm:space-y-0">
          <div className="flex items-center justify-between gap-2 sm:h-12">
            
            {/* Logo */}
            <div
              onClick={() => {
                setAppMode('artisan_hub');
                setArtisanTab('home');
              }}
              className="flex items-center gap-1.5 sm:gap-2 cursor-pointer group shrink-0"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#963E20] flex items-center justify-center text-white shadow-xs shrink-0">
                <Hammer className="w-4 h-4 sm:w-5 sm:h-5 text-amber-200" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-serif font-extrabold text-lg sm:text-2xl text-[#963E20] tracking-tight">
                  KarigarSetu
                </span>
                <span className="text-[10px] font-bold text-amber-900 hidden lg:inline">
                  कारीगर सेतु
                </span>
              </div>
            </div>

            {/* Desktop Center Mode Tabs */}
            <div className="hidden md:flex items-center bg-stone-100/90 p-1 rounded-2xl border border-stone-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setAppMode('artisan_hub');
                  setArtisanTab('home');
                }}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
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
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
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
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  appMode === 'hire_services'
                    ? 'bg-[#963E20] text-white shadow-xs'
                    : 'text-stone-700 hover:text-stone-900'
                }`}
              >
                Hire Karigars
              </button>
            </div>

            {/* User Profile & Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Authenticated user pill */}
              <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 bg-stone-100/90 rounded-full border border-stone-200/80">
                <img
                  src={currentUserProfile?.avatar_url || artisanProfile.avatarUrl}
                  alt={currentUserProfile?.full_name || 'User'}
                  className="w-6 h-6 rounded-full object-cover border border-amber-900/20"
                />
                <div className="text-left text-[11px] leading-tight">
                  <div className="font-bold text-stone-900 truncate max-w-[90px]">
                    {currentUserProfile?.full_name?.split(' ')[0] || 'User'}
                  </div>
                  <div className="text-[9px] uppercase tracking-wider font-extrabold text-[#963E20]">
                    {currentUserProfile?.role || 'artisan'}
                  </div>
                </div>
              </div>

              {/* Language Switch */}
              <button
                id="btn-language-toggle"
                onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
                className="px-2.5 sm:px-3 py-1 bg-[#D1EBE1] text-[#1D5C4A] hover:bg-[#c2e4d8] text-[11px] sm:text-xs font-bold rounded-full transition-colors cursor-pointer"
                title="Switch Language"
              >
                {language === 'en' ? 'हिन्दी' : 'English'}
              </button>

              {/* AI Voice Assistant */}
              <button
                onClick={() => setIsVoiceAssistantOpen(true)}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-amber-100/70 hover:bg-amber-200 text-[#963E20] flex items-center justify-center transition-colors cursor-pointer shrink-0"
                title="AI Voice Assistant"
              >
                <Mic className="w-4 h-4" />
              </button>

              {/* Real Supabase Logout */}
              <button
                onClick={handleLogout}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 flex items-center justify-center transition-colors border border-rose-200/60 cursor-pointer shrink-0"
                title={language === 'hi' ? 'लॉगआउट करें' : 'Log Out'}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* Mobile Secondary Row Mode Tabs (Clean & full width, zero overflow) */}
          <div className="flex md:hidden items-center bg-stone-100/90 p-0.5 rounded-2xl border border-stone-200/80 text-[11px] font-bold w-full justify-between">
            <button
              type="button"
              onClick={() => {
                setAppMode('artisan_hub');
                setArtisanTab('home');
              }}
              className={`flex-1 py-1.5 px-2 rounded-xl text-center transition-all cursor-pointer truncate ${
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
              className={`flex-1 py-1.5 px-2 rounded-xl text-center transition-all flex items-center justify-center gap-1 cursor-pointer truncate ${
                appMode === 'marketplace'
                  ? 'bg-[#963E20] text-white shadow-xs'
                  : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              <span>Shop Crafts</span>
              {orders.filter(o => o.status === 'shipped' || o.status === 'processing' || o.status === 'new').length > 0 && (
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${appMode === 'marketplace' ? 'bg-amber-300' : 'bg-[#1D5C4A]'}`} />
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setAppMode('hire_services');
                setHireServicesTab('explore');
              }}
              className={`flex-1 py-1.5 px-2 rounded-xl text-center transition-all cursor-pointer truncate ${
                appMode === 'hire_services'
                  ? 'bg-[#963E20] text-white shadow-xs'
                  : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              Hire Karigars
            </button>
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
      <main className="flex-1 w-full max-w-7xl mx-auto px-2 sm:px-4 py-3 sm:py-4 overflow-x-hidden">
        
        {/* MODE 1: ARTISAN HUB (Matches Screenshots 1, 5, 6, 7) */}
        {appMode === 'artisan_hub' && (
          <div>
            {artisanTab === 'home' && (
              <ArtisanHomeHub
                language={language}
                artisanProfile={artisanProfile}
                products={myArtisanProducts}
                orders={myArtisanOrders}
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
                products={myArtisanProducts}
                onOpenAddProduct={() => setIsAddProductOpen(true)}
                onDeleteProduct={handleDeleteProduct}
                onUpdateStock={handleUpdateProductStock}
                onViewAsBuyer={(prod) => {
                  setAppMode('marketplace');
                }}
              />
            )}

            {artisanTab === 'orders' && (
              <OrdersManagementView
                language={language}
                orders={myArtisanOrders}
                onUpdateOrderStatus={handleUpdateOrderStatus}
              />
            )}

            {artisanTab === 'profile' && (
              <UserProfileView
                language={language}
                profile={artisanProfile}
                products={myArtisanProducts}
                orders={myArtisanOrders}
                onUpdateProfile={async (updated) => {
                  setArtisanProfile(updated);
                  // Also update profile in Supabase profiles table
                  if (authUser?.id) {
                    await supabase
                      .from('profiles')
                      .update({
                        full_name: updated.name,
                        phone: updated.businessDetails.phone,
                        business_name: updated.businessDetails.businessName,
                        workshop_address: updated.businessDetails.workshopAddress,
                        city: updated.businessDetails.city,
                        state: updated.businessDetails.state,
                        udyam_reg_no: updated.businessDetails.udyamRegNo,
                        about_story: updated.businessDetails.aboutStory,
                        upi_id: updated.bankDetails.upiId,
                        bank_name: updated.bankDetails.bankName,
                        account_number: updated.bankDetails.accountNumber,
                        account_holder: updated.bankDetails.accountHolder,
                        ifsc_code: updated.bankDetails.ifscCode,
                        avatar_url: updated.avatarUrl,
                      })
                      .eq('id', authUser.id);
                  }
                  showToast('Profile details updated successfully');
                }}
                onToggleLanguage={() => setLanguage(language === 'en' ? 'hi' : 'en')}
                onOpenVoiceAssistant={() => setIsVoiceAssistantOpen(true)}
                onSwitchToMarketplace={() => setAppMode('marketplace')}
                onBack={() => setArtisanTab('home')}
                onLogout={handleLogout}
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
                      onViewProfile={setSelectedKarigarForProfile}
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
              {myArtisanOrders.filter((o) => o.status === 'new').length > 0 && (
                <span className="absolute top-0 right-1 w-4 h-4 rounded-full bg-[#963E20] text-white text-[9px] font-bold flex items-center justify-center">
                  {myArtisanOrders.filter((o) => o.status === 'new').length}
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
          artisanProfile={artisanProfile}
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
