import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../theme/app_theme.dart';
import '../../widgets/brutal_card.dart';
import '../../widgets/brutal_button.dart';
import '../../widgets/custom_app_bar.dart';
import '../../models/spare_part_model.dart';
import '../../services/api_service.dart';

class PartsScreen extends StatefulWidget {
  const PartsScreen({super.key});

  @override
  State<PartsScreen> createState() => _PartsScreenState();
}

class _PartsScreenState extends State<PartsScreen> {
  String _selectedCategory = 'all';
  List<SparePartModel> _parts = [];
  bool _isLoading = true;
  final TextEditingController _searchController = TextEditingController();
  final List<SparePartModel> _cart = [];

  final List<Map<String, String>> _categories = [
    {'id': 'all', 'name': '⚡ All Parts'},
    {'id': 'battery', 'name': '🔋 Batteries'},
    {'id': 'oils', 'name': '🛢️ Oils & Fluids'},
    {'id': 'brakes', 'name': '🛑 Brakes'},
    {'id': 'tires', 'name': '🛞 Tires'},
    {'id': 'lighting', 'name': '💡 Lights'},
  ];

  @override
  void initState() {
    super.initState();
    _loadParts();
  }

  void _loadParts() async {
    setState(() => _isLoading = true);
    final list = await ApiService.getSpareParts(
      category: _selectedCategory,
      search: _searchController.text.trim(),
    );
    setState(() {
      _parts = list;
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: CustomAppBar(
        title: 'WHOLESALE SPARES',
        showBack: true,
        actions: [
          Stack(
            children: [
              IconButton(
                icon: const Icon(Icons.shopping_cart, color: UllurColors.darkBlack, size: 26),
                onPressed: () => context.push('/home/cart'),
              ),
              if (_cart.isNotEmpty)
                Positioned(
                  right: 6,
                  top: 6,
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: const BoxDecoration(
                      color: UllurColors.emergencyRed,
                      shape: BoxShape.circle,
                    ),
                    child: Text(
                      '${_cart.length}',
                      style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
            ],
          ),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Wholesale direct price banner
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              color: UllurColors.darkBlack,
              child: const Row(
                children: [
                  Icon(Icons.verified, color: UllurColors.primaryYellow, size: 18),
                  SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Direct Factory / Wholesale Pricing — Save up to 30%',
                      style: TextStyle(
                        color: UllurColors.pureWhite,
                        fontSize: 12,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            // Search Input
            Padding(
              padding: const EdgeInsets.all(12.0),
              child: BrutalCard(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                child: Row(
                  children: [
                    const Icon(Icons.search, color: UllurColors.darkBlack),
                    const SizedBox(width: 8),
                    Expanded(
                      child: TextField(
                        controller: _searchController,
                        onChanged: (_) => _loadParts(),
                        decoration: const InputDecoration(
                          hintText: 'Search battery, oil, brake pads...',
                          border: InputBorder.none,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            // Category horizontal tabs
            SizedBox(
              height: 40,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 12),
                itemCount: _categories.length,
                itemBuilder: (context, index) {
                  final cat = _categories[index];
                  final isSelected = _selectedCategory == cat['id'];
                  return GestureDetector(
                    onTap: () {
                      setState(() => _selectedCategory = cat['id']!);
                      _loadParts();
                    },
                    child: Container(
                      margin: const EdgeInsets.only(right: 8),
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      decoration: BoxDecoration(
                        color: isSelected ? UllurColors.primaryYellow : UllurColors.pureWhite,
                        borderRadius: BorderRadius.circular(8),
                        border: UllurTheme.brutalBorder(width: 2),
                        boxShadow: isSelected ? UllurTheme.brutalShadow(offset: 2) : [],
                      ),
                      child: Text(
                        cat['name']!,
                        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w900),
                      ),
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 10),
            // Parts List
            Expanded(
              child: _isLoading
                  ? const Center(child: CircularProgressIndicator())
                  : _parts.isEmpty
                      ? const Center(child: Text('No spare parts found'))
                      : ListView.builder(
                          padding: const EdgeInsets.all(12),
                          itemCount: _parts.length,
                          itemBuilder: (context, index) {
                            final part = _parts[index];
                            return BrutalCard(
                              margin: const EdgeInsets.only(bottom: 12),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Container(
                                    width: 80,
                                    height: 80,
                                    decoration: BoxDecoration(
                                      color: UllurColors.background,
                                      borderRadius: BorderRadius.circular(8),
                                      border: UllurTheme.brutalBorder(width: 1.5),
                                    ),
                                    child: Center(
                                      child: Icon(
                                        part.category == 'battery'
                                            ? Icons.battery_charging_full
                                            : part.category == 'oils'
                                                ? Icons.opacity
                                                : part.category == 'brakes'
                                                    ? Icons.disc_full
                                                    : Icons.hardware,
                                        size: 40,
                                        color: UllurColors.darkBlack,
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          part.name,
                                          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900),
                                        ),
                                        const SizedBox(height: 4),
                                        Text(
                                          part.description ?? '',
                                          maxLines: 2,
                                          overflow: TextOffset.ellipsis,
                                          style: const TextStyle(fontSize: 11, color: UllurColors.mutedGrey),
                                        ),
                                        const SizedBox(height: 8),
                                        Row(
                                          children: [
                                            Text(
                                              '₹${part.wholesalePrice.toStringAsFixed(0)}',
                                              style: const TextStyle(
                                                fontSize: 16,
                                                fontWeight: FontWeight.w900,
                                                color: UllurColors.successGreen,
                                              ),
                                            ),
                                            const SizedBox(width: 6),
                                            Text(
                                              '₹${part.price.toStringAsFixed(0)}',
                                              style: const TextStyle(
                                                fontSize: 12,
                                                decoration: TextDecoration.lineThrough,
                                                color: UllurColors.mutedGrey,
                                              ),
                                            ),
                                            const SizedBox(width: 6),
                                            Container(
                                              padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                                              decoration: BoxDecoration(
                                                color: UllurColors.primaryYellow,
                                                borderRadius: BorderRadius.circular(4),
                                              ),
                                              child: Text(
                                                '${part.savingsPercentage.toStringAsFixed(0)}% OFF',
                                                style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w900),
                                              ),
                                            ),
                                          ],
                                        ),
                                      ],
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  IconButton(
                                    style: IconButton.styleFrom(
                                      backgroundColor: UllurColors.primaryYellow,
                                      side: const BorderSide(color: UllurColors.darkBlack, width: 2),
                                    ),
                                    icon: const Icon(Icons.add_shopping_cart, color: UllurColors.darkBlack, size: 20),
                                    onPressed: () {
                                      setState(() => _cart.add(part));
                                      ScaffoldMessenger.of(context).showSnackBar(
                                        SnackBar(
                                          content: Text('${part.name} added to cart!'),
                                          action: SnackBarAction(
                                            label: 'VIEW CART',
                                            textColor: UllurColors.primaryYellow,
                                            onPressed: () => context.push('/home/cart'),
                                          ),
                                        ),
                                      );
                                    },
                                  ),
                                ],
                              ),
                            );
                          },
                        ),
            ),
          ],
        ),
      ),
    );
  }
}
