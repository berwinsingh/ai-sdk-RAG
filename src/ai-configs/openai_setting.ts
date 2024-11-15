import dotenv from "dotenv";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { getSimilarData } from "../pinecone.js";
import { z } from "zod";

dotenv.config();

const OpenAISettingSchema = z.object({
  query: z.string().min(1),
});

type OpenAISetting = z.infer<typeof OpenAISettingSchema>;

const getOpenAIResponse = async (data: OpenAISetting) => {
  const validated = OpenAISettingSchema.parse(data);

  if (validated.query) {
    const similarData = await getSimilarData(validated.query);
    console.log("Similar Data: ", similarData.matches.map(m => m.metadata?.pageContent).join('\n'));

    const { text, usage, experimental_providerMetadata } = await generateText({
      model: openai("gpt-4o-mini"),
      messages: [
        { 
          role: "system", 
          content: "You are a helpful assistant. Use the following context to answer the user's question. If the context doesn't help answer the question, just say you don't have enough information." 
        },
        { 
          role: "system", 
          content: `Context: ${JSON.stringify(similarData.matches.map(m => m.metadata?.pageContent).join('\n'))}` 
        },
        { role: "user", content: validated.query },
      ],
    });
    //TODO: Remove console logs once testing is done
    console.log("--------------------------------");
    console.log("OpenAI Response: ", text);
    console.log("--------------------------------");
    console.log(`usage:`, {
      ...usage,
      cachedPromptTokens: experimental_providerMetadata?.openai?.cachedPromptTokens,
    });
    return { response: text, usage: usage };
  } else {
    throw new Error("Query is required to generate a response.");
  }
};

export default getOpenAIResponse;