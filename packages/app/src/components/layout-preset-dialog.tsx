import { Component, createSignal, For, Show } from "solid-js"
import { Dialog } from "@opencode-ai/ui/dialog"
import { TextField } from "@opencode-ai/ui/text-field"
import { IconButton } from "@opencode-ai/ui/icon-button"
import { Button } from "@opencode-ai/ui/button"
import { Tooltip } from "@opencode-ai/ui/tooltip"
import { useLanguage } from "@/context/language"
import {
  type LayoutPreset,
  getPresets,
  getDefaultPresets,
  savePreset,
  deletePreset,
  serializeLayout,
} from "@/utils/layout-serialization"

export interface LayoutState {
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

interface LayoutPresetDialogProps {
  onLoad: (preset: LayoutPreset) => void
  onClose: () => void
  currentLayout: LayoutState
}

const isBuiltIn = (preset: LayoutPreset): boolean => preset.createdAt === 0

export const LayoutPresetDialog: Component<LayoutPresetDialogProps> = (props) => {
  const language = useLanguage()
  const [presets, setPresets] = createSignal<LayoutPreset[]>(getPresets())
  const [newPresetName, setNewPresetName] = createSignal("")
  const [selectedPreset, setSelectedPreset] = createSignal<LayoutPreset | null>(null)
  const [isCreating, setIsCreating] = createSignal(false)

  const handleDelete = (preset: LayoutPreset, e: MouseEvent) => {
    e.stopPropagation()
    if (isBuiltIn(preset)) return
    deletePreset(preset.id)
    setPresets(getPresets())
    if (selectedPreset()?.id === preset.id) {
      setSelectedPreset(null)
    }
  }

  const handleSave = () => {
    const name = newPresetName().trim()
    if (!name) return

    const preset = serializeLayout(props.currentLayout)
    preset.name = name
    savePreset(preset)
    setPresets(getPresets())
    setNewPresetName("")
    setIsCreating(false)
  }

  const handleLoad = (preset: LayoutPreset) => {
    props.onLoad(preset)
    props.onClose()
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave()
    } else if (e.key === "Escape") {
      if (isCreating()) {
        setIsCreating(false)
        setNewPresetName("")
      } else {
        props.onClose()
      }
    }
  }

  const formatPresetPreview = (preset: LayoutPreset) => {
    const parts: string[] = []
    parts.push(preset.sidebar.opened ? "Sidebar on" : "Sidebar off")
    parts.push(`Sidebar ${preset.sidebar.width}px`)
    parts.push(preset.terminal.opened ? `Terminal ${preset.terminal.height}px` : "Terminal off")
    parts.push(preset.fileTree.opened ? "Files on" : "Files off")
    return parts.join(" · ")
  }

  const groupedPresets = () => {
    const defaults = getDefaultPresets()
    const user = presets()
    return { defaults, user }
  }

  return (
    <Dialog title={language.t("layout.presets.title") || "Layout Presets"} onClose={props.onClose} transition>
      <div class="flex flex-col gap-4 min-h-0">
        <div class="flex flex-col gap-2">
          <Show
            when={isCreating()}
            fallback={
              <Button
                class="w-full justify-start"
                variant="secondary"
                icon="plus-small"
                onClick={() => setIsCreating(true)}
              >
                {language.t("layout.presets.save") || "Save Current Layout"}
              </Button>
            }
          >
            <div class="flex flex-col gap-2 p-3 bg-surface-raised rounded-md">
              <TextField
                autofocus
                placeholder={language.t("layout.presets.namePlaceholder") || "Preset name"}
                value={newPresetName()}
                onChange={(value) => setNewPresetName(String(value))}
                onKeyDown={handleKeyDown}
              />
              <div class="flex gap-2">
                <Button size="small" disabled={!newPresetName().trim()} onClick={handleSave}>
                  {language.t("common.save")}
                </Button>
                <Button
                  size="small"
                  variant="ghost"
                  onClick={() => {
                    setIsCreating(false)
                    setNewPresetName("")
                  }}
                >
                  {language.t("common.cancel")}
                </Button>
              </div>
            </div>
          </Show>
        </div>

        <div class="flex flex-col gap-3 min-h-0 max-h-80 overflow-y-auto">
          <Show when={groupedPresets().user.length > 0}>
            <div class="flex flex-col gap-1">
              <div class="text-12-medium text-text-weak px-1">
                {language.t("layout.presets.userPresets") || "My Presets"}
              </div>
              <For each={groupedPresets().user}>
                {(preset) => (
                  <PresetItem
                    preset={preset}
                    selected={selectedPreset()?.id === preset.id}
                    onSelect={() => setSelectedPreset(preset)}
                    onLoad={() => handleLoad(preset)}
                    onDelete={(e) => handleDelete(preset, e)}
                    canDelete
                  />
                )}
              </For>
            </div>
          </Show>

          <div class="flex flex-col gap-1">
            <div class="text-12-medium text-text-weak px-1">
              {language.t("layout.presets.builtInPresets") || "Built-in Presets"}
            </div>
            <For each={groupedPresets().defaults}>
              {(preset) => (
                <PresetItem
                  preset={preset}
                  selected={selectedPreset()?.id === preset.id}
                  onSelect={() => setSelectedPreset(preset)}
                  onLoad={() => handleLoad(preset)}
                  onDelete={() => {}}
                  canDelete={false}
                />
              )}
            </For>
          </div>
        </div>

        <Show when={selectedPreset()}>
          <div class="flex flex-col gap-1 p-3 bg-surface-raised rounded-md">
            <div class="text-12-medium text-text-weak">
              {language.t("layout.presets.preview") || "Preview"}
            </div>
            <div class="text-14-regular text-text-base">{formatPresetPreview(selectedPreset()!)}</div>
          </div>
        </Show>

        <div class="flex justify-end gap-2 pt-2 border-t border-surface-border">
          <Button variant="ghost" onClick={props.onClose}>
            {language.t("common.cancel")}
          </Button>
          <Show when={selectedPreset()}>
            <Button onClick={() => selectedPreset() && handleLoad(selectedPreset()!)}>
              {language.t("layout.presets.load") || "Load Preset"}
            </Button>
          </Show>
        </div>
      </div>
    </Dialog>
  )
}

interface PresetItemProps {
  preset: LayoutPreset
  selected: boolean
  onSelect: () => void
  onLoad: () => void
  onDelete: (e: MouseEvent) => void
  canDelete: boolean
}

const PresetItem: Component<PresetItemProps> = (props) => {
  return (
    <div
      class="group flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition-colors"
      classList={{
        "bg-surface-raised": props.selected,
        "hover:bg-surface-raised": !props.selected,
      }}
      onClick={props.onSelect}
      onDblClick={props.onLoad}
    >
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2">
          <span class="text-14-medium truncate">{props.preset.name}</span>
          <Show when={!props.canDelete}>
            <span class="text-11-regular text-text-weak">
              {language.t("layout.presets.builtIn") || "Built-in"}
            </span>
          </Show>
        </div>
        <div class="text-12-regular text-text-weak truncate">
          {props.preset.sidebar.opened ? "Sidebar on" : "Sidebar off"} ·{" "}
          {props.preset.terminal.opened
            ? `Terminal ${props.preset.terminal.height}px`
            : "Terminal off"}{" "}
          · {props.preset.fileTree.opened ? "Files on" : "Files off"}
        </div>
      </div>
      <Show when={props.canDelete}>
        <Tooltip value={language.t("common.delete")} placement="top">
          <IconButton
            icon="trash"
            variant="ghost"
            size="small"
            class="opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={props.onDelete}
          />
        </Tooltip>
      </Show>
    </div>
  )
}
