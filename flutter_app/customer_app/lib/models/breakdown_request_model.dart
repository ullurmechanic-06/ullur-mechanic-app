class BreakdownRequestModel {
  final String id;
  final String userId;
  final String? mechanicId;
  final String issueDesc;
  final double lat;
  final double lng;
  final String? address;
  final String status;
  final double? estimatedFee;
  final double? finalFee;
  final DateTime createdAt;
  final Map<String, dynamic>? mechanic;

  BreakdownRequestModel({
    required this.id,
    required this.userId,
    this.mechanicId,
    required this.issueDesc,
    required this.lat,
    required this.lng,
    this.address,
    required this.status,
    this.estimatedFee,
    this.finalFee,
    required this.createdAt,
    this.mechanic,
  });

  factory BreakdownRequestModel.fromJson(Map<String, dynamic> json) {
    return BreakdownRequestModel(
      id: json['id'] ?? '',
      userId: json['userId'] ?? json['user_id'] ?? '',
      mechanicId: json['mechanicId'] ?? json['mechanic_id'],
      issueDesc: json['issueDesc'] ?? json['issue_desc'] ?? '',
      lat: (json['lat'] is num) ? (json['lat'] as num).toDouble() : 0.0,
      lng: (json['lng'] is num) ? (json['lng'] as num).toDouble() : 0.0,
      address: json['address'],
      status: json['status'] ?? 'PENDING',
      estimatedFee: (json['estimatedFee'] is num) ? (json['estimatedFee'] as num).toDouble() : null,
      finalFee: (json['finalFee'] is num) ? (json['finalFee'] as num).toDouble() : null,
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt']) ?? DateTime.now()
          : DateTime.now(),
      mechanic: json['mechanic'],
    );
  }
}
