import { MOCK_ALERTS } from '../mock/alerts.mock';

class Simulator {
  constructor() {
    this.listeners = new Map();
    this.intervalIds = [];
    this.activityLog = [];
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      this.listeners.set(event, callbacks.filter(cb => cb !== callback));
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(cb => cb(data));
    }
  }

  logActivity(activity) {
    const entry = { id: Date.now(), timestamp: new Date().toISOString(), ...activity };
    this.activityLog = [entry, ...this.activityLog].slice(0, 50); // Keep last 50
    this.emit('activity_update', entry);
    return entry;
  }

  startDemoMode() {
    // Simulate real-time alerts
    const alertInterval = setInterval(() => {
      if (Math.random() > 0.8) {
        const newAlert = {
          id: Date.now(),
          title: '🚨 Traffic Diversion',
          message: 'Accident reported on Mount Road. Please take alternate routes.',
          type: 'emergency',
          severity: 'critical',
          is_read: false,
          created_at: new Date().toISOString()
        };
        this.emit('emergency_alert', newAlert);
        this.logActivity({ type: 'alert', message: 'New critical alert issued for Mount Road.' });
      }
    }, 15000);

    // Simulate complaint updates
    const updateInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        const statuses = ['assigned', 'in_progress', 'resolved'];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        
        const update = {
          id: Date.now(),
          message: `Complaint #10${Math.floor(Math.random() * 5)} status changed to: ${randomStatus}`,
          type: 'complaint_update',
          is_read: false,
          created_at: new Date().toISOString()
        };
        this.emit('complaint_update', update);
        this.logActivity({ type: 'complaint', message: update.message });
      }
    }, 20000);
    
    // Simulate Volunteer Actions
    const volunteerInterval = setInterval(() => {
      if (Math.random() > 0.85) {
        this.logActivity({ type: 'volunteer', message: 'Volunteer Sanjay P. verified road works in T Nagar.' });
      }
    }, 25000);

    this.intervalIds.push(alertInterval, updateInterval, volunteerInterval);
    
    // Initial dummy logs
    this.logActivity({ type: 'complaint', message: 'Complaint #101 assigned to Officer Ramesh K.' });
    this.logActivity({ type: 'project', message: 'Storm Water Drain Expansion reached 65% completion.' });
  }

  stopDemoMode() {
    this.intervalIds.forEach(clearInterval);
    this.intervalIds = [];
  }
}

export const simulator = new Simulator();
