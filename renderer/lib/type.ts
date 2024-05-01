export type Medical = {
  abnormalityName: string
  severity: string
  anatomicalRegions: string
  description: string
  customLabel: string
}

export type Rect = {
  x: number
  y: number
  width: number
  height: number
  id: string
  isHighlighted: boolean
}

export type RectData = Medical & {
  rowId: string
  rect: Rect
}

export type BaseState = {
  loading: boolean
  setLoading: (loading: boolean) => void
  hasChanged: boolean
  setHasChanged: (hasChanged: boolean) => void
  hasSaved: boolean
  setHasSaved: (hasSaved: boolean) => void
  autoSave: boolean
  setAutoSave: (autoSave: boolean) => void
  fileUrl: string
  setFileUrl: (fileUrl: string) => void
  fileName: string
  setFileName: (fileName: string) => void
  hasImage: boolean
  setHasImage: (hasImage: boolean) => void
  filesData: any[]
  setFilesData: (filesData: any[]) => void
  fileDirectory: string
  setFileDirectory: (fileDirectory: string) => void

  selectMethod: "rectangle" | "polygon"
  setSelectMethod: (selectMethod: "rectangle" | "polygon") => void

  imageBrightness: number
  setImageBrightness: (imageBrightness: number) => void
  imageContrast: number
  setImageContrast: (imageContrast: number) => void
}

export type RectState = {
  rects: Rect[]
  addRect: (rect: Rect) => void
  setRects: (rects: Rect[]) => void
  editRectById: (id: string, rect: Partial<Rect>) => void
  removeRectById: (i: string) => void
}

export type Polygon = {
  points: number[]
  id: string
  isHighlighted: boolean
}

export type PolygonData = Medical & {
  rowId: string
  polygon: Polygon
}

export type PolygonState = {
  polygons: Polygon[]
  addPolygon: (polygon: Polygon) => void
  setPolygons: (polygons: Polygon[]) => void
  editPolygonById: (id: string, polygon: Partial<Polygon>) => void
  removePolygonById: (id: string) => void
}

export type TableState = {
  tableDataSource: RectData[] | PolygonData[]
  setTableDataSource: (tableData: RectData[] | PolygonData[]) => void
  addTableDataSource: (tableData: RectData | PolygonData) => void
  editTableDataSourceByRowId: (
    i: number,
    tableTable: Partial<RectData> | Partial<PolygonData>
  ) => void
  removeTableDataSourceByIndex: (i: number) => void
}
