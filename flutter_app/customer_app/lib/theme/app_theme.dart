import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class UllurColors {
  static const Color primaryYellow = Color(0xFFFFD600); // Mechanic Yellow
  static const Color darkBlack = Color(0xFF0D0D0D); // Deep Black
  static const Color pureWhite = Color(0xFFFFFFFF);
  static const Color background = Color(0xFFF6F6F2); // Off-White brutal background
  static const Color emergencyRed = Color(0xFFFF3B30); // Alert / SOS Red
  static const Color successGreen = Color(0xFF00C851); // Job Done Green
  static const Color electricBlue = Color(0xFF2979FF); // Towing / Parts Accent
  static const Color purpleAccent = Color(0xFF7C4DFF);
  static const Color mutedGrey = Color(0xFF757575);
  static const Color lightGrey = Color(0xFFE0E0E0);
}

class UllurTheme {
  static ThemeData get theme {
    return ThemeData(
      useMaterial3: true,
      scaffoldBackgroundColor: UllurColors.background,
      primaryColor: UllurColors.primaryYellow,
      colorScheme: const ColorScheme.light(
        primary: UllurColors.primaryYellow,
        secondary: UllurColors.darkBlack,
        surface: UllurColors.pureWhite,
        error: UllurColors.emergencyRed,
        onPrimary: UllurColors.darkBlack,
        onSecondary: UllurColors.pureWhite,
        onSurface: UllurColors.darkBlack,
      ),
      textTheme: GoogleFonts.spaceGroteskTextTheme().copyWith(
        displayLarge: GoogleFonts.spaceGrotesk(
          fontSize: 32,
          fontWeight: FontWeight.w900,
          color: UllurColors.darkBlack,
          letterSpacing: -1,
        ),
        headlineMedium: GoogleFonts.spaceGrotesk(
          fontSize: 22,
          fontWeight: FontWeight.w800,
          color: UllurColors.darkBlack,
        ),
        titleLarge: GoogleFonts.spaceGrotesk(
          fontSize: 18,
          fontWeight: FontWeight.w700,
          color: UllurColors.darkBlack,
        ),
        bodyLarge: GoogleFonts.spaceGrotesk(
          fontSize: 16,
          fontWeight: FontWeight.w500,
          color: UllurColors.darkBlack,
        ),
        bodyMedium: GoogleFonts.spaceGrotesk(
          fontSize: 14,
          fontWeight: FontWeight.w500,
          color: UllurColors.darkBlack,
        ),
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: UllurColors.primaryYellow,
        foregroundColor: UllurColors.darkBlack,
        elevation: 0,
        centerTitle: false,
        titleTextStyle: TextStyle(
          fontSize: 20,
          fontWeight: FontWeight.w900,
          color: UllurColors.darkBlack,
        ),
      ),
    );
  }

  // Brutal Box Shadow for offset 3D effect
  static List<BoxShadow> brutalShadow({Color color = UllurColors.darkBlack, double offset = 4.0}) {
    return [
      BoxShadow(
        color: color,
        offset: Offset(offset, offset),
        blurRadius: 0,
        spreadRadius: 0,
      ),
    ];
  }

  // Brutal Border styling
  static Border brutalBorder({Color color = UllurColors.darkBlack, double width = 2.5}) {
    return Border.all(color: color, width: width);
  }
}
