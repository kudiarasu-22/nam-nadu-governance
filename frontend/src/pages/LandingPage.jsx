import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, UserCog, Building2 } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  const portals = [
    {
      title: "Citizen & Officer Services",
      description: "Raise complaints, track issues, and manage civic duties.",
      icon: <UserCog className="w-10 h-10 text-primary-600 dark:text-primary-400" />,
      color: "bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800",
      buttonText: "Enter Portal",
      action: () => navigate('/login'),
      roles: "Citizens & Officers"
    },
    {
      title: "MLA Leadership Portal",
      description: "Monitor governance, projects, and emergency alerts in your ward.",
      icon: <Building2 className="w-10 h-10 text-accent-600 dark:text-accent-400" />,
      color: "bg-accent-50 dark:bg-accent-900/20 border-accent-200 dark:border-accent-800",
      buttonText: "MLA Login",
      action: () => navigate('/mla/login'),
      secondaryAction: { text: "Register", onClick: () => navigate('/leadership/register') },
      roles: "Members of Legislative Assembly"
    },
    {
      title: "Chief Minister Governance",
      description: "Supervise statewide analytics, district monitoring, and MLA performance.",
      icon: <ShieldCheck className="w-10 h-10 text-warning-600 dark:text-warning-400" />,
      color: "bg-warning-50 dark:bg-warning-900/20 border-warning-200 dark:border-warning-800",
      buttonText: "CM Admin Login",
      action: () => navigate('/cm/login'),
      roles: "Chief Minister & State Admins"
    }
  ];

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-primary-400/10 blur-3xl" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-accent-400/10 blur-3xl" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center z-10 mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold text-text-primary-light dark:text-text-primary-dark mb-4">
          Nam Nadu <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-600">Governance Platform</span>
        </h1>
        <p className="text-lg text-text-secondary-light dark:text-text-secondary-dark max-w-2xl mx-auto">
          Unified command center for seamless administration and transparent civic services.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl w-full z-10">
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
            
            <div className="text-center mb-6">
              <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-black/5 dark:bg-white/10 text-text-secondary-light dark:text-text-secondary-dark">
                {portal.roles}
              </span>
            </div>

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
