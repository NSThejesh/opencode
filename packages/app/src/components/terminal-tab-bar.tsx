import { For, Show, createMemo, createSignal, onCleanup } from "solid-js"
import type { JSX } from "solid-js"
import { createSortable } from "@thisbeyond/solid-dnd"
import { Tabs } from "@opencode-ai/ui/tabs"
import { IconButton } from "@opencode-ai/ui/icon-button"
import { Icon } from "@opencode-ai/ui/icon"

export interface Tab {
  id: string
  title: string
  active?: boolean
}

export interface TerminalTabBarProps {
  tabs: Tab[]
  onTabSelect: (id: string) => void
  onTabClose: (id: string) => void
  onTabReorder: (from: number, to: number) => void
}

interface ContextMenuState {
  open: boolean
  tabId: string | null
  position: { x: number; y: number }
}

export function TerminalTabBar(props: TerminalTabBarProps): JSX.Element {
  const [searchQuery, setSearchQuery] = createSignal("")
  const [contextMenu, setContextMenu] = createSignal<ContextMenuState>({
    open: false,
    tabId: null,
    position: { x: 0, y: 0 },
  })
  const [canScrollLeft, setCanScrollLeft] = createSignal(false)
  const [canScrollRight, setCanScrollRight] = createSignal(false)

  let searchInputRef: HTMLInputElement | undefined
  let tabsContainerRef: HTMLDivElement | undefined

  const filteredTabs = createMemo(() => {
    const query = searchQuery().toLowerCase().trim()
    if (!query) return props.tabs
    return props.tabs.filter((tab) => tab.title.toLowerCase().includes(query))
  })

  const updateScrollButtons = () => {
    if (!tabsContainerRef) return
    const { scrollLeft: sl, scrollWidth, clientWidth } = tabsContainerRef
    setCanScrollLeft(sl > 0)
    setCanScrollRight(sl + clientWidth < scrollWidth - 1)
  }

  const scrollTabs = (direction: "left" | "right") => {
    if (!tabsContainerRef) return
    tabsContainerRef.scrollBy({
      left: direction === "left" ? -200 : 200,
      behavior: "smooth",
    })
  }

  const handleSearchKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      setSearchQuery("")
      searchInputRef?.blur()
    }
  }

  const openContextMenu = (e: MouseEvent, tabId: string) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({
      open: true,
      tabId,
      position: { x: e.clientX, y: e.clientY },
    })
  }

  const closeContextMenu = () => {
    setContextMenu((prev) => ({ ...prev, open: false }))
  }

  const handleContextMenuAction = (action: "close" | "closeOthers" | "closeToRight") => {
    const tabId = contextMenu().tabId
    if (!tabId) return

    const tabIndex = props.tabs.findIndex((t) => t.id === tabId)
    if (tabIndex === -1) return

    switch (action) {
      case "close":
        props.onTabClose(tabId)
        break
      case "closeOthers":
        props.tabs.forEach((tab) => {
          if (tab.id !== tabId) props.onTabClose(tab.id)
        })
        break
      case "closeToRight":
        for (let i = tabIndex + 1; i < props.tabs.length; i++) {
          props.onTabClose(props.tabs[i].id)
        }
        break
    }
    closeContextMenu()
  }

  if (typeof window !== "undefined") {
    window.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault()
        searchInputRef?.focus()
      }
    })
    window.addEventListener("click", () => {
      if (contextMenu().open) closeContextMenu()
    })
    onCleanup(() => {
      window.removeEventListener("keydown", () => {})
      window.removeEventListener("click", () => {})
    })
  }

  return (
    <div class="flex flex-col h-full w-full bg-background-stronger">
      <div class="h-10 flex items-center gap-2 px-2 border-b border-border-weaker-base shrink-0">
        <div class="relative flex-1 max-w-64">
          <Icon name="search" class="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-text-weak" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Filter tabs (Ctrl+F)"
            value={searchQuery()}
            onInput={(e) => setSearchQuery(e.currentTarget.value)}
            onKeyDown={handleSearchKeyDown}
            class="w-full h-7 pl-7 pr-3 bg-surface-base border border-border-base rounded text-14-regular text-text outline-none focus:border-border-strong focus:ring-1 focus:ring-border-strong transition-colors"
          />
          <Show when={searchQuery()}>
            <button
              onClick={() => setSearchQuery("")}
              class="absolute right-2 top-1/2 -translate-y-1/2 text-text-weak hover:text-text transition-colors"
            >
              <Icon name="close" class="w-3 h-3" />
            </button>
          </Show>
        </div>
        <Show when={searchQuery()}>
          <span class="text-12-regular text-text-weak">
            {filteredTabs().length} / {props.tabs.length}
          </span>
        </Show>
      </div>

      <div class="flex items-center flex-1 min-h-0 relative">
        <Show when={canScrollLeft()}>
          <div class="absolute left-0 top-0 bottom-0 z-10 flex items-center bg-gradient-to-r from-background-stronger to-transparent pl-1">
            <IconButton
              icon="chevron-left"
              variant="ghost"
              size="small"
              onClick={() => scrollTabs("left")}
              aria-label="Scroll tabs left"
            />
          </div>
        </Show>

        <div
          ref={tabsContainerRef}
          class="flex-1 flex items-center overflow-x-auto scrollbar-hide"
          onScroll={updateScrollButtons}
        >
          <Tabs variant="alt" value={props.tabs.find((t) => t.active)?.id} class="!h-auto !flex-none">
            <Tabs.List class="h-full flex items-center border-b-0">
              <For each={filteredTabs()}>
                {(tab, index) => (
                  <SortableTabItem
                    tab={tab}
                    index={index()}
                    onSelect={props.onTabSelect}
                    onClose={props.onTabClose}
                    onContextMenu={openContextMenu}
                    onReorder={props.onTabReorder}
                    allTabs={props.tabs}
                  />
                )}
              </For>
            </Tabs.List>
          </Tabs>
        </div>

        <Show when={canScrollRight()}>
          <div class="absolute right-0 top-0 bottom-0 z-10 flex items-center bg-gradient-to-l from-background-stronger to-transparent pr-1">
            <IconButton
              icon="chevron-right"
              variant="ghost"
              size="small"
              onClick={() => scrollTabs("right")}
              aria-label="Scroll tabs right"
            />
          </div>
        </Show>
      </div>

      <Show when={contextMenu().open}>
        <div
          class="fixed z-50 min-w-40 bg-surface-base border border-border-base rounded-md shadow-lg py-1"
          style={{
            left: `${contextMenu().position.x}px`,
            top: `${contextMenu().position.y}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            class="w-full px-3 py-1.5 text-left text-14-regular hover:bg-surface-hover transition-colors flex items-center gap-2"
            onClick={() => handleContextMenuAction("close")}
          >
            <Icon name="close" class="w-4 h-4" />
            Close
          </button>
          <button
            class="w-full px-3 py-1.5 text-left text-14-regular hover:bg-surface-hover transition-colors flex items-center gap-2"
            onClick={() => handleContextMenuAction("closeOthers")}
          >
            <Icon name="close" class="w-4 h-4" />
            Close Others
          </button>
          <button
            class="w-full px-3 py-1.5 text-left text-14-regular hover:bg-surface-hover transition-colors flex items-center gap-2"
            onClick={() => handleContextMenuAction("closeToRight")}
          >
            <Icon name="chevron-right" class="w-4 h-4" />
            Close to Right
          </button>
        </div>
      </Show>
    </div>
  )
}

interface SortableTabItemProps {
  tab: Tab
  index: number
  onSelect: (id: string) => void
  onClose: (id: string) => void
  onContextMenu: (e: MouseEvent, tabId: string) => void
  onReorder: (from: number, to: number) => void
  allTabs: Tab[]
}

function SortableTabItem(props: SortableTabItemProps): JSX.Element {
  const sortable = createSortable(props.tab.id)

  const handleDragEnd = () => {
    const currentIndex = props.allTabs.findIndex((t) => t.id === props.tab.id)
    if (currentIndex !== props.index && currentIndex !== -1) {
      props.onReorder(props.index, currentIndex)
    }
  }

  return (
    <div
      use:sortable
      class="outline-none focus:outline-none"
      classList={{
        "opacity-0": sortable.isActiveDraggable,
      }}
      onClick={() => props.onSelect(props.tab.id)}
      onContextMenu={(e) => props.onContextMenu(e, props.tab.id)}
      data-tab-id={props.tab.id}
    >
      <div class="relative h-full">
        <Tabs.Trigger
          value={props.tab.id}
          onClick={() => props.onSelect(props.tab.id)}
          onMouseDown={(e) => e.preventDefault()}
          class="!shadow-none"
          classes={{
            button:
              "border-0 outline-none focus:outline-none focus-visible:outline-none !shadow-none !ring-0",
          }}
          closeButton={
            <IconButton
              icon="close"
              variant="ghost"
              size="small"
              onClick={(e) => {
                e.stopPropagation()
                props.onClose(props.tab.id)
              }}
              aria-label="Close tab"
            />
          }
        >
          <span class="text-14-regular truncate max-w-32">{props.tab.title}</span>
        </Tabs.Trigger>
      </div>
    </div>
  )
}
