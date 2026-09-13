import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class BrutalCard extends StatelessWidget {
  final Widget child;
  final Color backgroundColor;
  final EdgeInsetsGeometry padding;
  final EdgeInsetsGeometry margin;
  final double borderRadius;
  final double shadowOffset;
  final VoidCallback? onTap;

  const BrutalCard({
    super.key,
    required this.child,
    this.backgroundColor = UllurColors.pureWhite,
    this.padding = const EdgeInsets.all(16.0),
    this.margin = EdgeInsets.zero,
    this.borderRadius = 12.0,
    this.shadowOffset = 4.0,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    Widget card = Container(
      margin: margin,
      padding: padding,
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(borderRadius),
        border: UllurTheme.brutalBorder(),
        boxShadow: UllurTheme.brutalShadow(offset: shadowOffset),
      ),
      child: child,
    );

    if (onTap != null) {
      return GestureDetector(
        onTap: onTap,
        child: card,
      );
    }
    return card;
  }
}
