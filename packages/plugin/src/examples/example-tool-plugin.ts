import { Plugin } from "../index.js"
import { tool } from "../tool.js"

/**
 * Example plugin demonstrating custom tool creation and tool execution hooks.
 *
 * Features demonstrated:
 * - Creating a custom tool using the tool() helper
 * - Using tool.execute.before to intercept/validate tool arguments
 * - Using tool.execute.after to transform tool output
 * - Using tool.definition to modify tool description sent to LLM
 */
export const ExampleToolPlugin: Plugin = async (_ctx) => {
  return {
    tool: {
      /**
       * A simple greeting tool that demonstrates tool creation.
       * The tool accepts a name and returns a personalized greeting.
       */
      hello: tool({
        description: "Returns a personalized greeting message",
        args: {
          name: tool.schema.string().describe("The name of the person to greet"),
          language: tool.schema
            .enum(["en", "es", "fr", "de", "ja"])
            .optional()
            .default("en")
            .describe("Language code for the greeting"),
        },
        async execute(args, _context) {
          const greetings: Record<string, string> = {
            en: `Hello, ${args.name}! Welcome to the skin disease classifier.`,
            es: `¡Hola, ${args.name}! Bienvenido al clasificador de enfermedades de la piel.`,
            fr: `Bonjour, ${args.name}! Bienvenue dans le classificateur de maladies de la peau.`,
            de: `Hallo, ${args.name}! Willkommen beim Hautkrankheit-Klassifikator.`,
            ja: `こんにちは、${args.name}！皮膚病分類器へようこそ。`,
          }
          return greetings[args.language ?? "en"]
        },
      }),

      /**
       * A tool that demonstrates more complex tool behavior.
       * Shows how to use context for project-aware operations.
       */
      getProjectInfo: tool({
        description: "Returns information about the current project",
        args: {},
        async execute(_args, context) {
          return JSON.stringify(
            {
              sessionID: context.sessionID,
              directory: context.directory,
              worktree: context.worktree,
              agent: context.agent,
            },
            null,
            2,
          )
        },
      }),
    },

    /**
     * Intercept tool calls before execution.
     * Can be used for validation, logging, or argument transformation.
     */
    "tool.execute.before": async (input, output) => {
      // Log tool call for debugging
      console.log(`[ExampleToolPlugin] Tool "${input.tool}" called with args:`, input.args)

      // Example: Add prefix to string arguments
      if (input.tool === "hello" && typeof output.args.name === "string") {
        // Transform the name argument (example only - not destructive)
        const originalName = output.args.name
        output.args.name = originalName
        console.log(`[ExampleToolPlugin] Original name: ${originalName}`)
      }
    },

    /**
     * Transform tool output after execution.
     * Can be used for formatting, logging, or result enrichment.
     */
    "tool.execute.after": async (input, output) => {
      console.log(`[ExampleToolPlugin] Tool "${input.tool}" executed`)

      // Example: Add metadata to tool output
      if (input.tool === "hello") {
        output.metadata = {
          ...output.metadata,
          plugin: "ExampleToolPlugin",
          executedAt: new Date().toISOString(),
        }
      }

      // Example: Transform output based on tool
      if (input.tool === "getProjectInfo") {
        output.title = "Project Information"
      }
    },

    /**
     * Modify tool definitions before they're sent to the LLM.
     * Can be used to customize tool descriptions or parameters dynamically.
     */
    "tool.definition": async (input, output) => {
      // Example: Add helpful context to tool descriptions
      if (input.toolID === "hello") {
        output.description = `${output.description} This tool supports multiple languages: en, es, fr, de, ja.`
      }
    },
  }
}
