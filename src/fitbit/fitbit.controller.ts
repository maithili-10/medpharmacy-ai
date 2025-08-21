// src/fitbit/fitbit.controller.ts
import { Controller, Get, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { FitbitService } from './fitbit.service';
import { RecommendationService } from '../recommendation/recommendation.service';

@Controller('auth/fitbit')
export class FitbitController {
  constructor(
    private readonly fitbitService: FitbitService,
    private readonly recommendationService: RecommendationService,
  ) {}

  @Get()
  async login(@Res() res: Response) {
    const params = new URLSearchParams({
      client_id: process.env.FITBIT_CLIENT_ID!,
      response_type: 'code',
      scope: 'activity heartrate sleep profile',
      redirect_uri: process.env.FITBIT_REDIRECT_URI!,
    });
    res.redirect(`https://www.fitbit.com/oauth2/authorize?${params.toString()}`);
  }

  @Get('callback')
  async callback(@Query('code') code: string) {
    await this.fitbitService.getAccessToken(code); // store tokens in memory
    return { message: 'Fitbit connected! You can now fetch metrics at /auth/fitbit/metrics' };
  }

  @Get('metrics')
  async getMetrics() {
    try {
      const accessToken = await this.fitbitService.getValidAccessToken();
console.log('accessToken', accessToken)
      const sleep = await this.fitbitService.getSleep(accessToken);
      const steps = await this.fitbitService.getSteps(accessToken);
      const hr = await this.fitbitService.getHeartRate(accessToken);

      const recommendations = this.recommendationService.getRecommendations({ sleep, steps, hr });

      return { metrics: { sleep, steps, hr }, recommendations };
    } catch (err) {
      return { error: err.message };
    }
  }

  @Get('profile')
async getProfile() {
  try {
    const accessToken = await this.fitbitService.getValidAccessToken();
    const profile = await this.fitbitService.getProfile(accessToken);
    return { profile };
  } catch (err) {
    console.error(err.response?.data || err.message);
    return { error: err.response?.data || err.message };
  }
}


  @Get('vo2max')
  async getVO2Max(@Query('date') date: string) {
    try {
      const accessToken = await this.fitbitService.getValidAccessToken();
      const vo2max = await this.fitbitService.getVO2Max(accessToken, date || 'today');
      return { vo2max };
    } catch (err) {
      console.error(err.response?.data || err.message);
      return { error: err.response?.data || err.message };
    }
  }

}
