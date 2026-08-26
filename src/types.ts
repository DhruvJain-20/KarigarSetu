export type Language = 'en' | 'hi';

export type UserRole = 'artisan' | 'buyer' | 'admin';

export interface UserProfile {
  id: string; // Real Supabase Auth UUID
  full_name: string;
  email: string;
  role: UserRole;
  language?: Language;
  avatar_url?: string;
  created_at?: string;
  specialization?: string;
  phone?: string;
  city?: string;
  state?: string;
  business_name?: string;
  workshop_address?: string;
  upi_id?: string;
}

export type TradeCategory =
  | 'carpentry'
  | 'electrical'
  | 'plumbing'
  | 'masonry'
  | 'painting'
  | 'handloom'
  | 'pottery'
  | 'metalwork'
  | 'tailoring'
  | 'stonecraft';

export interface Karigar {
  id: string;
  name: string;
  hindiName: string;
  trade: TradeCategory;
  specialization: string;
  hindiSpecialization: string;
  experienceYears: number;
  city: string;
  locality: string;
  dailyRate: number; // in INR
  hourlyRate?: number;
  unitRateLabel?: string; // e.g. "₹45/sq.ft", "₹850/day", "₹120/point"
  rating: number;
  totalReviews: number;
  phone: string;
  whatsapp: string;
  avatarUrl: string;
  portfolioImages: string[];
  isAadhaarVerified: boolean;
  isSkillCertified: boolean;
  certificationBody?: string;
  isAvailableToday: boolean;
  languages: string[];
  bio: string;
  hindiBio: string;
  completedJobsCount: number;
  skills: string[];
  reviews: {
    id: string;
    author: string;
    city: string;
    rating: number;
    date: string;
    comment: string;
  }[];
}

export interface JobPost {
  id: string;
  title: string;
  trade: TradeCategory;
  description: string;
  city: string;
  locality: string;
  budgetType: 'daily' | 'fixed' | 'per_unit';
  budgetAmount: number;
  unitLabel?: string;
  durationDays?: number;
  startDate: string;
  isUrgent: boolean;
  clientName: string;
  clientPhone: string;
  createdAt: string;
  applicantsCount: number;
  status: 'open' | 'in_progress' | 'completed';
}

export interface BookingRequest {
  id: string;
  karigarId: string;
  karigarName: string;
  karigarTrade: TradeCategory;
  clientName: string;
  clientPhone: string;
  clientAddress: string;
  serviceDate: string;
  jobDescription: string;
  estimatedBudget: number;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface ReadyProduct {
  id: string;
  name: string;
  hindiName: string;
  description: string;
  hindiDescription?: string;
  price: number;
  originalPrice?: number;
  category: string;
  craftType: string;
  artisanId: string;
  artisanName: string;
  artisanCity: string;
  artisanAvatar?: string;
  images: string[];
  aiEnhancedImage?: string;
  status: 'published' | 'draft' | 'sold_out';
  stock: number;
  isHandmade: boolean;
  isVerifiedCraft: boolean;
  materials: string[];
  dimensions?: string;
  weight?: string;
  tags: string[];
  rating: number;
  reviewsCount: number;
  createdAt: string;
}

export interface ProductOrder {
  id: string;
  orderNumber: string;
  productId: string;
  productName: string;
  productImage: string;
  artisanId: string;
  artisanName: string;
  buyerName: string;
  buyerPhone: string;
  buyerAddress: string;
  buyerType?: 'Direct Consumer' | 'Retailer/Boutique' | 'Wholesale';
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  status: 'new' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  orderedAt: string;
  estimatedDelivery: string;
  trackingNumber?: string;
  paymentMethod: 'UPI' | 'Cash on Delivery' | 'Card';
  paymentStatus: 'paid' | 'pending';
}

export interface ArtisanUserProfile {
  id: string;
  name: string;
  hindiName: string;
  specialization: string;
  hindiSpecialization: string;
  verifiedBadge: string;
  avatarUrl: string;
  salesTotal: number;
  productsListedCount: number;
  rating: number;
  activeOrdersCount: number;
  businessDetails: {
    businessName: string;
    workshopAddress: string;
    city: string;
    state: string;
    experienceYears: number;
    certification: string;
    udyamRegNo: string;
    phone: string;
    email: string;
    aboutStory: string;
  };
  bankDetails: {
    upiId: string;
    bankName: string;
    accountHolder: string;
    accountNumber: string;
    ifscCode: string;
    payoutSchedule: string;
  };
}

