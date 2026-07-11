import { GoogleGenerativeAI } from "@google/generative-ai";

export interface GeminiRequestOptions {
  tenantId: string;
  prompt: string | any[];
  promptVersion: string;
  temperature?: number;
  maxOutputTokens?: number;
  timeoutMs?: number;
  maxRetries?: number;
}

export interface GeminiResponse {
  text: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  promptVersion: string;
  tenantId: string;
}

export class GeminiService {
  private ai: GoogleGenerativeAI;
  private defaultModel: string;

  constructor(apiKey: string, defaultModel = "gemini-1.5-pro") {
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY must be provided to initialize GeminiService");
    }
    this.ai = new GoogleGenerativeAI(apiKey);
    this.defaultModel = defaultModel;
  }

  /**
   * Executes a prompt with tenant boundary checks, retries, timeouts, and detailed audit logging.
   */
  async generateContent(options: GeminiRequestOptions): Promise<GeminiResponse> {
    const {
      tenantId,
      prompt,
      promptVersion,
      temperature = 0.2,
      maxOutputTokens,
      timeoutMs = 15000,
      maxRetries = 3,
    } = options;

    if (!tenantId) {
      throw new Error("Security Violation: Cannot execute AI prompts without an explicit tenantId");
    }

    const promptLength = typeof prompt === 'string' ? prompt.length : JSON.stringify(prompt).length;
    console.log(`[AI-REQUEST] Tenant: ${tenantId} | Version: ${promptVersion} | Length: ${promptLength}`);

    const model = this.ai.getGenerativeModel({
      model: this.defaultModel,
      generationConfig: {
        temperature,
        maxOutputTokens,
      },
    });

    let attempts = 0;
    let delay = 1000; // Starting retry delay in ms
    let lastError: any = null;

    while (attempts < maxRetries) {
      attempts++;
      try {
        // Wrap request in a timeout promise
        const requestPromise = model.generateContent(prompt);
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`AI Request timed out after ${timeoutMs}ms`)), timeoutMs)
        );

        const result = await Promise.race([requestPromise, timeoutPromise]);
        const response = await result.response;
        const text = response.text();

        // Safe token counting (approximate if api doesn't return count directly)
        // In @google/generative-ai, we can count tokens via model.countTokens() if needed
        const tokenCountResult = await model.countTokens(prompt);
        const promptTokens = tokenCountResult.totalTokens || 0;
        const responseTokenCountResult = await model.countTokens(text);
        const completionTokens = responseTokenCountResult.totalTokens || 0;

        const responseData: GeminiResponse = {
          text,
          usage: {
            promptTokens,
            completionTokens,
            totalTokens: promptTokens + completionTokens,
          },
          promptVersion,
          tenantId,
        };

        // Audit Log Response
        console.log(`[AI-RESPONSE] Tenant: ${tenantId} | Tokens: ${responseData.usage.totalTokens} | Success`);
        return responseData;

      } catch (err: any) {
        lastError = err;
        console.warn(`[AI-RETRY] Tenant: ${tenantId} | Attempt ${attempts}/${maxRetries} failed: ${err.message || err}`);

        if (attempts < maxRetries) {
          // Exponential backoff delay
          await new Promise((resolve) => setTimeout(resolve, delay));
          delay *= 2;
        }
      }
    }

    // If we exhausted retries, log failure and throw
    console.error(`[AI-FAILURE] Tenant: ${tenantId} | Version: ${promptVersion} failed after ${maxRetries} retries.`);
    throw new Error(`Gemini Service failed after ${maxRetries} attempts. Last error: ${lastError?.message || lastError}`);
  }
}
