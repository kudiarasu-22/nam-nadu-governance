export const MOCK_ALERTS = [
  {
    id: 301,
    title: 'Heavy Rainfall & Flood Warning – Chennai',
    message: 'IMD issues Orange Alert for Chennai and surroundings. Expect severe waterlogging in low-lying areas of Velachery, Tambaram, and Perambur. Citizens advised to avoid sub-ways and underpasses.',
    severity: 'critical',
    created_at: new Date().toISOString()
  },
  {
    id: 302,
    title: 'Scheduled Power Interruption – TANGEDCO',
    message: 'Power supply will be interrupted from 09:00 AM to 02:00 PM on May 18 in parts of Anna Nagar, Kilpauk, and Chetpet for substation maintenance. Affected areas: Ward 56, 58, 60.',
    severity: 'medium',
    created_at: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 303,
    title: 'Water Supply Disruption – Metro Water',
    message: 'Metro Water supply will be halted in T Nagar, Kodambakkam, and Nandanam on May 19 from 06:00 AM to 06:00 PM for pipeline maintenance. Store adequate water.',
    severity: 'medium',
    created_at: new Date(Date.now() - 7200000).toISOString()
  }
];
