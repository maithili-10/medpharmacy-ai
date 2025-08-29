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


async handleUserMessage(content: string, threadId?: number) {
  // 1️⃣ Get or create thread
  let thread = threadId ? await this.threadService.getThreadById(threadId) : null;
  if (!thread) {
    thread = await this.threadService.createThread(content.substring(0, 50));
  }

  // 2️⃣ Save user message
  await this.messagesService.createMessage(thread, Role.USER, content);

  // 3️⃣ Format past messages for context (optional, limit last 5 messages)
  const pastMessages = await this.messagesService.getMessagesByThread(thread.id);
  const formattedMessages = pastMessages.slice(-5).map((m) => ({
    role: m.role.toLowerCase() as "user" | "assistant",
    content: m.content,
  }));

  // 4️⃣ Ask OpenAI for structured JSON reply only
  const openaiResponse = await this.openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `
You are a helpful doctor of medxpharmacy.com . Map user symptoms to supplements or medicines. 
ONLY respond with JSON in this format. Do NOT include any extra text outside JSON.

{
  "needsFollowup": false,
  "message": "<friendly conversational reply to the user>",
  "advice": "<lifestyle or symptom advice>",
  "products": ["<product query 1>", "<product query 2>", "<product query 3>"]
}

If the user's question is unclear, return:
{
  "needsFollowup": true,
  "followupQuestion": "<your clarifying question>"
}

Do NOT provide any tips, text, or explanation outside this JSON.
        `,
      },
      ...formattedMessages,
      { role: "user", content },
    ],
  });

  const aiRaw = openaiResponse.choices[0]?.message?.content?.trim() || "{}";

  // 5️⃣ Extract JSON safely
  const jsonMatch = aiRaw.match(/\{[\s\S]*\}/);
  const jsonString = jsonMatch ? jsonMatch[0] : "{}";

  let parsed: {
    needsFollowup: boolean;
    followupQuestion?: string;
    message?: string;
    advice?: string;
    products?: string[];
  };

  try {
    parsed = JSON.parse(jsonString);
  } catch {
    parsed = { needsFollowup: false, message: aiRaw, advice: "", products: [] };
  }

  // 6️⃣ Initialize response variables
  let assistantMessage = "";
  let productResults: { title: string; link: string; image: string; source: string }[] = [];

  if (parsed.needsFollowup) {
    assistantMessage = parsed.followupQuestion || "Could you clarify a bit more?";
  } else {
    assistantMessage = parsed.message || "";

    // 7️⃣ Fetch product details from MedX Pharmacy via Google Images Light API
    if (parsed.products && parsed.products.length > 0) {
      for (const query of parsed.products) {
        const queryForSearch = encodeURIComponent(query);
console.log(queryForSearch)
        const serpUrl = `https://serpapi.com/search.json?engine=google_images_light&q=site:medxpharmacy.com ${queryForSearch}&api_key=${this.config.get<string>("SERP_API_KEY")}`;

        try {
          const { data } = await axios.get(serpUrl);

          const results = (data.images_results || [])
            .filter((r: any) => r.link?.includes("medxpharmacy.com"))
            .map((r: any) => ({
              title: r.title,
              link: r.link, // ✅ direct product page
              image: r.serpapi_thumbnail || r.thumbnail, // ✅ product image
              source: r.source,
            }));

          if (results.length > 0) productResults.push(results[0]);
        } catch (err) {
          console.error("Google Images Light API error:", err.message);
        }
      }

      productResults = productResults.slice(0, 3); // max 3 products
    }
  }

  // 8️⃣ Save assistant message (chat text only)
  await this.messagesService.createMessage(thread, Role.ASSISTANT, assistantMessage);

  // 9️⃣ Return structured response for frontend
  return {
    threadId: thread.id,
    userQuery: content,
    needsFollowup: parsed.needsFollowup || false,
    followupQuestion: parsed.followupQuestion || null,
    assistantMessage, // only text for chat bubble
    advice: parsed.advice || "",
    products: productResults, // array for frontend cards
  };
}

}
