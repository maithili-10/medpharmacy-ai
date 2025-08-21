// src/fitbit/fitbit.service.ts
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { tokenStore } from './token-store';

@Injectable()
export class FitbitService {
  private baseUrl = 'https://api.fitbit.com';

  // Exchange code for access token
  async getAccessToken(code: string) {
    const creds = Buffer.from(
      `${process.env.FITBIT_CLIENT_ID}:${process.env.FITBIT_CLIENT_SECRET}`
    ).toString('base64');

    const res = await axios.post(
      'https://api.fitbit.com/oauth2/token',
      new URLSearchParams({
        client_id: process.env.FITBIT_CLIENT_ID!,
        grant_type: 'authorization_code',
        redirect_uri: process.env.FITBIT_REDIRECT_URI!,
        code,
      }),
      {
        headers: {
          Authorization: `Basic ${creds}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    const tokenData = {
      accessToken: res.data.access_token,
      refreshToken: res.data.refresh_token,
      expiresAt: new Date(Date.now() + res.data.expires_in * 1000),
    };

    tokenStore['demo-user'] = tokenData; // store in memory
    console.log('Token stored:', tokenData);
    return tokenData;
  }

  // Refresh token if expired
  async refreshAccessToken(refreshToken: string) {
    const creds = Buffer.from(
      `${process.env.FITBIT_CLIENT_ID}:${process.env.FITBIT_CLIENT_SECRET}`
    ).toString('base64');

    const res = await axios.post(
      'https://api.fitbit.com/oauth2/token',
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
      {
        headers: {
          Authorization: `Basic ${creds}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    return {
      accessToken: res.data.access_token,
      refreshToken: res.data.refresh_token,
      expiresAt: new Date(Date.now() + res.data.expires_in * 1000),
    };
  }

  // Return valid access token, refresh if expired
  async getValidAccessToken() {
    const userToken = tokenStore['demo-user'];
    if (!userToken) throw new Error('No token found. Please login first.');

    if (new Date() > userToken.expiresAt) {
      const newToken = await this.refreshAccessToken(userToken.refreshToken);
      tokenStore['demo-user'] = newToken;
      return newToken.accessToken;
    }
    return userToken.accessToken;
  }

  // Get sleep in hours
  async getSleep(accessToken: string) {
    const res = await axios.get(
      `${this.baseUrl}/1.2/user/-/sleep/date/today.json`,
      { headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' } },
    );
    const totalMinutes = res.data.summary?.totalMinutesAsleep || 0;
    return totalMinutes / 60; // convert minutes to hours
  }

  // Get today's steps
  async getSteps(accessToken: string) {
    const res = await axios.get(
      `${this.baseUrl}/1/user/-/activities/steps/date/today/1d.json`,
      { headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' } },
    );
    return parseInt(res.data['activities-steps'][0]?.value || '0');
  }

  // Get resting heart rate
  async getHeartRate(accessToken: string) {
    const res = await axios.get(
      `${this.baseUrl}/1/user/-/activities/heart/date/today/1d.json`,
      { headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' } },
    );
    return res.data['activities-heart'][0]?.value?.restingHeartRate || 0;
  }
  async getProfile(accessToken: string) {
  const url = `https://api.fitbit.com/1/user/-/profile.json`;
  const res = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  return res.data.user; // returns user object with displayName, age, gender, height, weight, etc.
}

// src/fitbit/fitbit.service.ts
async getVO2Max(accessToken: string, date: string = 'today') {
  const url = `https://api.fitbit.com/1/user/-/cardioscore/date/${date}.json`;
  const res = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  // res.data contains VO2 Max summary for the date
  return res.data['cardioScore'] || res.data; 
}

}
