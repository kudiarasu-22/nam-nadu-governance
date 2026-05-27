import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Building2 } from 'lucide-react';

export default function LeadershipPage() {
  const navigate = useNavigate();

  const portals = [
    {
      title: "MLA Portal",
      description: "Monitor your ward, complaints, projects, officers, and emergency alerts.",
      icon: <Building2 className="w-10 h-10 text-accent-600 dark:text-accent-400" />,
      color: "bg-accent-50 dark:bg-accent-900/20 border-accent-200 dark:border-accent-800",
      buttonText: "MLA Login",
      action: () => navigate('/mla/login'),
      secondaryAction: { text: "MLA Register", onClick: () => navigate('/leadership/register') }
    },
    {
      title: "CM Portal",
      description: "Monitor Tamil Nadu statewide governance, district performance, MLA performance, complaints, and projects.",
      icon: <ShieldCheck className="w-10 h-10 text-warning-600 dark:text-warning-400" />,
      color: "bg-warning-50 dark:bg-warning-900/20 border-warning-200 dark:border-warning-800",
      buttonText: "CM Admin Login",
      action: () => navigate('/cm/login')
    }
  ];

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-accent-400/10 blur-3xl" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-warning-400/10 blur-3xl" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center z-10 mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold text-text-primary-light dark:text-text-primary-dark mb-4">
          Leadership <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-600 to-warning-600">Portal</span>
        </h1>
        <p className="text-lg text-text-secondary-light dark:text-text-secondary-dark max-w-2xl mx-auto">
          Exclusive access for state leaders and administrators.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full z-10">
        {portals.map((portal, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`flex flex-col p-6 rounded-2xl border backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 ${portal.color}`}
          >
            <div className="mb-6 flex justify-center">
              <div className="p-4 bg-white dark:bg-bg-dark rounded-full shadow-sm">
                {portal.icon}
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-center text-text-primary-light dark:text-text-primary-dark mb-2">
              {portal.title}
            </h2>
            <p className="text-center text-text-secondary-light dark:text-text-secondary-dark mb-6 flex-grow">
              {portal.description}
            </p>

            <div className="flex flex-col gap-3 mt-auto">
              <button 
                onClick={portal.action}
                className="w-full py-3 px-4 rounded-xl font-semibold text-white shadow-sm transition-transform active:scale-95 bg-black dark:bg-white dark:text-black hover:bg-black/80 dark:hover:bg-white/80"
              >
                {portal.buttonText}
              </button>
              
              {portal.secondaryAction && (
                <button 
                  onClick={portal.secondaryAction.onClick}
                  className="w-full py-3 px-4 rounded-xl font-semibold border-2 transition-transform active:scale-95 border-black/10 dark:border-white/10 text-text-primary-light dark:text-text-primary-dark hover:bg-black/5 dark:hover:bg-white/5"
                >
                  {portal.secondaryAction.text}
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
