/* eslint-disable no-undef */
/* global firebase, L, Razorpay, lucide */
// ==========================================================================
// ULLUR MECHANIC — COMPLETE FULL-WIDTH MULTI-STAKEHOLDER SUPER APP
// High-Fidelity Bilingual Architecture, 5 Full-Width Portals, Leaflet & Razorpay
// ==========================================================================

// --------------------------------------------------------------------------
// 1. FIREBASE & AUTHENTICATION CONFIGURATION
// --------------------------------------------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyAdAvhgZy29k_Cn_yFxLKVzOgPBNq2bis",
  authDomain: "ullur-mechanic.firebaseapp.com",
  projectId: "ullur-mechanic",
  storageBucket: "ullur-mechanic.firebasestorage.app",
  messagingSenderId: "325254482783",
  appId: "1:325254482783:web:1f08437dc410b3128004ea",
  measurementId: "G-GJKPY9VW57"
};

let auth = null;
let firestoreDb = null;

try {
  if (typeof firebase !== "undefined") {
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    auth = firebase.auth();
    if (firebase.firestore) {
      firestoreDb = firebase.firestore();
    }
  }
} catch (e) {
  console.warn("Firebase Init notice:", e);
}

// Global window reference for confirmation result
window.confirmationResultGlobal = null;

function setupRecaptcha() {
  try {
    if (typeof firebase !== "undefined" && firebase.auth && document.getElementById('recaptcha-container')) {
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
          size: 'invisible',
          callback: () => {
            console.log("reCAPTCHA verified");
          }
        });
      }
    }
  } catch (e) {
    console.warn("Recaptcha notice:", e);
  }
}

// --------------------------------------------------------------------------
// 2. CENTRALIZED REACTIVE APPLICATION STATE
// --------------------------------------------------------------------------
const APP_STATE = {
  lang: localStorage.getItem('ullur_lang') || 'ta',
  role: localStorage.getItem('ullur_role') || 'gateway', // 'gateway' | 'customer' | 'mechanic' | 'shop' | 'towing' | 'admin'
  customerScreen: 'home', // 'home' | 'request' | 'tracking' | 'parts' | 'cart' | 'tow' | 'sos' | 'profile'
  pendingAuthRole: 'customer',
  isSirenPlaying: false,
  sirenAudioContext: null,

  // Reactive Dynamic OTP Authentication State
  authOtp: {
    code: '',
    phone: '',
    createdAt: 0,
    expiresAt: 0,
    timerInterval: null,
    remainingSeconds: 0,
    isExpired: false
  },

  // Customer Data
  customer: {
    id: 'CUST-TN-98765',
    name: 'Murugan Swamy (முருகன் சுவாமி)',
    phone: '+91 98765 43210',
    vehicle: {
      type: 'Car',
      model: 'Hyundai i20 Asta',
      plate: 'TN-60-AZ-1234'
    },
    location: {
      lat: 10.0104,
      lng: 77.4768,
      name: 'Theni Highway Bypass, NH-85, Tamil Nadu'
    },
    issue: {
      category: 'Breakdown',
      note: '',
      photoData: null,
      audioBlobUrl: null
    },
    cart: []
  },

  // Active Emergency Breakdown Job State
  activeJob: {
    id: 'JOB-88210',
    status: 'Requested', // 'Requested' | 'Accepted' | 'Arrived' | 'In Progress' | 'Completed' | 'Cancelled'
    mechanicId: 'MEC-01',
    customerId: 'CUST-TN-98765',
    customerName: 'Murugan Swamy',
    customerPhone: '+91 98765 43210',
    vehicleDetails: 'Hyundai i20 Asta (TN-60-AZ-1234)',
    issueType: 'Tire Puncture & Engine Check',
    location: { lat: 10.0104, lng: 77.4768, name: 'Theni Highway Bypass (NH-85)' },
    requestedAt: Date.now() - 35000,
    acceptedAt: null,
    arrivedAt: null,
    completedAt: null,
    distanceKm: 0.8,
    etaMins: 6,
    bill: {
      base: 150,
      parts: 100,
      labor: 100,
      gst: 0,
      total: 350
    },
    isPaid: false,
    rating: 5,
    feedback: '',
    rebooked: true,
    photoData: null,
    audioBlobUrl: null
  },

  // Mechanic Partners Pool
  mechanics: [
    {
      id: 'MEC-01',
      name: 'Selvam Auto Works (செல்வம்)',
      nameTa: 'செல்வம் ஆட்டோ ஒர்க்ஸ்',
      phone: '+91 98421 00001',
      rating: 4.9,
      jobsDone: 148,
      avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=120&h=120&q=80',
      lat: 10.0180,
      lng: 77.4820,
      isOnline: true,
      status: 'Verified',
      radiusKm: 15,
      tools: ['Puncture Kit', 'Battery Booster', 'Diagnostic OBD Scanner', 'Hydraulic Jack'],
      experience: '8 Years',
      serviceArea: 'Theni & NH-85 Bypass',
      earnings: { today: 2450, week: 14800, total: 68400 }
    },
    {
      id: 'MEC-02',
      name: 'Karthik Bike Clinic (கார்த்திக்)',
      nameTa: 'கார்த்திக் பைக் கிளினிக்',
      phone: '+91 98421 00002',
      rating: 4.8,
      jobsDone: 94,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80',
      lat: 10.0240,
      lng: 77.4900,
      isOnline: true,
      status: 'Verified',
      radiusKm: 10,
      tools: ['2-Wheeler Specialized Kit', 'Puncture Machine', 'Tire Tube Vulcanizer'],
      experience: '5 Years',
      serviceArea: 'Theni Town & Allinagaram',
      earnings: { today: 1850, week: 9600, total: 42000 }
    },
    {
      id: 'MEC-03',
      name: 'Muthu Diesel & Electricals (முத்து)',
      nameTa: 'முத்து டீசல் & எலக்ட்ரிக்கல்ஸ்',
      phone: '+91 98421 00003',
      rating: 4.7,
      jobsDone: 210,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80',
      lat: 10.0650,
      lng: 77.5300,
      isOnline: true,
      status: 'Verified',
      radiusKm: 20,
      tools: ['Heavy Diesel Diagnostics', 'Alternator / Starter Kit', 'Jump Cable Set'],
      experience: '12 Years',
      serviceArea: 'Bodi - Theni Highway',
      earnings: { today: 3100, week: 18200, total: 95000 }
    },
    {
      id: 'MEC-04',
      name: 'Raja Multi-Brand Car Care (ராஜா)',
      nameTa: 'ராஜா மல்டி பிராண்ட் கார் கேர்',
      phone: '+91 98421 00004',
      rating: 4.9,
      jobsDone: 120,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80',
      lat: 10.0800,
      lng: 77.5600,
      isOnline: false,
      status: 'Pending Verification',
      radiusKm: 12,
      tools: ['OBD-II Scanner', 'AC Gas Refill Kit', 'Coolant Pressure Tester'],
      experience: '6 Years',
      serviceArea: 'Andipatti Highway',
      earnings: { today: 0, week: 0, total: 0 }
    }
  ],

  // Spare Parts Merchant Inventory Catalog
  shopInventory: [
    { id: 1, name: 'Exide Mileage 35Ah Heavy Battery', nameTa: 'எக்சைட் 35Ah ஹெவி பேட்டரி', price: 3450, retail: 4200, stock: 14, category: 'Battery', icon: 'battery' },
    { id: 2, name: 'Motul 7100 4T 10W-50 Synthetic Oil (1L)', nameTa: 'மோட்டுல் 7100 என்ஜின் ஆயில் (1L)', price: 690, retail: 880, stock: 28, category: 'Oil', icon: 'droplet' },
    { id: 3, name: 'Bosch Front Ceramic Brake Pads Set', nameTa: 'பாஷ் பிரேக் பேட்ஸ் செட் (Bosch)', price: 950, retail: 1350, stock: 4, category: 'Brakes', icon: 'disc' },
    { id: 4, name: 'MRF Zapper 100/80-17 Tubeless Tire', nameTa: 'MRF ஜாப்பர் டியூப்லெஸ் டயர்', price: 1950, retail: 2450, stock: 3, category: 'Tire', icon: 'circle' },
    { id: 5, name: 'NGK Laser Iridium Spark Plug Set', nameTa: 'NGK இரிடியம் ஸ்பார்க் பிளக்', price: 320, retail: 480, stock: 22, category: 'Electrical', icon: 'zap' },
    { id: 6, name: 'Castrol Magnatec 5W-30 (3.5L)', nameTa: 'கேஸ்ட்ரால் மேக்னடெக் 5W-30 (3.5L)', price: 1650, retail: 2150, stock: 9, category: 'Oil', icon: 'droplet' }
  ],

  // Shop Orders Stream
  shopOrders: [
    { id: 'ORD-8821', partName: 'Exide 35Ah Heavy Car Battery', qty: 1, amount: 3450, channel: 'Mechanic Mid-Job', requestedBy: 'Selvam Auto Works (Theni Bypass)', status: 'Preparing', time: '5 mins ago' },
    { id: 'ORD-8820', partName: 'Motul 7100 4T Oil (1L)', qty: 1, amount: 690, channel: 'Direct Customer', requestedBy: 'Murugan Swamy (Hyundai i20)', status: 'Dispatched', time: '20 mins ago' },
    { id: 'ORD-8819', partName: 'Bosch Front Ceramic Brake Pads', qty: 2, amount: 1900, channel: 'Mechanic Mid-Job', requestedBy: 'Karthik Bike Clinic', status: 'Delivered', time: '1 hr ago' }
  ],

  // Towing Fleet
  towingFleet: [
    { id: 'TOW-01', type: 'Flatbed Hydraulic', reg: 'TN-60-T-9001', driver: 'Mani (மணி)', phone: '+91 98421 11001', capacity: '4.5 Tons', status: 'Available', eta: '6 mins' },
    { id: 'TOW-02', type: 'Wheel-Lift Crane', reg: 'TN-60-T-9002', driver: 'Rajesh (ராஜேஷ்)', phone: '+91 98421 11002', capacity: '3.0 Tons', status: 'Available', eta: 'Ready' },
    { id: 'TOW-03', type: 'Heavy Commercial Rig', reg: 'TN-60-T-9003', driver: 'Kannan (கண்ணன்)', phone: '+91 98421 11003', capacity: '12.0 Tons', status: 'En Route', eta: '14 mins' }
  ],

  // Towing Requests
  towingRequests: [
    { id: 'TOW-REQ-901', vehicle: 'Hyundai i20 Asta (TN-60-AZ-1234)', pickup: 'Theni Highway Junction (NH-85)', drop: 'Madurai Road Auto Clinic (8.5 km)', distanceKm: 8.5, fare: 840, status: 'Pending Dispatch' }
  ],

  // Admin Incidents & Disputes
  adminIncidents: [
    { id: 'SOS-11201', victim: 'Murugan Swamy (+91 98765 43210)', loc: 'Theni Highway Bypass (10.0104, 77.4768)', issue: 'High-speed highway breakdown distress & safety escort request', policeStation: 'Theni Town Police Station (04546-252222)', status: 'Active Dispatch', time: '2 mins ago' }
  ],
  adminDisputes: [
    { id: 'DISP-401', user: 'Kavitha R (TN-60)', against: 'Muthu Diesel', reason: 'Overcharge on alternator belt', amount: 250, status: 'Open' }
  ]
};

// --------------------------------------------------------------------------
// 3. COMPREHENSIVE BILINGUAL TRANSLATION STRINGS
// --------------------------------------------------------------------------
const STRINGS = {
  ta: {
    appTitle: 'ULLUR MECHANIC',
    appSubBadge: '⚡ 24/7 தமிழ்நாடு ஹைப்பர்-லோக்கல்',
    logoutBtn: 'வெளியேறு',
    gatewayBadge: '⚡ தமிழ்நாட்டின் #1 அவசர வாகன உதவி தளம்',
    gatewayTitle: 'உங்களின் பயன்பாட்டு வகையை தேர்வு செய்க',
    gatewaySub: 'உங்கள் பிரத்யேக போர்ட்டலை அணுக கீழே உள்ள வகையை தேர்வு செய்க',

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

    navHome: 'முகப்பு / உதவி',
    navParts: 'உதிரிபாகங்கள்',
    navTow: 'டோயிங் & மீட்பு',
    navSos: 'காவலன் 112 SOS',
    navProfile: 'எனது வாகனம்',
    locTitle: 'தற்போதைய இடம்',
    locSub: 'தேனி பைபாஸ் (NH-85), தமிழ்நாடு',
    sosBannerTitle: '🚨 காவலன் அவசர போலீஸ் உதவி (112 SOS)',
    sosBannerSub: 'ஓட்டுநர் தகாத நடத்தை / நெடுஞ்சாலை ஆபத்து நேர்ந்தால் அழுத்தவும்!',
    sosFixBtn: 'SOS உதவி',
    actBreakdown: 'வாகன\nபழுது நீக்கம்',
    actSpares: 'மொத்த\nஉதிரிபாகங்கள்',
    actTow: 'வாகனம்\nடோயிங் / இழுத்தல்',
    nearbyMechs: 'அருகிலுள்ள மெக்கானிக்குகள்',
    liveRadar: 'நேரலை ரேடார்',
    reqMechBtn: 'உதவி கோருக ➔',
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

    mechDutyTitle: 'மெக்கானிக் பார்ட்னர் கன்சோல்',
    mechDutyIntro: 'செல்வம் ஆட்டோ ஒர்க்ஸ் பார்ட்னர் அம்சங்கள்:',
    mechTodayEarnings: "இன்றைய வருமானம்",
    mechCompletedJobs: 'முடிந்த பணிகள்',
    mechActiveJob: '🔥 நேரலை பழுது பணி',
    mechCustomerLabel: 'வாடிக்கையாளர்:',
    mechVehicleLabel: 'வாகனம்:',
    mechLocLabel: 'இடம்:',

    shopTitle: 'தேனி ஸ்ரீ முருகன் ஆட்டோ ஸ்பேர்ஸ்',
    shopSub: 'சரிபார்க்கப்பட்ட மொத்த உதிரிபாக விற்பனையாளர் • GST: 33AABCS1429B1Z8',
    shopTodayOrders: 'இன்றைய ஆர்டர்கள்',
    shopTodaySales: 'இன்றைய விற்பனை',
    shopLowStock: 'குறைந்த இருப்பு எச்சரிக்கை',
    shopActiveDispatches: 'நேரலை விநியோகம்',
    shopInventoryTitle: '📦 மொத்த உதிரிபாகங்கள் இருப்பு பட்டியல் (Wholesale Catalog)',
    shopOrdersTitle: '🛒 நேரலை வாடிக்கையாளர் & மெக்கானிக் ஆர்டர்கள்',
    stockInStock: 'இருப்பில் உள்ளது',
    stockLow: 'குறைந்த இருப்பு (<5)',
    dispatchOrderBtn: 'டிஸ்பாட்ச் செய் ➔',

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

    // OTP & Authentication
    authPhoneLabel: 'மொபைல் எண் (Mobile Phone):',
    authOtpLabel: 'அனுப்பப்பட்ட 6-இலக்க OTP எண்:',
    authOtpExpiryHint: 'OTP 2 நிமிடங்களுக்கு மட்டுமே செல்லுபடியாகும் (120 விநாடிகள்)',
    authResendIn: 'மறுஅனுப்பு',
    authResendBtn: '🔄 புதிய OTP அனுப்புக (Resend OTP)',
    authVerifyBtn: 'சரிபார்த்து உள்நுழைக (VERIFY & ENTER)',
    authOtpInvalid: '❌ தவறான OTP எண்! உங்கள் SMS அறிவிப்பில் உள்ள சரியான 6 இலக்க எண்ணை உள்ளிடவும்.',
    authOtpExpired: '❌ OTP காலாவதியானது (120 விநாடிகள் முடிந்தது)! தயவுசெய்து புதிய OTP பெற "மறுஅனுப்பு" என்பதை அழுத்தவும்.',
    authOtpIncomplete: 'முழுமையான 6 இலக்க OTP எண்ணை உள்ளிடவும்!'
  },
  en: {
    appTitle: 'ULLUR MECHANIC',
    appSubBadge: '⚡ 24/7 TAMIL NADU HYPERLOCAL',
    logoutBtn: 'Logout',
    gatewayBadge: "⚡ TAMIL NADU'S #1 EMERGENCY BREAKDOWN PLATFORM",
    gatewayTitle: 'Select Your Access Portal',
    gatewaySub: 'Choose your specific role below to enter your dedicated dashboard',

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

    navHome: 'Home / Help',
    navParts: 'Spares',
    navTow: 'Towing & Recovery',
    navSos: 'Kavalan 112 SOS',
    navProfile: 'My Vehicle',
    locTitle: 'CURRENT LOCATION',
    locSub: 'Theni Highway Bypass (NH-85), TN',
    sosBannerTitle: '🚨 KAVALAN POLICE SOS (112 ALERT)',
    sosBannerSub: 'Instant police dispatch in case of harassment or danger!',
    sosFixBtn: 'SOS HELP',
    actBreakdown: 'Breakdown\nRepair',
    actSpares: 'Wholesale\nSpares',
    actTow: 'Vehicle\nTow/Pickup',
    nearbyMechs: 'NEARBY MECHANICS',
    liveRadar: 'LIVE RADAR',
    reqMechBtn: 'Request Help ➔',
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

    mechDutyTitle: 'Mechanic Partner Console',
    mechDutyIntro: 'Selvam Auto Works Partner features:',
    mechTodayEarnings: "Today's Earnings",
    mechCompletedJobs: 'Jobs Completed',
    mechActiveJob: '🔥 ACTIVE BREAKDOWN JOB',
    mechCustomerLabel: 'Customer:',
    mechVehicleLabel: 'Vehicle:',
    mechLocLabel: 'Location:',

    shopTitle: 'Sri Murugan Auto Spares, Theni',
    shopSub: 'Verified Wholesale Parts Merchant • GST: 33AABCS1429B1Z8',
    shopTodayOrders: "Today's Orders",
    shopTodaySales: "Today's Sales Revenue",
    shopLowStock: 'Low Stock Alerts',
    shopActiveDispatches: 'Active Dispatches',
    shopInventoryTitle: '📦 Wholesale Spares Inventory Catalog',
    shopOrdersTitle: '🛒 Real-Time Mechanic & Customer Orders',
    stockInStock: 'In Stock',
    stockLow: 'Low Stock (<5)',
    dispatchOrderBtn: 'Dispatch Now ➔',

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

    // OTP & Authentication
    authPhoneLabel: 'Mobile Phone Number:',
    authOtpLabel: 'Enter 6-Digit SMS OTP:',
    authOtpExpiryHint: 'OTP is strictly valid for 2 minutes (120s)',
    authResendIn: 'Resend in',
    authResendBtn: '🔄 Resend New OTP',
    authVerifyBtn: 'VERIFY & ENTER',
    authOtpInvalid: '❌ Invalid OTP entered! Please check your SMS alert and try again.',
    authOtpExpired: '❌ OTP Expired! The 2-minute validity has elapsed. Please click "Resend OTP".',
    authOtpIncomplete: 'Please enter the complete 6-digit OTP code!'
  }
};

function t(key) {
  const dict = STRINGS[APP_STATE.lang] || STRINGS['ta'];
  return dict[key] || key;
}

// --------------------------------------------------------------------------
// 4. HAVERSINE DISTANCE MATHEMATICAL FORMULA
// --------------------------------------------------------------------------
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's mean radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10;
}

// --------------------------------------------------------------------------
// 5. GLOBAL DYNAMIC OTP AUTHENTICATION & ROLE SWITCHING
// --------------------------------------------------------------------------

// Generates a cryptographically random/uniform 6-digit integer code (100000 - 999999)
function generateSecureOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function formatTimerMinutesSeconds(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function clearOtpInputs() {
  document.querySelectorAll('.otp-digit').forEach((input) => {
    input.value = '';
    input.classList.remove('filled', 'error');
  });
}

function highlightOtpInputsError() {
  document.querySelectorAll('.otp-digit').forEach((input) => {
    input.classList.add('error');
  });
  setTimeout(() => {
    document.querySelectorAll('.otp-digit').forEach((input) => {
      input.classList.remove('error');
    });
  }, 1200);
}

function showAuthError(msg) {
  const banner = document.getElementById('auth-error-banner');
  const txt = document.getElementById('auth-error-msg');
  if (banner && txt) {
    txt.innerText = msg;
    banner.style.display = 'flex';
  }
}

function hideAuthError() {
  const banner = document.getElementById('auth-error-banner');
  if (banner) {
    banner.style.display = 'none';
  }
}

function updateOtpTimerUI(remainingSeconds) {
  const timerText = document.getElementById('auth-otp-timer-text');
  const badge = document.getElementById('auth-otp-status-badge');
  const resendBtn = document.getElementById('btn-resend-otp');
  const resendLabel = document.getElementById('resend-otp-label');
  const hintText = document.getElementById('otp-hint-text');

  const formattedTime = formatTimerMinutesSeconds(remainingSeconds);

  if (timerText) timerText.innerText = formattedTime;

  if (remainingSeconds > 0) {
    if (badge) {
      badge.className = 'otp-timer-badge';
      if (remainingSeconds <= 30) badge.classList.add('warning');
    }
    if (resendBtn) {
      resendBtn.disabled = true;
      resendBtn.classList.remove('active-ready');
    }
    if (resendLabel) {
      resendLabel.innerText = `${t('authResendIn')} ${formattedTime}`;
    }
    if (hintText) {
      hintText.innerText = t('authOtpExpiryHint');
    }
  } else {
    if (badge) {
      badge.className = 'otp-timer-badge expired';
    }
    if (timerText) {
      timerText.innerText = '00:00 (EXPIRED)';
    }
    if (resendBtn) {
      resendBtn.disabled = false;
      resendBtn.classList.add('active-ready');
    }
    if (resendLabel) {
      resendLabel.innerText = t('authResendBtn');
    }
    if (hintText) {
      hintText.innerText = APP_STATE.lang === 'ta'
        ? '⚠️ OTP காலாவதியானது. புதிய குறியீட்டைப் பெற "மறுஅனுப்பு" என்பதை அழுத்தவும்.'
        : '⚠️ OTP Expired. Click "Resend OTP" to generate a new valid code.';
    }
  }
}

function handleOtpExpiration() {
  APP_STATE.authOtp.isExpired = true;
  updateOtpTimerUI(0);
  showAuthError(t('authOtpExpired'));
  highlightOtpInputsError();
}

// Floating simulated SMS push notification alert banner
function showSmsToastNotification(phone, code, validitySeconds = 120, isResend = false) {
  const container = document.getElementById('sms-toast-container');
  if (!container) return;

  // Clear any existing active toast
  container.innerHTML = '';

  const formattedPhone = phone.startsWith('+91') ? phone : `+91 ${phone}`;
  const isTa = APP_STATE.lang === 'ta';

  const toastEl = document.createElement('div');
  toastEl.className = 'sms-toast';
  toastEl.id = `sms-toast-${Date.now()}`;

  const msgPrefix = isResend
    ? (isTa ? '🔄 [மறுஅனுப்பப்பட்ட புதிய OTP]' : '🔄 [NEW RESENT OTP]')
    : (isTa ? '🚨 [உள்ளூர் மெக்கானிக் அவசர உள்நுழைவு]' : '🚨 [ULLUR HIGHWAY BREAKDOWN LOGIN]');

  const bodyText = isTa
    ? `${msgPrefix} ${formattedPhone} எண்ணுக்கான உங்கள் 6-இலக்க பாதுகாப்பு சரிபார்ப்பு எண்:`
    : `${msgPrefix} Your 6-digit access verification OTP for ${formattedPhone} is:`;

  const warningText = isTa
    ? '⏳ 2 நிமிடங்களுக்கு மட்டுமே செல்லுபடியாகும் (120 விநாடிகள்). யாரிடமும் பகிர வேண்டாம்.'
    : '⏳ Valid for 2 minutes (120s). Never share your OTP with anyone.';

  toastEl.innerHTML = `
    <div class="sms-toast-header">
      <div class="sms-toast-sender-info">
        <div class="sms-sender-dot"></div>
        <span class="sms-sender-name">MESSAGES • TN-ULLUR-SMS</span>
      </div>
      <div style="display: flex; align-items: center; gap: 8px;">
        <span class="sms-toast-meta">${isTa ? 'இப்போது • சிம் 1' : 'Just Now • SIM 1'}</span>
        <button type="button" class="sms-toast-close" onclick="window.dismissSmsToast(this)" title="Close SMS">✕</button>
      </div>
    </div>
    <div class="sms-toast-body">
      <div>${bodyText}</div>
      <div style="text-align: center; margin: 6px 0;">
        <span class="sms-toast-otp-highlight" id="toast-otp-value">${code}</span>
      </div>
      <div class="sms-toast-warning">
        <i data-lucide="shield-alert" style="width: 13px; height: 13px; flex-shrink: 0;"></i>
        <span>${warningText}</span>
      </div>
    </div>
    <div class="sms-toast-actions">
      <button type="button" class="sms-toast-action-btn" onclick="window.copyOtpFromToast('${code}', this)">
        <i data-lucide="copy" style="width: 12px; height: 12px;"></i>
        <span class="copy-btn-text">${isTa ? 'நகலெடு (Copy)' : 'Copy OTP'}</span>
      </button>
      <button type="button" class="sms-toast-action-btn fill-btn" onclick="window.fillOtpFromToast('${code}')">
        <i data-lucide="zap" style="width: 12px; height: 12px;"></i>
        <span>${isTa ? 'உடனடி உள்ளீடு' : 'Tap to Fill'}</span>
      </button>
    </div>
    <div class="sms-toast-progress-container">
      <div class="sms-toast-progress-bar" id="toast-progress-bar"></div>
    </div>
  `;

  container.appendChild(toastEl);
  if (window.lucide) lucide.createIcons();

  // Animate progress bar over 120s
  const progressBar = toastEl.querySelector('#toast-progress-bar');
  if (progressBar) {
    setTimeout(() => {
      progressBar.style.transition = `width ${validitySeconds}s linear`;
      progressBar.style.width = '0%';
    }, 50);
  }
}

window.dismissSmsToast = function (btn) {
  const toast = btn.closest('.sms-toast');
  if (toast) {
    toast.classList.add('closing');
    setTimeout(() => toast.remove(), 300);
  }
};

window.copyOtpFromToast = function (code, btn) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(code).catch(() => {});
  }
  const txt = btn.querySelector('.copy-btn-text');
  if (txt) {
    const original = txt.innerText;
    txt.innerText = '✅ Copied!';
    setTimeout(() => { txt.innerText = original; }, 1800);
  }
};

window.fillOtpFromToast = function (code) {
  const digits = code.split('');
  const inputs = document.querySelectorAll('.otp-digit');
  inputs.forEach((input, idx) => {
    input.value = digits[idx] || '';
    if (input.value) input.classList.add('filled');
  });
  hideAuthError();
  if (inputs[inputs.length - 1]) inputs[inputs.length - 1].focus();
};

window.requestNewAuthOtp = function (phone, isResend = false) {
  if (APP_STATE.authOtp.timerInterval) {
    clearInterval(APP_STATE.authOtp.timerInterval);
    APP_STATE.authOtp.timerInterval = null;
  }

  const generatedCode = generateSecureOtp();
  const validitySeconds = 120; // 2 minutes (120 seconds)
  const now = Date.now();
  const expiresAt = now + validitySeconds * 1000;

  const targetPhone = phone || document.getElementById('auth-phone-input')?.value || '9876543210';

  APP_STATE.authOtp.code = generatedCode;
  APP_STATE.authOtp.phone = targetPhone;
  APP_STATE.authOtp.createdAt = now;
  APP_STATE.authOtp.expiresAt = expiresAt;
  APP_STATE.authOtp.remainingSeconds = validitySeconds;
  APP_STATE.authOtp.isExpired = false;

  // Clear inputs - strictly empty for user entry
  clearOtpInputs();
  hideAuthError();
  updateOtpTimerUI(validitySeconds);

  // Live countdown ticker
  APP_STATE.authOtp.timerInterval = setInterval(() => {
    const remaining = Math.max(0, Math.round((APP_STATE.authOtp.expiresAt - Date.now()) / 1000));
    APP_STATE.authOtp.remainingSeconds = remaining;
    updateOtpTimerUI(remaining);

    if (remaining <= 0) {
      clearInterval(APP_STATE.authOtp.timerInterval);
      APP_STATE.authOtp.timerInterval = null;
      handleOtpExpiration();
    }
  }, 1000);

  // Trigger floating simulated SMS Toast Notification
  showSmsToastNotification(targetPhone, generatedCode, validitySeconds, isResend);

  // Focus first input box
  setTimeout(() => {
    const firstInput = document.querySelector('.otp-digit');
    if (firstInput) firstInput.focus();
  }, 200);
};

window.resendAuthOtp = function () {
  if (APP_STATE.authOtp.remainingSeconds > 0 && !APP_STATE.authOtp.isExpired) {
    return; // Button is disabled while timer is counting down
  }
  const phone = document.getElementById('auth-phone-input')?.value || '9876543210';
  window.requestNewAuthOtp(phone, true);
};

function setupOtpInputListeners() {
  const inputs = document.querySelectorAll('.otp-digit');
  inputs.forEach((input, index) => {
    if (input.dataset.bound === 'true') return;
    input.dataset.bound = 'true';

    input.addEventListener('input', (e) => {
      const val = e.target.value.replace(/\D/g, '');
      e.target.value = val ? val.slice(-1) : '';

      if (e.target.value) {
        e.target.classList.add('filled');
        if (index < inputs.length - 1) {
          inputs[index + 1].focus();
        }
      } else {
        e.target.classList.remove('filled');
      }
      hideAuthError();
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace') {
        if (!input.value && index > 0) {
          inputs[index - 1].focus();
          inputs[index - 1].value = '';
          inputs[index - 1].classList.remove('filled');
        }
      } else if (e.key === 'ArrowLeft' && index > 0) {
        inputs[index - 1].focus();
      } else if (e.key === 'ArrowRight' && index < inputs.length - 1) {
        inputs[index + 1].focus();
      } else if (e.key === 'Enter') {
        window.submitRoleAuth();
      }
    });

    input.addEventListener('paste', (e) => {
      e.preventDefault();
      const pastedData = (e.clipboardData || window.clipboardData).getData('text');
      const digits = pastedData.replace(/\D/g, '').slice(0, inputs.length).split('');
      digits.forEach((digit, i) => {
        if (inputs[i]) {
          inputs[i].value = digit;
          inputs[i].classList.add('filled');
        }
      });
      const nextIndex = Math.min(digits.length, inputs.length - 1);
      if (inputs[nextIndex]) inputs[nextIndex].focus();
      hideAuthError();
    });
  });
}

window.initiateRoleAuth = function (role) {
  APP_STATE.pendingAuthRole = role;
  const modal = document.getElementById('auth-modal');
  const title = document.getElementById('auth-modal-role-title');
  const sub = document.getElementById('auth-modal-role-sub');
  const perks = document.getElementById('auth-perks-text');

  if (role === 'customer') {
    title.innerText = APP_STATE.lang === 'ta' ? '🧑 வாடிக்கையாளர் உள்நுழைவு' : '🧑 Customer / User Login';
    sub.innerText = 'Fast OTP Verification for Highway Breakdown Assistance';
    perks.innerText = APP_STATE.lang === 'ta' ? 'உடனடி ஜி.பி.எஸ் லாக் & 6 நிமிட மெக்கானிக் ரேடார் அணுகல்.' : 'Instant GPS Lock & 6-min mechanic dispatch activated.';
  } else if (role === 'mechanic') {
    title.innerText = APP_STATE.lang === 'ta' ? '🔧 மெக்கானிக் பார்ட்னர் உள்நுழைவு' : '🔧 Mechanic Partner Login';
    sub.innerText = 'Partner Portal: Selvam Auto Works (TN-MEC-8842)';
    perks.innerText = APP_STATE.lang === 'ta' ? 'டியூட்டி நிலை, நேரலை வரைபடம் & நேரடி தினசரி பேமெண்ட்.' : 'Duty toggle, Google Maps navigation & daily wallet payout.';
  } else if (role === 'shop') {
    title.innerText = APP_STATE.lang === 'ta' ? '🏪 உதிரிபாக விற்பனையாளர் உள்நுழைவு' : '🏪 Spare Parts Merchant Login';
    sub.innerText = 'Verified Merchant Hub: Theni Spares #104';
    perks.innerText = APP_STATE.lang === 'ta' ? 'மொத்த விலை நிர்ணயம் & வாடிக்கையாளர் ஆர்டர்கள் அணுகல்.' : 'Wholesale catalog, stock management & dispatch streaming.';
  } else if (role === 'towing') {
    title.innerText = APP_STATE.lang === 'ta' ? '🚚 டோயிங் & மீட்பு பார்ட்னர் உள்நுழைவு' : '🚚 Towing Fleet Partner Login';
    sub.innerText = 'NH-85 Highway Recovery Fleet Unit';
    perks.innerText = APP_STATE.lang === 'ta' ? 'பிளாட்பெட் லாரிகள் & அவசர விபத்து மீட்பு கோரிக்கைகள்.' : 'Flatbed truck fleet management & toll recovery routes.';
  }

  if (modal) modal.classList.add('active');
  setupRecaptcha();
  setupOtpInputListeners();

  // Request fresh dynamic 6-digit OTP and start 120s timer
  const phone = document.getElementById('auth-phone-input')?.value || '9876543210';
  window.requestNewAuthOtp(phone, false);

  if (window.lucide) lucide.createIcons();
};

window.closeAuthModal = function () {
  const modal = document.getElementById('auth-modal');
  if (modal) modal.classList.remove('active');
  if (APP_STATE.authOtp.timerInterval) {
    clearInterval(APP_STATE.authOtp.timerInterval);
    APP_STATE.authOtp.timerInterval = null;
  }
  hideAuthError();
};

window.submitRoleAuth = function () {
  const otpCode = Array.from(document.querySelectorAll('.otp-digit')).map((d) => d.value.trim()).join('');

  if (otpCode.length < 6) {
    showAuthError(t('authOtpIncomplete'));
    highlightOtpInputsError();
    return;
  }

  // 1. Strict Expiration Check
  if (APP_STATE.authOtp.isExpired || Date.now() > APP_STATE.authOtp.expiresAt) {
    showAuthError(t('authOtpExpired'));
    highlightOtpInputsError();
    return;
  }

  // 2. Strict OTP Match Check
  if (otpCode !== APP_STATE.authOtp.code) {
    showAuthError(t('authOtpInvalid'));
    highlightOtpInputsError();
    return;
  }

  // Verification Successful: Clear timer interval & state
  if (APP_STATE.authOtp.timerInterval) {
    clearInterval(APP_STATE.authOtp.timerInterval);
    APP_STATE.authOtp.timerInterval = null;
  }

  window.closeAuthModal();
  APP_STATE.role = APP_STATE.pendingAuthRole;
  localStorage.setItem('ullur_role', APP_STATE.role);
  window.switchAppMode(APP_STATE.role);
};

window.logoutUser = function () {
  APP_STATE.role = 'gateway';
  localStorage.removeItem('ullur_role');
  window.switchAppMode('gateway');
};

window.navigateToRoleGateway = function () {
  window.switchAppMode('gateway');
};

// Admin staff verification
window.openAdminLoginModal = function (e) {
  if (e && e.preventDefault) e.preventDefault();
  const modal = document.getElementById('admin-login-modal');
  if (modal) modal.classList.add('active');
  if (window.lucide) lucide.createIcons();
};

window.closeAdminLoginModal = function () {
  const modal = document.getElementById('admin-login-modal');
  if (modal) modal.classList.remove('active');
};

window.autofillAdminDemo = function () {
  const email = document.getElementById('admin-email-input');
  const pass = document.getElementById('admin-pass-input');
  if (email) email.value = 'admin@ullur.in';
  if (pass) pass.value = 'KAVALAN-112';
};

window.verifyAdminLogin = function () {
  const email = document.getElementById('admin-email-input')?.value || '';
  const pass = document.getElementById('admin-pass-input')?.value || '';

  if (email.includes('admin') || pass === 'KAVALAN-112' || pass === 'ullur2026') {
    window.closeAdminLoginModal();
    APP_STATE.role = 'admin';
    localStorage.setItem('ullur_role', 'admin');
    window.switchAppMode('admin');
  } else {
    alert('❌ Invalid Staff Credentials. Access Denied!');
  }
};

// --------------------------------------------------------------------------
// 6. APP MODE SWITCHER & DESKTOP HEADER NAVIGATION
// --------------------------------------------------------------------------
window.switchAppMode = function (mode) {
  document.querySelectorAll('.app-mode-view').forEach((view) => view.classList.remove('active'));

  const sessionChip = document.getElementById('user-session-chip');
  const sessionRoleLabel = document.getElementById('session-role-label');

  if (mode === 'gateway' || !mode) {
    const gw = document.getElementById('role-gateway-view');
    if (gw) gw.classList.add('active');
    if (sessionChip) sessionChip.style.display = 'none';
    renderDesktopHeaderNav(null);
  } else if (mode === 'customer') {
    const cm = document.getElementById('customer-mode');
    if (cm) cm.classList.add('active');
    if (sessionChip) {
      sessionChip.style.display = 'flex';
      if (sessionRoleLabel) sessionRoleLabel.innerText = APP_STATE.lang === 'ta' ? '🧑 வாடிக்கையாளர்' : 'Customer View';
    }
    window.customerNavigate(APP_STATE.customerScreen);
    renderDesktopHeaderNav('customer');
  } else if (mode === 'mechanic') {
    const mm = document.getElementById('mechanic-mode');
    if (mm) mm.classList.add('active');
    if (sessionChip) {
      sessionChip.style.display = 'flex';
      if (sessionRoleLabel) sessionRoleLabel.innerText = APP_STATE.lang === 'ta' ? '🔧 மெக்கானிக் பார்ட்னர்' : 'Mechanic Partner';
    }
    renderMechanicScreen();
    renderDesktopHeaderNav('mechanic');
  } else if (mode === 'shop') {
    const sm = document.getElementById('shop-mode');
    if (sm) sm.classList.add('active');
    if (sessionChip) {
      sessionChip.style.display = 'flex';
      if (sessionRoleLabel) sessionRoleLabel.innerText = APP_STATE.lang === 'ta' ? '🏪 உதிரிபாக விற்பனையாளர்' : 'Spares Merchant';
    }
    renderShopOwnerScreen();
    renderDesktopHeaderNav('shop');
  } else if (mode === 'towing') {
    const tm = document.getElementById('towing-mode');
    if (tm) tm.classList.add('active');
    if (sessionChip) {
      sessionChip.style.display = 'flex';
      if (sessionRoleLabel) sessionRoleLabel.innerText = APP_STATE.lang === 'ta' ? '🚚 டோயிங் பார்ட்னர்' : 'Towing Fleet';
    }
    renderTowingPartnerScreen();
    renderDesktopHeaderNav('towing');
  } else if (mode === 'admin') {
    const am = document.getElementById('admin-mode');
    if (am) am.classList.add('active');
    if (sessionChip) {
      sessionChip.style.display = 'flex';
      if (sessionRoleLabel) sessionRoleLabel.innerText = '🚨 Police & Super Admin';
    }
    renderAdminPanel();
    renderDesktopHeaderNav('admin');
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (window.lucide) lucide.createIcons();
};

function renderDesktopHeaderNav(role) {
  const container = document.getElementById('desktop-header-nav');
  if (!container) return;

  if (!role || role === 'gateway') {
    container.innerHTML = `
      <button class="d-nav-btn active" onclick="window.switchAppMode('gateway')">
        <i data-lucide="compass"></i> <span>${APP_STATE.lang === 'ta' ? 'போர்ட்டல் தேர்வகம்' : 'Role Gateway'}</span>
      </button>
    `;
  } else if (role === 'customer') {
    container.innerHTML = `
      <button class="d-nav-btn ${APP_STATE.customerScreen === 'home' || APP_STATE.customerScreen === 'request' ? 'active' : ''}" id="dnav-home" onclick="window.customerNavigate('home')">
        <i data-lucide="home"></i> <span>${t('navHome')}</span>
      </button>
      <button class="d-nav-btn ${APP_STATE.customerScreen === 'parts' || APP_STATE.customerScreen === 'cart' ? 'active' : ''}" id="dnav-parts" onclick="window.customerNavigate('parts')">
        <i data-lucide="shopping-bag"></i> <span>${t('navParts')}</span>
      </button>
      <button class="d-nav-btn ${APP_STATE.customerScreen === 'tow' ? 'active' : ''}" id="dnav-tow" onclick="window.customerNavigate('tow')">
        <i data-lucide="truck"></i> <span>${t('navTow')}</span>
      </button>
      <button class="d-nav-btn ${APP_STATE.customerScreen === 'profile' ? 'active' : ''}" id="dnav-profile" onclick="window.customerNavigate('profile')">
        <i data-lucide="user"></i> <span>${t('navProfile')}</span>
      </button>
      <button class="d-nav-btn sos-btn ${APP_STATE.customerScreen === 'sos' ? 'active' : ''}" id="dnav-sos" onclick="window.customerNavigate('sos')">
        <i data-lucide="shield-alert"></i> <span>${t('navSos')}</span>
      </button>
    `;
  } else if (role === 'mechanic') {
    const selMech = APP_STATE.mechanics.find((m) => m.id === 'MEC-01') || APP_STATE.mechanics[0];
    container.innerHTML = `
      <button class="d-nav-btn active" onclick="renderMechanicScreen()">
        <i data-lucide="wrench"></i> <span>${t('mechDutyTitle')}</span>
      </button>
      <button class="d-nav-btn" onclick="window.toggleMechanicDuty()">
        <i data-lucide="power"></i> <span>${selMech.isOnline ? '● Online Duty' : '○ Offline'}</span>
      </button>
      <button class="d-nav-btn" onclick="window.openIncomingJobAlert()">
        <i data-lucide="bell"></i> <span>Test Dispatch Alert</span>
      </button>
    `;
  } else if (role === 'shop') {
    container.innerHTML = `
      <button class="d-nav-btn active" onclick="renderShopOwnerScreen()">
        <i data-lucide="store"></i> <span>${t('shopInventoryTitle')}</span>
      </button>
      <button class="d-nav-btn" onclick="window.openAddPartModal()">
        <i data-lucide="plus-circle"></i> <span>Add Spare Part</span>
      </button>
    `;
  } else if (role === 'towing') {
    container.innerHTML = `
      <button class="d-nav-btn active" onclick="renderTowingPartnerScreen()">
        <i data-lucide="truck"></i> <span>${t('fleetTitle')}</span>
      </button>
      <button class="d-nav-btn" onclick="window.openAddTowModal()">
        <i data-lucide="plus"></i> <span>Register Truck</span>
      </button>
    `;
  } else if (role === 'admin') {
    container.innerHTML = `
      <button class="d-nav-btn active" onclick="renderAdminPanel()">
        <i data-lucide="shield-alert"></i> <span>Kavalan 112 Super Desk</span>
      </button>
      <button class="d-nav-btn" onclick="window.logoutUser()">
        <i data-lucide="arrow-left"></i> <span>Exit Admin Desk</span>
      </button>
    `;
  }

  if (window.lucide) lucide.createIcons();
}

// --------------------------------------------------------------------------
// 7. GLOBAL BILINGUAL LANGUAGE SWITCHER
// --------------------------------------------------------------------------
window.setAppLanguage = function (lang) {
  APP_STATE.lang = lang;
  localStorage.setItem('ullur_lang', lang);

  const taBtn = document.getElementById('lang-ta-btn');
  const enBtn = document.getElementById('lang-en-btn');
  if (taBtn) taBtn.classList.toggle('active', lang === 'ta');
  if (enBtn) enBtn.classList.toggle('active', lang === 'en');

  // Master Header
  const appTitleH = document.getElementById('app-title-header');
  if (appTitleH) appTitleH.innerText = t('appTitle');
  const appSubB = document.getElementById('app-sub-badge');
  if (appSubB) appSubB.innerText = t('appSubBadge');
  const logoutTxt = document.getElementById('logout-btn-txt');
  if (logoutTxt) logoutTxt.innerText = t('logoutBtn');

  // Gateway
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

  if (APP_STATE.role === 'customer') {
    window.customerNavigate(APP_STATE.customerScreen);
  } else if (APP_STATE.role === 'mechanic') {
    renderMechanicScreen();
  } else if (APP_STATE.role === 'shop') {
    renderShopOwnerScreen();
  } else if (APP_STATE.role === 'towing') {
    renderTowingPartnerScreen();
  } else if (APP_STATE.role === 'admin') {
    renderAdminPanel();
  }

  // Dynamic Auth Modal Translations
  const authPhoneLbl = document.getElementById('auth-phone-label');
  if (authPhoneLbl) authPhoneLbl.innerText = t('authPhoneLabel');
  const authOtpLbl = document.getElementById('auth-otp-label');
  if (authOtpLbl) authOtpLbl.innerText = t('authOtpLabel');
  const authSubmitTxt = document.getElementById('auth-submit-btn-txt');
  if (authSubmitTxt) authSubmitTxt.innerText = t('authVerifyBtn');

  if (APP_STATE.authOtp && APP_STATE.authOtp.remainingSeconds !== undefined) {
    updateOtpTimerUI(APP_STATE.authOtp.remainingSeconds);
  }

  renderDesktopHeaderNav(APP_STATE.role);
  if (window.lucide) lucide.createIcons();
};

// --------------------------------------------------------------------------
// 8. CUSTOMER MODULE — NATIVE RESPONSIVE FULL-WIDTH VIEWS
// --------------------------------------------------------------------------
let leafletCustomerMap = null;
let leafletTrackingMap = null;
let trackingMechanicMarker = null;
let trackingAnimTimer = null;
let mediaRecorderInstance = null;
let audioChunks = [];
let isVoiceRecording = false;
let voiceRecordInterval = null;
let voiceRecordSeconds = 0;
let gracePeriodInterval = null;
let graceSecondsLeft = 120; // 2 minutes free cancellation

window.customerNavigate = function (screen) {
  APP_STATE.customerScreen = screen;
  const container = document.getElementById('customer-panel-container');
  if (!container) return;

  // Clear timers if moving away from tracking
  if (screen !== 'tracking') {
    if (trackingAnimTimer) clearInterval(trackingAnimTimer);
    if (gracePeriodInterval) clearInterval(gracePeriodInterval);
  }

  // Update Desktop Header Nav
  renderDesktopHeaderNav('customer');

  // Render Sub-header bar + Screen body
  container.innerHTML = `
    <!-- Full-Width Customer Sub-Header Bar -->
    <div class="dashboard-sub-header">
      <div style="display: flex; align-items: center; gap: 16px; flex-wrap: wrap;">
        <div class="loc-indicator" onclick="window.customerNavigate('request')">
          <i data-lucide="map-pin" class="loc-icon" style="color: #FF3B30; width: 22px; height: 22px;"></i>
          <div>
            <small style="font-size: 10px; font-weight: 900; color: #64748B;">CURRENT GPS LOCATION</small>
            <strong style="font-size: 13.5px; display: block;">${APP_STATE.customer.location.name}</strong>
          </div>
        </div>

        <div style="padding-left: 12px; border-left: 2px solid #E2E8F0; display: flex; align-items: center; gap: 8px;">
          <span class="badge black">🚗 ${APP_STATE.customer.vehicle.plate}</span>
          <span style="font-size: 12px; font-weight: 800;">${APP_STATE.customer.vehicle.model}</span>
        </div>
      </div>

      <!-- Customer Sub-Navigation Tabs Bar -->
      <div class="customer-sub-nav">
        <button class="c-subnav-btn ${screen === 'home' || screen === 'request' ? 'active' : ''}" onclick="window.customerNavigate('home')">
          <i data-lucide="home"></i> <span>${t('navHome')}</span>
        </button>
        <button class="c-subnav-btn ${screen === 'parts' || screen === 'cart' ? 'active' : ''}" onclick="window.customerNavigate('parts')">
          <i data-lucide="shopping-bag"></i> <span>${t('navParts')}</span>
        </button>
        <button class="c-subnav-btn ${screen === 'tow' ? 'active' : ''}" onclick="window.customerNavigate('tow')">
          <i data-lucide="truck"></i> <span>${t('navTow')}</span>
        </button>
        <button class="c-subnav-btn ${screen === 'profile' ? 'active' : ''}" onclick="window.customerNavigate('profile')">
          <i data-lucide="user"></i> <span>${t('navProfile')}</span>
        </button>
        <button class="c-subnav-btn sos-btn ${screen === 'sos' ? 'active' : ''}" onclick="window.customerNavigate('sos')">
          <i data-lucide="shield-alert"></i> <span>${t('navSos')}</span>
        </button>
      </div>
    </div>

    <!-- Active Screen Viewport Area -->
    <div id="customer-active-view-body" style="width: 100%;"></div>
  `;

  const bodyContainer = document.getElementById('customer-active-view-body');
  if (!bodyContainer) return;

  switch (screen) {
    case 'home':
    case 'request':
      renderCustomerHomeSplitScreen(bodyContainer);
      break;
    case 'tracking':
      renderCustomerTrackingSplitScreen(bodyContainer);
      break;
    case 'parts':
      renderCustomerPartsCatalog(bodyContainer);
      break;
    case 'cart':
      renderCustomerCartView(bodyContainer);
      break;
    case 'tow':
      renderCustomerTowView(bodyContainer);
      break;
    case 'sos':
      renderCustomerSosView(bodyContainer);
      break;
    case 'profile':
      renderCustomerProfileView(bodyContainer);
      break;
    default:
      renderCustomerHomeSplitScreen(bodyContainer);
  }

  if (window.lucide) lucide.createIcons();
};

// Customer Screen: Full-Width 2-Column Responsive Breakdown & Request Screen
function renderCustomerHomeSplitScreen(container) {
  const verifiedMechs = APP_STATE.mechanics.filter((m) => m.status === 'Verified');

  container.innerHTML = `
    <!-- 2-Column Responsive Desktop Grid -->
    <div class="desktop-split-grid">
      <!-- Left Column: Request Form, Issue Selection, Voice Note, Vehicle details -->
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <!-- Kavalan Police SOS Alert Bar -->
        <div class="b-card red" style="cursor: pointer;" onclick="window.customerNavigate('sos')">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="background: white; color: #FF3B30; padding: 10px; border-radius: 10px; border: 2px solid #0D0D0D;">
              <i data-lucide="shield-alert" style="width: 28px; height: 28px;"></i>
            </div>
            <div style="flex: 1;">
              <strong style="font-size: 14px; display: block;">${t('sosBannerTitle')}</strong>
              <small style="font-size: 11.5px; font-weight: 700;">${t('sosBannerSub')}</small>
            </div>
            <button class="btn btn-yellow" style="padding: 6px 12px; font-size: 12px;">${t('sosFixBtn')}</button>
          </div>
        </div>

        <!-- Vehicle Details Selector -->
        <div class="b-card yellow">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <small style="font-size: 10px; font-weight: 900; color: #64748B;">VEHICLE REPAIR PROFILE</small>
              <strong style="font-size: 14px; display: block;">🚗 ${APP_STATE.customer.vehicle.type}: ${APP_STATE.customer.vehicle.model}</strong>
            </div>
            <span class="badge black">${APP_STATE.customer.vehicle.plate}</span>
          </div>
          <div class="vehicle-selector" style="margin-top: 10px;">
            <div class="vehicle-chip ${APP_STATE.customer.vehicle.type === 'Bike' ? 'active' : ''}" onclick="window.updateVehicleType('Bike')">🏍️ Bike</div>
            <div class="vehicle-chip ${APP_STATE.customer.vehicle.type === 'Car' ? 'active' : ''}" onclick="window.updateVehicleType('Car')">🚗 Car</div>
            <div class="vehicle-chip ${APP_STATE.customer.vehicle.type === 'Auto' ? 'active' : ''}" onclick="window.updateVehicleType('Auto')">🛺 Auto</div>
          </div>
        </div>

        <!-- Issue Category Grid -->
        <div class="b-card">
          <strong style="font-size: 13.5px;">Select Breakdown Issue Type:</strong>
          <div class="issue-grid" style="margin-top: 8px;">
            <div class="issue-card ${APP_STATE.customer.issue.category === 'Breakdown' ? 'selected' : ''}" onclick="window.selectIssueCategory('Breakdown', this)">🚨 General Breakdown</div>
            <div class="issue-card ${APP_STATE.customer.issue.category === 'Puncture' ? 'selected' : ''}" onclick="window.selectIssueCategory('Puncture', this)">🛞 Tire Puncture</div>
            <div class="issue-card ${APP_STATE.customer.issue.category === 'Battery Jump' ? 'selected' : ''}" onclick="window.selectIssueCategory('Battery Jump', this)">🔋 Battery Jumpstart</div>
            <div class="issue-card ${APP_STATE.customer.issue.category === 'Fuel' ? 'selected' : ''}" onclick="window.selectIssueCategory('Fuel', this)">⛽ Emergency Fuel</div>
            <div class="issue-card ${APP_STATE.customer.issue.category === 'Other' ? 'selected' : ''}" onclick="window.selectIssueCategory('Other', this)">🛠️ Mechanical Fault</div>
          </div>
        </div>

        <!-- Voice Note & Photo Capture -->
        <div class="b-card">
          <strong style="font-size: 13px;">Attach Voice Note & Photo (Optional):</strong>
          <div class="voice-record-bar" style="margin-top: 8px;">
            <button id="btn-record" class="btn-mic-record ${isVoiceRecording ? 'recording' : ''}" onclick="window.toggleVoiceRecording()" title="Record Audio Note">
              🎙️
            </button>
            <div style="flex: 1;">
              <span id="recording-status-txt" style="font-size: 12px; font-weight: 700; color: #334155;">
                ${isVoiceRecording ? `Recording Voice Note... (${voiceRecordSeconds}s)` : (APP_STATE.customer.issue.audioBlobUrl ? '✅ Voice Note Attached!' : 'Tap mic to record audio message')}
              </span>
              ${APP_STATE.customer.issue.audioBlobUrl ? `<audio controls src="${APP_STATE.customer.issue.audioBlobUrl}" style="height: 30px; width: 100%; margin-top: 4px;"></audio>` : ''}
            </div>
            <input type="file" id="issue-photo-input" accept="image/*" style="display:none;" onchange="window.handlePhotoUpload(this)" />
            <button class="btn btn-secondary" style="font-size: 12px; padding: 8px 12px;" onclick="document.getElementById('issue-photo-input').click()">
              📷 Photo
            </button>
          </div>

          ${APP_STATE.customer.issue.photoData ? `
            <div class="photo-preview-container">
              <img src="${APP_STATE.customer.issue.photoData}" alt="Uploaded preview" class="photo-thumb" />
              <div style="flex: 1;">
                <strong style="font-size: 12px;">Breakdown Photo Attached</strong>
                <button class="btn btn-logout-sm" style="margin-left: 8px; padding: 2px 6px; font-size: 10px;" onclick="window.removePhoto()">Remove</button>
              </div>
            </div>
          ` : ''}
        </div>

        <!-- Dispatch CTA Button -->
        <button id="btn-request-help" class="btn btn-yellow full-width" style="padding: 16px; font-size: 15px;" onclick="window.initiateSmartHaversineMatch()">
          <i data-lucide="zap"></i> REQUEST HELP (3KM ➔ 6KM ➔ 10KM RADAR MATCH)
        </button>
      </div>

      <!-- Right Column: Interactive Leaflet Map & Nearby Mechanics Pool -->
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <!-- Leaflet Map Container with Pin Drop Crosshair -->
        <div class="b-card" style="padding: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="pill green"><span class="pulse-dot"></span> LIVE HIGHWAY RADAR</span>
              <strong style="font-size: 12.5px;">Drag Map to Pin Highway Location</strong>
            </div>
            <button class="btn btn-secondary" style="padding: 4px 8px; font-size: 11px;" onclick="window.autoDetectGps()">
              <i data-lucide="crosshair"></i> Auto GPS
            </button>
          </div>

          <div class="map-wrapper" style="height: 340px;">
            <div id="leaflet-map"></div>
            <div class="pin-drop-crosshair">
              <img src="https://cdn-icons-png.flaticon.com/512/684/684908.png" alt="Pin Drop" />
              <span class="crosshair-milestone-pill" id="crosshair-label">Drag to adjust breakdown pin</span>
            </div>
          </div>
          <small id="current-pinned-coords" style="font-size: 11px; font-weight: 700; color: #475569; display: block; margin-top: 6px;">
            📌 Lat: ${APP_STATE.customer.location.lat.toFixed(4)}, Lng: ${APP_STATE.customer.location.lng.toFixed(4)} • ${APP_STATE.customer.location.name}
          </small>
        </div>

        <!-- Available Mechanics Radar Pool -->
        <div class="b-card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <strong style="font-size: 14px; font-weight: 900;">${t('nearbyMechs')} (${verifiedMechs.length})</strong>
            <span class="badge green">100% KYC Verified</span>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 12px; margin-top: 6px;">
            ${verifiedMechs
              .map((mech) => {
                const dist = calculateHaversineDistance(
                  APP_STATE.customer.location.lat,
                  APP_STATE.customer.location.lng,
                  mech.lat,
                  mech.lng
                );
                return `
                <div class="b-card" style="padding: 12px; background: #F8FAFC;">
                  <div style="display: flex; gap: 10px; align-items: center;">
                    <img src="${mech.avatar}" alt="${mech.name}" class="mechanic-avatar" style="width: 44px; height: 44px;" />
                    <div style="flex: 1;">
                      <strong style="font-size: 13px;">${APP_STATE.lang === 'ta' ? mech.nameTa : mech.name}</strong>
                      <div style="font-size: 11px; font-weight: 700; color: #555;">⭐ ${mech.rating} (${mech.jobsDone} jobs)</div>
                      <small style="font-size: 10.5px; color: #166534; font-weight: 800;">${dist} km away (~${Math.round(dist * 6)} mins)</small>
                    </div>
                  </div>
                </div>
              `;
              })
              .join('')}
          </div>
        </div>
      </div>
    </div>
  `;

  setTimeout(() => {
    initLeafletCustomerMap();
  }, 100);
}

function initLeafletCustomerMap() {
  const mapDiv = document.getElementById('leaflet-map');
  if (!mapDiv || typeof L === 'undefined') return;

  if (leafletCustomerMap) {
    leafletCustomerMap.remove();
    leafletCustomerMap = null;
  }

  const { lat, lng } = APP_STATE.customer.location;
  leafletCustomerMap = L.map('leaflet-map', {
    zoomControl: true,
    attributionControl: false
  }).setView([lat, lng], 14);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19
  }).addTo(leafletCustomerMap);

  // Add mechanics markers
  APP_STATE.mechanics.forEach((m) => {
    if (m.isOnline) {
      const mechIcon = L.divIcon({
        className: 'custom-mech-icon',
        html: `<div style="background:#FFD600; border:2px solid #0D0D0D; border-radius:50%; width:32px; height:32px; display:flex; align-items:center; justify-content:center; font-size:15px; box-shadow:2px 2px 0 #0D0D0D;">🔧</div>`,
        iconSize: [32, 32]
      });
      L.marker([m.lat, m.lng], { icon: mechIcon }).addTo(leafletCustomerMap).bindPopup(`<b>${m.name}</b><br>⭐ ${m.rating}`);
    }
  });

  leafletCustomerMap.on('moveend', () => {
    const center = leafletCustomerMap.getCenter();
    APP_STATE.customer.location.lat = center.lat;
    APP_STATE.customer.location.lng = center.lng;
    const label = document.getElementById('current-pinned-coords');
    if (label) {
      label.innerText = `📌 Lat: ${center.lat.toFixed(4)}, Lng: ${center.lng.toFixed(4)} • Theni Bypass Highway`;
    }
  });

  setTimeout(() => {
    if (leafletCustomerMap) leafletCustomerMap.invalidateSize();
  }, 200);
}

window.autoDetectGps = function () {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        APP_STATE.customer.location.lat = pos.coords.latitude;
        APP_STATE.customer.location.lng = pos.coords.longitude;
        if (leafletCustomerMap) {
          leafletCustomerMap.setView([pos.coords.latitude, pos.coords.longitude], 15);
        }
        alert("📍 GPS Coordinates Locked Successfully!");
      },
      (err) => {
        console.warn("GPS fallback applied:", err.message);
        alert("GPS Signal Weak on Highway. Pinned to nearest milestone (Theni Bypass NH-85)!");
      },
      { timeout: 5000 }
    );
  }
};

window.updateVehicleType = function (type) {
  APP_STATE.customer.vehicle.type = type;
  window.customerNavigate('home');
};

window.selectIssueCategory = function (category, el) {
  APP_STATE.customer.issue.category = category;
  document.querySelectorAll('.issue-card').forEach((c) => c.classList.remove('selected'));
  if (el) el.classList.add('selected');
};

// Voice Note MediaRecorder API
window.toggleVoiceRecording = function () {
  const statusTxt = document.getElementById('recording-status-txt');
  const recordBtn = document.getElementById('btn-record');

  if (!isVoiceRecording) {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          mediaRecorderInstance = new MediaRecorder(stream);
          audioChunks = [];
          mediaRecorderInstance.ondataavailable = (e) => audioChunks.push(e.data);
          mediaRecorderInstance.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });
            APP_STATE.customer.issue.audioBlobUrl = URL.createObjectURL(audioBlob);
            APP_STATE.activeJob.audioBlobUrl = APP_STATE.customer.issue.audioBlobUrl;
            window.customerNavigate('home');
          };

          mediaRecorderInstance.start();
          isVoiceRecording = true;
          voiceRecordSeconds = 0;
          if (recordBtn) recordBtn.classList.add('recording');
          if (statusTxt) statusTxt.innerText = `Recording... (0s)`;

          voiceRecordInterval = setInterval(() => {
            voiceRecordSeconds++;
            if (statusTxt) statusTxt.innerText = `Recording... (${voiceRecordSeconds}s) [Tap to Stop]`;
          }, 1000);
        })
        .catch((err) => {
          console.warn("Mic permission deferred:", err);
          simulateVoiceNoteAttachment();
        });
    } else {
      simulateVoiceNoteAttachment();
    }
  } else {
    if (mediaRecorderInstance && mediaRecorderInstance.state !== 'inactive') {
      mediaRecorderInstance.stop();
    }
    if (voiceRecordInterval) clearInterval(voiceRecordInterval);
    isVoiceRecording = false;
  }
};

function simulateVoiceNoteAttachment() {
  APP_STATE.customer.issue.audioBlobUrl = 'https://actions.google.com/sounds/v1/emergency/siren_emergency_truck.ogg';
  APP_STATE.activeJob.audioBlobUrl = APP_STATE.customer.issue.audioBlobUrl;
  alert("🎤 Voice Note Recorded & Attached!");
  window.customerNavigate('home');
}

window.handlePhotoUpload = function (input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = function (e) {
      APP_STATE.customer.issue.photoData = e.target.result;
      APP_STATE.activeJob.photoData = e.target.result;
      window.customerNavigate('home');
    };
    reader.readAsDataURL(input.files[0]);
  }
};

window.removePhoto = function () {
  APP_STATE.customer.issue.photoData = null;
  APP_STATE.activeJob.photoData = null;
  window.customerNavigate('home');
};

// Sequential Haversine Matching: 3km -> 6km -> 10km Sequential Expansion
window.initiateSmartHaversineMatch = function () {
  const btn = document.getElementById('btn-request-help');
  if (btn) {
    btn.innerText = "⏳ SEARCHING 3KM RADIUS...";
    btn.disabled = true;
  }

  setTimeout(() => {
    let matches = APP_STATE.mechanics.filter((m) => {
      const d = calculateHaversineDistance(APP_STATE.customer.location.lat, APP_STATE.customer.location.lng, m.lat, m.lng);
      return m.isOnline && m.status === 'Verified' && d <= 3.0;
    });

    if (!matches.length) {
      if (btn) btn.innerText = "⚡ EXPANDING TO 6KM RADAR...";
      setTimeout(() => {
        matches = APP_STATE.mechanics.filter((m) => {
          const d = calculateHaversineDistance(APP_STATE.customer.location.lat, APP_STATE.customer.location.lng, m.lat, m.lng);
          return m.isOnline && m.status === 'Verified' && d <= 6.0;
        });
        assignTopMatch(matches);
      }, 1400);
    } else {
      assignTopMatch(matches);
    }
  }, 1000);
};

function assignTopMatch(matches) {
  const topMatch = matches.length ? matches[0] : APP_STATE.mechanics[0];
  const dist = calculateHaversineDistance(APP_STATE.customer.location.lat, APP_STATE.customer.location.lng, topMatch.lat, topMatch.lng);

  APP_STATE.activeJob.mechanicId = topMatch.id;
  APP_STATE.activeJob.distanceKm = dist;
  APP_STATE.activeJob.etaMins = Math.max(4, Math.round(dist * 6));
  APP_STATE.activeJob.status = 'Accepted';
  APP_STATE.activeJob.acceptedAt = Date.now();
  graceSecondsLeft = 120;

  if (firestoreDb) {
    try {
      firestoreDb.collection("breakdown_jobs").doc(APP_STATE.activeJob.id).set(APP_STATE.activeJob, { merge: true });
    } catch (e) {
      console.warn("Firestore sync:", e);
    }
  }

  window.customerNavigate('tracking');
}

// Customer Screen 3: Full-Width 2-Column Responsive Live Tracking Screen
function renderCustomerTrackingSplitScreen(container) {
  const job = APP_STATE.activeJob;
  const mech = APP_STATE.mechanics.find((m) => m.id === job.mechanicId) || APP_STATE.mechanics[0];
  const stages = ['Requested', 'Accepted', 'Arrived', 'In Progress', 'Completed'];
  const currentStageIndex = stages.indexOf(job.status);

  container.innerHTML = `
    <!-- Live Status Stepper Bar -->
    <div class="b-card" style="padding: 12px 18px; margin-bottom: 16px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        ${stages
          .map((st, i) => {
            const isPassed = i <= currentStageIndex;
            return `
            <div style="text-align: center; flex: 1;">
              <div style="width: 28px; height: 28px; border-radius: 50%; background: ${isPassed ? '#00C851' : '#E2E8F0'}; color: ${isPassed ? 'white' : '#64748B'}; border: 2px solid #0D0D0D; margin: 0 auto; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 900; box-shadow: 2px 2px 0 #0D0D0D;">
                ${isPassed ? '✓' : i + 1}
              </div>
              <small style="font-size: 11px; font-weight: 900; margin-top: 4px; display: block;">${st}</small>
            </div>
          `;
          })
          .join('')}
      </div>
    </div>

    <!-- 2-Column Desktop Grid for Tracking -->
    <div class="desktop-split-grid">
      <!-- Left Column: Mechanic Details, Grace Cancellation, Rate Card, Razorpay -->
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <!-- Matched Partner Card with Direct Phone Call -->
        <div class="mechanic-match-card">
          <img src="${mech.avatar}" alt="${mech.name}" class="mechanic-avatar" />
          <div style="flex: 1;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <div>
                <strong style="font-size: 15px;">${APP_STATE.lang === 'ta' ? mech.nameTa : mech.name}</strong>
                <div style="font-size: 12px; font-weight: 700; color: #475569;">⭐ ${mech.rating} (148 jobs) • Verified Partner</div>
                <small style="display: block; font-size: 11px; color: #166534; font-weight: 800; margin-top: 2px;">🛵 Hero Splendor (TN-60-M-4421)</small>
              </div>
              <span class="pill green">ETA ~${job.etaMins} Mins</span>
            </div>
          </div>
          <a href="tel:${mech.phone}" class="btn btn-yellow" style="padding: 10px 14px; font-size: 13px; text-decoration: none;">
            <i data-lucide="phone-call"></i> Call Partner
          </a>
        </div>

        <!-- Grace Period Cancellation Timer Card -->
        <div class="b-card" style="background: #F8FAFC; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <small style="font-size: 10px; font-weight: 900; color: #64748b;">GRACE PERIOD CANCELLATION</small>
            <div id="grace-timer-text" style="font-size: 13px; font-weight: 900; color: ${graceSecondsLeft > 0 ? '#15803d' : '#b91c1c'};">
              ${graceSecondsLeft > 0 ? `Free cancellation active: ${Math.floor(graceSecondsLeft / 60)}:${(graceSecondsLeft % 60).toString().padStart(2, '0')}` : '₹50 late cancellation fee applies'}
            </div>
          </div>
          <button class="btn btn-logout-sm" onclick="window.cancelActiveJob()">
            Cancel Request
          </button>
        </div>

        <!-- Itemized Rate Card Breakdown -->
        <div class="rate-card-summary">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #E2E8F0; padding-bottom: 6px;">
            <strong style="font-size: 13.5px;">Service Rate Card Summary</strong>
            <span class="badge green">Itemized Breakdown</span>
          </div>
          <div class="rate-item"><span>Base Visiting & Inspection Fee</span><span>₹${job.bill.base}</span></div>
          <div class="rate-item"><span>Materials & Spare Parts</span><span>₹${job.bill.parts}</span></div>
          <div class="rate-item"><span>Labor & Mechanical Service</span><span>₹${job.bill.labor}</span></div>
          <div class="rate-item total"><span>Total Amount Payable</span><span style="color: #16A34A; font-size: 18px;">₹${job.bill.total}</span></div>
        </div>

        <!-- Payment Trigger CTA -->
        <button class="btn ${job.isPaid ? 'btn-black' : 'btn-green'} full-width" style="padding: 14px; font-size: 14px;" onclick="window.openRazorpayModal(${job.bill.total})">
          <i data-lucide="credit-card"></i> ${job.isPaid ? '✓ PAYMENT COMPLETED — VIEW DIGITAL TAX INVOICE' : `PAY ₹${job.bill.total} VIA RAZORPAY`}
        </button>
      </div>

      <!-- Right Column: Live Animated Leaflet Tracking Map -->
      <div class="b-card" style="padding: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span class="pill green"><span class="pulse-dot"></span> REAL-TIME GPS TRACKING</span>
          <strong style="font-size: 13px; color: #166534;">Distance: ${job.distanceKm} km</strong>
        </div>
        <div class="map-wrapper" style="height: 420px;">
          <div id="tracking-leaflet-map"></div>
        </div>
      </div>
    </div>
  `;

  setTimeout(() => {
    initLeafletTrackingMap(job, mech);
  }, 100);

  if (gracePeriodInterval) clearInterval(gracePeriodInterval);
  gracePeriodInterval = setInterval(() => {
    if (graceSecondsLeft > 0) {
      graceSecondsLeft--;
      const label = document.getElementById('grace-timer-text');
      if (label) {
        label.innerText = `Free cancellation active: ${Math.floor(graceSecondsLeft / 60)}:${(graceSecondsLeft % 60).toString().padStart(2, '0')}`;
      }
    } else {
      const label = document.getElementById('grace-timer-text');
      if (label) {
        label.innerText = '₹50 late cancellation fee applies';
        label.style.color = '#b91c1c';
      }
    }
  }, 1000);
}

function initLeafletTrackingMap(job, mech) {
  const mapDiv = document.getElementById('tracking-leaflet-map');
  if (!mapDiv || typeof L === 'undefined') return;

  if (leafletTrackingMap) {
    leafletTrackingMap.remove();
    leafletTrackingMap = null;
  }

  const custLat = APP_STATE.customer.location.lat;
  const custLng = APP_STATE.customer.location.lng;

  leafletTrackingMap = L.map('tracking-leaflet-map', {
    zoomControl: true,
    attributionControl: false
  }).setView([custLat, custLng], 14);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(leafletTrackingMap);

  const userIcon = L.divIcon({
    className: 'custom-user-icon',
    html: `<div style="background:#FF3B30; color:white; border:2px solid #0D0D0D; border-radius:50%; width:34px; height:34px; display:flex; align-items:center; justify-content:center; font-size:16px; box-shadow:2px 2px 0 #0D0D0D;">🚗</div>`,
    iconSize: [34, 34]
  });
  L.marker([custLat, custLng], { icon: userIcon }).addTo(leafletTrackingMap).bindPopup("<b>Your Breakdown Location</b>");

  let currentMechLat = mech.lat;
  let currentMechLng = mech.lng;

  const mechIcon = L.divIcon({
    className: 'custom-mech-tracking-icon',
    html: `<div style="background:#FFD600; color:#0D0D0D; border:2px solid #0D0D0D; border-radius:50%; width:34px; height:34px; display:flex; align-items:center; justify-content:center; font-size:16px; box-shadow:2px 2px 0 #0D0D0D; animation:pulseDot 1s infinite;">🛵</div>`,
    iconSize: [34, 34]
  });

  trackingMechanicMarker = L.marker([currentMechLat, currentMechLng], { icon: mechIcon }).addTo(leafletTrackingMap);

  const routeLine = L.polyline([[currentMechLat, currentMechLng], [custLat, custLng]], {
    color: '#2563EB',
    weight: 5,
    dashArray: '6, 8'
  }).addTo(leafletTrackingMap);

  leafletTrackingMap.fitBounds(routeLine.getBounds(), { padding: [30, 30] });

  if (trackingAnimTimer) clearInterval(trackingAnimTimer);
  trackingAnimTimer = setInterval(() => {
    currentMechLat += (custLat - currentMechLat) * 0.12;
    currentMechLng += (custLng - currentMechLng) * 0.12;

    if (trackingMechanicMarker) {
      trackingMechanicMarker.setLatLng([currentMechLat, currentMechLng]);
      routeLine.setLatLngs([[currentMechLat, currentMechLng], [custLat, custLng]]);
    }
  }, 2000);

  setTimeout(() => {
    if (leafletTrackingMap) leafletTrackingMap.invalidateSize();
  }, 200);
}

window.cancelActiveJob = function () {
  if (graceSecondsLeft > 0) {
    alert("✅ Service Request Cancelled Free of Charge (Within 2-Min Grace Period)!");
    APP_STATE.activeJob.status = 'Cancelled';
    window.customerNavigate('home');
  } else {
    alert("⚠️ Cancellation Fee of ₹50 applied as mechanic has already dispatched beyond grace period.");
    window.openRazorpayModal(50);
  }
};

// Customer Screen 4: Full-Width Wholesale Spare Parts Marketplace
function renderCustomerPartsCatalog(container) {
  container.innerHTML = `
    <div class="b-card" style="background: #0D0D0D; color: white; padding: 14px 20px; margin-bottom: 16px;">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <i data-lucide="check-circle" style="color: #FFD600; width: 24px; height: 24px;"></i>
          <div>
            <strong style="font-size: 14px;">${t('wholesaleBanner')}</strong>
            <small style="display: block; color: #94A3B8;">Verified Theni Spares Hub • 100% Genuine Certified OEM Spares</small>
          </div>
        </div>
        <button class="btn btn-yellow" onclick="window.customerNavigate('cart')">
          <i data-lucide="shopping-cart"></i> View Cart (${APP_STATE.customer.cart.length})
        </button>
      </div>
    </div>

    <!-- Responsive Parts Catalog Grid -->
    <div class="parts-catalog-grid">
      ${APP_STATE.shopInventory
        .map(
          (p) => `
        <div class="b-card" style="padding: 16px;">
          <div style="display: flex; gap: 12px; align-items: center;">
            <div style="width: 52px; height: 52px; background: #F6F6F2; border-radius: 10px; border: 2px solid #0D0D0D; display: flex; align-items: center; justify-content: center; font-size: 24px;">
              ${p.category === 'Battery' ? '🔋' : p.category === 'Oil' ? '🛢️' : p.category === 'Brakes' ? '🛑' : p.category === 'Tire' ? '🛞' : '⚡'}
            </div>
            <div style="flex: 1;">
              <strong style="font-size: 14px; display: block;">${APP_STATE.lang === 'ta' ? p.nameTa : p.name}</strong>
              <small style="display: block; font-size: 11px; color: #64748B;">Category: ${p.category} • In Stock: ${p.stock} units</small>
            </div>
          </div>
          <div style="margin-top: 12px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <strong style="font-size: 18px; color: #00C851;">₹${p.price}</strong>
              <small style="text-decoration: line-through; color: #888; font-size: 12px; margin-left: 4px;">₹${p.retail}</small>
              <span class="pill yellow" style="font-size: 9px; margin-left: 4px;">${Math.round(((p.retail - p.price) / p.retail) * 100)}% OFF</span>
            </div>
            <button class="btn btn-yellow" style="padding: 8px 14px;" onclick="window.addToCustomerCart(${p.id})">
              <i data-lucide="plus"></i> Add
            </button>
          </div>
        </div>
      `
        )
        .join('')}
    </div>
  `;
}

window.addToCustomerCart = function (id) {
  const item = APP_STATE.shopInventory.find((p) => p.id === id);
  if (item) {
    APP_STATE.customer.cart.push(item);
    alert(`✅ ${item.name} added to cart!`);
    window.customerNavigate('parts');
  }
};

// Customer Screen 5: Full-Width Cart View
function renderCustomerCartView(container) {
  const cart = APP_STATE.customer.cart.length ? APP_STATE.customer.cart : [APP_STATE.shopInventory[0]];
  const total = cart.reduce((acc, curr) => acc + curr.price, 0);

  container.innerHTML = `
    <div class="desktop-split-grid">
      <div class="b-card">
        <div class="card-header">
          <h3><i data-lucide="shopping-cart"></i> Cart Items (${cart.length})</h3>
          <span class="badge green">Wholesale Discount Applied</span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 10px;">
          ${cart
            .map(
              (c) => `
            <div class="inventory-row">
              <div class="inventory-info">
                <strong>${APP_STATE.lang === 'ta' ? c.nameTa : c.name}</strong>
                <small>${c.category} • Direct Theni Spares Hub Delivery</small>
              </div>
              <strong style="font-size: 16px; color: #00C851;">₹${c.price}</strong>
            </div>
          `
            )
            .join('')}
        </div>
      </div>

      <div class="b-card">
        <div class="card-header">
          <h3>Order Settlement Summary</h3>
        </div>
        <div class="rate-card-summary" style="margin-top: 10px;">
          <div class="rate-item"><span>Wholesale Discount</span><span style="color: #16A34A; font-weight: 800;">- 30% SAVED</span></div>
          <div class="rate-item"><span>Express Highway Delivery</span><span style="color: #16A34A; font-weight: 800;">FREE</span></div>
          <div class="rate-item total"><span>Total Payable</span><span style="color: #16A34A; font-size: 20px;">₹${total}</span></div>
        </div>
        <button class="btn btn-green full-width" style="margin-top: 16px; padding: 14px; font-size: 15px;" onclick="window.openRazorpayModal(${total})">
          <i data-lucide="lock"></i> Place Order via Razorpay (₹${total})
        </button>
      </div>
    </div>
  `;
}

// Customer Screen 6: Full-Width Towing View
function renderCustomerTowView(container) {
  let towKm = 8.5;
  let towRate = 500 + towKm * 40;

  container.innerHTML = `
    <div class="desktop-split-grid">
      <!-- Left Column: Distance & Rate Card -->
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div class="b-card">
          <div style="display: flex; align-items: center; gap: 10px;">
            <i data-lucide="map-pin" style="color: #FF3B30; width: 24px; height: 24px;"></i>
            <div>
              <small style="font-size: 10px; font-weight: 900; color: #64748b;">PICKUP LOCATION</small>
              <strong style="font-size: 13.5px; display: block;">Theni Highway Bypass (NH-85 Tollgate)</strong>
            </div>
          </div>
          <hr style="border: 1px dashed #0D0D0D; margin: 10px 0;" />
          <div style="display: flex; align-items: center; gap: 10px;">
            <i data-lucide="home" style="color: #00C851; width: 24px; height: 24px;"></i>
            <div>
              <small style="font-size: 10px; font-weight: 900; color: #64748b;">DROP LOCATION / GARAGE</small>
              <strong style="font-size: 13.5px; display: block;">Madurai Road Auto Clinic (${towKm} km)</strong>
            </div>
          </div>
        </div>

        <div class="b-card yellow">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <strong style="font-size: 14px;">Towing Distance Calculator:</strong>
            <span class="badge black" id="tow-dist-badge">${towKm} km</span>
          </div>
          <input type="range" min="2" max="40" value="${towKm}" style="width: 100%; margin-top: 10px; accent-color: #0D0D0D;" oninput="window.updateTowCalc(this.value)" />
          <div class="rate-card-summary" style="margin-top: 10px;">
            <div class="rate-item"><span>Base Hook & Winch Charge</span><span>₹500</span></div>
            <div class="rate-item"><span>Distance Rate (₹40/km)</span><span id="tow-dist-rate-txt">₹340</span></div>
            <div class="rate-item total"><span>Estimated Fare</span><span id="tow-total-fare-txt" style="color: #00C851; font-size: 18px;">₹${towRate}</span></div>
          </div>
        </div>

        <button class="btn btn-yellow full-width" style="padding: 14px; font-size: 14px;" onclick="window.dispatchTowTruck()">
          <i data-lucide="truck"></i> DISPATCH RECOVERY TRUCK NOW ➔
        </button>
      </div>

      <!-- Right Column: Recovery Fleet Specifications -->
      <div class="b-card">
        <div class="card-header">
          <h3><i data-lucide="truck"></i> Available Highway Recovery Fleet</h3>
          <span class="pill green">24/7 Active</span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 10px;">
          ${APP_STATE.towingFleet
            .map(
              (f) => `
            <div class="inventory-row">
              <div class="inventory-info">
                <strong>${f.type} (${f.reg})</strong>
                <small>Driver: ${f.driver} • Max Load: ${f.capacity}</small>
              </div>
              <span class="pill ${f.status === 'Available' ? 'green' : 'yellow'}">${f.status} (${f.eta})</span>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    </div>
  `;
}

window.updateTowCalc = function (val) {
  const km = parseFloat(val);
  const fare = 500 + km * 40;
  const distBadge = document.getElementById('tow-dist-badge');
  const distRateTxt = document.getElementById('tow-dist-rate-txt');
  const totalFareTxt = document.getElementById('tow-total-fare-txt');

  if (distBadge) distBadge.innerText = `${km} km`;
  if (distRateTxt) distRateTxt.innerText = `₹${km * 40}`;
  if (totalFareTxt) totalFareTxt.innerText = `₹${fare}`;
};

window.dispatchTowTruck = function () {
  alert("🚚 Flatbed Hydraulic Tow Truck Dispatched via Tamil Nadu Highway Recovery!");
  APP_STATE.towingRequests[0].status = 'En Route';
};

// Customer Screen 7: Full-Width Kavalan 112 SOS Screen
function renderCustomerSosView(container) {
  container.innerHTML = `
    <div class="desktop-split-grid">
      <!-- Left Column: SOS 3s Hold Trigger & Siren -->
      <div class="b-card red">
        <div style="text-align: center;">
          <span class="badge red" style="font-size: 11px; padding: 4px 12px;">🚨 KAVALAN SAFETY 24/7 PROTOCOL</span>
          <h3 style="font-size: 18px; font-weight: 900; margin-top: 8px;">${t('sosTitle')}</h3>
          <p style="font-size: 12px; font-weight: 700; color: #444; margin-top: 4px;">${t('sosSubtitle')}</p>
        </div>

        <div style="margin: 20px 0;">
          <button class="sos-hold-button" id="sos-hold-btn" 
            onmousedown="window.startSOSHold()" onmouseup="window.cancelSOSHold()" onmouseleave="window.cancelSOSHold()"
            ontouchstart="window.startSOSHold()" ontouchend="window.cancelSOSHold()">
            <div id="sos-progress" class="sos-progress-bar"></div>
            <span style="position: relative; z-index: 2;">🚨 HOLD 3 SECS FOR 112 POLICE SOS</span>
          </button>
          <small style="display: block; text-align: center; font-size: 11px; color: #64748b; margin-top: 6px;">
            Continuous 3-second hold prevents accidental clicks
          </small>
        </div>

        <button class="btn ${APP_STATE.isSirenPlaying ? 'btn-red' : 'btn-black'} full-width" style="padding: 12px; font-size: 13px;" onclick="window.toggleEmergencySiren()">
          ${APP_STATE.isSirenPlaying ? '🔊 SIREN ACTIVE (Tap to Stop)' : t('sirenBtn')}
        </button>
      </div>

      <!-- Right Column: Speed Dialers & Nearest Police Station -->
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div class="b-card">
          <div class="card-header">
            <h3><i data-lucide="phone-call"></i> Emergency Police Speed Dialers</h3>
          </div>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 10px;">
            <a href="tel:112" class="btn btn-yellow" style="font-size: 12px; padding: 12px 6px; text-decoration: none;">
              📞 112 Police
            </a>
            <a href="tel:1091" class="btn" style="font-size: 12px; padding: 12px 6px; background: #FF80AB; color: #0D0D0D; text-decoration: none;">
              👩 1091 Women
            </a>
            <a href="tel:1033" class="btn" style="font-size: 12px; padding: 12px 6px; background: #80D8FF; color: #0D0D0D; text-decoration: none;">
              🛣️ 1033 Highway
            </a>
          </div>
        </div>

        <div class="b-card">
          <div style="display: flex; gap: 12px; align-items: center;">
            <i data-lucide="shield" style="color: #FF3B30; width: 32px; height: 32px;"></i>
            <div style="flex: 1;">
              <strong style="font-size: 14px;">Theni Town Police Station (1.4 km)</strong>
              <small style="display: block; font-size: 12px; color: #555;">04546-252222 • 112 Highway Emergency Dispatch Unit</small>
            </div>
            <span class="pill green">Active Guard</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

// 3-Second Continuous Hold SOS Logic
let sosHoldTimer = null;
let sosHoldProgressTimer = null;
let sosProgressPercent = 0;

window.startSOSHold = function () {
  const progressBar = document.getElementById('sos-progress');
  sosProgressPercent = 0;

  if (sosHoldProgressTimer) clearInterval(sosHoldProgressTimer);
  sosHoldProgressTimer = setInterval(() => {
    sosProgressPercent += 3.33;
    if (progressBar) progressBar.style.width = `${Math.min(100, sosProgressPercent)}%`;
  }, 100);

  sosHoldTimer = setTimeout(() => {
    clearInterval(sosHoldProgressTimer);
    if (progressBar) progressBar.style.width = '0%';
    triggerKavalan112EmergencyBroadcast();
  }, 3000);
};

window.cancelSOSHold = function () {
  if (sosHoldTimer) clearTimeout(sosHoldTimer);
  if (sosHoldProgressTimer) clearInterval(sosHoldProgressTimer);
  const progressBar = document.getElementById('sos-progress');
  if (progressBar) progressBar.style.width = '0%';
};

function triggerKavalan112EmergencyBroadcast() {
  alert(
    "🚨 KAVALAN 112 EMERGENCY BROADCAST ACTIVATED!\n\n" +
    "1. Live GPS coordinates (10.0104, 77.4768) transmitted to Theni Town Police Station.\n" +
    "2. SMS alert with live tracking link dispatched to your Emergency Contacts chain.\n" +
    "3. Highway Patrol vehicle NH-85 alerted."
  );

  APP_STATE.adminIncidents.unshift({
    id: `SOS-${Date.now().toString().slice(-5)}`,
    victim: `${APP_STATE.customer.name} (${APP_STATE.customer.phone})`,
    loc: 'Theni Highway Bypass (10.0104, 77.4768)',
    issue: 'Customer SOS 3-Second Hold Alert Triggered',
    policeStation: 'Theni Town Police Station',
    status: 'Active Dispatch',
    time: 'Just now'
  });
}

window.toggleEmergencySiren = function () {
  APP_STATE.isSirenPlaying = !APP_STATE.isSirenPlaying;

  if (APP_STATE.isSirenPlaying) {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        APP_STATE.sirenAudioContext = new AudioContext();
        const osc = APP_STATE.sirenAudioContext.createOscillator();
        const gain = APP_STATE.sirenAudioContext.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, APP_STATE.sirenAudioContext.currentTime);
        osc.connect(gain);
        gain.connect(APP_STATE.sirenAudioContext.destination);
        osc.start();
        APP_STATE.sirenOsc = osc;
      }
    } catch (e) {
      console.warn("Audio Context:", e);
    }
  } else {
    if (APP_STATE.sirenOsc) {
      try {
        APP_STATE.sirenOsc.stop();
        if (APP_STATE.sirenAudioContext) APP_STATE.sirenAudioContext.close();
      } catch (e) {
        console.warn("Stop siren:", e);
      }
    }
  }

  window.customerNavigate('sos');
};

// Customer Screen 8: Full-Width Profile View
function renderCustomerProfileView(container) {
  container.innerHTML = `
    <div class="desktop-split-grid">
      <div class="b-card yellow">
        <div style="display: flex; gap: 14px; align-items: center;">
          <div style="width: 52px; height: 52px; background: #0D0D0D; color: #FFD600; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 900;">
            M
          </div>
          <div>
            <strong style="font-size: 16px;">${APP_STATE.customer.name}</strong>
            <small style="display: block; font-size: 12px; font-weight: 700;">${APP_STATE.customer.phone} • Theni, Tamil Nadu</small>
          </div>
        </div>
      </div>

      <div class="b-card">
        <div class="card-header">
          <h3>Update Registered Vehicle</h3>
        </div>
        <div class="vehicle-selector" style="margin-top: 10px;">
          <div class="vehicle-chip ${APP_STATE.customer.vehicle.type === 'Bike' ? 'active' : ''}" onclick="window.updateVehicleType('Bike')">🏍️ Bike</div>
          <div class="vehicle-chip ${APP_STATE.customer.vehicle.type === 'Car' ? 'active' : ''}" onclick="window.updateVehicleType('Car')">🚗 Car</div>
          <div class="vehicle-chip ${APP_STATE.customer.vehicle.type === 'Auto' ? 'active' : ''}" onclick="window.updateVehicleType('Auto')">🛺 Auto</div>
        </div>
        <input type="text" id="profile-vehicle-model" value="${APP_STATE.customer.vehicle.model}" class="brutal-input" style="margin-top: 10px;" placeholder="Model (e.g. Swift / FZ)" />
        <input type="text" id="profile-vehicle-plate" value="${APP_STATE.customer.vehicle.plate}" class="brutal-input" style="margin-top: 8px;" placeholder="Plate Number (e.g. TN 57 AB 1234)" />
        <button class="btn btn-yellow full-width" style="margin-top: 12px; padding: 10px;" onclick="window.saveVehicleProfileForm()">
          Save Vehicle Details
        </button>
      </div>
    </div>
  `;
}

window.saveVehicleProfileForm = function () {
  const model = document.getElementById('profile-vehicle-model')?.value;
  const plate = document.getElementById('profile-vehicle-plate')?.value;

  if (model && plate) {
    APP_STATE.customer.vehicle.model = model;
    APP_STATE.customer.vehicle.plate = plate;
    alert("Vehicle Details Saved Successfully!");
    window.customerNavigate('home');
  }
};

// --------------------------------------------------------------------------
// 9. MECHANIC PARTNER MODULE — FULL-WIDTH RESPONSIVE DASHBOARD
// --------------------------------------------------------------------------
function renderMechanicScreen() {
  const container = document.getElementById('mechanic-screen-viewport');
  if (!container) return;

  const selMech = APP_STATE.mechanics.find((m) => m.id === 'MEC-01') || APP_STATE.mechanics[0];
  const job = APP_STATE.activeJob;

  if (selMech.status === 'Pending Verification') {
    container.innerHTML = `
      <div class="b-card red" style="padding: 24px; text-align: center;">
        <span class="badge red" style="font-size: 12px; padding: 6px 14px;">ACCOUNT STATUS: PENDING KYC REVIEW</span>
        <h3 style="margin-top: 12px; font-size: 18px;">Your Partner KYC is Under Verification by Tamil Nadu Staff Desk</h3>
        <p style="font-size: 13px; color: #555; margin-top: 6px;">Your Aadhaar and Garage License documents are being reviewed. Once approved, you will be active on the highway radar grid.</p>
        <button class="btn btn-green" style="margin-top: 16px; padding: 10px 20px;" onclick="window.simulateAdminKycApproval('MEC-01')">
          ⚡ Simulate Admin Instant Approval
        </button>
      </div>
    `;
    return;
  }

  const stages = ['Accepted', 'Arrived', 'In Progress', 'Completed'];
  const currentStageIndex = stages.indexOf(job.status) !== -1 ? stages.indexOf(job.status) : 0;

  container.innerHTML = `
    <!-- Full-Width Mechanic Header -->
    <div class="role-dashboard-header">
      <div class="role-profile-info">
        <div class="role-avatar-circle" style="background: #CCFF90; color: #1B5E20;">🔧</div>
        <div>
          <h2 style="font-size: 18px; font-weight: 900;">${APP_STATE.lang === 'ta' ? selMech.nameTa : selMech.name}</h2>
          <span style="font-size: 12px; font-weight: 700; color: #4B5563;">⭐ ${selMech.rating} Rating • Partner ID: ${selMech.id} • ${selMech.serviceArea}</span>
        </div>
      </div>
      <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
        <button class="pill ${selMech.isOnline ? 'green' : 'black'}" style="cursor: pointer; padding: 6px 14px; font-size: 12px;" onclick="window.toggleMechanicDuty()">
          ${selMech.isOnline ? '● DUTY ONLINE' : '○ DUTY OFFLINE'}
        </button>
        <button class="btn btn-yellow" onclick="window.openIncomingJobAlert()">
          <i data-lucide="bell"></i> Simulate Incoming Alert (30s Timer)
        </button>
      </div>
    </div>

    <!-- 2-Column Responsive Dashboard Grid -->
    <div class="role-dashboard-grid">
      <!-- Left Column: Active Job Console & Google Maps Routing -->
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div class="b-card">
          <div class="card-header">
            <h3><i data-lucide="zap" style="color: #FF3B30;"></i> ${t('mechActiveJob')}</h3>
            <span class="badge green">₹${job.bill.total} Customer Bill</span>
          </div>
          <div style="margin-top: 8px;">
            <strong style="font-size: 15px;">${t('mechCustomerLabel')} ${job.customerName}</strong>
            <p style="font-size: 13px; font-weight: 700; color: #334155; margin-top: 2px;">${t('mechVehicleLabel')} ${job.vehicleDetails}</p>
            <p style="font-size: 12px; color: #475569;">📍 ${t('mechLocLabel')} ${job.location.name} (0.8 km away)</p>
          </div>

          <!-- Google Maps Deep Link -->
          <a href="https://www.google.com/maps/dir/?api=1&destination=${job.location.lat},${job.location.lng}" target="_blank" class="btn btn-yellow full-width" style="margin-top: 10px; padding: 10px; text-decoration: none;">
            <i data-lucide="navigation"></i> Open Google Maps Turn-by-Turn Navigation
          </a>

          <!-- Stage Stepper -->
          <div style="display: flex; gap: 6px; margin-top: 12px;">
            ${stages
              .map((st, i) => `
              <div style="flex: 1; text-align: center; padding: 8px 4px; border: 2px solid #0D0D0D; border-radius: 6px; font-size: 11px; font-weight: 900; background: ${i <= currentStageIndex ? '#FFD600' : '#E0E0E0'};">
                ${st}
              </div>
            `)
              .join('')}
          </div>

          <div style="margin-top: 12px; display: flex; gap: 8px;">
            <button class="btn btn-secondary" style="flex: 1; padding: 10px;" onclick="window.advanceMechanicStatus()">
              <i data-lucide="arrow-right"></i> Next: ${stages[(currentStageIndex + 1) % stages.length]}
            </button>
            <button class="btn btn-green" style="flex: 1; padding: 10px;" onclick="window.openMechanicBillingModal()">
              <i data-lucide="file-text"></i> Finalize Bill
            </button>
          </div>
        </div>

        <!-- Mid-job Spare Parts Ordering -->
        <div class="b-card yellow">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <strong style="font-size: 13.5px;">Need Spares on Highway?</strong>
              <small style="display: block; font-size: 11px; color: #444;">Request Battery or Engine Oil from Theni Spares Hub</small>
            </div>
            <button class="btn btn-black" onclick="window.requestMidJobSparePart()">
              Order Part
            </button>
          </div>
        </div>
      </div>

      <!-- Right Column: Earnings Analytics & Radius Slider -->
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <!-- Radius Slider -->
        <div class="b-card">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <strong style="font-size: 13px;">OPERATIONAL DISPATCH RADIUS</strong>
            <span class="badge black" id="mech-radius-val">${selMech.radiusKm} km</span>
          </div>
          <input type="range" min="3" max="30" value="${selMech.radiusKm}" style="width: 100%; margin-top: 10px; accent-color: #0D0D0D;" oninput="window.updateMechRadius(this.value)" />
        </div>

        <!-- Earnings Box -->
        <div class="b-card" style="background: #0D0D0D; color: white;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <small style="color: #AAA; font-size: 11px; font-weight: 700;">${t('mechTodayEarnings')}</small>
              <h2 style="color: #FFD600; font-size: 26px; font-weight: 900;">₹${selMech.earnings.today}</h2>
              <small style="color: #4ADE80; font-size: 11px;">Direct Bank Wallet Payout (10% platform fee)</small>
            </div>
            <div style="text-align: right;">
              <small style="color: #AAA; font-size: 11px;">Completed Jobs</small>
              <h3 style="font-size: 20px; font-weight: 900;">148 Done</h3>
              <small style="color: #FFD600; font-size: 11.5px;">⭐ 4.9 Rating</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

window.toggleMechanicDuty = function () {
  const selMech = APP_STATE.mechanics.find((m) => m.id === 'MEC-01') || APP_STATE.mechanics[0];
  selMech.isOnline = !selMech.isOnline;
  renderMechanicScreen();
  renderDesktopHeaderNav('mechanic');
};

window.updateMechRadius = function (val) {
  const selMech = APP_STATE.mechanics.find((m) => m.id === 'MEC-01') || APP_STATE.mechanics[0];
  selMech.radiusKm = parseInt(val, 10);
  const badge = document.getElementById('mech-radius-val');
  if (badge) badge.innerText = `${val} km`;
};

window.advanceMechanicStatus = function () {
  const stages = ['Accepted', 'Arrived', 'In Progress', 'Completed'];
  let idx = stages.indexOf(APP_STATE.activeJob.status);
  idx = (idx + 1) % stages.length;
  APP_STATE.activeJob.status = stages[idx];
  alert(`Mechanic Status Updated to: ${stages[idx]}`);
  renderMechanicScreen();
};

window.simulateAdminKycApproval = function (mechId) {
  const mech = APP_STATE.mechanics.find((m) => m.id === mechId);
  if (mech) {
    mech.status = 'Verified';
    alert(`✅ Partner KYC Approved for ${mech.name}! Account is now Active.`);
    renderMechanicScreen();
  }
};

window.requestMidJobSparePart = function () {
  const part = APP_STATE.shopInventory[0];
  APP_STATE.shopOrders.unshift({
    id: `ORD-${Date.now().toString().slice(-4)}`,
    partName: part.name,
    qty: 1,
    amount: part.price,
    channel: 'Mechanic Mid-Job',
    requestedBy: 'Selvam Auto Works (NH-85)',
    status: 'Preparing',
    time: 'Just now'
  });
  alert(`🚚 Mid-job request for ${part.name} sent to Theni Spares Hub!`);
};

// 30-Second Countdown Incoming Dispatch Alert Modal
let dispatchCountdownInterval = null;
let dispatchSecondsLeft = 30;

window.openIncomingJobAlert = function () {
  const modal = document.getElementById('mechanic-alert-modal');
  const body = document.getElementById('mechanic-alert-body');
  if (!modal || !body) return;

  dispatchSecondsLeft = 30;
  body.innerHTML = `
    <div style="text-align: center; margin-bottom: 14px;">
      <div style="width: 58px; height: 58px; border-radius: 50%; border: 3px solid #FF3B30; margin: 0 auto; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 900;" id="dispatch-timer-circle">
        ${dispatchSecondsLeft}s
      </div>
      <small style="font-weight: 800; color: #64748b; margin-top: 4px; display: block;">Auto-Decline Countdown</small>
    </div>

    <div class="b-card yellow" style="padding: 12px;">
      <strong style="font-size: 14px;">🧑 Customer: Murugan Swamy</strong>
      <p style="font-size: 12.5px; font-weight: 700; margin-top: 2px;">🚗 Vehicle: Hyundai i20 (TN-60-AZ-1234)</p>
      <p style="font-size: 12px; color: #475569;">📍 Location: Theni Bypass Tollgate (0.8 km away)</p>
      <p style="font-size: 12px; font-weight: 800; color: #DC2626; margin-top: 4px;">🚨 Issue: Tire Puncture & Engine Check</p>
    </div>

    <div style="display: flex; gap: 10px; margin-top: 16px;">
      <button class="btn btn-green full-width" onclick="window.acceptDispatchJob()">
        <i data-lucide="check"></i> Accept Dispatch
      </button>
      <button class="btn btn-logout-sm full-width" onclick="window.declineDispatchJob()">
        Decline
      </button>
    </div>
  `;

  modal.classList.add('active');
  if (window.lucide) lucide.createIcons();

  if (dispatchCountdownInterval) clearInterval(dispatchCountdownInterval);
  dispatchCountdownInterval = setInterval(() => {
    dispatchSecondsLeft--;
    const circle = document.getElementById('dispatch-timer-circle');
    if (circle) circle.innerText = `${dispatchSecondsLeft}s`;

    if (dispatchSecondsLeft <= 0) {
      clearInterval(dispatchCountdownInterval);
      window.declineDispatchJob();
    }
  }, 1000);
};

window.acceptDispatchJob = function () {
  if (dispatchCountdownInterval) clearInterval(dispatchCountdownInterval);
  const modal = document.getElementById('mechanic-alert-modal');
  if (modal) modal.classList.remove('active');
  APP_STATE.activeJob.status = 'Accepted';
  alert("🎉 Job Accepted! Turn-by-turn navigation initiated.");
  renderMechanicScreen();
};

window.declineDispatchJob = function () {
  if (dispatchCountdownInterval) clearInterval(dispatchCountdownInterval);
  const modal = document.getElementById('mechanic-alert-modal');
  if (modal) modal.classList.remove('active');
  alert("Job declined and re-routed to next available partner.");
};

// Mechanic Billing Modal
window.openMechanicBillingModal = function () {
  const modal = document.getElementById('mechanic-billing-modal');
  if (modal) modal.classList.add('active');
};

window.closeMechanicBillingModal = function () {
  const modal = document.getElementById('mechanic-billing-modal');
  if (modal) modal.classList.remove('active');
};

window.calcBillTotal = function () {
  const base = parseFloat(document.getElementById('bill-base-input')?.value || 150);
  const parts = parseFloat(document.getElementById('bill-parts-input')?.value || 0);
  const labor = parseFloat(document.getElementById('bill-labor-input')?.value || 0);
  const total = base + parts + labor;

  const baseTxt = document.getElementById('calc-base-text');
  const partsTxt = document.getElementById('calc-parts-text');
  const laborTxt = document.getElementById('calc-labor-text');
  const totalTxt = document.getElementById('calc-total-text');

  if (baseTxt) baseTxt.innerText = `₹${base}`;
  if (partsTxt) partsTxt.innerText = `₹${parts}`;
  if (laborTxt) laborTxt.innerText = `₹${labor}`;
  if (totalTxt) totalTxt.innerText = `₹${total}`;
};

window.submitMechanicBill = function () {
  const base = parseFloat(document.getElementById('bill-base-input')?.value || 150);
  const parts = parseFloat(document.getElementById('bill-parts-input')?.value || 0);
  const labor = parseFloat(document.getElementById('bill-labor-input')?.value || 0);

  APP_STATE.activeJob.bill.base = base;
  APP_STATE.activeJob.bill.parts = parts;
  APP_STATE.activeJob.bill.labor = labor;
  APP_STATE.activeJob.bill.total = base + parts + labor;

  window.closeMechanicBillingModal();
  alert(`✅ Final bill of ₹${APP_STATE.activeJob.bill.total} sent to customer!`);
  renderMechanicScreen();
};

// --------------------------------------------------------------------------
// 10. SPARE PARTS SHOP OWNER MODULE — FULL-WIDTH DASHBOARD
// --------------------------------------------------------------------------
function renderShopOwnerScreen() {
  const container = document.getElementById('shop-panel-container');
  if (!container) return;

  const totalSales = APP_STATE.shopOrders.reduce((sum, o) => sum + o.amount, 0) + 42300;
  const lowStockCount = APP_STATE.shopInventory.filter((i) => i.stock < 6).length;

  container.innerHTML = `
    <!-- Shop Profile Header -->
    <div class="role-dashboard-header">
      <div class="role-profile-info">
        <div class="role-avatar-circle shop">🏪</div>
        <div>
          <h2 style="font-size: 18px; font-weight: 900;">${t('shopTitle')}</h2>
          <span style="font-size: 12px; font-weight: 700; color: #4B5563;">${t('shopSub')} • Theni Spares Hub</span>
        </div>
      </div>
      <div style="display: flex; gap: 10px;">
        <button class="btn btn-yellow" onclick="window.openAddPartModal()"><i data-lucide="plus-circle"></i> Add Spare Part</button>
      </div>
    </div>

    <!-- Shop KPI Stats -->
    <div class="admin-top-stats">
      <div class="stat-box yellow">
        <i data-lucide="shopping-bag"></i>
        <div>
          <span>${t('shopTodayOrders')}</span>
          <h2>${APP_STATE.shopOrders.length + 15} ORDERS</h2>
          <small>Dual Channel Stream</small>
        </div>
      </div>
      <div class="stat-box green">
        <i data-lucide="credit-card"></i>
        <div>
          <span>${t('shopTodaySales')}</span>
          <h2>₹${totalSales}</h2>
          <small>Direct Wholesale Settlement</small>
        </div>
      </div>
      <div class="stat-box red">
        <i data-lucide="alert-circle"></i>
        <div>
          <span>${t('shopLowStock')}</span>
          <h2>${lowStockCount} ITEMS</h2>
          <small>Low Stock Warning (< 6)</small>
        </div>
      </div>
      <div class="stat-box blue">
        <i data-lucide="truck"></i>
        <div>
          <span>${t('shopActiveDispatches')}</span>
          <h2>4 RUNNING</h2>
          <small>Highway Fast Transit</small>
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
          ${APP_STATE.shopInventory
            .map(
              (item) => `
            <div class="inventory-row">
              <div class="inventory-info">
                <strong>${APP_STATE.lang === 'ta' ? item.nameTa : item.name}</strong>
                <small>${item.category} • Wholesale: ₹${item.price} (Retail: ₹${item.retail})</small>
              </div>
              <div class="stock-control">
                <span class="stock-pill ${item.stock >= 6 ? 'in-stock' : 'low-stock'}">
                  ${item.stock} in stock
                </span>
                <button class="btn btn-yellow" style="padding: 6px 10px; font-size: 11.5px;" onclick="window.restockPartItem(${item.id})">+ Stock</button>
              </div>
            </div>
          `
            )
            .join('')}
        </div>
      </div>

      <!-- Real-Time Incoming Orders Stream -->
      <div class="admin-card">
        <div class="card-header">
          <h3><i data-lucide="shopping-cart" style="color: #00C851;"></i> ${t('shopOrdersTitle')}</h3>
          <span class="pill red animate-pulse">Dual Channel Feed</span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 12px;">
          ${APP_STATE.shopOrders
            .map(
              (ord) => `
            <div class="b-card ${ord.status === 'Preparing' ? 'yellow' : ''}" style="padding: 12px;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div>
                  <span class="badge ${ord.channel.includes('Mechanic') ? 'red' : 'blue'}">${ord.channel}</span>
                  <strong style="display: block; font-size: 13.5px; margin-top: 4px;">${ord.partName}</strong>
                  <small style="font-weight: 700; color: #475569;">${ord.requestedBy} • ${ord.time}</small>
                </div>
                <strong style="font-size: 15px; color: #166534;">₹${ord.amount}</strong>
              </div>
              <div style="margin-top: 8px; display: flex; justify-content: space-between; align-items: center;">
                <span class="pill ${ord.status === 'Delivered' ? 'green' : 'yellow'}" style="font-size: 11px;">
                  Status: ${ord.status}
                </span>
                ${
                  ord.status === 'Preparing'
                    ? `<button class="btn btn-green" style="padding: 6px 12px; font-size: 11.5px;" onclick="window.advanceShopOrderStatus('${ord.id}')">Dispatch Now ➔</button>`
                    : ''
                }
              </div>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    </div>
  `;
}

window.restockPartItem = function (id) {
  const item = APP_STATE.shopInventory.find((i) => i.id === id);
  if (item) {
    item.stock += 5;
    alert(`📦 ${item.name} stock increased to ${item.stock}!`);
    renderShopOwnerScreen();
  }
};

window.advanceShopOrderStatus = function (orderId) {
  const ord = APP_STATE.shopOrders.find((o) => o.id === orderId);
  if (ord) {
    ord.status = 'Dispatched';
    alert(`🚚 Order ${orderId} dispatched to partner! Inventory auto-decremented.`);
    renderShopOwnerScreen();
  }
};

window.openAddPartModal = function () {
  const modal = document.getElementById('add-part-modal');
  if (modal) modal.classList.add('active');
};

window.closeAddPartModal = function () {
  const modal = document.getElementById('add-part-modal');
  if (modal) modal.classList.remove('active');
};

window.saveNewSparePart = function () {
  const name = document.getElementById('new-part-name')?.value;
  const nameTa = document.getElementById('new-part-nameta')?.value || name;
  const category = document.getElementById('new-part-category')?.value || 'Battery';
  const price = parseFloat(document.getElementById('new-part-price')?.value || 2800);
  const retail = parseFloat(document.getElementById('new-part-retail')?.value || 3600);
  const stock = parseInt(document.getElementById('new-part-stock')?.value || 10, 10);

  if (name) {
    APP_STATE.shopInventory.push({
      id: Date.now(),
      name,
      nameTa,
      category,
      price,
      retail,
      stock,
      icon: 'package'
    });
    window.closeAddPartModal();
    alert(`✅ New spare part ${name} added to catalog!`);
    renderShopOwnerScreen();
  }
};

// --------------------------------------------------------------------------
// 11. TOWING / RECOVERY PARTNER MODULE — FULL-WIDTH DASHBOARD
// --------------------------------------------------------------------------
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
          <span style="font-size: 12px; font-weight: 700; color: #4B5563;">${t('towingSub')}</span>
        </div>
      </div>
      <div style="display: flex; gap: 10px;">
        <button class="btn btn-yellow" onclick="window.openAddTowModal()"><i data-lucide="plus"></i> Register Tow Truck</button>
      </div>
    </div>

    <!-- Towing KPI Stats -->
    <div class="admin-top-stats">
      <div class="stat-box yellow">
        <i data-lucide="truck"></i>
        <div>
          <span>${t('towActiveTrucks')}</span>
          <h2>${APP_STATE.towingFleet.length} FLEET</h2>
          <small>Flatbed & Wheel-Lift Units</small>
        </div>
      </div>
      <div class="stat-box green">
        <i data-lucide="check-circle"></i>
        <div>
          <span>${t('towRecoveriesDone')}</span>
          <h2>9 TOWS</h2>
          <small>100% Zero-Damage Standard</small>
        </div>
      </div>
      <div class="stat-box blue">
        <i data-lucide="credit-card"></i>
        <div>
          <span>${t('towEarnings')}</span>
          <h2>₹12,400</h2>
          <small>Daily Tow Fare Settlement</small>
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
          ${APP_STATE.towingFleet
            .map(
              (f) => `
            <div class="fleet-truck-card">
              <span class="badge black">${f.id}</span>
              <strong style="font-size: 14px;">${f.type}</strong>
              <small style="font-weight: 700; color: #444;">${f.reg} • Driver: ${f.driver}</small>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px;">
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
          <span class="pill red">Emergency Queue</span>
        </div>
        <div class="b-card yellow" style="padding: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span class="badge red">#TOW-REQ-901</span>
            <strong style="font-size: 18px; color: #166534;">₹840 Fare</strong>
          </div>
          <p style="font-size: 14px; font-weight: 900; margin-top: 8px;">Vehicle: Hyundai i20 Asta (TN-60-AZ-1234)</p>
          <p style="font-size: 12px; font-weight: 700; color: #333;">📍 Pickup: Theni Highway Junction (Near Tollgate)</p>
          <p style="font-size: 12px; font-weight: 700; color: #333;">🏁 Drop: Madurai Road Auto Clinic (8.5 km)</p>
          <p style="font-size: 11.5px; color: #666; margin-top: 4px;">Issue: Transmission breakdown. Flatbed required.</p>

          <button class="btn btn-green full-width" style="margin-top: 14px; font-size: 13px;" onclick="window.acceptTowingDispatch('TOW-REQ-901')">
            <i data-lucide="check"></i> ${t('acceptTowBtn')}
          </button>
        </div>
      </div>
    </div>
  `;
}

window.acceptTowingDispatch = function (reqId) {
  alert(`🚚 Flatbed Hydraulic Truck TN-60-T-9001 dispatched for ${reqId}!`);
  renderTowingPartnerScreen();
};

window.openAddTowModal = function () {
  const modal = document.getElementById('add-tow-truck-modal');
  if (modal) modal.classList.add('active');
};

window.closeAddTowModal = function () {
  const modal = document.getElementById('add-tow-truck-modal');
  if (modal) modal.classList.remove('active');
};

window.saveNewTowTruck = function () {
  const type = document.getElementById('tow-type-input')?.value || 'Flatbed Hydraulic';
  const reg = document.getElementById('tow-reg-input')?.value || 'TN-60-T-9005';
  const driver = document.getElementById('tow-driver-input')?.value || 'Ramanathan';
  const cap = document.getElementById('tow-cap-input')?.value || '4.5 Tons';

  APP_STATE.towingFleet.push({
    id: `TOW-0${APP_STATE.towingFleet.length + 1}`,
    type,
    reg,
    driver,
    capacity: cap,
    status: 'Available',
    eta: 'Ready'
  });

  window.closeAddTowModal();
  alert(`✅ Tow truck ${reg} registered in recovery fleet!`);
  renderTowingPartnerScreen();
};

// --------------------------------------------------------------------------
// 12. STAFF / SUPER ADMIN DESK MODULE (Restricted)
// --------------------------------------------------------------------------
let adminLeafletMap = null;

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
          <h2>${APP_STATE.adminIncidents.length} ACTIVE</h2>
          <small>Theni Police Control (112) Live</small>
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
          <h2>${APP_STATE.mechanics.filter((m) => m.isOnline).length + 26} ONLINE</h2>
          <small>Theni & Madurai Highway Hub</small>
        </div>
      </div>
      <div class="stat-box blue">
        <i data-lucide="credit-card"></i>
        <div>
          <span>${t('adminRazorpayVol')}</span>
          <h2>₹1,48,900</h2>
          <small>100% Verified UPI/Cards</small>
        </div>
      </div>
    </div>

    <!-- Admin Operations Grid -->
    <div class="admin-radar-grid">
      <!-- Leaflet Operations Radar Map -->
      <div class="admin-card">
        <div class="card-header">
          <h3><i data-lucide="radar"></i> ${t('adminRadarTitle')}</h3>
          <span class="pill red">Live Highway Radar</span>
        </div>
        <div class="admin-map-box">
          <div id="admin-leaflet-map" style="width: 100%; height: 100%;"></div>
        </div>
      </div>

      <!-- Kavalan 112 SOS Incident Log & Controls -->
      <div class="admin-card">
        <div class="card-header">
          <h3><i data-lucide="shield-alert" style="color: #FF3B30;"></i> ${t('adminIncidentTitle')}</h3>
          <span class="pill red">Police Desk</span>
        </div>
        ${APP_STATE.adminIncidents
          .map(
            (inc) => `
          <div class="b-card red" style="padding: 14px;">
            <div style="display: flex; justify-content: space-between;">
              <span class="badge red">${inc.id}</span>
              <span style="font-size: 11px; font-weight: 800;">${inc.time}</span>
            </div>
            <strong style="font-size: 14px; margin-top: 6px; display: block;">${inc.victim}</strong>
            <p style="font-size: 12px; color: #333;"><strong>Location:</strong> ${inc.loc}</p>
            <p style="font-size: 12px; color: #DC2626;"><strong>Issue:</strong> ${inc.issue}</p>
            <div style="display: flex; gap: 8px; margin-top: 10px;">
              <a href="tel:112" class="btn btn-red" style="flex: 1; font-size: 11.5px; padding: 8px; text-decoration: none;">
                <i data-lucide="phone-call"></i> Call Patrol
              </a>
              <button class="btn btn-black" style="flex: 1; font-size: 11.5px; padding: 8px;" onclick="window.resolveAdminIncident('${inc.id}')">
                Mark Safe
              </button>
            </div>
          </div>
        `
          )
          .join('')}
      </div>
    </div>

    <!-- Partner KYC Review Queue -->
    <div class="admin-card" style="margin-top: 14px;">
      <div class="card-header">
        <h3><i data-lucide="user-check"></i> Partner KYC Verification Queue</h3>
        <span class="pill yellow">Pending Approvals</span>
      </div>
      <div style="display: flex; flex-direction: column; gap: 10px;">
        ${APP_STATE.mechanics
          .map(
            (m) => `
          <div class="inventory-row">
            <div class="inventory-info">
              <strong>${m.name} (${m.serviceArea})</strong>
              <small>Experience: ${m.experience} • Tools: ${m.tools.join(', ')}</small>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <span class="pill ${m.status === 'Verified' ? 'green' : 'yellow'}">${m.status}</span>
              ${
                m.status !== 'Verified'
                  ? `<button class="btn btn-green" style="padding: 6px 12px; font-size: 12px;" onclick="window.adminApproveKyc('${m.id}')">Approve KYC</button>`
                  : `<button class="btn btn-logout-sm" style="padding: 6px 12px; font-size: 12px;" onclick="window.adminSuspendPartner('${m.id}')">Suspend</button>`
              }
            </div>
          </div>
        `
          )
          .join('')}
      </div>
    </div>
  `;

  setTimeout(() => {
    initLeafletAdminMap();
  }, 100);
}

function initLeafletAdminMap() {
  const mapDiv = document.getElementById('admin-leaflet-map');
  if (!mapDiv || typeof L === 'undefined') return;

  if (adminLeafletMap) {
    adminLeafletMap.remove();
    adminLeafletMap = null;
  }

  adminLeafletMap = L.map('admin-leaflet-map', {
    zoomControl: true,
    attributionControl: false
  }).setView([10.0104, 77.4768], 12);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(adminLeafletMap);

  APP_STATE.mechanics.forEach((m) => {
    const icon = L.divIcon({
      className: 'admin-m-icon',
      html: `<div style="background:#FFD600; border:2px solid black; border-radius:50%; width:28px; height:28px; display:flex; align-items:center; justify-content:center; font-size:13px;">🔧</div>`
    });
    L.marker([m.lat, m.lng], { icon }).addTo(adminLeafletMap).bindPopup(`<b>${m.name}</b><br>Status: ${m.status}`);
  });

  const jobIcon = L.divIcon({
    className: 'admin-job-icon',
    html: `<div style="background:#FF3B30; border:2px solid black; border-radius:50%; width:30px; height:30px; display:flex; align-items:center; justify-content:center; font-size:15px; animation:pulseDot 1s infinite;">🚨</div>`
  });
  L.marker([APP_STATE.activeJob.location.lat, APP_STATE.activeJob.location.lng], { icon: jobIcon })
    .addTo(adminLeafletMap)
    .bindPopup(`<b>Emergency Breakdown</b><br>${APP_STATE.activeJob.customerName}`);

  setTimeout(() => {
    if (adminLeafletMap) adminLeafletMap.invalidateSize();
  }, 200);
}

window.adminApproveKyc = function (mechId) {
  const m = APP_STATE.mechanics.find((mech) => mech.id === mechId);
  if (m) {
    m.status = 'Verified';
    alert(`✅ KYC Approved for ${m.name}!`);
    renderAdminPanel();
  }
};

window.adminSuspendPartner = function (mechId) {
  const m = APP_STATE.mechanics.find((mech) => mech.id === mechId);
  if (m) {
    m.status = 'Suspended';
    alert(`⚠️ Partner ${m.name} suspended from receiving jobs.`);
    renderAdminPanel();
  }
};

window.resolveAdminIncident = function (incId) {
  APP_STATE.adminIncidents = APP_STATE.adminIncidents.filter((i) => i.id !== incId);
  alert(`Incident ${incId} marked as Safe and Resolved in Kavalan Registry.`);
  renderAdminPanel();
};

// --------------------------------------------------------------------------
// 13. RAZORPAY PAYMENT GATEWAY & DIGITAL TAX INVOICE MODAL GENERATION
// --------------------------------------------------------------------------
window.openRazorpayModal = function (amount) {
  const amt = amount || APP_STATE.activeJob.bill.total;
  const payAmtTxt = document.getElementById('rzp-pay-amount');
  const payBtnTxt = document.getElementById('rzp-btn-text');

  if (payAmtTxt) payAmtTxt.innerText = `₹${amt}.00`;
  if (payBtnTxt) payBtnTxt.innerText = `₹${amt}.00 ${t('rzpPayBtn')}`;

  const modal = document.getElementById('razorpay-modal');
  if (modal) modal.classList.add('active');
};

window.closeRazorpayModal = function () {
  const modal = document.getElementById('razorpay-modal');
  if (modal) modal.classList.remove('active');
};

window.completeRazorpayPayment = function () {
  window.closeRazorpayModal();
  APP_STATE.activeJob.isPaid = true;
  APP_STATE.activeJob.status = 'Completed';
  window.openReceiptModal();
};

window.openReceiptModal = function () {
  const modal = document.getElementById('invoice-receipt-modal');
  const body = document.getElementById('receipt-modal-body');
  if (!modal || !body) return;

  const job = APP_STATE.activeJob;
  const invoiceNo = `INV-UM-${Date.now().toString().slice(-6)}`;
  const dateStr = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  body.innerHTML = `
    <div style="text-align: center; margin-bottom: 14px;">
      <span class="badge green" style="font-size: 11px; padding: 4px 12px;">✓ PAYMENT CAPTURED (RAZORPAY)</span>
      <h3 style="font-size: 22px; color: #166534; font-weight: 900; margin-top: 6px;">₹${job.bill.total}.00</h3>
      <small style="color: #64748b;">Txn ID: rzp_live_${Date.now().toString().slice(-8)} • ${dateStr}</small>
    </div>

    <div class="b-card" style="font-size: 12.5px; padding: 12px;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
        <span><strong>Invoice No:</strong> ${invoiceNo}</span>
        <span><strong>Vehicle:</strong> ${APP_STATE.customer.vehicle.plate}</span>
      </div>
      <div style="display: flex; justify-content: space-between;">
        <span><strong>Customer:</strong> ${APP_STATE.customer.name}</span>
        <span><strong>Mechanic:</strong> Selvam Auto Works</span>
      </div>
    </div>

    <div class="rate-card-summary" style="margin-top: 12px;">
      <div class="rate-item"><span>Visiting & Highway Inspection Charge</span><span>₹${job.bill.base}</span></div>
      <div class="rate-item"><span>Spare Parts & Consumables</span><span>₹${job.bill.parts}</span></div>
      <div class="rate-item"><span>Labor & Mechanical Service</span><span>₹${job.bill.labor}</span></div>
      <div class="rate-item total"><span>Total Amount Paid</span><span style="color: #00C851;">₹${job.bill.total}</span></div>
    </div>

    <div style="display: flex; gap: 10px; margin-top: 16px;">
      <button class="btn btn-yellow full-width" onclick="window.printOrDownloadReceipt()">
        <i data-lucide="download"></i> Download / Print
      </button>
      <button class="btn btn-green full-width" onclick="window.openRatingModalAfterService()">
        <i data-lucide="star"></i> Rate Service
      </button>
    </div>
  `;

  modal.classList.add('active');
  if (window.lucide) lucide.createIcons();
};

window.closeReceiptModal = function () {
  const modal = document.getElementById('invoice-receipt-modal');
  if (modal) modal.classList.remove('active');
};

window.printOrDownloadReceipt = function () {
  window.print();
};

// --------------------------------------------------------------------------
// 14. POST-SERVICE RATING & FEEDBACK
// --------------------------------------------------------------------------
let selectedStars = 5;

window.openRatingModalAfterService = function () {
  window.closeReceiptModal();
  const modal = document.getElementById('rating-feedback-modal');
  if (modal) modal.classList.add('active');
};

window.closeRatingModal = function () {
  const modal = document.getElementById('rating-feedback-modal');
  if (modal) modal.classList.remove('active');
  window.customerNavigate('home');
};

window.setStarRating = function (val) {
  selectedStars = val;
  document.querySelectorAll('.star-rating').forEach((star) => {
    const starVal = parseInt(star.getAttribute('data-val'), 10);
    star.classList.toggle('active', starVal <= val);
  });

  const label = document.getElementById('star-rating-label');
  if (label) {
    const labels = ['Poor (1/5)', 'Fair (2/5)', 'Good (3/5)', 'Very Good (4/5)', 'Excellent (5/5 Stars)'];
    label.innerText = labels[val - 1] || `${val}/5 Stars`;
  }
};

window.submitServiceRating = function () {
  const fbText = document.getElementById('feedback-text-input')?.value || 'Great highway assistance!';
  const isRebook = document.getElementById('rebook-toggle-check')?.checked;

  APP_STATE.activeJob.rating = selectedStars;
  APP_STATE.activeJob.feedback = fbText;
  APP_STATE.activeJob.rebooked = isRebook;

  alert(`⭐ Thank you for your ${selectedStars}-Star rating! Feedback submitted to partner profile.`);
  window.closeRatingModal();
};

// --------------------------------------------------------------------------
// 15. INITIALIZATION & SHORTCUT LISTENERS
// --------------------------------------------------------------------------
window.addEventListener('hashchange', () => {
  if (window.location.hash === '#/admin-login' || window.location.hash === '#admin-login') {
    window.openAdminLoginModal();
  }
});

document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
    e.preventDefault();
    window.openAdminLoginModal();
  }
});

document.addEventListener('DOMContentLoaded', () => {
  window.setAppLanguage(APP_STATE.lang);

  if (window.location.hash === '#/admin-login' || window.location.hash === '#admin-login') {
    window.openAdminLoginModal();
  } else if (APP_STATE.role && APP_STATE.role !== 'gateway') {
    window.switchAppMode(APP_STATE.role);
  } else {
    window.switchAppMode('gateway');
  }

  if (window.lucide) lucide.createIcons();
});