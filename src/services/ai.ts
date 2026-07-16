// Helper to sanitize API keys from quotes
function sanitizeApiKey(key: string): string {
  if (!key) return "";
  let clean = key.trim();
  if (clean.startsWith('"') && clean.endsWith('"')) {
    clean = clean.substring(1, clean.length - 1);
  }
  if (clean.startsWith("'") && clean.endsWith("'")) {
    clean = clean.substring(1, clean.length - 1);
  }
  return clean.trim();
}

// Get the OpenRouter API key from dynamic sources
function getOpenRouterApiKey(): string {
  // 1. Try retrieving from localStorage if in browser environment
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("openrouter_api_key");
      if (stored) {
        const sanitized = sanitizeApiKey(stored);
        if (sanitized) return sanitized;
      }
    } catch (e) {
      console.warn("localStorage access failed:", e);
    }
  }

  // 2. Try retrieving from Vite config env or Node environment
  let envKey = "";
  try {
    if (typeof import.meta !== "undefined" && (import.meta as any).env) {
      envKey = (import.meta as any).env.VITE_OPENROUTER_API_KEY || "";
    }
  } catch (e) {}

  if (!envKey) {
    try {
      if (typeof process !== "undefined" && process.env) {
        envKey = process.env.OPENROUTER_API_KEY || "";
      }
    } catch (e) {}
  }

  const sanitizedEnv = sanitizeApiKey(envKey);
  if (sanitizedEnv) return sanitizedEnv;

  // 3. Fallback Key
  return "";
}

// Helper to call OpenRouter API with JSON-mode or text-mode
async function callOpenRouter(messages: any[], jsonMode = false) {
  const apiKey = getOpenRouterApiKey();
  if (!apiKey) {
    throw new Error("OpenRouter API key is not configured.");
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": typeof window !== "undefined" ? window.location.origin : "https://learnify-edu.web.app",
      "X-Title": "Learnify"
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages,
      response_format: jsonMode ? { type: "json_object" } : undefined
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error("Empty response from OpenRouter");
  }
  return text;
}

// Helper to safely extract and parse JSON from a model's output
function parseJsonContent(text: string) {
  try {
    let cleanText = text.trim();
    if (cleanText.startsWith("```json")) {
      cleanText = cleanText.substring(7);
    } else if (cleanText.startsWith("```")) {
      cleanText = cleanText.substring(3);
    }
    if (cleanText.endsWith("```")) {
      cleanText = cleanText.substring(0, cleanText.length - 3);
    }
    return JSON.parse(cleanText.trim());
  } catch (e) {
    console.error("JSON parsing error:", e, "Original text:", text);
    try {
      const firstBrace = text.indexOf('{');
      const firstBracket = text.indexOf('[');
      let startIndex = -1;
      let endIndex = -1;
      
      if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
        startIndex = firstBrace;
        endIndex = text.lastIndexOf('}');
      } else if (firstBracket !== -1) {
        startIndex = firstBracket;
        endIndex = text.lastIndexOf(']');
      }
      
      if (startIndex !== -1 && endIndex !== -1) {
        return JSON.parse(text.substring(startIndex, endIndex + 1));
      }
    } catch (innerError) {
      console.error("Failed to recover JSON:", innerError);
    }
    throw e;
  }
}

export const aiService = {
  async chat(message: string, history: { role: string, parts: { text: string }[] }[] = []) {
    try {
      const messages = [
        {
          role: "system",
          content: "You are EduAI, a friendly and helpful teaching assistant for the Learnify platform. You help students with subjects like Computer Science, Physics, Chemistry, and Biology. Be concise, clear, and encouraging."
        },
        ...history.map(h => ({
          role: h.role === "model" ? "assistant" : "user",
          content: h.parts?.[0]?.text || ""
        })),
        { role: "user", content: message }
      ];
      return await callOpenRouter(messages);
    } catch (error) {
      console.error("OpenRouter Chat Error:", error);
      return `AI service error: ${error instanceof Error ? error.message : String(error)}. Please check your connection and configuration.`;
    }
  },

  async generateMcqs(content: string) {
    try {
      const messages = [
        {
          role: "system",
          content: "Generate 5 multiple choice questions from the provided content. Return only as a JSON array of objects with 'question', 'options' (array of 4 strings), and 'correctIndex' (number from 0-3). Your response must be valid JSON only, without markdown formatting."
        },
        { role: "user", content: `Content: ${content}` }
      ];
      const resText = await callOpenRouter(messages, true);
      return parseJsonContent(resText);
    } catch (error) {
      console.error("OpenRouter MCQ Error:", error);
      return [];
    }
  },

  async generateFlashcards(content: string) {
    try {
      const messages = [
        {
          role: "system",
          content: "Generate 10 educational flashcards from the provided content. Return only as a JSON array of objects with 'front' and 'back'. Your response must be valid JSON only, without markdown formatting."
        },
        { role: "user", content: `Content: ${content}` }
      ];
      const resText = await callOpenRouter(messages, true);
      return parseJsonContent(resText);
    } catch (error) {
      console.error("OpenRouter Flashcards Error:", error);
      return [];
    }
  },

  async generateNotes(content: string) {
    try {
      const messages = [
        {
          role: "system",
          content: "Generate comprehensive study notes based on the provided content. Use Markdown for formatting with clear headings, bullet points, and bold text for key terms. Keep it structured and easy to read."
        },
        { role: "user", content: `Content: ${content}` }
      ];
      return await callOpenRouter(messages);
    } catch (error) {
      console.error("OpenRouter Notes Error:", error);
      return "AI study notes service is currently unavailable.";
    }
  },

  async generateMcqsFromImage(prompt: string, base64Data: string, mimeType: string) {
    try {
      const messages = [
        {
          role: "system",
          content: "You are an educational assessment expert. Generate 5 multiple choice questions based on the provided material. Return only as a JSON array of objects with 'question', 'options' (array of 4 strings), and 'correctIndex' (number from 0-3). Ensure questions are challenging and accurate. Your response must be valid JSON only, without markdown formatting."
        },
        {
          role: "user",
          content: [
            { type: "text", text: `Context/User Request: ${prompt}` },
            { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64Data}` } }
          ]
        }
      ];
      const resText = await callOpenRouter(messages, true);
      return parseJsonContent(resText);
    } catch (error) {
      console.error("OpenRouter MCQ Image Error:", error);
      throw error;
    }
  },

  async explainConcept(prompt: string, base64Image?: string, mimeType?: string, instruction?: string) {
    const systemPrompt = instruction || "Answer with clear, structured text and include SVG or Mermaid diagram code if relevant. If you provide diagrams, wrap them in ```mermaid or ```svg blocks.";
    try {
      let messages: any[] = [];
      if (base64Image && mimeType) {
        messages = [
          {
            role: "user",
            content: [
              { type: "text", text: `${prompt}. ${systemPrompt}` },
              { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64Image}` } }
            ]
          }
        ];
      } else {
        messages = [
          { role: "user", content: `${prompt}. ${systemPrompt}` }
        ];
      }
      return await callOpenRouter(messages);
    } catch (error) {
      console.error("OpenRouter Explainer Error:", error);
      throw error;
    }
  },

  async explainImage(prompt: string, base64Image: string, mimeType: string, instruction?: string) {
    return this.explainConcept(prompt, base64Image, mimeType, instruction);
  },

  async predictPaperFromImage(prompt: string, base64Image: string, mimeType: string) {
    try {
      const messages = [
        {
          role: "user",
          content: [
            { type: "text", text: `Analyze this past paper and predict important topics and likely questions for the next exam. ${prompt}` },
            { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64Image}` } }
          ]
        }
      ];
      return await callOpenRouter(messages);
    } catch (error) {
      console.error("OpenRouter Paper Predictor Image Error:", error);
      throw error;
    }
  },

  async predictPaper(pastPaperContent: string) {
    try {
      const messages = [
        {
          role: "user",
          content: `Based on the following past paper content, predict important topics and likely questions for the next exam. Format it nicely with headings.\n\nPast Paper Content: ${pastPaperContent}`
        }
      ];
      return await callOpenRouter(messages);
    } catch (error) {
      console.error("OpenRouter Paper Predictor Error:", error);
      throw error;
    }
  }
};
