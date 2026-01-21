require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const { hashPassword } = require("../services/password");

async function main() {
  const uri = process.env.MONGODB_URI;
  await mongoose.connect(uri);

  const email = (process.env.SEED_ADMIN_EMAIL || "admin@techmatch.local").toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD || "ChangeThisAdminPassword123!";
  const name = process.env.SEED_ADMIN_NAME || "TechMatch Admin";

  const existing = await User.findOne({ email });
  if (existing) {
    console.log("Admin already exists:", email);
    process.exit(0);
  }

  const passwordHash = await hashPassword(password);

  await User.create({
    role: "ADMIN",
    status: "ACTIVE",
    email,
    passwordHash,
    profile: { fullName: name },
  });

  console.log("Seeded admin:", email);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
