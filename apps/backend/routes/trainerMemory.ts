import { Request, Response } from "express";
import { translateToEnglish } from "../lib/translation";

declare global {
  var convex: any;
}

export const trainerMemoryRoute = (app: any) => {
  // Initialize trainer memory with master prompt
  app.post("/api/trainer/:trainerId/memory/init", async (req: Request, res: Response) => {
    try {
      const { trainerId } = req.params;
      let { systemPrompt, trainerLanguage } = req.body;

      if (!systemPrompt) {
        return res.status(400).json({ error: "systemPrompt is required" });
      }

      // Default to English if language not specified
      trainerLanguage = trainerLanguage || "en";

      // Translate system prompt to English if needed
      let englishPrompt = systemPrompt;
      if (trainerLanguage !== "en" && trainerLanguage !== "en-US" && trainerLanguage !== "en-GB") {
        englishPrompt = await translateToEnglish(systemPrompt, trainerLanguage);
      }

      const result = await globalThis.convex.mutation("trainerMemory:initializeMemory", {
        trainerId,
        systemPrompt: englishPrompt,
      });

      res.json({ success: true, message: "Master prompt created", ...result });
    } catch (error: any) {
      console.error("Init memory error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Add context to trainer memory
  app.post("/api/trainer/:trainerId/memory/add-context", async (req: Request, res: Response) => {
    try {
      const { trainerId } = req.params;
      let { contextText, trainerLanguage } = req.body;

      if (!contextText) {
        return res.status(400).json({ error: "contextText is required" });
      }

      // Default to English if language not specified
      trainerLanguage = trainerLanguage || "en";

      // Translate context to English if needed
      let englishContextText = contextText;
      if (trainerLanguage !== "en" && trainerLanguage !== "en-US" && trainerLanguage !== "en-GB") {
        englishContextText = await translateToEnglish(contextText, trainerLanguage);
      }

      // First, generate embedding using action (use English text)
      const embedding = await globalThis.convex.action("trainerMemory:generateEmbedding", {
        text: englishContextText,
      });

      // Then, add context with embedding to the database using mutation
      const result = await globalThis.convex.mutation("trainerMemory:addContext", {
        trainerId,
        contextText: englishContextText,
        embedding,
      });

      if (result.error) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error: any) {
      console.error("Add context error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get trainer memory
  app.get("/api/trainer/:trainerId/memory", async (req: Request, res: Response) => {
    try {
      const { trainerId } = req.params;

      const memory = await globalThis.convex.query("trainerMemory:getMemory", {
        trainerId,
      });

      if (!memory) {
        return res.status(404).json({ error: "Trainer memory not found" });
      }

      res.json(memory);
    } catch (error: any) {
      console.error("Get memory error:", error);
      res.status(500).json({ error: error.message });
    }
  });
};