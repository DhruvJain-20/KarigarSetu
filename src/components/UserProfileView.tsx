import React, { useState } from 'react';
import {
  Store,
  Landmark,
  Globe,
  Bell,
  HelpCircle,
  ChevronRight,
  CheckCircle2,
  Star,
  ShieldCheck,
  Award,
  Camera,
  Edit2,
  X,
  Phone,
  Mail,
  MapPin,
  Mic,
  ArrowLeft,
  FileCheck,
  CreditCard,
  Sparkles,
  ShoppingBag,
  UserCheck,
  LogOut
} from 'lucide-react';
import { ArtisanUserProfile, Language } from '../types';

interface UserProfileViewProps {
  language: Language;
  profile: ArtisanUserProfile;
  onUpdateProfile: (updated: ArtisanUserProfile) => void;
  onToggleLanguage: () => void;
  onOpenVoiceAssistant: () => void;
  onSwitchToMarketplace: () => void;
  onBack: () => void;
  onLogout: () => void;
}

export function UserProfileView({
  language,
  profile,
  onUpdateProfile,
  onToggleLanguage,
  onOpenVoiceAssistant,
  onSwitchToMarketplace,
  onBack,
  onLogout,
}: UserProfileViewProps) {
  const [activeModal, setActiveModal] = useState<'business' | 'bank' | 'notifications' | 'help' | null>(null);

  // Business form state
  const [businessName, setBusinessName] = useState(profile.businessDetails.businessName);
  const [workshopAddress, setWorkshopAddress] = useState(profile.businessDetails.workshopAddress);
  const [phone, setPhone] = useState(profile.businessDetails.phone);
  const [udyamRegNo, setUdyamRegNo] = useState(profile.businessDetails.udyamRegNo);
  const [aboutStory, setAboutStory] = useState(profile.businessDetails.aboutStory);

  // Bank form state
  const [upiId, setUpiId] = useState(profile.bankDetails.upiId);
  const [accountNumber, setAccountNumber] = useState(profile.bankDetails.accountNumber);
  const [bankName, setBankName] = useState(profile.bankDetails.bankName);

  const handleSaveBusiness = () => {
    onUpdateProfile({
      ...profile,
      businessDetails: {
        ...profile.businessDetails,
        businessName,
        workshopAddress,
        phone,
        udyamRegNo,
        aboutStory,
      },
    });
    setActiveModal(null);
  };

  const handleSaveBank = () => {
    onUpdateProfile({
      ...profile,
      bankDetails: {
        ...profile.bankDetails,
        upiId,
        accountNumber,
        bankName,
      },
    });
    setActiveModal(null);
  };

  return (
    <div className="w-full max-w-lg mx-auto pb-28 px-4 pt-2 space-y-6">
      
      {/* Profile Header Block matching Screenshot 7 */}
      <div className="flex flex-col items-center text-center space-y-2 pt-2">
        {/* Avatar with Verified ring */}
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg bg-stone-200">
            <img
              src={profile.avatarUrl}
              alt={profile.name}
              className="w-full h-full object-cover"
            />
          </div>
          <button
            onClick={() => {
              const newUrl = prompt('Enter image URL for profile photo:', profile.avatarUrl);
              if (newUrl) {
                onUpdateProfile({ ...profile, avatarUrl: newUrl });
              }
            }}
            className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#963E20] text-white flex items-center justify-center shadow-md border-2 border-white hover:bg-[#80341A]"
            title="Change photo"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-0.5">
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
            {profile.name}
          </h1>

          <div className="flex items-center justify-center gap-1 text-xs font-bold text-[#1D5C4A]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{profile.verifiedBadge}</span>
          </div>

          <p className="text-xs text-stone-600 font-medium">
            {profile.specialization}
          </p>
        </div>
      </div>

      {/* 3 Metric Pill Cards matching Screenshot 7 */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#FAF3E7] rounded-3xl p-4 border border-amber-900/10 shadow-xs text-center">
          <div className="text-xs font-semibold text-stone-600">Sales</div>
          <div className="text-xl sm:text-2xl font-extrabold text-stone-900 mt-0.5">
            ₹{(profile.salesTotal / 1000).toFixed(0)}k
          </div>
        </div>

        <div className="bg-[#FAF3E7] rounded-3xl p-4 border border-amber-900/10 shadow-xs text-center">
          <div className="text-xs font-semibold text-stone-600">Products</div>
          <div className="text-xl sm:text-2xl font-extrabold text-stone-900 mt-0.5">
            {profile.productsListedCount}
          </div>
        </div>

        <div className="bg-[#FAF3E7] rounded-3xl p-4 border border-amber-900/10 shadow-xs text-center">
          <div className="text-xs font-semibold text-stone-600">Rating</div>
          <div className="text-xl sm:text-2xl font-extrabold text-stone-900 mt-0.5 flex items-center justify-center gap-1">
            <span>{profile.rating}</span>
            <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
          </div>
        </div>
      </div>

      {/* Menu List matching Screenshot 7 */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-xs divide-y divide-stone-100 overflow-hidden">
        
        {/* My Business Details */}
        <button
          type="button"
          onClick={() => setActiveModal('business')}
          className="w-full px-5 py-4 flex items-center justify-between hover:bg-amber-50/50 transition-colors text-left group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-[#963E20] flex items-center justify-center shrink-0">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-stone-900 text-sm sm:text-base">
                My Business Details
              </div>
              <div className="text-xs text-stone-500">
                {profile.businessDetails.businessName}
              </div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-stone-700 transition-transform group-hover:translate-x-0.5" />
        </button>

        {/* Bank & Payments */}
        <button
          type="button"
          onClick={() => setActiveModal('bank')}
          className="w-full px-5 py-4 flex items-center justify-between hover:bg-amber-50/50 transition-colors text-left group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#E6F4EF] text-[#1D5C4A] flex items-center justify-center shrink-0">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-stone-900 text-sm sm:text-base">
                Bank & Payments
              </div>
              <div className="text-xs text-stone-500">
                UPI: {profile.bankDetails.upiId}
              </div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-stone-700 transition-transform group-hover:translate-x-0.5" />
        </button>

        {/* Language Switch */}
        <button
          type="button"
          onClick={onToggleLanguage}
          className="w-full px-5 py-4 flex items-center justify-between hover:bg-amber-50/50 transition-colors text-left group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-stone-100 text-stone-700 flex items-center justify-center shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-stone-900 text-sm sm:text-base">
                Language
              </div>
              <div className="text-xs text-stone-500">
                Current: {language === 'hi' ? 'Hindi (हिन्दी)' : 'English'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-[#D1EBE1] text-[#1D5C4A] text-[11px] font-bold rounded-full">
              Tap to switch
            </span>
            <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-stone-700" />
          </div>
        </button>

        {/* Notifications */}
        <button
          type="button"
          onClick={() => setActiveModal('notifications')}
          className="w-full px-5 py-4 flex items-center justify-between hover:bg-amber-50/50 transition-colors text-left group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-100/60 text-[#963E20] flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-stone-900 text-sm sm:text-base">
                Notifications
              </div>
              <div className="text-xs text-stone-500">
                3 new order alerts
              </div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-stone-700 transition-transform group-hover:translate-x-0.5" />
        </button>

        {/* Help & Support */}
        <button
          type="button"
          onClick={() => setActiveModal('help')}
          className="w-full px-5 py-4 flex items-center justify-between hover:bg-amber-50/50 transition-colors text-left group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-stone-100 text-stone-700 flex items-center justify-center shrink-0">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-stone-900 text-sm sm:text-base">
                Help & Support
              </div>
              <div className="text-xs text-stone-500">
                Toll-free artisan helpline 1800-KARIGAR
              </div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-stone-700 transition-transform group-hover:translate-x-0.5" />
        </button>

        {/* Real Supabase Logout */}
        <button
          type="button"
          onClick={onLogout}
          className="w-full px-5 py-4 flex items-center justify-between hover:bg-rose-50/60 transition-colors text-left group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
              <LogOut className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-rose-800 text-sm sm:text-base">
                Log Out of Account
              </div>
              <div className="text-xs text-stone-500">
                Sign out of your Supabase session
              </div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-rose-600 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>

      {/* Switch to Buyer Mode CTA */}
      <div className="bg-gradient-to-r from-amber-100/80 to-orange-100/80 rounded-3xl p-5 border border-amber-900/10 flex items-center justify-between">
        <div className="space-y-0.5">
          <h4 className="font-bold text-stone-900 text-sm">Want to shop handmade crafts?</h4>
          <p className="text-xs text-stone-600">Switch to Buyer Marketplace mode</p>
        </div>
        <button
          onClick={onSwitchToMarketplace}
          className="px-4 py-2.5 rounded-xl bg-[#963E20] hover:bg-[#80341A] text-white font-bold text-xs shadow-xs"
        >
          Explore Shop
        </button>
      </div>

      {/* Sticky Voice Assistant Pill matching Screenshot 7 */}
      <div className="fixed bottom-20 right-4 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 z-30">
        <button
          type="button"
          onClick={onOpenVoiceAssistant}
          className="py-3.5 px-6 rounded-full bg-[#963E20] hover:bg-[#80341A] text-white font-bold text-sm shadow-xl flex items-center gap-2 transition-all active:scale-95 border-2 border-white/40"
        >
          <Mic className="w-5 h-5" />
          <span>Ask KarigarSetu</span>
        </button>
      </div>

      {/* Business Details Modal */}
      {activeModal === 'business' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-center items-center p-4 overflow-y-auto">
          <div className="bg-[#FAF7F2] w-full max-w-md rounded-3xl p-6 shadow-2xl border border-amber-900/10 space-y-4 animate-in fade-in">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-stone-900">My Business Details</h3>
              <button
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-700">Workshop / Enterprise Name</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full mt-1 px-3 py-2.5 rounded-xl bg-white border border-stone-300 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700">Workshop Address</label>
                <input
                  type="text"
                  value={workshopAddress}
                  onChange={(e) => setWorkshopAddress(e.target.value)}
                  className="w-full mt-1 px-3 py-2.5 rounded-xl bg-white border border-stone-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700">Contact Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full mt-1 px-3 py-2.5 rounded-xl bg-white border border-stone-300"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700">Udyam MSME No.</label>
                  <input
                    type="text"
                    value={udyamRegNo}
                    onChange={(e) => setUdyamRegNo(e.target.value)}
                    className="w-full mt-1 px-3 py-2.5 rounded-xl bg-white border border-stone-300"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700">Artisan Legacy & Story</label>
                <textarea
                  rows={3}
                  value={aboutStory}
                  onChange={(e) => setAboutStory(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-white border border-stone-300 leading-relaxed resize-none"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleSaveBusiness}
              className="w-full py-3.5 rounded-2xl bg-[#963E20] hover:bg-[#80341A] text-white font-bold text-sm transition-colors shadow-md"
            >
              Save Details
            </button>
          </div>
        </div>
      )}

      {/* Bank & Payments Modal */}
      {activeModal === 'bank' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-center items-center p-4 overflow-y-auto">
          <div className="bg-[#FAF7F2] w-full max-w-md rounded-3xl p-6 shadow-2xl border border-amber-900/10 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-stone-900">Bank & Direct Payouts</h3>
              <button
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-stone-700">Primary UPI ID for Direct Payouts</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full mt-1 px-3 py-2.5 rounded-xl bg-white border border-stone-300 font-mono font-bold text-stone-900"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700">Bank Name</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full mt-1 px-3 py-2.5 rounded-xl bg-white border border-stone-300"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700">Account Number</label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full mt-1 px-3 py-2.5 rounded-xl bg-white border border-stone-300 font-mono"
                />
              </div>

              <div className="bg-[#D1EBE1] p-3 rounded-2xl border border-[#B5DEC8] text-[#144738] text-[11px] font-semibold space-y-1">
                <div className="flex items-center gap-1 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Instant T+1 Karigar Payout Guarantee
                </div>
                <p>Funds from online buyers are released to your UPI account within 24 hours of dispatch.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSaveBank}
              className="w-full py-3.5 rounded-2xl bg-[#963E20] hover:bg-[#80341A] text-white font-bold text-sm transition-colors shadow-md"
            >
              Save Bank Info
            </button>
          </div>
        </div>
      )}

      {/* Notifications Modal */}
      {activeModal === 'notifications' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-center items-center p-4">
          <div className="bg-[#FAF7F2] w-full max-w-md rounded-3xl p-6 shadow-2xl border border-amber-900/10 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-stone-900">Notifications</h3>
              <button
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5">
              <div className="bg-white p-3 rounded-2xl border border-stone-200 text-xs space-y-1">
                <div className="flex justify-between font-bold text-stone-900">
                  <span className="text-[#963E20]">New Order Received</span>
                  <span className="text-[10px] text-stone-400">10m ago</span>
                </div>
                <p className="text-stone-600">Ramesh Gupta purchased 1x Silk Saree (₹4,200). Please pack and dispatch.</p>
              </div>

              <div className="bg-white p-3 rounded-2xl border border-stone-200 text-xs space-y-1">
                <div className="flex justify-between font-bold text-stone-900">
                  <span className="text-[#1D5C4A]">Payout Credited</span>
                  <span className="text-[10px] text-stone-400">2h ago</span>
                </div>
                <p className="text-stone-600">₹14,990 successfully transferred to your UPI ID for Order #KS-ORD-9021.</p>
              </div>
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-3 rounded-2xl bg-stone-200 text-stone-800 font-bold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {activeModal === 'help' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-center items-center p-4">
          <div className="bg-[#FAF7F2] w-full max-w-md rounded-3xl p-6 shadow-2xl border border-amber-900/10 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-stone-900">Karigar Sahayata</h3>
              <button
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-white p-4 rounded-2xl border border-stone-200 space-y-2">
                <div className="font-bold text-stone-900 text-sm">Artisan Support Helpline</div>
                <p className="text-stone-600">Toll-free assistance in Hindi, English, Bengali, Tamil, Telugu, Marathi, and Gujarati.</p>
                <a
                  href="tel:18005274427"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1D5C4A] text-white font-bold text-xs"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Call 1800-527-4427
                </a>
              </div>
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-3 rounded-2xl bg-stone-200 text-stone-800 font-bold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
