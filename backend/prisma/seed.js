const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Ullur Mechanic Database...");

  // 1. Create Demo Customer
  const customer = await prisma.user.upsert({
    where: { phone: "+919876543210" },
    update: {},
    create: {
      phone: "+919876543210",
      name: "Murugan Swamy",
      email: "murugan@example.com",
      role: "CUSTOMER",
      isVerified: true,
      currentLat: 10.0104,
      currentLng: 77.4768, // Theni
      vehicles: {
        create: [
          {
            type: "CAR",
            make: "Hyundai",
            model: "i20 Asta",
            year: 2021,
            regNumber: "TN-60-AZ-1234",
            color: "Polar White",
          },
          {
            type: "BIKE",
            make: "Royal Enfield",
            model: "Classic 350",
            year: 2022,
            regNumber: "TN-60-BU-5678",
            color: "Stealth Black",
          },
        ],
      },
    },
  });
  console.log("✅ Customer created:", customer.name);

  // 2. Create Demo Mechanics
  const mechanic1User = await prisma.user.upsert({
    where: { phone: "+919842100001" },
    update: {},
    create: {
      phone: "+919842100001",
      name: "Selvam Auto Works",
      email: "selvam@ullur.in",
      role: "MECHANIC",
      isVerified: true,
      currentLat: 10.0125,
      currentLng: 77.4812,
    },
  });

  await prisma.mechanic.upsert({
    where: { userId: mechanic1User.id },
    update: {},
    create: {
      userId: mechanic1User.id,
      skills: ["Engine Overhaul", "Brake Repair", "Tire Puncture", "Clutch Repair"],
      vehicleTypes: ["CAR", "BIKE", "AUTO"],
      experience: 12,
      isOnline: true,
      isVerified: true,
      rating: 4.9,
      totalJobs: 148,
      currentLat: 10.0125,
      currentLng: 77.4812,
    },
  });

  const mechanic2User = await prisma.user.upsert({
    where: { phone: "+919842100002" },
    update: {},
    create: {
      phone: "+919842100002",
      name: "Karthik Bike Clinic",
      email: "karthik@ullur.in",
      role: "MECHANIC",
      isVerified: true,
      currentLat: 10.008,
      currentLng: 77.472,
    },
  });

  await prisma.mechanic.upsert({
    where: { userId: mechanic2User.id },
    update: {},
    create: {
      userId: mechanic2User.id,
      skills: ["Two Wheeler Specialist", "Battery Jumpstart", "Chain Sprocket", "Wiring"],
      vehicleTypes: ["BIKE"],
      experience: 7,
      isOnline: true,
      isVerified: true,
      rating: 4.8,
      totalJobs: 92,
      currentLat: 10.008,
      currentLng: 77.472,
    },
  });

  // 3. Create Demo Shop Owner & Spare Parts
  const shopOwner = await prisma.user.upsert({
    where: { phone: "+919842100003" },
    update: {},
    create: {
      phone: "+919842100003",
      name: "Raja Auto Spares",
      role: "SHOP_OWNER",
      isVerified: true,
    },
  });

  const shop = await prisma.shop.upsert({
    where: { userId: shopOwner.id },
    update: {},
    create: {
      userId: shopOwner.id,
      shopName: "Theni Wholesale Auto Spares",
      description: "Direct wholesale distributor of genuine OEM vehicle parts",
      address: "Bypass Road, Near Bus Stand, Theni, Tamil Nadu",
      lat: 10.015,
      lng: 77.479,
      rating: 4.9,
      isOpen: true,
      isVerified: true,
      gstNumber: "33AAAAA0000A1Z5",
    },
  });

  const sparePartsData = [
    {
      name: "Exide Mileage 35Ah Car Battery (36 Months Warranty)",
      category: "battery",
      brand: "Exide",
      price: 4200.0,
      wholesalePrice: 3450.0,
      vehicleTypes: ["CAR"],
      stock: 25,
      description: "Maintenance-free heavy duty car battery with instant power delivery.",
    },
    {
      name: "Motul 7100 4T 10W-50 Fully Synthetic Engine Oil (1L)",
      category: "oils",
      brand: "Motul",
      price: 880.0,
      wholesalePrice: 690.0,
      vehicleTypes: ["BIKE"],
      stock: 50,
      description: "100% Synthetic 4-Stroke motorcycle lubricant with ester technology.",
    },
    {
      name: "Bosch Front Brake Pads Set (Swift, i20, Baleno)",
      category: "brakes",
      brand: "Bosch",
      price: 1350.0,
      wholesalePrice: 950.0,
      vehicleTypes: ["CAR"],
      stock: 40,
      description: "High friction coefficient ceramic blend brake pads.",
    },
    {
      name: "MRF Zapper FX 100/80-17 Tubeless Rear Tire",
      category: "tires",
      brand: "MRF",
      price: 2450.0,
      wholesalePrice: 1950.0,
      vehicleTypes: ["BIKE"],
      stock: 18,
      description: "All-weather grip motorcycle tire with superior puncture resistance.",
    },
    {
      name: "Philips H4 Diamond Vision Headlight Bulb 12V 60/55W",
      category: "lighting",
      brand: "Philips",
      price: 550.0,
      wholesalePrice: 380.0,
      vehicleTypes: ["CAR", "BIKE"],
      stock: 60,
      description: "5000K crisp white beam for high night visibility on highways.",
    },
  ];

  for (const item of sparePartsData) {
    await prisma.sparePart.create({
      data: {
        shopId: shop.id,
        ...item,
      },
    });
  }

  // 4. Create Demo Tow Partner
  const towUser = await prisma.user.upsert({
    where: { phone: "+919842100004" },
    update: {},
    create: {
      phone: "+919842100004",
      name: "Tamil Nadu Highway Towing Services",
      role: "TOW_PARTNER",
      isVerified: true,
      currentLat: 10.02,
      currentLng: 77.49,
    },
  });

  await prisma.towPartner.upsert({
    where: { userId: towUser.id },
    update: {},
    create: {
      userId: towUser.id,
      vehicleType: "Hydraulic Flatbed Tow Truck",
      isOnline: true,
      isVerified: true,
      rating: 4.95,
      currentLat: 10.02,
      currentLng: 77.49,
    },
  });

  console.log("🎉 Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
