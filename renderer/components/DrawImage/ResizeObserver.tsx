import { useEffect, useRef } from "react"

export type ResizeObserverFCProps = {
  onResize: () => void
  children: React.ReactNode
}
const ResizeObserverFC: React.FC<ResizeObserverFCProps> = (
  props: ResizeObserverFCProps
) => {
  const { onResize, children } = props
  const elementRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const element = elementRef.current
    if (!element) return
    const resizeObserver = new ResizeObserver(() => {
      onResize()
    })
    resizeObserver.observe(element)
    return () => resizeObserver.disconnect()
  }, [])

  return <div ref={elementRef}>{children}</div>
}

export default ResizeObserverFC
