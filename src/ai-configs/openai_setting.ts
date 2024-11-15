import dotenv from 'dotenv';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { z } from 'zod';

dotenv.config();

const OpenAISettingSchema = z.object({
 query: z.string().min(1),
})

type OpenAISetting = z.infer<typeof OpenAISettingSchema>;

const model = openai('gpt-4o-mini')

const getOpenAIResponse = async (data: OpenAISetting) => {
    const validated = OpenAISettingSchema.parse(data);

    if(validated.query){
        const { text } = await generateText({
            model: openai('gpt-4o-mini'),
            prompt: validated.query,
          });
        console.log("OpenAI Response: ", text);
        return text;
    }
    else{
        throw new Error('Query is required');
    }
}

export default getOpenAIResponse;