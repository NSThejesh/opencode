import { Component, For, Show, onMount } from "solid-js"
import { Dialog } from "@opencode-ai/ui/dialog"
import { Button } from "@opencode-ai/ui/button"
import { IconButton } from "@opencode-ai/ui/icon-button"
import { Spinner } from "@opencode-ai/ui/spinner"
import { PluginCard } from "./plugin-card"
import { usePluginRegistry } from "@/context/plugin-registry"
import { useLanguage } from "@/context/language"

type PluginManagerProps = {
  onClose: () => void
}

export const PluginManager: Component<PluginManagerProps> = (props) => {
  const language = useLanguage()
  const pluginRegistry = usePluginRegistry()

  onMount(() => {
    pluginRegistry.refreshPlugins()
  })

  return (
    <Dialog title={language.t("plugins.manager.title")} action={
      <IconButton
        icon="refresh"
        variant="ghost"
        onClick={() => pluginRegistry.refreshPlugins()}
        disabled={pluginRegistry.isLoading()}
        aria-label={language.t("plugins.manager.refresh")}
      />
    }>
      <div class="flex flex-col gap-4 min-h-[200px]">
        <Show when={pluginRegistry.error()}>
          <div class="flex items-center gap-2 px-2.5 py-2 rounded-md bg-icon-critical-base/10 text-13-regular text-icon-critical-base">
            {pluginRegistry.error()}
          </div>
        </Show>

        <Show when={pluginRegistry.isLoading() && pluginRegistry.plugins().length === 0}>
          <div class="flex items-center justify-center flex-1">
            <Spinner size="large" />
          </div>
        </Show>

        <Show
          when={pluginRegistry.plugins().length > 0}
          fallback={
            <Show when={!pluginRegistry.isLoading()}>
              <div class="flex flex-col items-center justify-center flex-1 gap-2 text-14-regular text-text-weak">
                <span>{language.t("plugins.manager.empty")}</span>
              </div>
            </Show>
          }
        >
          <div class="flex flex-col gap-3 max-h-[50vh] overflow-y-auto pr-1">
            <For each={pluginRegistry.plugins()}>
              {(plugin) => (
                <PluginCard
                  plugin={plugin}
                  onToggle={pluginRegistry.togglePlugin}
                  onDelete={pluginRegistry.deletePlugin}
                  canDelete={true}
                />
              )}
            </For>
          </div>
        </Show>
      </div>

      <div class="flex justify-end gap-2 pt-4 border-t border-border-base mt-4">
        <Button variant="secondary" onClick={props.onClose}>
          {language.t("common.close")}
        </Button>
      </div>
    </Dialog>
  )
}
