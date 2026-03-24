export type PluginInfo = {
  id: string
  name: string
  version?: string
  hooks: string[]
  enabled: boolean
  settings?: Record<string, unknown>
}

type PluginRecord = {
  info: PluginInfo
  settings: Record<string, unknown>
}

const registry = new Map<string, PluginRecord>()

export const runtimeRegistry = {
  getRegisteredPlugins(): PluginInfo[] {
    return Array.from(registry.values()).map((record) => ({
      ...record.info,
      settings: Object.keys(record.settings).length > 0 ? record.settings : undefined,
    }))
  },

  setPluginEnabled(id: string, enabled: boolean): void {
    const record = registry.get(id)
    if (record) {
      record.info.enabled = enabled
    }
  },

  getPluginSettings(id: string): Record<string, unknown> | undefined {
    const record = registry.get(id)
    if (record && Object.keys(record.settings).length > 0) {
      return record.settings
    }
    return undefined
  },

  setPluginSettings(id: string, settings: Record<string, unknown>): void {
    const record = registry.get(id)
    if (record) {
      record.settings = settings
    }
  },

  registerPlugin(info: Omit<PluginInfo, "enabled" | "settings">): void {
    if (!registry.has(info.id)) {
      registry.set(info.id, {
        info: { ...info, enabled: true },
        settings: {},
      })
    }
  },
}
