const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Order = require("../models/Order");
const Medicine = require("../models/Medicine");
const User = require("../models/User");

const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

dotenv.config();

const salesData = [
  {
    orderId: "INV-000123",
    customerName: "Walk-in Customer",
    customerPhone: "9876543201",
    customerEmail: "walkin1@gmail.com",
    totalAmount: 245.0,
    subtotal: 245.0,
    paymentMethod: "Cash",
    paymentStatus: "PAID",
    orderStatus: "DELIVERED",
    deliveryStatus: "DELIVERED",
    itemCount: 3,
    createdAt: new Date("2026-09-03T10:24:00+05:30"),
  },
  {
    orderId: "INV-000122",
    customerName: "Ramesh K",
    customerPhone: "9876543202",
    customerEmail: "ramesh.k@gmail.com",
    totalAmount: 1280.0,
    subtotal: 1280.0,
    paymentMethod: "UPI",
    paymentStatus: "PAID",
    orderStatus: "DELIVERED",
    deliveryStatus: "DELIVERED",
    itemCount: 5,
    createdAt: new Date("2026-09-03T09:18:00+05:30"),
  },
  {
    orderId: "INV-000121",
    customerName: "Priya S",
    customerPhone: "9876543203",
    customerEmail: "priya.s@gmail.com",
    totalAmount: 560.0,
    subtotal: 560.0,
    paymentMethod: "Card",
    paymentStatus: "PAID",
    orderStatus: "DELIVERED",
    deliveryStatus: "DELIVERED",
    itemCount: 2,
    createdAt: new Date("2026-09-02T18:45:00+05:30"),
  },
  {
    orderId: "INV-000120",
    customerName: "Walk-in Customer",
    customerPhone: "9876543204",
    customerEmail: "walkin2@gmail.com",
    totalAmount: 120.0,
    subtotal: 120.0,
    paymentMethod: "Cash",
    paymentStatus: "PAID",
    orderStatus: "DELIVERED",
    deliveryStatus: "DELIVERED",
    itemCount: 1,
    createdAt: new Date("2026-09-02T13:30:00+05:30"),
  },
  {
    orderId: "INV-000119",
    customerName: "Karthik M",
    customerPhone: "9876543205",
    customerEmail: "karthik.m@gmail.com",
    totalAmount: 890.0,
    subtotal: 890.0,
    paymentMethod: "UPI",
    paymentStatus: "PAID",
    orderStatus: "DELIVERED",
    deliveryStatus: "DELIVERED",
    itemCount: 4,
    createdAt: new Date("2026-09-01T17:12:00+05:30"),
  },
  {
    orderId: "INV-000118",
    customerName: "Anitha R",
    customerPhone: "9876543206",
    customerEmail: "anitha.r@gmail.com",
    totalAmount: 1450.0,
    subtotal: 1450.0,
    paymentMethod: "Card",
    paymentStatus: "PAID",
    orderStatus: "DELIVERED",
    deliveryStatus: "DELIVERED",
    itemCount: 6,
    createdAt: new Date("2026-09-01T11:05:00+05:30"),
  },
  {
    orderId: "INV-000117",
    customerName: "Walk-in Customer",
    customerPhone: "9876543207",
    customerEmail: "walkin3@gmail.com",
    totalAmount: 310.0,
    subtotal: 310.0,
    paymentMethod: "Cash",
    paymentStatus: "PAID",
    orderStatus: "DELIVERED",
    deliveryStatus: "DELIVERED",
    itemCount: 2,
    createdAt: new Date("2026-08-31T16:20:00+05:30"),
  },
  {
    orderId: "INV-000116",
    customerName: "Suresh V",
    customerPhone: "9876543208",
    customerEmail: "suresh.v@gmail.com",
    totalAmount: 620.0,
    subtotal: 620.0,
    paymentMethod: "UPI",
    paymentStatus: "PAID",
    orderStatus: "DELIVERED",
    deliveryStatus: "DELIVERED",
    itemCount: 3,
    createdAt: new Date("2026-08-31T12:10:00+05:30"),
  },
  {
    orderId: "INV-000115",
    customerName: "Divya L",
    customerPhone: "9876543209",
    customerEmail: "divya.l@gmail.com",
    totalAmount: 95.0,
    subtotal: 95.0,
    paymentMethod: "Cash",
    paymentStatus: "PAID",
    orderStatus: "DELIVERED",
    deliveryStatus: "DELIVERED",
    itemCount: 1,
    createdAt: new Date("2026-08-30T18:30:00+05:30"),
  },
  {
    orderId: "INV-000114",
    customerName: "Walk-in Customer",
    customerPhone: "9876543210",
    customerEmail: "walkin4@gmail.com",
    totalAmount: 780.0,
    subtotal: 780.0,
    paymentMethod: "Card",
    paymentStatus: "PAID",
    orderStatus: "DELIVERED",
    deliveryStatus: "DELIVERED",
    itemCount: 4,
    createdAt: new Date("2026-08-30T10:15:00+05:30"),
  },
];

const seedSalesData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb://localhost:27017/medical_shop");
    console.log("Connected to MongoDB for sales seed.");

    // 1. Ensure user exists
    let user = await User.findOne();
    if (!user) {
      user = await User.create({
        name: "Pharmacy Customer",
        phone: "9876543210",
        location: "Chennai, Tamil Nadu",
      });
    }

    // 2. Ensure medicines exist
    const sampleMedicines = [
      { name: "Paracetamol 500mg", category: "Pain Relief", price: 25, stock: 150, expiryDate: new Date("2027-01-01") },
      { name: "Cetirizine 10mg", category: "Allergy", price: 35, stock: 80, expiryDate: new Date("2027-02-01") },
      { name: "Amoxicillin 250mg", category: "Antibiotics", price: 65, stock: 95, expiryDate: new Date("2026-12-01") },
      { name: "Pantoprazole 40mg", category: "Gastro Care", price: 85, stock: 110, expiryDate: new Date("2027-05-01") },
      { name: "Azithromycin 500mg", category: "Antibiotics", price: 115, stock: 45, expiryDate: new Date("2026-11-01") },
    ];

    const medicineDocs = [];
    for (const med of sampleMedicines) {
      let doc = await Medicine.findOne({ name: med.name });
      if (!doc) {
        doc = await Medicine.create(med);
      }
      medicineDocs.push(doc);
    }

    // 3. Insert sales transactions if not present
    for (const item of salesData) {
      const existing = await Order.findOne({ orderId: item.orderId });
      if (!existing) {
        const orderItems = [];
        const count = item.itemCount || 1;
        for (let i = 0; i < count; i++) {
          const med = medicineDocs[i % medicineDocs.length];
          const price = med.price || 50;
          orderItems.push({
            productId: med._id,
            name: med.name,
            price: price,
            quantity: 1,
            subtotal: price,
          });
        }

        await Order.create({
          orderId: item.orderId,
          user: user._id,
          customerName: item.customerName,
          customerEmail: item.customerEmail,
          customerPhone: item.customerPhone,
          items: orderItems,
          shippingAddress: {
            fullName: item.customerName,
            phone: item.customerPhone,
            addressLine1: "Counter Sale / Walk-in",
            city: "Chennai",
            state: "Tamil Nadu",
            postalCode: "600001",
            country: "India",
          },
          subtotal: item.subtotal,
          shippingCharge: 0,
          tax: 0,
          totalAmount: item.totalAmount,
          paymentMethod: item.paymentMethod,
          paymentStatus: item.paymentStatus,
          orderStatus: item.orderStatus,
          deliveryStatus: item.deliveryStatus,
          createdAt: item.createdAt,
          updatedAt: item.createdAt,
        });
        console.log(`Inserted sale order: ${item.orderId}`);
      }
    }

    console.log("Sales seeding complete.");
    process.exit(0);
  } catch (err) {
    console.error("Sales seeder failed:", err);
    process.exit(1);
  }
};

seedSalesData();
