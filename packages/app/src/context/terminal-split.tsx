import { createStore, produce } from "solid-js/store"
import { createSimpleContext } from "@opencode-ai/ui/context"
import { batch } from "solid-js"

export type TerminalSplit = {
  id: string
  direction: "horizontal" | "vertical"
  terminals: string[]
  activeIndex: number
}

type TerminalSplitState = {
  splits: Record<string, TerminalSplit>
  activeSplitId: string | null
}

const generateId = () => Math.random().toString(36).substring(2, 11)

export const {
  use: useTerminalSplit,
  provider: TerminalSplitProvider,
} = createSimpleContext({
  name: "TerminalSplit",
  gate: false,
  init: () => {
    const [store, setStore] = createStore<TerminalSplitState>({
      splits: {},
      activeSplitId: null,
    })

    const createSplit = (direction: "horizontal" | "vertical"): string => {
      const id = generateId()
      const newSplit: TerminalSplit = {
        id,
        direction,
        terminals: [],
        activeIndex: 0,
      }

      batch(() => {
        setStore(
          "splits",
          produce((splits) => {
            splits[id] = newSplit
          }),
        )
        setStore("activeSplitId", id)
      })

      return id
    }

    const closeSplit = (id: string): void => {
      const split = store.splits[id]
      if (!split) return

      batch(() => {
        setStore(
          "splits",
          produce((splits) => {
            delete splits[id]
          }),
        )
        if (store.activeSplitId === id) {
          const remainingIds = Object.keys(store.splits)
          setStore(
            "activeSplitId",
            remainingIds.length > 0 ? remainingIds[remainingIds.length - 1] : null,
          )
        }
      })
    }

    const getActiveSplitTerminals = (id: string): string[] => {
      const split = store.splits[id]
      return split?.terminals ?? []
    }

    const addTerminalToSplit = (splitId: string, terminalId: string): void => {
      const split = store.splits[splitId]
      if (!split) return

      setStore(
        "splits",
        splitId,
        produce((s) => {
          if (!s.terminals.includes(terminalId)) {
            s.terminals.push(terminalId)
          }
        }),
      )
    }

    const removeTerminalFromSplit = (splitId: string, terminalId: string): void => {
      const split = store.splits[splitId]
      if (!split) return

      batch(() => {
        setStore(
          "splits",
          splitId,
          produce((s) => {
            const index = s.terminals.indexOf(terminalId)
            if (index !== -1) {
              s.terminals.splice(index, 1)
            }
            if (s.activeIndex >= s.terminals.length) {
              s.activeIndex = Math.max(0, s.terminals.length - 1)
            }
          }),
        )
      })
    }

    const setActiveTerminal = (splitId: string, index: number): void => {
      const split = store.splits[splitId]
      if (!split) return
      if (index < 0 || index >= split.terminals.length) return

      setStore("splits", splitId, "activeIndex", index)
    }

    const cycleActiveTerminal = (splitId: string, direction: "next" | "previous"): void => {
      const split = store.splits[splitId]
      if (!split || split.terminals.length === 0) return

      const nextIndex =
        direction === "next"
          ? (split.activeIndex + 1) % split.terminals.length
          : (split.activeIndex - 1 + split.terminals.length) % split.terminals.length

      setActiveTerminal(splitId, nextIndex)
    }

    const setActiveSplit = (id: string | null): void => {
      setStore("activeSplitId", id)
    }

    const setSplitDirection = (id: string, direction: "horizontal" | "vertical"): void => {
      const split = store.splits[id]
      if (!split) return

      setStore("splits", id, "direction", direction)
    }

    return {
      splits: () => store.splits,
      activeSplitId: () => store.activeSplitId,
      activeSplit: () => (store.activeSplitId ? store.splits[store.activeSplitId] : null),

      createSplit,
      closeSplit,
      setActiveSplit,
      setSplitDirection,

      addTerminalToSplit,
      removeTerminalFromSplit,
      getActiveSplitTerminals,
      setActiveTerminal,
      cycleActiveTerminal,
    }
  },
})
