import React, { useState, useEffect } from 'react';
import {
  X,
  UserPlus,
  ShieldCheck,
  Award,
  Sparkles,
  CheckCircle2,
  Upload,
  Image as ImageIcon,
  Plus,
  Trash2,
  Camera,
  MapPin,
  IndianRupee,
  Phone,
  MessageSquare,
  Briefcase
} from 'lucide-react';
import { Karigar, Language, TradeCategory, UserProfile } from '../types';
import { TRADE_META, TRANSLATIONS } from '../data/translations';
import { compressImage } from '../utils/imageCompressor';

interface RegisterKarigarModalProps {
  language: Language;
  currentUserProfile?: UserProfile | null;
  authUser?: any;
  existingKarigar?: Karigar | null;
  onClose: () => void;
  onKarigarRegistered: (karigar: Karigar) => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1544717305-2782549b5136?w=240&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=240&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=240&auto=format&fit=crop&q=80',
];

const PRESET_PORTFOLIO_BY_TRADE: Record<TradeCategory, string[]> = {
  handloom: [
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=600&auto=format&fit=crop&q=80',
  ],
  pottery: [
    'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?w=600&auto=format&fit=crop&q=80',
  ],
  artist: [
    'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=600&auto=format&fit=crop&q=80',
  ],
  metalwork: [
    'https://images.unsplash.com/photo-1606744824163-985d376605aa?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1608755728617-aefab37d2edd?w=600&auto=format&fit=crop&q=80',
  ],
  tailoring: [
    'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
  ],
  stonecraft: [
    'https://images.unsplash.com/photo-1590073844006-33379778ae09?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1548013146-72479768bada?w=600&auto=format&fit=crop&q=80',
  ],
  leathercraft: [
    'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&auto=format&fit=crop&q=80',
  ],
};

export const RegisterKarigarModal: React.FC<RegisterKarigarModalProps> = ({
  language,
  currentUserProfile,
  authUser,
  existingKarigar,
  onClose,
  onKarigarRegistered,
}) => {
  const t = TRANSLATIONS[language];

  const defaultName =
    existingKarigar?.name ||
    currentUserProfile?.full_name ||
    authUser?.user_metadata?.full_name ||
    authUser?.user_metadata?.name ||
    '';
  const defaultCity =
    existingKarigar?.city ||
    currentUserProfile?.city ||
    'Jaipur';
  const defaultPhone =
    existingKarigar?.phone ||
    currentUserProfile?.phone ||
    '';

  const [name, setName] = useState(defaultName);
  const [hindiName, setHindiName] = useState(existingKarigar?.hindiName || '');
  const [trade, setTrade] = useState<TradeCategory>(existingKarigar?.trade || 'artist');
  const [specialization, setSpecialization] = useState(existingKarigar?.specialization || '');
  const [experienceYears, setExperienceYears] = useState<number>(existingKarigar?.experienceYears || 8);
  const [city, setCity] = useState(defaultCity);
  const [locality, setLocality] = useState(existingKarigar?.locality || '');
  const [dailyRate, setDailyRate] = useState<number>(existingKarigar?.dailyRate || 850);
  const [phone, setPhone] = useState(defaultPhone);
  const [whatsapp, setWhatsapp] = useState(existingKarigar?.whatsapp || '');
  const [bio, setBio] = useState(existingKarigar?.bio || '');
  const [skillsInput, setSkillsInput] = useState(existingKarigar?.skills?.join(', ') || '');
  const [avatarUrl, setAvatarUrl] = useState(
    existingKarigar?.avatarUrl ||
    currentUserProfile?.avatar_url ||
    PRESET_AVATARS[0]
  );
  const [portfolioImages, setPortfolioImages] = useState<string[]>(
    existingKarigar?.portfolioImages && existingKarigar.portfolioImages.length > 0
      ? existingKarigar.portfolioImages
      : PRESET_PORTFOLIO_BY_TRADE['artist']
  );
  const [isAadhaarVerified, setIsAadhaarVerified] = useState(
    existingKarigar ? existingKarigar.isAadhaarVerified : true
  );
  const [isSkillCertified, setIsSkillCertified] = useState(
    existingKarigar ? existingKarigar.isSkillCertified : false
  );
  const [certificationBody, setCertificationBody] = useState(
    existingKarigar?.certificationBody || ''
  );
  const [submitted, setSubmitted] = useState(false);

  // When trade changes and portfolio is default, suggest trade presets
  const handleTradeChange = (newTrade: TradeCategory) => {
    setTrade(newTrade);
    if (!existingKarigar && PRESET_PORTFOLIO_BY_TRADE[newTrade]) {
      setPortfolioImages(PRESET_PORTFOLIO_BY_TRADE[newTrade]);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 400, 400, 0.72);
        setAvatarUrl(compressed);
      } catch (err) {
        console.warn('Avatar compression error:', err);
      }
    }
  };

  const handlePortfolioPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileList = Array.from(files);
      for (const file of fileList) {
        try {
          const compressed = await compressImage(file, 800, 800, 0.75);
          setPortfolioImages((prev) => [...prev, compressed]);
        } catch (err) {
          console.warn('Portfolio image compression error:', err);
        }
      }
    }
  };

  const handleRemovePortfolioImage = (index: number) => {
    setPortfolioImages(portfolioImages.filter((_, idx) => idx !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !specialization.trim()) {
      alert('Please fill in your name, contact phone, and specialization.');
      return;
    }

    const skillsArray = skillsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const updatedOrNewKarigar: Karigar = {
      id: existingKarigar?.id || `karigar-${Date.now()}`,
      userId: currentUserProfile?.id || authUser?.id,
      isUserCreated: true,
      name: name.trim(),
      hindiName: hindiName.trim() || name.trim(),
      trade,
      specialization: specialization.trim(),
      hindiSpecialization: specialization.trim(),
      experienceYears: Number(experienceYears),
      city: city.trim(),
      locality: locality.trim() || 'Central Workshop',
      dailyRate: Number(dailyRate),
      rating: existingKarigar?.rating || 5.0,
      totalReviews: existingKarigar?.totalReviews || 1,
      phone: phone.startsWith('+91') ? phone : `+91 ${phone}`,
      whatsapp: (whatsapp || phone).replace(/\D/g, ''),
      avatarUrl: avatarUrl || PRESET_AVATARS[0],
      portfolioImages: portfolioImages.length > 0 ? portfolioImages : PRESET_PORTFOLIO_BY_TRADE[trade],
      isAadhaarVerified,
      isSkillCertified,
      certificationBody: isSkillCertified ? certificationBody || 'Skill India Certified' : undefined,
      isAvailableToday: true,
      languages: ['Hindi', 'English'],
      bio:
        bio.trim() ||
        `Experienced craftsman with ${experienceYears} years in ${specialization}. Dedicated to quality, precision and client satisfaction.`,
      hindiBio:
        bio.trim() ||
        `${specialization} में ${experienceYears} वर्षों का उत्कृष्ट अनुभव। उच्च गुणवत्ता का काम।`,
      completedJobsCount: existingKarigar?.completedJobsCount || 10,
      skills: skillsArray.length > 0 ? skillsArray : ['Custom Craft', 'Precision Fitting', 'Restoration'],
      reviews: existingKarigar?.reviews || [
        {
          id: `r-${Date.now()}`,
          author: 'Verified Client',
          city,
          rating: 5,
          date: 'Recently',
          comment: 'Skilled craftsmanship, honest pricing, and prompt delivery!',
        },
      ],
    };

    onKarigarRegistered(updatedOrNewKarigar);
    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 1600);
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
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in zoom-in-95"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-800 to-amber-950 text-white p-5 sm:p-6 relative shrink-0">
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
              {existingKarigar
                ? (language === 'hi' ? 'कारीगर प्रोफाइल संपादित करें' : 'Edit Karigar Portfolio')
                : (language === 'hi' ? 'कारीगर प्रोफाइल बनाएं' : 'Create Your Karigar Portfolio')}
            </h2>
          </div>
          <p className="text-xs text-amber-100/90 leading-relaxed">
            {language === 'hi'
              ? 'अपना हुनर, दैनिक दर और काम की तस्वीरें अपलोड करें ताकि ग्राहक सीधे बुकिंग कर सकें'
              : 'Showcase your craftsmanship, daily wage, and portfolio photos for direct client bookings'}
          </p>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          {submitted ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                {existingKarigar
                  ? (language === 'hi' ? 'प्रोफ़ाइल सफलतापूर्वक अपडेट हुई!' : 'Portfolio Updated Successfully!')
                  : (language === 'hi' ? 'कारीगर प्रोफ़ाइल लाइव हो गई!' : 'Portfolio Published Successfully!')}
              </h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                {language === 'hi'
                  ? 'आपकी प्रोफ़ाइल अब Hire Karigars डायरेक्टरी में दिखाई देगी और ग्राहक सीधे बुकिंग अनुरोध भेज सकेंगे।'
                  : 'Your portfolio is now live on the Hire Karigars directory. Clients can call, WhatsApp, or send direct bookings.'}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Profile Avatar Selection & Upload */}
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-3">
                <label className="text-xs font-bold text-stone-800 block">
                  Profile Photo / कारीगर की तस्वीर *
                </label>
                <div className="flex items-center gap-4">
                  <img
                    src={avatarUrl}
                    alt="Karigar Avatar"
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-800 shadow-md"
                  />
                  <div className="space-y-1.5 flex-1">
                    <div className="flex gap-2">
                      <label className="px-3 py-1.5 bg-amber-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-amber-900 transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <div className="flex gap-1.5 overflow-x-auto pt-1">
                      {PRESET_AVATARS.map((url, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setAvatarUrl(url)}
                          className={`w-7 h-7 rounded-lg overflow-hidden border transition-transform ${
                            avatarUrl === url ? 'ring-2 ring-amber-800 scale-105' : 'opacity-70'
                          }`}
                        >
                          <img src={url} alt="Preset" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Name & Hindi Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Full Name (English) *
                  </label>
                  <input
                    id="input-karigar-name"
                    type="text"
                    required
                    placeholder="e.g. Rameshwar Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    नाम (हिंदी में - ऐच्छिक)
                  </label>
                  <input
                    type="text"
                    placeholder="उदा. रामेश्वर शर्मा"
                    value={hindiName}
                    onChange={(e) => setHindiName(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none font-medium"
                  />
                </div>
              </div>

              {/* Trade & Specialization */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Primary Trade / Craft *
                  </label>
                  <select
                    id="select-karigar-trade"
                    value={trade}
                    onChange={(e) => handleTradeChange(e.target.value as TradeCategory)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none font-medium"
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
                    placeholder="e.g. Master Pichwai Art & Gold Leaf Detailing"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none font-medium"
                  />
                </div>
              </div>

              {/* City, Experience & Daily Rate */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    City / शहर *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jaipur, Varanasi..."
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none font-medium"
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
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Daily Wage Rate (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min={200}
                    value={dailyRate}
                    onChange={(e) => setDailyRate(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none font-bold text-amber-900"
                  />
                </div>
              </div>

              {/* Phone & WhatsApp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Direct Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 98290 12345"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    WhatsApp Number (for direct chat)
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 98290 12345"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none font-medium"
                  />
                </div>
              </div>

              {/* Portfolio Work Photos Upload */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-700 block">
                    Portfolio Work Photos ({portfolioImages.length} photos)
                  </label>
                  <label className="text-xs font-bold text-amber-800 flex items-center gap-1 cursor-pointer hover:underline">
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePortfolioPhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                  {portfolioImages.map((img, idx) => (
                    <div key={idx} className="relative h-20 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 group">
                      <img src={img} alt={`Work ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemovePortfolioImage(idx)}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-600/90 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove photo"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  <label className="h-20 rounded-xl border-2 border-dashed border-stone-300 hover:border-amber-700 flex flex-col items-center justify-center text-stone-400 hover:text-amber-800 cursor-pointer transition-colors">
                    <Camera className="w-5 h-5 mb-1" />
                    <span className="text-[10px] font-bold">Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePortfolioPhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Skills Tags */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Key Skills & Techniques (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Gold Leaf Gilding, Natural Pigments, Temple Frescoes, Miniature Art"
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none font-medium"
                />
              </div>

              {/* About & Craft Story */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  About Your Craftsmanship & Background
                </label>
                <textarea
                  rows={2}
                  placeholder="Tell clients about your master lineage, materials used, turnaround time, and team..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none resize-none leading-relaxed"
                />
              </div>

              {/* Verifications */}
              <div className="bg-amber-50/60 p-3.5 rounded-xl border border-amber-200/60 space-y-2">
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
              </div>

              <div className="pt-2">
                <button
                  id="btn-submit-register-karigar"
                  type="submit"
                  className="w-full py-3 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-amber-950/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>
                    {existingKarigar
                      ? (language === 'hi' ? 'प्रोफ़ाइल सहेजें' : 'Save & Update Portfolio')
                      : (language === 'hi' ? 'प्रोफ़ाइल प्रकाशित करें' : 'Publish Karigar Portfolio Free')}
                  </span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
