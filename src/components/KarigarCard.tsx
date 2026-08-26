import React from 'react';
import {
  Star,
  ShieldCheck,
  Award,
  MapPin,
  Clock,
  Phone,
  MessageSquare,
  CheckCircle2,
  CalendarCheck,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Karigar, Language } from '../types';
import { TRADE_META, TRANSLATIONS } from '../data/translations';

interface KarigarCardProps {
  karigar: Karigar;
  language: Language;
  onViewProfile: (karigar: Karigar) => void;
  onRequestBooking: (karigar: Karigar) => void;
}

export const KarigarCard: React.FC<KarigarCardProps> = ({
  karigar,
  language,
  onViewProfile,
  onRequestBooking,
}) => {
  const t = TRANSLATIONS[language];
  const meta = TRADE_META[karigar.trade] || TRADE_META.handloom;

  const displayName = language === 'hi' ? karigar.hindiName : karigar.name;
  const displaySpecialization =
    language === 'hi' ? karigar.hindiSpecialization : karigar.specialization;
  const displayTrade = language === 'hi' ? meta.nameHi : meta.nameEn;

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const msg = encodeURIComponent(
      `Namaste ${karigar.name} ji! I found your profile on Karigar Setu for ${karigar.specialization}. I would like to inquire about a job.`
    );
    window.open(`https://wa.me/${karigar.whatsapp}?text=${msg}`, '_blank');
  };

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.href = `tel:${karigar.phone.replace(/\s+/g, '')}`;
  };

  return (
    <div
      id={`karigar-card-${karigar.id}`}
      onClick={() => onViewProfile(karigar)}
      className="bg-white rounded-2xl border border-amber-900/10 shadow-sm hover:shadow-md hover:border-amber-600/40 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer group"
    >
      {/* Top Banner / Availability & Trade Badge */}
      <div className="p-5 pb-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          {/* Avatar + Info */}
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <img
                src={karigar.avatarUrl}
                alt={karigar.name}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-100 shadow-inner group-hover:scale-105 transition-transform"
                referrerPolicy="no-referrer"
              />
              {karigar.isAvailableToday && (
                <span
                  title="Available for immediate work"
                  className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center"
                >
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-bold text-base text-slate-900 group-hover:text-amber-700 transition-colors">
                  {displayName}
                </h3>
                {karigar.isAadhaarVerified && (
                  <span
                    title={t.aadhaarVerified}
                    className="inline-flex items-center gap-0.5 px-1.5 py-0.2 text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded-md"
                  >
                    <ShieldCheck className="w-3 h-3 text-blue-600" />
                    <span>Verified</span>
                  </span>
                )}
              </div>

              <p className="text-xs font-medium text-amber-800 line-clamp-1 mt-0.5">
                {displayTrade}
              </p>

              <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                <span className="flex items-center gap-1 text-slate-700 font-semibold bg-amber-50 px-1.5 py-0.5 rounded text-[11px]">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                  <span>{karigar.rating.toFixed(1)}</span>
                  <span className="text-slate-400 font-normal">({karigar.totalReviews})</span>
                </span>
                <span>•</span>
                <span className="font-medium text-slate-600">
                  {karigar.experienceYears} {t.yearsExp}
                </span>
              </div>
            </div>
          </div>

          {/* Rate Badge */}
          <div className="text-right shrink-0">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              {t.dailyRate}
            </span>
            <span className="text-base font-extrabold text-amber-900">
              ₹{karigar.dailyRate}
            </span>
            <span className="text-[10px] text-slate-500 block">/day approx</span>
          </div>
        </div>

        {/* Specialization Description */}
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
          {displaySpecialization}
        </p>

        {/* Location & Certifications */}
        <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-2.5">
          <div className="flex items-center gap-1 text-slate-600 truncate max-w-[65%]">
            <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="truncate font-medium">{karigar.locality}, {karigar.city}</span>
          </div>

          {karigar.isSkillCertified && (
            <span
              title={karigar.certificationBody || 'Government Certified'}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60"
            >
              <Award className="w-3 h-3 text-emerald-600" />
              <span>NSDC</span>
            </span>
          )}
        </div>

        {/* Mini Portfolio Thumbnails */}
        {karigar.portfolioImages && karigar.portfolioImages.length > 0 && (
          <div className="grid grid-cols-3 gap-1.5 mt-3 pt-2 border-t border-slate-100">
            {karigar.portfolioImages.slice(0, 3).map((img, i) => (
              <div key={i} className="h-14 rounded-lg overflow-hidden bg-slate-100 relative group/img">
                <img
                  src={img}
                  alt={`Portfolio work ${i + 1}`}
                  className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
              </div>
            ))}
          </div>
        )}

        {/* Skills Tags */}
        <div className="flex flex-wrap gap-1 mt-3">
          {karigar.skills.slice(0, 3).map((sk, idx) => (
            <span
              key={idx}
              className="text-[10px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md"
            >
              {sk}
            </span>
          ))}
          {karigar.skills.length > 3 && (
            <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded-md">
              +{karigar.skills.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons Footer */}
      <div className="bg-slate-50/80 px-4 py-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <button
          id={`btn-card-call-${karigar.id}`}
          onClick={handleCall}
          className="flex-1 py-1.5 px-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <Phone className="w-3.5 h-3.5 text-slate-600" />
          <span>{t.callNow}</span>
        </button>

        <button
          id={`btn-card-whatsapp-${karigar.id}`}
          onClick={handleWhatsApp}
          className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>WhatsApp</span>
        </button>

        <button
          id={`btn-card-book-${karigar.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onRequestBooking(karigar);
          }}
          className="py-1.5 px-3 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl shadow-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
          title="Book work or request quotation"
        >
          <CalendarCheck className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t.bookService}</span>
        </button>
      </div>
    </div>
  );
};
