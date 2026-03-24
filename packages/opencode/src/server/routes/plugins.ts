import { Hono } from "hono"
import { describeRoute } from "hono-openapi"
import { resolver } from "hono-openapi"
import { z } from "zod"
import { runtimeRegistry, type PluginInfo } from "../../plugin/runtime-registry"
import { lazy } from "../../util/lazy"

const PluginsResponse = z.object({
  plugins: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      version: z.string().optional(),
      hooks: z.array(z.string()),
      enabled: z.boolean(),
      settings: z.record(z.unknown()).optional(),
    }),
  ),
})

export const PluginsRoutes = lazy(() =>
  new Hono().get(
    "/",
    describeRoute({
      summary: "List plugins",
      description: "Retrieve information about all registered plugins including their hooks, enabled status, and settings.",
      operationId: "plugins.list",
      responses: {
        200: {
          description: "List of plugins",
          content: {
            "application/json": {
              schema: resolver(PluginsResponse),
            },
          },
        },
      },
    }),
    async (c) => {
      const plugins = runtimeRegistry.getRegisteredPlugins()
      return c.json({ plugins })
    },
  ),
)
