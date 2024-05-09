import React, { createContext, useReducer } from "react"

export const TableDataContext = createContext<{
  tableData: {
    tableDataSource: any[]
  }
  dispatchTableData: React.Dispatch<{
    type:
      | "setTableDataSource"
      | "addTableDataSource"
      | "editTableDataSourceByRowId"
      | "removeTableDataSourceByIndex"
      | "removeTableDataSourceById"
    addTableDataSource?: any
    editTableDataSourceByRowId?: any
    removeTableDataSourceByIndex?: number
    tableDataSource?: any
    index?: number
    rowId?: number
  } | null>
}>(null)

const tableReducer = (
  state: {
    tableDataSource: any[]
  },
  action: {
    type:
      | "setTableDataSource"
      | "addTableDataSource"
      | "editTableDataSourceByRowId"
      | "removeTableDataSourceByIndex"
      | "removeTableDataSourceById"
    addTableDataSource?: any
    editTableDataSourceByRowId?: any
    removeTableDataSourceByIndex?: number
    tableDataSource?: any
    index?: number
    rowId?: number
  }
) => {
  switch (action.type) {
    case "setTableDataSource":
      return { ...state, tableDataSource: action.tableDataSource }
    case "addTableDataSource":
      return {
        ...state,
        tableDataSource: [...state.tableDataSource, action.addTableDataSource],
      }
    case "editTableDataSourceByRowId":
      return {
        ...state,
        tableDataSource: state.tableDataSource.map((data: any) => {
          if (data.rowId === action.rowId) {
            return { ...data, ...action.editTableDataSourceByRowId }
          } else {
            return data
          }
        }),
      }
    case "removeTableDataSourceByIndex":
      return {
        ...state,
        tableDataSource: state.tableDataSource.filter(
          (_: any, i: number) => i !== action.index
        ),
      }
    default:
      return state
  }
}

const TableDataProvider = ({ children }: any) => {
  const [tableData, dispatchTableData] = useReducer(tableReducer, {
    tableDataSource: [],
  })
  return (
    <TableDataContext.Provider value={{ tableData, dispatchTableData }}>
      {children}
    </TableDataContext.Provider>
  )
}

export default TableDataProvider
