import { gateway } from 'ai';
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  stepCountIs,
  streamText,
  tool,
  toUIMessageStream,
} from 'ai';
import { z } from 'zod';
import { source } from '@/lib/source';
import { Document, type DocumentData } from 'flexsearch';
import { ChatUIMessage, SearchTool } from '../../../components/ai/search';

interface CustomDocument extends DocumentData {
  url: string;
  title: string;
  description: string;
  content: string;
}

const searchServer = createSearchServer();

async function createSearchServer() {
  const search = new Document<CustomDocument>({
    document: {
      id: 'url',
      index: ['title', 'description', 'content'],
      store: true,
    },
  });

  const docs = await chunkedAll(
    source.getPages().map(async (page) => {
      if (!('getText' in page.data)) return null;

      return {
        title: page.data.title,
        description: page.data.description,
        url: page.url,
        content: await page.data.getText('processed'),
      } as CustomDocument;
    }),
  );

  for (const doc of docs) {
    if (doc) search.add(doc);
  }

  return search;
}

async function chunkedAll<O>(promises: Promise<O>[]): Promise<O[]> {
  const SIZE = 50;
  const out: O[] = [];
  for (let i = 0; i < promises.length; i += SIZE) {
    out.push(...(await Promise.all(promises.slice(i, i + SIZE))));
  }
  return out;
}

const systemPrompt = [
  'You are the ShopWrk docs assistant.',
  'ShopWrk is the shop system for window tint, PPF, ceramic coating, and vinyl wrap shops.',
  'Answer from the documentation. Use the `search` tool to retrieve relevant pages before answering.',
  'Cite sources as markdown links using each result `url`.',
  'If the docs do not contain the answer, say so and suggest a better search query.',
  'Write in second person. Keep sentences short.',
].join('\n');

export async function POST(req: Request) {
  const reqJson = await req.json();

  const result = streamText({
    model: gateway('deepseek/deepseek-v4.1-flash'),
    stopWhen: stepCountIs(5),
    tools: {
      search: searchTool,
    },
    messages: [
      { role: 'system', content: systemPrompt },
      ...(await convertToModelMessages<ChatUIMessage>(reqJson.messages ?? [], {
        convertDataPart(part) {
          if (part.type === 'data-client')
            return {
              type: 'text',
              text: `[Client Context: ${JSON.stringify(part.data)}]`,
            };
        },
      })),
    ],
    toolChoice: 'auto',
    providerOptions: {
      gateway: {
        only: ['baseten'],
        tags: ['feature:docs-ask-ai'],
      },
      baseten: {
        reasoningEffort: 'max',
        chat_template_kwargs: {
          thinking: true,
          reasoning_effort: 100,
        },
      },
    },
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
}

const searchTool = tool({
  description: 'Search the ShopWrk docs and return raw JSON results.',
  inputSchema: z.object({
    query: z.string(),
    limit: z.number().int().min(1).max(100).default(10),
  }),
  async execute({ query, limit }) {
    const search = await searchServer;
    return await search.searchAsync(query, { limit, merge: true, enrich: true });
  },
}) satisfies SearchTool;
