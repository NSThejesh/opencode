import { createSignal, onMount } from "solid-js"
import { T3CodeLayout } from "@/components/t3code-layout"
import { base64Encode } from "@opencode-ai/util/encode"
import { useNavigate, useParams } from "@solidjs/router"
import { useGlobalSync } from "@/context/global-sync"
import { useLayout } from "@/context/layout"

const mockProjects = [
  { id: "1", name: "my-project", path: "/Users/dev/my-project" },
  { id: "2", name: "opencode-fork", path: "/Users/dev/opencode-fork" },
  { id: "3", name: "website", path: "/Users/dev/website" },
]

const mockThreads = [
  { id: "t1", title: "Fix authentication bug", updatedAt: Date.now() - 3600000 },
  { id: "t2", title: "Add dark mode support", updatedAt: Date.now() - 7200000 },
  { id: "t3", title: "Refactor API endpoints", updatedAt: Date.now() - 86400000 },
]

const mockMessages = [
  { role: "assistant" as const, content: "Hello! I'm ready to help you with your code." },
  { role: "user" as const, content: "Can you add a new feature to the login page?" },
  { role: "assistant" as const, content: "I'll help you add a new feature to the login page." },
]

export default function T3CodeSession() {
  const params = useParams()
  const navigate = useNavigate()
  const sync = useGlobalSync()
  const layout = useLayout()

  const [activeProject, setActiveProject] = createSignal<string | undefined>(params.id || mockProjects[0]?.id)
  const [activeThread, setActiveThread] = createSignal<string | undefined>(mockThreads[0]?.id)
  const [projects, setProjects] = createSignal(mockProjects)
  const [threads, setThreads] = createSignal(mockThreads)
  const [messages, setMessages] = createSignal(mockMessages)

  onMount(() => {
    if (sync.data.project.length > 0) {
      setProjects(
        sync.data.project.map((p) => ({
          id: base64Encode(p.worktree),
          name: p.worktree.split("/").pop() || p.worktree,
          path: p.worktree,
        })),
      )
      if (!activeProject()) {
        setActiveProject(projects()[0]?.id)
      }
    }
  })

  function handleSendMessage(msg: string) {
    if (!msg.trim()) return
    setMessages((prev) => [...prev, { role: "user" as const, content: msg }])
    setTimeout(() => {
      setMessages((prev) => [...prev, { role: "assistant" as const, content: `Received: "${msg}". How can I help?` }])
    }, 1000)
  }

  function handleSelectProject(id: string) {
    setActiveProject(id)
    const project = projects().find((p) => p.id === id)
    if (project) {
      navigate(`/${base64Encode(project.path)}`)
    }
  }

  function handleSelectThread(id: string) {
    setActiveThread(id)
  }

  function handleNewThread() {
    const newId = `t${Date.now()}`
    setThreads((prev) => [{ id: newId, title: "New conversation", updatedAt: Date.now() }, ...prev])
    setActiveThread(newId)
    setMessages([])
  }

  function handleNewProject() {
    layout.projects.open("")
  }

  return (
    <T3CodeLayout
      activeProject={activeProject()}
      activeThread={activeThread()}
      projects={projects()}
      threads={threads()}
      messages={messages()}
      onSendMessage={handleSendMessage}
      onSelectProject={handleSelectProject}
      onSelectThread={handleSelectThread}
      onNewThread={handleNewThread}
      onNewProject={handleNewProject}
    />
  )
}
