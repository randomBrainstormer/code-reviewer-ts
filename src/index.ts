import { Command } from "commander";
import * as dotenv from "dotenv";
import { parseMrUrl, getProjectId, fetchMrDiff } from "./gitlab.js";
import { buildPrompt } from "./prompt.js";
import { reviewWithOpenAI } from "./providers/openai.js";

dotenv.config();

async function main() {
  const program = new Command();

  program
    .option("--url <url>", "GitLab MR URL",)
    .option("--model <model>", "Model to use for review", "gpt-4o-mini")
    .option("--provider <provider>", "AI provider", "openai")
    .action(async (options) => {
      const { url, model, provider } = options;

      if (!url) {
        console.error("Error: --url is required.");
        program.help();
        return;
      }

      if (provider !== "openai") {
        console.error("Error: Only 'openai' provider is supported for MVP.");
        return;
      }

      const gitlabToken = process.env.GITLAB_TOKEN;
      const openaiApiKey = process.env.OPENAI_API_KEY;

      if (!gitlabToken) {
        console.error("Error: GITLAB_TOKEN environment variable is not set.");
        return;
      }

      if (!openaiApiKey) {
        console.error("Error: OPENAI_API_KEY environment variable is not set.");
        return;
      }

      try {
        const { baseUrl, projectPath, iid } = parseMrUrl(url);
        const projectId = await getProjectId(baseUrl, projectPath, gitlabToken);
        const diff = await fetchMrDiff(baseUrl, projectId, iid, gitlabToken);

        if (!diff) {
          console.log("No diff found for the provided MR URL.");
          return;
        }

        const prompt = buildPrompt(diff);
        console.log("Fetching review from OpenAI...");
        const review = await reviewWithOpenAI(openaiApiKey, model, prompt);
        console.log("\n--- MR Review ---\n");
        console.log(review);
        console.log("\n-------------------");

      } catch (error: any) {
        console.error(`Error: ${error.message}`);
      }
    });

  program.parse(process.argv);
}

main();