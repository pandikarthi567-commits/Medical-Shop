const Supplier = require("../models/Supplier");

const BASELINE_SUPPLIERS = [
  {
    supplierId: "SUP-0001",
    name: "Sun Pharma Distributors",
    contactPerson: "Rajesh Kumar",
    phone: "98456 12345",
    email: "sunpharma@gmail.com",
    location: "Chennai",
    supplierType: "Distributor",
    status: "Active",
  },
  {
    supplierId: "SUP-0002",
    name: "Medico Care Pvt Ltd",
    contactPerson: "Suresh B",
    phone: "98765 43210",
    email: "medicocare@gmail.com",
    location: "Coimbatore",
    supplierType: "Wholesaler",
    status: "Active",
  },
  {
    supplierId: "SUP-0003",
    name: "Apollo Wholesalers",
    contactPerson: "Anil Mehta",
    phone: "91234 56789",
    email: "apollo.wh@gmail.com",
    location: "Bangalore",
    supplierType: "Wholesaler",
    status: "Active",
  },
  {
    supplierId: "SUP-0004",
    name: "LifeCare Pharma",
    contactPerson: "Karthik R",
    phone: "99887 66554",
    email: "lifecare@gmail.com",
    location: "Madurai",
    supplierType: "Distributor",
    status: "Active",
  },
  {
    supplierId: "SUP-0005",
    name: "HealthPlus Distributors",
    contactPerson: "Priya N",
    phone: "98654 77890",
    email: "healthplus@gmail.com",
    location: "Trichy",
    supplierType: "Distributor",
    status: "Inactive",
  },
  {
    supplierId: "SUP-0006",
    name: "Globe Medicals",
    contactPerson: "Manoj Singh",
    phone: "98412 33456",
    email: "globe.med@gmail.com",
    location: "Delhi",
    supplierType: "Wholesaler",
    status: "Active",
  },
  {
    supplierId: "SUP-0007",
    name: "Sri Sai Pharma",
    contactPerson: "Vignesh P",
    phone: "96587 44556",
    email: "srisai@gmail.com",
    location: "Salem",
    supplierType: "Distributor",
    status: "Active",
  },
  {
    supplierId: "SUP-0008",
    name: "MedZone Supply",
    contactPerson: "Aruna Devi",
    phone: "97865 22334",
    email: "medzone@gmail.com",
    location: "Hyderabad",
    supplierType: "Wholesaler",
    status: "Inactive",
  },
  {
    supplierId: "SUP-0009",
    name: "Nova Remedies",
    contactPerson: "Deepak R",
    phone: "93456 77881",
    email: "nova@gmail.com",
    location: "Coimbatore",
    supplierType: "Manufacturer",
    status: "Active",
  },
  {
    supplierId: "SUP-0010",
    name: "Wellness Pharma",
    contactPerson: "Harish K",
    phone: "99654 11223",
    email: "wellness@gmail.com",
    location: "Chennai",
    supplierType: "Distributor",
    status: "Active",
  },
];

// Helper to generate up to 128 realistic suppliers
const generateExtraSuppliers = () => {
  const types = ["Distributor", "Wholesaler", "Manufacturer"];
  const locations = ["Chennai", "Coimbatore", "Bangalore", "Madurai", "Trichy", "Delhi", "Salem", "Hyderabad", "Mumbai", "Kochi"];
  const brandPrefixes = ["Cipla", "Lupin", "Dr Reddy", "Mankind", "Torrent", "Zydus", "Abbott", "Glenmark", "Apex", "Biocon", "Astra", "Cadila", "Micro Labs", "Pfizer", "Novartis"];
  const companySuffixes = ["Distributors", "Pharma Ltd", "Wholesalers", "Remedies", "Healthcare", "Laboratories", "Supply Corp", "Agencies"];
  const firstNames = ["Ramesh", "Suresh", "Karthik", "Anil", "Deepak", "Vignesh", "Harish", "Priya", "Aruna", "Manoj", "Senthil", "Vijay", "Ganesh"];

  const items = [];

  for (let i = 11; i <= 128; i++) {
    const padIndex = String(i).padStart(4, "0");
    const supId = `SUP-${padIndex}`;
    const type = types[(i - 11) % types.length];
    const loc = locations[(i - 11) % locations.length];
    const prefix = brandPrefixes[(i - 11) % brandPrefixes.length];
    const suffix = companySuffixes[(i - 11) % companySuffixes.length];
    const cPerson = `${firstNames[(i - 11) % firstNames.length]} ${String.fromCharCode(65 + ((i - 11) % 26))}`;

    const phone1 = Math.floor(90000 + Math.random() * 90000);
    const phone2 = Math.floor(10000 + Math.random() * 90000);
    const phoneStr = `${phone1} ${phone2}`;

    const email = `${prefix.toLowerCase().replace(/\s+/g, "")}${i}@gmail.com`;
    const isInactive = i % 7 === 0 || i % 11 === 0;

    items.push({
      supplierId: supId,
      name: `${prefix} ${suffix}`,
      contactPerson: cPerson,
      phone: phoneStr,
      email: email,
      location: loc,
      supplierType: type,
      status: isInactive ? "Inactive" : "Active",
    });
  }
  return items;
};

const autoSeedSuppliers = async () => {
  try {
    const count = await Supplier.countDocuments();
    if (count < 10) {
      const allSuppliers = [...BASELINE_SUPPLIERS, ...generateExtraSuppliers()];
      for (const item of allSuppliers) {
        const existing = await Supplier.findOne({ supplierId: item.supplierId });
        if (!existing) {
          await Supplier.create(item);
        }
      }
      console.log(`[Supplier Seeder] Successfully seeded ${allSuppliers.length} suppliers.`);
    } else {
      for (const item of BASELINE_SUPPLIERS) {
        const existing = await Supplier.findOne({ supplierId: item.supplierId });
        if (!existing) {
          await Supplier.create(item);
        }
      }
      console.log(`[Supplier Seeder] Verified baseline suppliers in database.`);
    }
  } catch (error) {
    console.error("[Supplier Seeder] Error seeding suppliers:", error.message);
  }
};

module.exports = autoSeedSuppliers;
