import React, { useReducer, useState } from "react"
import { Polygon, Rect } from "../../../lib/type"

export const BASE_WIDTH = 768
export const BASE_HEIGHT = 720

type currentRectProps = {
  x: number
  y: number
  width: number
  height: number
  id: string
  isHighlighted: boolean
}

type currentPolygonProps = {
  points: number[]
  id: string
  isHighlighted: boolean
}

export const GraphicDataContext = React.createContext<{
  rects: Rect[]
  dispatchRects: React.Dispatch<{
    type: "addRect" | "setRects" | "editRectById" | "removeRectById"
    rect?: Rect
    rects?: Rect[]
    id?: string
  }>
  polygons: Polygon[]
  dispatchPolygons: React.Dispatch<{
    type: "addPolygon" | "setPolygons" | "editPolygonById" | "removePolygonById"
    polygon?: Polygon
    polygons?: Polygon[]
    id?: string
  }>

  storedWindowWidth: number
  setStoredWindowWidth: React.Dispatch<React.SetStateAction<number>>
  storedWindowHeight: number
  setStoredWindowHeight: React.Dispatch<React.SetStateAction<number>>

  size: { width: number; height: number }
  setSize: React.Dispatch<
    React.SetStateAction<{ width: number; height: number }>
  >

  currentRect: currentRectProps
  setCurrentRect: React.Dispatch<React.SetStateAction<currentRectProps>>
  currentPoints: currentPolygonProps
  setCurrentPoints: React.Dispatch<React.SetStateAction<currentPolygonProps>>
} | null>(null)

const GraphicDataProvider = ({ children }: { children: React.ReactNode }) => {
  // rects useReducer
  const [rects, dispatchRects] = useReducer(
    (
      state: Rect[] = [],
      action: {
        type: "addRect" | "setRects" | "editRectById" | "removeRectById"
        rect: Rect
        rects: Rect[]
        id: string
      }
    ) => {
      switch (action.type) {
        case "addRect":
          return [...state, action.rect]
        case "setRects":
          return action.rects
        case "editRectById":
          return state.map((rect: any) =>
            rect.id === action.id ? { ...rect, ...action.rect } : rect
          )
        case "removeRectById":
          return state.filter((rect: any) => rect.id !== action.id)
        default:
          return state
      }
    },
    []
  )
  // polygons useReducer
  const [polygons, dispatchPolygons] = React.useReducer(
    (
      state: Polygon[] = [],
      action: {
        type:
          | "addPolygon"
          | "setPolygons"
          | "editPolygonById"
          | "removePolygonById"
        polygon: Polygon
        polygons: Polygon[]
        id: string
      }
    ) => {
      switch (action.type) {
        case "addPolygon":
          return [...state, action.polygon]
        case "setPolygons":
          return action.polygons
        case "editPolygonById":
          return state.map((polygon: any) =>
            polygon.id === action.id
              ? { ...polygon, ...action.polygon }
              : polygon
          )
        case "removePolygonById":
          return state.filter((polygon: any) => polygon.id !== action.id)
        default:
          return state
      }
    },
    []
  )
  const [storedWindowWidth, setStoredWindowWidth] = useState(0)
  const [storedWindowHeight, setStoredWindowHeight] = useState(0)

  const [size, setSize] = useState<{ width: number; height: number }>({
    width: BASE_WIDTH,
    height: BASE_HEIGHT,
  })

  const [currentRect, setCurrentRect] = useState<currentRectProps | null>(null)

  const [currentPoints, setCurrentPoints] =
    useState<currentPolygonProps | null>(null)

  return (
    <GraphicDataContext.Provider
      value={{
        rects,
        dispatchRects,
        polygons,
        dispatchPolygons,
        storedWindowHeight,
        setStoredWindowHeight,
        storedWindowWidth,
        setStoredWindowWidth,
        size,
        setSize,
        currentRect,
        setCurrentRect,
        currentPoints,
        setCurrentPoints,
      }}
    >
      {children}
    </GraphicDataContext.Provider>
  )
}

export default GraphicDataProvider
