import { useEffect } from "react"

type Key = "ctrl" | "meta" | "shift" | "alt" | string

export const useKeyboardShortcut = (keys: Key[], callback: () => void) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        keys.every(
          key =>
            (key === "ctrl" && event.ctrlKey) ||
            (key === "meta" && event.metaKey) ||
            (key === "shift" && event.shiftKey) ||
            (key === "alt" && event.altKey) ||
            (typeof key === "string" && event.key.toLowerCase() === key)
        )
      ) {
        callback()
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [keys, callback])
}
