import { createSignal, For, Show } from "solid-js"
import { Dialog } from "./dialog"
import { ColorPicker } from "./color-picker"
import { ThemePreview } from "./theme-preview"
import { generatePalette, type HarmonyType } from "../theme/palette-generator"
import type { DesktopTheme, HexColor, ThemeSeedColors, ThemePaletteColors } from "../theme/types"

export interface CustomThemeDialogProps {
  initialTheme?: DesktopTheme
  onSave: (theme: DesktopTheme) => void
  onClose: () => void
}

type ColorRole = keyof ThemeSeedColors

const COLOR_ROLES: { key: ColorRole; label: string }[] = [
  { key: "neutral", label: "Neutral" },
  { key: "primary", label: "Primary" },
  { key: "success", label: "Success" },
  { key: "warning", label: "Warning" },
  { key: "error", label: "Error" },
  { key: "info", label: "Info" },
  { key: "interactive", label: "Interactive" },
  { key: "diffAdd", label: "Diff Add" },
  { key: "diffDelete", label: "Diff Delete" },
]

const HARMONY_TYPES: { value: HarmonyType; label: string }[] = [
  { value: "complementary", label: "Complementary" },
  { value: "analogous", label: "Analogous" },
  { value: "triadic", label: "Triadic" },
  { value: "monochromatic", label: "Monochromatic" },
  { value: "split-complementary", label: "Split Complementary" },
  { value: "tetradic", label: "Tetradic" },
]

function generateId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

function createEmptySeeds(): ThemeSeedColors {
  return {
    neutral: "#5c5c8a",
    primary: "#5c5c8a",
    success: "#5c5c8a",
    warning: "#5c5c8a",
    error: "#5c5c8a",
    info: "#5c5c8a",
    interactive: "#5c5c8a",
    diffAdd: "#5c5c8a",
    diffDelete: "#5c5c8a",
  }
}

function seedsToPalette(seeds: ThemeSeedColors): ThemePaletteColors {
  return {
    neutral: seeds.neutral,
    ink: seeds.neutral,
    primary: seeds.primary,
    success: seeds.success,
    warning: seeds.warning,
    error: seeds.error,
    info: seeds.info,
    accent: seeds.interactive,
    interactive: seeds.interactive,
    diffAdd: seeds.diffAdd,
    diffDelete: seeds.diffDelete,
  }
}

function extractSeedsFromTheme(theme: DesktopTheme): ThemeSeedColors {
  const light = theme.light
  if ("seeds" in light && light.seeds) {
    return light.seeds
  }
  if ("palette" in light && light.palette) {
    const pal = light.palette
    return {
      neutral: pal.neutral,
      primary: pal.primary,
      success: pal.success,
      warning: pal.warning,
      error: pal.error,
      info: pal.info,
      interactive: pal.interactive ?? pal.accent ?? pal.neutral,
      diffAdd: pal.diffAdd ?? pal.success,
      diffDelete: pal.diffDelete ?? pal.error,
    }
  }
  return createEmptySeeds()
}

export function CustomThemeDialog(props: CustomThemeDialogProps) {
  const initialSeeds = () =>
    props.initialTheme ? extractSeedsFromTheme(props.initialTheme) : createEmptySeeds()

  const [name, setName] = createSignal(props.initialTheme?.name ?? "Custom Theme")
  const [seeds, setSeeds] = createSignal<ThemeSeedColors>(initialSeeds())
  const [activeTab, setActiveTab] = createSignal<"customize" | "palette">("customize")
  const [harmonyType, setHarmonyType] = createSignal<HarmonyType>("complementary")
  const [seedColor, setSeedColor] = createSignal<HexColor>("#5c5c8a")
  const [importError, setImportError] = createSignal<string | null>(null)

  const palette = () => seedsToPalette(seeds())

  const previewTheme = (): DesktopTheme => ({
    $schema: "opencode://theme/schema",
    name: name(),
    id: props.initialTheme?.id ?? generateId(name()),
    light: { palette: palette() },
    dark: { palette: palette() },
  })

  const updateSeed = (role: ColorRole, hex: HexColor) => {
    setSeeds((prev) => ({ ...prev, [role]: hex }))
  }

  const applyPalette = () => {
    const generated = generatePalette(harmonyType(), seedColor())
    setSeeds(generated)
  }

  const handleImportJson = (json: string) => {
    setImportError(null)
    try {
      const parsed = JSON.parse(json)
      if (!parsed.name || !parsed.id) {
        setImportError("Invalid theme: missing name or id")
        return false
      }
      setName(parsed.name)
      const extractedSeeds = extractSeedsFromTheme(parsed)
      setSeeds(extractedSeeds)
      return true
    } catch {
      setImportError("Invalid JSON format")
      return false
    }
  }

  const handleSave = () => {
    const theme = previewTheme()
    props.onSave(theme)
  }

  const handleFileImport = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      handleImportJson(text)
    }
    reader.readAsText(file)
  }

  return (
    <Dialog
      title={props.initialTheme ? "Edit Theme" : "Create Custom Theme"}
      size="large"
    >
      <div class="custom-theme-dialog">
        <div class="custom-theme-dialog__tabs">
          <button
            class="custom-theme-dialog__tab"
            classList={{ "custom-theme-dialog__tab--active": activeTab() === "customize" }}
            onClick={() => setActiveTab("customize")}
          >
            Customize
          </button>
          <button
            class="custom-theme-dialog__tab"
            classList={{ "custom-theme-dialog__tab--active": activeTab() === "palette" }}
            onClick={() => setActiveTab("palette")}
          >
            From Palette
          </button>
        </div>

        <div class="custom-theme-dialog__content">
          <div class="custom-theme-dialog__form">
            <div class="custom-theme-dialog__field">
              <label class="custom-theme-dialog__label" for="theme-name">
                Theme Name
              </label>
              <input
                id="theme-name"
                type="text"
                class="custom-theme-dialog__input"
                value={name()}
                onInput={(e) => setName(e.currentTarget.value)}
                placeholder="Enter theme name"
              />
            </div>

            <Show when={activeTab() === "customize"}>
              <div class="custom-theme-dialog__color-grid">
                <For each={COLOR_ROLES}>
                  {({ key, label }) => (
                    <div class="custom-theme-dialog__color-item">
                      <div class="custom-theme-dialog__color-header">
                        <span class="custom-theme-dialog__color-label">{label}</span>
                        <span class="custom-theme-dialog__color-value">{seeds()[key]}</span>
                      </div>
                      <ColorPicker
                        initialColor={seeds()[key]}
                        onChange={({ hex }) => updateSeed(key, hex)}
                      />
                    </div>
                  )}
                </For>
              </div>
            </Show>

            <Show when={activeTab() === "palette"}>
              <div class="custom-theme-dialog__palette-section">
                <div class="custom-theme-dialog__palette-controls">
                  <div class="custom-theme-dialog__field">
                    <label class="custom-theme-dialog__label" for="seed-color">
                      Seed Color
                    </label>
                    <div class="custom-theme-dialog__seed-input">
                      <input
                        id="seed-color"
                        type="color"
                        class="custom-theme-dialog__color-input"
                        value={seedColor()}
                        onInput={(e) => setSeedColor(e.currentTarget.value as HexColor)}
                      />
                      <input
                        type="text"
                        class="custom-theme-dialog__input"
                        value={seedColor()}
                        onInput={(e) => setSeedColor(e.currentTarget.value as HexColor)}
                        placeholder="#5c5c8a"
                      />
                    </div>
                  </div>

                  <div class="custom-theme-dialog__field">
                    <label class="custom-theme-dialog__label" for="harmony-type">
                      Harmony Type
                    </label>
                    <select
                      id="harmony-type"
                      class="custom-theme-dialog__select"
                      value={harmonyType()}
                      onChange={(e) => setHarmonyType(e.currentTarget.value as HarmonyType)}
                    >
                      <For each={HARMONY_TYPES}>
                        {({ value, label }) => <option value={value}>{label}</option>}
                      </For>
                    </select>
                  </div>

                  <button
                    type="button"
                    class="custom-theme-dialog__button custom-theme-dialog__button--primary"
                    onClick={applyPalette}
                  >
                    Generate Palette
                  </button>
                </div>

                <div class="custom-theme-dialog__palette-preview">
                  <div class="custom-theme-dialog__palette-colors">
                    <For each={COLOR_ROLES}>
                      {({ key, label }) => (
                        <div class="custom-theme-dialog__palette-color">
                          <div
                            class="custom-theme-dialog__palette-swatch"
                            style={{ "background-color": seeds()[key] }}
                          />
                          <span class="custom-theme-dialog__palette-label">{label}</span>
                          <span class="custom-theme-dialog__palette-hex">{seeds()[key]}</span>
                        </div>
                      )}
                    </For>
                  </div>
                </div>
              </div>
            </Show>

            <div class="custom-theme-dialog__import">
              <div class="custom-theme-dialog__import-header">
                <span class="custom-theme-dialog__import-label">Import from JSON</span>
                <label class="custom-theme-dialog__file-button">
                  Choose File
                  <input
                    type="file"
                    accept=".json"
                    class="custom-theme-dialog__file-input"
                    onChange={(e) => {
                      const file = e.currentTarget.files?.[0]
                      if (file) handleFileImport(file)
                    }}
                  />
                </label>
              </div>
              <Show when={importError()}>
                <div class="custom-theme-dialog__error">{importError()}</div>
              </Show>
            </div>
          </div>

          <div class="custom-theme-dialog__preview">
            <div class="custom-theme-dialog__preview-label">Preview</div>
            <ThemePreview theme={previewTheme()} />
          </div>
        </div>

        <div class="custom-theme-dialog__actions">
          <button
            type="button"
            class="custom-theme-dialog__button custom-theme-dialog__button--secondary"
            onClick={props.onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            class="custom-theme-dialog__button custom-theme-dialog__button--primary"
            onClick={handleSave}
          >
            Save Theme
          </button>
        </div>
      </div>
    </Dialog>
  )
}
