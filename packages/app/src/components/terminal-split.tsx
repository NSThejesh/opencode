import { Show, createEffect, onCleanup, createSignal } from "solid-js"
import { ResizeHandle } from "@opencode-ai/ui/resize-handle"
import { Terminal } from "@/components/terminal"
import { useTerminalSplit } from "@/context/terminal-split"
import { useTerminal } from "@/context/terminal"
import type { LocalPTY } from "@/context/terminal"

export type TerminalSplitProps = {
  splitId: string
  onClose?: () => void
}

export const TerminalSplit = (props: TerminalSplitProps) => {
  const terminalSplit = useTerminalSplit()
  const terminal = useTerminal()

  const split = () => terminalSplit.splits()[props.splitId]
  const direction = () => split()?.direction ?? "horizontal"
  const terminals = () => split()?.terminals ?? []
  const activeIndex = () => split()?.activeIndex ?? 0

  const [splitRatio, setSplitRatio] = createSignal(0.5)

  const handleKeyDown = (event: KeyboardEvent) => {
    const ctrl = event.ctrlKey || event.metaKey

    if (ctrl && event.key === "w") {
      event.preventDefault()
      props.onClose?.()
      return
    }

    if (ctrl && event.key === "\\") {
      event.preventDefault()
      const currentDirection = direction()
      terminalSplit.setSplitDirection(props.splitId, currentDirection === "horizontal" ? "vertical" : "horizontal")
      return
    }

    if (ctrl && event.key === "Tab") {
      event.preventDefault()
      terminalSplit.cycleActiveTerminal(props.splitId, "next")
      return
    }
  }

  createEffect(() => {
    const handler = (event: KeyboardEvent) => handleKeyDown(event)
    window.addEventListener("keydown", handler)
    onCleanup(() => window.removeEventListener("keydown", handler))
  })

  const activeTerminalId = () => {
    const termList = terminals()
    if (termList.length === 0) return null
    const idx = activeIndex()
    return termList[idx] ?? termList[0] ?? null
  }

  const getTerminalById = (id: string): LocalPTY | undefined => {
    return terminal.all().find((t) => t.id === id)
  }

  const isHorizontal = () => direction() === "horizontal"

  const firstTerminal = () => {
    const termList = terminals()
    return termList.length > 0 ? getTerminalById(termList[0]) : undefined
  }

  const secondTerminal = () => {
    const termList = terminals()
    return termList.length > 1 ? getTerminalById(termList[1]) : undefined
  }

  const firstFlex = () => (isHorizontal() ? `${splitRatio() * 100}%` : "100%")
  const secondFlex = () => (isHorizontal() ? `${(1 - splitRatio()) * 100}%` : "100%")

  return (
    <div
      class="flex w-full h-full overflow-hidden"
      classList={{
        "flex-row": isHorizontal(),
        "flex-col": !isHorizontal(),
      }}
    >
      <Show when={firstTerminal()}>
        {(pty) => (
          <div
            class="overflow-hidden"
            style={{
              [isHorizontal() ? "width" : "height"]: firstFlex(),
              "min-width": isHorizontal() ? "100px" : undefined,
              "min-height": !isHorizontal() ? "100px" : undefined,
            }}
          >
            <Terminal
              pty={pty()}
              autoFocus={activeTerminalId() === pty().id}
            />
          </div>
        )}
      </Show>

      <Show when={terminals().length > 1}>
        <ResizeHandle
          direction={isHorizontal() ? "horizontal" : "vertical"}
          onResize={(next) => setSplitRatio(next)}
        />
      </Show>

      <Show when={secondTerminal()}>
        {(pty) => (
          <div
            class="overflow-hidden"
            style={{
              [isHorizontal() ? "width" : "height"]: secondFlex(),
              "min-width": isHorizontal() ? "100px" : undefined,
              "min-height": !isHorizontal() ? "100px" : undefined,
            }}
          >
            <Terminal
              pty={pty()}
              autoFocus={activeTerminalId() === pty().id}
            />
          </div>
        )}
      </Show>
    </div>
  )
}

export const TerminalSplitView = () => {
  const terminalSplit = useTerminalSplit()

  const activeSplitId = () => terminalSplit.activeSplitId()

  const handleCloseSplit = (splitId: string) => {
    terminalSplit.closeSplit(splitId)
  }

  return (
    <Show when={activeSplitId()}>
      {(splitId) => (
        <TerminalSplit
          splitId={splitId()}
          onClose={() => handleCloseSplit(splitId())}
        />
      )}
    </Show>
  )
}
