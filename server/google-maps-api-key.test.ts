import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";

describe("Google Maps API Key", () => {
  it("should return API key from environment variable", async () => {
    const caller = appRouter.createCaller({
      req: {} as any,
      res: {} as any,
      user: null,
    });

    const result = await caller.settings.getGoogleMapsApiKey();
    
    expect(result).toHaveProperty("apiKey");
    expect(typeof result.apiKey).toBe("string");
    
    // The API key should be set from environment
    if (process.env.GOOGLE_MAPS_API_KEY) {
      expect(result.apiKey).toBe(process.env.GOOGLE_MAPS_API_KEY);
    }
  });
});
