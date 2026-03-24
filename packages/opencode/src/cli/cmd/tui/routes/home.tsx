import { Prompt, type PromptRef } from "@tui/component/prompt"
import { createEffect, createMemo, Match, on, onMount, Show, Switch } from "solid-js"
import { useTheme } from "@tui/context/theme"
import { Tips } from "../component/tips"
import { Locale } from "@/util/locale"
import { useSync } from "../context/sync"
import { Toast } from "../ui/toast"
import { useArgs } from "../context/args"
import { useDirectory } from "../context/directory"
import { useRouteData } from "@tui/context/route"
import { usePromptRef } from "../context/prompt"
import { Installation } from "@/installation"
import { useKV } from "../context/kv"
import { useCommandDialog } from "../component/dialog-command"
import { useLocal } from "../context/local"
import { useDialog } from "@tui/ui/dialog"
import { DialogSessionList } from "../component/dialog-session-list"
import { DialogModel } from "../component/dialog-model"
import { DialogAgent } from "../component/dialog-agent"
import { DialogMcp } from "../component/dialog-mcp"

// TODO: what is the best way to do this?
let once = false

export function Home() {
  const sync = useSync()
  const kv = useKV()
  const { theme } = useTheme()
  const route = useRouteData("home")
  const promptRef = usePromptRef()
  const command = useCommandDialog()
  const dialog = useDialog()
  const mcp = createMemo(() => Object.keys(sync.data.mcp).length > 0)
  const mcpError = createMemo(() => {
    return Object.values(sync.data.mcp).some((x) => x.status === "failed")
  })

  const connectedMcpCount = createMemo(() => {
    return Object.values(sync.data.mcp).filter((x) => x.status === "connected").length
  })

  const isFirstTimeUser = createMemo(() => sync.data.session.length === 0)
  const tipsHidden = createMemo(() => kv.get("tips_hidden", false))
  const showTips = createMemo(() => {
    // Don't show tips for first-time users
    if (isFirstTimeUser()) return false
    return !tipsHidden()
  })

  command.register(() => [
    {
      title: tipsHidden() ? "Show tips" : "Hide tips",
      value: "tips.toggle",
      keybind: "tips_toggle",
      category: "System",
      onSelect: (dialog) => {
        kv.set("tips_hidden", !tipsHidden())
        dialog.clear()
      },
    },
  ])

  const Hint = (
    <Show when={connectedMcpCount() > 0}>
      <box flexShrink={0} flexDirection="row" gap={1}>
        <text fg={theme.text}>
          <Switch>
            <Match when={mcpError()}>
              <span style={{ fg: theme.error }}>•</span> mcp errors{" "}
              <span style={{ fg: theme.textMuted }}>ctrl+x s</span>
            </Match>
            <Match when={true}>
              <span style={{ fg: theme.success }}>•</span>{" "}
              {Locale.pluralize(connectedMcpCount(), "{} mcp server", "{} mcp servers")}
            </Match>
          </Switch>
        </text>
      </box>
    </Show>
  )

  let prompt: PromptRef
  const args = useArgs()
  const local = useLocal()
  onMount(() => {
    if (once) return
    if (route.initialPrompt) {
      prompt.set(route.initialPrompt)
      once = true
    } else if (args.prompt) {
      prompt.set({ input: args.prompt, parts: [] })
      once = true
    }
  })

  // Wait for sync and model store to be ready before auto-submitting --prompt
  createEffect(
    on(
      () => sync.ready && local.model.ready,
      (ready) => {
        if (!ready) return
        if (!args.prompt) return
        if (prompt.current?.input !== args.prompt) return
        prompt.submit()
      },
    ),
  )
  const directory = useDirectory()

  const H1 = `╔═╗╔═╗╔╦╗╔═╗╔╦╗╔═╗╦═╗╔╦╗`
  const H2 = `╚═╗╠═╣ ║ ║╣  ║ ║ ║╠╦╝ ║ `
  const H3 = `╚═╝╩ ╩ ╩ ╚═╝ ╩ ╚═╝╩╚══╩ `

  const L1 = `╔═╗`
  const L2 = `║  `
  const L3 = `╚═╝`

  const O1 = `╔═╗`
  const O2 = `║  ║`
  const O3 = `╚═╝`

  const N1 = `╔═╗╔╗ ╔═╗╔═╗╔╦╗`
  const N2 = `║ ║║║ ║ ║╠═╣ ║  `
  const N3 = `╚═╝╚╝ ╚═╝╩ ╩ ╩  `

  const S1 = `╔═╗╔═╗╔╦╗`
  const S2 = `║ ╚╝║  ║ `
  const S3 = `╚═╗╔═╝ ╩ `
  const S4 = `╚═╝╚═╝   `

  const T1 = `╔═╗╔═╗╔═╗`
  const T2 = `║     ║  `
  const T3 = `║     ║  `
  const T4 = `╚═╝   ╚═╝`

  const H2_1 = `╔═╗╔═╗╔╦╗╔═╗╔╦╗`
  const H2_2 = `╚═╗╠═╣ ║ ║╣  ║ `
  const H2_3 = `╚═╝╩ ╩ ╩ ╚═╝ ╩ `

  const E1 = `╔═╗╔═╗╔╦╗`
  const E2 = `║ ╚╝   ║ `
  const E3 = `╠═╗╔═╗ ║ `
  const E4 = `╚═╝╚═╝ ╩ `

  const J1 = `╔═╗╔═╗╔╦╗`
  const J2 = `║     ║  `
  const J3 = `║     ║  `
  const J4 = `╚═╝╚═╝ ╩ `

  const E2_1 = `╔═╗╔═╗╔╦╗`
  const E2_2 = `║ ╚╝   ║ `
  const E2_3 = `╠═╗╔═╗ ║ `
  const E2_4 = `╚═╝╚═╝ ╩ `

  const SH1 = `╔═╗╔═╗╔╦╗╔═╗╔╦╗╔═╗╦═╗╔╦╗`
  const SH2 = `╚═╗╠═╣ ║ ║╣  ║ ║ ║╠╦╝ ║ `
  const SH3 = `╚═╝╩ ╩ ╩ ╚═╝ ╩ ╚═╝╩╚══╩ `

  return (
    <>
      <box flexGrow={1} alignItems="center" paddingLeft={2} paddingRight={2}>
        <box flexGrow={1} minHeight={0} />
        <box flexShrink={0} flexDirection="column" alignItems="center">
          <text fg={theme.text} bold>{H1}  {L1}  {O1}  {N1}{S1}</text>
          <text fg={theme.text} bold>{H2}  {L2}  {O2}  {N2}{S2}</text>
          <text fg={theme.text} bold>{H3}  {L3}  {O3}  {N3}{S3}</text>
          <text fg={theme.text} bold>{`     `}     {`     `}  {T1}{S4}</text>
          <text fg={theme.text} bold>{`     `}     {`     `}  {T2} </text>
          <text fg={theme.text} bold>{`     `}     {`     `}  {T3} </text>
          <text fg={theme.text} bold>{`     `}     {`     `}  {T4} </text>
          <text fg={theme.text} bold>{H2_1}{E1}{H2_1}{J1}{E2_1}</text>
          <text fg={theme.text} bold>{H2_2}{E2}{H2_2}{J2}{E2_2}</text>
          <text fg={theme.text} bold>{H2_3}{E3}{H2_3}{J3}{E2_3}</text>
          <text fg={theme.text} bold>{`      `}{E4}{`      `}{J4}{E2_4}</text>
        </box>
        <box height={2} minHeight={0} flexShrink={1} />
        <box flexShrink={0} flexDirection="column" gap={1}>
          <box
            border={["left"]}
            paddingLeft={1}
            onMouseUp={() => dialog.replace(() => <DialogSessionList />)}
          >
            <text fg={theme.text}>Recent Sessions</text>
            <text fg={theme.textMuted}> [ctrl+x l]</text>
          </box>
          <box
            border={["left"]}
            paddingLeft={1}
            onMouseUp={() => dialog.replace(() => <DialogModel />)}
          >
            <text fg={theme.text}>Switch Model</text>
            <text fg={theme.textMuted}> [ctrl+x m]</text>
          </box>
          <box
            border={["left"]}
            paddingLeft={1}
            onMouseUp={() => dialog.replace(() => <DialogAgent />)}
          >
            <text fg={theme.text}>Switch Agent</text>
            <text fg={theme.textMuted}> [ctrl+x a]</text>
          </box>
          <box
            border={["left"]}
            paddingLeft={1}
            onMouseUp={() => dialog.replace(() => <DialogMcp />)}
          >
            <text fg={theme.text}>MCP Servers</text>
            <text fg={theme.textMuted}> [ctrl+x s]</text>
          </box>
        </box>
        <box height={2} minHeight={0} flexShrink={1} />
        <box width="100%" maxWidth={75} alignItems="center" flexShrink={1}>
          <Show when={showTips()}>
            <Tips />
          </Show>
        </box>
        <box flexGrow={1} minHeight={0} />
        <Toast />
      </box>
      <box paddingTop={1} paddingBottom={1} paddingLeft={2} paddingRight={2} flexDirection="row" flexShrink={0} gap={2}>
        <box width="100%" maxWidth={90} zIndex={1000}>
          <Prompt
            ref={(r) => {
              prompt = r
              promptRef.set(r)
            }}
            hint={Hint}
            workspaceID={route.workspaceID}
          />
        </box>
      </box>
      <box paddingTop={0} paddingBottom={1} paddingLeft={2} paddingRight={2} flexDirection="row" flexShrink={0} gap={2}>
        <text fg={theme.textMuted}>{directory()}</text>
        <box gap={1} flexDirection="row" flexShrink={0}>
          <Show when={mcp()}>
            <text fg={theme.text}>
              <Switch>
                <Match when={mcpError()}>
                  <span style={{ fg: theme.error }}>⊙ </span>
                </Match>
                <Match when={true}>
                  <span style={{ fg: connectedMcpCount() > 0 ? theme.success : theme.textMuted }}>⊙ </span>
                </Match>
              </Switch>
              {connectedMcpCount()} MCP
            </text>
            <text fg={theme.textMuted}>/status</text>
          </Show>
        </box>
        <box flexGrow={1} />
        <box flexShrink={0}>
          <text fg={theme.textMuted}>{Installation.VERSION}</text>
        </box>
      </box>
    </>
  )
}
