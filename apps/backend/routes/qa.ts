import { Express, Request, Response } from "express";
import { ConvexHttpClient } from "convex/browser";
import { GoogleGenAI } from "@google/genai";
import { GEMINI_EMBEDDING_MODEL, generateContentWithFallback, getGeminiText } from "../lib/gemini";
import {
  expandMemoryContext,
  renderGraphContextForPrompt,
} from "../lib/memory-graph";

declare global {
  var convex: any;
}

export const qaRoute = (app: Express) => {
  /**
   * Ask avatar a question with memory-based context
   * The avatar uses memories trained by trainers to answer questions
   * 
   * Workflow:
   * 1. Generate embedding for question
   * 2. Fetch relevant memories via cosine similarity
   * 3. Apply confidence threshold
   * 4. Build constrained prompt with relevant memories
   * 5. Generate answer using avatar's master prompt + relevant context
   */
  app.post("/api/avatar/:avatarId/ask", async (req: Request, res: Response) => {
    try {
      const { avatarId } = req.params;
      const {
        question,
        topK = 5,
        confidenceThreshold = 0.3,
      } = req.body;

      if (!question) {
        return res.status(400).json({ error: "question is required" });
      }

      // Step 1: Generate embedding for the question
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY environment variable is not set");
      }

      const ai = new GoogleGenAI({ apiKey });
      const embeddingResponse = await ai.models.embedContent({
        model: GEMINI_EMBEDDING_MODEL,
        contents: question,
      });

      if (!embeddingResponse?.embeddings?.[0]?.values) {
        throw new Error("Failed to generate embedding for question");
      }

      const questionEmbedding = embeddingResponse.embeddings[0].values;

      // Step 2 & 3: Fetch relevant memories using cosine similarity
      const relevantMemoriesResult = await globalThis.convex.query(
        "memoryRetrieval:getRelevantMemories",
        {
          avatarId,
          questionEmbedding,
          topK,
          confidenceThreshold,
        }
      );

      // Step 4: Build constrained prompt with relevant memories
      let contextPrompt = "";
      if (relevantMemoriesResult.relevantMemories.length > 0) {
        contextPrompt = "Relevant context from training memories:\n";
        relevantMemoriesResult.relevantMemories.forEach(
          (memory: any, index: number) => {
            contextPrompt += `${index + 1}. (Confidence: ${(memory.similarity * 100).toFixed(1)}%) ${memory.text}\n`;
          }
        );
        contextPrompt += "\nAnswer the question using only the above context. If nothing relevant found, say 'I don't know.'\n";
      } else {
        contextPrompt =
          "No relevant training memories found. Say 'I don't know' if you cannot answer from general knowledge.\n";
      }

      // === GraphRAG expansion (best-effort; no-op if Neo4j disabled) ===
      let graphContext: Awaited<ReturnType<typeof expandMemoryContext>> | null = null;
      try {
        const startingIds = (relevantMemoriesResult.relevantMemories || [])
          .map((m: any) => m?._id)
          .filter((id: any): id is string => typeof id === "string" && id.length > 0);
        if (startingIds.length > 0) {
          graphContext = await expandMemoryContext(startingIds, { includeContradictions: true });
          const graphBlock = renderGraphContextForPrompt(graphContext);
          if (graphBlock) contextPrompt += graphBlock;
        }
      } catch (gErr) {
        console.warn("[neo4j] expandMemoryContext (qa) failed (non-critical):",
          gErr instanceof Error ? gErr.message : String(gErr));
      }

      // Fetch avatar details for master prompt
      const avatar = await globalThis.convex.query("queries:getAvatarById", {
        avatarId,
      });

      if (!avatar) {
        return res.status(404).json({ error: "Avatar not found" });
      }

      // Step 5: Generate answer using constrained prompt
      const { result: answerResponse } = await generateContentWithFallback(ai, {
        contents: {
          role: "user",
          parts: [
            {
              text: `System: You are an AI avatar with the following personality:
${avatar.masterPrompt}

${contextPrompt}

User Question: ${question}

Provide a helpful and relevant answer based on the training context.`,
            },
          ],
        },
      });

      const answer = getGeminiText(answerResponse) || "I couldn't generate an answer.";

      // Return answer with memory context
      return res.status(200).json({
        success: true,
        answer,
        question,
        relevantMemories: relevantMemoriesResult.relevantMemories.map(
          (m: any) => ({
            text: m.text,
            similarity: m.similarity,
            category: m.category,
          })
        ),
        stats: {
          totalMemories: relevantMemoriesResult.totalMemories,
          relevantCount: relevantMemoriesResult.relevantCount,
          confidenceThreshold,
        },
        graphContextUsed: graphContext && graphContext.enabled
          ? {
              relatedMemoryCount: graphContext.relatedMemories.length,
              entities: graphContext.entities.slice(0, 8),
              traits: graphContext.traits.slice(0, 8),
            }
          : undefined,
        graphMemoryIdsUsed: graphContext && graphContext.enabled
          ? graphContext.relatedMemories.map((m) => m.id)
          : undefined,
        contradictions: graphContext && graphContext.enabled
          ? graphContext.contradictions
          : undefined,
      });
    } catch (error: any) {
      console.error("Q&A error:", error);
      res.status(error?.status || 500).json({
        error: error?.status === 429 ? "Gemini quota exhausted" : error.message,
        retryAfterSeconds: error?.retryAfterSeconds,
      });
    }
  });
};
