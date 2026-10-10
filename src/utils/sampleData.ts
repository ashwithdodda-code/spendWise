import { Transaction, Budget, UserProfile } from '../types';

export const DEMO_PROFILES: {
  profile: UserProfile;
  budgets: Budget[];
  transactions: Transaction[];
}[] = [
  // --- Profile 1: Priya Sharma (Hosteller / CSE 3rd Year) ---
  {
    profile: {
      userId: 'demo-student-priya',
      displayName: 'Priya Sharma',
      email: 'priya.sharma@campus.edu',
      currency: 'INR',
      currencySymbol: '₹',
      monthlyBudget: 14000,
      theme: 'system',
      alertThresholds: [75, 90, 100],
      isDemoUser: true,
      avatarSeed: 'Priya',
      createdAt: '2026-08-01T00:00:00Z',
    },
    budgets: [
      { id: 'b-priya-overall', userId: 'demo-student-priya', category: 'Overall', limitAmount: 14000, month: '2026-10', createdAt: '2026-10-01T00:00:00Z' },
      { id: 'b-priya-food', userId: 'demo-student-priya', category: 'Food & Dining', limitAmount: 4500, month: '2026-10', createdAt: '2026-10-01T00:00:00Z' },
      { id: 'b-priya-edu', userId: 'demo-student-priya', category: 'Education & Books', limitAmount: 2500, month: '2026-10', createdAt: '2026-10-01T00:00:00Z' },
      { id: 'b-priya-transport', userId: 'demo-student-priya', category: 'Transport', limitAmount: 1500, month: '2026-10', createdAt: '2026-10-01T00:00:00Z' },
      { id: 'b-priya-rent', userId: 'demo-student-priya', category: 'Accommodation & Rent', limitAmount: 3500, month: '2026-10', createdAt: '2026-10-01T00:00:00Z' },
      { id: 'b-priya-fun', userId: 'demo-student-priya', category: 'Entertainment', limitAmount: 1200, month: '2026-10', createdAt: '2026-10-01T00:00:00Z' },
    ],
    transactions: [
      // October 2026 (Current Period)
      { id: 'tx-p-1', userId: 'demo-student-priya', amount: 15000, category: 'Allowance & Stipend', date: '2026-10-01', description: 'Monthly parent stipend transfer', paymentMethod: 'Net Banking', type: 'income', merchant: 'Family', tags: ['stipend', 'allowance'], createdAt: '2026-10-01T09:00:00Z' },
      { id: 'tx-p-2', userId: 'demo-student-priya', amount: 3500, category: 'Accommodation & Rent', date: '2026-10-01', description: 'Hostel monthly mess & maintenance share', paymentMethod: 'UPI', type: 'expense', merchant: 'Gargi Hostel Warden', tags: ['hostel', 'fixed'], createdAt: '2026-10-01T10:15:00Z' },
      { id: 'tx-p-3', userId: 'demo-student-priya', amount: 120, category: 'Food & Dining', date: '2026-10-02', description: 'College cafeteria thali & chai', paymentMethod: 'UPI', type: 'expense', merchant: 'Campus Canteen', tags: ['lunch'], createdAt: '2026-10-02T13:30:00Z' },
      { id: 'tx-p-4', userId: 'demo-student-priya', amount: 480, category: 'Education & Books', date: '2026-10-03', description: 'Cloud Computing course spiral notes & bind', paymentMethod: 'UPI', type: 'expense', merchant: 'Modern Print Shop', tags: ['academics'], createdAt: '2026-10-03T16:00:00Z' },
      { id: 'tx-p-5', userId: 'demo-student-priya', amount: 90, category: 'Transport', date: '2026-10-04', description: 'Metro smartcard recharge', paymentMethod: 'UPI', type: 'expense', merchant: 'Delhi Metro Rail', tags: ['commute'], createdAt: '2026-10-04T08:45:00Z' },
      { id: 'tx-p-6', userId: 'demo-student-priya', amount: 350, category: 'Food & Dining', date: '2026-10-05', description: 'Group snack & pizza slice after lab viva', paymentMethod: 'UPI', type: 'expense', merchant: 'Dominos Campus Hub', tags: ['friends'], createdAt: '2026-10-05T17:20:00Z' },
      { id: 'tx-p-7', userId: 'demo-student-priya', amount: 199, category: 'Subscriptions', date: '2026-10-06', description: 'Spotify student Premium monthly renewal', paymentMethod: 'Debit Card', type: 'expense', merchant: 'Spotify AB', tags: ['entertainment'], createdAt: '2026-10-06T00:30:00Z' },
      { id: 'tx-p-8', userId: 'demo-student-priya', amount: 4000, category: 'Freelance & Tutoring', date: '2026-10-06', description: 'Python programming coaching honorarium', paymentMethod: 'UPI', type: 'income', merchant: 'EdTech Client', tags: ['freelance', 'stipend'], createdAt: '2026-10-06T18:00:00Z' },
      { id: 'tx-p-9', userId: 'demo-student-priya', amount: 280, category: 'Entertainment', date: '2026-10-07', description: 'Evening movie pass at mall', paymentMethod: 'UPI', type: 'expense', merchant: 'PVR Cinemas', tags: ['movie', 'weekend'], createdAt: '2026-10-07T19:30:00Z' },
      { id: 'tx-p-10', userId: 'demo-student-priya', amount: 2450, category: 'Education & Books', date: '2026-10-08', description: 'IEEE Conference student paper registration fee', paymentMethod: 'Debit Card', type: 'expense', merchant: 'IEEE Delhi Section', tags: ['conference', 'academics', 'flagged'], createdAt: '2026-10-08T11:00:00Z' },
      { id: 'tx-p-11', userId: 'demo-student-priya', amount: 80, category: 'Food & Dining', date: '2026-10-08', description: 'Nescafe iced coffee & bun maska', paymentMethod: 'UPI', type: 'expense', merchant: 'Nescafe Corner', tags: ['snacks'], createdAt: '2026-10-08T15:10:00Z' },
      { id: 'tx-p-12', userId: 'demo-student-priya', amount: 140, category: 'Transport', date: '2026-10-09', description: 'Auto-rickshaw share to railway station', paymentMethod: 'Cash', type: 'expense', merchant: 'Auto Driver', tags: ['travel'], createdAt: '2026-10-09T08:15:00Z' },
      { id: 'tx-p-13', userId: 'demo-student-priya', amount: 450, category: 'Food & Dining', date: '2026-10-09', description: 'Dinner with project team mates', paymentMethod: 'UPI', type: 'expense', merchant: 'Biryani Blues', tags: ['dinner'], createdAt: '2026-10-09T20:45:00Z' },

      // September 2026
      { id: 'tx-p-s1', userId: 'demo-student-priya', amount: 15000, category: 'Allowance & Stipend', date: '2026-09-01', description: 'September parent allowance', paymentMethod: 'Net Banking', type: 'income', merchant: 'Family', createdAt: '2026-09-01T09:00:00Z' },
      { id: 'tx-p-s2', userId: 'demo-student-priya', amount: 3500, category: 'Accommodation & Rent', date: '2026-09-01', description: 'Hostel mess dues', paymentMethod: 'UPI', type: 'expense', merchant: 'Hostel', createdAt: '2026-09-01T10:00:00Z' },
      { id: 'tx-p-s3', userId: 'demo-student-priya', amount: 1800, category: 'Food & Dining', date: '2026-09-08', description: 'Groceries and snacks stock', paymentMethod: 'UPI', type: 'expense', merchant: 'Blinkit', createdAt: '2026-09-08T14:00:00Z' },
      { id: 'tx-p-s4', userId: 'demo-student-priya', amount: 1200, category: 'Education & Books', date: '2026-09-12', description: 'Database management textbooks', paymentMethod: 'Debit Card', type: 'expense', merchant: 'Book Store', createdAt: '2026-09-12T11:00:00Z' },
      { id: 'tx-p-s5', userId: 'demo-student-priya', amount: 750, category: 'Transport', date: '2026-09-15', description: 'Monthly bus & metro card', paymentMethod: 'UPI', type: 'expense', merchant: 'DTC', createdAt: '2026-09-15T08:00:00Z' },
      { id: 'tx-p-s6', userId: 'demo-student-priya', amount: 2200, category: 'Shopping', date: '2026-09-20', description: 'Campus formal attire for presentation', paymentMethod: 'UPI', type: 'expense', merchant: 'Myntra', createdAt: '2026-09-20T16:00:00Z' },
      { id: 'tx-p-s7', userId: 'demo-student-priya', amount: 350, category: 'Health & Medical', date: '2026-09-24', description: 'Vitamins & cold tablets', paymentMethod: 'Cash', type: 'expense', merchant: 'Apollo Pharmacy', createdAt: '2026-09-24T18:00:00Z' },

      // August 2026
      { id: 'tx-p-a1', userId: 'demo-student-priya', amount: 15000, category: 'Allowance & Stipend', date: '2026-08-01', description: 'August parent allowance', paymentMethod: 'Net Banking', type: 'income', merchant: 'Family', createdAt: '2026-08-01T09:00:00Z' },
      { id: 'tx-p-a2', userId: 'demo-student-priya', amount: 3500, category: 'Accommodation & Rent', date: '2026-08-01', description: 'Hostel mess dues', paymentMethod: 'UPI', type: 'expense', merchant: 'Hostel', createdAt: '2026-08-01T10:00:00Z' },
      { id: 'tx-p-a3', userId: 'demo-student-priya', amount: 1950, category: 'Food & Dining', date: '2026-08-14', description: 'Monthly campus food & dining', paymentMethod: 'UPI', type: 'expense', merchant: 'Canteen', createdAt: '2026-08-14T12:00:00Z' },
      { id: 'tx-p-a4', userId: 'demo-student-priya', amount: 980, category: 'Transport', date: '2026-08-20', description: 'Cab fares and metro', paymentMethod: 'UPI', type: 'expense', merchant: 'Uber', createdAt: '2026-08-20T17:00:00Z' },
      { id: 'tx-p-a5', userId: 'demo-student-priya', amount: 1600, category: 'Education & Books', date: '2026-08-28', description: 'Lab notebooks and stationery', paymentMethod: 'Cash', type: 'expense', merchant: 'Stationery', createdAt: '2026-08-28T10:00:00Z' }
    ]
  },

  // --- Profile 2: Rohan Verma (Day Scholar / Commerce 2nd Year) ---
  {
    profile: {
      userId: 'demo-student-rohan',
      displayName: 'Rohan Verma',
      email: 'rohan.verma@campus.edu',
      currency: 'INR',
      currencySymbol: '₹',
      monthlyBudget: 11000,
      theme: 'system',
      alertThresholds: [75, 90, 100],
      isDemoUser: true,
      avatarSeed: 'Rohan',
      createdAt: '2026-08-01T00:00:00Z',
    },
    budgets: [
      { id: 'b-rohan-overall', userId: 'demo-student-rohan', category: 'Overall', limitAmount: 11000, month: '2026-10', createdAt: '2026-10-01T00:00:00Z' },
      { id: 'b-rohan-transport', userId: 'demo-student-rohan', category: 'Transport', limitAmount: 2800, month: '2026-10', createdAt: '2026-10-01T00:00:00Z' },
      { id: 'b-rohan-food', userId: 'demo-student-rohan', category: 'Food & Dining', limitAmount: 3200, month: '2026-10', createdAt: '2026-10-01T00:00:00Z' },
      { id: 'b-rohan-bills', userId: 'demo-student-rohan', category: 'Bills & Utilities', limitAmount: 1500, month: '2026-10', createdAt: '2026-10-01T00:00:00Z' },
      { id: 'b-rohan-fun', userId: 'demo-student-rohan', category: 'Entertainment', limitAmount: 1500, month: '2026-10', createdAt: '2026-10-01T00:00:00Z' },
    ],
    transactions: [
      { id: 'tx-r-1', userId: 'demo-student-rohan', amount: 10000, category: 'Allowance & Stipend', date: '2026-10-01', description: 'Parent pocket allowance', paymentMethod: 'Net Banking', type: 'income', merchant: 'Parents', createdAt: '2026-10-01T09:00:00Z' },
      { id: 'tx-r-2', userId: 'demo-student-rohan', amount: 5500, category: 'Freelance & Tutoring', date: '2026-10-02', description: 'UI Design prototype for local bakery', paymentMethod: 'UPI', type: 'income', merchant: 'SweetBake Cafe', createdAt: '2026-10-02T16:00:00Z' },
      { id: 'tx-r-3', userId: 'demo-student-rohan', amount: 800, category: 'Transport', date: '2026-10-02', description: 'Scooter petrol fill', paymentMethod: 'UPI', type: 'expense', merchant: 'Indian Oil Bunk', createdAt: '2026-10-02T18:00:00Z' },
      { id: 'tx-r-4', userId: 'demo-student-rohan', amount: 220, category: 'Food & Dining', date: '2026-10-03', description: 'Chaat and cold drink with college batch', paymentMethod: 'UPI', type: 'expense', merchant: 'College Street Food', createdAt: '2026-10-03T17:30:00Z' },
      { id: 'tx-r-5', userId: 'demo-student-rohan', amount: 699, category: 'Bills & Utilities', date: '2026-10-04', description: 'Airtel postpaid unlimited student pack', paymentMethod: 'UPI', type: 'expense', merchant: 'Airtel Telecom', createdAt: '2026-10-04T12:00:00Z' },
      { id: 'tx-r-6', userId: 'demo-student-rohan', amount: 1400, category: 'Entertainment', date: '2026-10-05', description: 'College cricket tournament team kit fee', paymentMethod: 'Cash', type: 'expense', merchant: 'Sports Club', createdAt: '2026-10-05T15:00:00Z' },
      { id: 'tx-r-7', userId: 'demo-student-rohan', amount: 950, category: 'Education & Books', date: '2026-10-07', description: 'Cost Accounting past exam question guides', paymentMethod: 'UPI', type: 'expense', merchant: 'Campus Xerox', createdAt: '2026-10-07T11:00:00Z' },
      { id: 'tx-r-8', userId: 'demo-student-rohan', amount: 310, category: 'Food & Dining', date: '2026-10-08', description: 'Shawarma and juice with friends', paymentMethod: 'UPI', type: 'expense', merchant: 'Arabian Nights', createdAt: '2026-10-08T20:00:00Z' },
      { id: 'tx-r-9', userId: 'demo-student-rohan', amount: 750, category: 'Transport', date: '2026-10-09', description: 'Scooter tank refill & tyre pressure', paymentMethod: 'Cash', type: 'expense', merchant: 'Bharat Petroleum', createdAt: '2026-10-09T09:30:00Z' },
    ]
  }
];
