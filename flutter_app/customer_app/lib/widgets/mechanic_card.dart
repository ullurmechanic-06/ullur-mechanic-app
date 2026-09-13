import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import 'brutal_card.dart';
import 'brutal_button.dart';

class MechanicCard extends StatelessWidget {
  final String id;
  final String name;
  final double rating;
  final int totalJobs;
  final double distanceKm;
  final int estimatedEtaMins;
  final List<String> skills;
  final VoidCallback onRequest;

  const MechanicCard({
    super.key,
    required this.id,
    required this.name,
    required this.rating,
    required this.totalJobs,
    required this.distanceKm,
    required this.estimatedEtaMins,
    required this.skills,
    required this.onRequest,
  });

  @override
  Widget build(BuildContext context) {
    return BrutalCard(
      margin: const EdgeInsets.only(bottom: 14.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 50,
                height: 50,
                decoration: BoxDecoration(
                  color: UllurColors.primaryYellow,
                  shape: BoxShape.circle,
                  border: UllurTheme.brutalBorder(width: 2),
                ),
                child: const Icon(Icons.handyman, color: UllurColors.darkBlack, size: 26),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      name,
                      style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w900),
                    ),
                    const SizedBox(height: 2),
                    Row(
                      children: [
                        const Icon(Icons.star, color: Colors.amber, size: 16),
                        const SizedBox(width: 4),
                        Text(
                          '$rating ($totalJobs jobs)',
                          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(width: 10),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: UllurColors.successGreen.withOpacity(0.15),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: const Text(
                            'ONLINE',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w900,
                              color: UllurColors.successGreen,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    '${distanceKm.toStringAsFixed(1)} km',
                    style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w900),
                  ),
                  Text(
                    '~$estimatedEtaMins mins',
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: UllurColors.mutedGrey,
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 6,
            runSpacing: 4,
            children: skills.take(3).map((skill) {
              return Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: UllurColors.background,
                  border: UllurTheme.brutalBorder(width: 1.5),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  skill,
                  style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700),
                ),
              );
            }).toList(),
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              Expanded(
                child: BrutalButton(
                  text: 'Request Mechanic',
                  height: 44,
                  onPressed: onRequest,
                  icon: Icons.send,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
