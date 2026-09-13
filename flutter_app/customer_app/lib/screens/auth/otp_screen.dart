import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../theme/app_theme.dart';
import '../../widgets/brutal_button.dart';
import '../../widgets/brutal_card.dart';
import '../../widgets/custom_app_bar.dart';
import '../../services/api_service.dart';

class OtpScreen extends StatefulWidget {
  final String phone;
  const OtpScreen({super.key, required this.phone});

  @override
  State<OtpScreen> createState() => _OtpScreenState();
}

class _OtpScreenState extends State<OtpScreen> {
  final TextEditingController _otpController = TextEditingController(text: '123456');
  bool _isLoading = false;

  void _verify() async {
    setState(() => _isLoading = true);
    await ApiService.loginWithPhone(widget.phone);
    setState(() => _isLoading = false);

    if (mounted) {
      context.go('/home');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const CustomAppBar(title: 'VERIFY OTP', showBack: true),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Code sent to ${widget.phone}',
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900),
              ),
              const SizedBox(height: 6),
              const Text(
                'Enter the 6-digit code received on SMS (Demo: 123456)',
                style: TextStyle(fontSize: 14, color: UllurColors.mutedGrey, fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 28),
              BrutalCard(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: TextField(
                  controller: _otpController,
                  keyboardType: TextInputType.number,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 12,
                  ),
                  maxLength: 6,
                  decoration: const InputDecoration(
                    hintText: '123456',
                    counterText: '',
                    border: InputBorder.none,
                  ),
                ),
              ),
              const SizedBox(height: 30),
              BrutalButton(
                text: 'VERIFY & ENTER ➔',
                height: 56,
                isLoading: _isLoading,
                onPressed: _verify,
              ),
              const SizedBox(height: 20),
              Center(
                child: TextButton(
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('New OTP sent to your phone')),
                    );
                  },
                  child: const Text(
                    'Resend Code (30s)',
                    style: TextStyle(
                      color: UllurColors.darkBlack,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
