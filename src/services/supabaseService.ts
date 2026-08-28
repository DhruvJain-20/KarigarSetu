import { supabase } from '../supabaseClient';
import {
  ReadyProduct,
  ProductOrder,
  BookingRequest,
  JobPost,
  JobApplicant,
  Karigar,
  UserProfile,
  ArtisanUserProfile,
} from '../types';

/**
 * Normalizes Supabase snake_case product row to camelCase ReadyProduct
 */
export function mapDbToProduct(row: any): ReadyProduct {
  let cleanDesc = row.description || '';
  let meta: any = {};

  if (typeof row.description === 'string') {
    const match = row.description.match(/<!--PRODUCT_METADATA:([\s\S]*?)-->/);
    if (match) {
      try {
        meta = JSON.parse(match[1]) || {};
      } catch (e) {
        // ignore parse error
      }
    }
  }
  cleanDesc = cleanDesc.replace(/<!--PRODUCT_METADATA:[\s\S]*?-->/g, '').trim();

  return {
    id: row.id,
    name: row.name,
    hindiName: row.hindi_name || row.name,
    description: cleanDesc,
    hindiDescription: row.hindi_description || cleanDesc || '',
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
    reviews: Array.isArray(row.reviews) ? row.reviews : (Array.isArray(meta.reviews) ? meta.reviews : undefined),
    rawMaterialCost: row.raw_material_cost != null ? Number(row.raw_material_cost) : (meta.rawMaterialCost ?? undefined),
    labourHours: row.labour_hours != null ? Number(row.labour_hours) : (meta.labourHours ?? undefined),
    labourRate: row.labour_rate != null ? Number(row.labour_rate) : (meta.labourRate ?? undefined),
    labourCost: row.labour_cost != null ? Number(row.labour_cost) : (meta.labourCost ?? undefined),
    packagingCost: row.packaging_cost != null ? Number(row.packaging_cost) : (meta.packagingCost ?? undefined),
    transportCost: row.transport_cost != null ? Number(row.transport_cost) : (meta.transportCost ?? undefined),
    otherCost: row.other_cost != null ? Number(row.other_cost) : (meta.otherCost ?? undefined),
    productionCost: row.production_cost != null ? Number(row.production_cost) : (meta.productionCost ?? undefined),
    profitMargin: row.profit_margin != null ? Number(row.profit_margin) : (meta.profitMargin ?? undefined),
    recommendedPrice: row.recommended_price != null ? Number(row.recommended_price) : (meta.recommendedPrice ?? undefined),
    finalSelectedPrice: row.final_selected_price != null ? Number(row.final_selected_price) : (meta.finalSelectedPrice ?? Number(row.price)),
    craftComplexity: row.craft_complexity || meta.craftComplexity || undefined,
    origin: row.origin || meta.origin || undefined,
    culturalSignificance: row.cultural_significance || meta.culturalSignificance || undefined,
    makingTime: row.making_time || meta.makingTime || undefined,
    createdAt: row.created_at || new Date().toISOString(),
  };
}

/**
 * Converts camelCase ReadyProduct to Supabase snake_case product row
 */
export function mapProductToDb(product: ReadyProduct, userId?: string) {
  const isValidUuid = typeof userId === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
  const dbUserId = isValidUuid ? userId : null;

  const metaObj = {
    rawMaterialCost: product.rawMaterialCost,
    labourHours: product.labourHours,
    labourRate: product.labourRate,
    labourCost: product.labourCost,
    packagingCost: product.packagingCost,
    transportCost: product.transportCost,
    otherCost: product.otherCost,
    productionCost: product.productionCost,
    profitMargin: product.profitMargin,
    recommendedPrice: product.recommendedPrice,
    finalSelectedPrice: product.finalSelectedPrice,
    craftComplexity: product.craftComplexity,
    origin: product.origin,
    culturalSignificance: product.culturalSignificance,
    makingTime: product.makingTime,
    reviews: product.reviews,
  };

  const cleanDescription = (product.description || '').replace(/<!--PRODUCT_METADATA:[\s\S]*?-->/g, '').trim();
  const descWithMeta = `${cleanDescription}\n\n<!--PRODUCT_METADATA:${JSON.stringify(metaObj)}-->`;

  return {
    id: product.id,
    user_id: dbUserId,
    name: product.name,
    hindi_name: product.hindiName || product.name,
    description: descWithMeta,
    hindi_description: product.hindiDescription || product.description,
    price: product.price,
    original_price: product.originalPrice || null,
    category: product.category,
    craft_type: product.craftType || 'Handmade Craft',
    artisan_id: product.artisanId || (dbUserId ? dbUserId : 'artisan'),
    artisan_name: product.artisanName || 'Artisan',
    artisan_city: product.artisanCity || 'India',
    artisan_avatar: product.artisanAvatar || null,
    images: Array.isArray(product.images) && product.images.length > 0 ? product.images : ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=700&auto=format&fit=crop&q=80'],
    ai_enhanced_image: product.aiEnhancedImage || null,
    status: product.status || 'published',
    stock: typeof product.stock === 'number' ? product.stock : 1,
    is_handmade: product.isHandmade !== false,
    is_verified_craft: product.isVerifiedCraft !== false,
    materials: Array.isArray(product.materials) ? product.materials : ['Natural Materials'],
    dimensions: product.dimensions || null,
    weight: product.weight || null,
    tags: Array.isArray(product.tags) ? product.tags : ['Handmade'],
    rating: product.rating || 5.0,
    reviews_count: product.reviewsCount || 0,
    raw_material_cost: product.rawMaterialCost ?? null,
    labour_hours: product.labourHours ?? null,
    labour_rate: product.labourRate ?? null,
    labour_cost: product.labourCost ?? null,
    packaging_cost: product.packagingCost ?? null,
    transport_cost: product.transportCost ?? null,
    other_cost: product.otherCost ?? null,
    production_cost: product.productionCost ?? null,
    profit_margin: product.profitMargin ?? null,
    recommended_price: product.recommendedPrice ?? null,
    final_selected_price: product.finalSelectedPrice ?? product.price,
    craft_complexity: product.craftComplexity ?? null,
    origin: product.origin ?? null,
    cultural_significance: product.culturalSignificance ?? null,
    making_time: product.makingTime ?? null,
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
    clientUserId: row.user_id || row.client_user_id || undefined,
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
    user_id: booking.clientUserId || userId || null,
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
  let parsedApplicants: JobApplicant[] = [];
  let cleanDescription = row.description || '';

  // 1. Check if applicants are encoded in description metadata envelope (which holds freshest status updates)
  if (typeof row.description === 'string') {
    const match = row.description.match(/<!--APPLICANTS_DATA:([\s\S]*?)-->/);
    if (match) {
      try {
        const descApplicants = JSON.parse(match[1]);
        if (Array.isArray(descApplicants) && descApplicants.length > 0) {
          parsedApplicants = descApplicants;
        }
      } catch (e) {
        console.warn('Error parsing applicants from description:', e);
      }
    }
  }

  // 2. Fallback to applicants column if not found in description
  if (parsedApplicants.length === 0) {
    if (Array.isArray(row.applicants) && row.applicants.length > 0) {
      parsedApplicants = row.applicants;
    } else if (typeof row.applicants === 'string' && row.applicants.trim() !== '' && row.applicants.trim() !== '[]') {
      try {
        const jsonApps = JSON.parse(row.applicants);
        if (Array.isArray(jsonApps)) parsedApplicants = jsonApps;
      } catch {
        parsedApplicants = [];
      }
    }
  }

  // Strip metadata envelope from human description
  cleanDescription = cleanDescription.replace(/<!--APPLICANTS_DATA:[\s\S]*?-->/g, '').trim();

  return {
    id: row.id,
    userId: row.user_id || undefined,
    postedByUserId: row.user_id || undefined,
    posterName: row.client_name,
    posterPhone: row.client_phone,
    title: row.title,
    trade: row.trade,
    description: cleanDescription,
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
    applicantsCount: parsedApplicants.length > 0 ? parsedApplicants.length : (Number(row.applicants_count) || 0),
    applicants: parsedApplicants,
    status: row.status || 'open',
  };
}

/**
 * Converts JobPost to Supabase snake_case job row
 */
export function mapJobPostToDb(job: JobPost, userId?: string) {
  const applicantsList = Array.isArray(job.applicants) ? job.applicants : [];
  const cleanDesc = (job.description || '').replace(/<!--APPLICANTS_DATA:[\s\S]*?-->/g, '').trim();
  const descWithApplicants = applicantsList.length > 0
    ? `${cleanDesc}\n\n<!--APPLICANTS_DATA:${JSON.stringify(applicantsList)}-->`
    : cleanDesc;

  return {
    id: job.id,
    user_id: job.userId || job.postedByUserId || userId || null,
    title: job.title,
    trade: job.trade,
    description: descWithApplicants,
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
    applicants_count: applicantsList.length || job.applicantsCount || 0,
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
    userId: row.user_id || undefined,
    isUserCreated: true,
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
    user_id: karigar.userId || userId || null,
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
      
      // Attempt 1: Full payload upsert
      const { error: err1 } = await supabase.from('products').upsert(payload, { onConflict: 'id' });
      if (!err1) return true;

      console.warn('Supabase createProduct full payload notice:', err1.message);

      // Attempt 2: Fallback to core columns in case remote table schema lacks custom columns
      const corePayload = {
        id: payload.id,
        user_id: payload.user_id,
        name: payload.name,
        hindi_name: payload.hindi_name,
        description: payload.description,
        hindi_description: payload.hindi_description,
        price: payload.price,
        original_price: payload.original_price,
        category: payload.category,
        craft_type: payload.craft_type,
        artisan_id: payload.artisan_id,
        artisan_name: payload.artisan_name,
        artisan_city: payload.artisan_city,
        artisan_avatar: payload.artisan_avatar,
        images: payload.images,
        ai_enhanced_image: payload.ai_enhanced_image,
        status: payload.status,
        stock: payload.stock,
        is_handmade: payload.is_handmade,
        is_verified_craft: payload.is_verified_craft,
        materials: payload.materials,
        dimensions: payload.dimensions,
        weight: payload.weight,
        tags: payload.tags,
        rating: payload.rating,
        reviews_count: payload.reviews_count,
        updated_at: payload.updated_at,
      };

      const { error: err2 } = await supabase.from('products').upsert(corePayload, { onConflict: 'id' });
      if (!err2) return true;

      console.warn('Supabase createProduct core payload notice:', err2.message);

      // Attempt 3: If user_id caused foreign key or RLS conflict, retry with user_id: null
      if (corePayload.user_id) {
        const anonymousPayload = { ...corePayload, user_id: null };
        const { error: err3 } = await supabase.from('products').upsert(anonymousPayload, { onConflict: 'id' });
        if (!err3) return true;
        console.warn('Supabase createProduct anonymous fallback notice:', err3.message);
      }

      return false;
    } catch (e) {
      console.warn('Supabase createProduct error:', e);
      return false;
    }
  },

  async updateProduct(product: ReadyProduct, userId?: string): Promise<boolean> {
    try {
      const payload = mapProductToDb(product, userId);
      const { error: err1 } = await supabase
        .from('products')
        .update(payload)
        .eq('id', product.id);
      if (!err1) return true;

      console.warn('Supabase updateProduct full payload notice:', err1.message);

      // Fallback to core columns
      const corePayload = {
        name: payload.name,
        hindi_name: payload.hindi_name,
        description: payload.description,
        hindi_description: payload.hindi_description,
        price: payload.price,
        original_price: payload.original_price,
        category: payload.category,
        craft_type: payload.craft_type,
        artisan_name: payload.artisan_name,
        artisan_city: payload.artisan_city,
        artisan_avatar: payload.artisan_avatar,
        images: payload.images,
        ai_enhanced_image: payload.ai_enhanced_image,
        status: payload.status,
        stock: payload.stock,
        is_handmade: payload.is_handmade,
        is_verified_craft: payload.is_verified_craft,
        materials: payload.materials,
        dimensions: payload.dimensions,
        weight: payload.weight,
        tags: payload.tags,
        rating: payload.rating,
        reviews_count: payload.reviews_count,
        updated_at: payload.updated_at,
      };

      const { error: err2 } = await supabase
        .from('products')
        .update(corePayload)
        .eq('id', product.id);
      if (!err2) return true;

      return false;
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
      const bookingMap = new Map<string, BookingRequest>();

      // 1. Fetch from bookings table
      const { data: dbBookings } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (dbBookings && dbBookings.length > 0) {
        for (const row of dbBookings) {
          const b = mapDbToBooking(row);
          if (b && b.id) {
            bookingMap.set(b.id, b);
          }
        }
      }

      // 2. Also aggregate direct portfolio inquiries stored on karigars table
      const { data: kgs } = await supabase.from('karigars').select('*');
      if (kgs && kgs.length > 0) {
        for (const kg of kgs) {
          if (Array.isArray(kg.reviews)) {
            for (const item of kg.reviews) {
              if (item && item.type === 'inquiry' && item.id) {
                const existing = bookingMap.get(item.id);
                // Prefer non-pending status if available (e.g. accepted, in_progress, completed, cancelled)
                let resolvedStatus = item.status || 'pending';
                if (existing) {
                  if (existing.status && existing.status !== 'pending') {
                    resolvedStatus = existing.status;
                  } else if (item.status && item.status !== 'pending') {
                    resolvedStatus = item.status;
                  }
                }

                const merged: BookingRequest = {
                  id: item.id,
                  karigarId: item.karigarId || kg.id,
                  karigarName: item.karigarName || kg.name,
                  karigarTrade: item.karigarTrade || kg.trade,
                  karigarPhone: item.karigarPhone || kg.phone || existing?.karigarPhone || '',
                  clientUserId: item.clientUserId || existing?.clientUserId || undefined,
                  clientName: item.clientName || existing?.clientName || 'Client',
                  clientPhone: item.clientPhone || existing?.clientPhone || '',
                  clientAddress: item.clientAddress || existing?.clientAddress || '',
                  serviceDate: item.serviceDate || existing?.serviceDate || '',
                  jobDescription: item.jobDescription || existing?.jobDescription || '',
                  estimatedBudget: Number(item.estimatedBudget) || existing?.estimatedBudget || 0,
                  status: resolvedStatus,
                  createdAt: item.createdAt || existing?.createdAt || new Date().toISOString(),
                };
                bookingMap.set(item.id, merged);
              }
            }
          }
        }
      }

      const list = Array.from(bookingMap.values());
      if (list.length > 0) {
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        return list;
      }
      return null;
    } catch (e) {
      console.warn('Supabase fetchBookings error:', e);
      return null;
    }
  },

  async createBooking(booking: BookingRequest, userId?: string): Promise<boolean> {
    try {
      // 1. Save to bookings table (without forcing userId to avoid RLS block on anon client)
      const payload = mapBookingToDb(booking, null);
      await supabase.from('bookings').upsert(payload, { onConflict: 'id' });

      // 2. Also attach direct inquiry to the target Karigar's record in Supabase
      if (booking.karigarId) {
        const { data: kg } = await supabase
          .from('karigars')
          .select('*')
          .eq('id', booking.karigarId)
          .maybeSingle();

        if (kg) {
          const existingReviews = Array.isArray(kg.reviews) ? kg.reviews : [];
          const inquiryItem = {
            id: booking.id,
            type: 'inquiry',
            clientUserId: booking.clientUserId || userId,
            clientName: booking.clientName,
            clientPhone: booking.clientPhone,
            clientAddress: booking.clientAddress,
            serviceDate: booking.serviceDate,
            jobDescription: booking.jobDescription,
            estimatedBudget: booking.estimatedBudget,
            karigarId: booking.karigarId,
            karigarName: booking.karigarName,
            karigarTrade: booking.karigarTrade,
            karigarPhone: booking.karigarPhone || kg.phone || '',
            status: booking.status,
            createdAt: booking.createdAt,
          };
          const filtered = existingReviews.filter((r: any) => r.id !== booking.id);
          await supabase
            .from('karigars')
            .update({
              reviews: [inquiryItem, ...filtered],
              updated_at: new Date().toISOString(),
            })
            .eq('id', kg.id);
        }
      }
      return true;
    } catch (e) {
      console.warn('Supabase createBooking error:', e);
      return false;
    }
  },

  async updateBookingStatus(bookingId: string, status: BookingRequest['status']): Promise<boolean> {
    try {
      // 1. Update in bookings table
      const { error: bErr } = await supabase
        .from('bookings')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', bookingId);

      if (bErr) {
        console.warn('Supabase updateBookingStatus bookings notice:', bErr.message);
      }

      // 2. Also update on karigars table if attached in reviews
      const { data: kgs } = await supabase.from('karigars').select('*');
      if (kgs) {
        for (const kg of kgs) {
          if (Array.isArray(kg.reviews)) {
            let hasMatch = false;
            const updatedReviews = kg.reviews.map((r: any) => {
              if (r && r.id === bookingId) {
                hasMatch = true;
                return { ...r, status, updatedAt: new Date().toISOString() };
              }
              return r;
            });
            if (hasMatch) {
              await supabase
                .from('karigars')
                .update({ reviews: updatedReviews, updated_at: new Date().toISOString() })
                .eq('id', kg.id);
            }
          }
        }
      }
      return true;
    } catch (e) {
      console.warn('Supabase updateBookingStatus error:', e);
      return false;
    }
  },

  async deleteBooking(bookingId: string): Promise<boolean> {
    try {
      // 1. Delete from bookings table
      await supabase.from('bookings').delete().eq('id', bookingId);

      // 2. Delete from karigars table reviews
      const { data: kgs } = await supabase.from('karigars').select('*');
      if (kgs) {
        for (const kg of kgs) {
          if (Array.isArray(kg.reviews)) {
            const filtered = kg.reviews.filter((r: any) => r.id !== bookingId);
            if (filtered.length !== kg.reviews.length) {
              await supabase
                .from('karigars')
                .update({ reviews: filtered, updated_at: new Date().toISOString() })
                .eq('id', kg.id);
            }
          }
        }
      }
      return true;
    } catch (e) {
      console.warn('Supabase deleteBooking error:', e);
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

  async updateJobApplicants(
    jobId: string,
    applicants: JobApplicant[],
    fallbackDescription?: string,
    fullJob?: JobPost
  ): Promise<boolean> {
    try {
      // 1. Fetch current job record or fallback
      let cleanDesc = (fallbackDescription || (fullJob ? fullJob.description : '') || '').replace(/<!--APPLICANTS_DATA:[\s\S]*?-->/g, '').trim();

      const { data: jobRow, error: fetchErr } = await supabase
        .from('job_posts')
        .select('*')
        .eq('id', jobId)
        .maybeSingle();

      if (jobRow && jobRow.description) {
        cleanDesc = (jobRow.description || '').replace(/<!--APPLICANTS_DATA:[\s\S]*?-->/g, '').trim();
      }

      const encodedDesc = applicants.length > 0
        ? `${cleanDesc}\n\n<!--APPLICANTS_DATA:${JSON.stringify(applicants)}-->`
        : cleanDesc;

      if (jobRow) {
        // Try updating description with encoded applicants & count
        const { error: err1 } = await supabase
          .from('job_posts')
          .update({
            description: encodedDesc,
            applicants_count: applicants.length,
            updated_at: new Date().toISOString(),
          })
          .eq('id', jobId);

        if (err1) {
          console.warn('Supabase updateJobApplicants description notice:', err1.message);
        }

        // Also attempt direct column update if table has applicants column
        try {
          await supabase
            .from('job_posts')
            .update({
              applicants: applicants,
              applicants_count: applicants.length,
              updated_at: new Date().toISOString(),
            })
            .eq('id', jobId);
        } catch {
          // column may not exist in standard schema
        }
      } else if (fullJob) {
        // Row not in Supabase yet - upsert entire job post
        const payload = mapJobPostToDb({
          ...fullJob,
          applicants,
          description: cleanDesc,
        }, fullJob.userId || fullJob.postedByUserId);
        await supabase.from('job_posts').upsert(payload, { onConflict: 'id' });
      }

      return true;
    } catch (e) {
      console.warn('Supabase updateJobApplicants error:', e);
      return false;
    }
  },

  async deleteJobPost(jobId: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('job_posts').delete().eq('id', jobId);
      if (error) {
        console.warn('Supabase deleteJobPost failed:', error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.warn('Supabase deleteJobPost error:', e);
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
