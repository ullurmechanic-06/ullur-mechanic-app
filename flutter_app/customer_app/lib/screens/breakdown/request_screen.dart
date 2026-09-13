import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../theme/app_theme.dart';
import '../../widgets/brutal_button.dart';
import '../../widgets/brutal_card.dart';
import '../../widgets/custom_app_bar.dart';
import '../../services/api_service.dart';

class RequestScreen extends StatefulWidget {
  const RequestScreen({super.key});

  @override
  State<RequestScreen> createState() => _RequestScreenState();
}

class _RequestScreenState extends State<RequestScreen> {
  final TextEditingController _descController = TextEditingController();
  String _selectedProblem = 'Tire Puncture / Flat';
  String _vehicleType = 'CAR';
  bool _isSubmitting = false;

  final List<String> _quickIssues = [
    'Tire Puncture / Flat',
    'Dead Battery / Jumpstart',
    'Engine Smoking / Heat',
    'Brake Failure',
    'Clutch Wire Cut',
    'Self-Start Issue',
    'Out of Fuel / Oil',
    'Other Issue',
  ];

  void _submitRequest() async {
    setState(() => _isSubmitting = true);
    final desc = _descController.text.trim().isEmpty ? _selectedProblem : '${_selectedProblem}: ${_descController.text.trim()}';

    final req = await ApiService.createBreakdownRequest(
      issueDesc: desc,
      lat: 10.0104,
      lng: 77.4768,
      estimatedFee: 350.0,
    );

    setState(() => _isSubmitting = false);
    if (mounted) {
      context.pushReplacement('/home/tracking/${req.id}');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const CustomAppBar(title: 'RAISE BREAKDOWN REQUEST', showBack: true),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Location Card
              BrutalCard(
                backgroundColor: UllurColors.primaryYellow,
                child: Row(
                  children: [
                    const Icon(Icons.gps_fixed, color: UllurColors.darkBlack, size: 28),
                    const SizedBox(width: 12),
                    const Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'BREAKDOWN LOCATION',
                            style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900),
                          ),
                          Text(
                            'Near Theni Bypass Tollgate, Theni',
                            style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900),
                          ),
                        ],
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: UllurColors.darkBlack,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: const Text(
                        'GPS LOCK',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w900,
                          color: UllurColors.primaryYellow,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 18),
              // Vehicle Selector
              const Text('Vehicle Type:', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16)),
              const SizedBox(height: 8),
              Row(
                children: [
                  _buildVehicleOption('CAR', '🚗 Car', _vehicleType == 'CAR'),
                  const SizedBox(width: 8),
                  _buildVehicleOption('BIKE', '🏍️ Bike', _vehicleType == 'BIKE'),
                  const SizedBox(width: 8),
                  _buildVehicleOption('AUTO', '🛺 Auto', _vehicleType == 'AUTO'),
                  const SizedBox(width: 8),
                  _buildVehicleOption('TRUCK', '🚛 Truck', _vehicleType == 'TRUCK'),
                ],
              ),
              const SizedBox(height: 20),
              // Quick Issue Selector
              const Text('Select Issue / Breakdown Type:', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16)),
              const SizedBox(height: 10),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: _quickIssues.map((issue) {
                  final isSelected = _selectedProblem == issue;
                  return GestureDetector(
                    onTap: () => setState(() => _selectedProblem = issue),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      decoration: BoxDecoration(
                        color: isSelected ? UllurColors.darkBlack : UllurColors.pureWhite,
                        borderRadius: BorderRadius.circular(8),
                        border: UllurTheme.brutalBorder(width: 2),
                        boxShadow: isSelected ? UllurTheme.brutalShadow(offset: 2.5) : [],
                      ),
                      child: Text(
                        issue,
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w800,
                          color: isSelected ? UllurColors.primaryYellow : UllurColors.darkBlack,
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
              const SizedBox(height: 20),
              // Additional Details Input
              const Text('Additional Notes (Optional):', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16)),
              const SizedBox(height: 8),
              BrutalCard(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                child: TextField(
                  controller: _descController,
                  maxLines: 3,
                  decoration: const InputDecoration(
                    hintText: 'e.g. White smoke coming from front hood, unable to start...',
                    border: InputBorder.none,
                  ),
                ),
              ),
              const SizedBox(height: 20),
              // Transparent Pricing Card
              BrutalCard(
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Estimated Inspection / Visit Fee', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
                        Text('Includes travel & initial diagnosis', style: TextStyle(fontSize: 11, color: UllurColors.mutedGrey)),
                      ],
                    ),
                    const Text('₹350', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900)),
                  ],
                ),
              ),
              const SizedBox(height: 24),
              BrutalButton(
                text: 'DISPATCH MECHANIC NOW ➔',
                height: 56,
                isLoading: _isSubmitting,
                onPressed: _submitRequest,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildVehicleOption(String type, String label, bool isSelected) {
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _vehicleType = type),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: isSelected ? UllurColors.primaryYellow : UllurColors.pureWhite,
            borderRadius: BorderRadius.circular(8),
            border: UllurTheme.brutalBorder(width: 2),
            boxShadow: isSelected ? UllurTheme.brutalShadow(offset: 2.5) : [],
          ),
          child: Center(
            child: Text(
              label,
              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w900),
            ),
          ),
        ),
      ),
    );
  }
}
