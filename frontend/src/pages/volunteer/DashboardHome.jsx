/**
 * Nam Nadu — Volunteer Dashboard Home (Gamified Community Portal)
 */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  HeartHandshake, ShieldCheck, Droplet, Users, Award, Trophy, Zap, 
  Compass, Calendar, CheckCircle2, ShieldAlert, ArrowUpRight, Check,
  Clock, MapPin, Sparkles, Star, RefreshCw
} from 'lucide-react';
import { Card, StatCard, Badge, Button, LiveActivityFeed } from '@/components/ui';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context';
import { volunteerService } from '@/services/volunteer.service';
import { useEffect } from 'react';

// Initial Mock Tasks for Volunteer
const INITIAL_TASKS = [
  {
    id: 501,
    title: 'Verify Streetlight Repair',
    description: 'Perform visual inspection of newly installed LED streetlights on Ward 2 Main St and report any malfunctions.',
    ward: 'T Nagar (Ward 2)',
    points: 50,
    hours: 1.5,
    type: 'verification',
    status: 'open',
    urgency: 'medium'
  },
  {
    id: 502,
    title: 'Assist Flood Relief Camp',
    description: 'Help distribute food grains, blanket supplies, and basic medicines to flood displaced residents at the camp.',
    ward: 'Velachery (Ward 3)',
    points: 200,
    hours: 6.0,
    type: 'community',
    status: 'claimed',
    urgency: 'high'
  },
  {
    id: 503,
    title: 'Blood Donation Drive Co-ordination',
    description: 'Assist doctors in registering donors and distributing health drinks at the Anna Nagar Medical Center drive.',
    ward: 'Anna Nagar (Ward 1)',
    points: 100,
    hours: 3.0,
    type: 'health',
    status: 'open',
    urgency: 'low'
  },
  {
    id: 504,
    title: 'Pothole Quality Audit',
    description: 'Inspect repaired asphalt thickness on South Avenue road and upload high-resolution photos.',
    ward: 'Adyar (Ward 4)',
    points: 75,
    hours: 2.0,
    type: 'verification',
    status: 'open',
    urgency: 'medium'
  }
];

const INITIAL_SOCIALS = [
  { id: 1, title: 'Mega Medical & Health Camp', date: 'May 20, 2026', time: '09:00 AM - 04:00 PM', location: 'T Nagar Community Hall', rsvp: false, attendees: 42 },
  { id: 2, title: 'Adyar River Cleanup Drive', date: 'May 24, 2026', time: '06:30 AM - 10:30 AM', location: 'Adyar Bridge Bank', rsvp: false, attendees: 68 },
  { id: 3, title: 'Free Digital Literacy Class', date: 'May 28, 2026', time: '02:00 PM - 05:00 PM', location: 'Government High School, Ward 1', rsvp: false, attendees: 18 },
];

const BADGES = [
  { id: 'bronze', name: 'Citizen Helper', desc: 'Contributed 5+ hours', icon: Award, unlocked: true, color: 'text-amber-700 bg-amber-100 dark:bg-amber-950 dark:text-amber-400' },
  { id: 'silver', name: 'Super Verifier', desc: '10+ resolved verifications', icon: ShieldCheck, unlocked: true, color: 'text-slate-500 bg-slate-100 dark:bg-slate-900 dark:text-slate-300' },
  { id: 'gold', name: 'Gold Pillar', desc: 'Top 10% volunteer rank', icon: Trophy, unlocked: true, color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-950 dark:text-yellow-400' },
  { id: 'hero', name: 'Nam Nadu Hero', desc: 'Help in disaster emergency', icon: Sparkles, unlocked: false, color: 'text-primary-600 bg-primary-100 dark:bg-primary-950 dark:text-primary-400' },
];

export default function DashboardHome() {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  // Interactive Tab State
  const [activeTab, setActiveTab] = useState('overview');

  // Gamified States
  const [tasks, setTasks] = useState([]);
  const [socials, setSocials] = useState(INITIAL_SOCIALS);
  const [score, setScore] = useState(0);
  const [hours, setHours] = useState(0);
  const [helped, setHelped] = useState(0);
  const [verifications, setVerifications] = useState(0);
  const [checkedIn, setCheckedIn] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, tasksRes, leaderboardRes] = await Promise.all([
          volunteerService.getProfile(),
          volunteerService.getTasks(),
          volunteerService.getLeaderboard()
        ]);
        setScore(profileRes.score);
        setHours(profileRes.total_hours);
        setHelped(profileRes.helped);
        setVerifications(profileRes.verifications);
        setTasks(tasksRes);
        setLeaderboard(leaderboardRes);
      } catch (err) {
        console.error("Failed to load volunteer data", err);
      }
    };
    fetchData();
  }, []);

  // Handle Check-in Action
  const handleCheckIn = async () => {
    if (!checkedIn) {
      try {
        const profile = await volunteerService.checkIn();
        setCheckedIn(true);
        setScore(profile.score);
        setHours(profile.total_hours);
        triggerFeedback('Checked in successfully! Points added to your profile.');
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Trigger brief alert feedback msg
  const triggerFeedback = (msg) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(''), 4000);
  };

  // Task Actions
  const handleClaimTask = async (taskId) => {
    try {
      await volunteerService.claimTask(taskId);
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'claimed' } : t));
      triggerFeedback('Task claimed successfully! Go out and help your community.');
    } catch (err) {
      console.error(err);
    }
  };

  const handleCompleteTask = async (task) => {
    try {
      await volunteerService.completeTask(task.id);
      setTasks(prev => prev.filter(t => t.id !== task.id));
      
      const updatedProfile = await volunteerService.getProfile();
      setScore(updatedProfile.score);
      setHours(updatedProfile.total_hours);
      setHelped(updatedProfile.helped);
      setVerifications(updatedProfile.verifications);
      
      triggerFeedback(`Task "${task.title}" Completed! Earned points!`);
    } catch (err) {
      console.error(err);
    }
  };

  // RSVP Actions
  const handleRSVP = (socialId) => {
    setSocials(prev => prev.map(s => {
      if (s.id === socialId) {
        const nextState = !s.rsvp;
        if (nextState) {
          setScore(p => p + 25);
          triggerFeedback('RSVP Confirmed! +25 Points earned for event sign-up.');
        } else {
          setScore(p => p - 25);
          triggerFeedback('RSVP Cancelled.');
        }
        return { ...s, rsvp: nextState, attendees: nextState ? s.attendees + 1 : s.attendees - 1 };
      }
      return s;
    }));
  };

  // Dynamic Leaderboard computed based on your current score
  const getLeaderboard = () => {
    return leaderboard.length > 0 ? leaderboard : [
      { rank: 1, name: 'Sanjay P.', points: 1450, badges: ['Hero', 'Verifier'], self: false },
      { rank: 2, name: 'You', points: score, badges: ['Gold', 'Silver'], self: true },
      { rank: 3, name: 'Kavya R.', points: 950, badges: ['Active'], self: false },
    ];
  };

  const tabs = [
    { id: 'overview', label: 'My Profile', icon: Compass },
    { id: 'tasks', label: 'Gamified Action Center', icon: Zap },
    { id: 'social', label: 'Social Activities', icon: Calendar },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
  ];

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-success-600 to-green-500 text-white rounded-2xl p-6 shadow-elevated border border-success-700/20">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 bg-white/20 text-white rounded-lg text-xs font-bold uppercase tracking-wider">Citizen Power</span>
              <Badge color="success" className="bg-white/20 text-white border-0 font-bold uppercase tracking-wider text-[10px]">
                {score >= 1200 ? 'Gold Tier Contributor' : 'Silver Tier Contributor'}
              </Badge>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight mt-2">
              {t('volunteer.welcome')}, {user?.full_name || 'Arun Kumar'}!
            </h1>
            <p className="text-success-50 mt-1.5 text-sm md:text-base max-w-xl font-medium">
              Your dedication fuels Nam Nadu. Help citizens, perform field verifications, and earn ranks!
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3.5 border border-white/20 text-center min-w-[100px]">
              <span className="text-[10px] text-success-100 uppercase tracking-widest font-extrabold block">My Score</span>
              <span className="text-2xl font-black block mt-0.5">{score} pts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating feedback message */}
      <AnimatePresence>
        {feedbackMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 bg-primary-600 text-white rounded-xl shadow-elevated flex items-center gap-2.5 font-bold text-sm border border-primary-500"
          >
            <Sparkles className="w-5 h-5 text-accent-400 animate-pulse" />
            <span>{feedbackMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation tabs */}
      <div className="flex overflow-x-auto p-1 bg-white/40 dark:bg-surface-card-dark/40 backdrop-blur-md rounded-xl border border-border-light dark:border-border-dark scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-lg font-bold text-sm transition-all duration-300 whitespace-nowrap flex-1 justify-center md:flex-none cursor-pointer ${
                isActive
                  ? 'bg-primary-600 text-white shadow-card dark:bg-primary-500'
                  : 'text-text-secondary-light dark:text-text-secondary-dark hover:bg-white/50 dark:hover:bg-surface-card-dark/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* TAB 1: MY PROFILE */}
          {activeTab === 'overview' && (
            <>
              {/* Stat grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title={t('volunteer.hours_contributed')} value={`${hours.toFixed(1)} hrs`} subtitle="Verified on-ground hours" icon={Clock} color="primary" />
                <StatCard title={t('volunteer.citizens_helped')} value={`${helped} Citizens`} subtitle="Via social drives & assistance" icon={Users} color="success" />
                <StatCard title={t('volunteer.verifications_done')} value={`${verifications} Assets`} subtitle="High reliability score" icon={ShieldCheck} color="info" />
                <StatCard title="Global Rank" value={`#${getLeaderboard().find(x => x.self)?.rank || 2}`} subtitle={`Out of 124 in your ward`} icon={Trophy} color="accent" />
              </div>

              {/* Achievements & Quick widgets */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                  <div className="mb-4">
                    <h2 className="font-bold text-lg text-text-primary-light dark:text-text-primary-dark">Volunteer Achievements</h2>
                    <p className="text-xs text-text-secondary-light">Badges unlocked based on community participation and verified activities.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {BADGES.map((badge) => {
                      const BadgeIcon = badge.icon;
                      return (
                        <div 
                          key={badge.id}
                          className={`p-4 rounded-xl border flex items-start gap-4 transition-all duration-300 ${
                            badge.unlocked 
                              ? 'border-border-light dark:border-border-dark bg-white/40 dark:bg-surface-card-dark/40 opacity-100' 
                              : 'border-dashed border-gray-300 dark:border-gray-800 bg-transparent opacity-50 grayscale'
                          }`}
                        >
                          <div className={`p-3 rounded-xl ${badge.unlocked ? badge.color : 'bg-gray-100 dark:bg-gray-900 text-gray-400'}`}>
                            <BadgeIcon className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="font-bold text-sm text-text-primary-light dark:text-text-primary-dark">{badge.name}</h4>
                              {badge.unlocked ? (
                                <Badge color="success" size="sm" className="px-1.5 py-0">Active</Badge>
                              ) : (
                                <Badge color="default" size="sm" className="px-1.5 py-0 border border-gray-300">Locked</Badge>
                              )}
                            </div>
                            <p className="text-xs text-text-secondary-light mt-1">{badge.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>

                {/* Quick Check-In */}
                <Card className="flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-5 h-5 text-accent-500 fill-accent-500 animate-pulse" />
                      <h2 className="font-bold text-lg text-text-primary-light dark:text-text-primary-dark">Quick Ward Attendance</h2>
                    </div>
                    <p className="text-xs text-text-secondary-light leading-relaxed">
                      Confirm you are on standby duty in T Nagar ward. Claim a daily attendance bonus of **+15 Points** to keep your profile active.
                    </p>
                  </div>
                  
                  <div className="bg-primary-500/5 dark:bg-primary-500/10 border border-primary-500/20 p-4 rounded-xl text-center space-y-2 mt-4">
                    <span className="text-xs text-text-secondary-light font-bold"> standby status</span>
                    <p className="text-lg font-black text-primary-600 dark:text-primary-400">Ward Standby: ACTIVE</p>
                  </div>

                  <Button 
                    variant={checkedIn ? 'secondary' : 'primary'}
                    className="w-full mt-4 font-bold cursor-pointer"
                    disabled={checkedIn}
                    onClick={handleCheckIn}
                  >
                    {checkedIn ? (
                      <span className="flex items-center justify-center gap-1.5">
                        <Check className="w-4 h-4" /> attendance Check Done
                      </span>
                    ) : (
                      'Check-in standby (+15 pts)'
                    )}
                  </Button>
                </Card>
              </div>
            </>
          )}

          {/* TAB 2: GAMIFIED ACTION CENTER */}
          {activeTab === 'tasks' && (
            <>
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/40 dark:bg-surface-card-dark/40 p-4 rounded-xl border border-border-light dark:border-border-dark">
                <div>
                  <h2 className="font-extrabold text-lg text-text-primary-light dark:text-text-primary-dark">Actionable Community Tasks</h2>
                  <p className="text-xs text-text-secondary-light">Verify citizen-reported resolutions or assist in on-ground civic drives to claim immediate points.</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge color="primary">{tasks.length} Available Tasks</Badge>
                </div>
              </div>

              {/* Tasks Cards Grid */}
              {tasks.length === 0 ? (
                <Card className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-success-500/10 text-success-500 flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-extrabold text-text-primary-light dark:text-text-primary-dark mb-1">Excellent Work!</h3>
                  <p className="text-xs text-text-secondary-light max-w-sm">
                    All available tasks in your ward have been completed or resolved. Check back later for new tasks.
                  </p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {tasks.map((task) => {
                    const isClaimed = task.status === 'claimed';
                    return (
                      <Card 
                        key={task.id} 
                        className={`flex flex-col justify-between transition-all duration-300 relative border ${
                          isClaimed 
                            ? 'border-primary-500/40 bg-primary-500/5 dark:bg-primary-500/10' 
                            : 'border-border-light dark:border-border-dark'
                        }`}
                      >
                        <div>
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-2">
                              <span className={`p-1.5 rounded-lg text-xs font-bold ${
                                task.type === 'verification' 
                                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400' 
                                  : task.type === 'health' 
                                  ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400' 
                                  : 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400'
                              }`}>
                                {task.type.toUpperCase()}
                              </span>
                              <Badge color={task.urgency === 'high' ? 'danger' : 'primary'} size="sm">
                                {task.urgency.toUpperCase()}
                              </Badge>
                            </div>
                            <div className="text-right">
                              <span className="text-lg font-black text-primary-600 dark:text-primary-400 block">+{task.points} pts</span>
                              <span className="text-[10px] text-text-secondary-light block font-semibold">{task.hours} hours contribution</span>
                            </div>
                          </div>

                          <h3 className="font-extrabold text-base text-text-primary-light dark:text-text-primary-dark mb-1">{task.title}</h3>
                          
                          <div className="flex items-center gap-1.5 text-text-secondary-light text-xs mb-3 font-semibold">
                            <MapPin className="w-3.5 h-3.5 text-gray-400" />
                            <span>{task.ward}</span>
                          </div>

                          <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark leading-relaxed font-medium mb-4">
                            {task.description}
                          </p>
                        </div>

                        <div className="flex gap-2 border-t border-border-light/40 dark:border-border-dark/40 pt-4">
                          {isClaimed ? (
                            <>
                              <Button 
                                variant="success" 
                                className="flex-1 font-bold cursor-pointer"
                                onClick={() => handleCompleteTask(task)}
                              >
                                <span className="flex items-center justify-center gap-1">
                                  <Check className="w-4 h-4" /> Mark Complete
                                </span>
                              </Button>
                            </>
                          ) : (
                            <Button 
                              variant="primary" 
                              className="w-full font-bold cursor-pointer"
                              onClick={() => handleClaimTask(task.id)}
                            >
                              Claim Task
                            </Button>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* TAB 3: SOCIAL ACTIVITIES */}
          {activeTab === 'social' && (
            <>
              {/* Header */}
              <div className="mb-4">
                <h2 className="font-bold text-lg text-text-primary-light dark:text-text-primary-dark">Upcoming Social Activities & Events</h2>
                <p className="text-xs text-text-secondary-light">Sign up to coordinate health camps, cleanup drives, and literacy campaigns in your ward.</p>
              </div>

              {/* Social Events List */}
              <div className="space-y-4">
                {socials.map((s) => (
                  <Card 
                    key={s.id}
                    className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 border transition-all duration-300 ${
                      s.rsvp 
                        ? 'border-success-500/40 bg-success-500/5 dark:bg-success-500/10' 
                        : 'border-border-light dark:border-border-dark'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3.5 rounded-xl hidden sm:block ${
                        s.rsvp 
                          ? 'bg-success-100 text-success-700 dark:bg-success-950 dark:text-success-400' 
                          : 'bg-primary-50 text-primary-600 dark:bg-primary-950/40 dark:text-primary-400'
                      }`}>
                        <Calendar className="w-6 h-6" />
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-extrabold text-base text-text-primary-light dark:text-text-primary-dark">{s.title}</h3>
                          {s.rsvp && <Badge color="success">RSVP Active</Badge>}
                        </div>
                        
                        <div className="flex flex-wrap gap-4 text-xs font-semibold text-text-secondary-light pt-1">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{s.date} | {s.time}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>{s.location}</span>
                          </div>
                          <div className="flex items-center gap-1 text-primary-600 dark:text-primary-400">
                            <Users className="w-3.5 h-3.5" />
                            <span>{s.attendees} Volunteers Registered</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex md:flex-col items-stretch justify-end gap-2 text-right">
                      {!s.rsvp && (
                        <span className="text-[10px] text-accent-500 font-extrabold uppercase tracking-wider block mb-1">
                          Earn +25 Points RSVP Bonus
                        </span>
                      )}
                      <Button 
                        variant={s.rsvp ? 'success' : 'primary'}
                        className="font-bold min-w-[120px] cursor-pointer"
                        onClick={() => handleRSVP(s.id)}
                      >
                        {s.rsvp ? 'Joined (Cancel)' : 'RSVP Now'}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}

          {/* TAB 4: LEADERBOARD */}
          {activeTab === 'leaderboard' && (
            <>
              {/* Info Header */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Trophy className="w-5 h-5 text-amber-500 fill-amber-500 animate-pulse" />
                      <h2 className="font-bold text-lg text-text-primary-light dark:text-text-primary-dark">Community Leaderboard</h2>
                    </div>
                    <p className="text-xs text-text-secondary-light leading-relaxed">
                      Compete friendly with other civic-minded volunteers in Ward 2! Top contributors receive executive recognition certificates and direct invites to regional municipal conferences.
                    </p>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-border-light/40 dark:border-border-dark/40 flex justify-between items-center text-xs font-bold">
                    <span className="text-text-secondary-light">Current Standing</span>
                    <span className="text-primary-600 dark:text-primary-400">
                      Rank #{getLeaderboard().find(x => x.self)?.rank || 2} of 124
                    </span>
                  </div>
                </Card>

                <Card className="flex flex-col items-center justify-center text-center p-6 bg-gradient-to-br from-primary-900 to-primary-700 text-white border-0 shadow-elevated">
                  <Trophy className="w-12 h-12 text-accent-500 fill-accent-500 animate-bounce mb-3" />
                  <h4 className="font-extrabold text-sm uppercase tracking-wider text-primary-100">My Level Status</h4>
                  <p className="text-3xl font-black mt-1 text-white">Gold Tier</p>
                  <p className="text-[10px] text-primary-200 mt-1 max-w-[160px] font-semibold leading-relaxed">
                    Active volunteer with {verifications} verified actions. Next tier: Platinum (1,500 pts)
                  </p>
                </Card>
              </div>

              {/* Rankings Table */}
              <Card>
                <div className="mb-4">
                  <h3 className="font-bold text-base text-text-primary-light dark:text-text-primary-dark">Active Standings</h3>
                  <p className="text-xs text-text-secondary-light">Live rankings, updated instantly as volunteers complete on-ground tasks.</p>
                </div>
                
                <div className="overflow-x-auto rounded-xl border border-border-light dark:border-border-dark bg-white/40 dark:bg-surface-card-dark/40">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-100 dark:bg-gray-800 text-text-secondary-light uppercase text-[10px] font-extrabold border-b border-border-light dark:border-border-dark">
                      <tr>
                        <th className="p-3.5 text-center w-16">Rank</th>
                        <th className="p-3.5">Volunteer</th>
                        <th className="p-3.5 text-center">Badges</th>
                        <th className="p-3.5 text-right w-32">Total Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-light dark:divide-border-dark font-semibold">
                      {getLeaderboard().map((v) => (
                        <tr 
                          key={v.rank} 
                          className={`transition-colors ${
                            v.self 
                              ? 'bg-primary-500/10 text-primary-600 dark:bg-primary-500/20 dark:text-primary-400 font-extrabold' 
                              : 'hover:bg-white/40 dark:hover:bg-surface-card-dark/20'
                          }`}
                        >
                          <td className="p-3.5 text-center">
                            <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-black ${
                              v.rank === 1 
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400' 
                                : v.rank === 2
                                ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                : 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400'
                            }`}>
                              {v.rank === 1 ? '🥇' : v.rank === 2 ? '🥈' : '🥉'}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <div className="flex items-center gap-2">
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                                v.self ? 'bg-primary-500 text-white' : 'bg-gray-200 dark:bg-gray-800 text-text-secondary-light'
                              }`}>
                                {v.name.charAt(0)}
                              </span>
                              <span>{v.name}</span>
                              {v.self && <Badge color="primary" size="sm" className="ml-1 font-bold">You</Badge>}
                            </div>
                          </td>
                          <td className="p-3.5 text-center">
                            <div className="flex items-center justify-center gap-1">
                              {v.badges.map((b, idx) => (
                                <Badge key={idx} color={b === 'Hero' ? 'danger' : 'primary'} size="sm" className="px-2 py-0 text-[10px]">
                                  {b}
                                </Badge>
                              ))}
                            </div>
                          </td>
                          <td className="p-3.5 text-right font-black text-sm">
                            {v.points} pts
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
