import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../theme/app_theme.dart';
import '../../widgets/brutal_button.dart';
import '../../widgets/brutal_card.dart';
import '../../widgets/custom_app_bar.dart';

class PhoneScreen extends StatefulWidget {
  const PhoneScreen({super.key});

  @override
  State<PhoneScreen> createState() => _PhoneScreenState();
}

class _PhoneScreenState extends State<PhoneScreen> {
  final TextEditingController _phoneController = TextEditingController(text: '9876543210');
  String _selectedRole = 'CUSTOMER';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const CustomAppBar(title: 'LOGIN / REGISTER', showBack: true),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Enter Mobile Number',
                style: TextStyle(fontSize: 26, fontWeight: FontWeight.w900, letterSpacing: -0.5),
              ),
              const SizedBox(height: 6),
              const Text(
                'We will send a 6-digit verification code to your phone.',
                style: TextStyle(fontSize: 14, color: UllurColors.mutedGrey, fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 24),
              // Role Selector
              const Text('Select Your Account Type:', style: TextStyle(fontWeight: FontWeight.w800)),
              const SizedBox(height: 10),
              Row(
                children: [
                  Expanded(
                    child: _buildRoleCard('CUSTOMER', '🚗 Customer', _selectedRole == 'CUSTOMER'),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: _buildRoleCard('MECHANIC', '🔧 Mechanic', _selectedRole == 'MECHANIC'),
                  ),
                ],
              ),
              const SizedBox(height: 24),
              // Phone Input Field
              BrutalCard(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: Row(
                  children: [
                    const Text('🇮🇳 +91', style: TextStyle(fontSize: 17, fontWeight: FontWeight.w900)),
                    const SizedBox(width: 12),
                    Container(height: 24, width: 2, color: UllurColors.darkBlack),
                    const SizedBox(width: 12),
                    Expanded(
                      child: TextField(
                        controller: _phoneController,
                        keyboardType: TextInputType.phone,
                        style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, letterSpacing: 1),
                        decoration: const InputDecoration(
                          hintText: '10-digit number',
                          border: InputBorder.none,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 32),
              BrutalButton(
                text: 'SEND OTP CODE ➔',
                height: 56,
                onPressed: () {
                  final phone = _phoneController.text.trim();
                  if (phone.length >= 10) {
                    context.push('/otp', extra: '+91$phone');
                  } else {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Please enter a valid 10-digit number')),
                    );
                  }
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildRoleCard(String role, String label, bool isSelected) {
    return GestureDetector(
      onTap: () => setState(() => _selectedRole = role),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14),
        decoration: BoxDecoration(
          color: isSelected ? UllurColors.primaryYellow : UllurColors.pureWhite,
          borderRadius: BorderRadius.circular(10),
          border: UllurTheme.brutalBorder(),
          boxShadow: isSelected ? UllurTheme.brutalShadow(offset: 3.0) : [],
        ),
        child: Center(
          child: Text(
            label,
            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900),
          ),
        ),
      ),
    );
  }
}
