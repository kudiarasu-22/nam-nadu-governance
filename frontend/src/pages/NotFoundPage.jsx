/**
 * Nam Nadu — 404 Not Found Page
 */
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-light dark:bg-surface-dark p-6">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
        <div className="text-8xl font-bold text-gradient mb-4">404</div>
        <h1 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark mb-2">Page Not Found</h1>
        <p className="text-text-secondary-light dark:text-text-secondary-dark mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/"><Button size="lg">Go Home</Button></Link>
      </motion.div>
    </div>
  );
}
