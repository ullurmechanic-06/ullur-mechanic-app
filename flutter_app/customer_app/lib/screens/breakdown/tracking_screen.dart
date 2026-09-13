import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../theme/app_theme.dart';
import '../../widgets/brutal_button.dart';
import '../../widgets/brutal_card.dart';
import '../../widgets/custom_app_bar.dart';
import '../../utils/app_strings.dart';
import '../../services/razorpay_service.dart';

class TrackingScreen extends StatefulWidget {
  final String requestId;
  const TrackingScreen({super.key, required this.requestId});

  @override
  State<TrackingScreen> createState() => _TrackingScreenState();
}

class _TrackingScreenState extends State<TrackingScreen> {
  int _currentStep = 1; // 0: Assigned, 1: En Route, 2: Arrived, 3: Completed
  final int _etaMinutes = 7;
  bool _isProcessingPayment = false;

  void _payWithRazorpay() async {
    setState(() => _isProcessingPayment = true);
    
    // Create Razorpay order
    final order = await RazorpayService.createOrder(
      amount: 350.0,
      requestId: widget.requestId,
    );

    // Simulate instant Razorpay checkout modal
    if (mounted) {
      showDialog(
        context: context,
        builder: (_) => AlertDialog(
          backgroundColor: UllurColors.pureWhite,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
            side: const BorderSide(color: UllurColors.darkBlack, width: 2.5),
          ),
          title: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: const Color(0xFF0C2340), // Razorpay Blue
                  borderRadius: BorderRadius.circular(6),
                ),
                child: const Text('R', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900)),
              ),
              const SizedBox(width: 8),
              const Text('Razorpay Checkout', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16)),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Amount Payable: ₹350.00', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 15)),
              const SizedBox(height: 4),
              const Text('Merchant: Ullur Mechanic Services', style: TextStyle(fontSize: 12, color: UllurColors.mutedGrey)),
              const Divider(thickness: 1.5, color: UllurColors.darkBlack),
              const SizedBox(height: 8),
              const Text('Select Payment Option:', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 13)),
              const SizedBox(height: 8),
              _buildPayOption('⚡ Google Pay / PhonePe / Paytm UPI'),
              _buildPayOption('💳 Debit / Credit Card (Visa/Mastercard)'),
              _buildPayOption('🏦 Net Banking / Wallet'),
            ],
          ),
          actions: [
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: UllurColors.successGreen,
                foregroundColor: Colors.white,
                side: const BorderSide(color: UllurColors.darkBlack, width: 2),
              ),
              onPressed: () async {
                Navigator.pop(context);
                await RazorpayService.verifyPayment(
                  orderId: order?['razorpayOrderId'] ?? 'order_123',
                  paymentId: 'pay_${DateTime.now().millisecondsSinceEpoch}',
                );
                setState(() => _isProcessingPayment = false);
                if (mounted) {
                  showDialog(
                    context: context,
                    builder: (_) => AlertDialog(
                      title: const Text('Payment Successful! 🎉', style: TextStyle(fontWeight: FontWeight.w900)),
                      content: Text(AppStrings.tr('payment_success')),
                      actions: [
                        TextButton(
                          onPressed: () {
                            Navigator.pop(context);
                            context.go('/home');
                          },
                          child: const Text('BACK TO HOME', style: TextStyle(fontWeight: FontWeight.w900)),
                        ),
                      ],
                    ),
                  );
                }
              },
              child: const Text('PAY ₹350 VIA RAZORPAY', style: TextStyle(fontWeight: FontWeight.w900)),
            ),
          ],
        ),
      );
    }
  }

  Widget _buildPayOption(String text) {
    return Container(
      margin: const EdgeInsets.only(bottom: 6),
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: UllurColors.background,
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: UllurColors.darkBlack, width: 1.5),
      ),
      child: Text(text, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 12)),
    );
  }

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<String>(
      valueListenable: AppLocale.currentLanguage,
      builder: (context, lang, _) {
        return Scaffold(
          appBar: CustomAppBar(
            title: AppStrings.tr('tracking_title'),
            showBack: true,
            onBack: () => context.go('/home'),
            actions: [
              // Safety SOS Quick Alert in tracking bar
              IconButton(
                icon: const Icon(Icons.shield, color: UllurColors.emergencyRed, size: 28),
                onPressed: () {
                  context.push(
                    '/home/sos',
                    extra: {
                      'mechanicId': 'mech-001',
                      'mechanicName': 'Selvam Auto Works',
                    },
                  );
                },
              ),
            ],
          ),
          body: SafeArea(
            child: Column(
              children: [
                // Top Status Progression
                _buildStatusProgress(),
                // Map Radar Simulation
                Expanded(
                  child: Stack(
                    children: [
                      _buildMapSimulation(),
                      // Floating ETA Card
                      Positioned(
                        top: 14,
                        left: 14,
                        right: 14,
                        child: BrutalCard(
                          backgroundColor: UllurColors.primaryYellow,
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Row(
                                children: [
                                  const Icon(Icons.two_wheeler, color: UllurColors.darkBlack, size: 24),
                                  const SizedBox(width: 8),
                                  Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        AppStrings.tr('on_the_way'),
                                        style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w900),
                                      ),
                                      Text(
                                        'Arriving in $_etaMinutes mins (1.2 km)',
                                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                              // SOS Report Button
                              GestureDetector(
                                onTap: () {
                                  context.push(
                                    '/home/sos',
                                    extra: {
                                      'mechanicId': 'mech-001',
                                      'mechanicName': 'Selvam Auto Works',
                                    },
                                  );
                                },
                                child: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: UllurColors.emergencyRed,
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: const Row(
                                    children: [
                                      Icon(Icons.shield, color: Colors.white, size: 14),
                                      SizedBox(width: 4),
                                      Text(
                                        'SOS',
                                        style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 11),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                // Bottom Mechanic Info & Razorpay Checkout
                _buildMechanicBottomCard(),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildStatusProgress() {
    final steps = [
      AppStrings.tr('step_assigned'),
      AppStrings.tr('step_enroute'),
      AppStrings.tr('step_arrived'),
      AppStrings.tr('step_fixing'),
      AppStrings.tr('step_done'),
    ];
    return Container(
      color: UllurColors.pureWhite,
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: List.generate(steps.length, (index) {
          final isPassed = index <= _currentStep;
          final isCurrent = index == _currentStep;
          return Row(
            children: [
              Column(
                children: [
                  Container(
                    width: 24,
                    height: 24,
                    decoration: BoxDecoration(
                      color: isPassed ? UllurColors.primaryYellow : UllurColors.lightGrey,
                      shape: BoxShape.circle,
                      border: UllurTheme.brutalBorder(width: isCurrent ? 2.5 : 1.5),
                    ),
                    child: Center(
                      child: isPassed
                          ? const Icon(Icons.check, size: 12, color: UllurColors.darkBlack)
                          : Text('${index + 1}', style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold)),
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    steps[index],
                    style: TextStyle(
                      fontSize: 9,
                      fontWeight: isCurrent ? FontWeight.w900 : FontWeight.w600,
                    ),
                  ),
                ],
              ),
              if (index < steps.length - 1)
                Container(
                  width: 20,
                  height: 3,
                  margin: const EdgeInsets.only(bottom: 12),
                  color: index < _currentStep ? UllurColors.primaryYellow : UllurColors.lightGrey,
                ),
            ],
          );
        }),
      ),
    );
  }

  Widget _buildMapSimulation() {
    return Container(
      color: const Color(0xFFE8ECEF),
      child: Center(
        child: Stack(
          alignment: Alignment.center,
          children: [
            Container(
              width: 240,
              height: 240,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(color: UllurColors.primaryYellow.withOpacity(0.5), width: 2),
              ),
            ),
            Container(
              width: 140,
              height: 140,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(color: UllurColors.primaryYellow, width: 2),
              ),
            ),
            // User Location
            Positioned(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: UllurColors.emergencyRed,
                      shape: BoxShape.circle,
                      border: UllurTheme.brutalBorder(width: 2),
                    ),
                    child: const Icon(Icons.car_crash, color: Colors.white, size: 20),
                  ),
                  const SizedBox(height: 4),
                  const Text('YOU', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900)),
                ],
              ),
            ),
            // Mechanic Location
            Positioned(
              top: 90,
              right: 70,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: UllurColors.primaryYellow,
                      shape: BoxShape.circle,
                      border: UllurTheme.brutalBorder(width: 2),
                    ),
                    child: const Icon(Icons.build_circle, color: UllurColors.darkBlack, size: 20),
                  ),
                  const SizedBox(height: 4),
                  const Text('SELVAM (1.2 km)', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMechanicBottomCard() {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: const BoxDecoration(
        color: UllurColors.pureWhite,
        border: Border(top: BorderSide(color: UllurColors.darkBlack, width: 2.5)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            children: [
              Container(
                width: 46,
                height: 46,
                decoration: BoxDecoration(
                  color: UllurColors.primaryYellow,
                  shape: BoxShape.circle,
                  border: UllurTheme.brutalBorder(width: 2),
                ),
                child: const Icon(Icons.person, color: UllurColors.darkBlack, size: 26),
              ),
              const SizedBox(width: 10),
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Selvam Auto Works', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w900)),
                    Row(
                      children: [
                        Icon(Icons.star, color: Colors.amber, size: 14),
                        SizedBox(width: 4),
                        Text('4.9 (148 jobs)', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                        SizedBox(width: 6),
                        Text('• Verified', style: TextStyle(fontSize: 11, color: UllurColors.successGreen, fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ],
                ),
              ),
              // Misbehavior / SOS Report Icon Button
              IconButton(
                style: IconButton.styleFrom(
                  backgroundColor: UllurColors.emergencyRed.withOpacity(0.15),
                  side: const BorderSide(color: UllurColors.emergencyRed, width: 1.5),
                ),
                icon: const Icon(Icons.report_problem, color: UllurColors.emergencyRed),
                tooltip: 'Report Misbehavior / Police SOS',
                onPressed: () {
                  context.push(
                    '/home/sos',
                    extra: {
                      'mechanicId': 'mech-001',
                      'mechanicName': 'Selvam Auto Works',
                    },
                  );
                },
              ),
              const SizedBox(width: 4),
              IconButton(
                style: IconButton.styleFrom(
                  backgroundColor: UllurColors.primaryYellow,
                  side: const BorderSide(color: UllurColors.darkBlack, width: 1.5),
                ),
                icon: const Icon(Icons.call, color: UllurColors.darkBlack, size: 20),
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Calling Selvam: +91 98421 00001')),
                  );
                },
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: BrutalButton(
                  text: '💳 ' + AppStrings.tr('pay_with_razorpay'),
                  height: 48,
                  backgroundColor: UllurColors.successGreen,
                  textColor: Colors.white,
                  isLoading: _isProcessingPayment,
                  onPressed: _payWithRazorpay,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
