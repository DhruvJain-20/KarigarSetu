import React, { useState } from 'react';
import {
  X,
  Send,
  Briefcase,
  IndianRupee,
  Calendar,
  CheckCircle2,
  Sparkles,
  Phone,
  User,
  Clock,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { JobPost, JobApplicant, Language, TradeCategory, UserProfile } from '../types';
import { TRADE_META, TRANSLATIONS } from '../data/translations';

interface ApplyJobModalProps {
  job: JobPost;
  language: Language;
  currentUserProfile?: UserProfile | null;
  authUser?: any;
  onClose: () => void;
  onSubmitProposal: (proposal: Omit<JobApplicant, 'id' | 'appliedAt' | 'status'>) => void;
}

export const ApplyJobModal: React.FC<ApplyJobModalProps> = ({
  job,
  language,
  currentUserProfile,
  authUser,
  onClose,
  onSubmitProposal,
}) => {
  const t = TRANSLATIONS[language];
  const meta = TRADE_META[job.trade] || TRADE_META.handloom;

  const defaultName =
    currentUserProfile?.full_name ||
    authUser?.user_metadata?.full_name ||
    authUser?.user_metadata?.name ||
    '';
  const defaultPhone = currentUserProfile?.phone || '';

  const [applicantName, setApplicantName] = useState(defaultName);
  const [applicantPhone, setApplicantPhone] = useState(defaultPhone);
  const [applicantTrade, setApplicantTrade] = useState<TradeCategory>(job.trade);
  const [rateType, setRateType] = useState<'daily' | 'fixed'>(job.budgetType === 'daily' ? 'daily' : 'fixed');
  const [proposedRate, setProposedRate] = useState<number>(job.budgetAmount || 850);
  const [experienceYears, setExperienceYears] = useState<number>(5);
  const [proposalMessage, setProposalMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName.trim() || !applicantPhone.trim() || !proposalMessage.trim()) {
      alert('Please fill in your name, contact number, and proposal message.');
      return;
    }

    onSubmitProposal({
      jobId: job.id,
      applicantUserId: currentUserProfile?.id || authUser?.id,
      applicantName: applicantName.trim(),
      applicantPhone: applicantPhone.trim(),
      applicantTrade,
      proposedRate: Number(proposedRate),
      rateType,
      proposalMessage: proposalMessage.trim(),
      experienceYears: Number(experienceYears),
      applicantAvatar: currentUserProfile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80',
    });

    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 1600);
  };

  return (
    <div
      id="apply-job-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="apply-job-modal-card"
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in zoom-in-95"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-800 to-amber-950 text-white p-5 sm:p-6 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white bg-black/20 hover:bg-black/30 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <Send className="w-5 h-5 text-amber-300" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              {language === 'hi' ? 'नौकरी के लिए आवेदन करें' : 'Submit Job Proposal'}
            </h2>
          </div>
          <p className="text-xs text-amber-100/90 leading-relaxed">
            {language === 'hi'
              ? 'सीधे नियोक्ता को अपनी दर, अनुभव और काम का प्रस्ताव भेजें'
              : 'Directly send your quotation, experience, and message to the client'}
          </p>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          {submitted ? (
            <div className="py-10 text-center space-y-3">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                {language === 'hi' ? 'आवेदन सफलतापूर्वक भेजा गया!' : 'Proposal Submitted Successfully!'}
              </h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                {language === 'hi'
                  ? `नियोक्ता ${job.clientName} को आपका प्रस्ताव मिल गया है। वे समीक्षा के बाद आपसे संपर्क करेंगे।`
                  : `Client ${job.clientName} has received your proposal and will contact you directly on acceptance.`}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Job preview summary banner */}
              <div className="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200/80 space-y-1.5">
                <div className="flex justify-between items-start">
                  <h4 className="text-xs font-bold text-amber-950 line-clamp-1">{job.title}</h4>
                  <span className="px-2 py-0.5 rounded-md bg-amber-200/80 text-amber-900 font-extrabold text-[11px] shrink-0">
                    Budget: ₹{job.budgetAmount} {job.budgetType === 'daily' ? '/day' : 'fixed'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-amber-800">
                  <span>📍 {job.city}, {job.locality}</span>
                  <span>•</span>
                  <span>Client: {job.clientName}</span>
                </div>
              </div>

              {/* Applicant Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {language === 'hi' ? 'आपका नाम' : 'Your Full Name'} *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rameshwar Sharma"
                      value={applicantName}
                      onChange={(e) => setApplicantName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {language === 'hi' ? 'फोन / व्हाट्सएप नंबर' : 'Phone / WhatsApp'} *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 98290 12345"
                      value={applicantPhone}
                      onChange={(e) => setApplicantPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Trade & Experience */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {language === 'hi' ? 'आपका शिल्प / हुनर' : 'Your Craft Trade'}
                  </label>
                  <select
                    value={applicantTrade}
                    onChange={(e) => setApplicantTrade(e.target.value as TradeCategory)}
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
                    {language === 'hi' ? 'अनुभव (वर्षों में)' : 'Experience (Years)'}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none font-medium"
                  />
                </div>
              </div>

              {/* Proposed Rate */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {language === 'hi' ? 'दर का प्रकार' : 'Quotation Type'}
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setRateType('fixed')}
                      className={`flex-1 py-2 text-xs rounded-xl font-bold border transition-colors ${
                        rateType === 'fixed'
                          ? 'bg-amber-800 text-white border-amber-900'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {language === 'hi' ? 'कुल राशि (Fixed)' : 'Total Fixed (₹)'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setRateType('daily')}
                      className={`flex-1 py-2 text-xs rounded-xl font-bold border transition-colors ${
                        rateType === 'daily'
                          ? 'bg-amber-800 text-white border-amber-900'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {language === 'hi' ? 'प्रति दिन (Daily)' : 'Per Day (₹/day)'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {language === 'hi' ? 'आपकी प्रस्तावित दर (₹)' : 'Your Proposed Amount (₹)'} *
                  </label>
                  <div className="relative">
                    <span className="text-slate-400 font-bold absolute left-3 top-1/2 -translate-y-1/2 text-xs">₹</span>
                    <input
                      type="number"
                      required
                      min={100}
                      value={proposedRate}
                      onChange={(e) => setProposedRate(Number(e.target.value))}
                      className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none font-bold text-amber-950"
                    />
                  </div>
                </div>
              </div>

              {/* Proposal Cover Note */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {language === 'hi' ? 'काम का प्रस्ताव / विवरण' : 'Proposal Message / Cover Note'} *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder={
                    language === 'hi'
                      ? 'नियोक्ता को बताएं कि आप यह काम कैसे करेंगे, क्या तकनीक इस्तेमाल करेंगे और कितने दिनों में पूरा करेंगे...'
                      : 'Explain your craftsmanship, material approach, estimated timeframe, and why you are the best fit...'
                  }
                  value={proposalMessage}
                  onChange={(e) => setProposalMessage(e.target.value)}
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none resize-none leading-relaxed"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-amber-950/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Send className="w-4 h-4 text-amber-300" />
                  <span>{language === 'hi' ? 'प्रस्ताव भेजें' : 'Submit Proposal Now'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
