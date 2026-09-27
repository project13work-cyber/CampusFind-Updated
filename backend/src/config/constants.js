const CATEGORIES = [
  'ID Card',
  'Wallet',
  'Mobile Phone',
  'Laptop',
  'Laptop Bag',
  'Backpack',
  'Keys',
  'Earphones',
  'Headphones',
  'Watch',
  'Books',
  'Calculator',
  'Water Bottle',
  'Documents',
  'Clothing',
  'Other'
];

const LOST_STATUSES = [
  'REPORTED',
  'PENDING_REVIEW',
  'APPROVED',
  'SEARCHING',
  'MATCH_FOUND',
  'CLAIM_PENDING',
  'CLAIM_APPROVED',
  'RETURNED',
  'CLOSED'
];

const FOUND_STATUSES = [
  'REPORTED',
  'PENDING_REVIEW',
  'APPROVED',
  'MATCHING',
  'CLAIM_PENDING',
  'CLAIM_APPROVED',
  'RETURNED',
  'CLOSED'
];

const CURRENT_ITEM_LOCATIONS = [
  'With me',
  'Submitted to Security Office',
  'Submitted to College Office',
  'Other'
];

const MATCH_STATUSES = [
  'POTENTIAL',
  'NOTIFIED',
  'CLAIM_INITIATED',
  'RESOLVED',
  'DISMISSED'
];

const CLAIM_STATUSES = [
  'PENDING_REVIEW',
  'MORE_INFO_REQUESTED',
  'APPROVED',
  'REJECTED',
  'RETURNED'
];

const ROLES = {
  STUDENT: 'STUDENT',
  ADMIN: 'ADMIN'
};

const CANTEEN_ZONES = [
  {
    name: 'Food Ordering Counter',
    code: 'COUNTER',
    description: 'Main token & billing counter area',
    bounds: { xMin: 650, xMax: 950, yMin: 450, yMax: 600 }
  },
  {
    name: 'Dining Tables 1 - 3 (North Wing)',
    code: 'TABLES_NORTH',
    description: 'Tables 1, 2, and 3 near the outer glass windows',
    bounds: { xMin: 80, xMax: 550, yMin: 80, yMax: 260 }
  },
  {
    name: 'Dining Tables 4 - 6 (Central Wing)',
    code: 'TABLES_CENTRAL',
    description: 'Tables 4, 5, and 6 in the middle dining hall',
    bounds: { xMin: 80, xMax: 550, yMin: 280, yMax: 480 }
  },
  {
    name: 'Water Station & Wash Area',
    code: 'WATER_AREA',
    description: 'Purified drinking water dispensers and wash basins',
    bounds: { xMin: 50, xMax: 260, yMin: 500, yMax: 620 }
  },
  {
    name: 'Main Entrance & Lobby',
    code: 'ENTRANCE',
    description: 'Entrance corridor and notice board foyer',
    bounds: { xMin: 350, xMax: 600, yMin: 500, yMax: 620 }
  },
  {
    name: 'Beverage & Snack Stall',
    code: 'SNACK_STALL',
    description: 'Tea, coffee, and packaged snacks counter',
    bounds: { xMin: 650, xMax: 950, yMin: 100, yMax: 300 }
  }
];

module.exports = {
  CATEGORIES,
  LOST_STATUSES,
  FOUND_STATUSES,
  CURRENT_ITEM_LOCATIONS,
  MATCH_STATUSES,
  CLAIM_STATUSES,
  ROLES,
  CANTEEN_ZONES
};
