import { Injectable } from '@nestjs/common';
import { OpenAI } from 'openai';
import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class ChatService {
  private openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  // Main function
  async getDoctorRecommendation(userMessage: string) {
    try {
      // Step 1: Use OpenAI to convert user query into a search query
      const openaiResponse = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful doctor. Map user symptoms to common supplements or medicines. Observe the text and suggest the vitamin supplements or medicines in a simple text like a product. For example: "Magnesium Glycinate"' },
          { role: 'user', content: userMessage },
        ],
      });

      const aiText = openaiResponse.choices[0]?.message?.content?.trim();
      // AI can return something like: "Magnesium Glycinate, Melatonin, Sleep supplements"

      // Step 2: Search through SERP API using AI-generated query
      const query = encodeURIComponent(aiText || userMessage);
      const serpUrl = `https://serpapi.com/search.json?q=site:medxpharmacy.com ${query}&api_key=${process.env.SERP_API_KEY}`;

      const { data } = await axios.get(serpUrl);

      const products = (data.organic_results || []).slice(0, 3).map((r: any) => ({
        title: r.title,
        link: r.link,
        snippet: r.snippet,
      }));

      return {
        userQuery: userMessage,
        aiSuggestedQuery: aiText,
        products: products.length ? products : 'No relevant products found',
      };
    } catch (error) {
      console.error('Error in doctor recommendation:', error);
      return { message: 'Error fetching product recommendations' };
    }
  }
}
