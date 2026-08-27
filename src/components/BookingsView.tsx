import React, { useState } from 'react';
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
  Briefcase,
  Trash2,
  RotateCw,
  Inbox,
  Send,
  UserCheck,
  Building
} from 'lucide-react';
import { BookingRequest, Language, UserProfile, Karigar } from '../types';
import { TRADE_META, TRANSLATIONS } from '../data/translations';

interface BookingsViewProps {
  bookings: BookingRequest[];
  language: Language;
  currentUserProfile?: UserProfile | null;
  authUser?: any;
  myKarigars?: Karigar[];
  onUpdateStatus: (id: string, status: BookingRequest['status']) => void;
  onDeleteBooking?: (id: string) => void;
  onRefreshBookings?: () => void;
}

export const BookingsView: React.FC<BookingsViewProps> = ({
  bookings,
  language,
  currentUserProfile,
  authUser,
  myKarigars = [],
  onUpdateStatus,
  onDeleteBooking,
  onRefreshBookings,
}) => {
  const t = TRANSLATIONS[language];
  const [filterType, setFilterType] = useState<'all' | 'incoming' | 'outgoing'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const myPhone = currentUserProfile?.phone?.replace(/\D/g, '') || '';
  const myName = (currentUserProfile?.name || '').trim().toLowerCase();
  const myKarigarIds = new Set(myKarigars.map((k) => k.id));
  const myKarigarNames = new Set(myKarigars.map((k) => k.name.trim().toLowerCase()));

  // Categorize a booking
  const isIncomingForMe = (b: BookingRequest) => {
    if (myKarigarIds.has(b.karigarId)) return true;
    if (myKarigarNames.has(b.karigarName.trim().toLowerCase())) return true;
    if (myName && b.karigarName.trim().toLowerCase() === myName) return true;
    return false;
  };

  const isOutgoingFromMe = (b: BookingRequest) => {
    const bClientPhone = b.clientPhone.replace(/\D/g, '');
    if (myPhone && bClientPhone && (bClientPhone.endsWith(myPhone) || myPhone.endsWith(bClientPhone))) {
      return true;
    }
    if (myName && b.clientName.trim().toLowerCase() === myName) {
      return true;
    }
    return false;
  };

  const incomingCount = bookings.filter(isIncomingForMe).length;
  const outgoingCount = bookings.filter(isOutgoingFromMe).length;

  const filteredBookings = bookings.filter((b) => {
    if (filterType === 'incoming' && !isIncomingForMe(b)) return false;
    if (filterType === 'outgoing' && !isOutgoingFromMe(b)) return false;
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;
    return true;
  });

  const handleManualRefresh = async () => {
    if (onRefreshBookings) {
      setIsRefreshing(true);
      await onRefreshBookings();
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const getStatusBadge = (status: BookingRequest['status']) => {
    switch (status) {
      case 'accepted':
        return {
          label: language === 'hi' ? 'स्वीकृत / Confirmed' : 'Confirmed / Accepted',
          bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          icon: CheckCircle2,
        };
      case 'in_progress':
        return {
          label: language === 'hi' ? 'प्रगति पर है' : 'Work In Progress',
          bg: 'bg-blue-100 text-blue-800 border-blue-300',
          icon: Clock,
        };
      case 'completed':
        return {
          label: language === 'hi' ? 'पूर्ण व भुगतान किया' : 'Completed & Paid',
          bg: 'bg-slate-100 text-slate-800 border-slate-300',
          icon: CheckCircle2,
        };
      case 'cancelled':
        return {
          label: language === 'hi' ? 'रद्द' : 'Cancelled',
          bg: 'bg-red-100 text-red-800 border-red-300',
          icon: XCircle,
        };
      default:
        return {
          label: language === 'hi' ? 'समीक्षाधीन / Pending' : 'Pending Response',
          bg: 'bg-amber-100 text-amber-900 border-amber-300',
          icon: AlertCircle,
        };
    }
  };

  return (
    <div id="bookings-view-container" className="space-y-6">
      {/* Top Banner & Refresh */}
      <div className="bg-white rounded-3xl border border-stone-200 p-5 sm:p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900 tracking-tight flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-[#963E20]" />
            <span>{language === 'hi' ? 'प्रत्यक्ष बुकिंग व पूछताछ' : 'Direct Bookings & Inquiries'}</span>
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            {language === 'hi'
              ? 'पोर्टफोलियो से आने वाली ग्राहकों की पूछताछ और आपके द्वारा भेजे गए सेवा अनुरोधों का प्रबंधन।'
              : 'Manage customer inquiries received for your artisan portfolio & track service requests you sent.'}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {onRefreshBookings && (
            <button
              id="btn-refresh-bookings"
              onClick={handleManualRefresh}
              className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#963E20]' : ''}`} />
              <span>{language === 'hi' ? 'रिफ्रेश' : 'Sync'}</span>
            </button>
          )}
          <span className="text-xs font-bold bg-[#FAF8F5] text-amber-900 px-3 py-2 rounded-xl border border-amber-200/80">
            {bookings.length} {language === 'hi' ? 'कुल अनुरोध' : 'Total Inquiries'}
          </span>
        </div>
      </div>

      {/* Filter Tabs Bar */}
      <div className="bg-white rounded-2xl border border-stone-200 p-3 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              filterType === 'all'
                ? 'bg-[#963E20] text-white shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <span>{language === 'hi' ? 'सभी पूछताछ' : 'All Inquiries'}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/20">
              {bookings.length}
            </span>
          </button>

          <button
            onClick={() => setFilterType('incoming')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              filterType === 'incoming'
                ? 'bg-[#1D5C4A] text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'मेरे पास आई पूछताछ' : 'Incoming for My Portfolio'}</span>
            {incomingCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-900/30 text-white">
                {incomingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setFilterType('outgoing')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              filterType === 'outgoing'
                ? 'bg-[#963E20] text-white shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'मेरे भेजे गए अनुरोध' : 'Sent by Me'}</span>
            {outgoingCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/20">
                {outgoingCount}
              </span>
            )}
          </button>
        </div>

        {/* Status Dropdown Filter */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs font-medium text-stone-500">{language === 'hi' ? 'स्थिति:' : 'Status:'}</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-semibold bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-1.5 text-stone-800 focus:outline-none cursor-pointer"
          >
            <option value="all">{language === 'hi' ? 'सभी स्थितियाँ' : 'All Statuses'}</option>
            <option value="pending">{language === 'hi' ? 'समीक्षाधीन (Pending)' : 'Pending'}</option>
            <option value="accepted">{language === 'hi' ? 'स्वीकृत (Accepted)' : 'Accepted'}</option>
            <option value="in_progress">{language === 'hi' ? 'कार्य प्रगति पर' : 'In Progress'}</option>
            <option value="completed">{language === 'hi' ? 'पूर्ण (Completed)' : 'Completed'}</option>
            <option value="cancelled">{language === 'hi' ? 'रद्द (Cancelled)' : 'Cancelled'}</option>
          </select>
        </div>
      </div>

      {/* Bookings Cards Grid */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-stone-200 p-12 text-center space-y-3">
          <Calendar className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="text-base font-bold text-stone-800">
            {language === 'hi' ? 'कोई पूछताछ या बुकिंग नहीं मिली' : 'No Booking Inquiries Found'}
          </h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            {filterType === 'incoming'
              ? language === 'hi'
                ? 'जब ग्राहक आपके कारीगर पोर्टफोलियो पर "Request Booking" पर क्लिक करेंगे, वे पूछताछ यहां दिखेंगी।'
                : 'When clients visit your artisan portfolio and click "Request Booking", their inquiries will appear here.'
              : filterType === 'outgoing'
              ? language === 'hi'
                ? 'जब आप किसी अन्य कारीगर के पोर्टफोलियो से काम का अनुरोध करेंगे, वह यहां दिखेगा।'
                : 'When you inquire or request work from another artisan, those requests will appear here.'
              : language === 'hi'
              ? 'कारीगर डायरेक्टरी देखें और काम के लिए "Request Booking" पर क्लिक करें।'
              : 'Browse our verified karigars directory and submit a direct booking request.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredBookings.map((b) => {
            const isIncoming = isIncomingForMe(b);
            const badge = getStatusBadge(b.status);
            const BadgeIcon = badge.icon;
            const meta = TRADE_META[b.karigarTrade] || TRADE_META.handloom;
            const cleanPhone = (isIncoming ? b.clientPhone : b.clientPhone).replace(/\D/g, '');

            return (
              <div
                key={b.id}
                id={`booking-card-${b.id}`}
                className={`bg-white rounded-2xl border p-5 shadow-2xs flex flex-col justify-between space-y-4 transition-all duration-200 ${
                  isIncoming
                    ? 'border-emerald-200 ring-1 ring-emerald-100 hover:border-emerald-400'
                    : 'border-stone-200 hover:border-amber-400'
                }`}
              >
                <div>
                  {/* Category Pill + Status */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      {isIncoming ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200 mb-1.5">
                          <Inbox className="w-3 h-3" />
                          <span>{language === 'hi' ? 'आपके पोर्टफोलियो हेतु पूछताछ' : 'Incoming Client Inquiry'}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-200 mb-1.5">
                          <Send className="w-3 h-3" />
                          <span>{language === 'hi' ? 'आपका भेजा गया अनुरोध' : 'Sent Work Request'}</span>
                        </span>
                      )}

                      <h4 className="font-extrabold text-stone-900 text-base">
                        {isIncoming ? b.clientName : b.karigarName}
                      </h4>
                      <p className="text-xs font-semibold text-amber-900">
                        {isIncoming
                          ? `Portfolio: ${b.karigarName} (${language === 'hi' ? meta.nameHi : meta.nameEn})`
                          : `Karigar: ${b.karigarName} (${language === 'hi' ? meta.nameHi : meta.nameEn})`}
                      </p>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border shrink-0 ${badge.bg}`}
                    >
                      <BadgeIcon className="w-3 h-3" />
                      <span>{badge.label}</span>
                    </span>
                  </div>

                  {/* Work Description Box */}
                  <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-100 text-xs text-stone-700 space-y-1 mb-3">
                    <div className="flex items-center justify-between text-[11px] font-bold text-stone-900">
                      <span>{language === 'hi' ? 'काम का विवरण (Work Scope):' : 'Work Scope & Details:'}</span>
                      <span className="text-stone-400 font-mono text-[10px]">
                        {new Date(b.createdAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <p className="text-stone-800 leading-relaxed font-medium">
                      "{b.jobDescription}"
                    </p>
                  </div>

                  {/* Booking Details Grid */}
                  <div className="grid grid-cols-2 gap-2.5 text-xs text-stone-600">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#963E20]" />
                      <span className="truncate">Date: <strong className="text-stone-900">{b.serviceDate || 'Immediate'}</strong></span>
                    </div>

                    <div className="flex items-center gap-1.5 font-bold text-amber-950">
                      <IndianRupee className="w-3.5 h-3.5 text-amber-700" />
                      <span>Budget: ₹{b.estimatedBudget.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="col-span-2 flex items-center gap-1.5 text-stone-600 truncate">
                      <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span className="font-mono text-xs truncate">
                        {isIncoming ? `Client Phone: ${b.clientPhone}` : `Contact: ${b.clientPhone}`}
                      </span>
                    </div>

                    {b.clientAddress && (
                      <div className="col-span-2 flex items-center gap-1.5 text-stone-500 truncate">
                        <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <span className="truncate">{b.clientAddress}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Selector & Communication Actions */}
                <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-stone-500">
                      {language === 'hi' ? 'स्थिति:' : 'Status:'}
                    </span>
                    <select
                      value={b.status}
                      onChange={(e) => onUpdateStatus(b.id, e.target.value as BookingRequest['status'])}
                      className="text-xs font-semibold bg-stone-50 border border-stone-200 rounded-lg px-2 py-1 text-stone-800 focus:outline-none cursor-pointer"
                    >
                      <option value="pending">Pending</option>
                      <option value="accepted">Accepted</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Call Button */}
                    <a
                      href={`tel:${cleanPhone}`}
                      className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl transition-colors"
                      title={language === 'hi' ? 'कॉल करें' : 'Call'}
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>

                    {/* WhatsApp Button */}
                    <button
                      onClick={() => {
                        const recipient = isIncoming ? b.clientName : b.karigarName;
                        const msg = encodeURIComponent(
                          `Namaste ${recipient} ji! Connecting regarding inquiry #${b.id.slice(0, 8)} for "${b.karigarName}" (${b.karigarTrade}) - Work: ${b.jobDescription}.`
                        );
                        const phoneParam = cleanPhone ? `${cleanPhone}` : '';
                        window.open(`https://wa.me/${phoneParam}?text=${msg}`, '_blank');
                      }}
                      className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </button>

                    {/* Delete Option */}
                    {onDeleteBooking && (
                      <button
                        onClick={() => {
                          if (
                            confirm(
                              language === 'hi'
                                ? 'क्या आप इस पूछताछ को हटाना चाहते हैं?'
                                : 'Delete this inquiry request from your list?'
                            )
                          ) {
                            onDeleteBooking(b.id);
                          }
                        }}
                        className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-colors cursor-pointer"
                        title={language === 'hi' ? 'हटाएं' : 'Delete'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
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
