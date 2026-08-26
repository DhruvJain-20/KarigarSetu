import React, { useState } from 'react';
import {
  X,
  Plus,
  Briefcase,
  MapPin,
  Calendar,
  AlertCircle,
  IndianRupee,
  CheckCircle2,
  Send
} from 'lucide-react';
import { JobPost, Language, TradeCategory } from '../types';
import { TRADE_META, TRANSLATIONS } from '../data/translations';

interface PostJobModalProps {
  language: Language;
  onClose: () => void;
  onJobPosted: (job: JobPost) => void;
}

export const PostJobModal: React.FC<PostJobModalProps> = ({
  language,
  onClose,
  onJobPosted,
}) => {
  const t = TRANSLATIONS[language];

  const [title, setTitle] = useState('');
  const [trade, setTrade] = useState<TradeCategory>('handloom');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState('Jaipur');
  const [locality, setLocality] = useState('');
  const [budgetType, setBudgetType] = useState<'daily' | 'fixed' | 'per_unit'>('daily');
  const [budgetAmount, setBudgetAmount] = useState<number>(850);
  const [durationDays, setDurationDays] = useState<number>(3);
  const [startDate, setStartDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [isUrgent, setIsUrgent] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !clientName || !clientPhone) return;

    const newJob: JobPost = {
      id: `jp-${Date.now()}`,
      title,
      trade,
      description,
      city,
      locality: locality || 'City Center',
      budgetType,
      budgetAmount,
      durationDays: budgetType === 'daily' ? durationDays : undefined,
      startDate,
      isUrgent,
      clientName,
      clientPhone,
      createdAt: new Date().toISOString(),
      applicantsCount: 0,
      status: 'open',
    };

    onJobPosted(newJob);
    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 1800);
  };

  return (
    <div
      id="post-job-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="post-job-modal-card"
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden my-auto max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-700 to-amber-900 text-white p-5 sm:p-6 relative">
          <button
            id="btn-close-post-job-modal"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white bg-black/20 hover:bg-black/30 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <Briefcase className="w-5 h-5 text-amber-300" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              {t.postJob}
            </h2>
          </div>
          <p className="text-xs text-amber-100/90 leading-relaxed">
            {t.postJobSubtitle}
          </p>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          {submitted ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Job Requirement Posted!</h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                Your requirement is now live on Karigar Setu. Verified karigars in {city} will be able to review and contact you directly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Job / Requirement Title *
                </label>
                <input
                  id="input-job-title"
                  type="text"
                  required
                  placeholder="e.g. Need 2 Carpenters for modular wardrobe, 5 days in Jaipur"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Trade / Craft Category *
                  </label>
                  <select
                    id="select-job-trade"
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
                    City / Location *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jaipur, Varanasi, Delhi NCR..."
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Budget Model
                  </label>
                  <select
                    value={budgetType}
                    onChange={(e) => setBudgetType(e.target.value as typeof budgetType)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="daily">Daily Wage (प्रति दिन)</option>
                    <option value="fixed">Fixed Contract (कुल बजट)</option>
                    <option value="per_unit">Per Sq. Ft / Unit Rate</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Estimated Budget (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={budgetAmount}
                    onChange={(e) => setBudgetAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Est. Duration (Days)
                  </label>
                  <input
                    type="number"
                    value={durationDays}
                    onChange={(e) => setDurationDays(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Full Work Description & Specs *
                </label>
                <textarea
                  id="textarea-job-description"
                  rows={3}
                  required
                  placeholder="Detail the materials provided, dimensions, tools required, site condition..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Your Name / Contractor Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikas Goel"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Contact Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 00000"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="urgent-check"
                  checked={isUrgent}
                  onChange={(e) => setIsUrgent(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500 border-slate-300"
                />
                <label htmlFor="urgent-check" className="text-xs font-semibold text-red-700 flex items-center gap-1 cursor-pointer">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Mark as Urgent (Need within 24 hours)</span>
                </label>
              </div>

              <div className="pt-2">
                <button
                  id="btn-submit-post-job"
                  type="submit"
                  className="w-full py-3 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-amber-900/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>Publish Requirement to Karigars</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
