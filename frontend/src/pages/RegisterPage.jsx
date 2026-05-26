/**
 * Nam Nadu — Register Page
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, useNotifications } from '@/context';
import { ROLES, ROLE_LABELS } from '@/config/roles';
import Button from '@/components/ui/Button';
import Input, { Select } from '@/components/ui/Input';
import { isValidEmail, isValidPhone } from '@/utils';
import { CheckCircle2, AlertCircle } from 'lucide-react';

const roleOptions = [
  { value: ROLES.CITIZEN, label: ROLE_LABELS[ROLES.CITIZEN] },
  { value: ROLES.OFFICER, label: ROLE_LABELS[ROLES.OFFICER] },
  { value: ROLES.LEADERSHIP_ADMIN, label: ROLE_LABELS[ROLES.LEADERSHIP_ADMIN] },
  { value: ROLES.VOLUNTEER, label: ROLE_LABELS[ROLES.VOLUNTEER] },
];

export default function RegisterPage() {
  const { register, error, clearError, isLoading } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();
  
  const [form, setForm] = useState({ 
    full_name: '', email: '', phone: '', password: '', confirmPassword: '', role: ROLES.CITIZEN,
    district: '', ward: '', address: '', department: '', officer_id: '', leadership_id: '', skills: '', interests: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState('');

  const validate = () => {
    const errors = {};
    if (!form.full_name.trim()) errors.full_name = 'Name is required';
    if (!form.email) errors.email = 'Email is required';
    else if (!isValidEmail(form.email)) errors.email = 'Invalid email format';
    if (!form.phone) errors.phone = 'Mobile number is required';
    else if (!isValidPhone(form.phone)) errors.phone = 'Invalid 10-digit mobile number';
    if (!form.password) errors.password = 'Password is required';
    else if (form.password.length < 8) errors.password = 'Minimum 8 characters';
    if (form.password !== form.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    
    // Role specific validation
    if (form.role === ROLES.OFFICER) {
      if (!form.department) errors.department = 'Department is required';
      if (!form.officer_id) errors.officer_id = 'Officer ID is required';
    } else if (form.role === ROLES.LEADERSHIP_ADMIN) {
      if (!form.leadership_id) errors.leadership_id = 'Leadership ID is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const calculatePasswordStrength = (pwd) => {
    if (!pwd) return 0;
    let strength = 0;
    if (pwd.length >= 8) strength += 25;
    if (/[A-Z]/.test(pwd)) strength += 25;
    if (/[0-9]/.test(pwd)) strength += 25;
    if (/[^A-Za-z0-9]/.test(pwd)) strength += 25;
    return strength;
  };

  const pwdStrength = calculatePasswordStrength(form.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    if (!validate()) return;
    try {
      const payload = form;
      const userData = {
        full_name: payload.full_name,
        email: payload.email,
        phone: payload.phone,
        password: payload.password,
        role: payload.role,
        ward: payload.ward,
      };
      await register(userData);
      showToast('Account created successfully!', 'success');
      setSuccessMsg('Account created successfully! Redirecting...');
      setTimeout(() => navigate('/login'), 2000);
    } catch { /* handled by AuthContext */ }
  };

  const updateField = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark">Create Account</h1>
        <p className="text-text-secondary-light dark:text-text-secondary-dark mt-2">Join the Nam Nadu governance platform</p>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6 p-4 rounded-xl bg-danger-50 text-danger-600 text-sm flex items-start gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </motion.div>
        )}
        {successMsg && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6 p-4 rounded-xl bg-success-50 text-success-600 text-sm flex items-start gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <p>{successMsg}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Full Name" placeholder="e.g., Anbuselvan" value={form.full_name} onChange={updateField('full_name')} error={formErrors.full_name} required />
          <Select label="Role" options={roleOptions} value={form.role} onChange={updateField('role')} required />
          <Input label="Email Address" type="email" placeholder="name@example.com" value={form.email} onChange={updateField('email')} error={formErrors.email} required />
          <Input label="Mobile Number" type="tel" placeholder="10-digit mobile number" value={form.phone} onChange={updateField('phone')} error={formErrors.phone} required />
          
          <div className="space-y-2">
            <Input label="Password" type="password" placeholder="Create a password" value={form.password} onChange={updateField('password')} error={formErrors.password} required />
            {form.password && (
              <div className="flex gap-1 h-1.5 mt-1">
                {[25, 50, 75, 100].map((level) => (
                  <div key={level} className={`flex-1 rounded-full ${pwdStrength >= level ? (pwdStrength > 50 ? 'bg-success-500' : 'bg-warning-500') : 'bg-border-light dark:bg-border-dark'}`} />
                ))}
              </div>
            )}
          </div>
          <Input label="Confirm Password" type="password" placeholder="Confirm your password" value={form.confirmPassword} onChange={updateField('confirmPassword')} error={formErrors.confirmPassword} required />
          
          <Input label="District" placeholder="e.g., Chennai" value={form.district} onChange={updateField('district')} />
          <Input label="Ward/Area" placeholder="e.g., Ward 142" value={form.ward} onChange={updateField('ward')} />
        </div>

        {/* Role Specific Fields */}
        <div className="mt-6 p-4 bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark space-y-4">
          <h3 className="font-semibold text-sm text-text-secondary-light">Role Specific Details</h3>
          
          {form.role === ROLES.CITIZEN && (
            <Input label="Residential Address" placeholder="Enter your full address" value={form.address} onChange={updateField('address')} />
          )}

          {form.role === ROLES.OFFICER && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Department" placeholder="e.g., Public Works" value={form.department} onChange={updateField('department')} error={formErrors.department} required />
              <Input label="Officer ID" placeholder="e.g., TN-PWD-842" value={form.officer_id} onChange={updateField('officer_id')} error={formErrors.officer_id} required />
            </div>
          )}

          {form.role === ROLES.LEADERSHIP_ADMIN && (
            <Input label="Leadership/Admin ID" placeholder="Enter your assigned admin ID" value={form.leadership_id} onChange={updateField('leadership_id')} error={formErrors.leadership_id} required />
          )}

          {form.role === ROLES.VOLUNTEER && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Skills (Comma separated)" placeholder="e.g., First Aid, Teaching" value={form.skills} onChange={updateField('skills')} />
              <Input label="Volunteer Interest" placeholder="e.g., Health, Education" value={form.interests} onChange={updateField('interests')} />
            </div>
          )}
        </div>

        <Button type="submit" className="w-full h-12 text-lg mt-6" loading={isLoading}>Create Account</Button>
      </form>

      <p className="mt-8 text-center text-sm text-text-secondary-light dark:text-text-secondary-dark">
        Already have an account?{' '}
        <Link to="/login" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">Sign in instead</Link>
      </p>
    </motion.div>
  );
}
