/**
 * Database seed script.
 *
 * Populates the database with demo users and at least 10 sample items
 * per section (Marketplace, Lost & Found, Academic Resources, Events)
 * plus a couple of sample conversations, so the app doesn't look empty
 * during demos/review.
 *
 * Safe to re-run: it checks what already exists and only fills in
 * what's missing, it never deletes real data.
 *
 * Usage (from the /server folder):
 *   node utils/seed.js
 * or
 *   npm run seed
 */

require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const connectDB = require("../config/db");

const User = require("../models/User");
const Marketplace = require("../models/Marketplace");
const LostFound = require("../models/LostFound");
const AcademicResource = require("../models/AcademicResource");
const Event = require("../models/Event");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

const DEMO_PASSWORD = "Password123!";

const demoUsers = [
  { name: "Aarav Mehta", email: "21je0317@iitism.ac.in", department: "Computer Science", year: 3, phone: "9876500001" },
  { name: "Diya Sharma", email: "22je0512@iitism.ac.in", department: "Electronics & Communication", year: 2, phone: "9876500002" },
  { name: "Rohan Verma", email: "20je0148@iitism.ac.in", department: "Mechanical Engineering", year: 4, phone: "9876500003" },
  { name: "Ananya Iyer", email: "24je0089@iitism.ac.in", department: "Civil Engineering", year: 1, phone: "9876500004" },
  { name: "Kabir Nair", email: "22je0233@iitism.ac.in", department: "Information Technology", year: 3, phone: "9876500005" },
];

const marketplaceItems = [
  { title: "Study Table with Chair", description: "Sturdy wooden study table with a matching chair. Barely used, moving out of the hostel.", price: 1800, isFree: false, category: "furniture", condition: "good", location: "Boys Hostel Block C", image: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600" },
  { title: "Scientific Calculator (Casio fx-991ES)", description: "Casio scientific calculator, works perfectly. Great for engineering coursework.", price: 500, isFree: false, category: "electronics", condition: "used", location: "Main Academic Block", image: "https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=600" },
  { title: "Data Structures & Algorithms Textbook", description: "Cormen's Introduction to Algorithms, 3rd edition. Minor highlighting inside.", price: 450, isFree: false, category: "books", condition: "used", location: "Library Reading Room", image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600" },
  { title: "Single Bed Mattress", description: "Comfortable single mattress, used for one semester only. Clean and no odour.", price: 1200, isFree: false, category: "furniture", condition: "good", location: "Girls Hostel Block A", image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600" },
  { title: "Mountain Bike (Hero Sprint)", description: "21-gear mountain bike, great for getting around campus quickly. New tyres.", price: 4500, isFree: false, category: "cycles", condition: "good", location: "Cycle Stand, Gate 2", image: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600" },
  { title: "Bluetooth Headphones", description: "boAt Rockerz wireless headphones, 20hr battery life, includes charging cable.", price: 900, isFree: false, category: "electronics", condition: "good", location: "Boys Hostel Block B", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600" },
  { title: "Drafting Kit for Engineering Drawing", description: "Complete drafting kit with set squares, compass, and scale. Used for one semester.", price: 0, isFree: true, category: "other", condition: "used", location: "Civil Department", image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600" },
  { title: "Desk Lamp with USB Port", description: "LED desk lamp with adjustable brightness and a built-in USB charging port.", price: 350, isFree: false, category: "electronics", condition: "new", location: "Girls Hostel Block B", image: "https://images.unsplash.com/photo-1543198126-06ba5ce90fe0?w=600" },
  { title: "Semester 3 Notes Bundle (Printed)", description: "Complete printed notes for Data Structures, DBMS, and OS, semester 3.", price: 200, isFree: false, category: "books", condition: "good", location: "Central Library", image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600" },
  { title: "Study Chair (Ergonomic)", description: "Ergonomic mesh-back study chair, adjustable height. Selling as I'm graduating.", price: 1500, isFree: false, category: "furniture", condition: "good", location: "Boys Hostel Block A", image: "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=600" },
  { title: "Portable Bluetooth Speaker", description: "JBL Go 2 portable speaker, compact and loud, includes USB-C cable.", price: 800, isFree: false, category: "electronics", condition: "used", location: "Student Activity Center", image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600" },
];

const lostFoundItems = [
  { title: "Lost: Black Wallet", description: "Lost my black leather wallet near the cafeteria, contains college ID and some cash.", type: "lost", category: "Personal Item", location: "Main Cafeteria", date: daysAgo(6), contactInfo: "9876500001", image: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=600" },
  { title: "Found: Silver Wristwatch", description: "Found a silver wristwatch near the basketball court. Looks like a Fastrack.", type: "found", category: "Accessory", location: "Basketball Court", date: daysAgo(4), contactInfo: "9876500002", image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600" },
  { title: "Lost: Blue Water Bottle", description: "Left my blue Milton water bottle in lecture hall 3 after the 10am class.", type: "lost", category: "Personal Item", location: "Lecture Hall 3", date: daysAgo(3), contactInfo: "9876500003", image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600" },
  { title: "Found: Set of Keys", description: "Found a set of keys with a red keychain near the library entrance.", type: "found", category: "Keys", location: "Library Entrance", date: daysAgo(8), contactInfo: "9876500004", image: "https://images.unsplash.com/photo-1582139329536-e7284fece509?w=600" },
  { title: "Lost: USB Drive (32GB)", description: "Lost a black SanDisk USB drive with important project files, please contact if found.", type: "lost", category: "Electronics", location: "Computer Lab 2", date: daysAgo(2), contactInfo: "9876500005", image: "https://images.unsplash.com/photo-1618410320928-25228d811631?w=600" },
  { title: "Found: Prescription Glasses", description: "Found a pair of black-framed prescription glasses on a bench near the garden.", type: "found", category: "Accessory", location: "Campus Garden", date: daysAgo(5), contactInfo: "9876500001", image: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=600" },
  { title: "Lost: Grey Hoodie", description: "Left my grey hoodie in the gym locker room, has my initials on the tag.", type: "lost", category: "Clothing", location: "Gym Locker Room", date: daysAgo(7), contactInfo: "9876500002", image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600" },
  { title: "Found: Student ID Card", description: "Found a student ID card near the parking lot, name starts with 'R'.", type: "found", category: "ID Card", location: "Parking Lot", date: daysAgo(1), contactInfo: "9876500003", image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600" },
  { title: "Lost: Umbrella (Black & Red)", description: "Left my black and red umbrella in the seminar hall after the guest lecture.", type: "lost", category: "Personal Item", location: "Seminar Hall", date: daysAgo(9), contactInfo: "9876500004", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600" },
  { title: "Found: Earphones (White)", description: "Found white wired earphones near the canteen tables, in a small pouch.", type: "found", category: "Electronics", location: "Canteen", date: daysAgo(2), contactInfo: "9876500005", image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600" },
  { title: "Lost: Notebook (Physics)", description: "Lost my physics notebook with handwritten notes, has a yellow cover.", type: "lost", category: "Stationery", location: "Physics Lab", date: daysAgo(4), contactInfo: "9876500001", image: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=600" },
];

const academicResources = [
  { title: "Data Structures Mid-Sem Question Paper 2024", description: "Previous year mid-semester question paper with all sections covered.", subject: "Data Structures", department: "Computer Science", year: 2, semester: 3, resourceType: "question-paper", fileUrl: "https://example.com/resources/ds-midsem-2024.pdf" },
  { title: "DBMS Complete Notes", description: "Well-organized handwritten notes covering ER diagrams, normalization, and SQL.", subject: "Database Management Systems", department: "Computer Science", year: 2, semester: 4, resourceType: "notes", fileUrl: "https://example.com/resources/dbms-notes.pdf" },
  { title: "Operating Systems Previous Year Papers (2021-2023)", description: "Compilation of OS end-semester papers from the last three years.", subject: "Operating Systems", department: "Computer Science", year: 3, semester: 5, resourceType: "question-paper", fileUrl: "https://example.com/resources/os-pyqs.pdf" },
  { title: "Digital Electronics Study Material", description: "Comprehensive study material covering logic gates, K-maps, and sequential circuits.", subject: "Digital Electronics", department: "Electronics & Communication", year: 2, semester: 3, resourceType: "study-material", fileUrl: "https://example.com/resources/digital-electronics.pdf" },
  { title: "Engineering Mechanics Assignment Solutions", description: "Solved assignment covering statics and dynamics problems with diagrams.", subject: "Engineering Mechanics", department: "Mechanical Engineering", year: 1, semester: 2, resourceType: "assignment", fileUrl: "https://example.com/resources/mechanics-assignment.pdf" },
  { title: "Computer Networks Notes (Unit 1-5)", description: "Detailed notes on OSI model, TCP/IP, routing, and network security basics.", subject: "Computer Networks", department: "Information Technology", year: 3, semester: 5, resourceType: "notes", fileUrl: "https://example.com/resources/networks-notes.pdf" },
  { title: "Structural Analysis Question Bank", description: "Question bank with important questions and expected answers for exams.", subject: "Structural Analysis", department: "Civil Engineering", year: 3, semester: 6, resourceType: "question-paper", fileUrl: "https://example.com/resources/structural-analysis-qb.pdf" },
  { title: "Thermodynamics Study Guide", description: "Concise guide covering laws of thermodynamics, cycles, and solved numericals.", subject: "Thermodynamics", department: "Mechanical Engineering", year: 2, semester: 3, resourceType: "study-material", fileUrl: "https://example.com/resources/thermodynamics-guide.pdf" },
  { title: "Python Programming Lab Manual", description: "Complete lab manual with all experiments and sample code for the semester.", subject: "Python Programming", department: "Computer Science", year: 1, semester: 1, resourceType: "study-material", fileUrl: "https://example.com/resources/python-lab-manual.pdf" },
  { title: "Signals and Systems Assignment", description: "Solved assignment covering Fourier transforms and system response problems.", subject: "Signals and Systems", department: "Electronics & Communication", year: 2, semester: 4, resourceType: "assignment", fileUrl: "https://example.com/resources/signals-systems.pdf" },
  { title: "Surveying End-Sem Question Paper 2023", description: "Full end-semester question paper for the Surveying course, all units.", subject: "Surveying", department: "Civil Engineering", year: 2, semester: 4, resourceType: "question-paper", fileUrl: "https://example.com/resources/surveying-2023.pdf" },
];

const events = [
  { title: "Annual Tech Fest - Innovate 2026", description: "A three-day technical festival featuring hackathons, robotics, and coding competitions.", organizer: "Computer Science Department", date: daysFromNow(14), startTime: "09:00", endTime: "18:00", location: "Main Auditorium", category: "Technical" },
  { title: "Inter-Department Cricket Tournament", description: "Annual cricket tournament between all departments. Cheer for your team!", organizer: "Sports Committee", date: daysFromNow(9), startTime: "08:00", endTime: "17:00", location: "Sports Ground", category: "Sports" },
  { title: "Cultural Night - Rhythms 2026", description: "An evening of music, dance, and drama performances by students.", organizer: "Cultural Committee", date: daysFromNow(21), startTime: "18:00", endTime: "22:00", location: "Open Air Theatre", category: "Cultural" },
  { title: "Career Guidance Workshop", description: "Workshop on resume building, interview skills, and career planning with industry experts.", organizer: "Training & Placement Cell", date: daysFromNow(5), startTime: "10:00", endTime: "13:00", location: "Seminar Hall 1", category: "Workshop" },
  { title: "AI & Machine Learning Guest Lecture", description: "Guest lecture by an industry expert on the latest trends in AI and ML.", organizer: "IT Department", date: daysFromNow(7), startTime: "11:00", endTime: "12:30", location: "Lecture Hall 5", category: "Seminar" },
  { title: "Blood Donation Camp", description: "Annual blood donation camp organized in collaboration with the city hospital.", organizer: "NSS Unit", date: daysFromNow(3), startTime: "09:00", endTime: "15:00", location: "Student Activity Center", category: "Social" },
  { title: "Photography Club Exhibition", description: "Showcase of student photography from the past year, open to all.", organizer: "Photography Club", date: daysFromNow(12), startTime: "10:00", endTime: "17:00", location: "Art Gallery, Block D", category: "Cultural" },
  { title: "Startup Pitch Competition", description: "Students pitch their startup ideas to a panel of investors and alumni.", organizer: "Entrepreneurship Cell", date: daysFromNow(18), startTime: "14:00", endTime: "17:00", location: "Auditorium 2", category: "Business" },
  { title: "Yoga & Wellness Session", description: "Morning yoga and meditation session open to all students and staff.", organizer: "Wellness Club", date: daysFromNow(2), startTime: "06:30", endTime: "07:30", location: "Campus Lawn", category: "Wellness" },
  { title: "Robotics Workshop for Beginners", description: "Hands-on workshop introducing Arduino-based robotics for first and second-year students.", organizer: "Robotics Club", date: daysFromNow(10), startTime: "10:00", endTime: "16:00", location: "Robotics Lab", category: "Workshop" },
  { title: "Alumni Meet 2026", description: "Annual gathering of alumni to reconnect and network with current students.", organizer: "Alumni Association", date: daysFromNow(25), startTime: "17:00", endTime: "21:00", location: "Main Auditorium", category: "Networking" },
];

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

async function ensureUsers() {
  const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);
  const users = [];

  for (const u of demoUsers) {
    let user = await User.findOne({ email: u.email });

    if (!user) {
      user = await User.create({
        ...u,
        password: hashedPassword,
        isVerified: true,
      });
      console.log(`  + created user ${u.email}`);
    }

    users.push(user);
  }

  return users;
}

async function seedMarketplace(users) {
  const count = await Marketplace.countDocuments();
  if (count >= 10) {
    console.log(`  - Marketplace already has ${count} items, skipping`);
    return;
  }

  const docs = marketplaceItems.map((item, i) => ({
    ...item,
    seller: users[i % users.length]._id,
  }));

  await Marketplace.insertMany(docs);
  console.log(`  + inserted ${docs.length} marketplace items`);
}

async function seedLostFound(users) {
  const count = await LostFound.countDocuments();
  if (count >= 10) {
    console.log(`  - Lost & Found already has ${count} items, skipping`);
    return;
  }

  const docs = lostFoundItems.map((item, i) => ({
    ...item,
    user: users[i % users.length]._id,
  }));

  await LostFound.insertMany(docs);
  console.log(`  + inserted ${docs.length} lost & found posts`);
}

async function seedAcademic(users) {
  const count = await AcademicResource.countDocuments();
  if (count >= 10) {
    console.log(`  - Academic Resources already has ${count} items, skipping`);
    return;
  }

  const docs = academicResources.map((item, i) => ({
    ...item,
    uploadedBy: users[i % users.length]._id,
  }));

  await AcademicResource.insertMany(docs);
  console.log(`  + inserted ${docs.length} academic resources`);
}

async function seedEvents(users) {
  const count = await Event.countDocuments();
  if (count >= 10) {
    console.log(`  - Events already has ${count} items, skipping`);
    return;
  }

  const docs = events.map((item, i) => ({
    ...item,
    createdBy: users[i % users.length]._id,
  }));

  await Event.insertMany(docs);
  console.log(`  + inserted ${docs.length} events`);
}

async function seedMessages(users) {
  const count = await Conversation.countDocuments();
  if (count >= 2) {
    console.log(`  - Conversations already exist (${count}), skipping`);
    return;
  }

  const sampleExchanges = [
    [
      "Hi! Is the study table still available?",
      "Yes, it's still up for grabs. When would you like to pick it up?",
      "Would tomorrow evening work for you?",
      "Sure, that works. I'll be in Block C after 6pm.",
    ],
    [
      "Hey, I think I found your wallet near the cafeteria!",
      "Oh really? That's a huge relief, thank you so much!",
      "No problem, let me know where I can hand it over.",
    ],
  ];

  for (let i = 0; i < sampleExchanges.length && i + 1 < users.length; i++) {
    const userA = users[i];
    const userB = users[i + 1];

    const conversation = await Conversation.create({
      participants: [userA._id, userB._id],
    });

    const exchange = sampleExchanges[i];

    for (let j = 0; j < exchange.length; j++) {
      const sender = j % 2 === 0 ? userA : userB;

      await Message.create({
        conversation: conversation._id,
        sender: sender._id,
        text: exchange[j],
      });
    }
  }

  console.log(`  + inserted ${sampleExchanges.length} sample conversations`);
}

async function run() {
  console.log("Connecting to database...");
  await connectDB();

  console.log("Seeding demo users...");
  const users = await ensureUsers();

  console.log("Seeding Marketplace...");
  await seedMarketplace(users);

  console.log("Seeding Lost & Found...");
  await seedLostFound(users);

  console.log("Seeding Academic Resources...");
  await seedAcademic(users);

  console.log("Seeding Events...");
  await seedEvents(users);

  console.log("Seeding sample conversations...");
  await seedMessages(users);

  console.log("\nDone! Demo accounts (all use the same password):");
  demoUsers.forEach((u) => console.log(`  ${u.email}`));
  console.log(`  password: ${DEMO_PASSWORD}`);

  await mongoose.connection.close();
  process.exit(0);
}

run().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
