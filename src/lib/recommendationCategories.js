// The fixed list backing both the new-recommendation category dropdown and
// the list page's filter -- also enforced in the DB via a CHECK constraint
// (see the recommendations table), so this must stay in sync with that.
// "Other" always sorts last; everything else stays in this curated order
// (roughly most-to-least common in practice) rather than alphabetical.
export const RECOMMENDATION_CATEGORIES = [
  "Plumbing",
  "Electrical",
  "HVAC",
  "Handyman",
  "General Contractor",
  "Painting",
  "Landscaping & Gardening",
  "Pest Control",
  "House Cleaning",
  "Appliance Repair",
  "Home Inspection",
  "Auto Repair",
  "Pet Care",
  "Childcare",
  "Tax & Financial",
  "Legal",
  "Real Estate",
  "Medical",
  "Other",
];
