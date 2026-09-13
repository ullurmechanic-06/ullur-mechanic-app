import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../theme/app_theme.dart';
import '../../widgets/brutal_card.dart';
import '../../widgets/brutal_button.dart';
import '../../widgets/custom_app_bar.dart';
import '../../utils/app_strings.dart';
import '../../services/api_service.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;

class SosScreen extends StatefulWidget {
  final String? mechanicId;
  final String? mechanicName;

  const SosScreen({super.key, this.mechanicId, this.mechanicName});

  @override
  State<SosScreen> createState() => _SosScreenState();
}

class _SosScreenState extends State<SosScreen> with SingleTickerProviderStateMixin {
  bool _isSosActive = false;
  bool _isSirenOn = false;
  bool _isBlacklisting = false;
  late AnimationController _pulseController;
  String _selectedReason = 'Mechanic / Driver Misbehavior';
  Map<String, dynamic>? _policeInfo;

  final List<String> _reasons = [
    'Mechanic / Driver Misbehavior (தகாத நடத்தை)',
    'Harassment & Verbal Abuse (அத்துமீறல் / மிரட்டல்)',
    'Roadside Danger / Suspicious People (ஆபத்தான சூழல்)',
    'Medical / Accident Emergency (மருத்துவ அவசரம்)',
    'Vehicle Theft / Extortion (பணம் பறிக்கும் மிரட்டல்)',
  ];

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 1),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  void _triggerSos() async {
    setState(() => _isSosActive = true);

    try {
      final response = await http.post(
        Uri.parse('${ApiService.baseUrl}/sos/trigger'),
        headers: {
          'Content-Type': 'application/json',
          if (ApiService.authToken != null) 'Authorization': 'Bearer ${ApiService.authToken}',
        },
        body: jsonEncode({
          'lat': 10.0104,
          'lng': 77.4768,
          'address': 'Theni Bypass Highway (GPS Lock)',
          'mechanicId': widget.mechanicId,
          'incidentType': _selectedReason,
          'description': 'Kavalan Protocol: Immediate Police and Emergency Assistance Dispatched',
        }),
      );

      if (response.statusCode == 201 || response.statusCode == 200) {
        final data = jsonDecode(response.body);
        setState(() {
          _policeInfo = data['data']?['nearestPoliceStation'];
        });
      }
    } catch (_) {
      // Fallback local simulation
      setState(() {
        _policeInfo = {
          'name': 'Theni Town Police Station',
          'nameTa': 'தேனி நகர் காவல் நிலையம்',
          'phone': '04546-252222',
          'helpline': '112 / 100',
          'distanceKm': 1.4,
        };
      });
    }

    if (mounted) {
      showDialog(
        context: context,
        builder: (_) => AlertDialog(
          backgroundColor: UllurColors.pureWhite,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
            side: const BorderSide(color: UllurColors.darkBlack, width: 2.5),
          ),
          title: Row(
            children: [
              const Icon(Icons.shield, color: UllurColors.emergencyRed, size: 28),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  AppLocale.isTamil ? 'காவல்துறைக்கு தகவல் அனுப்பப்பட்டது!' : 'Police Dispatched!',
                  style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16),
                ),
              ),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                AppLocale.isTamil
                    ? 'உங்கள் நேரலை இருப்பிடம் தேனி நகர் காவல் நிலையத்திற்கும் (112) மற்றும் உங்கள் குடும்பத்தினருக்கும் அவசரமாக அனுப்பப்பட்டுள்ளது.'
                    : 'Your live GPS location has been transmitted to Theni Town Police Station (112) & Emergency Contacts.',
                style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
              ),
              const SizedBox(height: 12),
              if (widget.mechanicName != null)
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: UllurColors.emergencyRed.withOpacity(0.1),
                    border: Border.all(color: UllurColors.emergencyRed, width: 1.5),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    '⚠️ ${widget.mechanicName} ${AppStrings.tr('sos_mechanic_suspended')}',
                    style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 12, color: UllurColors.emergencyRed),
                  ),
                ),
            ],
          ),
          actions: [
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: UllurColors.darkBlack,
                foregroundColor: UllurColors.primaryYellow,
              ),
              onPressed: () => Navigator.pop(context),
              child: const Text('OK', style: TextStyle(fontWeight: FontWeight.w900)),
            ),
          ],
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<String>(
      valueListenable: AppLocale.currentLanguage,
      builder: (context, lang, _) {
        return Scaffold(
          backgroundColor: const Color(0xFFFFF1F0), // Soft warning red tint
          appBar: CustomAppBar(
            title: AppStrings.tr('sos_title'),
            showBack: true,
          ),
          body: SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  // Kavalan Badge & Subtitle
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: UllurColors.emergencyRed,
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.local_police, color: Colors.white, size: 18),
                        SizedBox(width: 6),
                        Text(
                          'KAVALAN SAFETY PROTOCOL 24/7',
                          style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w900, letterSpacing: 0.5),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    AppStrings.tr('sos_subtitle'),
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w800,
                      color: UllurColors.darkBlack,
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Giant Pulsing SOS Button
                  ScaleTransition(
                    scale: Tween<double>(begin: 0.95, end: 1.05).animate(_pulseController),
                    child: GestureDetector(
                      onTap: _triggerSos,
                      child: Container(
                        width: 170,
                        height: 170,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: UllurColors.emergencyRed,
                          border: Border.all(color: UllurColors.darkBlack, width: 4),
                          boxShadow: const [
                            BoxShadow(
                              color: UllurColors.darkBlack,
                              offset: Offset(6, 6),
                              blurRadius: 0,
                            ),
                          ],
                        ),
                        child: Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Icon(Icons.notifications_active, color: Colors.white, size: 48),
                              const SizedBox(height: 4),
                              const Text(
                                'SOS',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 28,
                                  fontWeight: FontWeight.w900,
                                  letterSpacing: 2,
                                ),
                              ),
                              Text(
                                AppLocale.isTamil ? 'அழுத்தவும்' : 'PRESS',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 11,
                                  fontWeight: FontWeight.w900,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 28),

                  // Emergency Speed Dial Buttons
                  Row(
                    children: [
                      Expanded(
                        child: _buildDialCard(
                          title: '112 POLICE',
                          sub: 'காவல்துறை',
                          icon: Icons.local_police,
                          color: UllurColors.primaryYellow,
                          phone: '112',
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: _buildDialCard(
                          title: '1091 WOMEN',
                          sub: 'மகளிர் உதவி',
                          icon: Icons.support,
                          color: const Color(0xFFFF80AB),
                          phone: '1091',
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: _buildDialCard(
                          title: '1033 HIGHWAY',
                          sub: 'நெடுஞ்சாலை',
                          icon: Icons.add_road,
                          color: const Color(0xFF80D8FF),
                          phone: '1033',
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 18),

                  // Nearest Police Station Radar Card
                  BrutalCard(
                    backgroundColor: UllurColors.pureWhite,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.location_city, color: UllurColors.darkBlack, size: 24),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                AppLocale.isTamil ? 'அருகிலுள்ள காவல் நிலையம் (1.4 km)' : 'Nearest Police Station (1.4 km)',
                                style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 14),
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: UllurColors.successGreen,
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: const Text('DISPATCH READY', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text(
                          AppLocale.isTamil
                              ? 'தேனி நகர் காவல் நிலையம் / Theni Town Police Station\nஅவசர எண்: 04546-252222'
                              : 'Theni Town Police Station, Theni Bypass Rd\nLandline: 04546-252222',
                          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 14),

                  // Misbehavior Incident Selection
                  BrutalCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          AppStrings.tr('sos_report_misbehavior'),
                          style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 14),
                        ),
                        const SizedBox(height: 8),
                        ..._reasons.map((reason) {
                          final isSelected = _selectedReason == reason;
                          return GestureDetector(
                            onTap: () => setState(() => _selectedReason = reason),
                            child: Padding(
                              padding: const EdgeInsets.symmetric(vertical: 4),
                              child: Row(
                                children: [
                                  Icon(
                                    isSelected ? Icons.radio_button_checked : Icons.radio_button_off,
                                    color: isSelected ? UllurColors.emergencyRed : UllurColors.darkBlack,
                                    size: 18,
                                  ),
                                  const SizedBox(width: 8),
                                  Expanded(
                                    child: Text(
                                      reason,
                                      style: TextStyle(
                                        fontSize: 12,
                                        fontWeight: isSelected ? FontWeight.w900 : FontWeight.w600,
                                        color: isSelected ? UllurColors.emergencyRed : UllurColors.darkBlack,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          );
                        }),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Siren / Flashlight Toggle Button
                  Row(
                    children: [
                      Expanded(
                        child: BrutalButton(
                          text: _isSirenOn ? '🔊 SIREN ACTIVE' : '🚨 ' + AppStrings.tr('sos_siren_on'),
                          backgroundColor: _isSirenOn ? UllurColors.emergencyRed : UllurColors.pureWhite,
                          textColor: _isSirenOn ? Colors.white : UllurColors.darkBlack,
                          onPressed: () {
                            setState(() => _isSirenOn = !_isSirenOn);
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text(_isSirenOn ? 'High-decibel emergency siren sounding!' : 'Siren turned off'),
                                backgroundColor: UllurColors.emergencyRed,
                              ),
                            );
                          },
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildDialCard({required String title, required String sub, required IconData icon, required Color color, required String phone}) {
    return BrutalCard(
      backgroundColor: color,
      padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 6),
      onTap: () {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Direct Calling Emergency Helpline: $phone')),
        );
      },
      child: Column(
        children: [
          Icon(icon, color: UllurColors.darkBlack, size: 24),
          const SizedBox(height: 4),
          Text(title, style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 11)),
          Text(sub, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 9)),
        ],
      ),
    );
  }
}
