const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Admin = require("../models/Admin");

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    const adminEmail = "pandikarthi567@gmail.com";
    const adminPassword = "Karthik@2005";

    let admin = await Admin.findOne({ email: adminEmail }).select("+password");

    if (admin) {
      admin.password = adminPassword;
      await admin.save();
      console.log("Admin password updated successfully for:", adminEmail);
    } else {
      admin = await Admin.create({
        name: "Pandi Karthik",
        email: adminEmail,
        password: adminPassword,
      });
      console.log("Admin created successfully for:", adminEmail);
    }

    console.log({
      email: admin.email,
      password: adminPassword,
    });

    process.exit(0);
  } catch (error) {
    console.error("Seeder error:", error.message);
    process.exit(1);
  }
};

seedAdmin();