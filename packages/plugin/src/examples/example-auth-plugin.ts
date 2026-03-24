import { Plugin } from "../index.js"

/**
 * Example plugin demonstrating authentication hooks.
 *
 * Features demonstrated:
 * - Defining OAuth authentication flow
 * - Creating custom auth methods with prompts
 * - Integrating external authentication providers
 *
 * The auth hook allows plugins to define custom authentication
 * methods that can be used instead of or alongside built-in auth.
 */
export const ExampleAuthPlugin: Plugin = async (_ctx) => {
  return {
    auth: {
      provider: "example-custom",

      /**
       * Optional loader function for pre-processing auth.
       * Called before the auth flow starts.
       */
      loader: async (auth, provider) => {
        console.log("[ExampleAuthPlugin] Loading custom auth for provider:", provider.name)
        // Could fetch additional config or validate provider settings
        return { loadedAt: new Date().toISOString() }
      },

      methods: [
        {
          type: "oauth",
          label: "Custom OAuth",
          prompts: [
            {
              type: "select",
              key: "provider",
              message: "Select your identity provider",
              options: [
                { label: "GitHub", value: "github", hint: "Authenticate with GitHub" },
                { label: "Google", value: "google", hint: "Authenticate with Google" },
                { label: "Microsoft", value: "microsoft", hint: "Authenticate with Microsoft" },
              ],
            },
          ],
          authorize: async (inputs) => {
            const selectedProvider = inputs.provider ?? "github"

            // Example: Generate OAuth URL based on selected provider
            const oauthUrls: Record<string, string> = {
              github: "https://github.com/login/oauth/authorize",
              google: "https://accounts.google.com/o/oauth2/v2/auth",
              microsoft: "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
            }

            return {
              url: oauthUrls[selectedProvider] ?? oauthUrls.github,
              instructions: `You will be redirected to ${selectedProvider} to authorize. After authorization, you will receive a code to enter.`,
              method: "code",
              callback: async (code: string) => {
                // Example: Exchange code for tokens
                // In production, this would call the actual OAuth token endpoint
                console.log(`[ExampleAuthPlugin] Exchanging code for tokens with provider: ${selectedProvider}`)

                if (!code) {
                  return { type: "failed" }
                }

                // Example successful response
                return {
                  type: "success",
                  provider: selectedProvider,
                  access: `example-access-token-${Date.now()}`,
                  refresh: `example-refresh-token-${Date.now()}`,
                  expires: 3600,
                  accountId: `user-${selectedProvider}-123`,
                }
              },
            }
          },
        },
        {
          type: "api",
          label: "API Key Authentication",
          prompts: [
            {
              type: "text",
              key: "apiKey",
              message: "Enter your API key",
              placeholder: "sk-...",
              validate: (value) => {
                if (!value.startsWith("sk-")) {
                  return "API key must start with 'sk-'"
                }
                if (value.length < 20) {
                  return "API key seems too short"
                }
                return undefined
              },
            },
            {
              type: "select",
              key: "region",
              message: "Select your region",
              options: [
                { label: "US East", value: "us-east-1" },
                { label: "US West", value: "us-west-1" },
                { label: "EU West", value: "eu-west-1" },
                { label: "APAC", value: "ap-southeast-1" },
              ],
            },
          ],
          authorize: async (inputs) => {
            const { apiKey, region } = inputs

            // Example: Validate API key
            // In production, this would validate against your auth service
            console.log(`[ExampleAuthPlugin] Validating API key for region: ${region}`)

            if (!apiKey || !apiKey.startsWith("sk-")) {
              return { type: "failed" }
            }

            // Return success with key reference
            return {
              type: "success",
              key: `key-${region}-${apiKey.slice(-8)}`,
              provider: "custom-api",
            }
          },
        },
      ],
    },
  }
}

/**
 * Example plugin demonstrating token-based auth method.
 * Shows how to implement simple token/credential authentication.
 */
export const ExampleTokenAuthPlugin: Plugin = async (_ctx) => {
  return {
    auth: {
      provider: "example-token",
      methods: [
        {
          type: "api",
          label: "Token Authentication",
          prompts: [
            {
              type: "text",
              key: "token",
              message: "Enter your authentication token",
              placeholder: "Paste your token here",
              validate: (value) => {
                if (!value || value.trim().length === 0) {
                  return "Token is required"
                }
                return undefined
              },
            },
          ],
          authorize: async (inputs) => {
            const { token } = inputs

            if (!token) {
              return { type: "failed" }
            }

            // Example: Return key reference (not the actual token)
            return {
              type: "success",
              key: `token-${token.slice(0, 8)}...`,
            }
          },
        },
      ],
    },
  }
}
