import dotenv from "dotenv";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { z } from "zod";

dotenv.config();

const OpenAISettingSchema = z.object({
  query: z.string().min(1),
});

type OpenAISetting = z.infer<typeof OpenAISettingSchema>;

const model = openai("gpt-4o-mini");

const getOpenAIResponse = async (data: OpenAISetting) => {
  const validated = OpenAISettingSchema.parse(data);

  if (validated.query) {
    const { text, usage, experimental_providerMetadata } = await generateText({
      model: openai("gpt-4o-mini"),
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: validated.query },
      ],
    });
    console.log("OpenAI Response: ", text);
    console.log("--------------------------------");
    console.log(`usage:`, {
        ...usage,
      cachedPromptTokens:
        experimental_providerMetadata?.openai?.cachedPromptTokens,
    });
    return { response: text, usage: usage };
  } else {
    throw new Error("Query is required to generate a response.");
  }
};

export default getOpenAIResponse;