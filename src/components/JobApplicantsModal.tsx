import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  MessageSquare,
  Award,
  Calendar,
  IndianRupee,
  UserCheck,
  ShieldCheck,
  Sparkles,
  Users,
  Briefcase,
  RotateCw
} from 'lucide-react';
import { JobPost, JobApplicant, Language } from '../types';
import { TRADE_META } from '../data/translations';

interface JobApplicantsModalProps {
  job: JobPost;
  language: Language;
  onClose: () => void;
  onUpdateApplicantStatus: (
    jobId: string,
    applicantId: string,
    status: 'pending' | 'accepted' | 'rejected'
  ) => void;
  onRefresh?: () => Promise<void> | void;
}

export const JobApplicantsModal: React.FC<JobApplicantsModalProps> = ({
  job,
  language,
  onClose,
  onUpdateApplicantStatus,
  onRefresh,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [localApplicants, setLocalApplicants] = useState<JobApplicant[]>(job.applicants || []);

  useEffect(() => {
    setLocalApplicants(job.applicants || []);
  }, [job.applicants]);

  const handleRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      await onRefresh();
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const handleStatusChange = (applicantId: string, newStatus: 'pending' | 'accepted' | 'rejected') => {
    setLocalApplicants((prev) =>
      prev.map((a) => (a.id === applicantId ? { ...a, status: newStatus } : a))
    );
    onUpdateApplicantStatus(job.id, applicantId, newStatus);
  };

  const filteredApplicants = localApplicants.filter((a) => {
    if (filter === 'all') return true;
    return a.status === filter;
  });

  const pendingCount = localApplicants.filter((a) => a.status === 'pending').length;
  const acceptedCount = localApplicants.filter((a) => a.status === 'accepted').length;
  const rejectedCount = localApplicants.filter((a) => a.status === 'rejected').length;

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone.replace(/\s+/g, '')}`;
  };

  const handleWhatsApp = (applicant: JobApplicant) => {
    const msg = encodeURIComponent(
      `Namaste ${applicant.applicantName} ji! I reviewed your proposal for the "${job.title}" requirement on KarigarSetu and would like to proceed.`
    );
    const cleanPhone = applicant.applicantPhone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
  };

  return (
    <div
      id="job-applicants-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="job-applicants-modal-card"
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in zoom-in-95"
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
            <Users className="w-5 h-5 text-amber-300" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              {language === 'hi' ? 'आवेदक व प्रस्ताव प्रबंधन' : 'Review & Manage Applicants'}
            </h2>
          </div>
          <p className="text-xs text-amber-100/90 leading-relaxed line-clamp-1">
            Requirement: <span className="font-semibold text-white">{job.title}</span>
          </p>
        </div>

        {/* Filter Pills */}
        <div className="p-4 bg-stone-50 border-b border-stone-200 flex flex-wrap gap-2 items-center justify-between">
          <div className="flex gap-1.5 overflow-x-auto pb-0.5">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                filter === 'all'
                  ? 'bg-amber-800 text-white'
                  : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
              }`}
            >
              All ({localApplicants.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                filter === 'pending'
                  ? 'bg-amber-800 text-white'
                  : 'bg-white text-amber-900 border border-amber-200 hover:bg-amber-50'
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setFilter('accepted')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                filter === 'accepted'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-white text-emerald-800 border border-emerald-200 hover:bg-emerald-50'
              }`}
            >
              Accepted ({acceptedCount})
            </button>
            <button
              onClick={() => setFilter('rejected')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                filter === 'rejected'
                  ? 'bg-red-700 text-white'
                  : 'bg-white text-red-800 border border-red-200 hover:bg-red-50'
              }`}
            >
              Rejected ({rejectedCount})
            </button>
          </div>

          <div className="flex items-center gap-3">
            {onRefresh && (
              <button
                type="button"
                onClick={handleRefresh}
                className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                title={language === 'hi' ? 'आवेदक रिफ्रेश करें' : 'Refresh applicants from database'}
              >
                <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-800' : ''}`} />
                <span>{language === 'hi' ? 'रिफ्रेश' : 'Refresh'}</span>
              </button>
            )}
            <div className="text-[11px] text-stone-500 font-medium">
              Budget: <span className="font-bold text-stone-800">₹{job.budgetAmount}</span>
            </div>
          </div>
        </div>

        {/* Applicants List */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {filteredApplicants.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Users className="w-10 h-10 text-stone-300 mx-auto" />
              <h4 className="font-bold text-stone-800 text-sm">
                {language === 'hi' ? 'कोई आवेदक नहीं मिला' : 'No Applicants in this Filter'}
              </h4>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                {language === 'hi'
                  ? 'जब कोई कारीगर इस काम के लिए आवेदन करेगा, वह यहां दिखेगा।'
                  : 'When artisans apply for this job requirement, their proposals and contact info will appear here.'}
              </p>
            </div>
          ) : (
            filteredApplicants.map((applicant) => {
              const meta = applicant.applicantTrade ? TRADE_META[applicant.applicantTrade] : null;

              return (
                <div
                  key={applicant.id}
                  className={`bg-white rounded-2xl border p-4 transition-all duration-200 space-y-3 ${
                    applicant.status === 'accepted'
                      ? 'border-emerald-300 shadow-sm ring-1 ring-emerald-200 bg-emerald-50/20'
                      : applicant.status === 'rejected'
                      ? 'border-stone-200 opacity-60 bg-stone-50'
                      : 'border-stone-200 shadow-sm'
                  }`}
                >
                  {/* Top row: Avatar + Name + Proposed wage */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={applicant.applicantAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80'}
                        alt={applicant.applicantName}
                        className="w-12 h-12 rounded-2xl object-cover border border-amber-200 shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-stone-900 text-sm">{applicant.applicantName}</h4>
                          {applicant.status === 'accepted' && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1 border border-emerald-300">
                              <CheckCircle2 className="w-3 h-3" />
                              Accepted
                            </span>
                          )}
                          {applicant.status === 'rejected' && (
                            <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold flex items-center gap-1 border border-red-200">
                              <XCircle className="w-3 h-3" />
                              Rejected
                            </span>
                          )}
                          {applicant.status === 'pending' && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold flex items-center gap-1 border border-amber-200">
                              <Clock className="w-3 h-3" />
                              Pending Review
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-stone-500 flex items-center gap-2 mt-0.5">
                          {meta && <span>{language === 'hi' ? meta.nameHi : meta.nameEn}</span>}
                          {applicant.experienceYears && (
                            <>
                              <span>•</span>
                              <span>{applicant.experienceYears} yrs exp</span>
                            </>
                          )}
                          <span>•</span>
                          <span className="text-[11px] text-stone-400">
                            {new Date(applicant.appliedAt).toLocaleDateString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] uppercase font-bold text-stone-400 block">Proposed Quotation</span>
                      <span className="text-base font-extrabold text-amber-900">
                        ₹{applicant.proposedRate.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-stone-500 block">
                        {applicant.rateType === 'daily' ? '/day' : 'total fixed'}
                      </span>
                    </div>
                  </div>

                  {/* Proposal message box */}
                  <div className="bg-stone-50 p-3 rounded-xl border border-stone-100 text-xs text-stone-700 leading-relaxed font-medium">
                    "{applicant.proposalMessage}"
                  </div>

                  {/* Action row: Accept / Reject / Call / WhatsApp */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-stone-100">
                    <div className="flex items-center gap-2 text-xs font-mono text-stone-600">
                      <Phone className="w-3.5 h-3.5 text-stone-400" />
                      <span>{applicant.applicantPhone}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Direct contact shortcuts (enabled if accepted or in review) */}
                      <button
                        onClick={() => handleCall(applicant.applicantPhone)}
                        className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold flex items-center gap-1.5 transition-colors"
                        title="Call Applicant"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Call</span>
                      </button>

                      <button
                        onClick={() => handleWhatsApp(applicant)}
                        className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                        title="WhatsApp Applicant"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">WhatsApp</span>
                      </button>

                      {/* Accept / Reject controls */}
                      {applicant.status !== 'accepted' && (
                        <button
                          onClick={() => handleStatusChange(applicant.id, 'accepted')}
                          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Accept</span>
                        </button>
                      )}

                      {applicant.status !== 'rejected' && (
                        <button
                          onClick={() => handleStatusChange(applicant.id, 'rejected')}
                          className="px-3.5 py-2 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
