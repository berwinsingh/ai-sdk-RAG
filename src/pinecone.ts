import dotenv from 'dotenv';
import { Pinecone } from "@pinecone-database/pinecone";

dotenv.config();

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

const getIndexes = async () => {
  const indexes = async () => {
    return await pc.listIndexes();
  };
  
  indexes().then((response) => {
    console.log("My indexes: ", response);
  });
};

export default getIndexes;
