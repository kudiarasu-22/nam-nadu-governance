/**
 * Nam Nadu — MLA Registration Page
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '@/context';
import { leadershipService } from '@/services/leadership.service';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { ShieldCheck, CheckCircle } from 'lucide-react';

export default function MLARegister() {
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    district: '',
    ward: '',
    party: '',
    password: '',
    confirmPassword: ''
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successData, setSuccessData] = useState(null);

  const validate = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = 'Full Name is required';
    if (!form.district.trim()) errors.district = 'District is required';
    if (!form.ward.trim()) errors.ward = 'Ward / Constituency is required';
    if (!form.party.trim()) errors.party = 'Political Party is required';
    if (!form.password) errors.password = 'Password is required';
    if (form.password !== form.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!validate()) return;
    
    setLoading(true);
    try {
      const data = await leadershipService.mlaRegister(form);
      setSuccessData(data);
      showToast('Registration successful!', 'success');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  if (successData) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md mx-auto mt-10 text-center"
      >
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-success-100 text-success-600 mb-6">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark mb-4">Registration Successful</h2>
        <p className="text-text-secondary-light dark:text-text-secondary-dark mb-6">
          Your profile has been validated against the master database.
        </p>
        <div className="bg-bg-card-light dark:bg-bg-card-dark border rounded-xl p-6 mb-8 shadow-sm">
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-2">Your Auto-Generated MLA ID</p>
          <p className="text-2xl font-mono font-bold text-accent-600 dark:text-accent-400 select-all">
            {successData.mla_id}
          </p>
          <p className="text-xs text-warning-600 mt-4 font-semibold">Please save this ID for future logins. It cannot be changed.</p>
        </div>
        <Button onClick={() => navigate('/leadership/login')} className="w-full" variant="accent">
          Proceed to Login
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-lg mx-auto my-8"
    >
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent-100 dark:bg-accent-900/30 text-accent-600 dark:text-accent-400 mb-4">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark">MLA Registration</h1>
        <p className="text-text-secondary-light dark:text-text-secondary-dark mt-2">Validate your identity against the electoral registry</p>
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

      <form onSubmit={handleSubmit} className="space-y-4 bg-bg-card-light dark:bg-bg-card-dark p-6 rounded-2xl shadow-sm border border-border-light dark:border-border-dark">
        <Input
          label="Full Name (As per records)"
          value={form.name}
          onChange={updateField('name')}
          error={formErrors.name}
          required
        />
        
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Mobile Number"
            value={form.phone}
            onChange={updateField('phone')}
          />
          <Input
            label="Email Address"
            type="email"
            value={form.email}
            onChange={updateField('email')}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="District"
            placeholder="e.g., Chennai"
            value={form.district}
            onChange={updateField('district')}
            error={formErrors.district}
            required
          />
          <Input
            label="Ward / Constituency"
            placeholder="e.g., Kolathur"
            value={form.ward}
            onChange={updateField('ward')}
            error={formErrors.ward}
            required
          />
        </div>

        <Input
          label="Political Party"
          placeholder="e.g., DMK, AIADMK"
          value={form.party}
          onChange={updateField('party')}
          error={formErrors.party}
          required
        />

        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border-light dark:border-border-dark mt-4">
          <Input
            label="Create Password"
            type="password"
            value={form.password}
            onChange={updateField('password')}
            error={formErrors.password}
            required
          />
          <Input
            label="Confirm Password"
            type="password"
            value={form.confirmPassword}
            onChange={updateField('confirmPassword')}
            error={formErrors.confirmPassword}
            required
          />
        </div>

        <Button type="submit" className="w-full h-12 text-lg mt-6" loading={loading} variant="accent">
          Validate & Register
        </Button>
      </form>
      
      <div className="text-center mt-6">
        <button onClick={() => navigate('/leadership/login')} className="text-accent-600 hover:underline font-medium text-sm">
          Already registered? Login here
        </button>
      </div>
    </motion.div>
  );
}
