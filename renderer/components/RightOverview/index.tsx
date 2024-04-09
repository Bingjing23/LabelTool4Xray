import { Badge, Button, Card, List, Space, Table } from "antd"
import { ColumnType, ColumnsType } from "antd/es/table"
import { locationOptions, severityOptions, useOptionsStore } from "../InfoForm"
import Image from "next/image"
import LeftArrow from "../../public/svg/Left.svg"
import RightArrow from "../../public/svg/Right.svg"
import {
  useBaseStore,
  usePolygonStore,
  useRectsStore,
  useTableStore,
} from "../../lib/store"

const labelOptions = useOptionsStore.getState().labelOptions

const labelColumns: ColumnsType = [
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
          color={labelOptions.find(item => item.value === text)?.color}
          text={text}
        />
      )
    },
  },
  {
    title: "Abnormality Name",
    dataIndex: "abnormalityName",
    width: 50,
    ellipsis: true,
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
    title: "Location",
    dataIndex: "location",
    width: 50,
    ellipsis: true,
    filters: locationOptions.map(label => ({
      text: label.label,
      value: label.value,
    })),
    onFilter: (value, record: any) => record.location === value,
    filterOnClose: true,
  },
  {
    title: "Description",
    dataIndex: "description",
    width: 100,
    className: "max-w-24",
    ellipsis: true,
  },
]

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
    align: "right",
  },
]

const RightOverview: React.FC = () => {
  const { removeRectById, editRectById, setRects } = useRectsStore(
    state => state
  )
  const { removePolygonById, editPolygonById, setPolygons } = usePolygonStore(
    state => state
  )
  const {
    removeTableDataSourceByIndex,
    editTableDataSourceByRowId,
    setTableDataSource,
    tableDataSource,
  } = useTableStore(state => state)

  const { fileUrl, setFileUrl, setHasImage, filesData } = useBaseStore(
    state => state
  )

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
            removeRectById(record.rect.id)
          } else if (record?.polygon) {
            removePolygonById(record.polygon.id)
          }
          removeTableDataSourceByIndex(index)
        }}
      >
        Delete
      </Button>
    ),
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
                    editRectById(record.rect.id, {
                      isHighlighted: !record.rect.isHighlighted,
                    })
                    editTableDataSourceByRowId(record.rowId, {
                      rect: {
                        ...record.rect,
                        isHighlighted: !record.rect.isHighlighted,
                      },
                    })
                  } else if (record?.polygon) {
                    editPolygonById(record.polygon.id, {
                      isHighlighted: !record.polygon.isHighlighted,
                    })
                    editTableDataSourceByRowId(record.rowId, {
                      polygon: {
                        ...record.polygon,
                        isHighlighted: !record.polygon.isHighlighted,
                      },
                    })
                  }
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
                <Image
                  priority
                  src={LeftArrow}
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    const currentIndex = filesData.findIndex(
                      item => item.path === fileUrl
                    )
                    const previousIndex = Math.max(currentIndex - 1, 0)
                    const previousFile = filesData[previousIndex]

                    setFileUrl(previousFile.path)
                    setHasImage(true)
                    window.ipc.on("readed-json", (data: any[], state) => {
                      if (!data) {
                        setTableDataSource([])
                        setRects([])
                        setPolygons([])
                      } else {
                        setTableDataSource(data)
                        const rects =
                          data
                            ?.filter(item => item?.rect)
                            ?.map(item => item.rect) || []

                        const polygons =
                          data
                            ?.filter(item => item?.polygon)
                            ?.map(item => item.polygon) || []

                        setRects(rects)
                        setPolygons(polygons)
                      }
                    })
                    window.ipc.send("read-json", previousFile.fileName)
                  }}
                />
                <Image
                  priority
                  src={RightArrow}
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    const currentIndex = filesData.findIndex(
                      item => item.path === fileUrl
                    )
                    const nextIndex = Math.min(
                      currentIndex + 1,
                      filesData.length - 1
                    )
                    const nextFile = filesData[nextIndex]

                    setFileUrl(nextFile.path)
                    setHasImage(true)
                    window.ipc.on("readed-json", (data: any[], state) => {
                      if (!data) {
                        setTableDataSource([])
                        setRects([])
                        setPolygons([])
                      } else {
                        setTableDataSource(data)
                        const rects =
                          data
                            ?.filter(item => item?.rect)
                            ?.map(item => item.rect) || []
                        const polygons =
                          data
                            ?.filter(item => item?.polygon)
                            ?.map(item => item.polygon) || []
                        setRects(rects)
                        setPolygons(polygons)
                      }
                    })
                    window.ipc.send("read-json", nextFile.fileName)
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
                  setFileUrl(record.path)
                  setHasImage(true)
                  window.ipc.on("readed-json", (data: any[], state) => {
                    if (!data && record.path !== fileUrl) {
                      setTableDataSource([])
                      setRects([])
                      setPolygons([])
                    } else {
                      setTableDataSource(data)
                      const rects =
                        data
                          ?.filter(item => item?.rect)
                          ?.map(item => item.rect) || []

                      const polygons =
                        data
                          ?.filter(item => item?.polygon)
                          ?.map(item => item.polygon) || []

                      setRects(rects)
                      setPolygons(polygons)
                    }
                  })
                  window.ipc.send("read-json", record.fileName)
                },
              }
            }}
            pagination={{
              simple: true,
              pageSize: 10,
            }}
          />
        </Card>
      </Space>
    </>
  )
}

export default RightOverview
