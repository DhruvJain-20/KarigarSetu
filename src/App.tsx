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
  Loader2,
  RotateCw
} from 'lucide-react';

import {
  Karigar,
  JobPost,
  JobApplicant,
  BookingRequest,
  Language,
  TradeCategory,
  ReadyProduct,
  ProductOrder,
  ProductReview,
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
import { ApplyJobModal } from './components/ApplyJobModal';
import { JobApplicantsModal } from './components/JobApplicantsModal';
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

const INITIAL_BOOKINGS: BookingRequest[] = [];

const MOCK_KARIGAR_IDS = new Set(['k-1', 'k-2', 'k-3', 'k-4', 'k-5', 'k-6', 'k-7', 'k-8', 'k-9', 'k-10']);
const isGenuineKarigar = (k: Karigar): boolean => {
  if (!k || !k.id) return false;
  if (MOCK_KARIGAR_IDS.has(k.id)) return false;
  if (k.userId === 'mock') return false;
  return true;
};

const isGenuineBooking = (b: BookingRequest): boolean => {
  if (!b || !b.id) return false;
  // Only filter out legacy hardcoded static mock seeds if they have no real client phone
  if ((b.id === 'bk-1' || b.id === 'bk-2') && b.clientName === 'Sunita Verma') return false;
  return true;
};

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
    const saved = safeGetItem<Karigar[]>('ks_karigars', []);
    return (saved || []).filter(isGenuineKarigar);
  });

  const [jobs, setJobs] = useState<JobPost[]>(() => {
    return safeGetItem('ks_jobs', INITIAL_JOB_POSTS);
  });

  const [bookings, setBookings] = useState<BookingRequest[]>(() => {
    const saved = safeGetItem<BookingRequest[]>('ks_bookings', []);
    return (saved || []).filter(isGenuineBooking);
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
        const genuineBookings = dbBookings.filter(isGenuineBooking);
        setBookings(genuineBookings);
      }

      // 4. Fetch Job Posts
      const dbJobs = await supabaseService.fetchJobPosts();
      if (dbJobs && dbJobs.length > 0) {
        setJobs(dbJobs);
        setSelectedJobForApplicants((prev) => {
          if (!prev) return null;
          return dbJobs.find((j) => j.id === prev.id) || prev;
        });
      }

      // 5. Fetch Karigars
      const dbKarigars = await supabaseService.fetchKarigars();
      if (dbKarigars && dbKarigars.length > 0) {
        const genuineDbKarigars = dbKarigars.filter(isGenuineKarigar);
        setKarigars(genuineDbKarigars);
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

  // Real-time synchronization across accounts/tabs for jobs, bookings, orders, products, and karigars
  useEffect(() => {
    // 1. Supabase Realtime Channels
    const channel = supabase
      .channel('ks_realtime_sync_channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'job_posts' },
        async () => {
          const freshJobs = await supabaseService.fetchJobPosts();
          if (freshJobs && freshJobs.length > 0) {
            setJobs(freshJobs);
            setSelectedJobForApplicants((prev) => {
              if (!prev) return null;
              return freshJobs.find((j) => j.id === prev.id) || prev;
            });
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        async () => {
          const freshBookings = await supabaseService.fetchBookings();
          if (freshBookings) {
            setBookings(freshBookings.filter(isGenuineBooking));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'karigars' },
        async () => {
          const [freshKarigars, freshBookings] = await Promise.all([
            supabaseService.fetchKarigars(),
            supabaseService.fetchBookings(),
          ]);
          if (freshKarigars && freshKarigars.length > 0) {
            setKarigars(freshKarigars.filter(isGenuineKarigar));
          }
          if (freshBookings && freshBookings.length > 0) {
            setBookings(freshBookings.filter(isGenuineBooking));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        async () => {
          if (authUser?.id) {
            const freshOrders = await supabaseService.fetchOrders(authUser.id);
            if (freshOrders) setOrders(freshOrders);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        async () => {
          const freshProducts = await supabaseService.fetchProducts();
          if (freshProducts && freshProducts.length > 0) {
            setProducts(freshProducts);
          }
        }
      )
      .subscribe();

    // 2. Periodic background sync (every 6 seconds when document is visible)
    const pollInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadAppDataFromSupabase(authUser?.id || '');
      }
    }, 6000);

    // 3. Sync on window focus / tab switch
    const handleWindowFocus = () => {
      loadAppDataFromSupabase(authUser?.id || '');
    };
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(pollInterval);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [authUser?.id]);

  // Modal states
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isVoiceAssistantOpen, setIsVoiceAssistantOpen] = useState(false);
  const [selectedKarigarForProfile, setSelectedKarigarForProfile] = useState<Karigar | null>(null);
  const [isPostJobOpen, setIsPostJobOpen] = useState(false);
  const [isRegisterKarigarOpen, setIsRegisterKarigarOpen] = useState(false);
  const [editingKarigar, setEditingKarigar] = useState<Karigar | null>(null);
  const [selectedJobForApply, setSelectedJobForApply] = useState<JobPost | null>(null);
  const [selectedJobForApplicants, setSelectedJobForApplicants] = useState<JobPost | null>(null);
  const [portfolioFilter, setPortfolioFilter] = useState<'all' | 'mine'>('all');

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

  // Identify current logged-in user / artisan ID
  const currentUserId = authUser?.id || artisanProfile.id;

  // Filtered Karigars with portfolioFilter support
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

    let matchesPortfolioTab = true;
    if (portfolioFilter === 'mine') {
      matchesPortfolioTab = k.userId === currentUserId || k.phone === (currentUserProfile?.phone || '');
    }

    return (
      matchesSearch &&
      matchesTrade &&
      matchesCity &&
      matchesVerified &&
      matchesAvailable &&
      matchesRating &&
      matchesPortfolioTab
    );
  });

  // Filter products that belong exclusively to this artisan's account for their Artisan Hub & Catalog
  const myArtisanProducts = products.filter(
    (p) => p.artisanId === currentUserId || (authUser?.id && p.artisanId === authUser.id)
  );

  // Filter orders that belong exclusively to this artisan's products
  const myArtisanOrders = orders.filter(
    (o) => o.artisanId === currentUserId || (authUser?.id && o.artisanId === authUser.id)
  );

  // Artisan portfolios that belong to the current logged-in user
  const myRegisteredKarigars = karigars.filter((k) => {
    if (authUser?.id && k.userId === authUser.id) return true;
    if (currentUserId && k.userId === currentUserId) return true;
    if (currentUserProfile?.phone && k.phone && k.phone.replace(/\D/g, '') === currentUserProfile.phone.replace(/\D/g, '')) return true;
    if (currentUserProfile?.full_name && k.name.trim().toLowerCase() === currentUserProfile.full_name.trim().toLowerCase()) return true;
    if (artisanProfile?.name && k.name.trim().toLowerCase() === artisanProfile.name.trim().toLowerCase()) return true;
    return false;
  });

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

  // Real Product Rating Handler - Updates Order + Product Reviews list + Rating score
  const handleRateProduct = async (
    orderId: string,
    productId: string,
    rating: number,
    feedback: string
  ) => {
    // 1. Update orders state
    setOrders((prevOrders) =>
      prevOrders.map((ord) =>
        ord.id === orderId
          ? {
              ...ord,
              isRated: true,
              userRating: rating,
              userReview: feedback,
            }
          : ord
      )
    );

    // 2. Add real review to product & recompute average rating
    const reviewerName =
      currentUserProfile?.full_name ||
      authUser?.user_metadata?.full_name ||
      authUser?.user_metadata?.name ||
      'Verified Buyer';

    const newReview: ProductReview = {
      id: `rev-${Date.now()}`,
      author: reviewerName,
      rating: rating,
      comment: feedback,
      date: 'Just now',
      verifiedBuyer: true,
      city: currentUserProfile?.city || 'India',
    };

    setProducts((prevProducts) =>
      prevProducts.map((p) => {
        if (p.id === productId) {
          const existingReviews = p.reviews || [];
          const updatedReviews = [newReview, ...existingReviews];
          const totalRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0);
          const newAvgRating = Number((totalRating / updatedReviews.length).toFixed(1));

          return {
            ...p,
            rating: newAvgRating,
            reviewsCount: updatedReviews.length,
            reviews: updatedReviews,
          };
        }
        return p;
      })
    );

    showToast(
      language === 'hi'
        ? 'आपकी रेटिंग और समीक्षा सफलतापूर्वक दर्ज हो गई!'
        : 'Thank you! Your product rating & review is now live.'
    );
  };

  // Handlers for Hire & Jobs
  const handleJobPosted = async (newJob: JobPost) => {
    const jobWithUser: JobPost = {
      ...newJob,
      userId: authUser?.id || currentUserId,
      posterName: currentUserProfile?.full_name || authUser?.user_metadata?.full_name || 'Client',
      posterPhone: currentUserProfile?.phone || '',
      applicants: newJob.applicants || [],
      applicantsCount: newJob.applicantsCount || 0
    };
    setJobs([jobWithUser, ...jobs]);
    showToast(language === 'hi' ? 'काम की आवश्यकता सफलतापूर्वक पोस्ट हुई!' : 'Work requirement posted successfully!');
    setAppMode('hire_services');
    setHireServicesTab('jobs');

    // Persist to Supabase
    await supabaseService.createJobPost(jobWithUser, authUser?.id);
  };

  const handleKarigarRegistered = async (newKarigar: Karigar) => {
    const karigarWithUser: Karigar = {
      ...newKarigar,
      userId: authUser?.id || currentUserId,
      isUserCreated: true
    };

    setKarigars((prev) => {
      const exists = prev.some((k) => k.id === karigarWithUser.id);
      if (exists) {
        return prev.map((k) => (k.id === karigarWithUser.id ? karigarWithUser : k));
      }
      return [karigarWithUser, ...prev];
    });

    showToast(
      language === 'hi'
        ? `बधाई! ${karigarWithUser.name} की कारीगर प्रोफाइल लाइव हो गई है!`
        : `Congratulations! ${karigarWithUser.name}'s portfolio is now live!`
    );
    setAppMode('hire_services');
    setHireServicesTab('explore');
    setIsRegisterKarigarOpen(false);
    setEditingKarigar(null);

    // Persist to Supabase
    await supabaseService.registerKarigar(karigarWithUser, authUser?.id);
  };

  const handleDeleteKarigar = async (karigarId: string) => {
    setKarigars((prev) => prev.filter((k) => k.id !== karigarId));
    showToast(language === 'hi' ? 'प्रोफ़ाइल हटा दी गई' : 'Portfolio removed');
  };

  const handleClearFakeKarigars = () => {
    if (confirm('Do you want to clear unverified mock portfolios and keep only real user portfolios?')) {
      const realOnly = karigars.filter((k) => k.isUserCreated || k.userId);
      setKarigars(realOnly.length > 0 ? realOnly : INITIAL_KARIGARS.slice(0, 3));
      showToast('Portfolio list updated');
    }
  };

  const handleBookingCreated = async (bookingData: {
    karigarId: string;
    karigarName: string;
    karigarTrade: Karigar['trade'];
    karigarPhone?: string;
    clientUserId?: string;
    clientName: string;
    clientPhone: string;
    clientAddress: string;
    serviceDate: string;
    jobDescription: string;
    estimatedBudget: number;
  }) => {
    const activeUserId = bookingData.clientUserId || authUser?.id || currentUserProfile?.id || currentUserId;
    const newBooking: BookingRequest = {
      id: `bk-${Date.now()}`,
      clientUserId: activeUserId,
      ...bookingData,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    setBookings([newBooking, ...bookings]);
    showToast(language === 'hi' ? 'बुकिंग अनुरोध कारीगर को भेजा गया!' : 'Booking request sent to artisan!');

    // Persist to Supabase
    await supabaseService.createBooking(newBooking, activeUserId);
  };

  const handleUpdateBookingStatus = async (id: string, status: BookingRequest['status']) => {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
    showToast(
      status === 'accepted'
        ? (language === 'hi' ? 'अनुरोध स्वीकृत किया गया!' : 'Work request accepted & confirmed!')
        : `Booking status updated to ${status}`
    );

    // Persist to Supabase
    await supabaseService.updateBookingStatus(id, status);

    // Re-fetch bookings from Supabase to sync authoritative state across clients
    const freshBookings = await supabaseService.fetchBookings();
    if (freshBookings && freshBookings.length > 0) {
      setBookings(freshBookings.filter(isGenuineBooking));
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    setBookings((prev) => prev.filter((b) => b.id !== bookingId));
    showToast(language === 'hi' ? 'बुकिंग हटा दी गई' : 'Booking inquiry removed');

    // Persist to Supabase
    await supabaseService.deleteBooking(bookingId);
  };

  const handleSubmitJobProposal = async (proposal: Omit<JobApplicant, 'id' | 'appliedAt' | 'status'>) => {
    if (!selectedJobForApply) return;
    const targetJob = selectedJobForApply;
    const targetJobId = selectedJobForApply.id;

    const newApplicant: JobApplicant = {
      ...proposal,
      id: `app-${Date.now()}`,
      applicantUserId: authUser?.id || currentUserProfile?.id,
      appliedAt: new Date().toISOString(),
      status: 'pending',
    };

    const currentApplicants = targetJob.applicants || [];
    // If user already applied, update their proposal, else prepend
    const existingIndex = currentApplicants.findIndex(
      (a) =>
        (a.applicantUserId && (a.applicantUserId === authUser?.id || a.applicantUserId === currentUserProfile?.id)) ||
        (a.applicantPhone && proposal.applicantPhone && a.applicantPhone.replace(/\D/g, '') === proposal.applicantPhone.replace(/\D/g, ''))
    );

    let updatedApplicants: JobApplicant[];
    if (existingIndex >= 0) {
      updatedApplicants = currentApplicants.map((a, idx) =>
        idx === existingIndex ? { ...a, ...proposal, status: 'pending', appliedAt: new Date().toISOString() } : a
      );
    } else {
      updatedApplicants = [newApplicant, ...currentApplicants];
    }

    setJobs((prevJobs) =>
      prevJobs.map((j) =>
        j.id === targetJobId
          ? {
              ...j,
              applicantsCount: updatedApplicants.length,
              applicants: updatedApplicants,
            }
          : j
      )
    );

    setSelectedJobForApply(null);

    showToast(
      language === 'hi'
        ? 'आवेदन भेजा गया! नियोक्ता आपके प्रस्ताव की समीक्षा करेंगे।'
        : 'Proposal submitted! The job poster will review your application.'
    );

    // Persist updated applicants list to Supabase
    await supabaseService.updateJobApplicants(
      targetJobId,
      updatedApplicants,
      targetJob.description,
      { ...targetJob, applicants: updatedApplicants }
    );

    // Fetch latest state to ensure perfect server sync
    const fresh = await supabaseService.fetchJobPosts();
    if (fresh && fresh.length > 0) setJobs(fresh);
  };

  const handleUpdateApplicantStatus = async (
    jobId: string,
    applicantId: string,
    status: 'pending' | 'accepted' | 'rejected'
  ) => {
    const targetJob = jobs.find((j) => j.id === jobId) || selectedJobForApplicants;
    if (!targetJob) return;

    const currentApplicants = targetJob.applicants || [];
    const updatedApplicants: JobApplicant[] = currentApplicants.map((app) =>
      app.id === applicantId ? { ...app, status } : app
    );

    // Optimistically update jobs state
    setJobs((prevJobs) =>
      prevJobs.map((j) =>
        j.id === jobId
          ? { ...j, applicants: updatedApplicants }
          : j
      )
    );

    // Optimistically update selected modal state
    setSelectedJobForApplicants((prev) => {
      if (!prev || prev.id !== jobId) return prev;
      return { ...prev, applicants: updatedApplicants };
    });

    showToast(
      status === 'accepted'
        ? (language === 'hi' ? 'कारीगर स्वीकृत किया गया!' : 'Applicant accepted! You can now contact them.')
        : status === 'rejected'
        ? (language === 'hi' ? 'आवेदन अस्वीकृत किया गया' : 'Applicant rejected')
        : `Applicant marked as ${status}`
    );

    // Persist updated applicant status to Supabase
    await supabaseService.updateJobApplicants(
      jobId,
      updatedApplicants,
      targetJob.description,
      { ...targetJob, applicants: updatedApplicants }
    );

    // Fetch latest state to ensure perfect server sync across devices
    const fresh = await supabaseService.fetchJobPosts();
    if (fresh && fresh.length > 0) {
      setJobs(fresh);
      const refreshedSelected = fresh.find((j) => j.id === jobId);
      if (refreshedSelected) {
        setSelectedJobForApplicants(refreshedSelected);
      }
    }
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
            currentUserProfile={currentUserProfile}
            authUser={authUser}
            onProductOrdered={handleProductOrdered}
            onCancelOrder={handleCancelOrder}
            onRateProduct={handleRateProduct}
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

                {/* Portfolio Actions & Filters Bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-stone-200 shadow-2xs">
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
                    <button
                      onClick={() => setPortfolioFilter('all')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        portfolioFilter === 'all'
                          ? 'bg-[#963E20] text-white'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      {language === 'hi' ? 'सभी कारीगर' : 'All Artisans'} ({karigars.length})
                    </button>
                    <button
                      onClick={() => setPortfolioFilter('mine')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        portfolioFilter === 'mine'
                          ? 'bg-[#963E20] text-white'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      {language === 'hi' ? 'मेरी प्रोफाइल' : 'My Portfolios'} ({karigars.filter((k) => k.userId === currentUserId || k.phone === (currentUserProfile?.phone || '')).length})
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={async () => {
                        const dbKarigars = await supabaseService.fetchKarigars();
                        if (dbKarigars && dbKarigars.length > 0) {
                          setKarigars(dbKarigars.filter(isGenuineKarigar));
                          showToast(language === 'hi' ? 'कारीगर प्रोफाइल सिंक हो गई!' : 'Portfolios refreshed from database!');
                        }
                      }}
                      className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                      title={language === 'hi' ? 'डेटाबेस से रिफ्रेश करें' : 'Refresh from database'}
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>{language === 'hi' ? 'रिफ्रेश' : 'Refresh'}</span>
                    </button>
                    <button
                      onClick={() => {
                        setEditingKarigar(null);
                        setIsRegisterKarigarOpen(true);
                      }}
                      className="w-full sm:w-auto px-4 py-2 bg-[#963E20] hover:bg-[#80341A] text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>{language === 'hi' ? 'अपनी कारीगर प्रोफाइल बनाएं' : 'Create Your Portfolio'}</span>
                    </button>
                  </div>
                </div>

                {/* Trade filters */}
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                  <button
                    onClick={() => setSelectedTrade('all')}
                    className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap border cursor-pointer ${
                      selectedTrade === 'all'
                        ? 'bg-[#963E20] text-white border-[#80341A]'
                        : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    All Trades ({karigars.length})
                  </button>
                  {Object.entries(TRADE_META).map(([key, item]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedTrade(key)}
                      className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap border cursor-pointer ${
                        selectedTrade === key
                          ? 'bg-[#963E20] text-white border-[#80341A]'
                          : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      {language === 'hi' ? item.nameHi : item.nameEn}
                    </button>
                  ))}
                </div>

                {/* Karigars Grid */}
                {filteredKarigars.length === 0 ? (
                  <div className="bg-white rounded-3xl p-10 sm:p-14 text-center border border-stone-200 space-y-4 shadow-2xs max-w-2xl mx-auto my-6">
                    <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto text-[#963E20]">
                      <Users className="w-8 h-8 text-[#963E20]" />
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="font-bold text-stone-900 text-lg">
                        {language === 'hi' ? 'कोई कारीगर प्रोफाइल नहीं मिली' : 'No Artisan Portfolios Found'}
                      </h3>
                      <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto leading-relaxed">
                        {language === 'hi'
                          ? 'सभी नकली व डमी प्रोफाइल हटा दी गई हैं। अपनी प्रामाणिक कारीगर प्रोफाइल बनाएं ताकि ग्राहक और व्यवसाय आपको सीधे काम दे सकें।'
                          : 'All mock and unverified placeholder portfolios have been cleared. Register your genuine artisan portfolio with your real craft skills, daily wages, and photos to get hired directly!'}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setEditingKarigar(null);
                        setIsRegisterKarigarOpen(true);
                      }}
                      className="px-6 py-3 bg-[#963E20] hover:bg-[#80341A] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs inline-flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>{language === 'hi' ? 'अपनी प्रोफाइल बनाएं' : 'Create Your Portfolio Now'}</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredKarigars.map((karigar) => {
                      const isOwner = karigar.userId === currentUserId || karigar.phone === (currentUserProfile?.phone || '');
                      return (
                        <KarigarCard
                          key={karigar.id}
                          karigar={karigar}
                          language={language}
                          isOwner={isOwner}
                          onViewProfile={setSelectedKarigarForProfile}
                          onRequestBooking={(k) => setSelectedKarigarForProfile(k)}
                          onEditPortfolio={(k) => {
                            setEditingKarigar(k);
                            setIsRegisterKarigarOpen(true);
                          }}
                          onDeletePortfolio={(id) => handleDeleteKarigar(id)}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {hireServicesTab === 'jobs' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-2xs">
                  <div>
                    <h3 className="font-bold text-stone-900 text-base">Work Requirements & Job Listings</h3>
                    <p className="text-xs text-stone-500">
                      Post an assignment, apply with your custom proposal rate, or manage & accept applicants
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      id="btn-sync-jobs"
                      onClick={async () => {
                        const freshJobs = await supabaseService.fetchJobPosts();
                        if (freshJobs && freshJobs.length > 0) {
                          setJobs(freshJobs);
                          showToast(language === 'hi' ? 'नौकरी प्रस्ताव और आवेदन अपडेट हो गए!' : 'Job listings & proposals synchronized!');
                        } else {
                          showToast(language === 'hi' ? 'डेटाबेस से नवीनतम नौकरियां लोड हुईं' : 'Synchronized with latest database records');
                        }
                      }}
                      className="px-3 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Sync latest job proposals"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>{language === 'hi' ? 'सिंक' : 'Sync'}</span>
                    </button>
                    <button
                      onClick={() => setIsPostJobOpen(true)}
                      className="px-4 py-2.5 rounded-xl bg-[#963E20] hover:bg-[#80341A] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Post Requirement</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {jobs.map((job) => {
                    const isPoster =
                      Boolean(authUser?.id && (job.userId === authUser.id || job.postedByUserId === authUser.id)) ||
                      Boolean(currentUserId && (job.userId === currentUserId || job.postedByUserId === currentUserId)) ||
                      Boolean(currentUserProfile?.id && (job.userId === currentUserProfile.id || job.postedByUserId === currentUserProfile.id)) ||
                      Boolean(currentUserProfile?.phone && job.clientPhone && job.clientPhone.replace(/\D/g, '') === currentUserProfile.phone.replace(/\D/g, ''));

                    const applicants = job.applicants || [];
                    const pendingCount = applicants.filter((a) => a.status === 'pending').length;
                    const acceptedCount = applicants.filter((a) => a.status === 'accepted').length;

                    const myApplication = applicants.find((a) => {
                      if (authUser?.id && a.applicantUserId === authUser.id) return true;
                      if (currentUserId && a.applicantUserId === currentUserId) return true;
                      if (currentUserProfile?.id && a.applicantUserId === currentUserProfile.id) return true;
                      if (currentUserProfile?.phone && a.applicantPhone && a.applicantPhone.replace(/\D/g, '') === currentUserProfile.phone.replace(/\D/g, '')) return true;
                      if (currentUserProfile?.full_name && a.applicantName && a.applicantName.trim().toLowerCase() === currentUserProfile.full_name.trim().toLowerCase()) return true;
                      if (authUser?.user_metadata?.full_name && a.applicantName && a.applicantName.trim().toLowerCase() === authUser.user_metadata.full_name.trim().toLowerCase()) return true;
                      if (authUser?.user_metadata?.name && a.applicantName && a.applicantName.trim().toLowerCase() === authUser.user_metadata.name.trim().toLowerCase()) return true;
                      if (artisanProfile?.name && a.applicantName && a.applicantName.trim().toLowerCase() === artisanProfile.name.trim().toLowerCase()) return true;
                      return false;
                    });

                    return (
                      <div key={job.id} className="bg-white p-5 rounded-2xl border border-stone-200 space-y-3 shadow-2xs flex flex-col justify-between">
                        <div className="space-y-2.5">
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-bold text-stone-900 text-base">{job.title}</h4>
                                {isPoster && (
                                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-extrabold text-[10px] border border-amber-300">
                                    Your Job Post
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-stone-500 mt-0.5">{job.city} • {job.locality}</p>
                            </div>
                            <span className="px-2.5 py-1 rounded-full bg-amber-50 text-[#963E20] font-extrabold text-xs border border-amber-200/80">
                              ₹{job.budgetAmount} {job.budgetType === 'daily' ? '/day' : 'total'}
                            </span>
                          </div>

                          <p className="text-xs text-stone-600 leading-relaxed line-clamp-3">{job.description}</p>

                          {/* Applicant Status Badges */}
                          <div className="flex items-center gap-2 pt-1 flex-wrap">
                            <span className="text-[11px] font-semibold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md">
                              👥 {job.applicantsCount || applicants.length} Applicants
                            </span>
                            {acceptedCount > 0 && (
                              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>{acceptedCount} Hired</span>
                              </span>
                            )}
                            {pendingCount > 0 && (
                              <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                                {pendingCount} Pending Review
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons with Strict Role Permissions */}
                        <div className="pt-3 border-t border-stone-100 flex items-center gap-2">
                          {isPoster ? (
                            // Only Job Poster can view applicants and accept/reject them
                            <button
                              onClick={() => setSelectedJobForApplicants(job)}
                              className="w-full py-2.5 rounded-xl bg-[#963E20] hover:bg-[#80341A] text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                            >
                              <Users className="w-4 h-4" />
                              <span>Manage & Review Applicants ({job.applicantsCount || applicants.length})</span>
                            </button>
                          ) : myApplication ? (
                            // User has already applied: Show their specific proposal status without admin accept/reject buttons
                            <div className="w-full py-2.5 px-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 font-bold text-xs flex items-center justify-between">
                              <span className="flex items-center gap-1.5">
                                {myApplication.status === 'accepted' ? (
                                  <>
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                    <span className="text-emerald-800">🎉 Proposal Accepted & Hired!</span>
                                  </>
                                ) : myApplication.status === 'rejected' ? (
                                  <>
                                    <X className="w-4 h-4 text-rose-500" />
                                    <span className="text-stone-600">Proposal Not Selected</span>
                                  </>
                                ) : (
                                  <>
                                    <Clock className="w-4 h-4 text-amber-600" />
                                    <span>Proposal Submitted (Under Review)</span>
                                  </>
                                )}
                              </span>
                              <span className="text-[10px] text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-md font-semibold">
                                ₹{myApplication.proposedRate}
                              </span>
                            </div>
                          ) : (
                            // User hasn't applied yet: Show Apply button
                            <button
                              onClick={() => setSelectedJobForApply(job)}
                              className="w-full py-2.5 rounded-xl bg-[#963E20] hover:bg-[#80341A] text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                            >
                              <Briefcase className="w-4 h-4" />
                              <span>Apply for Job / प्रस्ताव भेजें</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
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
                currentUserProfile={currentUserProfile}
                authUser={authUser}
                myKarigars={myRegisteredKarigars}
                onUpdateStatus={handleUpdateBookingStatus}
                onRefreshBookings={() => loadAppDataFromSupabase(authUser?.id || '')}
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
          currentUserProfile={currentUserProfile}
          authUser={authUser}
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

      {/* 5. Register / Edit Karigar Portfolio Modal */}
      {isRegisterKarigarOpen && (
        <RegisterKarigarModal
          language={language}
          currentUserProfile={currentUserProfile}
          authUser={authUser}
          existingKarigar={editingKarigar}
          onClose={() => {
            setIsRegisterKarigarOpen(false);
            setEditingKarigar(null);
          }}
          onKarigarRegistered={handleKarigarRegistered}
        />
      )}

      {/* 6. Apply to Job Modal */}
      {selectedJobForApply && (
        <ApplyJobModal
          job={selectedJobForApply}
          language={language}
          currentUserProfile={currentUserProfile}
          authUser={authUser}
          onClose={() => setSelectedJobForApply(null)}
          onSubmitProposal={handleSubmitJobProposal}
        />
      )}

      {/* 7. Manage Job Applicants Modal */}
      {selectedJobForApplicants && (
        <JobApplicantsModal
          job={selectedJobForApplicants}
          language={language}
          onClose={() => setSelectedJobForApplicants(null)}
          onUpdateApplicantStatus={handleUpdateApplicantStatus}
          onRefresh={async () => {
            const freshJobs = await supabaseService.fetchJobPosts();
            if (freshJobs && freshJobs.length > 0) {
              setJobs(freshJobs);
              const refreshedJob = freshJobs.find((j) => j.id === selectedJobForApplicants.id);
              if (refreshedJob) setSelectedJobForApplicants(refreshedJob);
            }
          }}
        />
      )}

    </div>
  );
}
