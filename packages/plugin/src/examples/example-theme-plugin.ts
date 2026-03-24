import type { Config } from "@opencode-ai/sdk"
import { Plugin } from "../index.js"

/**
 * Example plugin demonstrating configuration and theme modification hooks.
 *
 * Features demonstrated:
 * - Using config hook to modify configuration settings
 * - Demonstrates how to customize theme-related configuration
 * - Shows how to set default settings for the application
 *
 * Note: The plugin system uses the config hook to modify configuration.
 * Theme colors are typically part of the configuration that can be
 * customized through this hook.
 */
export const ExampleThemePlugin: Plugin = async (_ctx) => {
  return {
    /**
     * The config hook allows modification of configuration settings.
     * This is where theme customization and other defaults can be set.
     */
    config: async (config: Config) => {
      // Example: Customize theme colors if theme configuration exists
      if ("theme" in config && config.theme) {
        // Add custom color transformations
        const theme = config.theme as Record<string, any>

        // Example: Apply dark mode adjustments
        if (theme.dark) {
          theme.dark.primary = "#6366f1" // Indigo
          theme.dark.secondary = "#8b5cf6" // Violet
        }

        // Example: Apply light mode adjustments
        if (theme.light) {
          theme.light.primary = "#4f46e5" // Darker indigo for contrast
          theme.light.secondary = "#7c3aed" // Darker violet
        }

        // Example: Add custom semantic colors
        theme.semantic = {
          success: "#10b981", // Emerald
          warning: "#f59e0b", // Amber
          error: "#ef4444", // Red
          info: "#3b82f6", // Blue
        }

        config.theme = theme
      }

      // Example: Set default UI preferences
      if ("ui" in config) {
        const ui = config.ui as Record<string, any>
        ui.defaultLanguage = "en"
        ui.enableAnimations = true
        ui.compactMode = false
      }
    },
  }
}

/**
 * Example plugin demonstrating experimental chat transformation hooks.
 * These can be used to modify system prompts and messages.
 */
export const ExampleChatTransformPlugin: Plugin = async (_ctx) => {
  return {
    /**
     * Transform system prompt before sending to LLM.
     * Can be used to inject custom instructions or modify behavior.
     */
    "experimental.chat.system.transform": async (input, output) => {
      // Example: Add custom system instructions
      output.system.push(
        "You are helping with a skin disease classification task.",
        "Always provide accurate, medically-relevant information.",
        "When uncertain, express uncertainty clearly.",
      )
    },

    /**
     * Transform chat messages before processing.
     * Can be used for message filtering, enrichment, or modification.
     */
    "experimental.chat.messages.transform": async (_input, output) => {
      // Example: Process messages (filter, enrich, etc.)
      for (const msg of output.messages) {
        // Example: Add metadata to user messages
        if (msg.info.role === "user") {
          // Could transform message content here
          console.log(`[ExampleChatTransformPlugin] Processing user message`)
        }
      }
    },
  }
}
