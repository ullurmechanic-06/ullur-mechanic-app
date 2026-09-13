import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../theme/app_theme.dart';
import '../../widgets/brutal_card.dart';
import '../../widgets/brutal_button.dart';
import '../../widgets/custom_app_bar.dart';

class TowScreen extends StatefulWidget {
  const TowScreen({super.key});

  @override
  State<TowScreen> createState() => _TowScreenState();
}

class _TowScreenState extends State<TowScreen> {
  String _selectedTowType = 'Flatbed Hydraulic';
  final double _distanceKm = 8.5;

  final List<Map<String, dynamic>> _towTruckTypes = [
    {
      'type': 'Flatbed Hydraulic',
      'desc': 'Safe zero-ground touch for Cars, SUVs & Premium Bikes',
      'baseRate': 600,
      'perKm': 45,
      'icon': Icons.local_shipping,
    },
    {
      'type': 'Wheel-Lift Tow',
      'desc': 'Quick city towing for small cars & sedans',
      'baseRate': 450,
      'perKm': 35,
      'icon': Icons.rv_hookup,
    },
    {
      'type': 'Heavy Duty Recovery',
      'desc': 'For Vans, Commercial Trucks & Buses',
      'baseRate': 1200,
      'perKm': 70,
      'icon': Icons.fire_truck,
    },
  ];

  @override
  Widget build(BuildContext context) {
    final selectedInfo = _towTruckTypes.firstWhere((t) => t['type'] == _selectedTowType);
    final estimatedFee = (selectedInfo['baseRate'] as int) + (_distanceKm * (selectedInfo['perKm'] as int)).round();

    return Scaffold(
      appBar: const CustomAppBar(title: 'VEHICLE TOWING & PICKUP', showBack: true),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Pickup & Destination selector
              BrutalCard(
                child: Column(
                  children: [
                    _buildLocationPoint(
                      icon: Icons.my_location,
                      color: UllurColors.emergencyRed,
                      label: 'PICKUP LOCATION',
                      address: 'Theni Highway Junction, Theni',
                    ),
                    const Padding(
                      padding: EdgeInsets.symmetric(horizontal: 16),
                      child: Divider(thickness: 1.5, color: UllurColors.darkBlack),
                    ),
                    _buildLocationPoint(
                      icon: Icons.garage,
                      color: UllurColors.successGreen,
                      label: 'DROP LOCATION / DESTINATION GARAGE',
                      address: 'Madurai Road Auto Clinic, Theni (8.5 km)',
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
              const Text('Select Tow Truck Type:', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900)),
              const SizedBox(height: 10),
              ..._towTruckTypes.map((truck) {
                final isSelected = _selectedTowType == truck['type'];
                return BrutalCard(
                  margin: const EdgeInsets.only(bottom: 10),
                  backgroundColor: isSelected ? UllurColors.primaryYellow : UllurColors.pureWhite,
                  onTap: () => setState(() => _selectedTowType = truck['type']),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: UllurColors.pureWhite,
                          borderRadius: BorderRadius.circular(8),
                          border: UllurTheme.brutalBorder(width: 1.5),
                        ),
                        child: Icon(truck['icon'] as IconData, color: UllurColors.darkBlack, size: 28),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(truck['type'], style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 14)),
                            Text(truck['desc'], style: const TextStyle(fontSize: 11, color: UllurColors.mutedGrey)),
                          ],
                        ),
                      ),
                      Text(
                        '₹${truck['baseRate']}+',
                        style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 15),
                      ),
                    ],
                  ),
                );
              }),
              const SizedBox(height: 14),
              // Fare Breakdown
              BrutalCard(
                backgroundColor: const Color(0xFFE8F5E9),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Estimated Towing Fare', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 13)),
                        Text('8.5 km • Includes roadside hookup', style: const TextStyle(fontSize: 11, color: UllurColors.mutedGrey)),
                      ],
                    ),
                    Text('₹$estimatedFee', style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: UllurColors.successGreen)),
                  ],
                ),
              ),
              const SizedBox(height: 24),
              BrutalButton(
                text: 'DISPATCH TOW VEHICLE ➔',
                height: 56,
                onPressed: () {
                  showDialog(
                    context: context,
                    builder: (_) => AlertDialog(
                      title: const Text('Tow Request Dispatched! 🚛', style: TextStyle(fontWeight: FontWeight.w900)),
                      content: const Text('Tamil Nadu Highway Towing partner is en route to your vehicle location.'),
                      actions: [
                        TextButton(
                          onPressed: () {
                            Navigator.pop(context);
                            context.go('/home');
                          },
                          child: const Text('TRACK TOW TRUCK', style: TextStyle(fontWeight: FontWeight.w900)),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildLocationPoint({required IconData icon, required Color color, required String label, required String address}) {
    return Row(
      children: [
        Icon(icon, color: color, size: 24),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 0.5)),
              Text(address, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800)),
            ],
          ),
        ),
      ],
    );
  }
}
