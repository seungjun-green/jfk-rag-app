import { Pinecone } from '@pinecone-database/pinecone';
import { OpenAIEmbeddings, ChatOpenAI } from '@langchain/openai';
import { PineconeStore } from '@langchain/pinecone';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnableSequence } from '@langchain/core/runnables';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    // Find the latest user message to use as the retrieval query
    const reversed = [...messages].reverse();
    const latestUser = reversed.find(m => m.role === 'user');
    if (!latestUser || !latestUser.content?.trim()) {
      return res.status(400).json({ error: 'No valid user message found' });
    }

    const latestQuestion = latestUser.content;

    // Stringify the conversation for the prompt
    const conversationText = messages
      .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n');

    // 1. Initialize Pinecone
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });
    const pineconeIndex = pinecone.index(process.env.PINECONE_INDEX);

    // 2. Connect to the Vector Store
    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings({ modelName: 'text-embedding-3-small' }),
      { pineconeIndex }
    );

    // 3. Retrieve relevant documents for the latest user question (Top 4)
    const results = await vectorStore.similaritySearch(latestQuestion, 4);
    const context = results.map((r) => r.pageContent).join('\n\n---\n\n');

    // 4. Setup the LLM (GPT-4o)
    const model = new ChatOpenAI({
      modelName: 'gpt-4o',
      temperature: 0.2,
    });

    // 5. Define the Prompt Template with conversation history
    const template = `You are a knowledgeable analyst for the JFK Assassination Records.
Use the retrieved CONTEXT to support your answers whenever it is relevant, but you are not limited to it. You may rely on well-established historical knowledge when the context does not contain the specific detail the user is asking about.

You are given:
- CONTEXT from the declassified document search
- The ongoing CONVERSATION
- The user's latest QUESTION

Your behavior:

1. General conversation handling
   - If the user greets you or makes small talk, reply naturally.
   - If the user asks about general JFK history, you may answer using widely known facts, not only the retrieved context.
   - If the user asks something unrelated to JFK, you may answer briefly or gently redirect, but you do not need to refuse.

2. Use of context
   - When relevant, include information from the CONTEXT as factual evidence.
   - If the CONTEXT contains important details, prefer them over general knowledge.
   - You do not need to quote or strictly anchor every sentence.

3. When the context does not include the answer
   - Do NOT use hard refusals.
   - Simply answer with general historical knowledge, or say something natural like:
       "The retrieved files don’t mention that directly, but based on established historical records..."
   - Never hallucinate specific document details that are not present.

4. Style
   - Keep the tone professional, clear, and helpful.
   - Answer the user directly and conversationally.
   - Avoid repetitive or formulaic refusals.

CONTEXT:
{context}

CONVERSATION SO FAR:
{conversation}

LATEST QUESTION:
{question}

YOUR RESPONSE:`;

    const prompt = PromptTemplate.fromTemplate(template);

    const chain = RunnableSequence.from([
      prompt,
      model,
      new StringOutputParser(),
    ]);

    // 6. Stream the response
    res.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'Cache-Control': 'no-cache, no-transform',
    });

    const stream = await chain.stream({
      context,
      conversation: conversationText,
      question: latestQuestion,
    });

    for await (const chunk of stream) {
      // chunk is a string because of StringOutputParser
      res.write(chunk);
    }

    res.end();
  } catch (error) {
    console.error('RAG Error:', error);
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Internal Server Error' });
    } else {
      // If headers already sent (during streaming), just end the response
      res.end();
    }
  }
}
