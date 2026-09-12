const Customer = require("../models/Customer");

const BASELINE_CUSTOMERS = [
  {
    customerId: "CUST-0001",
    name: "Ramesh Kumar",
    phone: "98456 12345",
    email: "ramesh.k@gmail.com",
    customerType: "Retail",
    location: "Chennai",
    totalPurchases: 12450.0,
    lastPurchase: new Date("2026-09-03"),
    status: "Active",
  },
  {
    customerId: "CUST-0002",
    name: "Priya Sharma",
    phone: "98765 43210",
    email: "priya.sharma@gmail.com",
    customerType: "Retail",
    location: "Chennai",
    totalPurchases: 8760.0,
    lastPurchase: new Date("2026-09-02"),
    status: "Active",
  },
  {
    customerId: "CUST-0003",
    name: "LifeCare Hospital",
    phone: "91234 56789",
    email: "procurement@lifecare.org",
    customerType: "Hospital",
    location: "Coimbatore",
    totalPurchases: 56320.0,
    lastPurchase: new Date("2026-09-01"),
    status: "Active",
  },
  {
    customerId: "CUST-0004",
    name: "Sri Balaji Clinic",
    phone: "99887 66554",
    email: "contact@balajiclinic.in",
    customerType: "Clinic",
    location: "Madurai",
    totalPurchases: 24180.0,
    lastPurchase: new Date("2026-08-30"),
    status: "Active",
  },
  {
    customerId: "CUST-0005",
    name: "Karthik Medicals",
    phone: "98654 77890",
    email: "orders@karthikmedicals.com",
    customerType: "Wholesale",
    location: "Trichy",
    totalPurchases: 125600.0,
    lastPurchase: new Date("2026-08-28"),
    status: "Active",
  },
  {
    customerId: "CUST-0006",
    name: "Anitha Devi",
    phone: "98412 33456",
    email: "anitha.devi@gmail.com",
    customerType: "Retail",
    location: "Chennai",
    totalPurchases: 6320.0,
    lastPurchase: new Date("2026-08-25"),
    status: "Active",
  },
  {
    customerId: "CUST-0007",
    name: "City Care Hospital",
    phone: "96587 44556",
    email: "supply@citycarehospitals.com",
    customerType: "Hospital",
    location: "Salem",
    totalPurchases: 78450.0,
    lastPurchase: new Date("2026-08-22"),
    status: "Active",
  },
  {
    customerId: "CUST-0008",
    name: "Arun Clinic",
    phone: "97865 22334",
    email: "arun.clinic@yahoo.com",
    customerType: "Clinic",
    location: "Erode",
    totalPurchases: 18990.0,
    lastPurchase: new Date("2026-08-20"),
    status: "Inactive",
  },
  {
    customerId: "CUST-0009",
    name: "Health Plus Pharma",
    phone: "93456 77881",
    email: "info@healthpluspharma.com",
    customerType: "Wholesale",
    location: "Coimbatore",
    totalPurchases: 95600.0,
    lastPurchase: new Date("2026-08-18"),
    status: "Active",
  },
  {
    customerId: "CUST-0010",
    name: "Divya S",
    phone: "99654 11223",
    email: "divya.s@gmail.com",
    customerType: "Retail",
    location: "Chennai",
    totalPurchases: 4850.0,
    lastPurchase: new Date("2026-08-15"),
    status: "Inactive",
  },
];

// Helper to generate up to 856 realistic customers
const generateExtraCustomers = () => {
  const types = ["Retail", "Hospital", "Clinic", "Wholesale"];
  const locations = ["Chennai", "Coimbatore", "Madurai", "Trichy", "Salem", "Erode", "Tirunelveli", "Vellore"];
  const firstNames = [
    "Vijay", "Surya", "Kavitha", "Meena", "Senthil", "Deepak", "Swati", "Rajesh",
    "Preeti", "Ganesh", "Lakshmi", "Venkatesh", "Anand", "Nisha", "Manish", "Bhavna",
    "Apollo", "KMC", "SIMS", "Kauvery", "Global", "Fortis", "Meenakshi", "Ganga"
  ];
  const lastNames = [
    "Kumar", "Sundaram", "Raman", "Natarajan", "Clinic", "Hospital", "Pharma", "Medicals",
    "Subramanian", "Patel", "Reddy", "Chowdhury", "Iyer", "Varma", "Care", "Diagnostics"
  ];

  const items = [];
  const baseDate = new Date("2026-08-14");

  for (let i = 11; i <= 856; i++) {
    const padIndex = String(i).padStart(4, "0");
    const custId = `CUST-${padIndex}`;
    const type = types[(i - 11) % types.length];
    const loc = locations[(i - 11) % locations.length];
    const fName = firstNames[(i - 11) % firstNames.length];
    const lName = lastNames[(i - 11) % lastNames.length];

    let fullName = `${fName} ${lName}`;
    if (type === "Hospital" && !fullName.includes("Hospital")) fullName = `${fName} Specialty Hospital`;
    if (type === "Clinic" && !fullName.includes("Clinic")) fullName = `${fName} Health Clinic`;
    if (type === "Wholesale" && !fullName.includes("Pharma") && !fullName.includes("Medicals")) fullName = `${fName} Wholesale Pharma`;

    const phone1 = Math.floor(90000 + Math.random() * 90000);
    const phone2 = Math.floor(10000 + Math.random() * 90000);
    const phoneStr = `${phone1} ${phone2}`;

    const daysAgo = Math.floor((i / 856) * 120);
    const lastDate = new Date(baseDate.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    const isInactive = i % 8 === 0 || i % 13 === 0;

    items.push({
      customerId: custId,
      name: fullName,
      phone: phoneStr,
      email: `${fName.toLowerCase()}.${lName.toLowerCase()}${i}@gmail.com`,
      customerType: type,
      location: loc,
      totalPurchases: Math.floor(Math.random() * 150000) + 1500,
      lastPurchase: lastDate,
      status: isInactive ? "Inactive" : "Active",
    });
  }
  return items;
};

const autoSeedCustomers = async () => {
  try {
    const count = await Customer.countDocuments();
    if (count < 10) {
      const allCustomers = [...BASELINE_CUSTOMERS, ...generateExtraCustomers()];
      for (const item of allCustomers) {
        const existing = await Customer.findOne({ customerId: item.customerId });
        if (!existing) {
          await Customer.create(item);
        }
      }
      console.log(`[Customer Seeder] Successfully seeded ${allCustomers.length} customers.`);
    } else {
      for (const item of BASELINE_CUSTOMERS) {
        const existing = await Customer.findOne({ customerId: item.customerId });
        if (!existing) {
          await Customer.create(item);
        }
      }
      console.log(`[Customer Seeder] Verified baseline customers in database.`);
    }
  } catch (error) {
    console.error("[Customer Seeder] Error seeding customers:", error.message);
  }
};

module.exports = autoSeedCustomers;
