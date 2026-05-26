export const MOCK_FUNDS = {
  totalBudget: 5000000000,  // ₹500 Cr
  spent:       3200000000,  // ₹320 Cr
  wardAllocations: [
    { name: 'Anna Nagar',     allocated: 500000000, spent: 420000000 },
    { name: 'T Nagar',        allocated: 800000000, spent: 750000000 },
    { name: 'Velachery',      allocated: 600000000, spent: 220000000 },
    { name: 'Adyar',          allocated: 700000000, spent: 650000000 },
    { name: 'Kodambakkam',    allocated: 450000000, spent: 390000000 },
    { name: 'Nungambakkam',   allocated: 350000000, spent: 280000000 },
  ],
  departmentSpending: [
    { name: 'Roads & Bridges', value: 38 },
    { name: 'Water Supply',    value: 22 },
    { name: 'Electricity',     value: 14 },
    { name: 'Health',          value: 12 },
    { name: 'Sanitation',      value: 14 },
  ],
  fundJourney: [
    { stage: 'State Allocation', amount: '₹500 Cr', status: 'completed' },
    { stage: 'Dept Transfer',    amount: '₹480 Cr', status: 'completed' },
    { stage: 'Contractor Release', amount: '₹320 Cr', status: 'in_progress' },
    { stage: 'Public Verification', status: 'pending', items: 182 }
  ]
};

export const MOCK_POLLS = [
  {
    id: 401,
    question: 'Which area needs the most urgent infrastructure improvement?',
    options: [
      { id: 1, text: 'Velachery – Flooding & Drainage', votes: 1420 },
      { id: 2, text: 'T Nagar – Water Supply Reliability', votes: 980 },
      { id: 3, text: 'Anna Nagar – Road Quality', votes: 540 },
      { id: 4, text: 'Kodambakkam – Sewage Network', votes: 320 }
    ],
    totalVotes: 3260,
    ends_in_days: 4
  },
  {
    id: 402,
    question: 'Where should the next community park be built?',
    options: [
      { id: 1, text: 'Near Adyar River Bank', votes: 760 },
      { id: 2, text: 'Opposite Government School, Mylapore', votes: 1140 },
      { id: 3, text: 'Central Market Area, T Nagar', votes: 390 }
    ],
    totalVotes: 2290,
    ends_in_days: 2
  }
];
