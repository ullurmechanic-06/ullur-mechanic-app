// Ullur Mechanic Interactive Super App Showcase Logic (Full Bilingual System)

let currentLang = 'ta'; // 'ta' for Tamil, 'en' for English
let currentCustomerScreen = 'home';
let cartItems = [];
let isSirenActive = false;
let mechanicJobStage = 1; // 0: Assigned, 1: En Route, 2: Diagnosing, 3: Completed
let mechanicOnline = true;
let currentAppMode = 'customer';

// Complete Bilingual Dictionaries
const STRINGS = {
  ta: {
    appTitle: 'ULLUR MECHANIC',
    appSubBadge: '⚡ நேரலை செயலி',
    tabCustomer: '🧑 வாடிக்கையாளர் செயலி',
    tabMechanic: '🔧 மெக்கானிக் செயலி',
    tabAdmin: '🚨 காவல் & அட்மின் அறை',
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
    navHome: 'முகப்பு',
    navParts: 'உதிரிபாகங்கள்',
    navTow: 'டோயிங்',
    navSos: 'காவலன் SOS',
    guideTitle: 'நேரலை சோதனை வழிகாட்டி',
    guideIntro: 'இந்த மொபைல் திரையில் நீங்கள் நேரடியாக அனைத்து அம்சங்களையும் தொட்டு இயக்கலாம்:',
    guideStep1Title: '1. பழுது நீக்க கோரிக்கை (Breakdown Request):',
    guideStep1Desc: "'வாகன பழுது நீக்கம்' பட்டனை தொட்டு Tire Puncture அல்லது Dead Battery தேர்வு செய்து மெக்கானிக்கை அழைக்கவும்.",
    guideStep2Title: '2. நேரலை வருகை & Razorpay:',
    guideStep2Desc: 'மெக்கானிக் வரும் வழியை பார்த்துவிட்டு Razorpay (GPay/UPI/Card) மூலம் ₹350 செலுத்தவும்.',
    guideStep3Title: '3. 🚨 காவலன் போலீஸ் SOS (Kavalan Protocol):',
    guideStep3Desc: 'மெக்கானிக் தகாத முறையில் நடந்தால் உடனே 112 போலீஸ் நிலையத்திற்கு நேரலை GPS அனுப்பவும்.',
    guideStep4Title: '4. மொத்த உதிரிபாகங்கள் அங்காடி:',
    guideStep4Desc: '30% நேரடி தொழிற்சாலை தள்ளுபடியில் உதிரிபாகங்களை கூடையில் சேர்த்து ஆர்டர் செய்யவும்.',
    guideBtnHome: 'முகப்பு திரை',
    guideBtnSos: '112 SOS சோதனை',
    guideBtnParts: 'உதிரிபாகங்கள் கூடை',
    mechDutyTitle: 'மெக்கானிக் பார்ட்னர் செயலி',
    mechDutyIntro: 'செல்வம் ஆட்டோ ஒர்க்ஸ் மெக்கானிக் அம்சங்கள்:',
    mechStep1: 'ஆன்லைன்/ஆஃப்லைன் ஸ்விட்ச்: டியூட்டி ஆன் செய்து அருகில் உள்ள பழுது கோரிக்கைகளை பெறலாம்.',
    mechStep2: 'Google Maps நேவிகேஷன்: பழுதான வாகனத்தின் இருப்பிடத்திற்கு நேரடி வழி பெறலாம்.',
    mechStep3: 'பணி நிலை மாற்றுதல் (Stages): Accepted ➔ En Route ➔ Fixing ➔ Completed என மாற்றி வாடிக்கையாளருக்கு தகவல் அனுப்பலாம்.',
    mechStep4: 'வருமான கணக்கு (Wallet): இன்றைய வருமானம் & முடித்த வேலைகளை கண்காணிக்கலாம்.',
    mechTodayEarnings: "இன்றைய வருமானம் (Today's Earnings)",
    mechCompletedJobs: 'முடிந்த பணிகள்',
    mechActiveJob: '🔥 நேரலை பழுது பணி',
    mechCustomerLabel: 'வாடிக்கையாளர்:',
    mechVehicleLabel: 'வாகனம்:',
    mechLocLabel: 'இடம்:',
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
    appSubBadge: '⚡ LIVE SIMULATOR',
    tabCustomer: '🧑 Customer App',
    tabMechanic: '🔧 Mechanic App',
    tabAdmin: '🚨 Kavalan Police & Admin',
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
    navHome: 'Home',
    navParts: 'Spares',
    navTow: 'Tow',
    navSos: 'Police SOS',
    guideTitle: 'Interactive Live Guide',
    guideIntro: 'You can directly touch and test all features on this mobile screen:',
    guideStep1Title: '1. Breakdown Request:',
    guideStep1Desc: "Tap 'Breakdown Repair' to select Tire Puncture or Dead Battery and dispatch nearest mechanic.",
    guideStep2Title: '2. Live Radar & Razorpay:',
    guideStep2Desc: 'Track mechanic ETA on live radar and pay ₹350 seamlessly via Razorpay UPI / Cards.',
    guideStep3Title: '3. 🚨 Kavalan Police SOS (Safety Protocol):',
    guideStep3Desc: 'Instantly send live GPS to 112 Police Station in case of driver misbehavior or danger.',
    guideStep4Title: '4. Wholesale Spares Store:',
    guideStep4Desc: 'Order batteries and engine oils directly at 30% factory wholesale discounts.',
    guideBtnHome: 'Home Screen',
    guideBtnSos: 'Test 112 SOS',
    guideBtnParts: 'Test Spares Cart',
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

// Global App Mode Switcher
function switchAppMode(mode) {
  currentAppMode = mode;
  document.querySelectorAll('.mode-btn').forEach((btn) => btn.classList.remove('active'));
  document.querySelectorAll('.app-mode-view').forEach((view) => view.classList.remove('active'));

  const activeBtn = document.getElementById(`tab-btn-${mode}`);
  if (activeBtn) activeBtn.classList.add('active');

  const activeView = document.getElementById(`${mode}-mode`);
  if (activeView) activeView.classList.add('active');

  if (mode === 'customer') {
    customerNavigate(currentCustomerScreen);
    renderCustomerGuidePanel();
  } else if (mode === 'mechanic') {
    renderMechanicScreen();
    renderMechanicGuidePanel();
  } else if (mode === 'admin') {
    renderAdminPanel();
  }

  if (window.lucide) lucide.createIcons();
}

// Global Language Switcher (Updates EVERYTHING across the whole UI)
function setAppLanguage(lang) {
  currentLang = lang;
  document.getElementById('lang-ta-btn').classList.toggle('active', lang === 'ta');
  document.getElementById('lang-en-btn').classList.toggle('active', lang === 'en');

  // Master Header & Mode Buttons
  document.getElementById('app-title-header').innerText = t('appTitle');
  document.getElementById('app-sub-badge').innerText = t('appSubBadge');
  document.getElementById('tab-txt-customer').innerText = t('tabCustomer');
  document.getElementById('tab-txt-mechanic').innerText = t('tabMechanic');
  document.getElementById('tab-txt-admin').innerText = t('tabAdmin');

  // Phone Header & Bottom Navigation
  document.getElementById('c-loc-title').innerText = t('locTitle');
  document.getElementById('c-loc-sub').innerText = t('locSub');
  document.getElementById('cnav-home-txt').innerText = t('navHome');
  document.getElementById('cnav-parts-txt').innerText = t('navParts');
  document.getElementById('cnav-tow-txt').innerText = t('navTow');
  document.getElementById('cnav-sos-txt').innerText = t('navSos');

  // Razorpay labels
  const rzpLabel = document.getElementById('rzp-payable-label');
  if (rzpLabel) rzpLabel.innerText = t('rzpPayableLabel');

  // Re-render current screens
  customerNavigate(currentCustomerScreen);
  renderCustomerGuidePanel();
  renderMechanicScreen();
  renderMechanicGuidePanel();
  renderAdminPanel();

  if (window.lucide) lucide.createIcons();
}

// Customer App Navigation
function customerNavigate(screen) {
  currentCustomerScreen = screen;
  const container = document.getElementById('customer-inner-content');

  document.querySelectorAll('.c-nav-item').forEach((item) => item.classList.remove('active'));
  const activeNav = document.getElementById(`cnav-${screen}`);
  if (activeNav) activeNav.classList.add('active');

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

// Render Customer Guide Side Panel
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
      <li>
        <strong>${t('guideStep1Title')}</strong>
        <span>${t('guideStep1Desc')}</span>
      </li>
      <li>
        <strong>${t('guideStep2Title')}</strong>
        <span>${t('guideStep2Desc')}</span>
      </li>
      <li>
        <strong>${t('guideStep3Title')}</strong>
        <span>${t('guideStep3Desc')}</span>
      </li>
      <li>
        <strong>${t('guideStep4Title')}</strong>
        <span>${t('guideStep4Desc')}</span>
      </li>
    </ul>
    <div class="guide-actions">
      <button class="btn btn-yellow" onclick="customerNavigate('home')"><i data-lucide="home"></i> ${t('guideBtnHome')}</button>
      <button class="btn btn-red" onclick="customerNavigate('sos')"><i data-lucide="shield-alert"></i> ${t('guideBtnSos')}</button>
      <button class="btn btn-black" onclick="customerNavigate('parts')"><i data-lucide="shopping-bag"></i> ${t('guideBtnParts')}</button>
    </div>
  `;
}

// 1. Customer Screen: Home
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
          <small style="font-size: 10px; font-weight: 700;">${t('sosBannerSub')}</small>
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
        <span style="width: 6px; height: 6px; background: #00C851; border-radius: 50%;"></span> ${t('liveRadar')}
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
          <div style="font-size: 11px; font-weight: 700; color: #555;">⭐ 4.9 (148 jobs) • <span style="color: #00C851;">ONLINE</span></div>
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

// 2. Customer Screen: Breakdown Request
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
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
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

// 3. Customer Screen: Live Tracking & Razorpay
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

// 4. Customer Screen: Wholesale Spare Parts
function renderCustomerParts(container) {
  const parts = [
    {
      name: currentLang === 'ta' ? 'எக்சைட் 35Ah ஹெவி கார் பேட்டரி' : 'Exide Mileage 35Ah Heavy Car Battery',
      price: 3450,
      retail: 4200,
      icon: 'battery-charging',
      desc: currentLang === 'ta' ? '36 மாத வாரண்டி • இலவச பொருத்துதல்' : '36 Months Warranty • Free Installation',
    },
    {
      name: currentLang === 'ta' ? 'மோட்டுல் 7100 என்ஜின் ஆயில் (1L)' : 'Motul 7100 4T 10W-50 Engine Oil (1L)',
      price: 690,
      retail: 880,
      icon: 'droplet',
      desc: currentLang === 'ta' ? '100% சிந்தெடிக் 4-ஸ்ட்ரோக் ஆயில்' : '100% Synthetic 4-Stroke Oil',
    },
    {
      name: currentLang === 'ta' ? 'பாஷ் பிரேக் பேட்ஸ் செட் (Bosch)' : 'Bosch Front Ceramic Brake Pads Set',
      price: 950,
      retail: 1350,
      icon: 'disc',
      desc: currentLang === 'ta' ? 'Swift, i20, Baleno பொருத்தமானது' : 'Swift, i20, Baleno OEM Fit',
    },
    {
      name: currentLang === 'ta' ? 'MRF ஜாப்பர் டியூப்லெஸ் டயர்' : 'MRF Zapper 100/80-17 Tubeless Tire',
      price: 1950,
      retail: 2450,
      icon: 'disc',
      desc: currentLang === 'ta' ? 'அனைத்து சாலைகளுக்கும் ஏற்ற டயர்' : 'High road grip puncture resistant',
    },
  ];

  container.innerHTML = `
    <div class="b-card" style="background: #0D0D0D; color: white; padding: 10px 14px;">
      <div style="display: flex; align-items: center; gap: 8px;">
        <i data-lucide="check-circle" style="color: #FFD600;"></i>
        <strong style="font-size: 11px;">${t('wholesaleBanner')}</strong>
      </div>
    </div>

    ${parts
      .map(
        (p) => `
      <div class="b-card" style="padding: 12px;">
        <div style="display: flex; gap: 10px;">
          <div style="width: 50px; height: 50px; background: #F6F6F2; border-radius: 8px; border: 2px solid #0D0D0D; display: flex; align-items: center; justify-content: center;">
            <i data-lucide="${p.icon}"></i>
          </div>
          <div style="flex: 1;">
            <strong style="font-size: 13px;">${p.name}</strong>
            <small style="display: block; font-size: 10px; color: #666;">${p.desc}</small>
            <div style="margin-top: 6px; display: flex; align-items: center; gap: 6px;">
              <strong style="font-size: 15px; color: #00C851;">₹${p.price}</strong>
              <small style="text-decoration: line-through; color: #888;">₹${p.retail}</small>
              <span class="pill yellow" style="font-size: 9px;">${Math.round(((p.retail - p.price) / p.retail) * 100)}% OFF</span>
            </div>
          </div>
          <button class="btn btn-yellow" style="padding: 6px 8px; align-self: center;" onclick="addToCart('${p.name}', ${p.price})">
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

// 5. Customer Screen: Cart & Razorpay Checkout
function renderCustomerCart(container) {
  const total = cartItems.reduce((acc, curr) => acc + curr.price, 0) || 3450;

  container.innerHTML = `
    <div class="b-card yellow">
      <strong style="font-size: 14px;">🛍️ ${currentLang === 'ta' ? 'எனது கூடை (Cart Items)' : 'My Cart Items'}</strong>
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

// 6. Customer Screen: Towing / Recovery
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

// 7. Customer Screen: Kavalan Police SOS Alert
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
  const badge = document.getElementById('active-sos-count');
  if (badge) badge.innerText = '2 ACTIVE';
  switchAppMode('admin');
}

function toggleSiren() {
  isSirenActive = !isSirenActive;
  customerNavigate('sos');
}

// 8. Customer Screen: Profile
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

// Mechanic Partner Console Renderer
function renderMechanicScreen() {
  const container = document.getElementById('mechanic-screen-viewport');
  if (!container) return;

  const stages = [t('stepAssigned'), t('stepEnRoute'), t('stepFixing'), t('stepDone')];

  container.innerHTML = `
    <!-- Mechanic Header -->
    <div style="padding: 34px 16px 12px 16px; background: #FFD600; border-bottom: 3px solid #0D0D0D; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <small style="font-size: 10px; font-weight: 900;">${currentLang === 'ta' ? 'மெக்கானிக் பார்ட்னர்' : 'MECHANIC PARTNER'}</small>
        <strong style="font-size: 14px; display: block;">${currentLang === 'ta' ? 'செல்வம் ஆட்டோ ஒர்க்ஸ்' : 'Selvam Auto Works'}</strong>
      </div>
      <button class="pill ${mechanicOnline ? 'green' : 'yellow'}" style="cursor: pointer;" onclick="toggleMechanicDuty()">
        ${mechanicOnline ? '● ONLINE' : '○ OFFLINE'}
      </button>
    </div>

    <div style="flex: 1; overflow-y: auto; padding: 14px; display: flex; flex-direction: column; gap: 12px;">
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
            <div style="flex: 1; text-align: center; padding: 4px 2px; border: 1.5px solid #0D0D0D; border-radius: 4px; font-size: 9px; font-weight: 900; background: ${
              i <= mechanicJobStage ? '#FFD600' : '#E0E0E0'
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
}

function advanceMechanicStage() {
  mechanicJobStage = (mechanicJobStage + 1) % 4;
  renderMechanicScreen();
}

// Admin & Kavalan Desk Renderer
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

// Razorpay Modal Handlers
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

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  setAppLanguage('ta');
});
