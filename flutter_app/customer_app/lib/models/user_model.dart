class UserModel {
  final String id;
  final String name;
  final String phone;
  final String? email;
  final String? profileImageUrl;
  final String role;
  final bool isVerified;

  UserModel({
    required this.id,
    required this.name,
    required this.phone,
    this.email,
    this.profileImageUrl,
    required this.role,
    this.isVerified = false,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      phone: json['phone'] ?? '',
      email: json['email'],
      profileImageUrl: json['profileImageUrl'] ?? json['profile_image_url'],
      role: json['role'] ?? 'CUSTOMER',
      isVerified: json['isVerified'] ?? json['is_verified'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'phone': phone,
      'email': email,
      'profileImageUrl': profileImageUrl,
      'role': role,
      'isVerified': isVerified,
    };
  }
}
