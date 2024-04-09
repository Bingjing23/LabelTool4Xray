import { Button, Dropdown, MenuProps } from "antd"
import { DownOutlined } from "@ant-design/icons"
import { useBaseStore, useTableStore } from "../../lib/store"

const ActionBar = () => {
  const { fileUrl, setFilesData, setSelectMethod } = useBaseStore(
    state => state
  )
  const { tableDataSource } = useTableStore(state => state)

  const getFileNameFromPath = (path: string) => {
    // 正则表达式匹配最后一个斜杠后的所有字符
    const match = path.match(/[^\\/]+\.[^\\/]+$/)
    return match ? match[0] : ""
  }

  const openDialogAndFetchFiles = async () => {
    window.ipc.on("selected-directory", (files: string[]) => {
      setFilesData(
        files.map((item: string) => ({
          key: item,
          path: item,
          fileName: getFileNameFromPath(item),
        }))
      )
    })
    window.ipc.send("open-directory-dialog", [])
  }

  const saveJson = async (values: any) => {
    window.ipc.on("saved-json", message => {
      console.log("🦄 ~ saveJson ~ message:", message)
    })
    window.ipc.send("save-json", {
      data: values,
      fileName: getFileNameFromPath(fileUrl),
      path: fileUrl,
    })
  }
  const fileActionItems: MenuProps["items"] = [
    {
      key: "folder",
      label: (
        <Button type="link" onClick={openDialogAndFetchFiles}>
          Choose Folder
        </Button>
      ),
    },
    {
      key: "save",
      label: (
        <Button
          type="link"
          className="mr-2"
          onClick={() => {
            saveJson(tableDataSource)
          }}
        >
          Save
        </Button>
      ),
    },
  ]

  return (
    <div className="mb-2">
      <Dropdown menu={{ items: fileActionItems }} trigger={["click"]}>
        <Button type="text">
          <div className="flex gap-2">
            Files
            <DownOutlined />
          </div>
        </Button>
      </Dropdown>
      <Button type="text" onClick={() => setSelectMethod("rectangle")}>
        Rectangle
      </Button>
      <Button type="text" onClick={() => setSelectMethod("polygon")}>
        Polygon
      </Button>
    </div>
  )
}
export default ActionBar
