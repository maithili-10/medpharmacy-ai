import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { MessagesService } from './messages/messages.service';
import { ThreadService } from './threads/thread.service';
import { Role } from './enum';
import axios from 'axios';

@Injectable()
export class OpenaiService {
  private readonly openai: OpenAI;

  constructor(
    private config: ConfigService,
    private messagesService: MessagesService,
    private threadService: ThreadService,
  ) {
    const apiKey = this.config.get<string>('OPENAI_API_KEY');
    if (!apiKey) throw new Error('OPENAI_API_KEY missing');
    this.openai = new OpenAI({ apiKey });
  }

//   async handleUserMessage(content: string, threadId?: number) {
//   // 1️⃣ Get or create thread
//   let thread = threadId ? await this.threadService.getThreadById(threadId) : null;
//   if (!thread) thread = await this.threadService.createThread(content.substring(0, 50));

//   // 2️⃣ Save user message
//   await this.messagesService.createMessage(thread, Role.USER, content);

//   // 3️⃣ Use OpenAI to rewrite into product/supplement query
//   const openaiResponse = await this.openai.chat.completions.create({
//     model: 'gpt-3.5-turbo',
//     messages: [
//       {
//         role: 'system',
//         content:
//           'You are a helpful doctor. Map user symptoms to supplements or medicines. Reply with product names only, separated by commas.',
//       },
//       { role: 'user', content },
//     ],
//   });

//   const aiQuery = openaiResponse.choices[0]?.message?.content?.trim();
//   const queryForSearch = encodeURIComponent(aiQuery || content);

//   // 4️⃣ Search through SERP API (force medxpharmacy.com domain)
//   const serpUrl = `https://serpapi.com/search.json?q=site:medxpharmacy.com ${queryForSearch}&api_key=${this.config.get<string>(
//     'SERP_API_KEY',
//   )}`;

//   const { data } = await axios.get(serpUrl);

//   // 5️⃣ Filter only medxpharmacy.com results
//   let products = (data.organic_results || [])
//     .filter((r: any) => r.link?.includes('medxpharmacy.com'))
//     .map((r: any) => ({
//       title: r.title,
//       link: r.link,
//       snippet: r.snippet,
//     }));

//   // 6️⃣ Ensure always 3 results from organic_results
//   if (products.length >= 3) {
//     products = products.slice(0, 3);
//   } else if (products.length > 0) {
//     // repeat existing results until we reach 3
//     while (products.length < 3) {
//       products.push(products[products.length % products.length]);
//     }
//   } else {
//     products = [];
//   }

//   // 7️⃣ Save assistant message
//   const productMessage = products.length
//     ? products.map((p) => `${p.title} → ${p.link}`).join('\n')
//     : 'No products found.';

//   await this.messagesService.createMessage(thread, Role.ASSISTANT, productMessage);

//   // 8️⃣ Return clean response
//   return {
//     threadId: thread.id,
//     userQuery: content,
//     aiSuggestedQuery: aiQuery,
//     products,
//   };
// }

async handleUserMessage(content: string, threadId?: number) {
  // 1️⃣ Get or create thread
  let thread = threadId ? await this.threadService.getThreadById(threadId) : null;
  if (!thread) thread = await this.threadService.createThread(content.substring(0, 50));

  // 2️⃣ Save user message
  await this.messagesService.createMessage(thread, Role.USER, content);

  // 3️⃣ Use AI to classify and optionally generate product query
  const openaiResponse = await this.openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `
  content:
      'You are a helpful doctor. Map user symptoms to supplements or medicines. Reply with single product name',
 },
  TYPE: PRODUCT
  CONTENT: <product name or supplement type>
- If the user query is general conversation or greetings, reply with:
  TYPE: GENERAL
  CONTENT: <normal assistant response>

        `,
      },
      { role: 'user', content },
    ],
  });

  const aiRaw = openaiResponse.choices[0]?.message?.content?.trim() || '';
  const typeMatch = aiRaw.match(/TYPE:\s*(\w+)/i);
  const contentMatch = aiRaw.match(/CONTENT:\s*([\s\S]+)/i);

  const type = typeMatch?.[1]?.toUpperCase() || 'GENERAL';
  const aiContent = contentMatch?.[1]?.trim() || '';

  let productMessage = '';
  let products: any[] = [];
console.log('aicontent', aiContent )
  if (type === 'PRODUCT' && aiContent) {
    // 4️⃣ Search through SERP API using AI-generated query
    const queryForSearch = encodeURIComponent(aiContent);
    const serpUrl = `https://serpapi.com/search.json?q=site:medxpharmacy.com ${queryForSearch}&api_key=${this.config.get<string>(
      'SERP_API_KEY',
    )}`;

    const { data } = await axios.get(serpUrl);

    // 5️⃣ Filter only medxpharmacy.com results
    products = (data.organic_results || [])
      .filter((r: any) => r.link?.includes('medxpharmacy.com'))
      .map((r: any) => ({
        title: r.title,
        link: r.link,
        snippet: r.snippet,
      }));

    // 6️⃣ Ensure always 3 results
    if (products.length >= 3) {
      products = products.slice(0, 3);
    } else if (products.length > 0) {
      while (products.length < 3) {
        products.push(products[products.length % products.length]);
      }
    }

    productMessage = products.map((p) => `${p.title} → ${p.link}`).join('\n');
  } else {
    // 7️⃣ For GENERAL queries, respond with AI content directly
    productMessage = aiContent || 'Hello! How can I help you today?';
  }

  // 8️⃣ Save assistant message
  await this.messagesService.createMessage(thread, Role.ASSISTANT, productMessage);

  // 9️⃣ Return structured response
  return {
    threadId: thread.id,
    userQuery: content,
    aiSuggestedQuery: aiContent,
    products,
    assistantReply: productMessage,
    responseType: type,
  };
}

}
