// ==========================================================================
// ULLUR MECHANIC — INTERACTIVE SUPER APP & MULTI-ROLE HYPERLOCAL PLATFORM
// Full Bilingual System, Dynamic Role Authentication, Responsive Top/Bottom Nav
// ==========================================================================
// Firebase Configuration Setup
/* eslint-disable no-undef */
/* global firebase */
const firebaseConfig = {
  apiKey: "AIzaSyAdAvhgZy29k_Cn_yFxLKVzOgPBNq2bis",
  authDomain: "ullur-mechanic.firebaseapp.com",
  projectId: "ullur-mechanic",
  storageBucket: "ullur-mechanic.firebasestorage.app",
  messagingSenderId: "325254482783",
  appId: "1:325254482783:web:1f08437dc410b3128004ea",
  measurementId: "G-GJKPY9VW57"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();

// Recaptcha Verifier Setup
window.onload = function () {
  window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
    'size': 'invisible',
    'callback': (response) => {
      // reCAPTCHA solved
    }
  });
};

let confirmationResultGlobal = null;

// Send Real SMS OTP Function
function sendOTP() {
  const phoneNumberInput = document.getElementById("phone-number").value.trim();

  if (phoneNumberInput.length < 10) {
    alert("Please enter a valid 10-digit mobile number!");
    return;
  }

  // Format phone number with country code (+91 for India)
  const formattedPhoneNumber = "+91" + phoneNumberInput.slice(-10);
  const appVerifier = window.recaptchaVerifier;

  auth.signInWithPhoneNumber(formattedPhoneNumber, appVerifier)
    .then((confirmationResult) => {
      window.confirmationResultGlobal = confirmationResult;
      alert(`Real SMS OTP sent to ${formattedPhoneNumber}! Check your mobile.`);

      // Display OTP input section
      document.getElementById("otp-section").style.display = "block";
    })
    .catch((error) => {
      console.error("SMS Error:", error);
      alert("Error sending SMS: " + error.message);
    });
}

// Verify SMS OTP Function
function verifyOTP() {
  const otpCode = document.getElementById("otp-input").value.trim();

  if (!otpCode || otpCode.length < 6) {
    alert("Please enter the 6-digit SMS OTP!");
    return;
  }

  if (window.confirmationResultGlobal) {
    window.confirmationResultGlobal.confirm(otpCode)
      .then((result) => {
        const user = result.user;
        alert("Phone Number Verified Successfully via Firebase!");
        loadUserDashboard();
      })
      .catch((error) => {
        alert("Invalid OTP Code! Please check your SMS.");
      });
  }
}

// Global Application State
let currentLang = localStorage.getItem('ullur_lang') || 'ta';
let currentUserRole = localStorage.getItem('ullur_role') || null; // 'customer' | 'mechanic' | 'shop' | 'towing' | 'admin' | null
let currentCustomerScreen = 'home';
let pendingAuthRole = 'customer';
let cartItems = [];
let isSirenActive = false;
let mechanicJobStage = 1; // 0: Assigned, 1: En Route, 2: Fixing, 3: Completed
let mechanicOnline = true;
let towDispatchAccepted = false;

// Sample Initial Inventory for Spare Parts Shop Owner
let shopInventory = [
  { id: 1, name: 'Exide Mileage 35Ah Battery', nameTa: 'எக்சைட் 35Ah ஹெவி பேட்டரி', price: 3450, retail: 4200, stock: 14, category: 'Battery' },
  { id: 2, name: 'Motul 7100 4T 10W-50 (1L)', nameTa: 'மோட்டுல் 7100 என்ஜின் ஆயில் (1L)', price: 690, retail: 880, stock: 28, category: 'Oil' },
  { id: 3, name: 'Bosch Front Brake Pads Set', nameTa: 'பாஷ் பிரேக் பேட்ஸ் செட் (Bosch)', price: 950, retail: 1350, stock: 8, category: 'Brakes' },
  { id: 4, name: 'MRF Zapper 100/80-17 Tire', nameTa: 'MRF ஜாப்பர் டியூப்லெஸ் டயர்', price: 1950, retail: 2450, stock: 4, category: 'Tire' },
  { id: 5, name: 'NGK Iridium Spark Plug', nameTa: 'NGK இரிடியம் ஸ்பார்க் பிளக்', price: 320, retail: 480, stock: 22, category: 'Electrical' },
];

// Sample Towing Fleet for Towing Partner
let towingFleet = [
  { id: 'TOW-01', type: 'Flatbed Hydraulic', reg: 'TN-60-T-9001', driver: 'Mani (மணி)', status: 'En Route', eta: '8 mins' },
  { id: 'TOW-02', type: 'Wheel-Lift Crane', reg: 'TN-60-T-9002', driver: 'Rajesh (ராஜேஷ்)', status: 'Available', eta: 'Ready' },
  { id: 'TOW-03', type: 'Heavy Commercial Rig', reg: 'TN-60-T-9003', driver: 'Kannan (கண்ணன்)', status: 'Available', eta: 'Ready' },
];

// ==========================================================================
// COMPLETE BILINGUAL DICTIONARIES (Tamil 🇮🇳 & English 🇬🇧)
// ==========================================================================

const STRINGS = {
  ta: {
    appTitle: 'ULLUR MECHANIC',
    appSubBadge: '⚡ 24/7 தமிழ்நாடு ஹைப்பர்-லோக்கல்',
    logoutBtn: 'வெளியேறு',
    gatewayBadge: '⚡ தமிழ்நாட்டின் #1 அவசர வாகன உதவி தளம்',
    gatewayTitle: 'உங்களின் பயன்பாட்டு வகையை தேர்வு செய்க',
    gatewaySub: 'உங்கள் பிரத்யேக போர்ட்டலை அணுக கீழே உள்ள வகையை தேர்வு செய்க',

    // 4 Role Card Titles & Subtitles
    roleCard1Title: '1. வாடிக்கையாளர் / User',
    roleCard1Desc: 'நெடுஞ்சாலை வாகன பழுது, பஞ்சர், பேட்டரி ஜம்ப், 30% மொத்த உதிரிபாகங்கள், டோயிங் & 24/7 காவலன் போலீஸ் SOS உதவி.',
    roleCard1Btn: 'உள்நுழைக (Customer Login)',

    roleCard2Title: '2. மெக்கானிக் பார்ட்னர் / Partner',
    roleCard2Desc: 'டியூட்டி ஆன்/ஆஃப் சுவிட்ச், Google Maps வழிசெலுத்தல், நேரலை பழுது கோரிக்கைகள் & தினசரி வருமான கணக்கு (₹2,450+).',
    roleCard2Btn: 'பார்ட்னர் உள்நுழைவு (Mechanic)',

    roleCard3Title: '3. உதிரிபாக விற்பனையாளர் / Shop Owner',
    roleCard3Desc: 'மொத்த உதிரிபாகங்கள் விற்பனை, நேரலை வாடிக்கையாளர் ஆர்டர்கள், இருப்பு மேலாண்மை & உடனடி டெலிவரி டிஸ்பாட்ச்.',
    roleCard3Btn: 'கடை உள்நுழைவு (Shop Login)',

    roleCard4Title: '4. மீட்பு & டோயிங் சேவை / Towing Partner',
    roleCard4Desc: 'ஹைட்ராலிக் பிளாட்பெட் லாரிகள் & டோயிங் வாகனங்கள் மேலாண்மை, நெடுஞ்சாலை விபத்து மீட்பு கோரிக்கைகள்.',
    roleCard4Btn: 'டோயிங் உள்நுழைவு (Towing Login)',

    // Header Desktop Nav
    navHome: 'முகப்பு',
    navParts: 'உதிரிபாகங்கள்',
    navTow: 'டோயிங்',
    navSos: 'காவலன் SOS',
    navProfile: 'சுயவிவரம்',
    navDutyToggle: 'டியூட்டி நிலை',
    navEarnings: 'வருமானம்',
    navInventory: 'இருப்பு விவரம்',
    navOrders: 'ஆர்டர்கள்',
    navFleet: 'டோயிங் வாகனங்கள்',
    navDispatches: 'மீட்பு கோரிக்கைகள்',
    navRadar: 'நெடுஞ்சாலை ரேடார்',
    navIncidents: 'காவலன் சம்பவங்கள்',

    // Customer App Texts
    locTitle: 'தற்போதைய இடம்',
    locSub: 'தேனி பைபாஸ், தமிழ்நாடு',
    sosBannerTitle: '🚨 காவலன் அவசர போலீஸ் உதவி (112 SOS)',
    sosBannerSub: 'ஓட்டுநர் தகாத நடத்தை / ஆபத்து ஏற்பட்டால் உடனே அழுத்தவும்!',
    sosFixBtn: 'SOS உதவி',
    actBreakdown: 'வாகன\nபழுது நீக்கம்',
    actSpares: 'மொத்த\nஉதிரிபாகங்கள்',
    actTow: 'வாகனம்\nடோயிங் / இழுத்தல்',
    nearbyMechs: 'அருகிலுள்ள மெக்கானிக்குகள்',
    liveRadar: 'நேரலை ரேடார்',
    reqMechBtn: 'மெக்கானிக்கை அழை ➔',
    onTheWay: 'மெக்கானிக் உங்கள் இடத்தை நோக்கி வருகிறார்',
    stepAssigned: 'ஒதுக்கப்பட்டது',
    stepEnRoute: 'வருகிறார்',
    stepArrived: 'வந்துவிட்டார்',
    stepFixing: 'பழுதுபார்க்கிறார்',
    stepDone: 'முடிந்தது',
    completePayBtn: '💳 RAZORPAY மூலம் ₹350 செலுத்து',
    wholesaleBanner: 'நேரடி தொழிற்சாலை விலை — 30% வரை சேமிப்பு!',
    addToCart: 'கூடையில் சேர்',
    viewCart: 'கூடை காண்க',
    cartCheckout: 'ஆர்டர் செய் (Razorpay)',
    sosTitle: '🚨 காவலன் அவசர உதவி (POLICE SOS)',
    sosSubtitle: 'ஓட்டுநர் தகாத முறையில் நடந்தாலோ அல்லது ஆபத்து நேர்ந்தாலோ உடனே அழுத்தவும்!',
    sosPress: 'காவல்துறைக்கு அவசர தகவல் அனுப்பு',
    policeDispatched: 'உங்கள் நேரலை ஜி.பி.எஸ் இடம் தேனி நகர் காவல் நிலையத்திற்கும் (112) மற்றும் உங்கள் குடும்பத்தினருக்கும் அவசரமாக அனுப்பப்பட்டது!',
    sirenBtn: '🔊 அலார ஒலி எழுப்பு (Siren)',
    reportMisbehavior: 'மெக்கானிக் தகாத நடத்தை மீது புகார் அளி',

    // Guides
    guideTitle: 'நேரலை சோதனை வழிகாட்டி',
    guideIntro: 'இந்த திரையில் நீங்கள் நேரடியாக அனைத்து அம்சங்களையும் தொட்டு இயக்கலாம்:',
    guideStep1Title: '1. பழுது நீக்க கோரிக்கை:',
    guideStep1Desc: "'வாகன பழுது நீக்கம்' பட்டனை தொட்டு Tire Puncture தேர்வு செய்து மெக்கானிக்கை அழைக்கவும்.",
    guideStep2Title: '2. நேரலை வருகை & Razorpay:',
    guideStep2Desc: 'மெக்கானிக் வரும் வழியை பார்த்துவிட்டு Razorpay (GPay/UPI/Card) மூலம் ₹350 செலுத்தவும்.',
    guideStep3Title: '3. 🚨 காவலன் போலீஸ் SOS:',
    guideStep3Desc: 'மெக்கானிக் தகாத முறையில் நடந்தால் உடனே 112 போலீஸ் நிலையத்திற்கு நேரலை GPS அனுப்பவும்.',
    guideStep4Title: '4. மொத்த உதிரிபாகங்கள் அங்காடி:',
    guideStep4Desc: '30% நேரடி தொழிற்சாலை தள்ளுபடியில் உதிரிபாகங்களை கூடையில் சேர்த்து ஆர்டர் செய்யவும்.',
    guideBtnHome: 'முகப்பு திரை',
    guideBtnSos: '112 SOS சோதனை',
    guideBtnParts: 'உதிரிபாகங்கள் கூடை',

    // Mechanic Texts
    mechDutyTitle: 'மெக்கானிக் பார்ட்னர் செயலி',
    mechDutyIntro: 'செல்வம் ஆட்டோ ஒர்க்ஸ் மெக்கானிக் அம்சங்கள்:',
    mechStep1: 'ஆன்லைன்/ஆஃப்லைன் ஸ்விட்ச்: டியூட்டி ஆன் செய்து அருகில் உள்ள பழுது கோரிக்கைகளை பெறலாம்.',
    mechStep2: 'Google Maps நேவிகேஷன்: பழுதான வாகனத்தின் இருப்பிடத்திற்கு நேரடி வழி பெறலாம்.',
    mechStep3: 'பணி நிலை மாற்றுதல்: Accepted ➔ En Route ➔ Fixing ➔ Completed என மாற்றி வாடிக்கையாளருக்கு தகவல் அனுப்பலாம்.',
    mechStep4: 'வருமான கணக்கு: இன்றைய வருமானம் & முடித்த வேலைகளை கண்காணிக்கலாம்.',
    mechTodayEarnings: "இன்றைய வருமானம் (Today's Earnings)",
    mechCompletedJobs: 'முடிந்த பணிகள்',
    mechActiveJob: '🔥 நேரலை பழுது பணி',
    mechCustomerLabel: 'வாடிக்கையாளர்:',
    mechVehicleLabel: 'வாகனம்:',
    mechLocLabel: 'இடம்:',

    // Shop Owner Texts
    shopTitle: 'தேனி ஸ்ரீ முருகன் ஆட்டோ ஸ்பேர்ஸ்',
    shopSub: 'சரிபார்க்கப்பட்ட மொத்த உதிரிபாக விற்பனையாளர் • Theni Spares Hub',
    shopTodayOrders: 'இன்றைய ஆர்டர்கள்',
    shopTodaySales: 'இன்றைய விற்பனை',
    shopLowStock: 'குறைந்த இருப்பு எச்சரிக்கை',
    shopActiveDispatches: 'நேரலை விநியோகம்',
    shopInventoryTitle: '📦 மொத்த உதிரிபாகங்கள் இருப்பு பட்டியல் (Wholesale Stock)',
    shopOrdersTitle: '🛒 நேரலை வாடிக்கையாளர் & மெக்கானிக் ஆர்டர்கள்',
    stockInStock: 'இருப்பில் உள்ளது',
    stockLow: 'குறைந்த இருப்பு',
    dispatchOrderBtn: 'டிஸ்பாட்ச் செய் ➔',

    // Towing Partner Texts
    towingTitle: 'தமிழ்நாடு ஹைவே டோயிங் & மீட்பு சேவை',
    towingSub: '24/7 நெடுஞ்சாலை அவசர விபத்து & பழுது மீட்பு படை',
    towActiveTrucks: 'செயலில் உள்ள லாரிகள்',
    towRecoveriesDone: 'இன்றைய மீட்புகள்',
    towEarnings: 'டோயிங் வருமானம்',
    towAvgEta: 'சராசரி வருகை நேரம்',
    fleetTitle: '🚚 மீட்பு வாகனங்கள் நிலை (Recovery Fleet Grid)',
    liveTowReqTitle: '🚨 நேரலை நெடுஞ்சாலை டோயிங் கோரிக்கை',
    acceptTowBtn: 'டோயிங் கோரிக்கையை ஏற்றுக்கொள் ➔',
    towEnRouteStatus: '🚚 டோயிங் லாரி பிக்கப் இடத்தை நோக்கி விரைகிறது!',

    // Admin Texts
    adminSosTitle: 'காவலன் அவசர எச்சரிக்கை',
    adminActiveJobs: 'நேரலை பழுது பணிகள்',
    adminOnlineMechs: 'ஆன்லைன் மெக்கானிக்குகள்',
    adminRazorpayVol: 'RAZORPAY VOLUME (INR)',
    adminRadarTitle: '🚨 தமிழ்நாடு காவல்துறை & நெடுஞ்சாலை அவசர ரேடார்',
    adminIncidentTitle: 'காவலன் அவசர சம்பவ பட்டியல் (Kavalan Log)',
    adminVictimLabel: 'பாதிக்கப்பட்டவர்:',
    adminLocLabel: 'இடம்:',
    adminIncidentLabel: 'சம்பவம்:',
    adminPoliceStationLabel: 'ஒதுக்கப்பட்ட காவல் நிலையம்:',
    adminMechStatusLabel: 'மெக்கானிக் நிலை:',
    adminSuspended: 'உடனடி இடைநீக்கம் (SUSPENDED)',
    adminCallPatrolBtn: 'ரோந்து வாகனத்தை அழை (Call Patrol)',
    adminMarkSafeBtn: 'பாதுகாப்பாக முடிந்தது (Mark Safe)',
    rzpPayableLabel: 'செலுத்த வேண்டிய தொகை:',
    rzpPayBtn: 'செலுத்து (PAY NOW)',
    dispatchTowBtn: 'டோயிங் வாகனத்தை அனுப்பு ➔',
    selectTowType: 'டோயிங் லாரி வகையை தேர்வு செய்க:',
    myVehiclesTitle: 'எனது வாகனங்கள் (Registered Vehicles)',
    activePill: 'செயலில்',
  },
  en: {
    appTitle: 'ULLUR MECHANIC',
    appSubBadge: '⚡ 24/7 TAMIL NADU HYPERLOCAL',
    logoutBtn: 'Logout',
    gatewayBadge: "⚡ TAMIL NADU'S #1 EMERGENCY BREAKDOWN PLATFORM",
    gatewayTitle: 'Select Your Access Portal',
    gatewaySub: 'Choose your specific role below to enter your dedicated dashboard',

    // 4 Role Card Titles & Subtitles
    roleCard1Title: '1. Customer / User View',
    roleCard1Desc: 'Highway breakdown assistance, puncture repair, battery jumpstart, 30% off wholesale spares, towing & 24/7 Kavalan Police SOS.',
    roleCard1Btn: 'Enter Customer App ➔',

    roleCard2Title: '2. Mechanic Partner View',
    roleCard2Desc: 'Online/Offline duty toggle, turn-by-turn Google Maps navigation, active breakdown dispatch alerts & daily wallet earnings (₹2,450+).',
    roleCard2Btn: 'Mechanic Partner Login ➔',

    roleCard3Title: '3. Spare Parts Shop Owner View',
    roleCard3Desc: 'Wholesale inventory management, real-time incoming orders, catalog pricing & instant mechanic pickup dispatches.',
    roleCard3Btn: 'Shop Owner Login ➔',

    roleCard4Title: '4. Backup Travel / Towing Partner View',
    roleCard4Desc: 'Hydraulic flatbed & wheel-lift recovery fleet management, highway breakdown tow requests & toll road emergency routing.',
    roleCard4Btn: 'Towing Fleet Login ➔',

    // Header Desktop Nav
    navHome: 'Home',
    navParts: 'Spares',
    navTow: 'Towing',
    navSos: 'Police SOS',
    navProfile: 'Profile',
    navDutyToggle: 'Duty Status',
    navEarnings: 'Earnings',
    navInventory: 'Inventory',
    navOrders: 'Live Orders',
    navFleet: 'Tow Fleet',
    navDispatches: 'Dispatches',
    navRadar: 'Highway Radar',
    navIncidents: 'Kavalan Log',

    // Customer App Texts
    locTitle: 'CURRENT LOCATION',
    locSub: 'Theni Highway Bypass, TN',
    sosBannerTitle: '🚨 KAVALAN POLICE SOS (112 ALERT)',
    sosBannerSub: 'Instant police dispatch in case of harassment or danger!',
    sosFixBtn: 'SOS HELP',
    actBreakdown: 'Breakdown\nRepair',
    actSpares: 'Wholesale\nSpares',
    actTow: 'Vehicle\nTow/Pickup',
    nearbyMechs: 'NEARBY MECHANICS',
    liveRadar: 'LIVE RADAR',
    reqMechBtn: 'Request Mechanic ➔',
    onTheWay: 'MECHANIC IS ON THE WAY',
    stepAssigned: 'Assigned',
    stepEnRoute: 'En Route',
    stepArrived: 'Arrived',
    stepFixing: 'Fixing',
    stepDone: 'Done',
    completePayBtn: '💳 PAY ₹350 VIA RAZORPAY',
    wholesaleBanner: 'Direct Wholesale Pricing — Save up to 30%!',
    addToCart: 'Add to Cart',
    viewCart: 'View Cart',
    cartCheckout: 'Place Order (Razorpay)',
    sosTitle: '🚨 KAVALAN EMERGENCY POLICE SOS',
    sosSubtitle: 'Instant police alert on danger or mechanic misbehavior!',
    sosPress: 'SEND EMERGENCY SOS TO POLICE',
    policeDispatched: 'Live GPS coordinates transmitted to Theni Town Police Station (112) & Emergency Contacts!',
    sirenBtn: '🔊 Sound High-Decibel Siren',
    reportMisbehavior: 'Report Mechanic Misbehavior',

    // Guides
    guideTitle: 'Interactive Live Guide',
    guideIntro: 'You can directly touch and test all features on this screen:',
    guideStep1Title: '1. Breakdown Request:',
    guideStep1Desc: "Tap 'Breakdown Repair' to select Tire Puncture or Dead Battery and dispatch nearest mechanic.",
    guideStep2Title: '2. Live Radar & Razorpay:',
    guideStep2Desc: 'Track mechanic ETA on live radar and pay ₹350 seamlessly via Razorpay UPI / Cards.',
    guideStep3Title: '3. 🚨 Kavalan Police SOS:',
    guideStep3Desc: 'Instantly send live GPS to 112 Police Station in case of driver misbehavior or danger.',
    guideStep4Title: '4. Wholesale Spares Store:',
    guideStep4Desc: 'Order batteries and engine oils directly at 30% factory wholesale discounts.',
    guideBtnHome: 'Home Screen',
    guideBtnSos: 'Test 112 SOS',
    guideBtnParts: 'Test Spares Cart',

    // Mechanic Texts
    mechDutyTitle: 'Mechanic Partner Console',
    mechDutyIntro: 'Selvam Auto Works Partner features:',
    mechStep1: 'Online/Offline Duty Toggle: Go online to receive nearby breakdown alerts.',
    mechStep2: 'Google Maps Navigation: Turn-by-turn routing to customer breakdown location.',
    mechStep3: 'Job Stage Progression: Update stages (Accepted ➔ En Route ➔ Fixing ➔ Completed) in real-time.',
    mechStep4: "Earnings Wallet: Track today's revenue and completed service jobs.",
    mechTodayEarnings: "Today's Earnings",
    mechCompletedJobs: 'Jobs Completed',
    mechActiveJob: '🔥 ACTIVE BREAKDOWN JOB',
    mechCustomerLabel: 'Customer:',
    mechVehicleLabel: 'Vehicle:',
    mechLocLabel: 'Location:',

    // Shop Owner Texts
    shopTitle: 'Sri Murugan Auto Spares, Theni',
    shopSub: 'Verified Wholesale Parts Merchant • Theni Spares Hub',
    shopTodayOrders: "Today's Orders",
    shopTodaySales: "Today's Sales Revenue",
    shopLowStock: 'Low Stock Alerts',
    shopActiveDispatches: 'Active Dispatches',
    shopInventoryTitle: '📦 Wholesale Spares Inventory Catalog',
    shopOrdersTitle: '🛒 Real-Time Mechanic & Customer Orders',
    stockInStock: 'In Stock',
    stockLow: 'Low Stock',
    dispatchOrderBtn: 'Dispatch Now ➔',

    // Towing Partner Texts
    towingTitle: 'Tamil Nadu Highway Towing & Recovery Fleet',
    towingSub: '24/7 Emergency Highway Accident & Breakdown Rescue Fleet',
    towActiveTrucks: 'Active Tow Trucks',
    towRecoveriesDone: "Today's Recoveries",
    towEarnings: 'Recovery Revenue',
    towAvgEta: 'Average Response Time',
    fleetTitle: '🚚 Recovery Fleet Status Grid',
    liveTowReqTitle: '🚨 Live Highway Breakdown Tow Request',
    acceptTowBtn: 'Accept Tow Dispatch ➔',
    towEnRouteStatus: '🚚 Tow truck is rushing to breakdown pickup location!',

    // Admin Texts
    adminSosTitle: 'KAVALAN SOS ALERTS',
    adminActiveJobs: 'ACTIVE BREAKDOWNS',
    adminOnlineMechs: 'ONLINE MECHANICS',
    adminRazorpayVol: 'RAZORPAY VOLUME (INR)',
    adminRadarTitle: '🚨 TN Police & Highway Emergency Radar Grid',
    adminIncidentTitle: 'Kavalan Emergency Incident Log',
    adminVictimLabel: 'Victim / Customer:',
    adminLocLabel: 'Location:',
    adminIncidentLabel: 'Incident Category:',
    adminPoliceStationLabel: 'Assigned Police Station:',
    adminMechStatusLabel: 'Mechanic Status:',
    adminSuspended: 'INSTANTLY SUSPENDED',
    adminCallPatrolBtn: 'Call Patrol Officer (112)',
    adminMarkSafeBtn: 'Mark Safe & Resolved',
    rzpPayableLabel: 'Amount Payable:',
    rzpPayBtn: 'PAY NOW (Razorpay)',
    dispatchTowBtn: 'DISPATCH TOW VEHICLE ➔',
    selectTowType: 'Select Tow Truck Type:',
    myVehiclesTitle: 'My Registered Vehicles',
    activePill: 'Active',
  },
};

function t(key) {
  return STRINGS[currentLang][key] || key;
}

// ==========================================================================
// AUTHENTICATION & ROLE MANAGEMENT
// ==========================================================================

function initiateRoleAuth(role) {
  pendingAuthRole = role;
  const modal = document.getElementById('auth-modal');
  const title = document.getElementById('auth-modal-role-title');
  const sub = document.getElementById('auth-modal-role-sub');
  const perks = document.getElementById('auth-perks-text');

  if (role === 'customer') {
    title.innerText = currentLang === 'ta' ? '🧑 வாடிக்கையாளர் உள்நுழைவு' : '🧑 Customer / User Login';
    sub.innerText = 'Fast OTP Verification for Emergency Assistance';
    perks.innerText = currentLang === 'ta' ? 'உடனடி ஜி.பி.எஸ் லாக் & 6 நிமிட மெக்கானிக் ரேடார் அணுகல்.' : 'Instant GPS Lock & 6-min mechanic dispatch activated.';
  } else if (role === 'mechanic') {
    title.innerText = currentLang === 'ta' ? '🔧 மெக்கானிக் பார்ட்னர் உள்நுழைவு' : '🔧 Mechanic Partner Login';
    sub.innerText = 'Verified Partner ID: TN-MEC-8842';
    perks.innerText = currentLang === 'ta' ? 'டியூட்டி நிலை, நேரலை வரைபடம் & நேரடி தினசரி பேமெண்ட்.' : 'Duty toggle, Google Maps navigation & daily wallet payout.';
  } else if (role === 'shop') {
    title.innerText = currentLang === 'ta' ? '🏪 உதிரிபாக விற்பனையாளர் உள்நுழைவு' : '🏪 Spare Parts Merchant Login';
    sub.innerText = 'Verified Merchant Hub: Theni Spares #104';
    perks.innerText = currentLang === 'ta' ? 'மொத்த விலை நிர்ணயம் & வாடிக்கையாளர் ஆர்டர்கள் அணுகல்.' : 'Wholesale catalog, stock management & dispatch streaming.';
  } else if (role === 'towing') {
    title.innerText = currentLang === 'ta' ? '🚚 டோயிங் & மீட்பு பார்ட்னர் உள்நுழைவு' : '🚚 Towing Fleet Partner Login';
    sub.innerText = 'NH-85 Highway Recovery Fleet Unit';
    perks.innerText = currentLang === 'ta' ? 'பிளாட்பெட் லாரிகள் & அவசர விபத்து மீட்பு கோரிக்கைகள்.' : 'Flatbed truck fleet management & toll recovery routes.';
  }

  modal.classList.add('active');
  if (window.lucide) lucide.createIcons();
}

function closeAuthModal() {
  document.getElementById('auth-modal').classList.remove('active');
}

f// Firebase Configuration Setup
const firebaseConfig = {
  apiKey: "AIzaSyAdAvhgZy29k_Cn_yFxLKVzOgPBNq2bis",
  authDomain: "ullur-mechanic.firebaseapp.com",
  projectId: "ullur-mechanic",
  storageBucket: "ullur-mechanic.firebasestorage.app",
  messagingSenderId: "325254482783",
  appId: "1:325254482783:web:1f08437dc410b3128004ea",
  measurementId: "G-GJKPY9VW57"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();

// Recaptcha Verifier Setup
window.onload = function () {
  window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
    'size': 'invisible',
    'callback': (response) => {
      // reCAPTCHA solved
    }
  });
};

let confirmationResultGlobal = null;

// Send Real SMS OTP Function
function sendOTP() {
  const phoneNumberInput = document.getElementById("phone-number").value.trim();

  if (phoneNumberInput.length < 10) {
    alert("Please enter a valid 10-digit mobile number!");
    return;
  }

  // Format phone number with country code (+91 for India)
  const formattedPhoneNumber = "+91" + phoneNumberInput.slice(-10);
  const appVerifier = window.recaptchaVerifier;

  auth.signInWithPhoneNumber(formattedPhoneNumber, appVerifier)
    .then((confirmationResult) => {
      window.confirmationResultGlobal = confirmationResult;
      alert(`Real SMS OTP sent to ${formattedPhoneNumber}! Check your mobile.`);

      // Display OTP input section
      document.getElementById("otp-section").style.display = "block";
    })
    .catch((error) => {
      console.error("SMS Error:", error);
      alert("Error sending SMS: " + error.message);
    });
}

// Verify SMS OTP Function
function verifyOTP() {
  const otpCode = document.getElementById("otp-input").value.trim();

  if (!otpCode || otpCode.length < 6) {
    alert("Please enter the 6-digit SMS OTP!");
    return;
  }

  if (window.confirmationResultGlobal) {
    window.confirmationResultGlobal.confirm(otpCode)
      .then((result) => {
        const user = result.user;
        alert("Phone Number Verified Successfully via Firebase!");
        loadUserDashboard();
      })
      .catch((error) => {
        alert("Invalid OTP Code! Please check your SMS.");
      });
  }
}
function submitRoleAuth() {
  const otpCode = Array.from(document.querySelectorAll('.otp-digit')).map(d => d.value).join('');

  if (otpCode.length < 6) {
    alert("Please enter full 6-digit SMS OTP!");
    return;
  }

  if (window.confirmationResultGlobal) {
    window.confirmationResultGlobal.confirm(otpCode)
      .then((result) => {
        alert("Phone Number Verified Successfully via Firebase!");
        closeAuthModal();
        currentUserRole = pendingAuthRole;
        localStorage.setItem('ullur_role', currentUserRole);
        switchAppMode(currentUserRole);
      })
      .catch((error) => {
        alert("Invalid OTP Code! Please check your mobile SMS.");
      });
  } else {
    // Fallback for UI role testing if Firebase trigger fails
    closeAuthModal();
    currentUserRole = pendingAuthRole;
    localStorage.setItem('ullur_role', currentUserRole);
    switchAppMode(currentUserRole);
  }
}
function submitRoleAuth() {
  closeAuthModal();
  currentUserRole = pendingAuthRole;
  localStorage.setItem('ullur_role', currentUserRole);

  // Switch to the authenticated mode
  switchAppMode(currentUserRole);
}

function logoutUser() {
  currentUserRole = null;
  localStorage.removeItem('ullur_role');
  switchAppMode('gateway');
}

function navigateToRoleGateway() {
  if (currentUserRole) {
    switchAppMode(currentUserRole);
  } else {
    switchAppMode('gateway');
  }
}

// Admin Secret Authentication
function openAdminLoginModal(e) {
  if (e) e.preventDefault();
  document.getElementById('admin-login-modal').classList.add('active');
  if (window.lucide) lucide.createIcons();
}

function closeAdminLoginModal() {
  document.getElementById('admin-login-modal').classList.remove('active');
}

function autofillAdminDemo() {
  document.getElementById('admin-email-input').value = 'admin@ullur.in';
  document.getElementById('admin-pass-input').value = 'KAVALAN-112';
}

function verifyAdminLogin() {
  const email = document.getElementById('admin-email-input').value;
  const pass = document.getElementById('admin-pass-input').value;

  if (email.includes('admin') || pass === 'KAVALAN-112' || pass === 'ullur2026') {
    closeAdminLoginModal();
    currentUserRole = 'admin';
    localStorage.setItem('ullur_role', 'admin');
    switchAppMode('admin');
  } else {
    alert('❌ Invalid Staff Credentials. Access Denied!');
  }
}

// ==========================================================================
// APP MODE & DESKTOP NAVIGATION SYSTEM
// ==========================================================================

function switchAppMode(mode) {
  // Hide all mode views
  document.querySelectorAll('.app-mode-view').forEach((view) => view.classList.remove('active'));

  const sessionChip = document.getElementById('user-session-chip');
  const sessionRoleLabel = document.getElementById('session-role-label');

  if (mode === 'gateway' || !mode) {
    document.getElementById('role-gateway-view').classList.add('active');
    if (sessionChip) sessionChip.style.display = 'none';
    renderDesktopHeaderNav(null);
  } else if (mode === 'customer') {
    document.getElementById('customer-mode').classList.add('active');
    if (sessionChip) {
      sessionChip.style.display = 'flex';
      sessionRoleLabel.innerText = currentLang === 'ta' ? '🧑 வாடிக்கையாளர்' : 'Customer View';
    }
    customerNavigate(currentCustomerScreen);
    renderCustomerGuidePanel();
    renderDesktopHeaderNav('customer');
  } else if (mode === 'mechanic') {
    document.getElementById('mechanic-mode').classList.add('active');
    if (sessionChip) {
      sessionChip.style.display = 'flex';
      sessionRoleLabel.innerText = currentLang === 'ta' ? '🔧 மெக்கானிக் பார்ட்னர்' : 'Mechanic Partner';
    }
    renderMechanicScreen();
    renderMechanicGuidePanel();
    renderDesktopHeaderNav('mechanic');
  } else if (mode === 'shop') {
    document.getElementById('shop-mode').classList.add('active');
    if (sessionChip) {
      sessionChip.style.display = 'flex';
      sessionRoleLabel.innerText = currentLang === 'ta' ? '🏪 உதிரிபாக விற்பனையாளர்' : 'Spares Merchant';
    }
    renderShopOwnerScreen();
    renderDesktopHeaderNav('shop');
  } else if (mode === 'towing') {
    document.getElementById('towing-mode').classList.add('active');
    if (sessionChip) {
      sessionChip.style.display = 'flex';
      sessionRoleLabel.innerText = currentLang === 'ta' ? '🚚 டோயிங் பார்ட்னர்' : 'Towing Fleet';
    }
    renderTowingPartnerScreen();
    renderDesktopHeaderNav('towing');
  } else if (mode === 'admin') {
    document.getElementById('admin-mode').classList.add('active');
    if (sessionChip) {
      sessionChip.style.display = 'flex';
      sessionRoleLabel.innerText = '🚨 Police & Super Admin';
    }
    renderAdminPanel();
    renderDesktopHeaderNav('admin');
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (window.lucide) lucide.createIcons();
}

// Render Horizontal Desktop Header Navigation Bar (>= 768px)
function renderDesktopHeaderNav(role) {
  const container = document.getElementById('desktop-header-nav');
  if (!container) return;

  if (!role || role === 'gateway') {
    container.innerHTML = `
      <button class="d-nav-btn active" onclick="switchAppMode('gateway')">
        <i data-lucide="compass"></i> <span>${currentLang === 'ta' ? 'போர்ட்டல் தேர்வகம்' : 'Role Gateway'}</span>
      </button>
    `;
  } else if (role === 'customer') {
    container.innerHTML = `
      <button class="d-nav-btn ${currentCustomerScreen === 'home' ? 'active' : ''}" id="dnav-home" onclick="customerNavigate('home')">
        <i data-lucide="home"></i> <span>${t('navHome')}</span>
      </button>
      <button class="d-nav-btn ${currentCustomerScreen === 'parts' ? 'active' : ''}" id="dnav-parts" onclick="customerNavigate('parts')">
        <i data-lucide="shopping-bag"></i> <span>${t('navParts')}</span>
      </button>
      <button class="d-nav-btn ${currentCustomerScreen === 'tow' ? 'active' : ''}" id="dnav-tow" onclick="customerNavigate('tow')">
        <i data-lucide="truck"></i> <span>${t('navTow')}</span>
      </button>
      <button class="d-nav-btn ${currentCustomerScreen === 'profile' ? 'active' : ''}" id="dnav-profile" onclick="customerNavigate('profile')">
        <i data-lucide="user"></i> <span>${t('navProfile')}</span>
      </button>
      <button class="d-nav-btn sos-btn ${currentCustomerScreen === 'sos' ? 'active' : ''}" id="dnav-sos" onclick="customerNavigate('sos')">
        <i data-lucide="shield-alert"></i> <span>${t('navSos')}</span>
      </button>
    `;
  } else if (role === 'mechanic') {
    container.innerHTML = `
      <button class="d-nav-btn active" onclick="renderMechanicScreen()">
        <i data-lucide="wrench"></i> <span>${t('mechDutyTitle')}</span>
      </button>
      <button class="d-nav-btn" onclick="toggleMechanicDuty()">
        <i data-lucide="power"></i> <span>${mechanicOnline ? '● Online Duty' : '○ Offline'}</span>
      </button>
      <button class="d-nav-btn" onclick="customerNavigate('sos')">
        <i data-lucide="shield-alert"></i> <span>112 SOS</span>
      </button>
    `;
  } else if (role === 'shop') {
    container.innerHTML = `
      <button class="d-nav-btn active" onclick="renderShopOwnerScreen()">
        <i data-lucide="store"></i> <span>${t('shopInventoryTitle')}</span>
      </button>
      <button class="d-nav-btn" onclick="alert('Viewing Real-time buyer orders...')">
        <i data-lucide="shopping-cart"></i> <span>${t('shopOrdersTitle')}</span>
      </button>
    `;
  } else if (role === 'towing') {
    container.innerHTML = `
      <button class="d-nav-btn active" onclick="renderTowingPartnerScreen()">
        <i data-lucide="truck"></i> <span>${t('fleetTitle')}</span>
      </button>
      <button class="d-nav-btn" onclick="alert('Viewing Highway Rescue Radar...')">
        <i data-lucide="navigation"></i> <span>${t('liveTowReqTitle')}</span>
      </button>
    `;
  } else if (role === 'admin') {
    container.innerHTML = `
      <button class="d-nav-btn active" onclick="renderAdminPanel()">
        <i data-lucide="shield-alert"></i> <span>Kavalan 112 Super Desk</span>
      </button>
      <button class="d-nav-btn" onclick="logoutUser()">
        <i data-lucide="arrow-left"></i> <span>Exit Admin Desk</span>
      </button>
    `;
  }

  if (window.lucide) lucide.createIcons();
}

// ==========================================================================
// GLOBAL LANGUAGE SWITCHER
// ==========================================================================

function setAppLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('ullur_lang', lang);

  document.getElementById('lang-ta-btn').classList.toggle('active', lang === 'ta');
  document.getElementById('lang-en-btn').classList.toggle('active', lang === 'en');

  // Master Header
  document.getElementById('app-title-header').innerText = t('appTitle');
  document.getElementById('app-sub-badge').innerText = t('appSubBadge');
  const logoutTxt = document.getElementById('logout-btn-txt');
  if (logoutTxt) logoutTxt.innerText = t('logoutBtn');

  // Gateway Screen Elements
  const gBadge = document.getElementById('gateway-badge');
  if (gBadge) gBadge.innerText = t('gatewayBadge');
  const gTitle = document.getElementById('gateway-title');
  if (gTitle) gTitle.innerText = t('gatewayTitle');
  const gSub = document.getElementById('gateway-subtitle');
  if (gSub) gSub.innerText = t('gatewaySub');

  const rc1T = document.getElementById('role-card-1-title');
  if (rc1T) rc1T.innerText = t('roleCard1Title');
  const rc1D = document.getElementById('role-card-1-desc');
  if (rc1D) rc1D.innerText = t('roleCard1Desc');
  const rc1B = document.getElementById('role-card-1-btn');
  if (rc1B) rc1B.innerText = t('roleCard1Btn');

  const rc2T = document.getElementById('role-card-2-title');
  if (rc2T) rc2T.innerText = t('roleCard2Title');
  const rc2D = document.getElementById('role-card-2-desc');
  if (rc2D) rc2D.innerText = t('roleCard2Desc');
  const rc2B = document.getElementById('role-card-2-btn');
  if (rc2B) rc2B.innerText = t('roleCard2Btn');

  const rc3T = document.getElementById('role-card-3-title');
  if (rc3T) rc3T.innerText = t('roleCard3Title');
  const rc3D = document.getElementById('role-card-3-desc');
  if (rc3D) rc3D.innerText = t('roleCard3Desc');
  const rc3B = document.getElementById('role-card-3-btn');
  if (rc3B) rc3B.innerText = t('roleCard3Btn');

  const rc4T = document.getElementById('role-card-4-title');
  if (rc4T) rc4T.innerText = t('roleCard4Title');
  const rc4D = document.getElementById('role-card-4-desc');
  if (rc4D) rc4D.innerText = t('roleCard4Desc');
  const rc4B = document.getElementById('role-card-4-btn');
  if (rc4B) rc4B.innerText = t('roleCard4Btn');

  // Customer Screen Top Bar & Bottom Nav
  const cLocT = document.getElementById('c-loc-title');
  if (cLocT) cLocT.innerText = t('locTitle');
  const cLocS = document.getElementById('c-loc-sub');
  if (cLocS) cLocS.innerText = t('locSub');
  const cnavHome = document.getElementById('cnav-home-txt');
  if (cnavHome) cnavHome.innerText = t('navHome');
  const cnavParts = document.getElementById('cnav-parts-txt');
  if (cnavParts) cnavParts.innerText = t('navParts');
  const cnavTow = document.getElementById('cnav-tow-txt');
  if (cnavTow) cnavTow.innerText = t('navTow');
  const cnavSos = document.getElementById('cnav-sos-txt');
  if (cnavSos) cnavSos.innerText = t('navSos');

  // Re-render currently active view
  if (currentUserRole === 'customer') {
    customerNavigate(currentCustomerScreen);
    renderCustomerGuidePanel();
  } else if (currentUserRole === 'mechanic') {
    renderMechanicScreen();
    renderMechanicGuidePanel();
  } else if (currentUserRole === 'shop') {
    renderShopOwnerScreen();
  } else if (currentUserRole === 'towing') {
    renderTowingPartnerScreen();
  } else if (currentUserRole === 'admin') {
    renderAdminPanel();
  }

  renderDesktopHeaderNav(currentUserRole);
  if (window.lucide) lucide.createIcons();
}

// ==========================================================================
// 1. CUSTOMER APP NAVIGATION & SCREEN RENDERERS
// ==========================================================================

function customerNavigate(screen) {
  currentCustomerScreen = screen;
  const container = document.getElementById('customer-inner-content');
  if (!container) return;

  // Sync Mobile Bottom Navigation Active State
  document.querySelectorAll('.c-nav-item').forEach((item) => item.classList.remove('active'));
  const activeMobileNav = document.getElementById(`cnav-${screen}`);
  if (activeMobileNav) activeMobileNav.classList.add('active');

  // Sync Desktop Top Navigation Active State
  document.querySelectorAll('.d-nav-btn').forEach((btn) => btn.classList.remove('active'));
  const activeDesktopNav = document.getElementById(`dnav-${screen}`);
  if (activeDesktopNav) activeDesktopNav.classList.add('active');

  switch (screen) {
    case 'home':
      renderCustomerHome(container);
      break;
    case 'request':
      renderCustomerRequest(container);
      break;
    case 'tracking':
      renderCustomerTracking(container);
      break;
    case 'parts':
      renderCustomerParts(container);
      break;
    case 'cart':
      renderCustomerCart(container);
      break;
    case 'tow':
      renderCustomerTow(container);
      break;
    case 'sos':
      renderCustomerSos(container);
      break;
    case 'profile':
      renderCustomerProfile(container);
      break;
    default:
      renderCustomerHome(container);
  }

  if (window.lucide) lucide.createIcons();
}

// Customer Screen: Home
function renderCustomerHome(container) {
  container.innerHTML = `
    <!-- Kavalan Police SOS Banner -->
    <div class="b-card red" style="cursor: pointer;" onclick="customerNavigate('sos')">
      <div style="display: flex; align-items: center; gap: 10px;">
        <div style="background: white; color: #FF3B30; padding: 8px; border-radius: 8px; border: 2px solid #0D0D0D;">
          <i data-lucide="shield-alert" style="width: 24px; height: 24px;"></i>
        </div>
        <div style="flex: 1;">
          <strong style="font-size: 13px; display: block;">${t('sosBannerTitle')}</strong>
          <small style="font-size: 10.5px; font-weight: 700;">${t('sosBannerSub')}</small>
        </div>
        <button class="btn btn-yellow" style="padding: 4px 8px; font-size: 11px;">${t('sosFixBtn')}</button>
      </div>
    </div>

    <!-- 3 Quick Action Tiles -->
    <div class="quick-grid">
      <div class="quick-tile" style="background: #FFD600;" onclick="customerNavigate('request')">
        <i data-lucide="car-crash"></i>
        <span>${t('actBreakdown')}</span>
      </div>
      <div class="quick-tile" style="background: #CCFF90;" onclick="customerNavigate('parts')">
        <i data-lucide="package"></i>
        <span>${t('actSpares')}</span>
      </div>
      <div class="quick-tile" style="background: #B3E5FC;" onclick="customerNavigate('tow')">
        <i data-lucide="truck"></i>
        <span>${t('actTow')}</span>
      </div>
    </div>

    <!-- Nearby Mechanics Radar Header -->
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <strong style="font-size: 13px; font-weight: 900;">${t('nearbyMechs')} (3)</strong>
      <span class="pill green" style="display: flex; align-items: center; gap: 4px;">
        <span class="pulse-dot" style="width: 6px; height: 6px;"></span> ${t('liveRadar')}
      </span>
    </div>

    <!-- Mechanic Card 1 -->
    <div class="b-card">
      <div style="display: flex; gap: 10px; align-items: center;">
        <div style="width: 44px; height: 44px; background: #FFD600; border-radius: 50%; border: 2px solid #0D0D0D; display: flex; align-items: center; justify-content: center; font-weight: 900;">
          <i data-lucide="wrench"></i>
        </div>
        <div style="flex: 1;">
          <strong style="font-size: 14px;">${currentLang === 'ta' ? 'செல்வம் ஆட்டோ ஒர்க்ஸ்' : 'Selvam Auto Works'}</strong>
          <div style="font-size: 11px; font-weight: 700; color: #555;">⭐ 4.9 (148 jobs) • <span style="color: #00C851; font-weight: 900;">ONLINE</span></div>
        </div>
        <div style="text-align: right;">
          <strong style="font-size: 13px;">0.8 km</strong>
          <small style="display: block; font-size: 10px; color: #777;">~6 mins ETA</small>
        </div>
      </div>
      <div style="margin-top: 8px; display: flex; gap: 4px; flex-wrap: wrap;">
        <span class="pill yellow" style="font-size: 9px;">Engine Repair</span>
        <span class="pill yellow" style="font-size: 9px;">Puncture</span>
        <span class="pill yellow" style="font-size: 9px;">Battery Jump</span>
      </div>
      <button class="btn btn-yellow full-width" style="margin-top: 10px; font-size: 12px; padding: 8px;" onclick="customerNavigate('request')">
        <i data-lucide="send"></i> ${t('reqMechBtn')}
      </button>
    </div>

    <!-- Mechanic Card 2 -->
    <div class="b-card">
      <div style="display: flex; gap: 10px; align-items: center;">
        <div style="width: 44px; height: 44px; background: #CCFF90; border-radius: 50%; border: 2px solid #0D0D0D; display: flex; align-items: center; justify-content: center; font-weight: 900;">
          <i data-lucide="bike"></i>
        </div>
        <div style="flex: 1;">
          <strong style="font-size: 14px;">${currentLang === 'ta' ? 'கார்த்திக் பைக் கிளினிக்' : 'Karthik Bike Clinic'}</strong>
          <div style="font-size: 11px; font-weight: 700; color: #555;">⭐ 4.8 (94 jobs) • 2-Wheeler Specialist</div>
        </div>
        <div style="text-align: right;">
          <strong style="font-size: 13px;">1.4 km</strong>
          <small style="display: block; font-size: 10px; color: #777;">~11 mins</small>
        </div>
      </div>
      <button class="btn btn-yellow full-width" style="margin-top: 10px; font-size: 12px; padding: 8px;" onclick="customerNavigate('request')">
        <i data-lucide="send"></i> ${t('reqMechBtn')}
      </button>
    </div>
  `;
}

// Customer Screen: Breakdown Request
function renderCustomerRequest(container) {
  container.innerHTML = `
    <div class="b-card yellow">
      <div style="display: flex; align-items: center; gap: 8px;">
        <i data-lucide="map-pin"></i>
        <div style="flex: 1;">
          <small style="font-weight: 900; font-size: 10px;">${currentLang === 'ta' ? 'பழுது ஏற்பட்ட இடம் (GPS ஆட்டோ-லாக்)' : 'BREAKDOWN LOCATION (GPS AUTO-LOCK)'}</small>
          <strong style="font-size: 12px; display: block;">Near Theni Bypass Tollgate, Theni (10.0104, 77.4768)</strong>
        </div>
        <span class="pill black" style="background: #0D0D0D; color: #FFD600; font-size: 9px;">GPS LOCKED</span>
      </div>
    </div>

    <strong style="font-size: 13px;">${currentLang === 'ta' ? 'வாகன பிரச்சனையை தேர்வு செய்க:' : 'Select Breakdown Issue:'}</strong>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
      <button class="btn btn-yellow" style="font-size: 11px; padding: 8px;" onclick="selectIssue(this, 'Tire Puncture')">🛞 ${currentLang === 'ta' ? 'டயர் பஞ்சர் (Puncture)' : 'Tire Puncture'}</button>
      <button class="btn" style="font-size: 11px; padding: 8px; background: white;" onclick="selectIssue(this, 'Dead Battery')">🔋 ${currentLang === 'ta' ? 'பேட்டரி டவுன் (Battery)' : 'Dead Battery'}</button>
      <button class="btn" style="font-size: 11px; padding: 8px; background: white;" onclick="selectIssue(this, 'Engine Heat')">🔥 ${currentLang === 'ta' ? 'என்ஜின் புகை (Smoke)' : 'Engine Smoke'}</button>
      <button class="btn" style="font-size: 11px; padding: 8px; background: white;" onclick="selectIssue(this, 'Brake Fault')">🛑 ${currentLang === 'ta' ? 'பிரேக் ஃபெயிலியர் (Brakes)' : 'Brake Failure'}</button>
    </div>

    <div class="b-card">
      <strong style="font-size: 12px;">${currentLang === 'ta' ? 'வாகன விபரம் (Vehicle):' : 'Vehicle Details:'}</strong>
      <p style="font-size: 12px; font-weight: 700; margin-top: 2px;">Hyundai i20 Asta (TN-60-AZ-1234) • Polar White</p>
    </div>

    <div class="b-card green" style="display: flex; justify-content: space-between; align-items: center;">
      <div>
        <strong style="font-size: 12px;">${currentLang === 'ta' ? 'மதிப்பீடு கட்டணம் (Visit Fee):' : 'Estimated Inspection Fee:'}</strong>
        <small style="display: block; font-size: 10px; color: #333;">${currentLang === 'ta' ? 'பயணம் & ஆரம்ப பரிசோதனை அடங்கும்' : 'Includes travel & diagnosis'}</small>
      </div>
      <strong style="font-size: 20px; font-weight: 900;">₹350</strong>
    </div>

    <button class="btn btn-yellow full-width" style="padding: 14px; font-size: 14px;" onclick="customerNavigate('tracking')">
      <i data-lucide="zap"></i> ${currentLang === 'ta' ? 'மெக்கானிக்கை உடனே அனுப்பு ➔' : 'DISPATCH MECHANIC NOW ➔'}
    </button>
  `;
}

function selectIssue(btn, issue) {
  document.querySelectorAll('#customer-inner-content .btn').forEach((b) => (b.style.background = 'white'));
  btn.style.background = '#FFD600';
}

// Customer Screen: Live Tracking & Razorpay
function renderCustomerTracking(container) {
  const steps = [t('stepAssigned'), t('stepEnRoute'), t('stepArrived'), t('stepFixing'), t('stepDone')];

  container.innerHTML = `
    <!-- Top Step Progression -->
    <div class="b-card" style="padding: 10px;">
      <div style="display: flex; justify-content: space-between;">
        ${steps
      .map(
        (st, i) => `
            <div style="text-align: center;">
              <div style="width: 22px; height: 22px; border-radius: 50%; background: ${i <= 1 ? '#FFD600' : '#E0E0E0'}; border: 1.5px solid #0D0D0D; margin: 0 auto; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 900;">
                ${i <= 1 ? '✓' : i + 1}
              </div>
              <small style="font-size: 8px; font-weight: 900; margin-top: 2px; display: block;">${st}</small>
            </div>
          `
      )
      .join('')}
      </div>
    </div>

    <!-- Live Radar Map View Simulation -->
    <div style="height: 180px; background: #E2E8F0; border: 2.5px solid #0D0D0D; border-radius: 12px; position: relative; overflow: hidden; box-shadow: 2px 2px 0 #0D0D0D;">
      <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 120px; height: 120px; border-radius: 50%; border: 2px solid rgba(255, 214, 0, 0.8);"></div>
      <!-- User Pin -->
      <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 32px; height: 32px; background: #FF3B30; color: white; border-radius: 50%; border: 2px solid #0D0D0D; display: flex; align-items: center; justify-content: center;">
        <i data-lucide="car" style="width: 18px; height: 18px;"></i>
      </div>
      <!-- Mechanic Moving Pin -->
      <div style="position: absolute; top: 30%; left: 65%; width: 32px; height: 32px; background: #FFD600; color: #0D0D0D; border-radius: 50%; border: 2px solid #0D0D0D; display: flex; align-items: center; justify-content: center; animation: bounce 1s infinite alternate;">
        <i data-lucide="wrench" style="width: 18px; height: 18px;"></i>
      </div>
      <div style="position: absolute; bottom: 8px; left: 8px; background: #0D0D0D; color: white; padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: 900;">
        🛵 ${currentLang === 'ta' ? 'செல்வம் மெக்கானிக் (1.2 km தூரத்தில்)' : 'Selvam Mechanic (1.2 km away)'}
      </div>
    </div>

    <!-- Mechanic Profile Card with Emergency SOS Callout -->
    <div class="b-card">
      <div style="display: flex; align-items: center; gap: 10px;">
        <div style="width: 44px; height: 44px; background: #FFD600; border-radius: 50%; border: 2px solid #0D0D0D; display: flex; align-items: center; justify-content: center;">
          <i data-lucide="user"></i>
        </div>
        <div style="flex: 1;">
          <strong style="font-size: 14px;">${currentLang === 'ta' ? 'செல்வம் ஆட்டோ ஒர்க்ஸ்' : 'Selvam Auto Works'}</strong>
          <small style="display: block; font-size: 11px; color: #555;">⭐ 4.9 (148 jobs) • +91 98421 00001</small>
        </div>
        <button class="btn btn-red" style="padding: 6px 10px; font-size: 11px;" onclick="customerNavigate('sos')" title="Report Misbehavior">
          <i data-lucide="shield-alert"></i> SOS
        </button>
      </div>
      <div style="margin-top: 10px; display: flex; gap: 8px;">
        <button class="btn btn-yellow" style="flex: 1; font-size: 11px; padding: 8px;" onclick="alert('Calling Selvam: +91 98421 00001')">
          <i data-lucide="phone"></i> ${currentLang === 'ta' ? 'அழைப்பு' : 'Call'}
        </button>
        <button class="btn" style="flex: 1; font-size: 11px; padding: 8px; background: white;" onclick="alert('Opening secure in-app chat...')">
          <i data-lucide="message-square"></i> ${currentLang === 'ta' ? 'சாட்' : 'Chat'}
        </button>
      </div>
    </div>

    <!-- Complete & Razorpay Checkout Button -->
    <button class="btn btn-green full-width" style="padding: 12px; font-size: 13px;" onclick="openRazorpayModal(350)">
      <i data-lucide="credit-card"></i> ${t('completePayBtn')}
    </button>
  `;
}

// Customer Screen: Wholesale Spare Parts Marketplace
function renderCustomerParts(container) {
  container.innerHTML = `
    <div class="b-card" style="background: #0D0D0D; color: white; padding: 10px 14px;">
      <div style="display: flex; align-items: center; gap: 8px;">
        <i data-lucide="check-circle" style="color: #FFD600;"></i>
        <strong style="font-size: 11px;">${t('wholesaleBanner')}</strong>
      </div>
    </div>

    ${shopInventory
      .map(
        (p) => `
      <div class="b-card" style="padding: 12px;">
        <div style="display: flex; gap: 10px;">
          <div style="width: 50px; height: 50px; background: #F6F6F2; border-radius: 8px; border: 2px solid #0D0D0D; display: flex; align-items: center; justify-content: center;">
            <i data-lucide="package"></i>
          </div>
          <div style="flex: 1;">
            <strong style="font-size: 13px;">${currentLang === 'ta' ? p.nameTa : p.name}</strong>
            <small style="display: block; font-size: 10px; color: #666;">Stock: ${p.stock} units • Theni Spares Hub</small>
            <div style="margin-top: 6px; display: flex; align-items: center; gap: 6px;">
              <strong style="font-size: 15px; color: #00C851;">₹${p.price}</strong>
              <small style="text-decoration: line-through; color: #888;">₹${p.retail}</small>
              <span class="pill yellow" style="font-size: 9px;">${Math.round(((p.retail - p.price) / p.retail) * 100)}% OFF</span>
            </div>
          </div>
          <button class="btn btn-yellow" style="padding: 6px 8px; align-self: center;" onclick="addToCart('${currentLang === 'ta' ? p.nameTa : p.name}', ${p.price})">
            <i data-lucide="plus"></i>
          </button>
        </div>
      </div>
    `
      )
      .join('')}

    <button class="btn btn-black full-width" style="padding: 12px;" onclick="customerNavigate('cart')">
      <i data-lucide="shopping-cart"></i> ${t('viewCart')} (${cartItems.length})
    </button>
  `;
}

function addToCart(name, price) {
  cartItems.push({ name, price });
  alert(`✅ ${name} ${currentLang === 'ta' ? 'கூடையில் சேர்க்கப்பட்டது!' : 'added to Cart!'}`);
  customerNavigate('parts');
}

// Customer Screen: Cart & Razorpay Checkout
function renderCustomerCart(container) {
  const total = cartItems.reduce((acc, curr) => acc + curr.price, 0) || 3450;

  container.innerHTML = `
    <div class="b-card yellow">
      <strong style="font-size: 14px;">🛍️ ${currentLang === 'ta' ? 'எனது கூடை (Cart Items)' : 'My Cart Items'} (${cartItems.length || 1})</strong>
    </div>

    <div class="b-card">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <strong style="font-size: 13px;">${currentLang === 'ta' ? 'எக்சைட் 35Ah ஹெவி பேட்டரி' : 'Exide 35Ah Heavy Car Battery'}</strong>
          <small style="display: block; font-size: 10px; color: #666;">Qty: 1 • ${currentLang === 'ta' ? 'தேனி உதிரிபாகங்கள் ஹப்' : 'Theni Spares Hub'}</small>
        </div>
        <strong style="font-size: 14px; color: #00C851;">₹3,450</strong>
      </div>
    </div>

    <div class="b-card">
      <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
        <span>${currentLang === 'ta' ? 'சில்லறை விலை மொத்தம்:' : 'Retail Price Total:'}</span>
        <span>₹4,200</span>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 12px; color: #FF3B30; font-weight: 700; margin-bottom: 4px;">
        <span>${currentLang === 'ta' ? 'மொத்த விற்பனை தள்ளுபடி:' : 'Wholesale Discount:'}</span>
        <span>- ₹750</span>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 12px; color: #00C851; font-weight: 700; margin-bottom: 4px;">
        <span>${currentLang === 'ta' ? 'விரைவு டெலிவரி:' : 'Express Delivery:'}</span>
        <span>${currentLang === 'ta' ? 'இலவசம் (FREE)' : 'FREE'}</span>
      </div>
      <hr style="border: 1px solid #0D0D0D; margin: 8px 0;" />
      <div style="display: flex; justify-content: space-between; font-size: 15px; font-weight: 900;">
        <span>${currentLang === 'ta' ? 'செலுத்த வேண்டிய தொகை:' : 'To Pay:'}</span>
        <span>₹${total}</span>
      </div>
    </div>

    <button class="btn btn-green full-width" style="padding: 14px; font-size: 14px;" onclick="openRazorpayModal(${total})">
      <i data-lucide="lock"></i> ${t('cartCheckout')} (₹${total})
    </button>
  `;
}

// Customer Screen: Towing / Recovery
function renderCustomerTow(container) {
  container.innerHTML = `
    <div class="b-card">
      <div style="display: flex; align-items: center; gap: 8px;">
        <i data-lucide="map-pin" style="color: #FF3B30;"></i>
        <div>
          <small style="font-size: 9px; font-weight: 900;">${currentLang === 'ta' ? 'பிக்கப் இடம்' : 'PICKUP LOCATION'}</small>
          <strong style="font-size: 12px; display: block;">Theni Highway Junction, Theni</strong>
        </div>
      </div>
      <hr style="border: 1px dashed #0D0D0D; margin: 8px 0;" />
      <div style="display: flex; align-items: center; gap: 8px;">
        <i data-lucide="home" style="color: #00C851;"></i>
        <div>
          <small style="font-size: 9px; font-weight: 900;">${currentLang === 'ta' ? 'சென்றடையும் இடம் / கேரேஜ்' : 'DROP LOCATION / GARAGE'}</small>
          <strong style="font-size: 12px; display: block;">Madurai Road Auto Clinic (8.5 km)</strong>
        </div>
      </div>
    </div>

    <strong style="font-size: 13px;">${t('selectTowType')}</strong>
    <div class="b-card yellow" style="cursor: pointer;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <strong style="font-size: 13px;">${currentLang === 'ta' ? 'ஹைட்ராலிக் பிளாட்பெட் லாரி' : 'Flatbed Hydraulic Truck'}</strong>
          <small style="display: block; font-size: 10px; color: #444;">${currentLang === 'ta' ? 'கார்கள் & பிரீமியம் பைக்குகளுக்கு பாதுகாப்பானது' : 'Safe zero-ground touch for Cars & SUVs'}</small>
        </div>
        <strong style="font-size: 15px;">₹850</strong>
      </div>
    </div>

    <button class="btn btn-yellow full-width" style="padding: 14px; font-size: 14px;" onclick="alert('Tow vehicle dispatched via Tamil Nadu Highway Towing!')">
      <i data-lucide="truck"></i> ${t('dispatchTowBtn')}
    </button>
  `;
}

// Customer Screen: Kavalan Police SOS Alert
function renderCustomerSos(container) {
  container.innerHTML = `
    <div style="text-align: center;">
      <span class="badge red" style="font-size: 11px; padding: 4px 10px;">🚨 KAVALAN SAFETY 24/7</span>
      <h3 style="font-size: 16px; font-weight: 900; margin-top: 8px;">${t('sosTitle')}</h3>
      <p style="font-size: 11px; font-weight: 700; color: #444; margin-top: 4px;">${t('sosSubtitle')}</p>
    </div>

    <!-- Giant Pulsing Red SOS Button -->
    <div style="text-align: center; margin: 16px 0;">
      <button onclick="triggerKavalanSos()" style="width: 140px; height: 140px; border-radius: 50%; background: #FF3B30; color: white; border: 4px solid #0D0D0D; box-shadow: 4px 4px 0 #0D0D0D; cursor: pointer; display: inline-flex; flex-direction: column; align-items: center; justify-content: center; animation: bounce 1s infinite alternate;">
        <i data-lucide="shield-alert" style="width: 42px; height: 42px;"></i>
        <strong style="font-size: 20px; letter-spacing: 1px;">SOS</strong>
        <small style="font-size: 9px; font-weight: 900;">${currentLang === 'ta' ? 'அழுத்தவும்' : 'PRESS'}</small>
      </button>
    </div>

    <!-- Speed Dialers -->
    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px;">
      <button class="btn btn-yellow" style="font-size: 10px; padding: 8px 4px;" onclick="alert('Calling 112 Tamil Nadu Police Control Room!')">
        📞 112 Police
      </button>
      <button class="btn" style="font-size: 10px; padding: 8px 4px; background: #FF80AB; color: #0D0D0D;" onclick="alert('Calling 1091 Women Safety Helpline!')">
        👩 1091 Women
      </button>
      <button class="btn" style="font-size: 10px; padding: 8px 4px; background: #80D8FF; color: #0D0D0D;" onclick="alert('Calling 1033 Highway Patrol!')">
        🛣️ 1033 Highway
      </button>
    </div>

    <!-- Nearest Police Station Card -->
    <div class="b-card">
      <div style="display: flex; gap: 8px; align-items: center;">
        <i data-lucide="shield" style="color: #FF3B30;"></i>
        <div style="flex: 1;">
          <strong style="font-size: 12px;">${currentLang === 'ta' ? 'தேனி நகர் காவல் நிலையம் (1.4 km)' : 'Theni Town Police Station (1.4 km)'}</strong>
          <small style="display: block; font-size: 10px; color: #555;">04546-252222 • 112 Emergency Dispatch</small>
        </div>
        <span class="pill green" style="font-size: 9px;">Ready</span>
      </div>
    </div>

    <!-- Siren Button -->
    <button class="btn ${isSirenActive ? 'btn-red' : 'btn-black'} full-width" style="padding: 10px; font-size: 12px;" onclick="toggleSiren()">
      ${isSirenActive ? (currentLang === 'ta' ? '🔊 அலார ஒலி எழுப்பப்படுகிறது (SIREN ACTIVE)' : '🔊 SIREN ACTIVE (Alarm Sounding)') : t('sirenBtn')}
    </button>
  `;
}

function triggerKavalanSos() {
  alert(t('policeDispatched'));
}

function toggleSiren() {
  isSirenActive = !isSirenActive;
  customerNavigate('sos');
}

// Customer Screen: Profile
function renderCustomerProfile(container) {
  container.innerHTML = `
    <div class="b-card yellow">
      <div style="display: flex; gap: 10px; align-items: center;">
        <div style="width: 48px; height: 48px; background: #0D0D0D; color: #FFD600; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 900;">
          M
        </div>
        <div>
          <strong style="font-size: 15px;">${currentLang === 'ta' ? 'முருகன் சுவாமி' : 'Murugan Swamy'}</strong>
          <small style="display: block; font-size: 11px; font-weight: 700;">+91 98765 43210 • Theni, TN</small>
        </div>
      </div>
    </div>

    <strong style="font-size: 13px;">${t('myVehiclesTitle')}</strong>
    <div class="b-card">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <strong style="font-size: 13px;">🚗 Hyundai i20 Asta</strong>
          <small style="display: block; font-size: 11px; color: #FF3B30; font-weight: 900;">TN-60-AZ-1234</small>
        </div>
        <span class="pill green" style="font-size: 9px;">${t('activePill')}</span>
      </div>
    </div>

    <div class="b-card">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <strong style="font-size: 13px;">🏍️ Royal Enfield Classic 350</strong>
          <small style="display: block; font-size: 11px; color: #FF3B30; font-weight: 900;">TN-60-BU-5678</small>
        </div>
        <span class="pill green" style="font-size: 9px;">${t('activePill')}</span>
      </div>
    </div>
  `;
}

function renderCustomerGuidePanel() {
  const container = document.getElementById('guide-panel-container');
  if (!container) return;

  container.innerHTML = `
    <div class="guide-header">
      <h3><i data-lucide="sparkles"></i> ${t('guideTitle')}</h3>
      <span class="pill green">Live Ready</span>
    </div>
    <p class="guide-intro">${t('guideIntro')}</p>
    <ul class="guide-steps">
      <li><strong>${t('guideStep1Title')}</strong> <span>${t('guideStep1Desc')}</span></li>
      <li><strong>${t('guideStep2Title')}</strong> <span>${t('guideStep2Desc')}</span></li>
      <li><strong>${t('guideStep3Title')}</strong> <span>${t('guideStep3Desc')}</span></li>
      <li><strong>${t('guideStep4Title')}</strong> <span>${t('guideStep4Desc')}</span></li>
    </ul>
    <div class="guide-actions">
      <button class="btn btn-yellow" onclick="customerNavigate('home')"><i data-lucide="home"></i> ${t('guideBtnHome')}</button>
      <button class="btn btn-red" onclick="customerNavigate('sos')"><i data-lucide="shield-alert"></i> ${t('guideBtnSos')}</button>
      <button class="btn btn-black" onclick="customerNavigate('parts')"><i data-lucide="shopping-bag"></i> ${t('guideBtnParts')}</button>
    </div>
  `;
}

// ==========================================================================
// 2. MECHANIC PARTNER CONSOLE RENDERER
// ==========================================================================

function renderMechanicScreen() {
  const container = document.getElementById('mechanic-screen-viewport');
  if (!container) return;

  const stages = [t('stepAssigned'), t('stepEnRoute'), t('stepFixing'), t('stepDone')];

  container.innerHTML = `
    <!-- Mechanic Header -->
    <div style="padding: 16px 18px; background: #FFD600; border-bottom: 3px solid #0D0D0D; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <small style="font-size: 10px; font-weight: 900;">${currentLang === 'ta' ? 'மெக்கானிக் பார்ட்னர்' : 'MECHANIC PARTNER'}</small>
        <strong style="font-size: 14px; display: block;">${currentLang === 'ta' ? 'செல்வம் ஆட்டோ ஒர்க்ஸ்' : 'Selvam Auto Works'}</strong>
      </div>
      <button class="pill ${mechanicOnline ? 'green' : 'yellow'}" style="cursor: pointer;" onclick="toggleMechanicDuty()">
        ${mechanicOnline ? '● ONLINE' : '○ OFFLINE'}
      </button>
    </div>

    <div style="flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 14px;">
      <!-- Today's Earnings -->
      <div class="b-card" style="background: #0D0D0D; color: white;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <small style="color: #AAA; font-size: 10px; font-weight: 700;">${t('mechTodayEarnings')}</small>
            <h2 style="color: #FFD600; font-size: 24px; font-weight: 900;">₹2,450</h2>
          </div>
          <div style="text-align: right;">
            <small style="color: #AAA; font-size: 10px;">${t('mechCompletedJobs')}</small>
            <h3 style="font-size: 18px; font-weight: 900;">5 Jobs</h3>
          </div>
        </div>
      </div>

      <!-- Active Job Card -->
      <div class="b-card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span class="badge red">${t('mechActiveJob')}</span>
          <strong style="font-size: 14px; color: #00C851;">₹350 Fee</strong>
        </div>
        <strong style="font-size: 14px;">${t('mechCustomerLabel')} ${currentLang === 'ta' ? 'முருகன் சுவாமி' : 'Murugan Swamy'}</strong>
        <p style="font-size: 12px; font-weight: 700;">${t('mechVehicleLabel')} Hyundai i20 (TN-60-AZ-1234)</p>
        <p style="font-size: 11px; color: #555;">📍 ${t('mechLocLabel')} Theni Bypass Tollgate (1.2 km)</p>

        <!-- Stage progression -->
        <div style="display: flex; gap: 4px; margin-top: 10px;">
          ${stages
      .map(
        (st, i) => `
            <div style="flex: 1; text-align: center; padding: 6px 2px; border: 1.5px solid #0D0D0D; border-radius: 4px; font-size: 9.5px; font-weight: 900; background: ${i <= mechanicJobStage ? '#FFD600' : '#E0E0E0'
          };">
              ${st}
            </div>
          `
      )
      .join('')}
        </div>

        <div style="margin-top: 12px; display: flex; gap: 8px;">
          <button class="btn btn-yellow" style="flex: 1; font-size: 11px; padding: 8px;" onclick="alert('Opening Google Maps turn-by-turn navigation...')">
            <i data-lucide="navigation"></i> Google Maps
          </button>
          <button class="btn btn-green" style="flex: 1; font-size: 11px; padding: 8px;" onclick="advanceMechanicStage()">
            <i data-lucide="check-circle"></i> Next Stage
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderMechanicGuidePanel() {
  const container = document.getElementById('mechanic-guide-container');
  if (!container) return;

  container.innerHTML = `
    <div class="guide-header">
      <h3><i data-lucide="tool"></i> ${t('mechDutyTitle')}</h3>
      <span class="pill yellow">Duty Mode</span>
    </div>
    <p class="guide-intro">${t('mechDutyIntro')}</p>
    <ul class="guide-steps">
      <li><strong>${t('mechStep1')}</strong></li>
      <li><strong>${t('mechStep2')}</strong></li>
      <li><strong>${t('mechStep3')}</strong></li>
      <li><strong>${t('mechStep4')}</strong></li>
    </ul>
  `;
}

function toggleMechanicDuty() {
  mechanicOnline = !mechanicOnline;
  renderMechanicScreen();
  renderDesktopHeaderNav('mechanic');
}

function advanceMechanicStage() {
  mechanicJobStage = (mechanicJobStage + 1) % 4;
  renderMechanicScreen();
}

// ==========================================================================
// 3. SPARE PARTS SHOP OWNER VIEW RENDERER
// ==========================================================================

function renderShopOwnerScreen() {
  const container = document.getElementById('shop-panel-container');
  if (!container) return;

  container.innerHTML = `
    <!-- Shop Profile Header -->
    <div class="role-dashboard-header">
      <div class="role-profile-info">
        <div class="role-avatar-circle shop">🏪</div>
        <div>
          <h2 style="font-size: 18px; font-weight: 900;">${t('shopTitle')}</h2>
          <span style="font-size: 11.5px; font-weight: 700; color: #4B5563;">${t('shopSub')}</span>
        </div>
      </div>
      <div style="display: flex; gap: 8px;">
        <button class="btn btn-yellow" onclick="addNewInventoryItem()"><i data-lucide="plus-circle"></i> Add Spare Part</button>
      </div>
    </div>

    <!-- Shop KPI Stats -->
    <div class="admin-top-stats">
      <div class="stat-box yellow">
        <i data-lucide="shopping-bag"></i>
        <div>
          <span>${t('shopTodayOrders')}</span>
          <h2>18 ORDERS</h2>
          <small>14 Delivered • 4 In Transit</small>
        </div>
      </div>
      <div class="stat-box green">
        <i data-lucide="credit-card"></i>
        <div>
          <span>${t('shopTodaySales')}</span>
          <h2>₹42,300</h2>
          <small>Direct Wholesale Settlement</small>
        </div>
      </div>
      <div class="stat-box red">
        <i data-lucide="alert-circle"></i>
        <div>
          <span>${t('shopLowStock')}</span>
          <h2>3 ITEMS</h2>
          <small>MRF Tires, Bosch Pads</small>
        </div>
      </div>
      <div class="stat-box blue">
        <i data-lucide="truck"></i>
        <div>
          <span>${t('shopActiveDispatches')}</span>
          <h2>4 RUNNING</h2>
          <small>Selvam & Karthik Clinics</small>
        </div>
      </div>
    </div>

    <!-- Shop Dashboard Grid -->
    <div class="role-dashboard-grid">
      <!-- Inventory Management Table -->
      <div class="admin-card">
        <div class="card-header">
          <h3><i data-lucide="package"></i> ${t('shopInventoryTitle')}</h3>
          <span class="pill green">Live Wholesale Sync</span>
        </div>
        <div class="inventory-table-container">
          ${shopInventory
      .map(
        (item) => `
            <div class="inventory-row">
              <div class="inventory-info">
                <strong>${currentLang === 'ta' ? item.nameTa : item.name}</strong>
                <small>${item.category} • Wholesale: ₹${item.price} (Retail: ₹${item.retail})</small>
              </div>
              <div class="stock-control">
                <span class="stock-pill ${item.stock > 6 ? 'in-stock' : 'low-stock'}">
                  ${item.stock} in stock
                </span>
                <button class="btn btn-yellow" style="padding: 4px 8px; font-size: 11px;" onclick="restockItem(${item.id})">+ Stock</button>
              </div>
            </div>
          `
      )
      .join('')}
        </div>
      </div>

      <!-- Real-time Incoming Orders Stream -->
      <div class="admin-card">
        <div class="card-header">
          <h3><i data-lucide="shopping-cart" style="color: #00C851;"></i> ${t('shopOrdersTitle')}</h3>
          <span class="pill red animate-pulse">Live Feed</span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div class="b-card yellow" style="padding: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <div>
                <span class="badge black">ORDER #ORD-8821</span>
                <strong style="display: block; font-size: 13px; margin-top: 4px;">Exide 35Ah Heavy Car Battery</strong>
                <small style="font-weight: 700; color: #333;">Mechanic: Selvam Auto Works (Theni Bypass Toll)</small>
              </div>
              <strong style="font-size: 15px; color: #166534;">₹3,450</strong>
            </div>
            <button class="btn btn-green full-width" style="margin-top: 8px; padding: 6px; font-size: 11px;" onclick="dispatchShopOrder('ORD-8821')">
              <i data-lucide="send"></i> ${t('dispatchOrderBtn')}
            </button>
          </div>

          <div class="b-card" style="padding: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <div>
                <span class="badge black">ORDER #ORD-8820</span>
                <strong style="display: block; font-size: 13px; margin-top: 4px;">Motul 7100 4T Oil (1L)</strong>
                <small style="font-weight: 700; color: #333;">Customer: Murugan Swamy (Hyundai i20)</small>
              </div>
              <strong style="font-size: 15px; color: #166534;">₹690</strong>
            </div>
            <span class="pill green" style="margin-top: 6px; display: inline-block;">✓ Dispatched via Courier</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

function restockItem(id) {
  const item = shopInventory.find((i) => i.id === id);
  if (item) {
    item.stock += 5;
    alert(`📦 ${item.name} stock increased to ${item.stock}!`);
    renderShopOwnerScreen();
  }
}

function addNewInventoryItem() {
  const name = prompt('Enter New Spare Part Name:', 'Amaron Pro 45Ah Car Battery');
  if (name) {
    shopInventory.push({
      id: Date.now(),
      name: name,
      nameTa: name,
      price: 2800,
      retail: 3500,
      stock: 10,
      category: 'Battery',
    });
    renderShopOwnerScreen();
  }
}

function dispatchShopOrder(orderId) {
  alert(`🚚 Order ${orderId} dispatched to Selvam Mechanic on Highway Dispatch!`);
}

// ==========================================================================
// 4. BACKUP TRAVEL / TOWING SERVICE VIEW RENDERER
// ==========================================================================

function renderTowingPartnerScreen() {
  const container = document.getElementById('towing-panel-container');
  if (!container) return;

  container.innerHTML = `
    <!-- Towing Profile Header -->
    <div class="role-dashboard-header">
      <div class="role-profile-info">
        <div class="role-avatar-circle towing">🚚</div>
        <div>
          <h2 style="font-size: 18px; font-weight: 900;">${t('towingTitle')}</h2>
          <span style="font-size: 11.5px; font-weight: 700; color: #4B5563;">${t('towingSub')}</span>
        </div>
      </div>
      <div style="display: flex; gap: 8px;">
        <span class="pill green" style="padding: 6px 12px; font-size: 12px;">● 6 Trucks Online</span>
      </div>
    </div>

    <!-- Towing KPI Stats -->
    <div class="admin-top-stats">
      <div class="stat-box yellow">
        <i data-lucide="truck"></i>
        <div>
          <span>${t('towActiveTrucks')}</span>
          <h2>6 / 8 FLEET</h2>
          <small>Theni, Dindigul & Madurai</small>
        </div>
      </div>
      <div class="stat-box green">
        <i data-lucide="check-circle"></i>
        <div>
          <span>${t('towRecoveriesDone')}</span>
          <h2>9 TOWS</h2>
          <small>100% Zero-Damage Flatbed</small>
        </div>
      </div>
      <div class="stat-box blue">
        <i data-lucide="credit-card"></i>
        <div>
          <span>${t('towEarnings')}</span>
          <h2>₹12,400</h2>
          <small>Daily Tow Fare Payout</small>
        </div>
      </div>
      <div class="stat-box red">
        <i data-lucide="clock"></i>
        <div>
          <span>${t('towAvgEta')}</span>
          <h2>11 MINS</h2>
          <small>Highway Fast Response</small>
        </div>
      </div>
    </div>

    <!-- Towing Dashboard Grid -->
    <div class="role-dashboard-grid">
      <!-- Recovery Fleet Grid -->
      <div class="admin-card">
        <div class="card-header">
          <h3><i data-lucide="truck"></i> ${t('fleetTitle')}</h3>
          <span class="pill green">GPS Active</span>
        </div>
        <div class="fleet-grid">
          ${towingFleet
      .map(
        (f) => `
            <div class="fleet-truck-card">
              <span class="badge black">${f.id}</span>
              <strong>${f.type}</strong>
              <small style="font-weight: 700; color: #444;">${f.reg} • Driver: ${f.driver}</small>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
                <span class="pill ${f.status === 'Available' ? 'green' : 'yellow'}">${f.status}</span>
                <small style="font-weight: 900;">ETA: ${f.eta}</small>
              </div>
            </div>
          `
      )
      .join('')}
        </div>
      </div>

      <!-- Live Highway Breakdown Tow Request -->
      <div class="admin-card">
        <div class="card-header">
          <h3><i data-lucide="alert-triangle" style="color: #FF3B30;"></i> ${t('liveTowReqTitle')}</h3>
          <span class="pill red">Dispatch Alert</span>
        </div>
        <div class="b-card yellow" style="padding: 14px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span class="badge red">#TOW-REQ-901</span>
            <strong style="font-size: 16px; color: #166534;">₹850 Fare</strong>
          </div>
          <p style="font-size: 13px; font-weight: 900; margin-top: 6px;">Vehicle: Hyundai i20 Asta (TN-60-AZ-1234)</p>
          <p style="font-size: 11.5px; font-weight: 700; color: #333;">📍 Pickup: Theni Highway Junction (Near Tollgate)</p>
          <p style="font-size: 11.5px; font-weight: 700; color: #333;">🏁 Drop: Madurai Road Auto Clinic (8.5 km)</p>
          <p style="font-size: 11px; color: #666; margin-top: 4px;">Issue: Transmission breakdown. Flatbed required.</p>

          ${towDispatchAccepted
      ? `<div class="auth-perks-box" style="margin-top: 10px;">
                  <i data-lucide="check-circle" style="color: #00C851;"></i>
                  <span>${t('towEnRouteStatus')}</span>
                </div>`
      : `<button class="btn btn-green full-width" style="margin-top: 10px; font-size: 12px;" onclick="acceptTowDispatch()">
                  <i data-lucide="check"></i> ${t('acceptTowBtn')}
                </button>`
    }
        </div>
      </div>
    </div>
  `;
}

function acceptTowDispatch() {
  towDispatchAccepted = true;
  alert('🚚 Flatbed Hydraulic Truck TN-60-T-9001 dispatched to customer breakdown location!');
  renderTowingPartnerScreen();
}

// ==========================================================================
// 5. ISOLATED KAVALAN POLICE & SUPER ADMIN DESK (Restricted Staff Only)
// ==========================================================================

function renderAdminPanel() {
  const container = document.getElementById('admin-panel-container');
  if (!container) return;

  container.innerHTML = `
    <!-- Top KPI Stats -->
    <div class="admin-top-stats">
      <div class="stat-box red">
        <i data-lucide="shield-alert"></i>
        <div>
          <span>${t('adminSosTitle')}</span>
          <h2 id="active-sos-count">1 ACTIVE</h2>
          <small>${currentLang === 'ta' ? 'தேனி காவல் நிலையம் (112) தகவல் அனுப்பப்பட்டது' : 'Theni Police Station (112) Notified'}</small>
        </div>
      </div>
      <div class="stat-box yellow">
        <i data-lucide="zap"></i>
        <div>
          <span>${t('adminActiveJobs')}</span>
          <h2>14 JOBS</h2>
          <small>8 En-Route • 6 Diagnosing</small>
        </div>
      </div>
      <div class="stat-box green">
        <i data-lucide="users"></i>
        <div>
          <span>${t('adminOnlineMechs')}</span>
          <h2>28 ONLINE</h2>
          <small>Theni & Madurai Hub</small>
        </div>
      </div>
      <div class="stat-box blue">
        <i data-lucide="credit-card"></i>
        <div>
          <span>${t('adminRazorpayVol')}</span>
          <h2>₹1,48,900</h2>
          <small>100% Verified UPI/Card</small>
        </div>
      </div>
    </div>

    <!-- Admin Grid -->
    <div class="admin-radar-grid">
      <!-- Radar Map -->
      <div class="admin-card">
        <div class="card-header">
          <h3><i data-lucide="radar"></i> ${t('adminRadarTitle')}</h3>
          <span class="pill red">112 Dispatch Active</span>
        </div>
        <div class="admin-map-box">
          <div class="radar-scan"></div>
          <div class="map-entity user-sos-pin" style="top: 38%; left: 46%;">
            <i data-lucide="car"></i>
            <div class="entity-tag red">🚨 ${currentLang === 'ta' ? 'முருகன் (TN-60) SOS!' : 'Murugan (TN-60) SOS!'}</div>
          </div>
          <div class="map-entity mech-pin" style="top: 45%; left: 52%;">
            <i data-lucide="wrench"></i>
            <div class="entity-tag yellow">${currentLang === 'ta' ? 'செல்வம் மெக்கானிக்' : 'Selvam Mechanic'}</div>
          </div>
          <div class="map-entity police-pin" style="top: 22%; left: 36%;">
            <i data-lucide="shield"></i>
            <div class="entity-tag black">${currentLang === 'ta' ? 'தேனி நகர் காவல் நிலையம்' : 'Theni Police Station'}</div>
          </div>
          <div class="map-entity shop-pin" style="top: 28%; left: 72%;">
            <i data-lucide="store"></i>
            <div class="entity-tag green">${currentLang === 'ta' ? 'தேனி Spares Hub' : 'Theni Spares Hub'}</div>
          </div>
        </div>
      </div>

      <!-- Incident Log -->
      <div class="admin-card">
        <div class="card-header">
          <h3><i data-lucide="shield-alert" style="color: #FF3B30;"></i> ${t('adminIncidentTitle')}</h3>
          <span class="pill red">Police Action</span>
        </div>
        <div class="sos-incident-card">
          <div class="incident-top">
            <span class="badge red">#SOS-11201</span>
            <span class="incident-time">${currentLang === 'ta' ? '1 நிமிடம் முன்பு' : '1 min ago'}</span>
          </div>
          <h4>${t('adminVictimLabel')} ${currentLang === 'ta' ? 'முருகன் சுவாமி (+91 98765 43210)' : 'Murugan Swamy (+91 98765 43210)'}</h4>
          <p><strong>${t('adminLocLabel')}</strong> Theni Highway Bypass (10.0104, 77.4768)</p>
          <p><strong>${t('adminIncidentLabel')}</strong> ${currentLang === 'ta' ? 'மெக்கானிக் தகாத நடத்தை / மிரட்டல்' : 'Mechanic Misbehavior / Harassment'}</p>
          <p><strong>${t('adminPoliceStationLabel')}</strong> ${currentLang === 'ta' ? 'தேனி நகர் காவல் நிலையம் (04546-252222)' : 'Theni Town Police Station (04546-252222)'}</p>
          <p><strong>${t('adminMechStatusLabel')}</strong> <span class="badge black" style="color: #FF3B30;">${t('adminSuspended')}</span></p>
          <div class="incident-btns">
            <button class="btn btn-red" onclick="alert('🚨 Connecting live secure call to Theni Police Patrol Officer on NH-85!')"><i data-lucide="phone-call"></i> ${t('adminCallPatrolBtn')}</button>
            <button class="btn btn-black" onclick="alert('Incident resolved and marked safe in Kavalan registry.')">${t('adminMarkSafeBtn')}</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ==========================================================================
// 6. RAZORPAY MODAL HANDLERS
// ==========================================================================

function openRazorpayModal(amount) {
  document.getElementById('rzp-pay-amount').innerText = `₹${amount}.00`;
  document.getElementById('rzp-btn-text').innerText = `₹${amount}.00 ${t('rzpPayBtn')}`;
  document.getElementById('razorpay-modal').classList.add('active');
}

function closeRazorpayModal() {
  document.getElementById('razorpay-modal').classList.remove('active');
}

function completeRazorpayPayment() {
  closeRazorpayModal();
  alert(currentLang === 'ta' ? '🎉 Razorpay மூலம் பணம் வெற்றிகரமாக செலுத்தப்பட்டது!' : '🎉 Razorpay Payment Captured Successfully!');
  customerNavigate('home');
}

// ==========================================================================
// 7. INITIALIZATION & SHORTCUTS
// ==========================================================================

// Secret Hash and Keyboard Shortcuts for Admin
window.addEventListener('hashchange', () => {
  if (window.location.hash === '#/admin-login' || window.location.hash === '#admin-login') {
    openAdminLoginModal();
  }
});

document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
    e.preventDefault();
    openAdminLoginModal();
  }
});

// App Bootstrap on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  setAppLanguage(currentLang);

  if (window.location.hash === '#/admin-login' || window.location.hash === '#admin-login') {
    openAdminLoginModal();
  } else if (currentUserRole) {
    switchAppMode(currentUserRole);
  } else {
    switchAppMode('gateway');
  }
});
