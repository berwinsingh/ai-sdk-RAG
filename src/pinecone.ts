import dotenv from 'dotenv';
import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";
import {z} from "zod"

dotenv.config();

const TrainingInputSchema = z.object({
  filePath: z.string().min(1),
})

export type TrainingInput = z.infer<typeof TrainingInputSchema>;

const embeddings = new OpenAIEmbeddings({
  model:"text-embedding-3-small",
  apiKey:process.env.OPENAI_API_KEY!
})

const pinecone = new PineconeClient({apiKey:process.env.PINECONE_API_KEY!});
const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX!);


const getIndexes = async () => {
  const indexes = async () => {
    return await pinecone.listIndexes();
  };
  
  indexes().then((response) => {
    console.log("My indexes: ", response);
  });
};

const trainVectorEmbeddings = (data:TrainingInput) =>{
  const validated = TrainingInputSchema.parse(data)
}
