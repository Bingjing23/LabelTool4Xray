import { createContext, useReducer } from "react"
import { BaseState } from "../../lib/type"
export const BaseDataContext = createContext<{
  baseData: BaseState
  dispatchBaseData: React.Dispatch<{
    type:
      | "setLoading"
      | "setHasChanged"
      | "setHasSaved"
      | "setAutoSave"
      | "setFileName"
      | "setFileUrl"
      | "setHasImage"
      | "setFilesData"
      | "setFileDirectory"
      | "setSelectMethod"
      | "setImageBrightness"
      | "setImageContrast"
    loading?: boolean
    hasChanged?: boolean
    hasSaved?: boolean
    autoSave?: boolean
    fileName?: string
    fileUrl?: string
    hasImage?: boolean
    filesData?: any[]
    fileDirectory?: string
    selectMethod?: "rectangle" | "polygon"
    imageBrightness?: number
    imageContrast?: number
  }>
} | null>(null)

const baseDataReducer = (
  state: BaseState,
  action: {
    type:
      | "setLoading"
      | "setHasChanged"
      | "setHasSaved"
      | "setAutoSave"
      | "setFileName"
      | "setFileUrl"
      | "setHasImage"
      | "setFilesData"
      | "setFileDirectory"
      | "setSelectMethod"
      | "setImageBrightness"
      | "setImageContrast"
    loading?: boolean
    hasChanged?: boolean
    hasSaved?: boolean
    autoSave?: boolean
    fileName?: string
    fileUrl?: string
    hasImage?: boolean
    filesData?: any[]
    fileDirectory?: string
    selectMethod?: "rectangle" | "polygon"
    imageBrightness?: number
    imageContrast?: number
  }
) => {
  switch (action.type) {
    case "setLoading":
      return { ...state, loading: action.loading }
    case "setHasChanged":
      return { ...state, hasChanged: action.hasChanged }
    case "setHasSaved":
      return { ...state, hasSaved: action.hasSaved }
    case "setAutoSave":
      return { ...state, autoSave: action.autoSave }
    case "setFileName":
      return { ...state, fileName: action.fileName }
    case "setFileUrl":
      return { ...state, fileUrl: action.fileUrl }
    case "setHasImage":
      return { ...state, hasImage: action.hasImage }
    case "setFilesData":
      return { ...state, filesData: action.filesData }
    case "setFileDirectory":
      return { ...state, fileDirectory: action.fileDirectory }
    case "setSelectMethod":
      return { ...state, selectMethod: action.selectMethod }
    case "setImageBrightness":
      return { ...state, imageBrightness: action.imageBrightness }
    case "setImageContrast":
      return { ...state, imageContrast: action.imageContrast }
    default:
      return state
  }
}

const BaseDataProvider = ({ children }: { children: React.ReactNode }) => {
  // base data useReducer
  const [baseData, dispatchBaseData] = useReducer(baseDataReducer, {
    loading: false,
    hasChanged: false,
    hasSaved: false,
    autoSave: false,
    fileName: "Medical Image Annotation",
    fileUrl: "",
    hasImage: false,
    filesData: [],
    fileDirectory: "",
    selectMethod: "rectangle",
    imageBrightness: 100,
    imageContrast: 100,
  })
  return (
    <BaseDataContext.Provider value={{ baseData, dispatchBaseData }}>
      {children}
    </BaseDataContext.Provider>
  )
}

export default BaseDataProvider
