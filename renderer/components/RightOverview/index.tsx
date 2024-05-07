import { useContext, useEffect, useMemo, useState } from "react"
import { Badge, Button, Card, Modal, Space, Table } from "antd"
import { ColumnType, ColumnsType } from "antd/es/table"
import {
  anatomicalRegionsOptions,
  severityOptions,
  useOptionsStore,
} from "../InfoForm"
import Image from "next/image"
import LeftArrow from "../../public/svg/Left.svg"
import RightArrow from "../../public/svg/Right.svg"
import { useBaseStore, useTableStore } from "../../lib/store"
import { getFileNameFromPath } from "../ActionBar"
import { GraphicDataContext } from "../GraphicDataProvider"

const fileColumns: ColumnsType = [
  {
    title: "Index",
    dataIndex: "index",
    align: "center",
    width: 60,
    ellipsis: true,
    render: (text, record, index) => index + 1,
  },
  {
    title: "File Name",
    dataIndex: "fileName",
    ellipsis: true,
    align: "left",
  },
]

const RightOverview: React.FC = () => {
  const { labelOptions } = useOptionsStore(state => state)
  const labelColumns: ColumnsType = useMemo(
    () => [
      {
        title: "Index",
        dataIndex: "index",
        align: "center",
        width: 20,
        ellipsis: true,
        render: (text, record, index) => index + 1,
      },
      {
        title: "Label",
        dataIndex: "customLabel",
        ellipsis: true,
        width: 50,
        filters: labelOptions.map(label => ({
          text: label.label,
          value: label.value,
        })),
        onFilter: (value, record: any) => record.customLabel === value,
        filterOnClose: true,
        render: text => {
          return (
            <Badge
              key={text}
              color={labelOptions.find(item => item.value === text)?.color}
              text={text}
            />
          )
        },
      },
      {
        title: "Severity",
        dataIndex: "severity",
        width: 50,
        filters: severityOptions.map(severity => ({
          text: severity.label,
          value: severity.value,
        })),
        onFilter: (value, record: any) => record.severity === value,
        filterOnClose: true,
        ellipsis: true,
      },
      {
        title: "Anatomical Regions",
        dataIndex: "anatomicalRegions",
        width: 50,
        ellipsis: true,
        filters: anatomicalRegionsOptions.map(label => ({
          text: label.label,
          value: label.value,
        })),
        onFilter: (value, record: any) => record.anatomicalRegions === value,
        filterOnClose: true,
      },
      {
        title: "Description",
        dataIndex: "description",
        width: 100,
        className: "max-w-24",
        ellipsis: true,
      },
    ],
    [labelOptions, anatomicalRegionsOptions]
  )

  const {
    dispatchRects,
    dispatchPolygons,
    setStoredWindowWidth,
    setStoredWindowHeight,
  } = useContext(GraphicDataContext)
  const {
    removeTableDataSourceByIndex,
    editTableDataSourceByRowId,
    setTableDataSource,
    tableDataSource,
  } = useTableStore(state => state)

  useEffect(() => {
    window.ipc.on("saved-label-json", message => {
      console.log("🦄 ~ saveSizeJson ~ message:", message)
      window.ipc.on("saved-image-json", message => {
        console.log("🦄 ~ saveImageJson ~ message:", message)
      })
    })
    window.ipc.on(
      "readed-size-json",
      (data: { windowWidth: number; windowHeight: number }) => {
        setStoredWindowWidth(data.windowWidth)
        setStoredWindowHeight(data.windowHeight)
      }
    )
    window.ipc.on("readed-image-json", (data: any[]) => {
      if (!data) {
        setTableDataSource([])
        dispatchRects({ type: "setRects", rects: [] })
        dispatchPolygons({ type: "setPolygons", polygons: [] })
      } else {
        setTableDataSource(data)
        const rects =
          data?.filter(item => item?.rect)?.map(item => item.rect) || []
        const polygons =
          data?.filter(item => item?.polygon)?.map(item => item.polygon) || []
        dispatchRects({ type: "setRects", rects })
        dispatchPolygons({ type: "setPolygons", polygons })
      }
    })
    return () => {
      window.ipc.remove("readed-image-json")
      window.ipc.remove("readed-size-json")
      window.ipc.remove("saved-image-json")
      window.ipc.remove("saved-label-json")
    }
  }, [])

  const {
    hasSaved,
    setHasSaved,
    hasChanged,
    setHasChanged,
    autoSave,
    setAutoSave,
    setFileName,
    fileUrl,
    setFileUrl,
    setHasImage,
    filesData,
    fileDirectory,
  } = useBaseStore(state => state)

  const operationColumn: ColumnType<any> = {
    title: "Operations",
    dataIndex: "operations",
    fixed: "right",
    align: "center",
    width: 50,
    render: (_, record, index) => (
      <Button
        type="text"
        onClick={e => {
          e.stopPropagation()
          if (record?.rect) {
            dispatchRects({ type: "removeRectById", id: record.rect.id })
          } else if (record?.polygon) {
            dispatchPolygons({
              type: "removePolygonById",
              id: record.polygon.id,
            })
          }
          removeTableDataSourceByIndex(index)
          setHasChanged(true)
        }}
      >
        Delete
      </Button>
    ),
  }

  const [modal, contextHolder] = Modal.useModal()
  const [choosedAutoSave, setChoosedAutoSave] = useState(false)

  const fullFileName = getFileNameFromPath(fileUrl).split(".")
  const saveJson = () => {
    window.ipc.send("save-label-json", {
      fileDirectory,
      data: {
        windowWidth: document.querySelector("#stage")?.clientWidth,
        windowHeight: document.querySelector("#stage")?.clientHeight,
      },
      fileName: fullFileName[0] + "_windowSize" + "." + fullFileName[1],
      path: fileUrl,
    })

    window.ipc.send("save-image-json", {
      fileDirectory,
      data: tableDataSource,
      fileName: getFileNameFromPath(fileUrl),
      path: fileUrl,
    })
  }

  const warnSave = async () => {
    if (!hasSaved && hasChanged && !autoSave) {
      await modal.confirm({
        title: "Warning",
        content: "You have not saved yet. Do you want to save?",
        okText: "Yes",
        cancelText: "No",
        onOk: () => {
          saveJson()
        },
      })
    }
  }

  const warnAutoSave = async () => {
    if (!choosedAutoSave && hasChanged) {
      await modal.confirm({
        title: "Tips",
        content: "Do you want to set automatic saving?",
        okText: "Yes",
        cancelText: "No",
        onOk: () => {
          setAutoSave(true)
          setChoosedAutoSave(true)
        },
        onCancel: () => {
          setAutoSave(false)
          setChoosedAutoSave(true)
        },
      })
    }
  }

  return (
    <>
      <Space direction="vertical" style={{ width: "100%" }}>
        <Card title="Labels" className="[&_.ant-card-body]:p-2">
          <Table
            className="[&_.ant-table-tbody>tr>td]:p-2 [&_.ant-table-thead>tr>th]:p-2 [&_.ant-table-measure-row]:collapse"
            rowKey="rowId"
            columns={[...labelColumns, operationColumn]}
            dataSource={tableDataSource}
            rowClassName="cursor-pointer"
            onRow={(record: any) => {
              return {
                onClick: e => {
                  console.log(e, record)
                  if (record?.rect) {
                    dispatchRects({
                      type: "editRectById",
                      id: record.rect.id,
                      rect: {
                        ...record.rect,
                        isHighlighted: !record.rect.isHighlighted,
                      },
                    })
                    editTableDataSourceByRowId(record.rowId, {
                      rect: {
                        ...record.rect,
                        isHighlighted: !record.rect.isHighlighted,
                      },
                    })
                  } else if (record?.polygon) {
                    dispatchPolygons({
                      type: "editPolygonById",
                      id: record.polygon.id,
                      polygon: {
                        ...record.polygon,
                        isHighlighted: !record.polygon.isHighlighted,
                      },
                    })
                    editTableDataSourceByRowId(record.rowId, {
                      polygon: {
                        ...record.polygon,
                        isHighlighted: !record.polygon.isHighlighted,
                      },
                    })
                  }
                  setHasChanged(true)
                },
              }
            }}
            scroll={{ x: true }}
            pagination={{
              simple: true,
              pageSize: 5,
            }}
          />
        </Card>
        <Card
          title={
            <div className="flex justify-between items-center">
              <span>Files</span>
              <div className="flex gap-4">
                <Button
                  type="text"
                  className="p-0 w-6 h-6 rounded-md font-bold text-white"
                  style={{ backgroundColor: autoSave ? "#1677ff" : "#f0f0f0" }}
                  onClick={() => {
                    setAutoSave(!autoSave)
                  }}
                >
                  S
                </Button>
                <Image
                  priority
                  src={LeftArrow}
                  style={{ cursor: "pointer" }}
                  onClick={async () => {
                    await warnSave()
                    await warnAutoSave()
                    if (autoSave) {
                      saveJson()
                    }
                    setHasSaved(false)
                    setHasChanged(false)

                    const currentIndex = filesData.findIndex(
                      item => item.path === fileUrl
                    )
                    const previousIndex = Math.max(currentIndex - 1, 0)
                    const previousFile = filesData[previousIndex]

                    setFileUrl(previousFile.path)
                    setFileName(previousFile.fileName?.split(".")?.slice(0, -1))
                    setHasImage(true)

                    window.ipc.send("read-json", {
                      fileDirectory,
                      fileName: previousFile.fileName,
                      folderName: "images_data",
                    })
                    window.ipc.send("read-json", {
                      fileDirectory,
                      fileName:
                        previousFile.fileName.split(".")[0] +
                        "_windowSize" +
                        "." +
                        previousFile.fileName.split(".")[0],
                      folderName: "labels_data",
                    })
                  }}
                />
                <Image
                  priority
                  src={RightArrow}
                  style={{ cursor: "pointer" }}
                  onClick={async () => {
                    await warnSave()
                    await warnAutoSave()
                    if (autoSave) {
                      saveJson()
                    }
                    setHasSaved(false)
                    setHasChanged(false)
                    const currentIndex = filesData.findIndex(
                      item => item.path === fileUrl
                    )
                    const nextIndex = Math.min(
                      currentIndex + 1,
                      filesData.length - 1
                    )
                    const nextFile = filesData[nextIndex]

                    setFileUrl(nextFile.path)
                    setFileName(nextFile.fileName?.split(".")?.slice(0, -1))
                    setHasImage(true)

                    window.ipc.send("read-json", {
                      fileDirectory,
                      fileName: nextFile.fileName,
                      folderName: "images_data",
                    })
                    window.ipc.send("read-json", {
                      fileDirectory,
                      fileName:
                        nextFile.fileName.split(".")[0] +
                        "_windowSize" +
                        "." +
                        nextFile.fileName.split(".")[0],
                      folderName: "labels_data",
                    })
                  }}
                />
              </div>
            </div>
          }
          className="[&_.ant-card-body]:p-2"
        >
          <Table
            className="[&_.ant-table-tbody>tr>td]:p-2 [&_.ant-table-thead>tr>th]:p-2 [&_.ant-table-measure-row]:collapse"
            rowKey="key"
            columns={fileColumns}
            dataSource={filesData}
            showHeader={false}
            scroll={{ x: true }}
            rowClassName="cursor-pointer"
            onRow={(record: any) => {
              return {
                onClick: async () => {
                  await warnSave()
                  await warnAutoSave()
                  if (autoSave) {
                    saveJson()
                  }
                  setHasSaved(false)
                  setHasChanged(false)

                  setFileUrl(record.path)
                  setFileName(record.fileName?.split(".")?.slice(0, -1))
                  setHasImage(true)

                  window.ipc.send("read-json", {
                    fileDirectory,
                    fileName: record.fileName,
                    folderName: "images_data",
                  })

                  window.ipc.send("read-json", {
                    fileDirectory,
                    fileName:
                      record.fileName.split(".")[0] +
                      "_windowSize" +
                      "." +
                      record.fileName.split(".")[0],
                    folderName: "labels_data",
                  })
                },
              }
            }}
            pagination={{
              simple: true,
              pageSize: 10,
            }}
          />
        </Card>
        {contextHolder}
      </Space>
    </>
  )
}

export default RightOverview
