import { createSignal } from "solid-js"
import { createSimpleContext } from "@opencode-ai/ui/context"
import { useGlobalSDK } from "./global-sdk"
import { useServer } from "./server"
import { usePlatform } from "./platform"

export type PluginInfo = {
  id: string
  name: string
  version?: string
  hooks: string[]
  enabled: boolean
  settings?: Record<string, unknown>
}

interface PluginsResponse {
  plugins: PluginInfo[]
}

export const { use: usePluginRegistry, provider: PluginRegistryProvider } = createSimpleContext({
  name: "PluginRegistry",
  init: () => {
    const globalSDK = useGlobalSDK()
    const server = useServer()
    const platform = usePlatform()

    const [plugins, setPlugins] = createSignal<PluginInfo[]>([])
    const [isLoading, setIsLoading] = createSignal(false)
    const [error, setError] = createSignal<string | null>(null)

    const getBaseUrl = () => {
      const current = server.current
      if (!current) return ""
      if ("http" in current) return current.http.url
      return current.url
    }

    const apiFetch = async (path: string, options?: RequestInit): Promise<unknown> => {
      const baseUrl = getBaseUrl()
      const url = `${baseUrl}${path}`
      const fetchFn = platform.fetch ?? fetch
      const response = await fetchFn(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
      })
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`)
      }
      return response.json()
    }

    const fetchPlugins = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = (await apiFetch("/plugins")) as PluginsResponse
        setPlugins(data.plugins)
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        setError(message)
        console.error("[plugin-registry] Failed to fetch plugins:", err)
      } finally {
        setIsLoading(false)
      }
    }

    const togglePlugin = async (id: string) => {
      const plugin = plugins().find((p) => p.id === id)
      if (!plugin) return

      const newEnabled = !plugin.enabled
      setPlugins((prev) => prev.map((p) => (p.id === id ? { ...p, enabled: newEnabled } : p)))

      try {
        await apiFetch(`/plugins/${id}`, {
          method: "PATCH",
          body: JSON.stringify({ enabled: newEnabled }),
        })
      } catch (err) {
        setPlugins((prev) => prev.map((p) => (p.id === id ? { ...p, enabled: !newEnabled } : p)))
        const message = err instanceof Error ? err.message : String(err)
        setError(message)
        console.error("[plugin-registry] Failed to toggle plugin:", err)
      }
    }

    const deletePlugin = async (id: string) => {
      const plugin = plugins().find((p) => p.id === id)
      if (!plugin) return

      const previousPlugins = plugins()
      setPlugins((prev) => prev.filter((p) => p.id !== id))

      try {
        await apiFetch(`/plugins/${id}`, { method: "DELETE" })
      } catch (err) {
        setPlugins(previousPlugins)
        const message = err instanceof Error ? err.message : String(err)
        setError(message)
        console.error("[plugin-registry] Failed to delete plugin:", err)
      }
    }

    return {
      plugins,
      isLoading,
      error,
      refreshPlugins: fetchPlugins,
      togglePlugin,
      deletePlugin,
    }
  },
})
