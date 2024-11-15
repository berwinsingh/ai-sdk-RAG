import fastify from "fastify";
import getIndexes from "./pinecone.js";

const app = fastify();

app.get("/train", async (request, reply) => {
  const indexes = getIndexes();

  return indexes;
});

app.get("/health", () => {
  return { status: 200, message: "Healthy!" };
});

app.listen({ port: 3000 }, (err, address) => {
  if (err) throw err;
  console.log(`Server listening on ${address}`);
});
