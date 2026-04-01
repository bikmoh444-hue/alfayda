import React, { useState } from 'react';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { LogIn, Languages } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();

  const isConfigMissing = !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isConfigMissing) {
      setError(t('login.error.config'));
      return;
    }
    setError('');
    setLoading(true);

    if (email !== 'biktamohmad26@gmail.com') {
      setError(t('login.error.unauthorized'));
      setLoading(false);
      return;
    }

    try {
      const { error: err } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (err) throw err;
      navigate('/');
    } catch (err: any) {
      setError(t('login.error.invalid'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'fr' ? 'ar' : 'fr');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 relative">
        <button 
          onClick={toggleLanguage}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-orange-600 transition-colors flex items-center gap-2 text-sm"
        >
          <Languages size={18} />
          {language === 'fr' ? 'العربية' : 'Français'}
        </button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('login.title')}</h1>
          <p className="text-gray-500 mt-2">{t('login.subtitle')}</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('login.email')}</label>
            <input
              type="email"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('login.password')}</label>
            <input
              type="password"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          {isConfigMissing && (
            <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg text-orange-700 text-xs text-center">
              {t('login.error.config')}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {loading ? t('common.loading') : (
              <>
                <LogIn size={20} />
                {t('login.button')}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
