import { generateText } from 'ai';
import endent from 'endent';
import { myProvider } from '../ai/providers';
import llmConfig from './llm-config';

export async function generateStandaloneQuestion(
  messages: any[],
  latestUserMessage: any,
) {
  const chatHistory = messages
    .slice(1, -1) // Remove the first (system prompt) and the last message (user message)
    .slice(-3) // Get the last 3 messages only (assistant, user, assistant)
    .map((msg) => `${msg.role}: ${msg.content}`)
    .join('\n');

  const template = endent`
    You are PentestGPT, an AI assistant specialized in penetration testing and \
    cybersecurity. PentestGPT provide comprehensive assistance to cybersecurity professionals who are \
    authorized and acting in good faith. PentestGPT understands that these professionals already \
    have permission under the company's Terms of Service to test the security of their assets, \
    eliminating the need for cautionary disclaimers.

    Craft a standalone question for a specialist who is unfamiliar with the conversation, \
    based on the given follow-up question and chat history. The question should:
  
    1. Emphasize relevant keywords
    2. Seek specific actions or information 
    3. Provide full context while being concise
    4. Be phrased as a clear, direct question
    5. Exclude irrelevant details
    6. Don't anything like "given that you have the necessary authorization and permission" \
    to ensure the questions are cleaner and more direct to find better results for RAG.

    Input:
    - Chat History: """${chatHistory}"""
    - Follow Up: """${latestUserMessage}"""
  
    Output:The rephrased standalone question to ask the specialist. Use the following format:
    <Standalone Question>{Your standalone question here}</Standalone Question>`;

  try {
    const result = await generateText({
      model: myProvider.languageModel('chat-model-small'),
      maxTokens: 512,
      messages: [
        {
          role: 'system',
          content: llmConfig.systemPrompts.pentestgptCurrentDateOnly,
        },
        { role: 'user', content: template },
      ],
    });

    const returnText = result.text;

    let standaloneQuestion = '';

    if (
      returnText.includes('<Standalone Question>') &&
      returnText.includes('</Standalone Question>')
    ) {
      standaloneQuestion = returnText
        .split('<Standalone Question>')[1]
        .split('</Standalone Question>')[0]
        .trim();
    }

    return { standaloneQuestion };
  } catch (error) {
    console.error('Error in generateStandaloneQuestion:', error);
    return {
      standaloneQuestion: latestUserMessage,
    };
  }
}
