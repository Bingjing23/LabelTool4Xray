import { create } from "zustand"
import {
  BaseState,
  RectState,
  Rect,
  RectData,
  PolygonState,
  Polygon,
  TableState,
} from "./type"

export const useBaseStore = create<BaseState>(set => ({
  fileUrl: "",
  setFileUrl: (fileUrl: string) => set({ fileUrl }),
  hasImage: false,
  setHasImage: (hasImage: boolean) => set({ hasImage }),
  filesData: [],
  setFilesData: (filesData: any[]) => set({ filesData }),

  selectMethod: "rectangle",
  setSelectMethod: (selectMethod: "rectangle" | "polygon") =>
    set({ selectMethod }),
    
  imageBrightness: 100,
  setImageBrightness: (imageBrightness: number) => set({ imageBrightness }),
  imageContrast: 100,
  setImageContrast: (imageContrast: number) => set({ imageContrast }),
}))

export const useRectsStore = create<RectState>(set => ({
  rects: [],
  addRect: (rect: Rect) =>
    set((state: any) => ({ rects: [...state.rects, rect] })),
  setRects: (rects: Rect[]) => set((state: any) => ({ rects: rects })),
  editRectById: (id: string, rect: Partial<Rect>) =>
    set((state: any) => ({
      rects: state.rects.map(r => (r.id === id ? { ...r, ...rect } : r)),
    })),
  removeRectById: (id: string) =>
    set((state: any) => ({
      rects: state.rects.filter(i => i.id !== id),
    })),
}))

export const usePolygonStore = create<PolygonState>(set => ({
  polygons: [],
  addPolygon: (polygon: Polygon) =>
    set((state: any) => ({ polygons: [...state.polygons, polygon] })),
  setPolygons: (polygons: Polygon[]) =>
    set((state: any) => ({ polygons: polygons })),
  editPolygonById: (id: string, polygon: Partial<Polygon>) =>
    set((state: any) => ({
      polygons: state.polygons.map(p =>
        p.id === id ? { ...p, ...polygon } : p
      ),
    })),
  removePolygonById: (id: string) =>
    set((state: any) => ({
      polygons: state.polygons.filter(i => i.id !== id),
    })),
}))

export const useTableStore = create<TableState>(set => ({
  tableDataSource: [],
  setTableDataSource: (rectData: RectData[]) =>
    set((state: any) => ({ tableDataSource: rectData })),
  addTableDataSource: (rectData: RectData) =>
    set((state: any) => ({
      tableDataSource: [...state.tableDataSource, rectData],
    })),
  editTableDataSourceByRowId: (rowId: number, rectData: RectData) =>
    set((state: any) => ({
      tableDataSource: state.tableDataSource.map(data =>
        data.rowId === rowId ? { ...data, ...rectData } : data
      ),
    })),
  removeTableDataSourceByIndex: (index: number) =>
    set((state: any) => ({
      tableDataSource: state.tableDataSource.filter((_, i) => i !== index),
    })),
}))
