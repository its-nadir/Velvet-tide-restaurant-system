const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Page = require("../models/Page");
const Content = require("../models/Content");
const Link = require("../models/Link");
const Contact = require("../models/Contact");
const OpeningHour = require("../models/OpeningHour");
const Review = require("../models/Review");

const pageSeeds = [{ name: "Home" }, { name: "About" }, { name: "Contact" }];

const contentSeeds = [
  {
    page: "Home",
    heading: "An intimate tasting through the tide",
    desc: "Velvet Tide celebrates coastal elegance with a Parisian pulse. Every service is choreographed with scratch cooking, curated beverages, and friendly hospitality.",
  },
  {
    page: "Home",
    heading: "Fresh daily artistry",
    desc: "Our culinary team works with nearby farmers and trusted fishmongers to bring in pristine product every morning.",
  },
  {
    page: "About",
    heading: "Our story",
    desc: "Founded in 2015, Velvet Tide has become a gathering place for guests who crave authentic flavor and intimate dining moments.",
  },
  {
    page: "About",
    heading: "Our philosophy",
    desc: "Dining should feel both relaxed and refined. We blend warm service with meticulous craftsmanship so every guest feels at home.",
  },
  {
    page: "Contact",
    heading: "Visit us",
    desc: "89 Rue des Fleurs, 75007 Paris. Nestled steps from the Seine, our atelier offers salon style seating Tuesday through Sunday.",
  },
];

const linkSeeds = [
  { name: "Reservations", link: "/reservation" },
  { name: "Chef's menu", link: "/menu" },
  { name: "Instagram", link: "https://instagram.com/velvettide" },
  { name: "Press kit", link: "/press" },
];

const contactSeeds = [
  { contact: "Concierge", contactInfo: "+33 1 89 45 78 21" },
  { contact: "Email", contactInfo: "reservations@velvettide.com" },
  { contact: "Private dining", contactInfo: "events@velvettide.com" },
];

const openingHourSeeds = [
  { day: "Tuesday", openHour: "18:00", closeHour: "23:00" },
  { day: "Wednesday", openHour: "18:00", closeHour: "23:00" },
  { day: "Thursday", openHour: "18:00", closeHour: "23:00" },
  { day: "Friday", openHour: "18:00", closeHour: "00:00" },
  { day: "Saturday", openHour: "11:00", closeHour: "00:00" },
  { day: "Sunday", openHour: "11:00", closeHour: "14:00" },
];

const reviewSeeds = [
  {
    reviewerName: "Brevardrox",
    review: "Great service and a perfect salmon Benedict while I was in town for business. I will be back for dinner soon.",
  },
  {
    reviewerName: "Sarah M.",
    review: "Absolutely amazing experience. The food was exquisite and the ambiance flawlessly balanced glamour with comfort.",
  },
  {
    reviewerName: "Michael R.",
    review: "The best dining room I have visited this year. Every dish felt intentional and the team remembered every detail.",
  },
];

const seedCms = async () => {
  await connectDB();

  const db = mongoose.connection.db;
  try {
    await db.collection("pages").dropIndexes();
  } catch {
    // ignore if collection or indexes do not yet exist
  }
  await Page.deleteMany({});
  const insertedPages = await Page.insertMany(pageSeeds);
  const pageMap = insertedPages.reduce((acc, page) => {
    acc[page.name] = page._id;
    return acc;
  }, {});

  await Content.deleteMany({});
  await Content.insertMany(
    contentSeeds.map((item) => ({
      pageId: pageMap[item.page],
      heading: item.heading,
      desc: item.desc,
    }))
  );

  await Link.deleteMany({});
  await Link.insertMany(linkSeeds);

  await Contact.deleteMany({});
  await Contact.insertMany(contactSeeds);

  await OpeningHour.deleteMany({});
  await OpeningHour.insertMany(openingHourSeeds);

  await Review.deleteMany({});
  await Review.insertMany(reviewSeeds);

  console.log("Seeded CMS collections");
};

seedCms()
  .then(async () => {
    await mongoose.connection.close();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error("Failed to seed CMS collections", error);
    await mongoose.connection.close();
    process.exit(1);
  });
