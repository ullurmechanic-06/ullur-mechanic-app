import '../models/user_model.dart';
import '../models/mechanic_model.dart';
import '../models/spare_part_model.dart';
import '../models/breakdown_request_model.dart';

class MockData {
  static final sampleUser = UserModel(
    id: 'user-001',
    name: 'Murugan Swamy',
    phone: '+91 98765 43210',
    email: 'murugan@ullur.in',
    role: 'CUSTOMER',
    isVerified: true,
  );

  static final List<MechanicModel> sampleMechanics = [
    MechanicModel(
      id: 'mech-001',
      userId: 'user-mech-001',
      name: 'Selvam Auto Works',
      phone: '+91 98421 00001',
      skills: ['Engine Repair', 'Brake Faults', 'Puncture Specialist', 'Battery Jumpstart'],
      vehicleTypes: ['CAR', 'BIKE', 'AUTO'],
      experience: 12,
      rating: 4.9,
      totalJobs: 148,
      isOnline: true,
      lat: 10.0125,
      lng: 77.4812,
      distanceKm: 0.8,
      estimatedEtaMins: 6,
    ),
    MechanicModel(
      id: 'mech-002',
      userId: 'user-mech-002',
      name: 'Karthik 2-Wheeler Clinic',
      phone: '+91 98421 00002',
      skills: ['Bike Specialist', 'Chain Sprocket', 'Wiring & Lights', 'Carburetor Clean'],
      vehicleTypes: ['BIKE'],
      experience: 8,
      rating: 4.8,
      totalJobs: 94,
      isOnline: true,
      lat: 10.0080,
      lng: 77.4720,
      distanceKm: 1.4,
      estimatedEtaMins: 11,
    ),
    MechanicModel(
      id: 'mech-003',
      userId: 'user-mech-003',
      name: 'Vetri Heavy Vehicle Service',
      phone: '+91 98421 00003',
      skills: ['Trucks & Vans', 'Clutch Plate Replacement', 'Diesel Engine', 'Radiator Leak'],
      vehicleTypes: ['TRUCK', 'VAN', 'CAR'],
      experience: 15,
      rating: 4.95,
      totalJobs: 210,
      isOnline: true,
      lat: 10.0210,
      lng: 77.4890,
      distanceKm: 2.3,
      estimatedEtaMins: 16,
    ),
  ];

  static final List<SparePartModel> sampleParts = [
    SparePartModel(
      id: 'part-001',
      shopId: 'shop-001',
      name: 'Exide Mileage 35Ah Heavy Battery',
      description: '36 Months Warranty, instant start power with leak-proof technology.',
      category: 'battery',
      vehicleTypes: ['CAR'],
      brand: 'Exide',
      price: 4200.0,
      wholesalePrice: 3450.0,
      stock: 25,
      shopName: 'Theni Wholesale Auto Spares',
    ),
    SparePartModel(
      id: 'part-002',
      shopId: 'shop-001',
      name: 'Motul 7100 4T 10W-50 Engine Oil (1L)',
      description: '100% Synthetic 4-Stroke motorcycle lubricant with ester technology.',
      category: 'oils',
      vehicleTypes: ['BIKE'],
      brand: 'Motul',
      price: 880.0,
      wholesalePrice: 690.0,
      stock: 50,
      shopName: 'Theni Wholesale Auto Spares',
    ),
    SparePartModel(
      id: 'part-003',
      shopId: 'shop-001',
      name: 'Bosch Front Ceramic Brake Pads',
      description: 'Ultra-low dust and noise free braking performance.',
      category: 'brakes',
      vehicleTypes: ['CAR'],
      brand: 'Bosch',
      price: 1350.0,
      wholesalePrice: 950.0,
      stock: 40,
      shopName: 'Theni Wholesale Auto Spares',
    ),
    SparePartModel(
      id: 'part-004',
      shopId: 'shop-001',
      name: 'MRF Zapper FX 100/80-17 Tubeless Tire',
      description: 'All-weather road grip with extra puncture protection layer.',
      category: 'tires',
      vehicleTypes: ['BIKE'],
      brand: 'MRF',
      price: 2450.0,
      wholesalePrice: 1950.0,
      stock: 18,
      shopName: 'Theni Wholesale Auto Spares',
    ),
    SparePartModel(
      id: 'part-005',
      shopId: 'shop-001',
      name: 'Philips H4 High Beam Halogen Bulb',
      description: '5000K crisp white beam for high night visibility on highways.',
      category: 'lighting',
      vehicleTypes: ['CAR', 'BIKE'],
      brand: 'Philips',
      price: 550.0,
      wholesalePrice: 380.0,
      stock: 60,
      shopName: 'Theni Wholesale Auto Spares',
    ),
  ];

  static List<SparePartModel> getFilteredParts({String? category, String? search}) {
    return sampleParts.where((p) {
      final matchesCat = category == null || category == 'all' || p.category == category;
      final matchesSearch = search == null ||
          search.isEmpty ||
          p.name.toLowerCase().contains(search.toLowerCase()) ||
          (p.brand != null && p.brand!.toLowerCase().contains(search.toLowerCase()));
      return matchesCat && matchesSearch;
    }).toList();
  }

  static BreakdownRequestModel createMockRequest(String issue, double lat, double lng) {
    return BreakdownRequestModel(
      id: 'req-${DateTime.now().millisecondsSinceEpoch}',
      userId: 'user-001',
      mechanicId: 'mech-001',
      issueDesc: issue,
      lat: lat,
      lng: lng,
      address: 'Near Theni Bypass Tollgate, Theni',
      status: 'ACCEPTED',
      estimatedFee: 350.0,
      createdAt: DateTime.now(),
      mechanic: {
        'id': 'mech-001',
        'name': 'Selvam Auto Works',
        'phone': '+91 98421 00001',
        'rating': 4.9,
        'lat': lat + 0.005,
        'lng': lng + 0.005,
      },
    );
  }
}
