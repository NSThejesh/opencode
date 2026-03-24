import { Icon } from "@opencode-ai/ui/icon"
import { IconButton } from "@opencode-ai/ui/icon-button"
import { createEffect, createMemo, createSignal, Show } from "solid-js"
import { useTheme } from "@opencode-ai/ui/theme/context"
import { useLanguage } from "@/context/language"

export interface TerminalHistorySearchProps {
  terminalId: string
  onClose: () => void
  getBufferContent: () => string
  scrollToLine?: (lineIndex: number) => void
  getLineCount?: () => number
}

interface Match {
  index: number
  lineIndex: number
  columnIndex: number
  length: number
}

export const TerminalHistorySearch = (props: TerminalHistorySearchProps) => {
  const language = useLanguage()
  const theme = useTheme()
  const [query, setQuery] = createSignal("")
  const [matches, setMatches] = createSignal<Match[]>([])
  const [currentMatchIndex, setCurrentMatchIndex] = createSignal(0)
  const [highlightedLineIndex, setHighlightedLineIndex] = createSignal<number | null>(null)
  let inputRef!: HTMLInputElement

  const isDark = createMemo(() => theme.mode() === "dark")

  createEffect(() => {
    const searchQuery = query().trim()
    if (!searchQuery) {
      setMatches([])
      setCurrentMatchIndex(0)
      setHighlightedLineIndex(null)
      return
    }

    const content = props.getBufferContent()
    if (!content) {
      setMatches([])
      return
    }

    const foundMatches: Match[] = []
    const lines = content.split("\n")
    const lowerQuery = searchQuery.toLowerCase()

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex]
      const lowerLine = line.toLowerCase()
      let columnIndex = 0

      while (true) {
        const matchIndex = lowerLine.indexOf(lowerQuery, columnIndex)
        if (matchIndex === -1) break

        foundMatches.push({
          index: foundMatches.length,
          lineIndex,
          columnIndex: matchIndex,
          length: searchQuery.length,
        })

        columnIndex = matchIndex + 1
      }
    }

    setMatches(foundMatches)
    setCurrentMatchIndex(0)

    if (foundMatches.length > 0) {
      setHighlightedLineIndex(foundMatches[0].lineIndex)
      props.scrollToLine?.(foundMatches[0].lineIndex)
    } else {
      setHighlightedLineIndex(null)
    }
  })

  const handleKeyDown = (event: KeyboardEvent) => {
    const matchList = matches()

    if (event.key === "Enter") {
      event.preventDefault()

      if (event.shiftKey) {
        if (matchList.length > 0) {
          const newIndex = currentMatchIndex() === 0 ? matchList.length - 1 : currentMatchIndex() - 1
          setCurrentMatchIndex(newIndex)
          const match = matchList[newIndex]
          setHighlightedLineIndex(match.lineIndex)
          props.scrollToLine?.(match.lineIndex)
        }
      } else {
        if (matchList.length > 0) {
          const newIndex = currentMatchIndex() === matchList.length - 1 ? 0 : currentMatchIndex() + 1
          setCurrentMatchIndex(newIndex)
          const match = matchList[newIndex]
          setHighlightedLineIndex(match.lineIndex)
          props.scrollToLine?.(match.lineIndex)
        }
      }
      return
    }

    if (event.key === "Escape") {
      event.preventDefault()
      props.onClose()
      return
    }
  }

  createEffect(() => {
    inputRef?.focus()
  })

  const matchCount = createMemo(() => matches().length)

  return (
    <div
      class="absolute inset-0 z-50 flex items-start justify-center pt-12 pointer-events-none"
      onKeyDown={handleKeyDown}
    >
      <div class="absolute inset-0 bg-black/40 pointer-events-auto" onClick={props.onClose} />

      <div
        class="relative pointer-events-auto w-full max-w-lg mx-4 rounded-lg shadow-2xl overflow-hidden"
        style={{
          "background-color": isDark() ? "#1a1a1a" : "#ffffff",
          "border": `1px solid ${isDark() ? "#333333" : "#e0e0e0"}`,
        }}
      >
        <div class="flex items-center gap-2 px-3 py-2" style={{ "border-bottom": `1px solid ${isDark() ? "#333333" : "#e0e0e0"}` }}>
          <Icon name="search" size="small" class="shrink-0" style={{ color: isDark() ? "#888888" : "#666666" }} />
          <input
            ref={inputRef}
            type="text"
            value={query()}
            onInput={(e) => setQuery(e.currentTarget.value)}
            placeholder={language.t("terminal.history.search.placeholder") ?? "Search terminal history..."}
            class="flex-1 bg-transparent outline-none text-sm"
            style={{ color: isDark() ? "#e0e0e0" : "#1a1a1a" }}
          />
          <Show when={matchCount() > 0}>
            <span class="text-xs whitespace-nowrap" style={{ color: isDark() ? "#888888" : "#666666" }}>
              {currentMatchIndex() + 1} / {matchCount()}
            </span>
          </Show>
          <IconButton
            icon="close"
            variant="ghost"
            size="small"
            onClick={props.onClose}
            class="shrink-0"
            aria-label={language.t("terminal.history.search.close") ?? "Close search"}
          />
        </div>

        <Show when={query().trim().length > 0}>
          <div class="px-3 py-1.5 text-xs" style={{ color: isDark() ? "#888888" : "#666666" }}>
            <Show
              when={matchCount() > 0}
              fallback={
                <span>No matches found</span>
              }
            >
              <span>
                {matchCount()} match{matchCount() === 1 ? "" : "es"} found
              </span>
            </Show>
          </div>
        </Show>

        <Show when={matchCount() > 0}>
          <div
            class="px-3 py-1.5 text-xs flex items-center gap-3"
            style={{ "border-top": `1px solid ${isDark() ? "#333333" : "#e0e0e0"}`, color: isDark() ? "#666666" : "#999999" }}
          >
            <span>
              <kbd
                class="px-1 py-0.5 rounded text-xs"
                style={{ "background-color": isDark() ? "#2a2a2a" : "#f0f0f0" }}
              >
                Enter
              </kbd>
              {" "}next
            </span>
            <span>
              <kbd
                class="px-1 py-0.5 rounded text-xs"
                style={{ "background-color": isDark() ? "#2a2a2a" : "#f0f0f0" }}
              >
                Shift+Enter
              </kbd>
              {" "}previous
            </span>
            <span>
              <kbd
                class="px-1 py-0.5 rounded text-xs"
                style={{ "background-color": isDark() ? "#2a2a2a" : "#f0f0f0" }}
              >
                Esc
              </kbd>
              {" "}close
            </span>
          </div>
        </Show>
      </div>
    </div>
  )
}

export default TerminalHistorySearch
