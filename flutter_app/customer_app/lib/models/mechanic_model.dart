class MechanicModel {
  final String id;
  final String userId;
  final String name;
  final String phone;
  final String? profileImageUrl;
  final List<String> skills;
  final List<String> vehicleTypes;
  final int experience;
  final double rating;
  final int totalJobs;
  final bool isOnline;
  final double lat;
  final double lng;
  final double distanceKm;
  final int estimatedEtaMins;

  MechanicModel({
    required this.id,
    required this.userId,
    required this.name,
    required this.phone,
    this.profileImageUrl,
    required this.skills,
    required this.vehicleTypes,
    required this.experience,
    required this.rating,
    required this.totalJobs,
    required this.isOnline,
    required this.lat,
    required this.lng,
    required this.distanceKm,
    required this.estimatedEtaMins,
  });

  factory MechanicModel.fromJson(Map<String, dynamic> json) {
    return MechanicModel(
      id: json['id'] ?? '',
      userId: json['userId'] ?? json['user_id'] ?? '',
      name: json['name'] ?? 'Local Mechanic',
      phone: json['phone'] ?? '',
      profileImageUrl: json['profileImageUrl'] ?? json['profile_image_url'],
      skills: List<String>.from(json['skills'] ?? []),
      vehicleTypes: List<String>.from(json['vehicleTypes'] ?? ['CAR', 'BIKE']),
      experience: json['experience'] ?? 1,
      rating: (json['rating'] is num) ? (json['rating'] as num).toDouble() : 4.8,
      totalJobs: json['totalJobs'] ?? json['total_jobs'] ?? 0,
      isOnline: json['isOnline'] ?? json['is_online'] ?? true,
      lat: (json['lat'] is num) ? (json['lat'] as num).toDouble() : 10.0104,
      lng: (json['lng'] is num) ? (json['lng'] as num).toDouble() : 77.4768,
      distanceKm: (json['distanceKm'] is num) ? (json['distanceKm'] as num).toDouble() : 1.5,
      estimatedEtaMins: json['estimatedEtaMins'] ?? 10,
    );
  }
}
