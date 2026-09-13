import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/user_model.dart';
import '../models/mechanic_model.dart';
import '../models/spare_part_model.dart';
import '../models/breakdown_request_model.dart';
import 'mock_data.dart';

class ApiService {
  static const String baseUrl = 'http://10.0.2.2:5000/api/v1'; // Android emulator localhost
  static String? authToken;

  static void setToken(String token) {
    authToken = token;
  }

  static Map<String, String> get _headers => {
        'Content-Type': 'application/json',
        if (authToken != null) 'Authorization': 'Bearer $authToken',
      };

  // OTP Login
  static Future<UserModel> loginWithPhone(String phone) async {
    try {
      final response = await http
          .post(
            Uri.parse('$baseUrl/auth/verify-otp'),
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode({'phone': phone}),
          )
          .timeout(const Duration(seconds: 4));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['data']?['token'] != null) {
          setToken(data['data']['token']);
        }
        return UserModel.fromJson(data['data']['user']);
      }
    } catch (_) {}

    // Fallback to local offline mode
    return MockData.sampleUser;
  }

  // Get Nearby Mechanics
  static Future<List<MechanicModel>> getNearbyMechanics({
    double lat = 10.0104,
    double lng = 77.4768,
    String? vehicleType,
  }) async {
    try {
      final uri = Uri.parse('$baseUrl/mechanics/nearby').replace(queryParameters: {
        'lat': lat.toString(),
        'lng': lng.toString(),
        if (vehicleType != null) 'vehicleType': vehicleType,
      });

      final response = await http.get(uri, headers: _headers).timeout(const Duration(seconds: 4));
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final list = data['data'] as List;
        return list.map((item) => MechanicModel.fromJson(item)).toList();
      }
    } catch (_) {}

    // Return realistic mock mechanics
    return MockData.sampleMechanics;
  }

  // Create Breakdown Request
  static Future<BreakdownRequestModel> createBreakdownRequest({
    required String issueDesc,
    required double lat,
    required double lng,
    String? vehicleId,
    double estimatedFee = 350.0,
  }) async {
    try {
      final response = await http
          .post(
            Uri.parse('$baseUrl/requests/breakdown'),
            headers: _headers,
            body: jsonEncode({
              'issueDesc': issueDesc,
              'lat': lat,
              'lng': lng,
              'vehicleId': vehicleId,
              'estimatedFee': estimatedFee,
            }),
          )
          .timeout(const Duration(seconds: 4));

      if (response.statusCode == 201 || response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return BreakdownRequestModel.fromJson(data['data']);
      }
    } catch (_) {}

    return MockData.createMockRequest(issueDesc, lat, lng);
  }

  // Get Spare Parts Catalog
  static Future<List<SparePartModel>> getSpareParts({
    String? category,
    String? search,
  }) async {
    try {
      final uri = Uri.parse('$baseUrl/spare-parts').replace(queryParameters: {
        if (category != null && category != 'all') 'category': category,
        if (search != null && search.isNotEmpty) 'search': search,
      });

      final response = await http.get(uri, headers: _headers).timeout(const Duration(seconds: 4));
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final list = data['data'] as List;
        return list.map((item) => SparePartModel.fromJson(item)).toList();
      }
    } catch (_) {}

    return MockData.getFilteredParts(category: category, search: search);
  }
}
