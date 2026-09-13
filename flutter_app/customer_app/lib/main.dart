import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'theme/app_theme.dart';
import 'utils/app_strings.dart';
import 'screens/splash_screen.dart';
import 'screens/auth/otp_screen.dart';
import 'screens/auth/phone_screen.dart';
import 'screens/home/home_screen.dart';
import 'screens/breakdown/request_screen.dart';
import 'screens/breakdown/tracking_screen.dart';
import 'screens/parts/parts_screen.dart';
import 'screens/parts/cart_screen.dart';
import 'screens/tow/tow_screen.dart';
import 'screens/profile/profile_screen.dart';
import 'screens/sos/sos_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Force portrait orientation
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  // Status bar styling
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.dark,
  ));

  runApp(const ProviderScope(child: UllurMechanicApp()));
}

final _router = GoRouter(
  initialLocation: '/splash',
  routes: [
    GoRoute(path: '/splash', builder: (_, __) => const SplashScreen()),
    GoRoute(path: '/phone', builder: (_, __) => const PhoneScreen()),
    GoRoute(path: '/otp', builder: (_, state) => OtpScreen(phone: state.extra as String? ?? '')),
    GoRoute(
      path: '/home',
      builder: (_, __) => const HomeScreen(),
      routes: [
        GoRoute(path: 'request', builder: (_, __) => const RequestScreen()),
        GoRoute(path: 'tracking/:id', builder: (_, state) => TrackingScreen(requestId: state.pathParameters['id']!)),
        GoRoute(path: 'parts', builder: (_, __) => const PartsScreen()),
        GoRoute(path: 'cart', builder: (_, __) => const CartScreen()),
        GoRoute(path: 'tow', builder: (_, __) => const TowScreen()),
        GoRoute(path: 'profile', builder: (_, __) => const ProfileScreen()),
        GoRoute(
          path: 'sos',
          builder: (_, state) {
            final extra = state.extra as Map<String, dynamic>?;
            return SosScreen(
              mechanicId: extra?['mechanicId'],
              mechanicName: extra?['mechanicName'],
            );
          },
        ),
      ],
    ),
  ],
);

class UllurMechanicApp extends StatelessWidget {
  const UllurMechanicApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<String>(
      valueListenable: AppLocale.currentLanguage,
      builder: (context, lang, _) {
        return MaterialApp.router(
          title: 'Ullur Mechanic',
          theme: UllurTheme.theme,
          routerConfig: _router,
          debugShowCheckedModeBanner: false,
        );
      },
    );
  }
}
