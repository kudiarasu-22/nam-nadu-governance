/**
 * Nam Nadu — Unauthorized Page
 */
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-light dark:bg-surface-dark p-6">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
        <div className="text-6xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark mb-2">Access Denied</h1>
        <p className="text-text-secondary-light dark:text-text-secondary-dark mb-8">You don't have permission to access this page. Contact your administrator if you believe this is an error.</p>
        <Link to="/"><Button size="lg">Go to Dashboard</Button></Link>
      </motion.div>
    </div>
  );
}
