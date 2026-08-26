import React, { useState } from 'react';
import {
  X,
  Star,
  ShieldCheck,
  Award,
  MapPin,
  Clock,
  Phone,
  MessageSquare,
  CheckCircle2,
  CalendarCheck,
  Sparkles,
  Share2,
  Send,
  Check,
  UserCheck
} from 'lucide-react';
import { Karigar, Language } from '../types';
import { TRADE_META, TRANSLATIONS } from '../data/translations';

interface KarigarProfileModalProps {
  karigar: Karigar;
  language: Language;
  onClose: () => void;
  onSubmitBooking: (booking: {
    karigarId: string;
    karigarName: string;
    karigarTrade: Karigar['trade'];
    clientName: string;
    clientPhone: string;
    clientAddress: string;
    serviceDate: string;
    jobDescription: string;
    estimatedBudget: number;
  }) => void;
}

export const KarigarProfileModal: React.FC<KarigarProfileModalProps> = ({
  karigar,
  language,
  onClose,
  onSubmitBooking,
}) => {
  const t = TRANSLATIONS[language];
  const meta = TRADE_META[karigar.trade] || TRADE_META.handloom;

  const [activePhoto, setActivePhoto] = useState<string>(
    karigar.portfolioImages?.[0] || karigar.avatarUrl
  );
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [serviceDate, setServiceDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [jobDescription, setJobDescription] = useState('');
  const [estimatedBudget, setEstimatedBudget] = useState(karigar.dailyRate * 2);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  const displayName = language === 'hi' ? karigar.hindiName : karigar.name;
  const displaySpecialization =
    language === 'hi' ? karigar.hindiSpecialization : karigar.specialization;
  const displayBio = language === 'hi' ? karigar.hindiBio : karigar.bio;
  const displayTrade = language === 'hi' ? meta.nameHi : meta.nameEn;

  const handleWhatsApp = () => {
    const msg = encodeURIComponent(
      `Namaste ${karigar.name} ji! I viewed your verified profile on Karigar Setu. I want to discuss a ${karigar.specialization} project in ${karigar.city}.`
    );
    window.open(`https://wa.me/${karigar.whatsapp}?text=${msg}`, '_blank');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientPhone || !jobDescription) return;

    onSubmitBooking({
      karigarId: karigar.id,
      karigarName: karigar.name,
      karigarTrade: karigar.trade,
      clientName,
      clientPhone,
      clientAddress,
      serviceDate,
      jobDescription,
      estimatedBudget,
    });

    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      setShowBookingForm(false);
      onClose();
    }, 2000);
  };

  return (
    <div
      id="profile-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="profile-modal-card"
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full overflow-hidden my-auto max-h-[92vh] flex flex-col"
      >
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-amber-800 to-amber-900 text-white p-5 sm:p-6 relative shrink-0">
          <button
            id="btn-close-profile-modal"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white bg-black/20 hover:bg-black/30 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <img
              src={karigar.avatarUrl}
              alt={karigar.name}
              className="w-20 h-20 rounded-2xl object-cover border-3 border-amber-200 shadow-md shrink-0"
              referrerPolicy="no-referrer"
            />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-extrabold tracking-tight text-white">
                  {displayName}
                </h2>
                {karigar.isAadhaarVerified && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold bg-blue-500/20 text-blue-200 border border-blue-400/30 rounded-md backdrop-blur-xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-300" />
                    <span>{t.aadhaarVerified}</span>
                  </span>
                )}
                {karigar.isSkillCertified && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 rounded-md backdrop-blur-xs">
                    <Award className="w-3.5 h-3.5 text-emerald-300" />
                    <span>{t.skillCertified}</span>
                  </span>
                )}
              </div>

              <p className="text-amber-100 text-sm font-medium mt-1">
                {displayTrade} • {displaySpecialization}
              </p>

              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-amber-200">
                <span className="flex items-center gap-1 bg-amber-950/40 px-2 py-0.5 rounded font-semibold text-amber-100">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>{karigar.rating.toFixed(1)}</span>
                  <span className="text-amber-300 font-normal">({karigar.totalReviews} {t.reviewsCount})</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-amber-100">
                  <MapPin className="w-3.5 h-3.5 text-amber-300" />
                  <span>{karigar.locality}, {karigar.city}</span>
                </span>
                <span>•</span>
                <span className="text-amber-100">
                  {karigar.experienceYears} {t.yearsExp}
                </span>
              </div>
            </div>

            <button
              id="btn-share-karigar-profile"
              onClick={handleShare}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold backdrop-blur-xs transition-colors cursor-pointer self-start"
            >
              {copiedShare ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedShare ? 'Copied' : t.shareProfile}</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Direct Actions Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-amber-50/50 p-3 rounded-2xl border border-amber-900/10">
            <div className="flex items-center justify-between sm:justify-start gap-2 px-3 py-2 bg-white rounded-xl border border-amber-900/10">
              <span className="text-xs font-semibold text-slate-500">{t.dailyRate}:</span>
              <span className="text-base font-extrabold text-amber-900">₹{karigar.dailyRate}</span>
            </div>

            <a
              id="btn-profile-call"
              href={`tel:${karigar.phone.replace(/\s+/g, '')}`}
              className="py-2 px-3 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Phone className="w-4 h-4 text-slate-600" />
              <span>{karigar.phone}</span>
            </a>

            <button
              id="btn-profile-whatsapp"
              onClick={handleWhatsApp}
              className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Chat on WhatsApp</span>
            </button>
          </div>

          {/* About Bio */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-2">About Craftsmanship</h3>
            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
              {displayBio}
            </p>
          </div>

          {/* Skills Badges */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-2">Core Skills & Specializations</h3>
            <div className="flex flex-wrap gap-2">
              {karigar.skills.map((skill, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200/80 rounded-lg text-xs font-semibold"
                >
                  {skill}
                </span>
              ))}
              {karigar.languages.map((lang, i) => (
                <span
                  key={`lang-${i}`}
                  className="px-3 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium"
                >
                  🗣️ {lang}
                </span>
              ))}
            </div>
          </div>

          {/* Work Portfolio & Gallery */}
          {karigar.portfolioImages && karigar.portfolioImages.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>{t.portfolioTitle}</span>
                </h3>
                <span className="text-xs text-slate-500">
                  {karigar.completedJobsCount}+ {t.completedJobs}
                </span>
              </div>

              {/* Main Preview Photo */}
              <div className="h-64 sm:h-72 w-full rounded-2xl overflow-hidden bg-slate-100 mb-3 border border-slate-200">
                <img
                  src={activePhoto}
                  alt="Active portfolio craft"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Thumbnails */}
              <div className="flex gap-2 overflow-x-auto pb-1">
                {karigar.portfolioImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActivePhoto(img)}
                    className={`w-20 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                      activePhoto === img ? 'border-amber-600 scale-95 shadow-md' : 'border-transparent opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`thumb ${i}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Booking / Quotation Form Drawer */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50/40 p-5 rounded-2xl border border-amber-200/80">
            {!showBookingForm ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Need this Karigar for your project?</h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Send a direct work booking request with your location, schedule and requirements.
                  </p>
                </div>
                <button
                  id="btn-open-booking-drawer"
                  onClick={() => setShowBookingForm(true)}
                  className="px-5 py-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-900/20 flex items-center gap-2 cursor-pointer transition-all shrink-0"
                >
                  <CalendarCheck className="w-4 h-4" />
                  <span>{t.bookService}</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div className="flex items-center justify-between border-b border-amber-200/60 pb-2">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <CalendarCheck className="w-4 h-4 text-amber-700" />
                    <span>Send Work Request to {karigar.name}</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowBookingForm(false)}
                    className="text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>

                {bookingSuccess ? (
                  <div className="p-4 bg-emerald-100 text-emerald-900 rounded-xl flex items-center gap-3 text-sm font-semibold">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Request sent successfully! {karigar.name} will contact you shortly.</span>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Your Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Rajesh Mehra"
                          value={clientName}
                          onChange={(e) => setClientName(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-white border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Phone / WhatsApp Number *</label>
                        <input
                          type="tel"
                          required
                          placeholder="+91 98765 43210"
                          value={clientPhone}
                          onChange={(e) => setClientPhone(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-white border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Preferred Start Date</label>
                        <input
                          type="date"
                          value={serviceDate}
                          onChange={(e) => setServiceDate(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-white border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Proposed Budget (₹)</label>
                        <input
                          type="number"
                          value={estimatedBudget}
                          onChange={(e) => setEstimatedBudget(Number(e.target.value))}
                          className="w-full px-3 py-2 text-xs bg-white border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Work Address / Locality</label>
                      <input
                        type="text"
                        placeholder="House / Flat No, Locality, Landmark"
                        value={clientAddress}
                        onChange={(e) => setClientAddress(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Job Description & Scope *</label>
                      <textarea
                        rows={3}
                        required
                        placeholder="Describe what work is required, dimensions, materials ready, etc..."
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>

                    <button
                      id="btn-submit-booking-modal"
                      type="submit"
                      className="w-full py-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-900/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      <Send className="w-4 h-4" />
                      <span>Confirm & Send Booking Request</span>
                    </button>
                  </>
                )}
              </form>
            )}
          </div>

          {/* Customer Reviews List */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
              <span>{t.customerFeedback}</span>
            </h3>

            <div className="space-y-3">
              {karigar.reviews.map((rev) => (
                <div key={rev.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-900 font-bold text-xs flex items-center justify-center">
                        {rev.author.charAt(0)}
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-900">{rev.author}</h5>
                        <span className="text-[10px] text-slate-500">{rev.city}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {[...Array(rev.rating)].map((_, idx) => (
                        <Star key={idx} className="w-3 h-3 text-amber-500 fill-amber-400" />
                      ))}
                      <span className="text-[10px] text-slate-400 ml-1">{rev.date}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed italic">
                    "{rev.comment}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
