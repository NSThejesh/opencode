const STORAGE_KEY = "opencode-layout-presets"

export type LayoutPreset = {
  id: string
  name: string
  createdAt: number
  sidebar: {
    opened: boolean
    position: "left" | "right" | "bottom"
    width: number
  }
  terminal: {
    opened: boolean
    height: number
  }
  fileTree: {
    opened: boolean
    width: number
  }
  session: {
    width: number
  }
}

type LayoutState = {
  sidebar: {
    opened: boolean
    width: number
    position: "left" | "right" | "bottom"
  }
  terminal: {
    height: number
    opened: boolean
  }
  fileTree: {
    opened: boolean
    width: number
  }
  session: {
    width: number
  }
}

export function serializeLayout(layout: LayoutState): LayoutPreset {
  return {
    id: crypto.randomUUID(),
    name: "",
    createdAt: Date.now(),
    sidebar: {
      opened: layout.sidebar.opened,
      position: layout.sidebar.position,
      width: layout.sidebar.width,
    },
    terminal: {
      opened: layout.terminal.opened,
      height: layout.terminal.height,
    },
    fileTree: {
      opened: layout.fileTree.opened,
      width: layout.fileTree.width,
    },
    session: {
      width: layout.session.width,
    },
  }
}

type DeserializedLayout = Partial<{
  sidebar: { opened: boolean; position: "left" | "right" | "bottom"; width: number }
  terminal: { opened: boolean; height: number }
  fileTree: { opened: boolean; width: number }
  session: { width: number }
}>

export function deserializeLayout(preset: LayoutPreset): DeserializedLayout {
  return {
    sidebar: {
      opened: preset.sidebar.opened,
      position: preset.sidebar.position,
      width: preset.sidebar.width,
    },
    terminal: {
      opened: preset.terminal.opened,
      height: preset.terminal.height,
    },
    fileTree: {
      opened: preset.fileTree.opened,
      width: preset.fileTree.width,
    },
    session: {
      width: preset.session.width,
    },
  }
}

export function savePreset(preset: LayoutPreset): void {
  const presets = getPresets()
  const existingIndex = presets.findIndex((p) => p.id === preset.id)
  if (existingIndex >= 0) {
    presets[existingIndex] = preset
  } else {
    presets.push(preset)
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(presets))
}

export function getPresets(): LayoutPreset[] {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return []
  try {
    return JSON.parse(stored) as LayoutPreset[]
  } catch {
    return []
  }
}

export function deletePreset(id: string): void {
  const presets = getPresets().filter((p) => p.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(presets))
}

const DEFAULT_PANEL_WIDTH = 344
const DEFAULT_SESSION_WIDTH = 600
const DEFAULT_TERMINAL_HEIGHT = 280

export function getDefaultPresets(): LayoutPreset[] {
  return [
    {
      id: "compact",
      name: "Compact",
      createdAt: 0,
      sidebar: {
        opened: false,
        position: "left",
        width: DEFAULT_PANEL_WIDTH,
      },
      terminal: {
        opened: true,
        height: Math.round(DEFAULT_TERMINAL_HEIGHT * 0.25),
      },
      fileTree: {
        opened: false,
        width: DEFAULT_PANEL_WIDTH,
      },
      session: {
        width: DEFAULT_SESSION_WIDTH,
      },
    },
    {
      id: "focus",
      name: "Focus",
      createdAt: 0,
      sidebar: {
        opened: true,
        position: "left",
        width: Math.round(DEFAULT_PANEL_WIDTH * 0.3),
      },
      terminal: {
        opened: false,
        height: DEFAULT_TERMINAL_HEIGHT,
      },
      fileTree: {
        opened: false,
        width: DEFAULT_PANEL_WIDTH,
      },
      session: {
        width: DEFAULT_SESSION_WIDTH,
      },
    },
    {
      id: "full",
      name: "Full",
      createdAt: 0,
      sidebar: {
        opened: true,
        position: "left",
        width: DEFAULT_PANEL_WIDTH,
      },
      terminal: {
        opened: true,
        height: DEFAULT_TERMINAL_HEIGHT,
      },
      fileTree: {
        opened: true,
        width: DEFAULT_PANEL_WIDTH,
      },
      session: {
        width: DEFAULT_SESSION_WIDTH,
      },
    },
  ]
}
