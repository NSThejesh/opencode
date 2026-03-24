import { createSignal, For, Show, type Accessor, type JSX } from "solid-js"
import { ResizeHandle } from "@opencode-ai/ui/resize-handle"
import { Button } from "@opencode-ai/ui/button"
import { IconButton } from "@opencode-ai/ui/icon-button"
import { Icon } from "@opencode-ai/ui/icon"
import { Tooltip } from "@opencode-ai/ui/tooltip"

export interface T3CodeLayoutProps {
  activeProject?: string
  activeThread?: string
  projects: Array<{ id: string; name: string; path: string }>
  threads: Array<{ id: string; title: string; updatedAt: number }>
  messages: Array<{ role: "user" | "assistant"; content: string }>
  onSendMessage: (msg: string) => void
  onSelectProject: (id: string) => void
  onSelectThread: (id: string) => void
  onNewThread: () => void
  onNewProject: () => void
}

export interface T3CodeProjectSidebarProps {
  projects: Array<{ id: string; name: string; path: string }>
  activeProject?: string
  collapsed: boolean
  width: Accessor<number>
  onSelectProject: (id: string) => void
  onNewProject: () => void
  onCollapse: () => void
  onResize: (width: number) => void
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
  return "just now"
}

export const T3CodeProjectSidebar = (props: T3CodeProjectSidebarProps): JSX.Element => {
  return (
    <div
      class="flex flex-col h-full bg-surface-base border-r border-border-weak-base"
      style={{ width: `${props.width()}px` }}
    >
      <div class="flex items-center justify-between px-3 py-2 border-b border-border-weak-base">
        <Show
          when={!props.collapsed}
          fallback={
            <IconButton
              size="small"
              variant="ghost"
              onClick={props.onCollapse}
              class="mx-auto"
            >
              <Icon name="sidebar" size="small" />
            </IconButton>
          }
        >
          <span class="text-13-medium text-text-base truncate">Projects</span>
          <div class="flex items-center gap-1">
            <Tooltip content="Add Project" position="bottom">
              <IconButton size="small" variant="ghost" onClick={props.onNewProject}>
                <Icon name="plus" size="small" />
              </IconButton>
            </Tooltip>
            <Tooltip content="Collapse" position="bottom">
              <IconButton size="small" variant="ghost" onClick={props.onCollapse}>
                <Icon name="sidebar" size="small" />
              </IconButton>
            </Tooltip>
          </div>
        </Show>
      </div>

      <div class="flex-1 overflow-y-auto py-1">
        <For each={props.projects}>
          {(project) => {
            const isActive = () => project.id === props.activeProject
            return (
              <button
                type="button"
                onClick={() => props.onSelectProject(project.id)}
                class="w-full flex items-center gap-2 px-3 py-1.5 text-left transition-colors"
                classList={{
                  "bg-surface-base-hover": isActive(),
                  "hover:bg-surface-base-hover": !isActive(),
                }}
              >
                <div
                  class="shrink-0 size-6 rounded flex items-center justify-center text-11-medium"
                  classList={{
                    "bg-surface-interactive-base text-text-interactive": isActive(),
                    "bg-surface-weak text-text-weak": !isActive(),
                  }}
                >
                  {project.name.charAt(0).toUpperCase()}
                </div>
                <Show when={!props.collapsed}>
                  <div class="flex-1 min-w-0">
                    <div class="text-13-medium text-text-base truncate">{project.name}</div>
                    <div class="text-11-medium text-text-weak truncate">{project.path}</div>
                  </div>
                </Show>
              </button>
            )
          }}
        </For>
      </div>

      <Show when={props.collapsed}>
        <div class="py-2 border-t border-border-weak-base">
          <Tooltip content="Add Project" position="right">
            <IconButton size="small" variant="ghost" onClick={props.onNewProject} class="mx-auto">
              <Icon name="plus" size="small" />
            </IconButton>
          </Tooltip>
        </div>
      </Show>
    </div>
  )
}

export interface T3CodeThreadListProps {
  threads: Array<{ id: string; title: string; updatedAt: number }>
  activeThread?: string
  collapsed: boolean
  width: Accessor<number>
  onSelectThread: (id: string) => void
  onNewThread: () => void
  onCollapse: () => void
  onResize: (width: number) => void
}

export const T3CodeThreadList = (props: T3CodeThreadListProps): JSX.Element => {
  return (
    <div
      class="flex flex-col h-full bg-surface-base border-r border-border-weak-base"
      style={{ width: `${props.width()}px` }}
    >
      <div class="flex items-center justify-between px-3 py-2 border-b border-border-weak-base">
        <Show
          when={!props.collapsed}
          fallback={
            <IconButton
              size="small"
              variant="ghost"
              onClick={props.onCollapse}
              class="mx-auto"
            >
              <Icon name="sidebar" size="small" />
            </IconButton>
          }
        >
          <span class="text-13-medium text-text-base truncate">Threads</span>
          <Tooltip content="New Thread" position="bottom">
            <IconButton size="small" variant="ghost" onClick={props.onNewThread}>
              <Icon name="plus" size="small" />
            </IconButton>
          </Tooltip>
        </Show>
      </div>

      <div class="flex-1 overflow-y-auto py-1">
        <Show
          when={props.threads.length > 0}
          fallback={
            <div class="flex flex-col items-center justify-center h-full px-4 text-center">
              <div class="text-12-medium text-text-weak mb-2">No threads yet</div>
              <Button size="small" variant="ghost" onClick={props.onNewThread}>
                Create your first thread
              </Button>
            </div>
          }
        >
          <For each={props.threads}>
            {(thread) => {
              const isActive = () => thread.id === props.activeThread
              return (
                <button
                  type="button"
                  onClick={() => props.onSelectThread(thread.id)}
                  class="w-full flex flex-col gap-0.5 px-3 py-2 text-left transition-colors"
                  classList={{
                    "bg-surface-base-hover": isActive(),
                    "hover:bg-surface-base-hover": !isActive(),
                  }}
                >
                  <div class="text-13-medium text-text-base truncate">{thread.title}</div>
                  <div class="text-11-medium text-text-weak">
                    {formatRelativeTime(thread.updatedAt)}
                  </div>
                </button>
              )
            }}
          </For>
        </Show>
      </div>

      <Show when={props.collapsed}>
        <div class="py-2 border-t border-border-weak-base">
          <Tooltip content="New Thread" position="right">
            <IconButton size="small" variant="ghost" onClick={props.onNewThread} class="mx-auto">
              <Icon name="plus" size="small" />
            </IconButton>
          </Tooltip>
        </div>
      </Show>
    </div>
  )
}

export interface T3CodeChatPanelProps {
  messages: Array<{ role: "user" | "assistant"; content: string }>
  onSendMessage: (msg: string) => void
}

export const T3CodeChatPanel = (props: T3CodeChatPanelProps): JSX.Element => {
  const [input, setInput] = createSignal("")
  let messagesEndRef: HTMLDivElement | undefined

  const handleSubmit = (e: Event) => {
    e.preventDefault()
    const value = input().trim()
    if (!value) return
    props.onSendMessage(value)
    setInput("")
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div class="flex flex-col h-full bg-background-base">
      <div class="flex-1 overflow-y-auto px-4 py-4">
        <Show
          when={props.messages.length > 0}
          fallback={
            <div class="flex flex-col items-center justify-center h-full text-center">
              <div class="text-16-medium text-text-base mb-2">Start a conversation</div>
              <div class="text-13-medium text-text-weak max-w-xs">
                Ask questions, get help with code, or just chat with the AI assistant
              </div>
            </div>
          }
        >
          <div class="flex flex-col gap-4 max-w-2xl mx-auto">
            <For each={props.messages}>
              {(message) => (
                <div
                  class="flex gap-3"
                  classList={{
                    "flex-row-reverse": message.role === "user",
                  }}
                >
                  <div
                    class="shrink-0 size-8 rounded-full flex items-center justify-center text-12-medium"
                    classList={{
                      "bg-surface-interactive-base": message.role === "assistant",
                      "bg-surface-brand-base": message.role === "user",
                    }}
                  >
                    <Show
                      when={message.role === "assistant"}
                      fallback={<Icon name="user" size="small" />}
                    >
                      <Icon name="sparkle" size="small" />
                    </Show>
                  </div>

                  <div
                    class="flex-1 rounded-lg px-4 py-3 text-14-regular"
                    classList={{
                      "bg-surface-base text-text-base": message.role === "assistant",
                      "bg-surface-interactive-weak text-text-base": message.role === "user",
                    }}
                  >
                    <pre class="font-mono text-13-regular whitespace-pre-wrap break-words">
                      {message.content}
                    </pre>
                  </div>
                </div>
              )}
            </For>
            <div ref={messagesEndRef} />
          </div>
        </Show>
      </div>

      <div class="border-t border-border-weak-base p-4">
        <form onSubmit={handleSubmit} class="max-w-2xl mx-auto">
          <div class="relative flex items-end gap-2 rounded-lg border border-border-weak-base bg-surface-base px-4 py-3 focus-within:border-border-selected focus-within:shadow-xs-border-focus transition-shadow">
            <textarea
              value={input()}
              onInput={(e) => setInput(e.currentTarget.value)}
              onKeyDown={handleKeyDown}
              placeholder="Send a message..."
              rows={1}
              class="flex-1 bg-transparent text-14-regular text-text-base placeholder:text-text-weak resize-none outline-none min-h-[24px] max-h-[200px]"
              style={{
                height: "auto",
                "overflow-y": "auto",
              }}
              ref={(el) => {
                const adjustHeight = () => {
                  el.style.height = "auto"
                  el.style.height = `${Math.min(el.scrollHeight, 200)}px`
                }
                el.addEventListener("input", adjustHeight)
                adjustHeight()
              }}
            />
            <IconButton
              type="submit"
              size="small"
              variant="ghost"
              disabled={!input().trim()}
              class="shrink-0"
            >
              <Icon name="arrow-up" size="small" />
            </IconButton>
          </div>
          <div class="mt-2 text-11-medium text-text-weak text-center">
            AI responses may be inaccurate. Review carefully.
          </div>
        </form>
      </div>
    </div>
  )
}

export const T3CodeLayout = (props: T3CodeLayoutProps): JSX.Element => {
  const [sidebarWidth, setSidebarWidth] = createSignal(240)
  const [threadListWidth, setThreadListWidth] = createSignal(280)
  const [sidebarCollapsed, setSidebarCollapsed] = createSignal(false)
  const [threadListCollapsed, setThreadListCollapsed] = createSignal(false)

  const MIN_SIDEBAR = 48
  const MAX_SIDEBAR = 400
  const MIN_THREAD_LIST = 200
  const MAX_THREAD_LIST = 500

  return (
    <div class="flex h-full w-full relative overflow-hidden">
      <Show when={!sidebarCollapsed()}>
        <T3CodeProjectSidebar
          projects={props.projects}
          activeProject={props.activeProject}
          collapsed={sidebarCollapsed()}
          width={sidebarWidth}
          onSelectProject={props.onSelectProject}
          onNewProject={props.onNewProject}
          onCollapse={() => setSidebarCollapsed(true)}
          onResize={setSidebarWidth}
        />
      </Show>

      <Show when={!sidebarCollapsed()}>
        <ResizeHandle
          direction="horizontal"
          edge="end"
          size={sidebarWidth()}
          min={MIN_SIDEBAR}
          max={MAX_SIDEBAR}
          snapPoints={[MIN_SIDEBAR, 240, 320]}
          snapThreshold={8}
          collapseThreshold={MIN_SIDEBAR + 20}
          onResize={setSidebarWidth}
          onCollapse={() => setSidebarCollapsed(true)}
        />
      </Show>

      <Show when={sidebarCollapsed()}>
        <div class="h-full w-12 bg-surface-base border-r border-border-weak-base flex flex-col items-center py-2">
          <Tooltip content="Expand Projects" position="right">
            <IconButton
              size="small"
              variant="ghost"
              onClick={() => setSidebarCollapsed(false)}
            >
              <Icon name="sidebar" size="small" />
            </IconButton>
          </Tooltip>
          <div class="flex-1" />
          <Show when={props.projects.length > 0}>
            <div class="flex flex-col gap-1 py-2">
              <For each={props.projects.slice(0, 3)}>
                {(project) => (
                  <button
                    type="button"
                    onClick={() => props.onSelectProject(project.id)}
                    class="size-8 rounded flex items-center justify-center text-12-medium transition-colors"
                    classList={{
                      "bg-surface-interactive-base": project.id === props.activeProject,
                      "bg-surface-weak hover:bg-surface-base-hover": project.id !== props.activeProject,
                    }}
                  >
                    {project.name.charAt(0).toUpperCase()}
                  </button>
                )}
              </For>
            </div>
          </Show>
        </div>
      </Show>

      <Show when={!threadListCollapsed()}>
        <T3CodeThreadList
          threads={props.threads}
          activeThread={props.activeThread}
          collapsed={threadListCollapsed()}
          width={threadListWidth}
          onSelectThread={props.onSelectThread}
          onNewThread={props.onNewThread}
          onCollapse={() => setThreadListCollapsed(true)}
          onResize={setThreadListWidth}
        />
      </Show>

      <Show when={!threadListCollapsed()}>
        <ResizeHandle
          direction="horizontal"
          edge="end"
          size={threadListWidth()}
          min={MIN_THREAD_LIST}
          max={MAX_THREAD_LIST}
          snapPoints={[MIN_THREAD_LIST, 280, 360]}
          snapThreshold={8}
          collapseThreshold={MIN_THREAD_LIST + 20}
          onResize={setThreadListWidth}
          onCollapse={() => setThreadListCollapsed(true)}
        />
      </Show>

      <Show when={threadListCollapsed()}>
        <div class="h-full w-12 bg-surface-base border-r border-border-weak-base flex flex-col items-center py-2">
          <Tooltip content="Expand Threads" position="right">
            <IconButton
              size="small"
              variant="ghost"
              onClick={() => setThreadListCollapsed(false)}
            >
              <Icon name="sidebar" size="small" />
            </IconButton>
          </Tooltip>
          <div class="flex-1 overflow-y-auto py-2">
            <For each={props.threads.slice(0, 5)}>
              {(thread) => (
                <Tooltip content={thread.title} position="right">
                  <button
                    type="button"
                    onClick={() => props.onSelectThread(thread.id)}
                    class="size-8 rounded flex items-center justify-center mb-1 text-11-medium transition-colors"
                    classList={{
                      "bg-surface-interactive-base": thread.id === props.activeThread,
                      "bg-surface-weak hover:bg-surface-base-hover": thread.id !== props.activeThread,
                    }}
                  >
                    {thread.title.charAt(0).toUpperCase()}
                  </button>
                </Tooltip>
              )}
            </For>
          </div>
          <Tooltip content="New Thread" position="right">
            <IconButton size="small" variant="ghost" onClick={props.onNewThread}>
              <Icon name="plus" size="small" />
            </IconButton>
          </Tooltip>
        </div>
      </Show>

      <div class="flex-1 min-w-0">
        <T3CodeChatPanel messages={props.messages} onSendMessage={props.onSendMessage} />
      </div>
    </div>
  )
}

export default T3CodeLayout
