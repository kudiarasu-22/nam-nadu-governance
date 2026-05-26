export const MOCK_LEADERSHIP_ANALYTICS = {
  overallDevelopmentIndex: 8.4,
  publicTrustScore: 7.9,
  budgetHealth: 'Excellent',
  activeEmergencyWards: 4,
  wardRankings: [
    { rank: 1, ward: 'Anna Nagar West (Ward 56)', score: 9.2, councillor: 'Ravi Kumaran' },
    { rank: 2, ward: 'T Nagar (Ward 132)',         score: 8.8, councillor: 'Priya Meenakshi' },
    { rank: 3, ward: 'Adyar (Ward 185)',            score: 8.5, councillor: 'Senthil Selvam' },
    { rank: 4, ward: 'Nungambakkam (Ward 98)',      score: 8.1, councillor: 'Kavitha Raj' },
    { rank: 5, ward: 'Velachery (Ward 174)',        score: 7.4, councillor: 'Lakshmi Venkat' },
    { rank: 6, ward: 'Kodambakkam (Ward 148)',      score: 7.1, councillor: 'Murugan S.' },
  ],
  complaintHeatmapData: [
    // Anna Nagar
    { lat: 13.0850, lng: 80.2100, weight: 0.5 },
    // T Nagar
    { lat: 13.0418, lng: 80.2341, weight: 0.9 },
    // Velachery
    { lat: 12.9750, lng: 80.2210, weight: 0.7 },
    // Adyar
    { lat: 13.0033, lng: 80.2550, weight: 0.4 },
    // Kodambakkam
    { lat: 13.0525, lng: 80.2218, weight: 0.8 },
    // Nungambakkam
    { lat: 13.0620, lng: 80.2510, weight: 0.6 },
    // Royapettah
    { lat: 13.0569, lng: 80.2686, weight: 0.9 },
    // Mylapore
    { lat: 13.0368, lng: 80.2676, weight: 0.5 },
  ]
};
