/**
 * Nam Nadu — CM Admin Login Page
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, useNotifications } from '@/context';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';

export default function CMLogin() {
  const { cmAdminLogin, error, clearError, isLoading } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    const errors = {};
    if (!form.email.trim()) {
      errors.email = 'Email is required';
    }
    if (!form.password) errors.password = 'Password is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    if (!validate()) return;
    try {
      await cmAdminLogin(form.email, form.password);
      showToast('Signed in successfully as CM Admin!', 'success');
      navigate('/dashboard/cm', { replace: true });
    } catch {
      // Error handled by AuthContext
    }
  };

  const updateField = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto mt-10"
    >
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-warning-100 dark:bg-warning-900/30 text-warning-600 dark:text-warning-400 mb-4">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark">CM Governance Portal</h1>
        <p className="text-text-secondary-light dark:text-text-secondary-dark mt-2">Secure access for Chief Minister Admin</p>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-4 rounded-xl bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 text-danger-600 dark:text-danger-400 text-sm"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="CM Admin Email"
          type="email"
          placeholder="e.g., cm@namnadu.gov.in"
          value={form.email}
          onChange={updateField('email')}
          error={formErrors.email}
          id="login-email"
          required
        />

        <div className="relative">
          <Input
            label="Secure Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            value={form.password}
            onChange={updateField('password')}
            error={formErrors.password}
            id="login-password"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[34px] text-text-secondary-light hover:text-text-primary-light transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        <Button type="submit" className="w-full h-12 text-lg mt-6" loading={isLoading} variant="warning">
          Access CM Dashboard
        </Button>
      </form>
    </motion.div>
  );
}
