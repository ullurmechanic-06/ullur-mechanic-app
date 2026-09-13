import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../theme/app_theme.dart';
import '../../widgets/brutal_card.dart';
import '../../widgets/brutal_button.dart';
import '../../widgets/custom_app_bar.dart';

class CartScreen extends StatelessWidget {
  const CartScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const CustomAppBar(title: 'MY CART & CHECKOUT', showBack: true),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            children: [
              Expanded(
                child: ListView(
                  children: [
                    BrutalCard(
                      child: Row(
                        children: [
                          Container(
                            width: 60,
                            height: 60,
                            decoration: BoxDecoration(
                              color: UllurColors.background,
                              borderRadius: BorderRadius.circular(8),
                              border: UllurTheme.brutalBorder(width: 1.5),
                            ),
                            child: const Icon(Icons.battery_charging_full, size: 30),
                          ),
                          const SizedBox(width: 12),
                          const Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('Exide Mileage 35Ah Heavy Battery', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 13)),
                                Text('Qty: 1 • Wholesale Direct', style: TextStyle(fontSize: 12, color: UllurColors.mutedGrey)),
                                Text('₹3,450', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 15, color: UllurColors.successGreen)),
                              ],
                            ),
                          ),
                          const Text('Save ₹750', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: UllurColors.emergencyRed)),
                        ],
                      ),
                    ),
                    const SizedBox(height: 14),
                    // Delivery Address
                    BrutalCard(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('DELIVERY ADDRESS', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 12)),
                          const SizedBox(height: 4),
                          const Text('Theni Bypass Road, Near Toll Plaza, Theni, Tamil Nadu', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
                          const SizedBox(height: 8),
                          TextButton(
                            onPressed: () {},
                            child: const Text('Change Delivery Location', style: TextStyle(fontWeight: FontWeight.w800, color: UllurColors.darkBlack)),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 14),
                    // Bill Summary
                    BrutalCard(
                      child: Column(
                        children: [
                          _buildBillRow('Items Total (Retail)', '₹4,200'),
                          _buildBillRow('Wholesale Discount', '- ₹750', isDiscount: true),
                          _buildBillRow('Express Dispatch Fee', 'FREE', isFree: true),
                          const Divider(thickness: 2, color: UllurColors.darkBlack),
                          _buildBillRow('To Pay', '₹3,450', isTotal: true),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              BrutalButton(
                text: 'PLACE ORDER (₹3,450) ➔',
                height: 56,
                backgroundColor: UllurColors.successGreen,
                textColor: Colors.white,
                onPressed: () {
                  showDialog(
                    context: context,
                    builder: (_) => AlertDialog(
                      title: const Text('Order Placed Successfully! 🎉', style: TextStyle(fontWeight: FontWeight.w900)),
                      content: const Text('Your wholesale parts order has been sent to Theni Wholesale Auto Spares. Delivery agent dispatched.'),
                      actions: [
                        TextButton(
                          onPressed: () {
                            Navigator.pop(context);
                            context.go('/home');
                          },
                          child: const Text('TRACK ORDER', style: TextStyle(fontWeight: FontWeight.w900)),
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

  Widget _buildBillRow(String label, String value, {bool isDiscount = false, bool isFree = false, bool isTotal = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: isTotal ? 16 : 13,
              fontWeight: isTotal ? FontWeight.w900 : FontWeight.w600,
            ),
          ),
          Text(
            value,
            style: TextStyle(
              fontSize: isTotal ? 18 : 13,
              fontWeight: FontWeight.w900,
              color: isDiscount
                  ? UllurColors.emergencyRed
                  : isFree
                      ? UllurColors.successGreen
                      : UllurColors.darkBlack,
            ),
          ),
        ],
      ),
    );
  }
}
