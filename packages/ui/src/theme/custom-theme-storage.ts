import type { DesktopTheme } from "./types"

const STORAGE_KEY = "opencode-custom-themes"
const STORAGE_VERSION = 1

interface StoredThemeData {
  version: number
  themes: DesktopTheme[]
}

/**
 * Custom theme storage utility for persisting user-created themes to localStorage.
 * Includes versioning for future migrations and graceful handling of storage quota errors.
 */

function getStoredData(): StoredThemeData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return { version: STORAGE_VERSION, themes: [] }
    }
    const data = JSON.parse(raw) as StoredThemeData
    return data
  } catch {
    return { version: STORAGE_VERSION, themes: [] }
  }
}

function setStoredData(data: StoredThemeData): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    return true
  } catch (error) {
    if (
      error instanceof DOMException &&
      (error.name === "QuotaExceededError" || error.name === "NS_ERROR_DOM_QUOTA_REACHED")
    ) {
      console.error("localStorage quota exceeded when saving custom theme")
    } else {
      console.error("Failed to save custom theme to localStorage:", error)
    }
    return false
  }
}

function migrateData(data: StoredThemeData): StoredThemeData {
  if (data.version === STORAGE_VERSION) {
    return data
  }

  let migratedThemes = [...data.themes]
  let currentVersion = data.version

  // Migration steps for future versions would go here
  // Example:
  // if (currentVersion < 2) {
  //   migratedThemes = migratedThemes.map(migrateToV2)
  //   currentVersion = 2
  // }

  return {
    version: STORAGE_VERSION,
    themes: migratedThemes,
  }
}

function isValidDesktopTheme(value: unknown): value is DesktopTheme {
  if (typeof value !== "object" || value === null) {
    return false
  }

  const theme = value as Record<string, unknown>

  if (typeof theme.name !== "string" || !theme.name.trim()) {
    return false
  }

  if (typeof theme.id !== "string" || !theme.id.trim()) {
    return false
  }

  if (typeof theme.light !== "object" || theme.light === null) {
    return false
  }

  if (typeof theme.dark !== "object" || theme.dark === null) {
    return false
  }

  return true
}

/**
 * Saves a custom theme to localStorage.
 * If a theme with the same id already exists, it will be overwritten.
 * @param theme - The theme to save
 */
export function saveCustomTheme(theme: DesktopTheme): void {
  const data = getStoredData()
  const migratedData = migrateData(data)

  const existingIndex = migratedData.themes.findIndex((t) => t.id === theme.id)

  if (existingIndex >= 0) {
    migratedData.themes[existingIndex] = theme
  } else {
    migratedData.themes.push(theme)
  }

  setStoredData(migratedData)
}

/**
 * Retrieves all custom themes from localStorage.
 * @returns Array of custom themes, or empty array if none exist
 */
export function getCustomThemes(): DesktopTheme[] {
  const data = getStoredData()
  const migratedData = migrateData(data)

  if (migratedData.version !== STORAGE_VERSION) {
    setStoredData(migratedData)
  }

  return migratedData.themes
}

/**
 * Deletes a custom theme by its id.
 * @param id - The id of the theme to delete
 */
export function deleteCustomTheme(id: string): void {
  const data = getStoredData()
  const migratedData = migrateData(data)

  migratedData.themes = migratedData.themes.filter((t) => t.id !== id)

  setStoredData(migratedData)
}

/**
 * Updates an existing custom theme.
 * If the theme doesn't exist, it will be added.
 * @param theme - The theme to update
 */
export function updateCustomTheme(theme: DesktopTheme): void {
  saveCustomTheme(theme)
}

/**
 * Exports a theme as a JSON string.
 * @param theme - The theme to export
 * @returns JSON string representation of the theme
 */
export function exportTheme(theme: DesktopTheme): string {
  return JSON.stringify(theme, null, 2)
}

/**
 * Imports a theme from a JSON string.
 * Validates the format before returning.
 * @param json - JSON string to parse
 * @returns The parsed DesktopTheme, or null if validation fails
 */
export function importTheme(json: string): DesktopTheme | null {
  try {
    const parsed = JSON.parse(json)

    if (!isValidDesktopTheme(parsed)) {
      console.error("Invalid theme format: missing required fields")
      return null
    }

    return parsed
  } catch (error) {
    console.error("Failed to parse theme JSON:", error)
    return null
  }
}
