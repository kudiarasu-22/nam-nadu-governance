/**
 * Nam Nadu — MLA Login Page
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, useNotifications } from '@/context';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';
// We'll directly use localStorage and window.location to force a reload if context is tricky

export default function MLALogin() {
  const { mlaLogin, error, clearError, isLoading } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  const [form, setForm] = useState({ mla_id: '', password: '' });
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    const errors = {};
    const mlaRegex = /^TN-MLA-[A-Z]+-\d{3}$/;
    if (!form.mla_id.trim()) {
      errors.mla_id = 'MLA ID is required (e.g., TN-MLA-CHENNAI-001)';
    } else if (!mlaRegex.test(form.mla_id.trim())) {
      errors.mla_id = 'Invalid MLA ID format. Must be like TN-MLA-CHENNAI-001';
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
      await mlaLogin(form.mla_id, form.password);
      showToast('Signed in successfully as MLA!', 'success');
      navigate('/dashboard/mla', { replace: true });
    } catch (err) {
      // Error is handled by context
    }
  };

  const updateField = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent-100 dark:bg-accent-900/30 text-accent-600 dark:text-accent-400 mb-4">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark">MLA Portal</h1>
        <p className="text-text-secondary-light dark:text-text-secondary-dark mt-2">Secure access for Members of Legislative Assembly</p>
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
          label="MLA ID"
          placeholder="e.g., TN-MLA-CHENNAI-001"
          value={form.mla_id}
          onChange={updateField('mla_id')}
          error={formErrors.mla_id}
          id="login-mlaid"
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

        <Button type="submit" className="w-full h-12 text-lg mt-6" loading={isLoading} variant="accent">
          Access MLA Dashboard
        </Button>
      </form>
    </motion.div>
  );
}
