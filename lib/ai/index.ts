import { fastExplain } from "./tasks/fastExplain";
import { deepResearch } from "./tasks/deepResearch";
import { generateReport } from "./tasks/generateReport";

export const ai = {
  explain: fastExplain,
  research: deepResearch,
  report: generateReport,
};

export async function withFallback<T>(
  primary: () => Promise<T>,
  fallback: () => Promise<T>
): Promise<T> {
  try {
    return await primary();
  } catch (err) {
    console.warn("AI primary failed, falling back", err);
    return await fallback();
  }
}
