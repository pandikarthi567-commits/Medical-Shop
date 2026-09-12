const requiredEnvVars = [
  "PORT",
  "MONGO_URI",
  "JWT_SECRET",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "TWILIO_SID",
  "TWILIO_AUTH_TOKEN",
  "TWILIO_PHONE",
  // EMAIL_USER and EMAIL_PASS removed from strict check
];

const optionalEnvVars = ["EMAIL_USER", "EMAIL_PASS"];

const validateEnv = () => {
  const missing = [];

  requiredEnvVars.forEach((key) => {
    if (!process.env[key]) {
      missing.push(key);
    }
  });

  if (missing.length > 0) {
    console.error("❌ MISSING ENV VARIABLES:");
    missing.forEach((key) => console.error(" - " + key));

    throw new Error("Server startup blocked due to missing env variables");
  }

  // Optional warnings
  optionalEnvVars.forEach((key) => {
    if (!process.env[key]) {
      console.warn(`⚠️ Optional env missing: ${key}`);
    }
  });

  console.log("✅ Environment validation completed");
};

module.exports = validateEnv;