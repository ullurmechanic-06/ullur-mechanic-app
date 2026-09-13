import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../theme/app_theme.dart';
import '../../widgets/brutal_card.dart';
import '../../widgets/brutal_button.dart';
import '../../widgets/custom_app_bar.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const CustomAppBar(title: 'MY ACCOUNT & GARAGE', showBack: true),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(16.0),
          children: [
            // User Header Card
            BrutalCard(
              backgroundColor: UllurColors.primaryYellow,
              child: Row(
                children: [
                  Container(
                    width: 56,
                    height: 56,
                    decoration: BoxDecoration(
                      color: UllurColors.darkBlack,
                      shape: BoxShape.circle,
                      border: UllurTheme.brutalBorder(color: UllurColors.pureWhite, width: 2),
                    ),
                    child: const Icon(Icons.person, color: UllurColors.primaryYellow, size: 32),
                  ),
                  const SizedBox(width: 14),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Murugan Swamy', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900)),
                        Text('+91 98765 43210', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700)),
                        Text('Theni, Tamil Nadu', style: TextStyle(fontSize: 12, color: UllurColors.darkBlack)),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: UllurColors.darkBlack,
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: const Text('PRO', style: TextStyle(color: UllurColors.primaryYellow, fontWeight: FontWeight.w900, fontSize: 11)),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 18),
            // My Saved Vehicles Section
            const Text('MY REGISTERED VEHICLES (2)', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900, letterSpacing: 0.5)),
            const SizedBox(height: 10),
            _buildVehicleCard('Hyundai i20 Asta', 'TN-60-AZ-1234', 'Polar White • Car', Icons.directions_car),
            _buildVehicleCard('Royal Enfield Classic 350', 'TN-60-BU-5678', 'Stealth Black • Bike', Icons.two_wheeler),
            const SizedBox(height: 6),
            BrutalButton(
              text: '+ ADD NEW VEHICLE',
              height: 44,
              backgroundColor: UllurColors.pureWhite,
              textColor: UllurColors.darkBlack,
              onPressed: () {},
            ),
            const SizedBox(height: 24),
            // App Preferences & Settings
            const Text('SETTINGS & LANGUAGE', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900, letterSpacing: 0.5)),
            const SizedBox(height: 10),
            BrutalCard(
              child: Column(
                children: [
                  _buildSettingItem(Icons.language, 'App Language', 'English / தமிழ் (Tamil)'),
                  const Divider(thickness: 1.5, color: UllurColors.darkBlack),
                  _buildSettingItem(Icons.history, 'Past Repair Records', '3 Completed jobs'),
                  const Divider(thickness: 1.5, color: UllurColors.darkBlack),
                  _buildSettingItem(Icons.account_balance_wallet, 'Ullur Wallet & Refunds', 'Balance: ₹0.00'),
                  const Divider(thickness: 1.5, color: UllurColors.darkBlack),
                  _buildSettingItem(Icons.support_agent, '24/7 Roadside Support', 'Call Helpline 1800-ULLUR'),
                ],
              ),
            ),
            const SizedBox(height: 20),
            BrutalButton(
              text: 'LOGOUT ACCOUNT',
              height: 48,
              backgroundColor: UllurColors.emergencyRed,
              textColor: Colors.white,
              onPressed: () => context.go('/splash'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildVehicleCard(String title, String regNo, String subtitle, IconData icon) {
    return BrutalCard(
      margin: const EdgeInsets.only(bottom: 10),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: UllurColors.primaryYellow,
              borderRadius: BorderRadius.circular(8),
              border: UllurTheme.brutalBorder(width: 1.5),
            ),
            child: Icon(icon, color: UllurColors.darkBlack, size: 24),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 14)),
                Text(regNo, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 12, color: UllurColors.emergencyRed)),
                Text(subtitle, style: const TextStyle(fontSize: 11, color: UllurColors.mutedGrey)),
              ],
            ),
          ),
          const Icon(Icons.check_circle, color: UllurColors.successGreen, size: 20),
        ],
      ),
    );
  }

  Widget _buildSettingItem(IconData icon, String title, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          Icon(icon, color: UllurColors.darkBlack, size: 22),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13)),
                Text(value, style: const TextStyle(fontSize: 11, color: UllurColors.mutedGrey, fontWeight: FontWeight.w600)),
              ],
            ),
          ),
          const Icon(Icons.arrow_forward_ios, size: 14, color: UllurColors.darkBlack),
        ],
      ),
    );
  }
}
