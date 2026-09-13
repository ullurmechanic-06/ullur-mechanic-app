import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../theme/app_theme.dart';
import '../widgets/brutal_button.dart';

class SplashScreen extends StatelessWidget {
  const SplashScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: UllurColors.primaryYellow,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 32.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Spacer(),
              // App Logo / Badge
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: UllurColors.darkBlack,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: UllurTheme.brutalShadow(color: UllurColors.pureWhite, offset: 4),
                ),
                child: const Icon(
                  Icons.car_repair,
                  color: UllurColors.primaryYellow,
                  size: 56,
                ),
              ),
              const SizedBox(height: 24),
              const Text(
                'ULLUR\nMECHANIC',
                style: TextStyle(
                  fontSize: 44,
                  fontWeight: FontWeight.w900,
                  color: UllurColors.darkBlack,
                  height: 0.95,
                  letterSpacing: -1.5,
                ),
              ),
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: UllurColors.darkBlack,
                  borderRadius: BorderRadius.circular(6),
                ),
                child: const Text(
                  '⚡ ON-DEMAND BREAKDOWN & WHOLESALE SPARES',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w900,
                    color: UllurColors.pureWhite,
                    letterSpacing: 0.5,
                  ),
                ),
              ),
              const SizedBox(height: 16),
              const Text(
                'Roadside vehicle breakdown? Get nearest expert mechanics dispatched in minutes + wholesale spare parts delivered directly.',
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w600,
                  color: UllurColors.darkBlack,
                  height: 1.4,
                ),
              ),
              const Spacer(),
              BrutalButton(
                text: 'GET STARTED ➔',
                backgroundColor: UllurColors.darkBlack,
                textColor: UllurColors.primaryYellow,
                height: 56,
                onPressed: () => context.go('/phone'),
              ),
              const SizedBox(height: 12),
              Center(
                child: TextButton(
                  onPressed: () => context.go('/home'),
                  child: const Text(
                    'Explore as Guest',
                    style: TextStyle(
                      color: UllurColors.darkBlack,
                      fontWeight: FontWeight.w800,
                      decoration: TextDecoration.underline,
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
