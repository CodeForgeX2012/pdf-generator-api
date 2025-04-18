import { type Message, generateObject } from 'ai';
import { myProvider } from './providers';
import { DEFAULT_TITLE_GENERATION_PROMPT_TEMPLATE } from './prompts';
import { z } from 'zod';

export async function generateTitleFromUserMessage({
  message,
  abortSignal,
}: {
  message: Message;
  abortSignal?: AbortSignal;
}) {
  const {
    object: { title },
  } = await generateObject({
    model: myProvider.languageModel('chat-model-small'),
    schema: z.object({
      title: z.string().describe('The generated title (3-5 words)'),
    }),
    messages: [
      {
        role: 'user',
        content: DEFAULT_TITLE_GENERATION_PROMPT_TEMPLATE(message.content),
      },
    ],
    abortSignal,
    maxTokens: 50,
  });

  return title;
}
