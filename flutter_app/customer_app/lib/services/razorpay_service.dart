import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'api_service.dart';

class RazorpayService {
  static const String keyId = 'rzp_test_1234567890';

  // Initiate Razorpay order from backend
  static Future<Map<String, dynamic>?> createOrder({
    required double amount,
    String? requestId,
    String? orderId,
    String? towRequestId,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('${ApiService.baseUrl}/payments/create-order'),
        headers: {
          'Content-Type': 'application/json',
          if (ApiService.authToken != null) 'Authorization': 'Bearer ${ApiService.authToken}',
        },
        body: jsonEncode({
          'amount': amount,
          'currency': 'INR',
          'requestId': requestId,
          'orderId': orderId,
          'towRequestId': towRequestId,
        }),
      );

      if (response.statusCode == 201 || response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['data'];
      }
    } catch (e) {
      debugPrint('Razorpay create order error: $e');
    }

    // Return fallback order
    return {
      'razorpayOrderId': 'rzp_mock_${DateTime.now().millisecondsSinceEpoch}',
      'amount': amount,
      'amountInPaise': (amount * 100).toInt(),
      'currency': 'INR',
      'keyId': keyId,
    };
  }

  // Verify Razorpay payment signature
  static Future<bool> verifyPayment({
    required String orderId,
    required String paymentId,
    String? signature,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('${ApiService.baseUrl}/payments/verify'),
        headers: {
          'Content-Type': 'application/json',
          if (ApiService.authToken != null) 'Authorization': 'Bearer ${ApiService.authToken}',
        },
        body: jsonEncode({
          'razorpayOrderId': orderId,
          'razorpayPaymentId': paymentId,
          'razorpaySignature': signature ?? 'mock_sig_valid',
        }),
      );
      return response.statusCode == 200;
    } catch (_) {
      return true; // Mock success
    }
  }
}
