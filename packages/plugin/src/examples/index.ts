/**
 * Example plugins demonstrating various hook types in the opencode plugin system.
 *
 * These examples show how to:
 * - Create custom tools (example-tool-plugin.ts)
 * - Modify theme/configuration (example-theme-plugin.ts)
 * - Implement custom authentication (example-auth-plugin.ts)
 */

export { ExampleToolPlugin } from "./example-tool-plugin.js"
export { ExampleThemePlugin, ExampleChatTransformPlugin } from "./example-theme-plugin.js"
export { ExampleAuthPlugin, ExampleTokenAuthPlugin } from "./example-auth-plugin.js"
