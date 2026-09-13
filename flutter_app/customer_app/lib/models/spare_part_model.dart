class SparePartModel {
  final String id;
  final String shopId;
  final String name;
  final String? description;
  final String category;
  final List<String> vehicleTypes;
  final String? brand;
  final double price;
  final double wholesalePrice;
  final int stock;
  final String? imageUrl;
  final String? shopName;

  SparePartModel({
    required this.id,
    required this.shopId,
    required this.name,
    this.description,
    required this.category,
    required this.vehicleTypes,
    this.brand,
    required this.price,
    required this.wholesalePrice,
    required this.stock,
    this.imageUrl,
    this.shopName,
  });

  factory SparePartModel.fromJson(Map<String, dynamic> json) {
    return SparePartModel(
      id: json['id'] ?? '',
      shopId: json['shopId'] ?? json['shop_id'] ?? '',
      name: json['name'] ?? '',
      description: json['description'],
      category: json['category'] ?? 'general',
      vehicleTypes: List<String>.from(json['vehicleTypes'] ?? ['CAR', 'BIKE']),
      brand: json['brand'],
      price: (json['price'] is num) ? (json['price'] as num).toDouble() : 0.0,
      wholesalePrice: (json['wholesalePrice'] is num)
          ? (json['wholesalePrice'] as num).toDouble()
          : (json['price'] is num ? (json['price'] as num).toDouble() * 0.85 : 0.0),
      stock: json['stock'] ?? 0,
      imageUrl: json['imageUrl'] ?? json['image_url'],
      shopName: json['shop'] != null ? json['shop']['shopName'] : 'Authorized Dealer',
    );
  }

  double get savingsPercentage {
    if (price == 0) return 0;
    return ((price - wholesalePrice) / price) * 100;
  }
}
