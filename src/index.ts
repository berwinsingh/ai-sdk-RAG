import fastify from "fastify";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { FastifyRequest } from "fastify";
import trainVectorEmbeddings from "./pinecone.js";
import getOpenAIResponse from "./ai-configs/openai_setting.js";
import { Schema } from "zod";

const app = fastify();

await app.register(swagger, {
  swagger: {
    info: {
      title: "AI SDK RAG APIs",
      description: "API documentation",
      version: "1.0.0",
    },
  },
});

await app.register(swaggerUi, {
  routePrefix: "/docs",
  uiConfig: {
    docExpansion: "full",
    deepLinking: false,
  },
});

//Training vector embeddings
app.post(
  "/train",
  {
    schema: {
      description: "Train vector embeddings and store them in Pinecone.",
      querystring: {
        type: "object",
        required: ["filePath"],
        properties: {
          filePath: { type: "string", minLength: 1 },
        },
      },
      response: {
        200: {
          type: "object",
          required: ["status"],
          properties: {
            status: { type: "string" },
          },
        },
        400: {
          type: "object",
          required: ["error"],
          properties: {
            error: { type: "string" },
          },
        },
      },
    },
  },
  async (
    request: FastifyRequest<{
      Querystring: { filePath: string };
    }>,
    reply
  ) => {
    const { filePath: fileKey } = request.query;
    console.log("File Path", fileKey); //TODO: Remove later

    try {
      const createEmbeddings = await trainVectorEmbeddings({ key: fileKey });
      return { status: `Training completed for ${fileKey}.` };
    } catch (error) {
      console.error("Training error details:", error);
      return reply.status(400).send({ 
        error: error instanceof Error ? error.message : "Training failed"
      });
    }
  }
);

//Get OpenAI Response
app.post("/chat", {
  schema: {
    body: {
      type: "object",
      required: ["query"],
      properties: {
        query: { type: "string", minLength: 1 },
      },
    },
    response: {
      200: {
        type: "object",
        required: ["response"],
        properties: {
          response: { type: "string" },
        },
      },
      400: {
        type: "object",
        required: ["error"],
        properties: {
          error: { type: "string" },
        },
      },
    },
  },
}, async (request: FastifyRequest<{ Body: { query: string } }>, reply) => {
  try{  
    const { query } = request.body;
    const response = await getOpenAIResponse({ query });
      return { response };
    } catch (error) {
      console.error("Error getting OpenAI response:", error);
      return reply.status(400).send({
        error: error instanceof Error ? error.message : "Error getting OpenAI response",
      });
    }
  }
);

app.get("/health", () => {
  return { status: 200, message: "Healthy!" };
});

// Start server
const start = async () => {
  try {
    await app.listen({ port: 3000 });
    console.log("Server is now listening on:", app.server.address());
    console.log(`Documentation available at http://localhost:3000/docs`);
  } catch (err) {
    console.error("Error starting server:", err);
    app.log.error(err);
    process.exit(1);
  }
};

// Add error handlers for process events
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  process.exit(1);
});

start();
