// src/recommendation/recommendation.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class RecommendationService {
  getRecommendations(metrics: { sleep: number; steps: number; hr: number }) {
    const recs: string[] = [];

    if (metrics.sleep < 6) {
      recs.push("You're low on sleep. Consider Magnesium or Melatonin supplements.");
    }

    if (metrics.steps < 5000) {
      recs.push("Try to walk a bit more today. Light stretching or a 15-min walk helps.");
    }

    if (metrics.hr > 100) {
      recs.push("Your heart rate is elevated. Stay hydrated and try breathing exercises.");
    }

    if (metrics.steps > 10000) {
      recs.push("Great job on activity! A protein shake or recovery meal is a good idea.");
    }

    return recs;
  }
}
