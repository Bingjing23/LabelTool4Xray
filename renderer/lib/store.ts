import { create } from "zustand"
import { BaseState, RectData, TableState } from "./type"

export const useBaseStore = create<BaseState>(set => ({
  loading: false,
  setLoading: (loading: boolean) => set({ loading }),
  hasChanged: false,
  setHasChanged: (hasChanged: boolean) => set({ hasChanged }),
  hasSaved: false,
  setHasSaved: (hasSaved: boolean) => set({ hasSaved }),
  autoSave: false,
  setAutoSave: (autoSave: boolean) => set({ autoSave }),
  fileName: "Medical Image Annotation",
  setFileName: (fileName: string) => set({ fileName }),
  fileUrl: "",
  setFileUrl: (fileUrl: string) => set({ fileUrl }),
  hasImage: false,
  setHasImage: (hasImage: boolean) => set({ hasImage }),
  filesData: [],
  setFilesData: (filesData: any[]) => set({ filesData }),
  fileDirectory: "",
  setFileDirectory: (fileDirectory: string) => set({ fileDirectory }),

  selectMethod: "rectangle",
  setSelectMethod: (selectMethod: "rectangle" | "polygon") =>
    set({ selectMethod }),

  imageBrightness: 100,
  setImageBrightness: (imageBrightness: number) => set({ imageBrightness }),
  imageContrast: 100,
  setImageContrast: (imageContrast: number) => set({ imageContrast }),
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
