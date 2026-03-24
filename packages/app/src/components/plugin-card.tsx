import { Component, Show } from "solid-js"
import { Card, CardTitle, CardDescription, CardActions } from "@opencode-ai/ui/card"
import { Switch } from "@opencode-ai/ui/switch"
import { Button } from "@opencode-ai/ui/button"
import { IconButton } from "@opencode-ai/ui/icon-button"
import type { PluginInfo } from "@/context/plugin-registry"

type PluginCardProps = {
  plugin: PluginInfo
  onToggle: (id: string) => void
  onDelete?: (id: string) => void
  onSettings?: (id: string) => void
  canDelete?: boolean
}

export const PluginCard: Component<PluginCardProps> = (props) => {
  const hasSettings = () => props.plugin.settings && Object.keys(props.plugin.settings).length > 0

  return (
    <Card>
      <div class="flex items-start justify-between gap-3">
        <div class="flex-1 min-w-0">
          <CardTitle>
            {props.plugin.name}
            <Show when={props.plugin.version}>
              <span class="text-text-weak text-12-regular ml-2">v{props.plugin.version}</span>
            </Show>
          </CardTitle>
          <CardDescription class="mt-1">
            <Show when={props.plugin.hooks.length > 0} fallback={<span class="text-text-weak">No hooks</span>}>
              <div class="flex flex-wrap gap-1">
                {props.plugin.hooks.map((hook) => (
                  <span class="inline-flex items-center px-1.5 py-0.5 rounded bg-bg-base text-11-regular text-text-base">
                    {hook}
                  </span>
                ))}
              </div>
            </Show>
          </CardDescription>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <Show when={props.onSettings && hasSettings()}>
            <IconButton
              icon="settings"
              variant="ghost"
              size="small"
              onClick={() => props.onSettings?.(props.plugin.id)}
              aria-label="Plugin settings"
            />
          </Show>
          <Show when={props.onDelete && props.canDelete}>
            <IconButton
              icon="trash"
              variant="ghost"
              size="small"
              onClick={() => props.onDelete?.(props.plugin.id)}
              aria-label="Delete plugin"
            />
          </Show>
          <Switch checked={props.plugin.enabled} onChange={() => props.onToggle(props.plugin.id)}>
            {props.plugin.enabled ? "Enabled" : "Disabled"}
          </Switch>
        </div>
      </div>
    </Card>
  )
}
