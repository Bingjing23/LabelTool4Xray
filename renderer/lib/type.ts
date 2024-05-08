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
  hasChanged: boolean
  hasSaved: boolean
  autoSave: boolean
  fileUrl: string
  fileName: string
  hasImage: boolean
  filesData: any[]
  fileDirectory: string

  selectMethod: "rectangle" | "polygon"

  imageBrightness: number
  imageContrast: number
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
