import React, { useState } from 'react';
import {
  Hammer,
  Mail,
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  ShoppingBag,
  Wrench,
  Globe,
  Loader2,
  KeyRound
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import { Language, UserRole } from '../types';

function GoogleIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

interface AuthPageProps {
  language: Language;
  onToggleLanguage: () => void;
  onAuthSuccess: () => void;
}

export function AuthPage({ language, onToggleLanguage, onAuthSuccess }: AuthPageProps) {
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot_password'>('login');

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('artisan');

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const resetForm = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleGoogleSignIn = async () => {
    resetForm();
    setIsGoogleLoading(true);
    try {
      // Store preferred role in localStorage so it can be picked up if it's a new profile
      try {
        localStorage.setItem('ks_pending_oauth_role', role);
      } catch (e) {
        // ignore storage errors
      }

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        setErrorMessage(error.message);
      }
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      setErrorMessage(err.message || 'Failed to initiate Google Sign In.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    resetForm();

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setErrorMessage(language === 'hi' ? 'कृपया ईमेल और पासवर्ड दर्ज करें' : 'Please enter your email and password.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password,
      });

      if (error) {
        if (error.message.toLowerCase().includes('invalid login credentials')) {
          setErrorMessage(
            language === 'hi'
              ? 'गलत ईमेल या पासवर्ड। कृपया पुनः जांचें।'
              : 'Invalid email or password. Please verify your credentials.'
          );
        } else if (error.message.toLowerCase().includes('email not confirmed')) {
          setErrorMessage(
            language === 'hi'
              ? 'कृपया पहले अपने ईमेल पर भेजे गए लिंक से खाता सत्यापित करें।'
              : 'Your email is not confirmed yet. Please check your inbox for the confirmation link.'
          );
        } else {
          setErrorMessage(error.message);
        }
        return;
      }

      if (data.session && data.user) {
        onAuthSuccess();
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setErrorMessage(err.message || 'An unexpected network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    resetForm();

    const cleanFullName = fullName.trim();
    const cleanEmail = email.trim();

    if (!cleanFullName || !cleanEmail || !password || !confirmPassword) {
      setErrorMessage(
        language === 'hi'
          ? 'कृपया सभी आवश्यक फ़ील्ड भरें।'
          : 'Please fill in all required fields.'
      );
      return;
    }

    if (password.length < 6) {
      setErrorMessage(
        language === 'hi'
          ? 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।'
          : 'Password must be at least 6 characters long.'
      );
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage(
        language === 'hi'
          ? 'पासवर्ड और पुष्टि पासवर्ड मेल नहीं खाते।'
          : 'Passwords do not match.'
      );
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: password,
        options: {
          data: {
            full_name: cleanFullName,
            role: role,
          },
        },
      });

      if (error) {
        if (error.message.toLowerCase().includes('already registered') || error.message.toLowerCase().includes('unique')) {
          setErrorMessage(
            language === 'hi'
              ? 'यह ईमेल पहले से पंजीकृत है। कृपया लॉगिन करें।'
              : 'An account with this email already exists. Please log in.'
          );
        } else if (error.message.toLowerCase().includes('rate limit') || error.message.toLowerCase().includes('rate_limit')) {
          setErrorMessage(
            language === 'hi'
              ? 'सुपाबेस ईमेल दर सीमा पार हो गई है (प्रति घंटे सीमित ईमेल)। कृपया कुछ मिनट प्रतीक्षा करें या सुपाबेस डैशबोर्ड में "Confirm email" बंद करें।'
              : 'Supabase email rate limit exceeded (built-in default limit is ~3 confirmation emails/hour). To create accounts instantly without waiting, disable "Confirm email" in your Supabase Auth settings.'
          );
        } else {
          setErrorMessage(error.message);
        }
        return;
      }

      if (data.user) {
        const realUserId = data.user.id;
        const defaultAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanFullName)}&backgroundColor=963e20,1d5c4a`;

        // Upsert the real profile record to Supabase profiles table
        const { error: profileError } = await supabase.from('profiles').upsert(
          {
            id: realUserId,
            full_name: cleanFullName,
            email: cleanEmail.toLowerCase(),
            role: role,
            language: language,
            avatar_url: defaultAvatar,
            created_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        );

        if (profileError) {
          console.warn('[Supabase] Warning inserting profile record:', profileError.message);
        }

        // If session was immediately provided (email confirmation disabled in Supabase)
        if (data.session) {
          setSuccessMessage(
            language === 'hi'
              ? 'खाता सफलतापूर्वक बनाया गया! स्वागत है।'
              : 'Account created successfully! Logging you in...'
          );
          setTimeout(() => {
            onAuthSuccess();
          }, 800);
        } else {
          // Email confirmation is required
          setSuccessMessage(
            language === 'hi'
              ? 'पंजीकरण सफल! यदि आवश्यक हो तो कृपया अपने ईमेल पर पुष्टि लिंक देखें और फिर लॉगिन करें।'
              : 'Registration successful! Please check your email to confirm your account, then log in.'
          );
          setAuthMode('login');
        }
      }
    } catch (err: any) {
      console.error('Sign up error:', err);
      setErrorMessage(err.message || 'An unexpected error occurred during signup.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    resetForm();

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage(
        language === 'hi'
          ? 'कृपया अपना पंजीकृत ईमेल दर्ज करें।'
          : 'Please enter your registered email address.'
      );
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: window.location.origin,
      });

      if (error) {
        setErrorMessage(error.message);
      } else {
        setSuccessMessage(
          language === 'hi'
            ? 'पासवर्ड रीसेट लिंक आपके ईमेल पर भेज दिया गया है। कृपया अपना इनबॉक्स देखें।'
            : 'Password reset link has been sent to your email. Please check your inbox.'
        );
      }
    } catch (err: any) {
      console.error('Password reset error:', err);
      setErrorMessage(err.message || 'Failed to send reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col justify-between selection:bg-[#963E20] selection:text-white">
      {/* Top Navbar */}
      <header className="w-full max-w-7xl mx-auto px-4 py-4 sm:py-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-[#963E20] flex items-center justify-center text-white shadow-md shadow-amber-950/10">
            <Hammer className="w-5 h-5 text-amber-200" />
          </div>
          <div>
            <span className="font-serif font-extrabold text-2xl text-[#963E20] tracking-tight block">
              KarigarSetu
            </span>
            <span className="text-[10px] font-bold text-amber-900 -mt-1 block">
              कारीगर सेतु • National Artisan Platform
            </span>
          </div>
        </div>

        {/* Language switch */}
        <button
          type="button"
          onClick={onToggleLanguage}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-amber-900/15 text-stone-800 text-xs font-bold shadow-xs hover:bg-amber-50 transition-colors"
        >
          <Globe className="w-3.5 h-3.5 text-[#1D5C4A]" />
          <span>{language === 'en' ? 'हिन्दी' : 'English'}</span>
        </button>
      </header>

      {/* Main Auth Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-amber-900/15 shadow-xl space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6F4EF] text-[#1D5C4A] text-xs font-bold mb-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Real Supabase Verified Authentication</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-serif tracking-tight">
              {authMode === 'login' && (language === 'hi' ? 'लॉगिन करें' : 'Welcome Back')}
              {authMode === 'signup' && (language === 'hi' ? 'नया खाता बनाएं' : 'Create an Account')}
              {authMode === 'forgot_password' && (language === 'hi' ? 'पासवर्ड रीसेट करें' : 'Reset Password')}
            </h1>

            <p className="text-xs sm:text-sm text-stone-600">
              {authMode === 'login' &&
                (language === 'hi'
                  ? 'अपने आधिकारिक कारीगर सेतु खाते में प्रवेश करें'
                  : 'Access your verified artisan or buyer portal')}
              {authMode === 'signup' &&
                (language === 'hi'
                  ? 'शिल्पकार व खरीदारों के राष्ट्रीय मंच से जुड़ें'
                  : 'Join India’s direct artisan & craft commerce network')}
              {authMode === 'forgot_password' &&
                (language === 'hi'
                  ? 'अपना पंजीकृत ईमेल दर्ज करें'
                  : 'Enter your email to receive recovery instructions')}
            </p>
          </div>

          {/* Feedback messages */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{successMessage}</div>
            </div>
          )}

          {/* LOGIN FORM */}
          {authMode === 'login' && (
            <div className="space-y-4">
              {/* Google OAuth Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading || isGoogleLoading}
                className="w-full py-3 px-4 rounded-xl bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 font-bold text-sm flex items-center justify-center gap-3 transition-all shadow-xs hover:border-stone-400 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {isGoogleLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-stone-600" />
                    <span>{language === 'hi' ? 'गूगल से कनेक्ट हो रहा है...' : 'Connecting to Google...'}</span>
                  </>
                ) : (
                  <>
                    <GoogleIcon className="w-4 h-4 shrink-0" />
                    <span>{language === 'hi' ? 'गूगल के साथ जारी रखें' : 'Continue with Google'}</span>
                  </>
                )}
              </button>

              <div className="relative flex items-center justify-center my-1">
                <div className="border-t border-stone-200 w-full"></div>
                <span className="bg-white px-3 text-[11px] font-semibold text-stone-400 uppercase tracking-wider shrink-0">
                  {language === 'hi' ? 'या ईमेल से लॉगिन करें' : 'or sign in with email'}
                </span>
                <div className="border-t border-stone-200 w-full"></div>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    {language === 'hi' ? 'ईमेल पता' : 'Email Address'}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#963E20]/20 focus:border-[#963E20] transition-all font-medium"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-stone-700">
                      {language === 'hi' ? 'पासवर्ड' : 'Password'}
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        resetForm();
                        setAuthMode('forgot_password');
                      }}
                      className="text-xs font-bold text-[#963E20] hover:text-[#80341A] transition-colors"
                    >
                      {language === 'hi' ? 'पासवर्ड भूल गए?' : 'Forgot Password?'}
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 sm:py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#963E20]/20 focus:border-[#963E20] transition-all font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || isGoogleLoading}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#963E20] hover:bg-[#80341A] text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-[#963E20]/20 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{language === 'hi' ? 'सत्यापित किया जा रहा है...' : 'Authenticating...'}</span>
                    </>
                  ) : (
                    <>
                      <span>{language === 'hi' ? 'लॉगिन करें' : 'Sign In'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="pt-2 text-center">
                <p className="text-xs text-stone-600">
                  {language === 'hi' ? 'खाता नहीं है?' : "Don't have an account?"}{' '}
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setAuthMode('signup');
                    }}
                    className="font-bold text-[#963E20] hover:underline"
                  >
                    {language === 'hi' ? 'नया खाता बनाएं (Sign Up)' : 'Sign Up'}
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* SIGN UP FORM */}
          {authMode === 'signup' && (
            <div className="space-y-4">
              {/* Google OAuth Button for Signup */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading || isGoogleLoading}
                className="w-full py-3 px-4 rounded-xl bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 font-bold text-sm flex items-center justify-center gap-3 transition-all shadow-xs hover:border-stone-400 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {isGoogleLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-stone-600" />
                    <span>{language === 'hi' ? 'गूगल से कनेक्ट हो रहा है...' : 'Connecting to Google...'}</span>
                  </>
                ) : (
                  <>
                    <GoogleIcon className="w-4 h-4 shrink-0" />
                    <span>{language === 'hi' ? 'गूगल के साथ साइन अप करें' : 'Sign up with Google'}</span>
                  </>
                )}
              </button>

              <div className="relative flex items-center justify-center my-1">
                <div className="border-t border-stone-200 w-full"></div>
                <span className="bg-white px-3 text-[11px] font-semibold text-stone-400 uppercase tracking-wider shrink-0">
                  {language === 'hi' ? 'या ईमेल से रजिस्टर करें' : 'or register with email'}
                </span>
                <div className="border-t border-stone-200 w-full"></div>
              </div>

              <form onSubmit={handleSignUp} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    {language === 'hi' ? 'पूरा नाम' : 'Full Name'}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder={language === 'hi' ? 'उदा. राजेश शर्मा' : 'e.g. Ramesh Kumar'}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#963E20]/20 focus:border-[#963E20] transition-all font-medium"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    {language === 'hi' ? 'ईमेल पता' : 'Email Address'}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#963E20]/20 focus:border-[#963E20] transition-all font-medium"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    {language === 'hi' ? 'पासवर्ड (कम से कम 6 अक्षर)' : 'Password (min. 6 characters)'}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 sm:py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#963E20]/20 focus:border-[#963E20] transition-all font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    {language === 'hi' ? 'पासवर्ड की पुष्टि करें' : 'Confirm Password'}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#963E20]/20 focus:border-[#963E20] transition-all font-medium"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || isGoogleLoading}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#963E20] hover:bg-[#80341A] text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-[#963E20]/20 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{language === 'hi' ? 'खाता बनाया जा रहा है...' : 'Creating Account...'}</span>
                    </>
                  ) : (
                    <>
                      <span>{language === 'hi' ? 'पंजीकरण पूरा करें' : 'Create Account'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="pt-2 text-center">
                <p className="text-xs text-stone-600">
                  {language === 'hi' ? 'पहले से खाता है?' : 'Already have an account?'}{' '}
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setAuthMode('login');
                    }}
                    className="font-bold text-[#963E20] hover:underline"
                  >
                    {language === 'hi' ? 'लॉगिन करें' : 'Log In'}
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* FORGOT PASSWORD FORM */}
          {authMode === 'forgot_password' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  {language === 'hi' ? 'पंजीकृत ईमेल पता' : 'Registered Email Address'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#963E20]/20 focus:border-[#963E20] transition-all font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-[#963E20] hover:bg-[#80341A] text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-[#963E20]/20 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{language === 'hi' ? 'भेजा जा रहा है...' : 'Sending Link...'}</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>{language === 'hi' ? 'रीसेट लिंक भेजें' : 'Send Reset Link'}</span>
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setAuthMode('login');
                  }}
                  className="text-xs font-bold text-stone-600 hover:text-stone-900"
                >
                  ← {language === 'hi' ? 'लॉगिन पर वापस जाएं' : 'Back to Log In'}
                </button>
              </div>
            </form>
          )}

        </div>
      </main>

      {/* Footer Info */}
      <footer className="py-4 text-center text-xs text-stone-500">
        <p>KarigarSetu • Powered by Verified Supabase Auth & Direct Zero-Commission Artisan Commerce</p>
      </footer>
    </div>
  );
}
