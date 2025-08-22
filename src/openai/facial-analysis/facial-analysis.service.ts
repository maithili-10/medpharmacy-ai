import { Injectable, BadRequestException } from '@nestjs/common';
import axios from 'axios';
import FormData from 'form-data';


@Injectable()
export class FacialAnalysisService {
  private apiKey = process.env.FACEPP_API_KEY;
  private apiSecret = process.env.FACEPP_API_SECRET;
  private serpApiKey = process.env.SERP_API_KEY;

  async analyzeFace(base64Image: string) {
    if (!base64Image) {
      throw new BadRequestException('Image data is empty');
    }

    const url = 'https://api-us.faceplusplus.com/facepp/v3/detect';

    // 1. Face++ API call
    const formData = new FormData();
    formData.append('api_key', this.apiKey);
    formData.append('api_secret', this.apiSecret);
    formData.append('image_base64', base64Image);
    formData.append('return_attributes', 'emotion,skinstatus');

    const response = await axios.post(url, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    const face = response.data.faces?.[0];
    if (!face) {
      return { message: 'No face detected', products: [] };
    }

    const { emotion, skinstatus } = face.attributes;

    // 2. Build multiple queries
    const queries: string[] = [];
    if (skinstatus.acne > 20) queries.push('salicylic acid');
    if (skinstatus.stain > 20) queries.push('pigmentation cream');
    if (skinstatus.dark_circle > 5) queries.push('under eye cream');
    if (skinstatus.health < 10) queries.push('skin supplements');
    if (emotion.happiness < 20) queries.push('beauty care');

    if (queries.length === 0) {
      queries.push('skincare');
    }

    // 3. Fetch all queries in parallel
    const seen = new Set<string>();
    const allResults = await Promise.all(
      queries.map(async (q) => {
        const serpUrl = `https://serpapi.com/search.json?q=site:medxpharmacy.com+${encodeURIComponent(q)}&api_key=${this.serpApiKey}`;
        try {
          const res = await axios.get(serpUrl);
          return res.data.organic_results?.map((item: any) => ({
            title: item.title,
            link: item.link,
            snippet: item.snippet,
            sourceQuery: q,
            
          })) || [];
        } catch {
          return [];
        }
      })
    );

    // Flatten + deduplicate
    let products = allResults.flat().filter((p) => {
      if (seen.has(p.link)) return false;
      seen.add(p.link);
      return true;
    });

    // 4. Mix results (take 1–2 from each query in round robin fashion)
    const mixed: any[] = [];
    let index = 0;
    while (mixed.length < 5 && products.length > 0) {
      for (const q of queries) {
        const next = products.find(p => p.sourceQuery === q);
        if (next) {
          mixed.push(next);
          products = products.filter(p => p.link !== next.link);
        }
        if (mixed.length >= 5) break;
      }
      index++;
    }

    return {
      queriesUsed: queries,
      products: mixed,
    };
  }
}
