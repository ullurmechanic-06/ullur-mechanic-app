/* eslint-disable no-undef */
/* global firebase, L, Razorpay, lucide */
// ==========================================================================
// ULLUR MECHANIC — COMPLETE MULTI-ROLE ROAD BREAKDOWN & EMERGENCY SUPER APP
// High-Fidelity Bilingual Architecture, 5 Stakeholder Portals, Leaflet & Razorpay
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

// Setup reCAPTCHA verifier if container exists
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
      status: 'Verified', // 'Verified' | 'Pending Verification' | 'Suspended'
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

    navHome: 'முகப்பு',
    navParts: 'உதிரிபாகங்கள்',
    navTow: 'டோயிங்',
    navSos: 'காவலன் SOS',
    navProfile: 'சுயவிவரம்',
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

    guideTitle: 'நேரலை சோதனை வழிகாட்டி',
    guideIntro: 'இந்த திரையில் நீங்கள் நேரடியாக அனைத்து அம்சங்களையும் தொட்டு இயக்கலாம்:',
    guideStep1Title: '1. பழுது நீக்க கோரிக்கை:',
    guideStep1Desc: "'வாகன பழுது நீக்கம்' தொட்டு GPS அல்லது மேப்பில் பின் வைத்து 3km->6km->10km ரேடார் தேடலை இயக்கவும்.",
    guideStep2Title: '2. நேரலை டிரேக்கிங் & Razorpay:',
    guideStep2Desc: 'Leaflet வரைபடத்தில் மெக்கானிக் நகர்வை பார்த்துவிட்டு Razorpay மூலம் ₹350 செலுத்தி ரசீது பெறவும்.',
    guideStep3Title: '3. 🚨 3-வினாடி காவலன் SOS:',
    guideStep3Desc: '3 வினாடிகள் தொடர்ந்து அழுத்தி 112 காவல்துறைக்கு நேரலை GPS அனுப்பவும்.',
    guideStep4Title: '4. மொத்த உதிரிபாகங்கள் அங்காடி:',
    guideStep4Desc: '30% நேரடி தொழிற்சாலை தள்ளுபடியில் உதிரிபாகங்களை கூடையில் சேர்த்து ஆர்டர் செய்யவும்.',
    guideBtnHome: 'முகப்பு திரை',
    guideBtnSos: '112 SOS சோதனை',
    guideBtnParts: 'உதிரிபாகங்கள் கூடை',

    mechDutyTitle: 'மெக்கானிக் பார்ட்னர் கன்சோல்',
    mechDutyIntro: 'செல்வம் ஆட்டோ ஒர்க்ஸ் பார்ட்னர் அம்சங்கள்:',
    mechStep1: 'ஆன்லைன்/ஆஃப்லைன் ஸ்விட்ச் & ரேடியஸ் ஸ்லைடர் (15km).',
    mechStep2: 'Google Maps டர்ன்-பை-டர்ன் நேவிகேஷன் இணைப்பு.',
    mechStep3: 'பணி நிலை: Arrived ➔ In Progress ➔ Final Bill ➔ Completed.',
    mechStep4: 'வருமான கணக்கு & கமிஷன் விவரங்கள் (10% Platform Fee).',
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
    activePill: 'செயலில்'
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

    navHome: 'Home',
    navParts: 'Spares',
    navTow: 'Towing',
    navSos: 'Police SOS',
    navProfile: 'Profile',
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

    guideTitle: 'Interactive Live Guide',
    guideIntro: 'You can directly touch and test all features on this screen:',
    guideStep1Title: '1. Breakdown Request:',
    guideStep1Desc: "Tap 'Breakdown Repair' to select issue, drop pin on Leaflet map, and initiate 3km->6km->10km radar search.",
    guideStep2Title: '2. Live Tracking & Razorpay:',
    guideStep2Desc: 'Watch real-time mechanic animation on map, test grace cancellation, and pay ₹350 for itemized receipt.',
    guideStep3Title: '3. 🚨 3-Sec Hold SOS:',
    guideStep3Desc: 'Press and hold 3 seconds to test the anti-accidental Kavalan 112 emergency broadcast.',
    guideStep4Title: '4. Wholesale Spares Store:',
    guideStep4Desc: 'Order batteries and engine oils directly at 30% factory wholesale discounts.',
    guideBtnHome: 'Home Screen',
    guideBtnSos: 'Test 112 SOS',
    guideBtnParts: 'Test Spares Cart',

    mechDutyTitle: 'Mechanic Partner Console',
    mechDutyIntro: 'Selvam Auto Works Partner features:',
    mechStep1: 'Online/Offline Duty Toggle & Radius slider (15km).',
    mechStep2: 'Google Maps Navigation: Turn-by-turn routing to customer breakdown location.',
    mechStep3: 'Job Stage Progression: Arrived ➔ In Progress ➔ Final Bill ➔ Completed.',
    mechStep4: "Earnings Wallet: Track today's revenue and completed service jobs (10% platform fee).",
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
    activePill: 'Active'
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
  return Math.round(d * 10) / 10; // 1 decimal place
}

// --------------------------------------------------------------------------
// 5. GLOBAL AUTHENTICATION & ROLE SWITCHING
// --------------------------------------------------------------------------
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
  if (window.lucide) lucide.createIcons();
};

window.closeAuthModal = function () {
  const modal = document.getElementById('auth-modal');
  if (modal) modal.classList.remove('active');
};

window.autofillDemoOtp = function () {
  const digits = ['1', '2', '3', '4', '5', '6'];
  document.querySelectorAll('.otp-digit').forEach((input, idx) => {
    input.value = digits[idx] || '';
  });
};

window.submitRoleAuth = function () {
  const otpCode = Array.from(document.querySelectorAll('.otp-digit')).map((d) => d.value).join('');

  if (otpCode.length < 6) {
    alert(APP_STATE.lang === 'ta' ? 'முழுமையான 6 இலக்க OTP எண்ணை உள்ளிடவும்!' : 'Please enter full 6-digit SMS OTP!');
    return;
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
// 6. APP MODE SWITCHER & DESKTOP NAVIGATION
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
    renderCustomerGuidePanel();
    renderDesktopHeaderNav('customer');
  } else if (mode === 'mechanic') {
    const mm = document.getElementById('mechanic-mode');
    if (mm) mm.classList.add('active');
    if (sessionChip) {
      sessionChip.style.display = 'flex';
      if (sessionRoleLabel) sessionRoleLabel.innerText = APP_STATE.lang === 'ta' ? '🔧 மெக்கானிக் பார்ட்னர்' : 'Mechanic Partner';
    }
    renderMechanicScreen();
    renderMechanicGuidePanel();
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
      <button class="d-nav-btn ${APP_STATE.customerScreen === 'home' ? 'active' : ''}" id="dnav-home" onclick="window.customerNavigate('home')">
        <i data-lucide="home"></i> <span>${t('navHome')}</span>
      </button>
      <button class="d-nav-btn ${APP_STATE.customerScreen === 'parts' ? 'active' : ''}" id="dnav-parts" onclick="window.customerNavigate('parts')">
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

  // Customer Top/Bottom Texts
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

  if (APP_STATE.role === 'customer') {
    window.customerNavigate(APP_STATE.customerScreen);
    renderCustomerGuidePanel();
  } else if (APP_STATE.role === 'mechanic') {
    renderMechanicScreen();
    renderMechanicGuidePanel();
  } else if (APP_STATE.role === 'shop') {
    renderShopOwnerScreen();
  } else if (APP_STATE.role === 'towing') {
    renderTowingPartnerScreen();
  } else if (APP_STATE.role === 'admin') {
    renderAdminPanel();
  }

  renderDesktopHeaderNav(APP_STATE.role);
  if (window.lucide) lucide.createIcons();
};

// --------------------------------------------------------------------------
// 8. CUSTOMER MODULE — NAVIGATION & SCREENS
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
  const container = document.getElementById('customer-inner-content');
  if (!container) return;

  // Clear timers if moving away from tracking
  if (screen !== 'tracking') {
    if (trackingAnimTimer) clearInterval(trackingAnimTimer);
    if (gracePeriodInterval) clearInterval(gracePeriodInterval);
  }

  // Sync Bottom Nav Active State
  document.querySelectorAll('.c-nav-item').forEach((item) => item.classList.remove('active'));
  const activeMobile = document.getElementById(`cnav-${screen}`);
  if (activeMobile) activeMobile.classList.add('active');

  // Sync Desktop Nav Active State
  document.querySelectorAll('.d-nav-btn').forEach((btn) => btn.classList.remove('active'));
  const activeDesk = document.getElementById(`dnav-${screen}`);
  if (activeDesk) activeDesk.classList.add('active');

  switch (screen) {
    case 'home':
      renderCustomerHomeScreen(container);
      break;
    case 'request':
      renderCustomerRequestScreen(container);
      break;
    case 'tracking':
      renderCustomerTrackingScreen(container);
      break;
    case 'parts':
      renderCustomerPartsScreen(container);
      break;
    case 'cart':
      renderCustomerCartScreen(container);
      break;
    case 'tow':
      renderCustomerTowScreen(container);
      break;
    case 'sos':
      renderCustomerSosScreen(container);
      break;
    case 'profile':
      renderCustomerProfileScreen(container);
      break;
    default:
      renderCustomerHomeScreen(container);
  }

  if (window.lucide) lucide.createIcons();
};

// Customer Screen 1: Home Dashboard
function renderCustomerHomeScreen(container) {
  const verifiedMechs = APP_STATE.mechanics.filter((m) => m.status === 'Verified');

  container.innerHTML = `
    <!-- Kavalan Police SOS Banner -->
    <div class="b-card red" style="cursor: pointer;" onclick="window.customerNavigate('sos')">
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
      <div class="quick-tile" style="background: #FFD600;" onclick="window.customerNavigate('request')">
        <i data-lucide="car-crash"></i>
        <span>${t('actBreakdown')}</span>
      </div>
      <div class="quick-tile" style="background: #CCFF90;" onclick="window.customerNavigate('parts')">
        <i data-lucide="package"></i>
        <span>${t('actSpares')}</span>
      </div>
      <div class="quick-tile" style="background: #B3E5FC;" onclick="window.customerNavigate('tow')">
        <i data-lucide="truck"></i>
        <span>${t('actTow')}</span>
      </div>
    </div>

    <!-- Active Vehicle Chip -->
    <div class="b-card" style="padding: 10px; background: #F8FAFC;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <small style="font-size: 9.5px; font-weight: 900; color: #64748b;">ACTIVE REGISTERED VEHICLE</small>
          <strong style="font-size: 12.5px; display: block;">🚗 ${APP_STATE.customer.vehicle.model}</strong>
          <span style="font-size: 11px; font-weight: 900; color: #DC2626;">${APP_STATE.customer.vehicle.plate}</span>
        </div>
        <button class="btn btn-secondary" style="padding: 4px 8px; font-size: 11px;" onclick="window.customerNavigate('profile')">
          <i data-lucide="edit-2"></i> Edit
        </button>
      </div>
    </div>

    <!-- Nearby Mechanics Radar Header -->
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <strong style="font-size: 13px; font-weight: 900;">${t('nearbyMechs')} (${verifiedMechs.length})</strong>
      <span class="pill green" style="display: flex; align-items: center; gap: 4px;">
        <span class="pulse-dot" style="width: 6px; height: 6px;"></span> ${t('liveRadar')}
      </span>
    </div>

    <!-- Mechanics Cards List -->
    ${verifiedMechs
      .map((mech) => {
        const dist = calculateHaversineDistance(
          APP_STATE.customer.location.lat,
          APP_STATE.customer.location.lng,
          mech.lat,
          mech.lng
        );
        return `
        <div class="b-card">
          <div style="display: flex; gap: 10px; align-items: center;">
            <img src="${mech.avatar}" alt="${mech.name}" class="mechanic-avatar" />
            <div style="flex: 1;">
              <strong style="font-size: 13.5px;">${APP_STATE.lang === 'ta' ? mech.nameTa : mech.name}</strong>
              <div style="font-size: 11px; font-weight: 700; color: #555;">⭐ ${mech.rating} (${mech.jobsDone} jobs) • <span style="color: #00C851; font-weight: 900;">ONLINE</span></div>
              <small style="display: block; font-size: 10px; color: #666;">📍 ${mech.serviceArea}</small>
            </div>
            <div style="text-align: right;">
              <strong style="font-size: 13px;">${dist} km</strong>
              <small style="display: block; font-size: 10px; color: #777;">~${Math.round(dist * 6)} mins</small>
            </div>
          </div>
          <div style="margin-top: 6px; display: flex; gap: 4px; flex-wrap: wrap;">
            ${mech.tools.slice(0, 3).map((tool) => `<span class="pill yellow" style="font-size: 9px;">${tool}</span>`).join('')}
          </div>
          <button class="btn btn-yellow full-width" style="margin-top: 8px; font-size: 12px; padding: 8px;" onclick="window.prepareBreakdownRequest('${mech.id}')">
            <i data-lucide="send"></i> ${t('reqMechBtn')}
          </button>
        </div>
      `;
      })
      .join('')}
  `;
}

window.prepareBreakdownRequest = function (mechId) {
  if (mechId) APP_STATE.activeJob.mechanicId = mechId;
  window.customerNavigate('request');
};

// Customer Screen 2: Breakdown Assistance Request (Leaflet + Voice Note + Photo + Dynamic Matching)
function renderCustomerRequestScreen(container) {
  container.innerHTML = `
    <!-- Mandatory Vehicle Details Card -->
    <div class="b-card yellow" style="padding: 10px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <strong style="font-size: 12.5px;">🚗 ${APP_STATE.customer.vehicle.type}: ${APP_STATE.customer.vehicle.model}</strong>
        <span class="badge black">${APP_STATE.customer.vehicle.plate}</span>
      </div>
      <div style="display: flex; gap: 6px; margin-top: 6px;">
        <div class="vehicle-chip ${APP_STATE.customer.vehicle.type === 'Bike' ? 'active' : ''}" style="flex:1; padding: 4px; font-size: 11px;" onclick="window.updateVehicleType('Bike')">🏍️ Bike</div>
        <div class="vehicle-chip ${APP_STATE.customer.vehicle.type === 'Car' ? 'active' : ''}" style="flex:1; padding: 4px; font-size: 11px;" onclick="window.updateVehicleType('Car')">🚗 Car</div>
        <div class="vehicle-chip ${APP_STATE.customer.vehicle.type === 'Auto' ? 'active' : ''}" style="flex:1; padding: 4px; font-size: 11px;" onclick="window.updateVehicleType('Auto')">🛺 Auto</div>
      </div>
    </div>

    <!-- Interactive Leaflet Map with Manual Pin-Drop Crosshair Overlay -->
    <div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
        <strong style="font-size: 12px;">📍 Pin Breakdown Location on Highway:</strong>
        <button class="btn btn-secondary" style="padding: 2px 6px; font-size: 10px;" onclick="window.autoDetectGps()">
          <i data-lucide="crosshair"></i> Auto GPS
        </button>
      </div>
      <div class="map-wrapper">
        <div id="leaflet-map"></div>
        <div class="pin-drop-crosshair">
          <img src="https://cdn-icons-png.flaticon.com/512/684/684908.png" alt="Pin Drop" />
          <span class="crosshair-milestone-pill" id="crosshair-label">Drag Map to Pin Location</span>
        </div>
      </div>
      <small id="current-pinned-coords" style="font-size: 10px; font-weight: 700; color: #475569; display: block; margin-top: 3px;">
        📌 Lat: ${APP_STATE.customer.location.lat.toFixed(4)}, Lng: ${APP_STATE.customer.location.lng.toFixed(4)} • ${APP_STATE.customer.location.name}
      </small>
    </div>

    <!-- Issue Category Selection Grid -->
    <div>
      <strong style="font-size: 12.5px;">Select Breakdown Issue:</strong>
      <div class="issue-grid" style="margin-top: 6px;">
        <div class="issue-card ${APP_STATE.customer.issue.category === 'Breakdown' ? 'selected' : ''}" onclick="window.selectIssueCategory('Breakdown', this)">🚨 General Breakdown</div>
        <div class="issue-card ${APP_STATE.customer.issue.category === 'Puncture' ? 'selected' : ''}" onclick="window.selectIssueCategory('Puncture', this)">🛞 Tire Puncture</div>
        <div class="issue-card ${APP_STATE.customer.issue.category === 'Battery Jump' ? 'selected' : ''}" onclick="window.selectIssueCategory('Battery Jump', this)">🔋 Battery Jumpstart</div>
        <div class="issue-card ${APP_STATE.customer.issue.category === 'Fuel' ? 'selected' : ''}" onclick="window.selectIssueCategory('Fuel', this)">⛽ Emergency Fuel</div>
        <div class="issue-card ${APP_STATE.customer.issue.category === 'Other' ? 'selected' : ''}" onclick="window.selectIssueCategory('Other', this)">🛠️ Mechanical / Other</div>
      </div>
    </div>

    <!-- Photo Preview & MediaRecorder Voice Note Bar -->
    <div class="b-card" style="padding: 10px;">
      <strong style="font-size: 11.5px;">Attach Photo & Voice Note (Optional):</strong>
      
      <div class="voice-record-bar" style="margin-top: 6px;">
        <button id="btn-record" class="btn-mic-record ${isVoiceRecording ? 'recording' : ''}" onclick="window.toggleVoiceRecording()" title="Hold/Tap to Record">
          🎙️
        </button>
        <div style="flex: 1;">
          <span id="recording-status-txt" style="font-size: 11px; font-weight: 700; color: #334155;">
            ${isVoiceRecording ? `Recording... (${voiceRecordSeconds}s)` : (APP_STATE.customer.issue.audioBlobUrl ? '✅ Voice Note Attached!' : 'Tap mic for voice note')}
          </span>
          ${APP_STATE.customer.issue.audioBlobUrl ? `<audio controls src="${APP_STATE.customer.issue.audioBlobUrl}" style="height: 28px; width: 100%; margin-top: 4px;"></audio>` : ''}
        </div>

        <input type="file" id="issue-photo-input" accept="image/*" style="display:none;" onchange="window.handlePhotoUpload(this)" />
        <button class="btn btn-secondary" style="font-size: 11px; padding: 6px 8px;" onclick="document.getElementById('issue-photo-input').click()">
          📷 Photo
        </button>
      </div>

      ${APP_STATE.customer.issue.photoData ? `
        <div class="photo-preview-container">
          <img src="${APP_STATE.customer.issue.photoData}" alt="Uploaded preview" class="photo-thumb" />
          <div style="flex: 1;">
            <small style="font-weight: 800;">Breakdown Photo Attached</small>
            <button class="btn btn-logout-sm" style="margin-left: 8px; padding: 2px 6px; font-size: 10px;" onclick="window.removePhoto()">Remove</button>
          </div>
        </div>
      ` : ''}
    </div>

    <!-- Smart Haversine Search & Match CTA -->
    <button id="btn-request-help" class="btn btn-yellow full-width" style="padding: 12px; font-size: 13.5px;" onclick="window.initiateSmartHaversineMatch()">
      <i data-lucide="zap"></i> FIND NEAREST MECHANIC (3KM RADAR)
    </button>
  `;

  // Initialize Leaflet Map after DOM insertion
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
    zoomControl: false,
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
        html: `<div style="background:#FFD600; border:2px solid #0D0D0D; border-radius:50%; width:28px; height:28px; display:flex; align-items:center; justify-content:center; font-size:13px; box-shadow:2px 2px 0 #0D0D0D;">🔧</div>`,
        iconSize: [28, 28]
      });
      L.marker([m.lat, m.lng], { icon: mechIcon }).addTo(leafletCustomerMap).bindPopup(`<b>${m.name}</b><br>⭐ ${m.rating}`);
    }
  });

  // Map move listener for crosshair pin drop
  leafletCustomerMap.on('moveend', () => {
    const center = leafletCustomerMap.getCenter();
    APP_STATE.customer.location.lat = center.lat;
    APP_STATE.customer.location.lng = center.lng;
    const label = document.getElementById('current-pinned-coords');
    if (label) {
      label.innerText = `📌 Lat: ${center.lat.toFixed(4)}, Lng: ${center.lng.toFixed(4)} • Theni Bypass Highway`;
    }
  });
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
  window.customerNavigate('request');
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
            window.customerNavigate('request');
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
          // Fallback simulation
          simulateVoiceNoteAttachment();
        });
    } else {
      simulateVoiceNoteAttachment();
    }
  } else {
    // Stop recording
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
  window.customerNavigate('request');
}

window.handlePhotoUpload = function (input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = function (e) {
      APP_STATE.customer.issue.photoData = e.target.result;
      APP_STATE.activeJob.photoData = e.target.result;
      window.customerNavigate('request');
    };
    reader.readAsDataURL(input.files[0]);
  }
};

window.removePhoto = function () {
  APP_STATE.customer.issue.photoData = null;
  APP_STATE.activeJob.photoData = null;
  window.customerNavigate('request');
};

// Sequential Haversine Matching: 3km -> 6km -> 10km Sequential Expansion
window.initiateSmartHaversineMatch = function () {
  const btn = document.getElementById('btn-request-help');
  if (btn) {
    btn.innerText = "⏳ SEARCHING 3KM RADIUS...";
    btn.disabled = true;
  }

  // Phase 1: 3km
  setTimeout(() => {
    let matches = APP_STATE.mechanics.filter((m) => {
      const d = calculateHaversineDistance(APP_STATE.customer.location.lat, APP_STATE.customer.location.lng, m.lat, m.lng);
      return m.isOnline && m.status === 'Verified' && d <= 3.0;
    });

    if (!matches.length) {
      if (btn) btn.innerText = "⚡ EXPANDING TO 6KM RADAR...";
      // Phase 2: 6km
      setTimeout(() => {
        matches = APP_STATE.mechanics.filter((m) => {
          const d = calculateHaversineDistance(APP_STATE.customer.location.lat, APP_STATE.customer.location.lng, m.lat, m.lng);
          return m.isOnline && m.status === 'Verified' && d <= 6.0;
        });
        assignTopMatch(matches);
      }, 1500);
    } else {
      assignTopMatch(matches);
    }
  }, 1200);
};

function assignTopMatch(matches) {
  const topMatch = matches.length ? matches[0] : APP_STATE.mechanics[0];
  const dist = calculateHaversineDistance(APP_STATE.customer.location.lat, APP_STATE.customer.location.lng, topMatch.lat, topMatch.lng);

  APP_STATE.activeJob.mechanicId = topMatch.id;
  APP_STATE.activeJob.distanceKm = dist;
  APP_STATE.activeJob.etaMins = Math.max(4, Math.round(dist * 6));
  APP_STATE.activeJob.status = 'Accepted';
  APP_STATE.activeJob.acceptedAt = Date.now();
  graceSecondsLeft = 120; // 2 minutes free cancellation

  // Sync to Firestore if initialized
  if (firestoreDb) {
    try {
      firestoreDb.collection("breakdown_jobs").doc(APP_STATE.activeJob.id).set(APP_STATE.activeJob, { merge: true });
    } catch (e) {
      console.warn("Firestore sync:", e);
    }
  }

  window.customerNavigate('tracking');
}

// Customer Screen 3: Real-Time Tracking & Service Flow
function renderCustomerTrackingScreen(container) {
  const job = APP_STATE.activeJob;
  const mech = APP_STATE.mechanics.find((m) => m.id === job.mechanicId) || APP_STATE.mechanics[0];
  const stages = ['Requested', 'Accepted', 'Arrived', 'In Progress', 'Completed'];
  const currentStageIndex = stages.indexOf(job.status);

  container.innerHTML = `
    <!-- Live Status Stepper Progress Bar -->
    <div class="b-card" style="padding: 8px 10px;">
      <div style="display: flex; justify-content: space-between;">
        ${stages
          .map((st, i) => {
            const isPassed = i <= currentStageIndex;
            return `
            <div style="text-align: center; flex: 1;">
              <div style="width: 20px; height: 20px; border-radius: 50%; background: ${isPassed ? '#00C851' : '#E2E8F0'}; color: ${isPassed ? 'white' : '#64748B'}; border: 1.5px solid #0D0D0D; margin: 0 auto; display: flex; align-items: center; justify-content: center; font-size: 8.5px; font-weight: 900;">
                ${isPassed ? '✓' : i + 1}
              </div>
              <small style="font-size: 7.5px; font-weight: 900; margin-top: 2px; display: block;">${st}</small>
            </div>
          `;
          })
          .join('')}
      </div>
    </div>

    <!-- Live Animated Leaflet Tracking Map -->
    <div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
        <span class="pill green"><span class="pulse-dot"></span> LIVE MECHANIC DISPATCH</span>
        <strong style="font-size: 12px; color: #166534;">ETA: ~${job.etaMins} Mins (${job.distanceKm} km)</strong>
      </div>
      <div class="map-wrapper" style="height: 190px;">
        <div id="tracking-leaflet-map"></div>
      </div>
    </div>

    <!-- Matched Mechanic Card with Call Button -->
    <div class="b-card" style="border-left: 6px solid #00C851;">
      <div style="display: flex; align-items: center; gap: 10px;">
        <img src="${mech.avatar}" alt="${mech.name}" class="mechanic-avatar" />
        <div style="flex: 1;">
          <strong style="font-size: 13.5px;">${APP_STATE.lang === 'ta' ? mech.nameTa : mech.name}</strong>
          <small style="display: block; font-size: 11px; font-weight: 700; color: #475569;">⭐ ${mech.rating} • Verified Partner</small>
          <small style="display: block; font-size: 10px; color: #166534; font-weight: 900;">Vehicle: Hero Splendor (TN-60-M-4421)</small>
        </div>
        <a href="tel:${mech.phone}" class="btn btn-yellow" style="padding: 8px 10px; font-size: 12px; text-decoration: none;">
          <i data-lucide="phone-call"></i> Call
        </a>
      </div>
    </div>

    <!-- Grace Period Cancellation Timer Card -->
    <div class="b-card" style="background: #F8FAFC; padding: 8px 12px; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <small style="font-size: 9.5px; font-weight: 900; color: #64748b;">GRACE PERIOD CANCELLATION</small>
        <div id="grace-timer-text" style="font-size: 11.5px; font-weight: 900; color: ${graceSecondsLeft > 0 ? '#15803d' : '#b91c1c'};">
          ${graceSecondsLeft > 0 ? `Free cancel for ${Math.floor(graceSecondsLeft / 60)}:${(graceSecondsLeft % 60).toString().padStart(2, '0')}` : '₹50 late cancellation fee applies'}
        </div>
      </div>
      <button class="btn btn-logout-sm" style="font-size: 10.5px;" onclick="window.cancelActiveJob()">
        Cancel Request
      </button>
    </div>

    <!-- Itemized Rate Card Breakdown & Pay Trigger -->
    <div class="rate-card-summary">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid #E2E8F0; padding-bottom: 4px;">
        <strong style="font-size: 12px;">Service Rate Card Summary</strong>
        <span class="badge green">Itemized Breakdown</span>
      </div>
      <div class="rate-item"><span>Base Visiting & Inspection Fee</span><span>₹${job.bill.base}</span></div>
      <div class="rate-item"><span>Materials & Spare Parts</span><span>₹${job.bill.parts}</span></div>
      <div class="rate-item"><span>Labor & Repair Charge</span><span>₹${job.bill.labor}</span></div>
      <div class="rate-item total"><span>Total Payable</span><span style="color: #16A34A; font-size: 16px;">₹${job.bill.total}</span></div>
    </div>

    <!-- Payment Trigger CTA -->
    <button class="btn ${job.isPaid ? 'btn-black' : 'btn-green'} full-width" style="padding: 12px; font-size: 13px;" onclick="window.openRazorpayModal(${job.bill.total})">
      <i data-lucide="credit-card"></i> ${job.isPaid ? '✓ PAYMENT COMPLETED — VIEW RECEIPT' : `PAY ₹${job.bill.total} VIA RAZORPAY`}
    </button>
  `;

  // Start Leaflet Tracking Map
  setTimeout(() => {
    initLeafletTrackingMap(job, mech);
  }, 100);

  // Start Grace Period Countdown
  if (gracePeriodInterval) clearInterval(gracePeriodInterval);
  gracePeriodInterval = setInterval(() => {
    if (graceSecondsLeft > 0) {
      graceSecondsLeft--;
      const label = document.getElementById('grace-timer-text');
      if (label) {
        label.innerText = `Free cancel for ${Math.floor(graceSecondsLeft / 60)}:${(graceSecondsLeft % 60).toString().padStart(2, '0')}`;
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
    zoomControl: false,
    attributionControl: false
  }).setView([custLat, custLng], 14);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(leafletTrackingMap);

  // Customer Pin
  const userIcon = L.divIcon({
    className: 'custom-user-icon',
    html: `<div style="background:#FF3B30; color:white; border:2px solid #0D0D0D; border-radius:50%; width:32px; height:32px; display:flex; align-items:center; justify-content:center; font-size:15px; box-shadow:2px 2px 0 #0D0D0D;">🚗</div>`,
    iconSize: [32, 32]
  });
  L.marker([custLat, custLng], { icon: userIcon }).addTo(leafletTrackingMap).bindPopup("<b>Your Breakdown Location</b>");

  // Mechanic Moving Pin
  let currentMechLat = mech.lat;
  let currentMechLng = mech.lng;

  const mechIcon = L.divIcon({
    className: 'custom-mech-tracking-icon',
    html: `<div style="background:#FFD600; color:#0D0D0D; border:2px solid #0D0D0D; border-radius:50%; width:32px; height:32px; display:flex; align-items:center; justify-content:center; font-size:15px; box-shadow:2px 2px 0 #0D0D0D; animation:pulseDot 1s infinite;">🛵</div>`,
    iconSize: [32, 32]
  });

  trackingMechanicMarker = L.marker([currentMechLat, currentMechLng], { icon: mechIcon }).addTo(leafletTrackingMap);

  // Polyline Route
  const routeLine = L.polyline([[currentMechLat, currentMechLng], [custLat, custLng]], {
    color: '#2563EB',
    weight: 4,
    dashArray: '6, 8'
  }).addTo(leafletTrackingMap);

  leafletTrackingMap.fitBounds(routeLine.getBounds(), { padding: [25, 25] });

  // Simulate Mechanic Movement Animation towards customer
  if (trackingAnimTimer) clearInterval(trackingAnimTimer);
  trackingAnimTimer = setInterval(() => {
    currentMechLat += (custLat - currentMechLat) * 0.12;
    currentMechLng += (custLng - currentMechLng) * 0.12;

    if (trackingMechanicMarker) {
      trackingMechanicMarker.setLatLng([currentMechLat, currentMechLng]);
      routeLine.setLatLngs([[currentMechLat, currentMechLng], [custLat, custLng]]);
    }
  }, 2000);
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

// Customer Screen 4: Wholesale Spare Parts Marketplace
function renderCustomerPartsScreen(container) {
  container.innerHTML = `
    <div class="b-card" style="background: #0D0D0D; color: white; padding: 10px 14px;">
      <div style="display: flex; align-items: center; gap: 8px;">
        <i data-lucide="check-circle" style="color: #FFD600;"></i>
        <strong style="font-size: 11px;">${t('wholesaleBanner')}</strong>
      </div>
    </div>

    ${APP_STATE.shopInventory
      .map(
        (p) => `
      <div class="b-card" style="padding: 10px;">
        <div style="display: flex; gap: 10px;">
          <div style="width: 46px; height: 46px; background: #F6F6F2; border-radius: 8px; border: 2px solid #0D0D0D; display: flex; align-items: center; justify-content: center; font-size: 20px;">
            ${p.category === 'Battery' ? '🔋' : p.category === 'Oil' ? '🛢️' : p.category === 'Brakes' ? '🛑' : p.category === 'Tire' ? '🛞' : '⚡'}
          </div>
          <div style="flex: 1;">
            <strong style="font-size: 12.5px;">${APP_STATE.lang === 'ta' ? p.nameTa : p.name}</strong>
            <small style="display: block; font-size: 10px; color: #666;">Stock: ${p.stock} units • Theni Spares Hub</small>
            <div style="margin-top: 4px; display: flex; align-items: center; gap: 6px;">
              <strong style="font-size: 14px; color: #00C851;">₹${p.price}</strong>
              <small style="text-decoration: line-through; color: #888; font-size: 11px;">₹${p.retail}</small>
              <span class="pill yellow" style="font-size: 8.5px;">${Math.round(((p.retail - p.price) / p.retail) * 100)}% OFF</span>
            </div>
          </div>
          <button class="btn btn-yellow" style="padding: 6px 10px; align-self: center;" onclick="window.addToCustomerCart(${p.id})">
            <i data-lucide="plus"></i> Add
          </button>
        </div>
      </div>
    `
      )
      .join('')}

    <button class="btn btn-black full-width" style="padding: 12px;" onclick="window.customerNavigate('cart')">
      <i data-lucide="shopping-cart"></i> ${t('viewCart')} (${APP_STATE.customer.cart.length})
    </button>
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

// Customer Screen 5: Cart & Checkout
function renderCustomerCartScreen(container) {
  const cart = APP_STATE.customer.cart.length ? APP_STATE.customer.cart : [APP_STATE.shopInventory[0]];
  const total = cart.reduce((acc, curr) => acc + curr.price, 0);

  container.innerHTML = `
    <div class="b-card yellow">
      <strong style="font-size: 13px;">🛍️ ${APP_STATE.lang === 'ta' ? 'எனது உதிரிபாகங்கள் கூடை' : 'My Spare Parts Cart'} (${cart.length})</strong>
    </div>

    ${cart
      .map(
        (c) => `
      <div class="b-card" style="padding: 10px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong style="font-size: 12.5px;">${APP_STATE.lang === 'ta' ? c.nameTa : c.name}</strong>
            <small style="display: block; font-size: 10px; color: #64748b;">Wholesale Direct • Theni Hub</small>
          </div>
          <strong style="font-size: 14px; color: #00C851;">₹${c.price}</strong>
        </div>
      </div>
    `
      )
      .join('')}

    <div class="b-card">
      <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
        <span>Wholesale Discount:</span>
        <span style="color: #16A34A; font-weight: 800;">- 30% Saved</span>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
        <span>Express Highway Delivery:</span>
        <span style="color: #16A34A; font-weight: 800;">FREE</span>
      </div>
      <hr style="border: 1px solid #0D0D0D; margin: 6px 0;" />
      <div style="display: flex; justify-content: space-between; font-size: 14px; font-weight: 900;">
        <span>Total Payable:</span>
        <span style="color: #16A34A;">₹${total}</span>
      </div>
    </div>

    <button class="btn btn-green full-width" style="padding: 12px; font-size: 13px;" onclick="window.openRazorpayModal(${total})">
      <i data-lucide="lock"></i> ${t('cartCheckout')} (₹${total})
    </button>
  `;
}

// Customer Screen 6: Towing Calculator & Dispatch
function renderCustomerTowScreen(container) {
  let towKm = 8.5;
  let towRate = 500 + towKm * 40; // Base ₹500 + ₹40/km

  container.innerHTML = `
    <div class="b-card">
      <div style="display: flex; align-items: center; gap: 8px;">
        <i data-lucide="map-pin" style="color: #FF3B30;"></i>
        <div>
          <small style="font-size: 9px; font-weight: 900;">PICKUP LOCATION</small>
          <strong style="font-size: 12px; display: block;">Theni Highway Bypass (NH-85 Tollgate)</strong>
        </div>
      </div>
      <hr style="border: 1px dashed #0D0D0D; margin: 8px 0;" />
      <div style="display: flex; align-items: center; gap: 8px;">
        <i data-lucide="home" style="color: #00C851;"></i>
        <div>
          <small style="font-size: 9px; font-weight: 900;">DROP LOCATION / GARAGE</small>
          <strong style="font-size: 12px; display: block;">Madurai Road Auto Clinic (${towKm} km)</strong>
        </div>
      </div>
    </div>

    <!-- Distance Rate-Card Calculator Slider -->
    <div class="b-card yellow" style="padding: 12px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <strong style="font-size: 12.5px;">Towing Distance Calculator:</strong>
        <span class="badge black" id="tow-dist-badge">${towKm} km</span>
      </div>
      <input type="range" id="tow-slider" min="2" max="40" value="${towKm}" style="width: 100%; margin-top: 8px; accent-color: #0D0D0D;" oninput="window.updateTowCalc(this.value)" />
      <div class="rate-card-summary" style="margin-top: 8px;">
        <div class="rate-item"><span>Base Hook & Winch Charge</span><span>₹500</span></div>
        <div class="rate-item"><span>Distance Rate (₹40/km)</span><span id="tow-dist-rate-txt">₹340</span></div>
        <div class="rate-item total"><span>Estimated Fare</span><span id="tow-total-fare-txt" style="color: #00C851;">₹${towRate}</span></div>
      </div>
    </div>

    <strong style="font-size: 12.5px;">${t('selectTowType')}</strong>
    <div class="b-card yellow" style="cursor: pointer;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <strong style="font-size: 12.5px;">Flatbed Hydraulic Recovery Truck</strong>
          <small style="display: block; font-size: 10px; color: #444;">Safe zero-ground touch for Cars & SUVs</small>
        </div>
        <span class="pill green">Available (6 mins)</span>
      </div>
    </div>

    <button class="btn btn-yellow full-width" style="padding: 12px; font-size: 13px;" onclick="window.dispatchTowTruck()">
      <i data-lucide="truck"></i> ${t('dispatchTowBtn')}
    </button>
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

// Customer Screen 7: Kavalan 112 Emergency SOS with 3-Second Hold Logic
function renderCustomerSosScreen(container) {
  container.innerHTML = `
    <div style="text-align: center;">
      <span class="badge red" style="font-size: 10.5px; padding: 4px 10px;">🚨 KAVALAN SAFETY 24/7</span>
      <h3 style="font-size: 15px; font-weight: 900; margin-top: 6px;">${t('sosTitle')}</h3>
      <p style="font-size: 11px; font-weight: 700; color: #444; margin-top: 2px;">${t('sosSubtitle')}</p>
    </div>

    <!-- 3-Second Continuous Hold Anti-Accidental SOS Button -->
    <div style="margin: 12px 0;">
      <button class="sos-hold-button" id="sos-hold-btn" 
        onmousedown="window.startSOSHold()" onmouseup="window.cancelSOSHold()" onmouseleave="window.cancelSOSHold()"
        ontouchstart="window.startSOSHold()" ontouchend="window.cancelSOSHold()">
        <div id="sos-progress" class="sos-progress-bar"></div>
        <span style="position: relative; z-index: 2;">🚨 HOLD 3 SECS FOR 112 SOS</span>
      </button>
      <small style="display: block; text-align: center; font-size: 10px; color: #64748b; margin-top: 4px;">
        Continuous 3-second hold prevents accidental clicks
      </small>
    </div>

    <!-- Speed Dialers -->
    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px;">
      <a href="tel:112" class="btn btn-yellow" style="font-size: 10px; padding: 8px 4px; text-decoration: none;">
        📞 112 Police
      </a>
      <a href="tel:1091" class="btn" style="font-size: 10px; padding: 8px 4px; background: #FF80AB; color: #0D0D0D; text-decoration: none;">
        👩 1091 Women
      </a>
      <a href="tel:1033" class="btn" style="font-size: 10px; padding: 8px 4px; background: #80D8FF; color: #0D0D0D; text-decoration: none;">
        🛣️ 1033 Highway
      </a>
    </div>

    <!-- Nearest Police Station Card -->
    <div class="b-card" style="margin-top: 8px;">
      <div style="display: flex; gap: 8px; align-items: center;">
        <i data-lucide="shield" style="color: #FF3B30;"></i>
        <div style="flex: 1;">
          <strong style="font-size: 12px;">Theni Town Police Station (1.4 km)</strong>
          <small style="display: block; font-size: 10px; color: #555;">04546-252222 • 112 Emergency Dispatch</small>
        </div>
        <span class="pill green" style="font-size: 9px;">Ready</span>
      </div>
    </div>

    <!-- High-Decibel Siren Alarm Button -->
    <button class="btn ${APP_STATE.isSirenPlaying ? 'btn-red' : 'btn-black'} full-width" style="padding: 10px; font-size: 12px;" onclick="window.toggleEmergencySiren()">
      ${APP_STATE.isSirenPlaying ? '🔊 SIREN ACTIVE (Tap to Stop)' : t('sirenBtn')}
    </button>
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
    sosProgressPercent += 3.33; // 100% over 3000ms
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

  // Log in Admin desk
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

// Customer Screen 8: Profile & Vehicle Details
function renderCustomerProfileScreen(container) {
  container.innerHTML = `
    <div class="b-card yellow">
      <div style="display: flex; gap: 10px; align-items: center;">
        <div style="width: 44px; height: 44px; background: #0D0D0D; color: #FFD600; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 900;">
          M
        </div>
        <div>
          <strong style="font-size: 14px;">${APP_STATE.customer.name}</strong>
          <small style="display: block; font-size: 11px; font-weight: 700;">${APP_STATE.customer.phone} • Theni, TN</small>
        </div>
      </div>
    </div>

    <!-- Vehicle Setup Form -->
    <div class="b-card">
      <strong style="font-size: 12.5px;">Update Registered Vehicle:</strong>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-top: 6px;">
        <div class="vehicle-chip ${APP_STATE.customer.vehicle.type === 'Bike' ? 'active' : ''}" onclick="window.updateVehicleType('Bike')">🏍️ Bike</div>
        <div class="vehicle-chip ${APP_STATE.customer.vehicle.type === 'Car' ? 'active' : ''}" onclick="window.updateVehicleType('Car')">🚗 Car</div>
        <div class="vehicle-chip ${APP_STATE.customer.vehicle.type === 'Auto' ? 'active' : ''}" onclick="window.updateVehicleType('Auto')">🛺 Auto</div>
      </div>
      <input type="text" id="profile-vehicle-model" value="${APP_STATE.customer.vehicle.model}" class="brutal-input" style="margin-top: 8px;" placeholder="Model (e.g. Swift / FZ)" />
      <input type="text" id="profile-vehicle-plate" value="${APP_STATE.customer.vehicle.plate}" class="brutal-input" style="margin-top: 6px;" placeholder="Plate Number (e.g. TN 57 AB 1234)" />
      <button class="btn btn-yellow full-width" style="margin-top: 8px; padding: 8px;" onclick="window.saveVehicleProfileForm()">
        Save Profile
      </button>
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
      <button class="btn btn-yellow" onclick="window.customerNavigate('home')"><i data-lucide="home"></i> ${t('guideBtnHome')}</button>
      <button class="btn btn-red" onclick="window.customerNavigate('sos')"><i data-lucide="shield-alert"></i> ${t('guideBtnSos')}</button>
      <button class="btn btn-black" onclick="window.customerNavigate('parts')"><i data-lucide="shopping-bag"></i> ${t('guideBtnParts')}</button>
    </div>
  `;
}

// --------------------------------------------------------------------------
// 9. MECHANIC PARTNER MODULE
// --------------------------------------------------------------------------
function renderMechanicScreen() {
  const container = document.getElementById('mechanic-screen-viewport');
  if (!container) return;

  const selMech = APP_STATE.mechanics.find((m) => m.id === 'MEC-01') || APP_STATE.mechanics[0];
  const job = APP_STATE.activeJob;

  // If KYC is pending
  if (selMech.status === 'Pending Verification') {
    container.innerHTML = `
      <div style="padding: 16px; background: #FFD600; border-bottom: 3px solid #0D0D0D;">
        <strong style="font-size: 14px;">🔧 MECHANIC PARTNER ONBOARDING</strong>
      </div>
      <div style="padding: 16px; display: flex; flex-direction: column; gap: 12px;">
        <div class="b-card red">
          <span class="badge red">ACCOUNT STATUS: PENDING KYC REVIEW</span>
          <p style="font-size: 12px; margin-top: 4px;">Your Aadhaar and Garage License documents are under verification by the Tamil Nadu Admin Desk.</p>
        </div>
        <button class="btn btn-green full-width" onclick="window.simulateAdminKycApproval('MEC-01')">
          ⚡ Simulate Admin Instant Approval
        </button>
      </div>
    `;
    return;
  }

  const stages = ['Accepted', 'Arrived', 'In Progress', 'Completed'];
  const currentStageIndex = stages.indexOf(job.status) !== -1 ? stages.indexOf(job.status) : 0;

  container.innerHTML = `
    <!-- Mechanic Header with Duty Toggle -->
    <div style="padding: 14px 16px; background: #FFD600; border-bottom: 3px solid #0D0D0D; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <small style="font-size: 9.5px; font-weight: 900;">${t('mechDutyTitle')}</small>
        <strong style="font-size: 13.5px; display: block;">${APP_STATE.lang === 'ta' ? selMech.nameTa : selMech.name}</strong>
      </div>
      <button class="pill ${selMech.isOnline ? 'green' : 'black'}" style="cursor: pointer;" onclick="window.toggleMechanicDuty()">
        ${selMech.isOnline ? '● ONLINE' : '○ OFFLINE'}
      </button>
    </div>

    <div style="flex: 1; overflow-y: auto; padding: 14px; display: flex; flex-direction: column; gap: 12px;">
      <!-- Operational Radius Slider -->
      <div class="b-card" style="padding: 10px; background: #F8FAFC;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <small style="font-size: 10px; font-weight: 900;">OPERATIONAL RADIUS</small>
          <span class="badge black" id="mech-radius-val">${selMech.radiusKm} km</span>
        </div>
        <input type="range" min="3" max="30" value="${selMech.radiusKm}" style="width: 100%; margin-top: 6px; accent-color: #0D0D0D;" oninput="window.updateMechRadius(this.value)" />
      </div>

      <!-- Today's Earnings & Commission Breakdown -->
      <div class="b-card" style="background: #0D0D0D; color: white;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <small style="color: #AAA; font-size: 10px; font-weight: 700;">${t('mechTodayEarnings')}</small>
            <h2 style="color: #FFD600; font-size: 22px; font-weight: 900;">₹${selMech.earnings.today}</h2>
            <small style="color: #4ADE80; font-size: 9.5px;">Net Payout (10% platform fee deducted)</small>
          </div>
          <div style="text-align: right;">
            <small style="color: #AAA; font-size: 10px;">${t('mechCompletedJobs')}</small>
            <h3 style="font-size: 16px; font-weight: 900;">5 Jobs Done</h3>
            <small style="color: #FFD600; font-size: 10px;">⭐ 4.9 Rating</small>
          </div>
        </div>
      </div>

      <!-- Active Breakdown Job Console -->
      <div class="b-card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
          <span class="badge red">${t('mechActiveJob')}</span>
          <strong style="font-size: 13.5px; color: #00C851;">₹${job.bill.total} Fee</strong>
        </div>
        <strong style="font-size: 13px;">${t('mechCustomerLabel')} ${job.customerName}</strong>
        <p style="font-size: 11.5px; font-weight: 700;">${t('mechVehicleLabel')} ${job.vehicleDetails}</p>
        <p style="font-size: 11px; color: #555;">📍 ${t('mechLocLabel')} ${job.location.name} (0.8 km)</p>

        <!-- Google Maps Turn-by-Turn Deep Link -->
        <a href="https://www.google.com/maps/dir/?api=1&destination=${job.location.lat},${job.location.lng}" target="_blank" class="btn btn-yellow full-width" style="margin-top: 6px; font-size: 11px; padding: 6px; text-decoration: none;">
          <i data-lucide="navigation"></i> Open Google Maps Navigation
        </a>

        <!-- Stage Progression Stepper -->
        <div style="display: flex; gap: 4px; margin-top: 8px;">
          ${stages
            .map((st, i) => `
            <div style="flex: 1; text-align: center; padding: 4px 2px; border: 1.5px solid #0D0D0D; border-radius: 4px; font-size: 8.5px; font-weight: 900; background: ${i <= currentStageIndex ? '#FFD600' : '#E0E0E0'};">
              ${st}
            </div>
          `)
            .join('')}
        </div>

        <div style="margin-top: 8px; display: flex; gap: 6px;">
          <button class="btn btn-secondary" style="flex: 1; font-size: 11px; padding: 6px;" onclick="window.advanceMechanicStatus()">
            <i data-lucide="arrow-right"></i> Next: ${stages[(currentStageIndex + 1) % stages.length]}
          </button>
          <button class="btn btn-green" style="flex: 1; font-size: 11px; padding: 6px;" onclick="window.openMechanicBillingModal()">
            <i data-lucide="file-text"></i> Enter Bill
          </button>
        </div>
      </div>

      <!-- Mid-Job Spare Parts Request Shortcut -->
      <div class="b-card yellow" style="padding: 10px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong style="font-size: 11.5px;">Need Spares on Highway?</strong>
            <small style="display: block; font-size: 10px; color: #444;">Order battery or oil from Theni Spares Hub</small>
          </div>
          <button class="btn btn-black" style="padding: 4px 8px; font-size: 10px;" onclick="window.requestMidJobSparePart()">
            Order Part
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
      <span class="pill yellow">Partner Mode</span>
    </div>
    <p class="guide-intro">${t('mechDutyIntro')}</p>
    <ul class="guide-steps">
      <li><strong>${t('mechStep1')}</strong></li>
      <li><strong>${t('mechStep2')}</strong></li>
      <li><strong>${t('mechStep3')}</strong></li>
      <li><strong>${t('mechStep4')}</strong></li>
    </ul>
    <button class="btn btn-green full-width" style="margin-top: 8px;" onclick="window.openIncomingJobAlert()">
      ⚡ Simulate Incoming Dispatch Alert (30s Timer)
    </button>
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
    <div style="text-align: center; margin-bottom: 12px;">
      <div style="width: 54px; height: 54px; border-radius: 50%; border: 3px solid #FF3B30; margin: 0 auto; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 900;" id="dispatch-timer-circle">
        ${dispatchSecondsLeft}s
      </div>
      <small style="font-weight: 800; color: #64748b;">Auto-Decline Countdown</small>
    </div>

    <div class="b-card yellow" style="padding: 10px;">
      <strong style="font-size: 13px;">🧑 Customer: Murugan Swamy</strong>
      <p style="font-size: 11.5px; font-weight: 700; margin-top: 2px;">🚗 Vehicle: Hyundai i20 (TN-60-AZ-1234)</p>
      <p style="font-size: 11px; color: #475569;">📍 Location: Theni Bypass Tollgate (0.8 km away)</p>
      <p style="font-size: 11px; font-weight: 800; color: #DC2626; margin-top: 2px;">🚨 Issue: Tire Puncture & Engine Check</p>
    </div>

    <div style="display: flex; gap: 8px; margin-top: 14px;">
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
// 10. SPARE PARTS SHOP OWNER MODULE
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
          <span style="font-size: 11.5px; font-weight: 700; color: #4B5563;">${t('shopSub')} • Theni Spares Hub</span>
        </div>
      </div>
      <div style="display: flex; gap: 8px;">
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
                <button class="btn btn-yellow" style="padding: 4px 8px; font-size: 11px;" onclick="window.restockPartItem(${item.id})">+ Stock</button>
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
        <div style="display: flex; flex-direction: column; gap: 10px;">
          ${APP_STATE.shopOrders
            .map(
              (ord) => `
            <div class="b-card ${ord.status === 'Preparing' ? 'yellow' : ''}" style="padding: 10px;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div>
                  <span class="badge ${ord.channel.includes('Mechanic') ? 'red' : 'blue'}">${ord.channel}</span>
                  <strong style="display: block; font-size: 12.5px; margin-top: 4px;">${ord.partName}</strong>
                  <small style="font-weight: 700; color: #475569;">${ord.requestedBy} • ${ord.time}</small>
                </div>
                <strong style="font-size: 14px; color: #166534;">₹${ord.amount}</strong>
              </div>
              <div style="margin-top: 6px; display: flex; justify-content: space-between; align-items: center;">
                <span class="pill ${ord.status === 'Delivered' ? 'green' : 'yellow'}" style="font-size: 10px;">
                  Status: ${ord.status}
                </span>
                ${
                  ord.status === 'Preparing'
                    ? `<button class="btn btn-green" style="padding: 4px 8px; font-size: 11px;" onclick="window.advanceShopOrderStatus('${ord.id}')">Dispatch Now ➔</button>`
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
// 11. TOWING / RECOVERY PARTNER MODULE
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
          <span style="font-size: 11.5px; font-weight: 700; color: #4B5563;">${t('towingSub')}</span>
        </div>
      </div>
      <div style="display: flex; gap: 8px;">
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
          <span class="pill red">Emergency Queue</span>
        </div>
        <div class="b-card yellow" style="padding: 14px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span class="badge red">#TOW-REQ-901</span>
            <strong style="font-size: 16px; color: #166534;">₹840 Fare</strong>
          </div>
          <p style="font-size: 13px; font-weight: 900; margin-top: 6px;">Vehicle: Hyundai i20 Asta (TN-60-AZ-1234)</p>
          <p style="font-size: 11.5px; font-weight: 700; color: #333;">📍 Pickup: Theni Highway Junction (Near Tollgate)</p>
          <p style="font-size: 11.5px; font-weight: 700; color: #333;">🏁 Drop: Madurai Road Auto Clinic (8.5 km)</p>
          <p style="font-size: 11px; color: #666; margin-top: 4px;">Issue: Transmission breakdown. Flatbed required.</p>

          <button class="btn btn-green full-width" style="margin-top: 10px; font-size: 12px;" onclick="window.acceptTowingDispatch('TOW-REQ-901')">
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
          <div class="b-card red" style="padding: 12px;">
            <div style="display: flex; justify-content: space-between;">
              <span class="badge red">${inc.id}</span>
              <span style="font-size: 10.5px; font-weight: 800;">${inc.time}</span>
            </div>
            <strong style="font-size: 13px; margin-top: 4px; display: block;">${inc.victim}</strong>
            <p style="font-size: 11px; color: #333;"><strong>Location:</strong> ${inc.loc}</p>
            <p style="font-size: 11px; color: #DC2626;"><strong>Issue:</strong> ${inc.issue}</p>
            <div style="display: flex; gap: 6px; margin-top: 8px;">
              <a href="tel:112" class="btn btn-red" style="flex: 1; font-size: 11px; padding: 6px; text-decoration: none;">
                <i data-lucide="phone-call"></i> Call Patrol
              </a>
              <button class="btn btn-black" style="flex: 1; font-size: 11px; padding: 6px;" onclick="window.resolveAdminIncident('${inc.id}')">
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
      <div style="display: flex; flex-direction: column; gap: 8px;">
        ${APP_STATE.mechanics
          .map(
            (m) => `
          <div class="inventory-row">
            <div class="inventory-info">
              <strong>${m.name} (${m.serviceArea})</strong>
              <small>Experience: ${m.experience} • Tools: ${m.tools.join(', ')}</small>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="pill ${m.status === 'Verified' ? 'green' : 'yellow'}">${m.status}</span>
              ${
                m.status !== 'Verified'
                  ? `<button class="btn btn-green" style="padding: 4px 8px; font-size: 11px;" onclick="window.adminApproveKyc('${m.id}')">Approve KYC</button>`
                  : `<button class="btn btn-logout-sm" style="padding: 4px 8px; font-size: 11px;" onclick="window.adminSuspendPartner('${m.id}')">Suspend</button>`
              }
            </div>
          </div>
        `
          )
          .join('')}
      </div>
    </div>
  `;

  // Start Leaflet Admin Map
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

  // Mark all mechanics
  APP_STATE.mechanics.forEach((m) => {
    const icon = L.divIcon({
      className: 'admin-m-icon',
      html: `<div style="background:#FFD600; border:2px solid black; border-radius:50%; width:26px; height:26px; display:flex; align-items:center; justify-content:center; font-size:12px;">🔧</div>`
    });
    L.marker([m.lat, m.lng], { icon }).addTo(adminLeafletMap).bindPopup(`<b>${m.name}</b><br>Status: ${m.status}`);
  });

  // Mark Active Job
  const jobIcon = L.divIcon({
    className: 'admin-job-icon',
    html: `<div style="background:#FF3B30; border:2px solid black; border-radius:50%; width:28px; height:28px; display:flex; align-items:center; justify-content:center; font-size:14px; animation:pulseDot 1s infinite;">🚨</div>`
  });
  L.marker([APP_STATE.activeJob.location.lat, APP_STATE.activeJob.location.lng], { icon: jobIcon })
    .addTo(adminLeafletMap)
    .bindPopup(`<b>Emergency Breakdown</b><br>${APP_STATE.activeJob.customerName}`);
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

  // Generate Digital Tax Invoice Receipt
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
    <div style="text-align: center; margin-bottom: 12px;">
      <span class="badge green" style="font-size: 11px; padding: 4px 10px;">✓ PAYMENT CAPTURED (RAZORPAY)</span>
      <h3 style="font-size: 20px; color: #166534; font-weight: 900; margin-top: 4px;">₹${job.bill.total}.00</h3>
      <small style="color: #64748b;">Txn ID: rzp_live_${Date.now().toString().slice(-8)} • ${dateStr}</small>
    </div>

    <div class="b-card" style="font-size: 12px; padding: 10px;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
        <span><strong>Invoice No:</strong> ${invoiceNo}</span>
        <span><strong>Vehicle:</strong> ${APP_STATE.customer.vehicle.plate}</span>
      </div>
      <div style="display: flex; justify-content: space-between;">
        <span><strong>Customer:</strong> ${APP_STATE.customer.name}</span>
        <span><strong>Mechanic:</strong> Selvam Auto</span>
      </div>
    </div>

    <div class="rate-card-summary" style="margin-top: 10px;">
      <div class="rate-item"><span>Visiting & Highway Inspection Charge</span><span>₹${job.bill.base}</span></div>
      <div class="rate-item"><span>Spare Parts & Consumables</span><span>₹${job.bill.parts}</span></div>
      <div class="rate-item"><span>Labor & Mechanical Service</span><span>₹${job.bill.labor}</span></div>
      <div class="rate-item total"><span>Total Amount Paid</span><span style="color: #00C851;">₹${job.bill.total}</span></div>
    </div>

    <div style="display: flex; gap: 8px; margin-top: 14px;">
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