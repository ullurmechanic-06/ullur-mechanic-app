import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../theme/app_theme.dart';
import '../../widgets/brutal_card.dart';
import '../../widgets/brutal_button.dart';
import '../../widgets/mechanic_card.dart';
import '../../widgets/custom_app_bar.dart';
import '../../models/mechanic_model.dart';
import '../../services/api_service.dart';
import '../../utils/app_strings.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentTabIndex = 0;
  List<MechanicModel> _mechanics = [];
  bool _isLoading = true;
  String _selectedVehicleFilter = 'ALL';

  @override
  void initState() {
    super.initState();
    _loadNearbyMechanics();
  }

  void _loadNearbyMechanics() async {
    setState(() => _isLoading = true);
    final list = await ApiService.getNearbyMechanics(
      vehicleType: _selectedVehicleFilter == 'ALL' ? null : _selectedVehicleFilter,
    );
    setState(() {
      _mechanics = list;
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<String>(
      valueListenable: AppLocale.currentLanguage,
      builder: (context, lang, _) {
        return Scaffold(
          body: SafeArea(
            child: Column(
              children: [
                // Top Bar with Location & Language Switcher
                _buildHeader(),
                // Main Body Content
                Expanded(
                  child: RefreshIndicator(
                    onRefresh: () async => _loadNearbyMechanics(),
                    child: SingleChildScrollView(
                      physics: const AlwaysScrollableScrollPhysics(),
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Kavalan Police SOS Alert Banner
                          _buildKavalanSosBanner(),
                          const SizedBox(height: 14),
                          // 4 Key Service Cards
                          _buildQuickActionGrid(),
                          const SizedBox(height: 22),
                          // Vehicle Filter Tabs
                          _buildVehicleFilterTabs(),
                          const SizedBox(height: 16),
                          // Nearby Mechanics Header
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                '${AppStrings.tr('nearby_mechanics')} (${_mechanics.length})',
                                style: const TextStyle(
                                  fontSize: 15,
                                  fontWeight: FontWeight.w900,
                                  letterSpacing: 0.5,
                                ),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(
                                  color: UllurColors.successGreen.withOpacity(0.15),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Row(
                                  children: [
                                    const Icon(Icons.circle, color: UllurColors.successGreen, size: 8),
                                    const SizedBox(width: 4),
                                    Text(
                                      AppStrings.tr('live_radar'),
                                      style: const TextStyle(
                                        fontSize: 11,
                                        fontWeight: FontWeight.w900,
                                        color: UllurColors.successGreen,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          // Mechanics List
                          if (_isLoading)
                            const Center(
                              child: Padding(
                                padding: EdgeInsets.all(32.0),
                                child: CircularProgressIndicator(),
                              ),
                            )
                          else if (_mechanics.isEmpty)
                            const BrutalCard(
                              child: Center(
                                child: Text(
                                  'No mechanics available right now in your radius.',
                                  style: TextStyle(fontWeight: FontWeight.w700),
                                ),
                              ),
                            )
                          else
                            ..._mechanics.map((mech) {
                              return MechanicCard(
                                id: mech.id,
                                name: mech.name,
                                rating: mech.rating,
                                totalJobs: mech.totalJobs,
                                distanceKm: mech.distanceKm,
                                estimatedEtaMins: mech.estimatedEtaMins,
                                skills: mech.skills,
                                onRequest: () {
                                  context.push('/home/request');
                                },
                              );
                            }),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          bottomNavigationBar: _buildBottomNav(),
          // Floating Direct Kavalan Police SOS Alert button
          floatingActionButton: FloatingActionButton.extended(
            backgroundColor: UllurColors.emergencyRed,
            foregroundColor: Colors.white,
            elevation: 4,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
              side: const BorderSide(color: UllurColors.darkBlack, width: 2.5),
            ),
            icon: const Icon(Icons.shield_rounded, size: 22),
            label: Text(
              AppLocale.isTamil ? 'காவலன் SOS' : 'POLICE SOS',
              style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 13, letterSpacing: 0.5),
            ),
            onPressed: () => context.push('/home/sos'),
          ),
        );
      },
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: const BoxDecoration(
        color: UllurColors.primaryYellow,
        border: Border(bottom: BorderSide(color: UllurColors.darkBlack, width: 2.5)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: UllurColors.darkBlack,
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Icon(Icons.location_on, color: UllurColors.primaryYellow, size: 20),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  AppStrings.tr('current_location'),
                  style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 0.5),
                ),
                const Text(
                  'Bypass Rd, Theni, Tamil Nadu',
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w900,
                    overflow: TextOffset.ellipsis,
                  ),
                ),
              ],
            ),
          ),
          // Language Switcher Badge
          GestureDetector(
            onTap: () => AppLocale.toggleLanguage(),
            child: Container(
              margin: const EdgeInsets.only(right: 8),
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: UllurColors.darkBlack,
                borderRadius: BorderRadius.circular(6),
                border: Border.all(color: Colors.white, width: 1.5),
              ),
              child: Text(
                AppLocale.isTamil ? '🇬🇧 EN' : '🇮🇳 தமிழ்',
                style: const TextStyle(
                  color: UllurColors.primaryYellow,
                  fontSize: 11,
                  fontWeight: FontWeight.w900,
                ),
              ),
            ),
          ),
          GestureDetector(
            onTap: () => context.push('/home/profile'),
            child: Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: UllurColors.pureWhite,
                shape: BoxShape.circle,
                border: UllurTheme.brutalBorder(width: 2),
                boxShadow: UllurTheme.brutalShadow(offset: 2),
              ),
              child: const Icon(Icons.person, color: UllurColors.darkBlack, size: 20),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildKavalanSosBanner() {
    return BrutalCard(
      backgroundColor: UllurColors.emergencyRed,
      padding: const EdgeInsets.all(14),
      onTap: () => context.push('/home/sos'),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: UllurColors.pureWhite,
              borderRadius: BorderRadius.circular(8),
              border: UllurTheme.brutalBorder(width: 2),
            ),
            child: const Icon(Icons.local_police, color: UllurColors.emergencyRed, size: 28),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  AppLocale.isTamil ? 'காவலன் அவசர உதவி (112 SOS)' : 'KAVALAN POLICE SOS (112)',
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w900,
                    color: UllurColors.pureWhite,
                  ),
                ),
                Text(
                  AppLocale.isTamil ? 'ஆபத்து / தகாத நடத்தை ஏற்பட்டால் உடனடி உதவி' : 'Instant Police Alert on Danger or Misbehavior',
                  style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: UllurColors.pureWhite,
                  ),
                ),
              ],
            ),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: UllurColors.primaryYellow,
              foregroundColor: UllurColors.darkBlack,
              elevation: 0,
              side: const BorderSide(color: UllurColors.darkBlack, width: 2),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            onPressed: () => context.push('/home/sos'),
            child: const Text('SOS', style: TextStyle(fontWeight: FontWeight.w900)),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActionGrid() {
    return Row(
      children: [
        Expanded(
          child: _buildActionTile(
            title: AppStrings.tr('action_breakdown'),
            icon: Icons.car_crash,
            color: UllurColors.primaryYellow,
            onTap: () => context.push('/home/request'),
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: _buildActionTile(
            title: AppStrings.tr('action_spares'),
            icon: Icons.inventory_2,
            color: const Color(0xFFB2FF59), // Lime green
            onTap: () => context.push('/home/parts'),
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: _buildActionTile(
            title: AppStrings.tr('action_tow'),
            icon: Icons.local_shipping,
            color: const Color(0xFF80D8FF), // Sky blue
            onTap: () => context.push('/home/tow'),
          ),
        ),
      ],
    );
  }

  Widget _buildActionTile({
    required String title,
    required IconData icon,
    required Color color,
    required VoidCallback onTap,
  }) {
    return BrutalCard(
      backgroundColor: color,
      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 6),
      onTap: onTap,
      child: Column(
        children: [
          Icon(icon, color: UllurColors.darkBlack, size: 26),
          const SizedBox(height: 6),
          Text(
            title,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w900,
              height: 1.1,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildVehicleFilterTabs() {
    final types = ['ALL', 'CAR', 'BIKE', 'TRUCK', 'AUTO'];
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: types.map((type) {
          final isSelected = _selectedVehicleFilter == type;
          return GestureDetector(
            onTap: () {
              setState(() => _selectedVehicleFilter = type);
              _loadNearbyMechanics();
            },
            child: Container(
              margin: const EdgeInsets.only(right: 8),
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              decoration: BoxDecoration(
                color: isSelected ? UllurColors.darkBlack : UllurColors.pureWhite,
                borderRadius: BorderRadius.circular(8),
                border: UllurTheme.brutalBorder(width: 2),
                boxShadow: isSelected ? UllurTheme.brutalShadow(offset: 2.5) : [],
              ),
              child: Text(
                type,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w900,
                  color: isSelected ? UllurColors.primaryYellow : UllurColors.darkBlack,
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildBottomNav() {
    return Container(
      decoration: const BoxDecoration(
        color: UllurColors.pureWhite,
        border: Border(top: BorderSide(color: UllurColors.darkBlack, width: 2.5)),
      ),
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _buildNavItem(0, Icons.home, AppLocale.isTamil ? 'முகப்பு' : 'Home', () => setState(() => _currentTabIndex = 0)),
          _buildNavItem(1, Icons.shopping_bag, AppLocale.isTamil ? 'உதிரிபாகங்கள்' : 'Spares', () => context.push('/home/parts')),
          _buildNavItem(2, Icons.local_shipping, AppLocale.isTamil ? 'டோயிங்' : 'Tow', () => context.push('/home/tow')),
          _buildNavItem(3, Icons.person, AppLocale.isTamil ? 'சுயவிவரம்' : 'Profile', () => context.push('/home/profile')),
        ],
      ),
    );
  }

  Widget _buildNavItem(int index, IconData icon, String label, VoidCallback onTap) {
    final isSelected = _currentTabIndex == index;
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              color: isSelected ? UllurColors.primaryYellow : UllurColors.darkBlack,
              size: 22,
            ),
            const SizedBox(height: 2),
            Text(
              label,
              style: TextStyle(
                fontSize: 10,
                fontWeight: isSelected ? FontWeight.w900 : FontWeight.w700,
                color: UllurColors.darkBlack,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
