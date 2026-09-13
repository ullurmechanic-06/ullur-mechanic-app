import 'package:flutter/foundation.dart';

class AppLocale {
  static final ValueNotifier<String> currentLanguage = ValueNotifier<String>('ta'); // Default to Tamil (தமிழ்)

  static bool get isTamil => currentLanguage.value == 'ta';

  static void toggleLanguage() {
    currentLanguage.value = currentLanguage.value == 'ta' ? 'en' : 'ta';
  }

  static void setLanguage(String lang) {
    currentLanguage.value = lang;
  }
}

class AppStrings {
  static String tr(String key) {
    final isTa = AppLocale.isTamil;
    return isTa ? (_tamilStrings[key] ?? key) : (_englishStrings[key] ?? key);
  }

  // Tamil Dictionary (தமிழ் சொல்லகராதி)
  static final Map<String, String> _tamilStrings = {
    // App & Header
    'app_name': 'உள்ளூர் மெக்கானிக்',
    'tagline': 'உடனடி வாகன பழுது & மொத்த உதிரிபாகங்கள்',
    'current_location': 'தற்போதைய இருப்பிடம்',
    'switch_lang': 'English / தமிழ்',

    // SOS Emergency & Safety (காவலன் பாதுகாப்பு)
    'sos_title': '🚨 காவலன் அவசர உதவி (POLICE SOS)',
    'sos_subtitle': 'ஓட்டுநர்/மெக்கானிக் தகாத முறையில் நடந்தாலோ அல்லது ஆபத்து நேர்ந்தாலோ உடனே அழுத்தவும்!',
    'sos_tap_button': 'காவல்துறைக்கு அவசர தகவல் அனுப்பு (SOS)',
    'sos_police_dispatched': 'அருகிலுள்ள காவல் நிலையத்திற்கு உங்கள் ஜி.பி.எஸ் இடம் அனுப்பப்பட்டது!',
    'sos_dial_112': '112 காவல்துறை அழைப்பு',
    'sos_women_helpline': '1091 மகளிர் உதவி எண்',
    'sos_highway_patrol': '1033 நெடுஞ்சாலை ரோந்து',
    'sos_siren_on': 'அலார ஒலி எழுப்பு (Siren)',
    'sos_report_misbehavior': 'மெக்கானிக் தகாத நடத்தை மீது புகார் அளி',
    'sos_mechanic_suspended': 'பாதுகாப்பு கருதி இந்த மெக்கானிக் உடனடியாக இடைநீக்கம் செய்யப்பட்டுள்ளார்.',
    'emergency_contacts': 'குடும்பத்தினர் அவசர தொடர்புகள்',

    // Home Actions
    'emergency_banner_title': 'சாலையில் வாகனம் பழுதாகிவிட்டதா?',
    'emergency_banner_sub': 'உடனடி உதவிக்கு இங்கே தொடவும்',
    'sos_fix_btn': 'அவசர உதவி',
    'action_breakdown': 'வாகன\nபழுது நீக்கம்',
    'action_spares': 'மொத்த\nஉதிரிபாகங்கள்',
    'action_tow': 'வாகனம்\nடோயிங் / இழுத்தல்',
    'action_garage': 'எனது\nவாகனங்கள்',
    'nearby_mechanics': 'அருகிலுள்ள மெக்கானிக்குகள்',
    'live_radar': 'நேரலை ரேடார்',
    'request_mechanic': 'மெக்கானிக்கை அழை',

    // Breakdown Request
    'breakdown_title': 'பழுது நீக்க கோரிக்கை',
    'breakdown_loc': 'பழுது ஏற்பட்ட இடம்',
    'vehicle_type': 'வாகன வகை',
    'select_issue': 'பிரச்சனையை தேர்வு செய்யவும்',
    'est_fee': 'ஆய்வு கட்டணம்',
    'dispatch_now': 'மெக்கானிக்கை உடனே அனுப்பு ➔',

    // Live Tracking
    'tracking_title': 'மெக்கானிக் வருகை நேரலை',
    'on_the_way': 'மெக்கானிக் உங்கள் இடத்தை நோக்கி வருகிறார்',
    'step_assigned': 'ஒதுக்கப்பட்டது',
    'step_enroute': 'வருகிறார்',
    'step_arrived': 'வந்துவிட்டார்',
    'step_fixing': 'பழுதுபார்க்கிறார்',
    'step_done': 'முடிந்தது',
    'complete_and_pay': 'முடித்துவிட்டு Razorpay மூலம் செலுத்தவும்',

    // Wholesale Spare Parts
    'spares_title': 'மொத்த உதிரிபாகங்கள் அங்காடி',
    'wholesale_banner': 'தொழிற்சாலை நேரடி விலை — 30% வரை சேமிப்பு!',
    'add_to_cart': 'கூடையில் சேர்',
    'cart_title': 'எனது கூடை & பணம் செலுத்துதல்',
    'place_order': 'ஆர்டர் செய் (Razorpay / UPI)',
    'savings': 'சேமிப்பு',

    // Towing
    'tow_title': 'வாகனம் டோயிங் & பிக்கப்',
    'select_tow_type': 'டோயிங் லாரி வகையை தேர்வு செய்க',
    'est_tow_fare': 'மதிப்பீடு கட்டணம்',
    'dispatch_tow': 'டோயிங் வாகனத்தை அனுப்பு ➔',

    // Payment
    'pay_with_razorpay': 'Razorpay (UPI / Card / GPay) மூலம் செலுத்து',
    'payment_success': 'பணம் வெற்றிகரமாக செலுத்தப்பட்டது! 🎉',
  };

  // English Dictionary
  static final Map<String, String> _englishStrings = {
    'app_name': 'ULLUR MECHANIC',
    'tagline': 'On-Demand Roadside Breakdown & Wholesale Spares',
    'current_location': 'CURRENT LOCATION',
    'switch_lang': 'தமிழ் / English',

    'sos_title': '🚨 KAVALAN EMERGENCY POLICE SOS',
    'sos_subtitle': 'Instant police alert in case of danger, harassment or driver misbehavior!',
    'sos_tap_button': 'SEND EMERGENCY SOS TO POLICE',
    'sos_police_dispatched': 'GPS location & emergency alert sent to nearest Tamil Nadu Police Station!',
    'sos_dial_112': 'Call 112 Police Control',
    'sos_women_helpline': '1091 Women Helpline',
    'sos_highway_patrol': '1033 Highway Patrol',
    'sos_siren_on': 'Sound High-Decibel Siren',
    'sos_report_misbehavior': 'Report Mechanic Misbehavior',
    'sos_mechanic_suspended': 'This mechanic has been instantly suspended for safety review.',
    'emergency_contacts': 'Family Emergency Contacts',

    'emergency_banner_title': 'STRANDED ON ROAD?',
    'emergency_banner_sub': 'Tap for Instant SOS Dispatch',
    'sos_fix_btn': 'SOS FIX',
    'action_breakdown': 'Breakdown\nRepair',
    'action_spares': 'Wholesale\nSpares',
    'action_tow': 'Vehicle\nTow/Pickup',
    'action_garage': 'My\nGarage',
    'nearby_mechanics': 'NEARBY MECHANICS',
    'live_radar': 'LIVE RADAR',
    'request_mechanic': 'Request Mechanic',

    'breakdown_title': 'RAISE BREAKDOWN REQUEST',
    'breakdown_loc': 'BREAKDOWN LOCATION',
    'vehicle_type': 'Vehicle Type',
    'select_issue': 'Select Issue / Breakdown Type',
    'est_fee': 'Estimated Inspection Fee',
    'dispatch_now': 'DISPATCH MECHANIC NOW ➔',

    'tracking_title': 'LIVE MECHANIC TRACKING',
    'on_the_way': 'MECHANIC IS ON THE WAY',
    'step_assigned': 'Assigned',
    'step_enroute': 'En Route',
    'step_arrived': 'Arrived',
    'step_fixing': 'Fixing',
    'step_done': 'Done',
    'complete_and_pay': 'COMPLETE & PAY VIA RAZORPAY',

    'spares_title': 'WHOLESALE SPARES',
    'wholesale_banner': 'Direct Wholesale Pricing — Save up to 30%',
    'add_to_cart': 'Add to Cart',
    'cart_title': 'MY CART & CHECKOUT',
    'place_order': 'PLACE ORDER (Razorpay / UPI)',
    'savings': 'Savings',

    'tow_title': 'VEHICLE TOWING & PICKUP',
    'select_tow_type': 'Select Tow Truck Type',
    'est_tow_fare': 'Estimated Towing Fare',
    'dispatch_tow': 'DISPATCH TOW VEHICLE ➔',

    'pay_with_razorpay': 'Pay with Razorpay (UPI / Card / NetBanking)',
    'payment_success': 'Payment verified & completed successfully! 🎉',
  };
}
