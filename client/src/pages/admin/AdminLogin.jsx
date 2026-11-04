import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getApiError } from '../../api/http.js';
import { homePathFor, useAuth } from '../../context/AuthContext.jsx';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const user = await login({ email: formData.email, password: formData.password });
      navigate(homePathFor(user), { replace: true });
    } catch (err) {
      setError(getApiError(err).message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-['Rajdhani',sans-serif]">
      {/* Background ambient neon glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 flex items-center justify-center">
        <div className="w-[500px] h-[500px] bg-[#00e5ff]/10 rounded-full blur-[140px] opacity-70"></div>
        <div className="w-[450px] h-[450px] bg-[#8b3dff]/15 rounded-full blur-[150px] -translate-y-20 translate-x-24 opacity-60"></div>
      </div>

      <div className="w-full max-w-md">
        {/* Terminal Header / Security Badge */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#00e5ff]/30 bg-[#00e5ff]/10 text-[#00e5ff] text-xs font-semibold tracking-widest uppercase mb-4">
            <span className="w-2 h-2 rounded-full bg-[#00e5ff] animate-ping"></span>
            <span>RESTRICTED ACCESS • ADMIN CONSOLE</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-wider text-white font-['Orbitron',sans-serif]">
            OVERSEER <span className="text-[#00e5ff] drop-shadow-[0_0_12px_rgba(0,229,255,0.8)]">LOGIN</span>
          </h1>
          <p className="mt-2 text-sm text-[#9aa7c1] tracking-wide">
            Authorized personnel only. All access attempts are logged and monitored.
          </p>
        </div>

        {/* Login Card */}
        <div className="relative rounded-2xl bg-[#0d0f24]/90 backdrop-blur-xl border border-[#00e5ff]/25 p-8 shadow-[0_0_35px_rgba(0,229,255,0.15)] transition-all">
          {/* Top subtle neon line */}
          <div className="absolute top-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-[#00e5ff] to-transparent"></div>

          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/40 text-red-400 text-sm flex items-start gap-2 animate-fadeIn">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#9aa7c1] mb-2 font-['Orbitron',sans-serif]">
                Administrator Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#00e5ff]">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
                  </svg>
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="admin@buildathon.local"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-[#070714] border border-[#00e5ff]/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00e5ff] focus:ring-1 focus:ring-[#00e5ff] shadow-inner transition-colors text-base"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#9aa7c1] font-['Orbitron',sans-serif]">
                  Security Passkey
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs text-[#00e5ff] hover:text-[#ff2bd6] transition-colors focus:outline-none"
                >
                  {showPassword ? 'HIDE' : 'SHOW'}
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#00e5ff]">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-[#070714] border border-[#00e5ff]/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#00e5ff] focus:ring-1 focus:ring-[#00e5ff] shadow-inner transition-colors text-base"
                />
              </div>
            </div>

            {/* Checkbox & Security notice */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-gray-700 bg-[#070714] text-[#00e5ff] focus:ring-[#00e5ff] focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-[#9aa7c1] hover:text-white transition-colors">Keep session active</span>
              </label>

              <span className="text-xs text-[#9aa7c1]/70">Single Seeded Account</span>
            </div>

            {/* Sign In Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full relative group overflow-hidden py-3.5 px-6 rounded-xl font-['Orbitron',sans-serif] font-bold text-sm tracking-wider uppercase text-black bg-gradient-to-r from-[#00e5ff] via-[#67e8f9] to-[#8b3dff] hover:brightness-110 active:scale-[0.99] transition-all shadow-[0_0_20px_rgba(0,229,255,0.4)] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    AUTHENTICATING...
                  </>
                ) : (
                  <>
                    <span>AUTHENTICATE & ENTER</span>
                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </span>
            </button>
          </form>
        </div>

        {/* Back navigation */}
        <div className="mt-6 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs text-[#9aa7c1] hover:text-[#00e5ff] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Return to Public Homepage</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
