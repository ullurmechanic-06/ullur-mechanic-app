class TowRequestModel {
  final String id;
  final String userId;
  final String? towPartnerId;
  final double pickupLat;
  final double pickupLng;
  final String pickupAddress;
  final double dropoffLat;
  final double dropoffLng;
  final String dropoffAddress;
  final double distanceKm;
  final double estimatedFee;
  final String status;

  TowRequestModel({
    required this.id,
    required this.userId,
    this.towPartnerId,
    required this.pickupLat,
    required this.pickupLng,
    required this.pickupAddress,
    required this.dropoffLat,
    required this.dropoffLng,
    required this.dropoffAddress,
    required this.distanceKm,
    required this.estimatedFee,
    required this.status,
  });

  factory TowRequestModel.fromJson(Map<String, dynamic> json) {
    return TowRequestModel(
      id: json['id'] ?? '',
      userId: json['userId'] ?? '',
      towPartnerId: json['towPartnerId'],
      pickupLat: (json['pickupLat'] is num) ? (json['pickupLat'] as num).toDouble() : 0.0,
      pickupLng: (json['pickupLng'] is num) ? (json['pickupLng'] as num).toDouble() : 0.0,
      pickupAddress: json['pickupAddress'] ?? 'Pickup location',
      dropoffLat: (json['dropoffLat'] is num) ? (json['dropoffLat'] as num).toDouble() : 0.0,
      dropoffLng: (json['dropoffLng'] is num) ? (json['dropoffLng'] as num).toDouble() : 0.0,
      dropoffAddress: json['dropoffAddress'] ?? 'Drop location',
      distanceKm: (json['distanceKm'] is num) ? (json['distanceKm'] as num).toDouble() : 0.0,
      estimatedFee: (json['estimatedFee'] is num) ? (json['estimatedFee'] as num).toDouble() : 500.0,
      status: json['status'] ?? 'PENDING',
    );
  }
}
