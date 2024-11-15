import fastify from "fastify";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { FastifyRequest } from 'fastify';
import { z } from 'zod';

const app = fastify();
app.withTypeProvider<ZodTypeProvider>();
app.setValidatorCompiler(({ schema, method, url, httpPart }) => {
  return (data) => (schema as z.ZodType).safeParse(data);
});

// Register Swagger
await app.register(swagger, {
  swagger: {
    info: {
      title: "AI SDK RAG APIs",
      description: "API documentation",
      version: "1.0.0",
    },
  },
});

// Register Swagger UI
await app.register(swaggerUi, {
  routePrefix: "/docs",
  uiConfig: {
    docExpansion: "full",
    deepLinking: false,
  },
});

//Training vector embeddings
app.get(
  "/train",
  {
    schema: {
      description: "Train vector embeddings and store them in Pinecone.",
      querystring: z.object({
        filePath: z.string().min(1),
      }),
      response: {
        200: z.object({
          status: z.string(),
        }),
        400: z.object({
          error: z.string(),
        }),
      },
    },
  },
  async (request: FastifyRequest<{
    Querystring: { filePath: string }
  }>) => {
    const { filePath } = request.query;
    console.log(filePath);

    try {
      // Your training logic here
      return { status: "Training completed" };
    } catch (error) {
      throw new Error("Training failed");
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
    console.log(`Server listening on http://localhost:3000`);
    console.log("Documentation available at http://localhost:3000/docs");
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
