/**
 * Nam Nadu — Login Page
 */
import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, useNotifications } from '@/context';
import { ROLES, ROLE_LABELS, getDefaultDashboard } from '@/config/roles';
import Button from '@/components/ui/Button';
import Input, { Select } from '@/components/ui/Input';
import { isValidEmail, isValidPhone } from '@/utils';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';

const roleOptions = [
  { value: ROLES.CITIZEN, label: ROLE_LABELS[ROLES.CITIZEN] },
  { value: ROLES.OFFICER, label: ROLE_LABELS[ROLES.OFFICER] },
  { value: ROLES.LEADERSHIP_ADMIN, label: ROLE_LABELS[ROLES.LEADERSHIP_ADMIN] },
  { value: ROLES.VOLUNTEER, label: ROLE_LABELS[ROLES.VOLUNTEER] },
];

export default function LoginPage() {
  const { login, error, clearError, isLoading } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname;

  const [form, setForm] = useState({ identifier: '', password: '', role: ROLES.CITIZEN });
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const validate = () => {
    const errors = {};
    if (!form.identifier.trim()) {
      errors.identifier = 'Email or Mobile Number is required';
    } else if (!isValidEmail(form.identifier) && !isValidPhone(form.identifier)) {
      errors.identifier = 'Enter a valid email or 10-digit mobile number';
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
      // In a real app, you might validate role or use the identifier
      // For this implementation, we use the identifier as email
      const data = await login(form.identifier, form.password);
      showToast('Signed in successfully!', 'success');
      navigate(from || getDefaultDashboard(data.user.role), { replace: true });
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
      className="w-full max-w-md mx-auto"
    >
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 mb-4">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark">Welcome Back</h1>
        <p className="text-text-secondary-light dark:text-text-secondary-dark mt-2">Sign in to your Nam Nadu account</p>
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
          label="Email or Mobile Number"
          placeholder="Enter your email or 10-digit mobile number"
          value={form.identifier}
          onChange={updateField('identifier')}
          error={formErrors.identifier}
          id="login-identifier"
          required
        />

        <div className="relative">
          <Input
            label="Password"
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

        <Select
          label="Role"
          options={roleOptions}
          value={form.role}
          onChange={updateField('role')}
          id="login-role"
          required
        />

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="rounded border-border-light text-primary-600 focus:ring-primary-500"
            />
            <span className="text-text-secondary-light dark:text-text-secondary-dark">Remember me</span>
          </label>
          <a href="#" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
            Forgot password?
          </a>
        </div>

        <Button type="submit" className="w-full h-12 text-lg mt-6" loading={isLoading}>
          Sign In
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-text-secondary-light dark:text-text-secondary-dark">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
          Create an account
        </Link>
      </p>
    </motion.div>
  );
}
