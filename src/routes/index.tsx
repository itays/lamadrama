import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"

export const Route = createFileRoute("/")({ component: App })

function App() {
  const [hydrated, setHydrated] = useState(false)
  const [count, setCount] = useState(0)

  useEffect(() => setHydrated(true), [])

  return (
    <div className="relative flex min-h-svh p-6">
      <div className="absolute top-6 right-6">
        <ModeToggle />
      </div>
      <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose">
        <div>
          <h1 className="font-medium">Project ready!</h1>
          <p>You may now add components and start building.</p>
          <p>We&apos;ve already added the button component for you.</p>
          <Button
            className="mt-2"
            disabled={!hydrated}
            onClick={() => setCount((value) => value + 1)}
          >
            Count: {count}
          </Button>
        </div>
      </div>
    </div>
  )
}
