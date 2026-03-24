import { type Component, For, Show } from "solid-js"
import type { DesktopTheme, ThemePaletteColors } from "../theme/types"
import { resolveThemeVariant } from "../theme/resolve"

export interface ThemePreviewProps {
  theme: DesktopTheme
  palette?: ThemePaletteColors
}

const buttonKeys = [
  { key: "button-primary-base", label: "Primary" },
  { key: "button-secondary-base", label: "Secondary" },
  { key: "surface-interactive-base", label: "Accent" },
] as const

const textKeys = [
  { key: "text-base", label: "Normal" },
  { key: "text-weak", label: "Muted" },
  { key: "text-strong", label: "Emphasized" },
] as const

const statusKeys = [
  { key: "surface-success-base", label: "Success", textKey: "text-on-success-base" },
  { key: "surface-warning-base", label: "Warning", textKey: "text-on-warning-base" },
  { key: "surface-critical-base", label: "Error", textKey: "text-on-critical-base" },
  { key: "surface-info-base", label: "Info", textKey: "text-on-info-base" },
] as const

const borderKeys = [
  { key: "border-base", label: "Default" },
  { key: "border-weak-base", label: "Weak" },
  { key: "border-strong-base", label: "Strong" },
] as const

const bgKeys = [
  { key: "background-base", label: "Base" },
  { key: "surface-raised-base", label: "Raised" },
  { key: "surface-float-base", label: "Float" },
] as const

export const ThemePreview: Component<ThemePreviewProps> = (props) => {
  const resolvedLight = () => {
    if (props.palette) {
      return resolveThemeVariant({ palette: props.palette }, false)
    }
    return props.theme ? resolveThemeVariant(props.theme.light, false) : {}
  }

  const resolvedDark = () => {
    if (props.palette) {
      return resolveThemeVariant({ palette: props.palette }, true)
    }
    return props.theme ? resolveThemeVariant(props.theme.dark, true) : {}
  }

  const PreviewPanel: Component<{ resolved: Record<string, string>; isDark: boolean }> = (panelProps) => {
    const getVar = (key: string) => panelProps.resolved[key] ?? "transparent"
    const textColor = () => getVar("text-base")
    const bgColor = () => getVar("background-base")

    return (
      <div
        class="theme-preview-panel"
        style={{
          background: bgColor(),
          color: textColor(),
          padding: "12px",
          "border-radius": "8px",
          width: "200px",
          "font-size": "11px",
          "font-family": "system-ui, sans-serif",
          gap: "8px",
          display: "flex",
          "flex-direction": "column",
        }}
      >
        <div style={{ "font-weight": "600", "margin-bottom": "4px" }}>
          {panelProps.isDark ? "Dark" : "Light"}
        </div>

        <div style={{ display: "flex", "flex-wrap": "wrap", gap: "4px" }}>
          <For each={buttonKeys}>
            {(btn) => (
              <div
                style={{
                  background: getVar(btn.key),
                  color: getVar("text-invert-base"),
                  padding: "3px 8px",
                  "border-radius": "4px",
                  "font-size": "10px",
                }}
              >
                {btn.label}
              </div>
            )}
          </For>
        </div>

        <div style={{ display: "flex", "flex-direction": "column", gap: "2px" }}>
          <For each={textKeys}>
            {(txt) => (
              <div style={{ color: getVar(txt.key) }}>
                {txt.label}: The quick brown fox
              </div>
            )}
          </For>
        </div>

        <div style={{ display: "flex", "flex-wrap": "wrap", gap: "4px" }}>
          <For each={statusKeys}>
            {(status) => (
              <div
                style={{
                  background: getVar(status.key),
                  color: getVar(status.textKey),
                  padding: "2px 6px",
                  "border-radius": "3px",
                  "font-size": "9px",
                }}
              >
                {status.label}
              </div>
            )}
          </For>
        </div>

        <div style={{ display: "flex", gap: "4px" }}>
          <For each={borderKeys}>
            {(border) => (
              <div
                style={{
                  border: `1px solid ${getVar(border.key)}`,
                  padding: "4px 8px",
                  "border-radius": "3px",
                  "font-size": "9px",
                }}
              >
                {border.label}
              </div>
            )}
          </For>
        </div>

        <div style={{ display: "flex", gap: "4px" }}>
          <For each={bgKeys}>
            {(bg) => (
              <div
                style={{
                  background: getVar(bg.key),
                  padding: "4px 8px",
                  "border-radius": "3px",
                  "font-size": "9px",
                  border: "1px solid",
                  "border-color": getVar("border-weak-base"),
                }}
              >
                {bg.label}
              </div>
            )}
          </For>
        </div>

        <div
          style={{
            background: getVar("surface-inset-base"),
            padding: "6px 8px",
            "border-radius": "4px",
            "font-family": "monospace",
            "font-size": "9px",
            "line-height": "1.4",
          }}
        >
          <span style={{ color: getVar("syntax-keyword") }}>function</span>
          <span style={{ color: getVar("text-base") }}> </span>
          <span style={{ color: getVar("syntax-variable") }}>hello</span>
          <span style={{ color: getVar("text-base") }}>() {"{"}</span>
          {"\n"}
          <span style={{ color: getVar("syntax-comment") }}>  // comment</span>
          {"\n"}
          <span style={{ color: getVar("syntax-keyword") }}>  return</span>
          <span style={{ color: getVar("text-base") }}> </span>
          <span style={{ color: getVar("syntax-string") }}>"world"</span>
          <span style={{ color: getVar("text-base") }}>;</span>
          {"\n"}
          <span style={{ color: getVar("text-base") }}>{"}"}</span>
        </div>
      </div>
    )
  }

  return (
    <div
      class="theme-preview"
      style={{
        display: "flex",
        gap: "12px",
        "align-items": "flex-start",
      }}
    >
      <Show when={props.theme || props.palette} fallback={<div>No theme provided</div>}>
        <PreviewPanel resolved={resolvedLight()} isDark={false} />
        <PreviewPanel resolved={resolvedDark()} isDark={true} />
      </Show>
    </div>
  )
}
