import React, { useState } from 'react';
import {
  X,
  UserPlus,
  ShieldCheck,
  Award,
  Sparkles,
  CheckCircle2,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { Karigar, Language, TradeCategory } from '../types';
import { TRADE_META, TRANSLATIONS } from '../data/translations';

interface RegisterKarigarModalProps {
  language: Language;
  onClose: () => void;
  onKarigarRegistered: (karigar: Karigar) => void;
}

export const RegisterKarigarModal: React.FC<RegisterKarigarModalProps> = ({
  language,
  onClose,
  onKarigarRegistered,
}) => {
  const t = TRANSLATIONS[language];

  const [name, setName] = useState('');
  const [hindiName, setHindiName] = useState('');
  const [trade, setTrade] = useState<TradeCategory>('carpentry');
  const [specialization, setSpecialization] = useState('');
  const [experienceYears, setExperienceYears] = useState<number>(8);
  const [city, setCity] = useState('Delhi NCR');
  const [locality, setLocality] = useState('');
  const [dailyRate, setDailyRate] = useState<number>(850);
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [bio, setBio] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  const [isAadhaarVerified, setIsAadhaarVerified] = useState(true);
  const [isSkillCertified, setIsSkillCertified] = useState(false);
  const [certificationBody, setCertificationBody] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !specialization) return;

    const skillsArray = skillsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const newKarigar: Karigar = {
      id: `k-${Date.now()}`,
      name,
      hindiName: hindiName || name,
      trade,
      specialization,
      hindiSpecialization: specialization,
      experienceYears,
      city,
      locality: locality || 'Main Market',
      dailyRate,
      rating: 5.0,
      totalReviews: 1,
      phone: phone.startsWith('+91') ? phone : `+91 ${phone}`,
      whatsapp: whatsapp || phone.replace(/\D/g, ''),
      avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80`,
      portfolioImages: [
        'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=600&auto=format&fit=crop&q=80',
      ],
      isAadhaarVerified,
      isSkillCertified,
      certificationBody: isSkillCertified ? certificationBody || 'Skill India Certified' : undefined,
      isAvailableToday: true,
      languages: ['Hindi', 'English'],
      bio: bio || `Experienced craftsman with ${experienceYears} years in ${specialization}. Dedicated to quality, precision and client satisfaction.`,
      hindiBio: bio || `${specialization} में ${experienceYears} वर्षों का उत्कृष्ट अनुभव। उच्च गुणवत्ता का काम।`,
      completedJobsCount: 15,
      skills: skillsArray.length > 0 ? skillsArray : ['Custom Craft', 'Precision Fitting', 'Repairs'],
      reviews: [
        {
          id: `r-${Date.now()}`,
          author: 'Karigar Setu Welcome Team',
          city,
          rating: 5,
          date: 'Just now',
          comment: 'Welcome to Karigar Setu! Profile and credentials verified.',
        }
      ]
    };

    onKarigarRegistered(newKarigar);
    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 1800);
  };

  return (
    <div
      id="register-karigar-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="register-karigar-modal-card"
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden my-auto max-h-[90vh] flex flex-col"
      >
        <div className="bg-gradient-to-r from-amber-800 to-amber-950 text-white p-5 sm:p-6 relative">
          <button
            id="btn-close-register-modal"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white bg-black/20 hover:bg-black/30 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <UserPlus className="w-5 h-5 text-amber-300" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              {t.joinAsKarigar}
            </h2>
          </div>
          <p className="text-xs text-amber-100/90 leading-relaxed">
            {t.registerSubtitle}
          </p>
        </div>

        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          {submitted ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Congratulations! Profile Created</h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                Your Karigar profile is now active on Karigar Setu directory with 0% commission!
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Your Full Name (English) *
                  </label>
                  <input
                    id="input-karigar-name"
                    type="text"
                    required
                    placeholder="e.g. Surendra Mistry"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    नाम (हिंदी में - ऐच्छिक)
                  </label>
                  <input
                    type="text"
                    placeholder="उदा. सुरेन्द्र मिस्त्री"
                    value={hindiName}
                    onChange={(e) => setHindiName(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Primary Trade / Craft *
                  </label>
                  <select
                    id="select-karigar-trade"
                    value={trade}
                    onChange={(e) => setTrade(e.target.value as TradeCategory)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    {Object.entries(TRADE_META).map(([key, item]) => (
                      <option key={key} value={key}>
                        {language === 'hi' ? item.nameHi : item.nameEn}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Specialization / हुनर का विवरण *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Master Woodwork, Teak Polish & Kitchens"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    City / शहर *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jaipur, Lucknow..."
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Experience (Years) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={50}
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Standard Daily Rate (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={dailyRate}
                    onChange={(e) => setDailyRate(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Phone Calling Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 98290 12345"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    WhatsApp Number (if different)
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 98290 12345"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Key Skills & Techniques (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Teakwood Carving, Modular Kitchen, PU Polish, Wardrobes"
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  About Your Craftsmanship & Experience
                </label>
                <textarea
                  rows={2}
                  placeholder="Tell clients about your work philosophy, team capacity, and craftsmanship..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              {/* Verification check */}
              <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-200/60 space-y-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAadhaarVerified}
                    onChange={(e) => setIsAadhaarVerified(e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded"
                  />
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>Aadhaar Identity Verified (Badge will be attached)</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isSkillCertified}
                    onChange={(e) => setIsSkillCertified(e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded"
                  />
                  <Award className="w-4 h-4 text-emerald-600" />
                  <span>Government / NSDC / Guild Skill Certified</span>
                </label>

                {isSkillCertified && (
                  <input
                    type="text"
                    placeholder="Enter Certifying Body / Council Name (e.g. Skill India, KVIC)"
                    value={certificationBody}
                    onChange={(e) => setCertificationBody(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-amber-200 rounded-lg focus:outline-none"
                  />
                )}
              </div>

              <div className="pt-2">
                <button
                  id="btn-submit-register-karigar"
                  type="submit"
                  className="w-full py-3 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-amber-950/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Register Free & Publish Karigar Profile</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
