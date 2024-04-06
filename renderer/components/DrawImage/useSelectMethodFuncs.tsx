import { useState } from "react"
import { Circle, Line, Rect } from "react-konva"
import { v4 as uuidv4 } from "uuid"
import { usePolygonStore, useRectsStore } from "../../lib/store"

const useSelectMethodFuncs = () => {
  const [drawing, setDrawing] = useState(false)
  const [currentRect, setCurrentRect] = useState<{
    x: number
    y: number
    width: number
    height: number
    id: string
    isHighlighted: boolean
  }>(null)
  const { rects: rectangles, setRects: setRectangles } = useRectsStore(
    state => state
  )

  const { polygons, setPolygons } = usePolygonStore(state => state)
  const [currentPoints, setCurrentPoints] = useState<{
    points: number[]
    id: string
    isHighlighted: boolean
  }>(null)

  const [modalopen, setModalOpen] = useState(false)

  const closeDistance = 10
  const checkIfCloseToFirstPoint = point => {
    const x0 = currentPoints.points[0]
    const y0 = currentPoints.points[1]
    const dx = point.x - x0
    const dy = point.y - y0
    return Math.sqrt(dx * dx + dy * dy) < closeDistance
  }

  return {
    modal: {
      open: modalopen,
      setOpen: setModalOpen,
    },
    methods: {
      rectangle: {
        handleMouseDown: e => {
          if (!drawing) {
            const { x, y } = e.target.getStage().getPointerPosition()
            setCurrentRect({
              x,
              y,
              width: 0,
              height: 0,
              id: uuidv4(),
              isHighlighted: false,
            })
            setDrawing(true)
          } else {
            setDrawing(false)
            setRectangles([...rectangles, currentRect])

            setModalOpen(true)
          }
        },
        handleMouseMove: e => {
          if (!drawing) return

          const stage = e.target.getStage()
          const point = stage.getPointerPosition()
          const { x, y } = currentRect

          setCurrentRect({
            ...currentRect,
            width: point.x - x,
            height: point.y - y,
          })
        },
        render: (
          <>
            {rectangles.map((rect, i) => (
              <Rect
                key={i}
                {...rect}
                stroke={rect.isHighlighted ? "#22ff00" : "red"}
                strokeWidth={rect.isHighlighted ? 4 : 2}
              />
            ))}
            {currentRect && (
              <Rect
                {...currentRect}
                stroke={currentRect.isHighlighted ? "#22ff00" : "red"}
                strokeWidth={currentRect.isHighlighted ? 4 : 2}
              />
            )}
          </>
        ),
        currentRect,
        setCurrentRect,
      },
      polygon: {
        handleMouseDown: e => {
          const point = e.target.getStage().getPointerPosition()

          if (!drawing) {
            setDrawing(true) // Start a new polygon
            setCurrentPoints({
              points: [point.x, point.y],
              id: uuidv4(),
              isHighlighted: false,
            })
          } else {
            if (checkIfCloseToFirstPoint(point)) {
              setDrawing(false)
              setPolygons([...polygons, currentPoints])
              setModalOpen(true)
            } else {
              setCurrentPoints({
                ...currentPoints,
                points: [...currentPoints.points, point.x, point.y],
              })
            }
          }
        },
        handleMouseMove: () => {},
        // handleDblclick: e => {
        //   if (currentPoints.length > 6) {
        //     setPolygons([
        //       ...polygons,
        //       { points: currentPoints, id: uuidv4(), isHighlighted: false },
        //     ])
        //     setCurrentPoints([])
        //     setDrawing(false)
        //   }
        // },
        render: (
          <>
            {polygons.map((pt, index) => (
              <Line
                key={index}
                points={pt.points}
                // fill="rgba(255,0,0,0.4)"
                stroke={pt.isHighlighted ? "#22ff00" : "red"}
                strokeWidth={pt.isHighlighted ? 4 : 2}
                closed={true}
              />
            ))}
            {currentPoints && (
              <Line
                points={currentPoints.points}
                stroke="red"
                strokeWidth={2}
                closed={false}
              />
            )}
          </>
        ),
        currentPoints,
        setCurrentPoints,
      },
    },
  }
}

export default useSelectMethodFuncs
