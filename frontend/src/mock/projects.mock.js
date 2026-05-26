export const MOCK_PROJECTS = [
  {
    id: 201,
    name: 'Chennai Stormwater Drain Expansion – Phase II',
    department: 'Public Works Department',
    status: 'in_progress',
    progress: 65,
    budget: 750000000, // ₹75 Cr
    ward: 'Multiple Wards (Anna Nagar, T Nagar, Adyar)',
    contractor: 'L&T Infrastructure',
    end_date: new Date(Date.now() + 86400000 * 90).toISOString(),
    trust_score: 8.5
  },
  {
    id: 202,
    name: 'Smart LED Streetlight Installation – Chennai North',
    department: 'TANGEDCO Electricity',
    status: 'delayed',
    progress: 40,
    budget: 250000000, // ₹25 Cr
    ward: 'Ward 1–18 (North Chennai)',
    contractor: 'Philips Smart Lighting',
    end_date: new Date(Date.now() - 86400000 * 15).toISOString(),
    trust_score: 5.8
  },
  {
    id: 203,
    name: 'Primary Health Centre Renovation – Velachery',
    department: 'Corporation Health',
    status: 'approved',
    progress: 0,
    budget: 120000000, // ₹12 Cr
    ward: 'Ward 174 (Velachery)',
    contractor: 'Apollo Buildcon',
    end_date: new Date(Date.now() + 86400000 * 180).toISOString(),
    trust_score: 9.2
  },
  {
    id: 204,
    name: 'Anna Salai Road Widening – Saidapet to Guindy',
    department: 'Public Works Department',
    status: 'in_progress',
    progress: 78,
    budget: 580000000, // ₹58 Cr
    ward: 'Ward 150–160 (Saidapet–Guindy Corridor)',
    contractor: 'Ramco Constructions',
    end_date: new Date(Date.now() + 86400000 * 45).toISOString(),
    trust_score: 7.9
  },
  {
    id: 205,
    name: 'Underground Sewage Network – Kodambakkam',
    department: 'Metro Water Supply',
    status: 'proposed',
    progress: 0,
    budget: 340000000, // ₹34 Cr
    ward: 'Ward 148 (Kodambakkam)',
    contractor: 'TBD',
    end_date: new Date(Date.now() + 86400000 * 365).toISOString(),
    trust_score: 7.0
  }
];
