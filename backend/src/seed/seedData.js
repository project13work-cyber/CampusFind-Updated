const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/User');
const CampusLocation = require('../models/CampusLocation');
const LostItem = require('../models/LostItem');
const FoundItem = require('../models/FoundItem');
const Match = require('../models/Match');
const Claim = require('../models/Claim');
const ReturnRecord = require('../models/ReturnRecord');
const Notification = require('../models/Notification');
const { CANTEEN_ZONES } = require('../config/constants');
const { calculateMatchScore } = require('../services/matchingEngine');

dotenv.config();

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campusfind';
    await mongoose.connect(mongoUri);
    console.log(`[Seed] Connected to MongoDB: ${mongoUri}`);

    // Clear existing collections
    console.log('[Seed] Clearing existing collections...');
    await User.deleteMany({});
    await CampusLocation.deleteMany({});
    await LostItem.deleteMany({});
    await FoundItem.deleteMany({});
    await Match.deleteMany({});
    await Claim.deleteMany({});
    await ReturnRecord.deleteMany({});
    await Notification.deleteMany({});

    // 1. Seed Users
    console.log('[Seed] Creating demo users...');
    const salt = await bcrypt.genSalt(10);
    const adminPass = await bcrypt.hash('Admin@123', salt);
    const studentPass = await bcrypt.hash('Campus@123', salt);

    const admin = await User.create({
      name: 'Campus Security Admin',
      email: 'admin@gmail.com',
      studentId: 'ADM-001',
      phone: '+91 9876543210',
      passwordHash: adminPass,
      role: 'ADMIN',
      isEmailVerified: true
    });

    const student1 = await User.create({
      name: 'Aarav Sharma',
      email: 'student@gmail.com',
      studentId: '2024CS014',
      phone: '+91 9876500001',
      passwordHash: studentPass,
      role: 'STUDENT',
      isEmailVerified: true
    });

    const student2 = await User.create({
      name: 'Sarah Thomas',
      email: 'sarah@gmail.com',
      studentId: '2023EC089',
      phone: '+91 9876500002',
      passwordHash: studentPass,
      role: 'STUDENT',
      isEmailVerified: true
    });

    const student3 = await User.create({
      name: 'Rahul Verma',
      email: 'rahul@gmail.com',
      studentId: '2024ME042',
      phone: '+91 9876500003',
      passwordHash: studentPass,
      role: 'STUDENT',
      isEmailVerified: true
    });

    // 2. Seed Campus Locations
    console.log('[Seed] Creating campus locations and canteen layout...');
    const canteen = await CampusLocation.create({
      name: 'College Canteen',
      code: 'CANTEEN',
      description: 'Main Campus Dining Hall & Cafeteria (Ground Floor)',
      building: 'Student Amenities Block',
      floor: 'Ground Floor',
      zones: CANTEEN_ZONES,
      mapType: 'custom_floorplan',
      active: true
    });

    const library = await CampusLocation.create({
      name: 'Central Library',
      code: 'LIBRARY',
      description: 'Central Knowledge Repository & Study Rooms',
      building: 'Academic Block A',
      floor: '1st Floor',
      zones: [
        { name: 'Reading Hall', code: 'READING_HALL', description: 'Silent study desks', bounds: { xMin: 100, xMax: 500, yMin: 100, yMax: 400 } },
        { name: 'Digital Lab', code: 'DIGITAL_LAB', description: 'E-resource computer terminals', bounds: { xMin: 550, xMax: 900, yMin: 100, yMax: 300 } },
        { name: 'Circulation Desk', code: 'CIRCULATION', description: 'Book issue and return counter', bounds: { xMin: 350, xMax: 650, yMin: 450, yMax: 600 } }
      ],
      mapType: 'custom_floorplan',
      active: true
    });

    const compLab = await CampusLocation.create({
      name: 'Computer Center',
      code: 'COMP_LAB',
      description: 'Departmental Computing Facility and Project Labs',
      building: 'Tech Block 2',
      floor: '2nd Floor',
      zones: [
        { name: 'Lab 1 (Programming)', code: 'LAB_1', description: 'Systems 1 - 40', bounds: { xMin: 100, xMax: 450, yMin: 100, yMax: 500 } },
        { name: 'Lab 2 (AI/Data)', code: 'LAB_2', description: 'Workstations 41 - 80', bounds: { xMin: 500, xMax: 900, yMin: 100, yMax: 500 } }
      ],
      mapType: 'custom_floorplan',
      active: true
    });

    // 3. Seed Lost Items
    console.log('[Seed] Creating lost item reports...');
    const now = new Date();
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
    const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);

    const lostWallet = await LostItem.create({
      userId: student1._id,
      itemName: 'Black Leather Wallet',
      category: 'Wallet',
      brand: 'WildHorn',
      model: 'Slim Bi-fold',
      color: 'Black',
      quantity: 1,
      description: 'Black textured leather bi-fold wallet lost during lunch break. Contains college identity card and some cash.',
      images: ['https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop&q=80'],
      lostDate: twoDaysAgo,
      approxTime: '1:15 PM',
      timeRange: '1:00 PM - 2:00 PM',
      locationId: canteen._id,
      locationName: 'College Canteen',
      zone: 'Dining Tables 4 - 6 (Central Wing)',
      mapCoordinates: { x: 320, y: 380 },
      exactSpot: 'On Table 5 near chair corner',
      privateIdentifier: 'Contains student ID 2024CS014, Rs 450 cash, and a blue metro smart card with sticker',
      status: 'MATCH_FOUND'
    });

    const lostEarphones = await LostItem.create({
      userId: student3._id,
      itemName: 'Boat Rockerz Wireless Neckband',
      category: 'Earphones',
      brand: 'Boat',
      model: 'Rockerz 255 Pro',
      color: 'Black',
      quantity: 1,
      description: 'Black bluetooth neckband earphones misplaced while sitting at breakfast table.',
      images: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80'],
      lostDate: fiveDaysAgo,
      approxTime: '10:30 AM',
      timeRange: '10:00 AM - 11:00 AM',
      locationId: canteen._id,
      locationName: 'College Canteen',
      zone: 'Dining Tables 1 - 3 (North Wing)',
      mapCoordinates: { x: 260, y: 170 },
      exactSpot: 'Table 2 under tissue stand',
      privateIdentifier: 'Left earbud silicone tip is replaced with red tip, minor scratch on volume + button',
      status: 'CLAIM_APPROVED'
    });

    const lostBottle = await LostItem.create({
      userId: student1._id,
      itemName: 'Milton Thermosteel Water Bottle',
      category: 'Water Bottle',
      brand: 'Milton',
      model: 'Thermosteel 750ml',
      color: 'Blue',
      quantity: 1,
      description: 'Matte dark blue stainless steel insulated water flask left near drinking area.',
      images: ['https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80'],
      lostDate: oneDayAgo,
      approxTime: '3:30 PM',
      timeRange: '3:00 PM - 4:00 PM',
      locationId: canteen._id,
      locationName: 'College Canteen',
      zone: 'Water Station & Wash Area',
      mapCoordinates: { x: 150, y: 550 },
      exactSpot: 'Left shelf next to water cooler filter',
      privateIdentifier: 'Small scratch mark near bottom rim with engraved initials "AS"',
      status: 'SEARCHING'
    });

    const lostCalculator = await LostItem.create({
      userId: student2._id,
      itemName: 'Casio Scientific Calculator fx-991EX',
      category: 'Calculator',
      brand: 'Casio',
      model: 'ClassWiz fx-991EX',
      color: 'Black',
      quantity: 1,
      description: 'Scientific calculator left in library after Engineering Maths revision.',
      images: ['https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=600&auto=format&fit=crop&q=80'],
      lostDate: threeDaysAgo,
      approxTime: '5:00 PM',
      timeRange: '4:30 PM - 5:30 PM',
      locationId: library._id,
      locationName: 'Central Library',
      zone: 'Reading Hall',
      mapCoordinates: { x: 250, y: 220 },
      exactSpot: 'Table 14 near the second window',
      privateIdentifier: 'Small Harry Potter lightning bolt holographic sticker on battery compartment lid',
      status: 'REPORTED'
    });

    // 4. Seed Found Items
    console.log('[Seed] Creating found item reports...');
    const foundWallet = await FoundItem.create({
      userId: student2._id,
      itemName: 'Black Leather Wallet',
      category: 'Wallet',
      brand: 'WildHorn',
      model: 'Bi-fold',
      color: 'Black',
      description: 'Found a men\'s black wallet sitting on a chair in the central canteen area. Handed over to Campus Security Desk.',
      images: ['https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop&q=80'],
      foundDate: twoDaysAgo,
      foundTime: '1:45 PM',
      locationId: canteen._id,
      locationName: 'College Canteen',
      zone: 'Dining Tables 4 - 6 (Central Wing)',
      mapCoordinates: { x: 330, y: 390 },
      exactSpot: 'Under Table 5 chair',
      currentLocation: 'Submitted to Security Office',
      storageRefNumber: 'SEC-2026-0042',
      privateIdentifier: 'Contains student ID 2024CS014 and blue metro pass with sticker',
      status: 'MATCHING'
    });

    const foundEarphones = await FoundItem.create({
      userId: admin._id,
      itemName: 'Boat Wireless Earphones Neckband',
      category: 'Earphones',
      brand: 'Boat',
      model: 'Rockerz 255',
      color: 'Black',
      description: 'Found black neckband earphones left on dining table during daily inspection.',
      images: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80'],
      foundDate: fiveDaysAgo,
      foundTime: '11:00 AM',
      locationId: canteen._id,
      locationName: 'College Canteen',
      zone: 'Dining Tables 1 - 3 (North Wing)',
      mapCoordinates: { x: 250, y: 180 },
      exactSpot: 'Table 2 near window',
      currentLocation: 'Submitted to Security Office',
      storageRefNumber: 'SEC-2026-0038',
      privateIdentifier: 'Has one red replacement ear tip',
      status: 'CLAIM_APPROVED'
    });

    const foundFlask = await FoundItem.create({
      userId: student3._id,
      itemName: 'Blue Insulated Water Flask',
      category: 'Water Bottle',
      brand: 'Milton',
      model: 'Thermosteel',
      color: 'Blue',
      description: 'Found blue metal water bottle on the water filter stand in canteen.',
      images: ['https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80'],
      foundDate: oneDayAgo,
      foundTime: '4:10 PM',
      locationId: canteen._id,
      locationName: 'College Canteen',
      zone: 'Water Station & Wash Area',
      mapCoordinates: { x: 160, y: 540 },
      exactSpot: 'Water dispenser shelf',
      currentLocation: 'Submitted to Security Office',
      storageRefNumber: 'SEC-2026-0047',
      privateIdentifier: 'Initials AS engraved on base',
      status: 'REPORTED'
    });

    const foundIdCard = await FoundItem.create({
      userId: student1._id,
      itemName: 'Student Identity Card',
      category: 'ID Card',
      brand: 'College',
      model: 'RFID Card',
      color: 'White',
      description: 'Found student ID card lying on food ordering counter.',
      images: ['https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80'],
      foundDate: oneDayAgo,
      foundTime: '2:15 PM',
      locationId: canteen._id,
      locationName: 'College Canteen',
      zone: 'Food Ordering Counter',
      mapCoordinates: { x: 750, y: 520 },
      exactSpot: 'Billing counter ledge near token machine',
      currentLocation: 'With me',
      storageRefNumber: '',
      privateIdentifier: 'Belongs to Sarah Thomas (2023EC089) with red lanyard',
      status: 'REPORTED'
    });

    // 5. Compute Matches
    console.log('[Seed] Generating matching records...');
    const walletScore = calculateMatchScore(lostWallet, foundWallet);
    const earphoneScore = calculateMatchScore(lostEarphones, foundEarphones);
    const bottleScore = calculateMatchScore(lostBottle, foundFlask);

    const matchWallet = await Match.create({
      lostItemId: lostWallet._id,
      foundItemId: foundWallet._id,
      score: walletScore.score,
      matchLevel: walletScore.matchLevel,
      matchingFactors: walletScore.matchingFactors,
      status: 'POTENTIAL'
    });

    const matchEarphones = await Match.create({
      lostItemId: lostEarphones._id,
      foundItemId: foundEarphones._id,
      score: earphoneScore.score,
      matchLevel: earphoneScore.matchLevel,
      matchingFactors: earphoneScore.matchingFactors,
      status: 'CLAIM_INITIATED'
    });

    const matchBottle = await Match.create({
      lostItemId: lostBottle._id,
      foundItemId: foundFlask._id,
      score: bottleScore.score,
      matchLevel: bottleScore.matchLevel,
      matchingFactors: bottleScore.matchingFactors,
      status: 'POTENTIAL'
    });

    // 6. Create Claims
    console.log('[Seed] Creating claims...');
    // Approved claim for earphones
    const approvedClaim = await Claim.create({
      matchId: matchEarphones._id,
      foundItemId: foundEarphones._id,
      lostItemId: lostEarphones._id,
      claimantUserId: student3._id,
      answers: {
        whereLost: 'Table 2 in College Canteen during morning break',
        uniqueFeatures: 'Left earbud has a contrasting red silicone tip because the original black tip was lost',
        insideOrAttached: 'Connected via Bluetooth to device name "Rahul\'s Phone"'
      },
      proofImages: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80'],
      status: 'APPROVED',
      adminNotes: 'Unique red silicone tip on left earbud perfectly matches private identifying details logged by finder.',
      reviewedBy: admin._id,
      reviewedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)
    });

    // Pending claim for wallet
    const pendingClaim = await Claim.create({
      matchId: matchWallet._id,
      foundItemId: foundWallet._id,
      lostItemId: lostWallet._id,
      claimantUserId: student1._id,
      answers: {
        whereLost: 'Central dining tables near Table 5 during lunch hour',
        uniqueFeatures: 'WildHorn brown/black textured leather bi-fold with slight fray on edge',
        insideOrAttached: 'Student ID card 2024CS014, metro pass with sticker, approx 450 in cash'
      },
      proofImages: [],
      status: 'PENDING_REVIEW',
      adminNotes: ''
    });

    // 7. Seed Notifications
    console.log('[Seed] Creating notifications...');
    await Notification.create({
      userId: student1._id,
      type: 'MATCH_FOUND',
      title: `Possible Match Found! (${walletScore.score}%)`,
      message: `A Black Leather Wallet found at College Canteen matches your reported lost item with high confidence.`,
      relatedItemId: foundWallet._id,
      relatedItemType: 'FoundItem',
      relatedMatchId: matchWallet._id,
      isRead: false
    });

    await Notification.create({
      userId: student1._id,
      type: 'MATCH_FOUND',
      title: `Possible Match Found! (${bottleScore.score}%)`,
      message: `A Blue Milton Water Bottle found at College Canteen matches your lost report.`,
      relatedItemId: foundFlask._id,
      relatedItemType: 'FoundItem',
      relatedMatchId: matchBottle._id,
      isRead: false
    });

    await Notification.create({
      userId: student3._id,
      type: 'CLAIM_APPROVED',
      title: 'Ownership Claim Approved! 🎉',
      message: 'Your claim for "Boat Rockerz Wireless Neckband" has been verified and approved. Please visit Campus Security Office with your ID.',
      relatedItemId: foundEarphones._id,
      relatedItemType: 'FoundItem',
      relatedClaimId: approvedClaim._id,
      isRead: true
    });

    await Notification.create({
      userId: admin._id,
      type: 'CLAIM_SUBMITTED',
      title: 'New Ownership Claim Submitted',
      message: 'Student Aarav Sharma (2024CS014) submitted a claim for Black Leather Wallet.',
      relatedItemId: foundWallet._id,
      relatedItemType: 'FoundItem',
      relatedClaimId: pendingClaim._id,
      isRead: false
    });

    console.log('==================================================');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('==================================================');
    console.log('Demo Credentials:');
    console.log('Admin:   admin@gmail.com   / Admin@123');
    console.log('Student: student@gmail.com / Campus@123');
    console.log('Student: sarah@gmail.com   / Campus@123');
    console.log('Student: rahul@gmail.com   / Campus@123');
    console.log('==================================================');

    process.exit(0);
  } catch (error) {
    console.error('[Seed] Database seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
