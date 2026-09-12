const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");

const autoSeedAdmin = async () => {
  try {
    const adminEmail = "pandikarthi567@gmail.com";
    const adminPassword = "Karthik@2005";

    let admin = await Admin.findOne({ email: adminEmail }).select("+password");

    if (!admin) {
      admin = await Admin.create({
        name: "Pandi Karthik",
        email: adminEmail,
        password: adminPassword,
      });
      console.log(`[Admin Seeder] Created default admin: ${adminEmail}`);
    } else {
      // Update password to ensure Karthik@2005 works
      const isMatch = await admin.matchPassword(adminPassword);
      if (!isMatch) {
        admin.password = adminPassword;
        await admin.save();
        console.log(`[Admin Seeder] Updated password for admin: ${adminEmail}`);
      } else {
        console.log(`[Admin Seeder] Admin account verified: ${adminEmail}`);
      }
    }
  } catch (error) {
    console.error("[Admin Seeder] Error seeding admin:", error.message);
  }
};

module.exports = autoSeedAdmin;
