import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../utils/app_strings.dart';

class CustomAppBar extends StatelessWidget implements PreferredSizeWidget {
  final String title;
  final List<Widget>? actions;
  final bool showBack;
  final bool showLangSwitch;
  final VoidCallback? onBack;

  const CustomAppBar({
    super.key,
    required this.title,
    this.actions,
    this.showBack = false,
    this.showLangSwitch = true,
    this.onBack,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: UllurColors.primaryYellow,
        border: Border(
          bottom: BorderSide(color: UllurColors.darkBlack, width: 2.5),
        ),
      ),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
          child: Row(
            children: [
              if (showBack) ...[
                GestureDetector(
                  onTap: onBack ?? () => Navigator.of(context).pop(),
                  child: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: UllurColors.pureWhite,
                      border: UllurTheme.brutalBorder(width: 2.0),
                      borderRadius: BorderRadius.circular(8),
                      boxShadow: UllurTheme.brutalShadow(offset: 2.5),
                    ),
                    child: const Icon(Icons.arrow_back, color: UllurColors.darkBlack, size: 20),
                  ),
                ),
                const SizedBox(width: 10),
              ],
              Expanded(
                child: Text(
                  title,
                  maxLines: 1,
                  overflow: TextOffset.ellipsis,
                  style: const TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.w900,
                    color: UllurColors.darkBlack,
                    letterSpacing: -0.5,
                  ),
                ),
              ),
              if (showLangSwitch) ...[
                ValueListenableBuilder<String>(
                  valueListenable: AppLocale.currentLanguage,
                  builder: (context, lang, _) {
                    final isTa = lang == 'ta';
                    return GestureDetector(
                      onTap: () => AppLocale.toggleLanguage(),
                      child: Container(
                        margin: const EdgeInsets.only(right: 6),
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: UllurColors.darkBlack,
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(color: UllurColors.pureWhite, width: 1.5),
                        ),
                        child: Text(
                          isTa ? '🇬🇧 EN' : '🇮🇳 தமிழ்',
                          style: const TextStyle(
                            color: UllurColors.primaryYellow,
                            fontSize: 11,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ],
              if (actions != null) ...actions!,
            ],
          ),
        ),
      ),
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(65);
}
