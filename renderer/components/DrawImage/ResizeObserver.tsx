import { useEffect, useRef } from "react"

export type ResizeObserverFCProps = {
  onResize: (width: number, height: number) => void
  children: React.ReactNode
}
const ResizeObserverFC: React.FC<ResizeObserverFCProps> = (
  props: ResizeObserverFCProps
) => {
  const { onResize, children } = props
  const elementRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const stageElement = document.querySelector("#stage")
    const element = elementRef.current
    if (!element || !stageElement) return
    const resizeObserver = new ResizeObserver(() => {
      onResize(stageElement.clientWidth, stageElement.clientHeight)
    })
    resizeObserver.observe(element)
    return () => resizeObserver.disconnect()
  }, [])

  return <div ref={elementRef}>{children}</div>
}

export default ResizeObserverFC
