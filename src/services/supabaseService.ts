import { supabase } from '../supabaseClient';
import {
  ReadyProduct,
  ProductOrder,
  BookingRequest,
  JobPost,
  Karigar,
  UserProfile,
  ArtisanUserProfile,
} from '../types';

/**
 * Normalizes Supabase snake_case product row to camelCase ReadyProduct
 */
export function mapDbToProduct(row: any): ReadyProduct {
  return {
    id: row.id,
    name: row.name,
    hindiName: row.hindi_name || row.name,
    description: row.description || '',
    hindiDescription: row.hindi_description || row.description || '',
    price: Number(row.price),
    originalPrice: row.original_price ? Number(row.original_price) : undefined,
    category: row.category,
    craftType: row.craft_type || 'Handmade',
    artisanId: row.artisan_id || row.user_id || 'artisan',
    artisanName: row.artisan_name || 'Artisan',
    artisanCity: row.artisan_city || 'India',
    artisanAvatar: row.artisan_avatar,
    images: Array.isArray(row.images) && row.images.length > 0 ? row.images : ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=700&auto=format&fit=crop&q=80'],
    aiEnhancedImage: row.ai_enhanced_image || (Array.isArray(row.images) ? row.images[0] : ''),
    status: row.status === 'sold_out' ? 'sold_out' : 'published',
    stock: Number(row.stock) || 1,
    isHandmade: row.is_handmade !== false,
    isVerifiedCraft: row.is_verified_craft !== false,
    materials: Array.isArray(row.materials) ? row.materials : ['Natural Materials'],
    dimensions: row.dimensions || 'Standard',
    weight: row.weight || 'Standard',
    tags: Array.isArray(row.tags) ? row.tags : ['Handmade'],
    rating: Number(row.rating) || 5.0,
    reviewsCount: Number(row.reviews_count) || 0,
    createdAt: row.created_at || new Date().toISOString(),
  };
}

/**
 * Converts camelCase ReadyProduct to Supabase snake_case product row
 */
export function mapProductToDb(product: ReadyProduct, userId?: string) {
  return {
    id: product.id,
    user_id: userId || null,
    name: product.name,
    hindi_name: product.hindiName || product.name,
    description: product.description,
    hindi_description: product.hindiDescription || product.description,
    price: product.price,
    original_price: product.originalPrice || null,
    category: product.category,
    craft_type: product.craftType,
    artisan_id: product.artisanId || userId || 'artisan',
    artisan_name: product.artisanName,
    artisan_city: product.artisanCity,
    artisan_avatar: product.artisanAvatar || null,
    images: product.images,
    ai_enhanced_image: product.aiEnhancedImage || null,
    status: product.status,
    stock: product.stock,
    is_handmade: product.isHandmade,
    is_verified_craft: product.isVerifiedCraft,
    materials: product.materials,
    dimensions: product.dimensions || null,
    weight: product.weight || null,
    tags: product.tags,
    rating: product.rating,
    reviews_count: product.reviewsCount,
    updated_at: new Date().toISOString(),
  };
}

/**
 * Normalizes Supabase snake_case order row to camelCase ProductOrder
 */
export function mapDbToOrder(row: any): ProductOrder {
  return {
    id: row.id,
    orderNumber: row.order_number || row.id.slice(0, 8).toUpperCase(),
    productId: row.product_id || '',
    productName: row.product_name,
    productImage: row.product_image || '',
    artisanId: row.artisan_id,
    artisanName: row.artisan_name || 'Artisan',
    buyerUserId: row.user_id || undefined,
    buyerName: row.buyer_name,
    buyerPhone: row.buyer_phone,
    buyerAddress: row.buyer_address,
    buyerType: row.buyer_type || 'Direct Consumer',
    quantity: Number(row.quantity) || 1,
    unitPrice: Number(row.unit_price) || Number(row.total_amount),
    totalAmount: Number(row.total_amount),
    status: row.status,
    orderedAt: row.ordered_at || row.created_at || new Date().toISOString(),
    estimatedDelivery: row.estimated_delivery || '3-5 Business Days',
    trackingNumber: row.tracking_number || undefined,
    paymentMethod: row.payment_method || 'UPI',
    paymentStatus: row.payment_status || 'paid',
  };
}

/**
 * Converts camelCase ProductOrder to Supabase snake_case order row
 */
export function mapOrderToDb(order: ProductOrder, userId?: string) {
  return {
    id: order.id,
    user_id: order.buyerUserId || userId || null,
    order_number: order.orderNumber,
    product_id: order.productId,
    product_name: order.productName,
    product_image: order.productImage,
    artisan_id: order.artisanId,
    artisan_name: order.artisanName,
    buyer_name: order.buyerName,
    buyer_phone: order.buyerPhone,
    buyer_address: order.buyerAddress,
    buyer_type: order.buyerType,
    quantity: order.quantity,
    unit_price: order.unitPrice,
    total_amount: order.totalAmount,
    status: order.status,
    ordered_at: order.orderedAt,
    estimated_delivery: order.estimatedDelivery,
    tracking_number: order.trackingNumber || null,
    payment_method: order.paymentMethod,
    payment_status: order.paymentStatus,
    updated_at: new Date().toISOString(),
  };
}

/**
 * Normalizes Supabase snake_case booking row to camelCase BookingRequest
 */
export function mapDbToBooking(row: any): BookingRequest {
  return {
    id: row.id,
    karigarId: row.karigar_id,
    karigarName: row.karigar_name,
    karigarTrade: row.karigar_trade,
    clientName: row.client_name,
    clientPhone: row.client_phone,
    clientAddress: row.client_address,
    serviceDate: row.service_date || '',
    jobDescription: row.job_description || '',
    estimatedBudget: Number(row.estimated_budget) || 0,
    status: row.status,
    createdAt: row.created_at || new Date().toISOString(),
  };
}

/**
 * Converts BookingRequest to Supabase snake_case booking row
 */
export function mapBookingToDb(booking: BookingRequest, userId?: string) {
  return {
    id: booking.id,
    user_id: userId || null,
    karigar_id: booking.karigarId,
    karigar_name: booking.karigarName,
    karigar_trade: booking.karigarTrade,
    client_name: booking.clientName,
    client_phone: booking.clientPhone,
    client_address: booking.clientAddress,
    service_date: booking.serviceDate,
    job_description: booking.jobDescription,
    estimated_budget: booking.estimatedBudget,
    status: booking.status,
    updated_at: new Date().toISOString(),
  };
}

/**
 * Normalizes Supabase snake_case job row to camelCase JobPost
 */
export function mapDbToJobPost(row: any): JobPost {
  return {
    id: row.id,
    title: row.title,
    trade: row.trade,
    description: row.description,
    city: row.city,
    locality: row.locality || '',
    budgetType: row.budget_type || 'daily',
    budgetAmount: Number(row.budget_amount) || 0,
    unitLabel: row.unit_label || undefined,
    durationDays: row.duration_days ? Number(row.duration_days) : undefined,
    startDate: row.start_date || '',
    isUrgent: Boolean(row.is_urgent),
    clientName: row.client_name,
    clientPhone: row.client_phone,
    createdAt: row.created_at || new Date().toISOString(),
    applicantsCount: Number(row.applicants_count) || 0,
    status: row.status || 'open',
  };
}

/**
 * Converts JobPost to Supabase snake_case job row
 */
export function mapJobPostToDb(job: JobPost, userId?: string) {
  return {
    id: job.id,
    user_id: userId || null,
    title: job.title,
    trade: job.trade,
    description: job.description,
    city: job.city,
    locality: job.locality,
    budget_type: job.budgetType,
    budget_amount: job.budgetAmount,
    unit_label: job.unitLabel || null,
    duration_days: job.durationDays || null,
    start_date: job.startDate,
    is_urgent: job.isUrgent,
    client_name: job.clientName,
    client_phone: job.clientPhone,
    applicants_count: job.applicantsCount,
    status: job.status,
    updated_at: new Date().toISOString(),
  };
}

/**
 * Normalizes Supabase snake_case karigar row to camelCase Karigar
 */
export function mapDbToKarigar(row: any): Karigar {
  return {
    id: row.id,
    name: row.name,
    hindiName: row.hindi_name || row.name,
    trade: row.trade,
    specialization: row.specialization,
    hindiSpecialization: row.hindi_specialization || row.specialization,
    experienceYears: Number(row.experience_years) || 1,
    city: row.city,
    locality: row.locality || '',
    dailyRate: Number(row.daily_rate) || 600,
    hourlyRate: row.hourly_rate ? Number(row.hourly_rate) : undefined,
    unitRateLabel: row.unit_rate_label || `₹${row.daily_rate || 600}/day`,
    rating: Number(row.rating) || 5.0,
    totalReviews: Number(row.total_reviews) || 0,
    phone: row.phone || '',
    whatsapp: row.whatsapp || '',
    avatarUrl: row.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    portfolioImages: Array.isArray(row.portfolio_images) ? row.portfolio_images : [],
    isAadhaarVerified: Boolean(row.is_aadhaar_verified),
    isSkillCertified: Boolean(row.is_skill_certified),
    certificationBody: row.certification_body || undefined,
    isAvailableToday: row.is_available_today !== false,
    languages: Array.isArray(row.languages) ? row.languages : ['Hindi', 'English'],
    bio: row.bio || '',
    hindiBio: row.hindi_bio || row.bio || '',
    completedJobsCount: Number(row.completed_jobs_count) || 0,
    skills: Array.isArray(row.skills) ? row.skills : [],
    reviews: Array.isArray(row.reviews) ? row.reviews : [],
  };
}

/**
 * Converts Karigar to Supabase snake_case karigar row
 */
export function mapKarigarToDb(karigar: Karigar, userId?: string) {
  return {
    id: karigar.id,
    user_id: userId || null,
    name: karigar.name,
    hindi_name: karigar.hindiName || karigar.name,
    trade: karigar.trade,
    specialization: karigar.specialization,
    hindi_specialization: karigar.hindiSpecialization || karigar.specialization,
    experience_years: karigar.experienceYears,
    city: karigar.city,
    locality: karigar.locality,
    daily_rate: karigar.dailyRate,
    hourly_rate: karigar.hourlyRate || null,
    unit_rate_label: karigar.unitRateLabel || null,
    rating: karigar.rating,
    total_reviews: karigar.totalReviews,
    phone: karigar.phone,
    whatsapp: karigar.whatsapp,
    avatar_url: karigar.avatarUrl,
    portfolio_images: karigar.portfolioImages,
    is_aadhaar_verified: karigar.isAadhaarVerified,
    is_skill_certified: karigar.isSkillCertified,
    certification_body: karigar.certificationBody || null,
    is_available_today: karigar.isAvailableToday,
    languages: karigar.languages,
    bio: karigar.bio,
    hindi_bio: karigar.hindiBio,
    completed_jobs_count: karigar.completedJobsCount,
    skills: karigar.skills,
    reviews: karigar.reviews,
    updated_at: new Date().toISOString(),
  };
}

// ============================================================================
// SUPABASE DATA API SERVICE
// ============================================================================

export const supabaseService = {
  // --------------------------------------------------------------------------
  // PRODUCTS
  // --------------------------------------------------------------------------
  async fetchProducts(): Promise<ReadyProduct[] | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase fetchProducts notice:', error.message);
        return null;
      }
      if (data && data.length > 0) {
        return data.map(mapDbToProduct);
      }
      return null;
    } catch (e) {
      console.warn('Supabase fetchProducts error:', e);
      return null;
    }
  },

  async createProduct(product: ReadyProduct, userId?: string): Promise<boolean> {
    try {
      const payload = mapProductToDb(product, userId);
      const { error } = await supabase.from('products').upsert(payload, { onConflict: 'id' });
      if (error) {
        console.warn('Supabase createProduct failed:', error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.warn('Supabase createProduct error:', e);
      return false;
    }
  },

  async updateProduct(product: ReadyProduct, userId?: string): Promise<boolean> {
    try {
      const payload = mapProductToDb(product, userId);
      const { error } = await supabase
        .from('products')
        .update(payload)
        .eq('id', product.id);
      if (error) {
        console.warn('Supabase updateProduct failed:', error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.warn('Supabase updateProduct error:', e);
      return false;
    }
  },

  async updateProductStock(productId: string, newStock: number, newStatus: 'published' | 'sold_out'): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('products')
        .update({
          stock: newStock,
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', productId);
      if (error) {
        console.warn('Supabase updateProductStock failed:', error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.warn('Supabase updateProductStock error:', e);
      return false;
    }
  },

  async deleteProduct(productId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);
      if (error) {
        console.warn('Supabase deleteProduct failed:', error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.warn('Supabase deleteProduct error:', e);
      return false;
    }
  },

  // --------------------------------------------------------------------------
  // ORDERS
  // --------------------------------------------------------------------------
  async fetchOrders(userId?: string): Promise<ProductOrder[] | null> {
    try {
      let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
      
      const { data, error } = await query;
      if (error) {
        console.warn('Supabase fetchOrders notice:', error.message);
        return null;
      }
      if (data && data.length > 0) {
        return data.map(mapDbToOrder);
      }
      return null;
    } catch (e) {
      console.warn('Supabase fetchOrders error:', e);
      return null;
    }
  },

  async createOrder(order: ProductOrder, userId?: string): Promise<boolean> {
    try {
      const payload = mapOrderToDb(order, userId);
      const { error } = await supabase.from('orders').upsert(payload, { onConflict: 'id' });
      if (error) {
        console.warn('Supabase createOrder failed:', error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.warn('Supabase createOrder error:', e);
      return false;
    }
  },

  async updateOrderStatus(orderId: string, status: ProductOrder['status']): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId);
      if (error) {
        console.warn('Supabase updateOrderStatus failed:', error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.warn('Supabase updateOrderStatus error:', e);
      return false;
    }
  },

  // --------------------------------------------------------------------------
  // BOOKINGS
  // --------------------------------------------------------------------------
  async fetchBookings(): Promise<BookingRequest[] | null> {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase fetchBookings notice:', error.message);
        return null;
      }
      if (data && data.length > 0) {
        return data.map(mapDbToBooking);
      }
      return null;
    } catch (e) {
      console.warn('Supabase fetchBookings error:', e);
      return null;
    }
  },

  async createBooking(booking: BookingRequest, userId?: string): Promise<boolean> {
    try {
      const payload = mapBookingToDb(booking, userId);
      const { error } = await supabase.from('bookings').upsert(payload, { onConflict: 'id' });
      if (error) {
        console.warn('Supabase createBooking failed:', error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.warn('Supabase createBooking error:', e);
      return false;
    }
  },

  async updateBookingStatus(bookingId: string, status: BookingRequest['status']): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', bookingId);
      if (error) {
        console.warn('Supabase updateBookingStatus failed:', error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.warn('Supabase updateBookingStatus error:', e);
      return false;
    }
  },

  // --------------------------------------------------------------------------
  // JOB POSTS
  // --------------------------------------------------------------------------
  async fetchJobPosts(): Promise<JobPost[] | null> {
    try {
      const { data, error } = await supabase
        .from('job_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase fetchJobPosts notice:', error.message);
        return null;
      }
      if (data && data.length > 0) {
        return data.map(mapDbToJobPost);
      }
      return null;
    } catch (e) {
      console.warn('Supabase fetchJobPosts error:', e);
      return null;
    }
  },

  async createJobPost(job: JobPost, userId?: string): Promise<boolean> {
    try {
      const payload = mapJobPostToDb(job, userId);
      const { error } = await supabase.from('job_posts').upsert(payload, { onConflict: 'id' });
      if (error) {
        console.warn('Supabase createJobPost failed:', error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.warn('Supabase createJobPost error:', e);
      return false;
    }
  },

  async incrementJobApplicants(jobId: string, currentCount: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('job_posts')
        .update({ applicants_count: currentCount + 1, updated_at: new Date().toISOString() })
        .eq('id', jobId);
      if (error) {
        console.warn('Supabase incrementJobApplicants failed:', error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.warn('Supabase incrementJobApplicants error:', e);
      return false;
    }
  },

  // --------------------------------------------------------------------------
  // KARIGARS (ARTISAN DIRECTORY)
  // --------------------------------------------------------------------------
  async fetchKarigars(): Promise<Karigar[] | null> {
    try {
      const { data, error } = await supabase
        .from('karigars')
        .select('*')
        .order('rating', { ascending: false });

      if (error) {
        console.warn('Supabase fetchKarigars notice:', error.message);
        return null;
      }
      if (data && data.length > 0) {
        return data.map(mapDbToKarigar);
      }
      return null;
    } catch (e) {
      console.warn('Supabase fetchKarigars error:', e);
      return null;
    }
  },

  async registerKarigar(karigar: Karigar, userId?: string): Promise<boolean> {
    try {
      const payload = mapKarigarToDb(karigar, userId);
      const { error } = await supabase.from('karigars').upsert(payload, { onConflict: 'id' });
      if (error) {
        console.warn('Supabase registerKarigar failed:', error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.warn('Supabase registerKarigar error:', e);
      return false;
    }
  },

  // --------------------------------------------------------------------------
  // USER PROFILES
  // --------------------------------------------------------------------------
  async updateUserProfile(userId: string, data: Partial<UserProfile>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) {
        console.warn('Supabase updateUserProfile failed:', error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.warn('Supabase updateUserProfile error:', e);
      return false;
    }
  },
};
