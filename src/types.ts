export type Language = 'en' | 'hi';

export type UserRole = 'artisan' | 'buyer' | 'admin';

export interface UserProfile {
  id: string; // Real Supabase Auth UUID
  full_name: string;
  name?: string;
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
  udyam_reg_no?: string;
  about_story?: string;
  upi_id?: string;
  bank_name?: string;
  account_number?: string;
  account_holder?: string;
  ifsc_code?: string;
}

export type TradeCategory =
  | 'handloom'
  | 'pottery'
  | 'artist'
  | 'metalwork'
  | 'tailoring'
  | 'stonecraft'
  | 'leathercraft';

export interface ProductReview {
  id: string;
  orderId?: string;
  buyerName?: string;
  buyerAvatar?: string;
  author?: string;
  city?: string;
  date?: string;
  rating: number;
  comment: string;
  createdAt?: string;
  isVerifiedPurchase?: boolean;
  verifiedBuyer?: boolean;
}

export interface JobApplicant {
  id: string;
  jobId: string;
  applicantUserId?: string;
  applicantName: string;
  applicantPhone: string;
  applicantTrade?: TradeCategory;
  proposedRate: number;
  rateType: 'daily' | 'fixed';
  proposalMessage: string;
  experienceYears?: number;
  applicantAvatar?: string;
  status: 'pending' | 'accepted' | 'rejected';
  appliedAt: string;
}

export interface Karigar {
  id: string;
  userId?: string;
  isUserCreated?: boolean;
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
  postedByUserId?: string;
  userId?: string;
  posterName?: string;
  posterPhone?: string;
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
  applicants?: JobApplicant[];
  status: 'open' | 'in_progress' | 'completed';
}

export interface BookingRequest {
  id: string;
  karigarId: string;
  karigarName: string;
  karigarTrade: TradeCategory;
  karigarPhone?: string;
  clientUserId?: string;
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
  status: 'published' | 'sold_out';
  stock: number;
  isHandmade: boolean;
  isVerifiedCraft: boolean;
  materials: string[];
  dimensions?: string;
  weight?: string;
  tags: string[];
  rating: number;
  reviewsCount: number;
  reviews?: ProductReview[];
  rawMaterialCost?: number;
  labourHours?: number;
  labourRate?: number;
  labourCost?: number;
  packagingCost?: number;
  transportCost?: number;
  otherCost?: number;
  productionCost?: number;
  profitMargin?: number;
  recommendedPrice?: number;
  finalSelectedPrice?: number;
  craftComplexity?: string;
  origin?: string;
  culturalSignificance?: string;
  makingTime?: string;
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
  buyerUserId?: string;
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
  isRated?: boolean;
  userRating?: number;
  userReview?: string;
  userRatedAt?: string;
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

