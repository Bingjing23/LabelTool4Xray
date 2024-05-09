import React, { useReducer } from "react"
import { Polygon, Rect } from "../../../lib/type"

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
  const [storedWindowWidth, setStoredWindowWidth] = React.useState(0)
  const [storedWindowHeight, setStoredWindowHeight] = React.useState(0)
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
      }}
    >
      {children}
    </GraphicDataContext.Provider>
  )
}

export default GraphicDataProvider
