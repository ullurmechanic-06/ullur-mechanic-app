import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

void main() {
  runApp(const MechanicApp());
}

class MechanicApp extends StatelessWidget {
  const MechanicApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Ullur Mechanic Partner',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        scaffoldBackgroundColor: const Color(0xFFF6F6F2),
        textTheme: GoogleFonts.spaceGroteskTextTheme(),
      ),
      home: const MechanicDashboardScreen(),
    );
  }
}

class MechanicDashboardScreen extends StatefulWidget {
  const MechanicDashboardScreen({super.key});

  @override
  State<MechanicDashboardScreen> createState() => _MechanicDashboardScreenState();
}

class _MechanicDashboardScreenState extends State<MechanicDashboardScreen> {
  bool _isOnline = true;
  bool _hasActiveJob = true;
  int _jobStage = 1; // 0: Accepted, 1: En Route, 2: Diagnosing, 3: Completed

  final List<String> _stages = ['Accepted', 'En Route', 'Diagnosing', 'Completed'];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: const Color(0xFFFFD600),
        foregroundColor: const Color(0xFF0D0D0D),
        elevation: 0,
        title: const Text(
          'SELVAM AUTO WORKS (PARTNER)',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900),
        ),
        actions: [
          Row(
            children: [
              Text(
                _isOnline ? 'ONLINE' : 'OFFLINE',
                style: TextStyle(
                  fontWeight: FontWeight.w900,
                  fontSize: 12,
                  color: _isOnline ? const Color(0xFF00C851) : Colors.grey,
                ),
              ),
              Switch(
                value: _isOnline,
                activeColor: const Color(0xFF00C851),
                onChanged: (val) => setState(() => _isOnline = val),
              ),
            ],
          ),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Earnings summary card
              _buildEarningsCard(),
              const SizedBox(height: 18),
              // Active breakdown job
              if (_hasActiveJob) ...[
                const Text(
                  '🔥 ACTIVE BREAKDOWN JOB',
                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900, letterSpacing: 0.5),
                ),
                const SizedBox(height: 10),
                _buildActiveJobCard(),
              ] else ...[
                const Center(
                  child: Padding(
                    padding: EdgeInsets.all(40.0),
                    child: Column(
                      children: [
                        Icon(Icons.radar, size: 60, color: Color(0xFFFFD600)),
                        SizedBox(height: 12),
                        Text(
                          'Radar Active — Waiting for nearby breakdown requests...',
                          textAlign: TextAlign.center,
                          style: TextStyle(fontWeight: FontWeight.w800),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildEarningsCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF0D0D0D),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFF0D0D0D), width: 2.5),
      ),
      child: const Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text("TODAY'S EARNINGS", style: TextStyle(color: Colors.grey, fontSize: 11, fontWeight: FontWeight.bold)),
              SizedBox(height: 4),
              Text('₹2,450', style: TextStyle(color: Color(0xFFFFD600), fontSize: 26, fontWeight: FontWeight.w900)),
            ],
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text('JOBS COMPLETED', style: TextStyle(color: Colors.grey, fontSize: 11, fontWeight: FontWeight.bold)),
              SizedBox(height: 4),
              Text('5 Jobs', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w900)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildActiveJobCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFF0D0D0D), width: 2.5),
        boxShadow: const [BoxShadow(color: Color(0xFF0D0D0D), offset: Offset(4, 4))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFFFF3B30),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: const Text(
                  'TIRE PUNCTURE / FLAT',
                  style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 11),
                ),
              ),
              const Text('₹350 Visit Fee', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 15)),
            ],
          ),
          const SizedBox(height: 12),
          const Text('Customer: Murugan Swamy', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900)),
          const Text('Vehicle: Hyundai i20 (TN-60-AZ-1234)', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700)),
          const SizedBox(height: 6),
          const Row(
            children: [
              Icon(Icons.location_on, size: 16, color: Color(0xFFFF3B30)),
              SizedBox(width: 4),
              Expanded(
                child: Text('Near Theni Bypass Tollgate (1.2 km away)', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
          const SizedBox(height: 16),
          // Stage progression buttons
          Row(
            children: List.generate(_stages.length, (index) {
              final isCurrent = index == _jobStage;
              final isPassed = index < _jobStage;
              return Expanded(
                child: Container(
                  margin: const EdgeInsets.symmetric(horizontal: 2),
                  padding: const EdgeInsets.symmetric(vertical: 6),
                  decoration: BoxDecoration(
                    color: isCurrent
                        ? const Color(0xFFFFD600)
                        : isPassed
                            ? const Color(0xFF00C851)
                            : const Color(0xFFE0E0E0),
                    borderRadius: BorderRadius.circular(4),
                    border: Border.all(color: const Color(0xFF0D0D0D), width: 1.5),
                  ),
                  child: Center(
                    child: Text(
                      _stages[index],
                      style: const TextStyle(fontSize: 9, fontWeight: FontWeight.w900),
                    ),
                  ),
                ),
              );
            }),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFFFD600),
                    foregroundColor: const Color(0xFF0D0D0D),
                    elevation: 0,
                    side: const BorderSide(color: Color(0xFF0D0D0D), width: 2),
                  ),
                  icon: const Icon(Icons.navigation),
                  label: const Text('GOOGLE MAPS', style: TextStyle(fontWeight: FontWeight.w900)),
                  onPressed: () {},
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF00C851),
                    foregroundColor: Colors.white,
                    elevation: 0,
                    side: const BorderSide(color: Color(0xFF0D0D0D), width: 2),
                  ),
                  icon: const Icon(Icons.check_circle),
                  label: Text(_jobStage < 3 ? 'NEXT STAGE' : 'DONE & COLLECT', style: const TextStyle(fontWeight: FontWeight.w900)),
                  onPressed: () {
                    if (_jobStage < 3) {
                      setState(() => _jobStage++);
                    } else {
                      setState(() {
                        _hasActiveJob = false;
                        _jobStage = 0;
                      });
                    }
                  },
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
