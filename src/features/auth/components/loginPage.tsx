import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LogoIcon from '@/assets/icons/logo.svg?react';
import EyeIcon from '@/assets/icons/eye.svg?react';
import EyeOffIcon from '@/assets/icons/eye-off.svg?react';
import ArrowRightIcon from '@/assets/icons/arrow-right.svg?react';

export const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, isLoading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Login failed:', err);
      setError('Invalid email or password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = isSubmitting || authLoading;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-6">
            <LogoIcon className="w-12 h-12" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">{t('login.title')}</h1>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide"
              >
                {t('login.emailLabel')}
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('login.emailPlaceholder')}
                required
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6764f2] focus:border-transparent transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="password"
                  className="block text-xs font-medium text-gray-700 uppercase tracking-wide"
                >
                  {t('login.passwordLabel')}
                </label>
                <button
                  type="button"
                  className="text-xs text-[#6764f2] hover:underline font-medium"
                >
                  {t('login.forgotPassword')}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('login.passwordPlaceholder')}
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6764f2] focus:border-transparent transition-all pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeIcon className="w-5 h-5" />
                  ) : (
                    <EyeOffIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#6764f2] text-white font-medium py-3 rounded-lg hover:bg-[#5753d9] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  {t('login.signingIn')}
                </>
              ) : (
                <>
                  {t('login.signIn')}
                  <ArrowRightIcon className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          {t('login.noAccount')}{' '}
          <button className="text-[#6764f2] font-medium hover:underline">
            {t('login.createAccount')}
          </button>
        </p>

        <div className="flex items-center justify-center gap-6 mt-12">
          <button className="text-xs text-gray-500 hover:text-gray-700 transition-colors">
            {t('login.privacyPolicy')}
          </button>
          <button className="text-xs text-gray-500 hover:text-gray-700 transition-colors">
            {t('login.termsOfService')}
          </button>
          <button className="text-xs text-gray-500 hover:text-gray-700 transition-colors">
            {t('login.helpCenter')}
          </button>
        </div>
      </div>
    </div>
  );
};
