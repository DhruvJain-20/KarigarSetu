import React from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  XCircle,
  IndianRupee,
  Briefcase
} from 'lucide-react';
import { BookingRequest, Language } from '../types';
import { TRADE_META, TRANSLATIONS } from '../data/translations';

interface BookingsViewProps {
  bookings: BookingRequest[];
  language: Language;
  onUpdateStatus: (id: string, status: BookingRequest['status']) => void;
}

export const BookingsView: React.FC<BookingsViewProps> = ({
  bookings,
  language,
  onUpdateStatus,
}) => {
  const t = TRANSLATIONS[language];

  const getStatusBadge = (status: BookingRequest['status']) => {
    switch (status) {
      case 'accepted':
        return {
          label: 'Confirmed / Accepted',
          bg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          icon: CheckCircle2,
        };
      case 'in_progress':
        return {
          label: 'Work In Progress',
          bg: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: Clock,
        };
      case 'completed':
        return {
          label: 'Completed & Paid',
          bg: 'bg-slate-100 text-slate-800 border-slate-200',
          icon: CheckCircle2,
        };
      case 'cancelled':
        return {
          label: 'Cancelled',
          bg: 'bg-red-100 text-red-800 border-red-200',
          icon: XCircle,
        };
      default:
        return {
          label: 'Pending Response',
          bg: 'bg-amber-100 text-amber-900 border-amber-200',
          icon: AlertCircle,
        };
    }
  };

  return (
    <div id="bookings-view-container" className="space-y-6">
      <div className="bg-white rounded-3xl border border-amber-900/10 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-amber-700" />
            <span>{t.myBookings}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Track your direct work requests, service dates, and direct communication with karigars.
          </p>
        </div>

        <span className="text-xs font-semibold bg-amber-50 text-amber-900 px-3 py-1.5 rounded-xl border border-amber-200/60 self-start sm:self-auto">
          {bookings.length} active inquiries
        </span>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Booking Requests Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Browse through our verified karigars directory and click "Request Booking" or use the direct WhatsApp link.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bookings.map((b) => {
            const badge = getStatusBadge(b.status);
            const BadgeIcon = badge.icon;
            const meta = TRADE_META[b.karigarTrade] || TRADE_META.handloom;

            return (
              <div
                key={b.id}
                id={`booking-card-${b.id}`}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-amber-400 transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">{b.karigarName}</h4>
                      <p className="text-xs font-medium text-amber-800">
                        {language === 'hi' ? meta.nameHi : meta.nameEn}
                      </p>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${badge.bg}`}
                    >
                      <BadgeIcon className="w-3 h-3" />
                      <span>{badge.label}</span>
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-700 space-y-1 mb-3">
                    <p className="font-semibold text-slate-900">Work Scope:</p>
                    <p className="italic text-slate-600 line-clamp-3 leading-relaxed">
                      "{b.jobDescription}"
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Date: {b.serviceDate}</span>
                    </div>

                    <div className="flex items-center gap-1.5 font-bold text-amber-950">
                      <IndianRupee className="w-3.5 h-3.5 text-amber-700" />
                      <span>Budget: ₹{b.estimatedBudget.toLocaleString('en-IN')}</span>
                    </div>

                    {b.clientAddress && (
                      <div className="col-span-2 flex items-center gap-1.5 text-slate-500 truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{b.clientAddress}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Toggles & Direct Connect */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-slate-500">Status:</span>
                    <select
                      value={b.status}
                      onChange={(e) => onUpdateStatus(b.id, e.target.value as BookingRequest['status'])}
                      className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 focus:outline-none"
                    >
                      <option value="pending">Pending</option>
                      <option value="accepted">Accepted</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${b.clientPhone.replace(/\s+/g, '')}`}
                      className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
                      title="Call Client / Karigar"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => {
                        const text = encodeURIComponent(
                          `Namaste! Checking on booking #${b.id} for ${b.karigarName} regarding work: ${b.jobDescription}`
                        );
                        window.open(`https://wa.me/?text=${text}`, '_blank');
                      }}
                      className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Chat</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
