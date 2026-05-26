export const MOCK_VOLUNTEER_TASKS = [
  {
    id: 501,
    title: 'Verify LED Streetlight Installation – Ward 56',
    description: 'Perform visual inspection of newly installed LED streetlights on 15th Avenue, Anna Nagar and report any non-functional units via the app.',
    ward: 'Anna Nagar West (Ward 56)',
    points: 50,
    hours: 1.5,
    type: 'verification',
    status: 'open',
    urgency: 'medium'
  },
  {
    id: 502,
    title: 'Assist Velachery Flood Relief Camp',
    description: 'Help distribute food grains, water packets, and medicines to flood-affected residents at the Velachery Corporation School relief camp.',
    ward: 'Velachery (Ward 174)',
    points: 200,
    hours: 6.0,
    type: 'community',
    status: 'claimed',
    urgency: 'high'
  },
  {
    id: 503,
    title: 'Blood Donation Drive – Rajiv Gandhi Government Hospital',
    description: 'Assist doctors in registering donors, maintaining queues, and distributing ORS and health drinks at the Chennai Government Hospital drive.',
    ward: 'Park Town (Ward 91)',
    points: 100,
    hours: 3.0,
    type: 'health',
    status: 'open',
    urgency: 'low'
  },
  {
    id: 504,
    title: 'Pothole Quality Audit – Kodambakkam High Road',
    description: 'Inspect asphalt quality of recently repaired road section. Upload geo-tagged photos to confirm work completion meets GCC standards.',
    ward: 'Kodambakkam (Ward 148)',
    points: 75,
    hours: 2.0,
    type: 'verification',
    status: 'open',
    urgency: 'medium'
  }
];

export const MOCK_VOLUNTEER_STATS = {
  hoursContributed: 45.5,
  citizensHelped: 128,
  verificationsCompleted: 14,
  rank: 'Gold Level',
  leaderboard: [
    { rank: 1, name: 'Sanjay Prakash', points: 1450, badges: ['Hero', 'Verifier'] },
    { rank: 2, name: 'Arun Kumar (You)', points: 1200, badges: ['Gold', 'Silver'] },
    { rank: 3, name: 'Kavya Rajan', points: 950, badges: ['Active'] },
    { rank: 4, name: 'Muthu Selvam', points: 780, badges: ['Helper'] },
    { rank: 5, name: 'Divya Lakshmi', points: 620, badges: ['Starter'] },
  ]
};
