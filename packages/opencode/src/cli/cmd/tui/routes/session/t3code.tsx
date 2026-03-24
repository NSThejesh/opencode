import {
  batch,
  createContext,
  createEffect,
  createMemo,
  createSignal,
  For,
  Match,
  on,
  onMount,
  Show,
  Switch,
  useContext,
} from "solid-js"
import { Dynamic } from "solid-js/web"
import { useRoute, useRouteData } from "@tui/context/route"
import { useSync } from "@tui/context/sync"
import { SplitBorder } from "@tui/component/border"
import { selectedForeground, useTheme } from "@tui/context/theme"
import {
  BoxRenderable,
  ScrollBoxRenderable,
  addDefaultParsers,
  MacOSScrollAccel,
  type ScrollAcceleration,
  TextAttributes,
  RGBA,
} from "@opentui/core"
import { Prompt, type PromptRef } from "@tui/component/prompt"
import type { AssistantMessage, Part, ToolPart, UserMessage, TextPart, ReasoningPart } from "@opencode-ai/sdk/v2"
import { useLocal } from "@tui/context/local"
import { Locale } from "@/util/locale"
import { useKeyboard, useRenderer, useTerminalDimensions, type JSX } from "@opentui/solid"
import { useSDK } from "@tui/context/sdk"
import { useCommandDialog } from "@tui/component/dialog-command"
import type { DialogContext } from "@tui/ui/dialog"
import { useKeybind } from "@tui/context/keybind"
import { formatRelativeTime } from "@/util/time"
import { DialogMessage } from "./dialog-message"
import type { PromptInfo } from "../../component/prompt/history"
import { DialogTimeline } from "./dialog-timeline"
import { DialogSessionRename } from "../../component/dialog-session-rename"
import { useKV } from "../../context/kv"
import { Toast, useToast } from "../../ui/toast"
import { formatTranscript } from "../../util/transcript"
import { UI } from "@/cli/ui"
import { useTuiConfig } from "../../context/tui-config"

addDefaultParsers()

const context = createContext<{
  width: number
  sessionID: string
  conceal: () => boolean
  showThinking: () => boolean
  showTimestamps: () => boolean
  showDetails: () => boolean
  showGenericToolOutput: () => boolean
  diffWrapMode: () => "word" | "none"
  sync: ReturnType<typeof useSync>
  tui: ReturnType<typeof useTuiConfig>
}>()

function use() {
  const ctx = useContext(context)
  if (!ctx) throw new Error("useContext must be used within a Session component")
  return ctx
}

export function T3CodeSession() {
  const route = useRouteData("session")
  const { navigate } = useRoute()
  const sync = useSync()
  const tuiConfig = useTuiConfig()
  const kv = useKV()
  const { theme } = useTheme()
  const sdk = useSDK()
  const toast = useToast()
  const promptRef = usePromptRef()
  const command = useCommandDialog()
  const dialog = useDialog()
  const keybind = useKeybind()
  const renderer = useRenderer()
  const local = useLocal()
  const dimensions = useTerminalDimensions()
  const exit = useExit()

  const [sidebarOpen, setSidebarOpen] = createSignal(true)
  const [threadListOpen, setThreadListOpen] = createSignal(true)

  const sessions = createMemo(() => sync.data.session)
  const messages = createMemo(() => sync.data.message[route.sessionID] ?? [])

  const projects = createMemo(() => {
    const projectMap = new Map<string, { id: string; name: string; sessions: typeof sessions }>()
    for (const session of sessions()) {
      const wsId = session.workspaceID
      if (!wsId) continue
      if (!projectMap.has(wsId)) {
        projectMap.set(wsId, {
          id: wsId,
          name: wsId.split("/").pop() || wsId,
          sessions: [],
        })
      }
      projectMap.get(wsId)!.sessions.push(session)
    }
    return Array.from(projectMap.values())
  })

  const projectSessions = createMemo(() => {
    const currentSession = sessions().find((s) => s.id === route.sessionID)
    if (!currentSession) return []
    return sessions().filter((s) => s.workspaceID === currentSession.workspaceID)
  })

  const wide = createMemo(() => dimensions().width > 140)

  const sidebarWidth = createMemo(() => {
    if (!sidebarOpen()) return 30
    return wide() ? 40 : 30
  })

  const threadListWidth = createMemo(() => {
    if (!threadListOpen()) return 30
    return wide() ? 50 : 40
  })

  const mainWidth = createMemo(() => {
    return dimensions().width - sidebarWidth() - threadListWidth() - 4
  })

  const currentSession = createMemo(() => sessions().find((s) => s.id === route.sessionID))

  function selectSession(sessionId: string) {
    navigate(`/session/${sessionId}`)
  }

  function selectProject(projectId: string) {
    const firstSession = sessions().find((s) => s.workspaceID === projectId)
    if (firstSession) {
      selectSession(firstSession.id)
    }
  }

  return (
    <box flexDirection="row" flexGrow={1}>
      <box width={sidebarWidth()} flexDirection="column" gap={0}>
        <box padding={1} border={["bottom"]}>
          <text fg={theme.textBold}>Projects</text>
        </box>
        <scrollbox flexGrow={1}>
          <For each={projects()}>
            {(project) => (
              <box
                paddingLeft={1}
                paddingRight={1}
                paddingTop={1}
                paddingBottom={1}
                onMouseUp={() => selectProject(project.id)}
              >
                <text fg={currentSession()?.workspaceID === project.id ? theme.text : theme.textMuted}>
                  {currentSession()?.workspaceID === project.id ? ">" : " "} {project.name}
                </text>
              </box>
            )}
          </For>
        </scrollbox>
      </box>

      <box width={1} />

      <box width={threadListWidth()} flexDirection="column" gap={0}>
        <box padding={1} border={["bottom"]} flexDirection="row" justifyContent="space-between">
          <text fg={theme.textBold}>Threads</text>
          <text
            fg={theme.textMuted}
            onMouseUp={() => command.trigger("session.new")}
            style={{ cursor: "pointer" }}
          >
            + New
          </text>
        </box>
        <scrollbox flexGrow={1}>
          <For each={projectSessions()}>
            {(session) => (
              <box
                paddingLeft={1}
                paddingRight={1}
                paddingTop={1}
                paddingBottom={1}
                onMouseUp={() => selectSession(session.id)}
              >
                <text
                  fg={session.id === route.sessionID ? theme.text : theme.textMuted}
                  style={{ "font-weight": session.id === route.sessionID ? "bold" : "normal" }}
                >
                  {session.id === route.sessionID ? ">" : " "} {session.title || "Untitled"}
                </text>
                <Show when={session.id !== route.sessionID}>
                  <text fg={theme.textMuted} marginLeft={2}>
                    {formatRelativeTime(session.time.updated || session.time.created)}
                  </text>
                </Show>
              </box>
            )}
          </For>
        </scrollbox>
      </box>

      <box width={1} />

      <box flexGrow={1} flexDirection="column">
        <box height={3} border={["bottom"]} paddingLeft={1}>
          <text fg={theme.textMuted}>
            {currentSession()?.title || "Session"} | {messages().length} messages
          </text>
        </box>
        <scrollbox flexGrow={1}>
          <For each={messages()}>
            {(message) => (
              <box paddingLeft={1} paddingRight={1} paddingTop={1}>
                <text fg={message.role === "user" ? theme.text : theme.textMuted}>
                  {message.role === "user" ? "User" : "Assistant"}:
                </text>
                <Show when={message.role === "assistant"}>
                  <text fg={theme.textMuted}> [completed]</text>
                </Show>
              </box>
            )}
          </For>
        </scrollbox>
        <box height={3} border={["top"]} paddingLeft={1} flexDirection="row" alignItems="center">
          <text fg={theme.textMuted}>Type a message...</text>
        </box>
      </box>
    </box>
  )
}

function formatRelativeTime(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return "now"
}
