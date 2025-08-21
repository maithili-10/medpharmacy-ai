// openai/products/serp.service.ts
import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class SerpService {
  private apiKey = process.env.SERP_API_KEY;

  async searchSite(query: string, siteUrl: string, numResults = 3) {
    const searchQuery = `site:${siteUrl} ${query}`;
    const url = `https://serpapi.com/search.json?q=${encodeURIComponent(searchQuery)}&api_key=${this.apiKey}`;

    try {
      const res = await axios.get(url);
      const results = res.data.organic_results || [];
      return results.slice(0, numResults).map(r => ({
        title: r.title,
        link: r.link,
        snippet: r.snippet,
      }));
    } catch (err) {
      console.error('SERP API Error:', err.message);
      return [];
    }
  }
}
