import { Button, Dropdown, MenuProps, Modal, Slider } from "antd"
import { DownOutlined } from "@ant-design/icons"
import { useBaseStore, useTableStore } from "../../lib/store"

export const getFileNameFromPath = (path: string) => {
  // 正则表达式匹配最后一个斜杠后的所有字符
  const match = path.match(/[^\\/]+\.[^\\/]+$/)
  return match ? match[0] : ""
}

const ActionBar = () => {
  const [modal, contextHolder] = Modal.useModal()
  const {
    setHasSaved,
    setLoading,
    fileUrl,
    setFilesData,
    fileDirectory,
    setFileDirectory,
    setSelectMethod,
    imageBrightness,
    setImageBrightness,
    imageContrast,
    setImageContrast,
  } = useBaseStore(state => state)
  const { tableDataSource } = useTableStore(state => state)

  const openDialogAndFetchFiles = async () => {
    setLoading(true)
    window.ipc.on(
      "selected-directory",
      (files: string[], outputDirectory: string) => {
        setLoading(false)
        setFileDirectory(outputDirectory)
        setFilesData(
          files.map((item: string) => ({
            key: item,
            path: item,
            fileName: getFileNameFromPath(item),
          }))
        )
      }
    )
    window.ipc.send("open-directory-dialog", [])
  }

  const saveJson = async (values: any) => {
    if (!fileDirectory) {
      modal.warning({
        title: "Warning",
        content: "Please choose a folder first.",
      })
      return
    }
    window.ipc.send("save-image-json", {
      fileDirectory,
      data: values,
      fileName: getFileNameFromPath(fileUrl),
      path: fileUrl,
    })
    window.ipc.on("saved-image-json", message => {
      console.log("🦄 ~ saveImageJson ~ message:", message)
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
            setHasSaved(true)
            saveJson(tableDataSource)
          }}
        >
          Save
        </Button>
      ),
    },
  ]

  return (
    <div className="mb-2 flex">
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
      <div className="ml-4 flex gap-2 items-center">
        <span className="text-xs">Brightness: {imageBrightness}</span>
        <Slider
          className="w-[108px]"
          defaultValue={100}
          min={0}
          max={200}
          value={imageBrightness}
          onChange={(value: number) => {
            setImageBrightness(value)
          }}
        />
      </div>
      <div className="ml-2 flex gap-2 items-center">
        <span className="text-xs">Contrast: {imageContrast}</span>
        <Slider
          className="w-[108px]"
          defaultValue={100}
          min={0}
          max={200}
          value={imageContrast}
          onChange={(value: number) => {
            setImageContrast(value)
          }}
        />
      </div>
      <Button
        type="text"
        onClick={() => {
          setImageBrightness(100)
          setImageContrast(100)
        }}
      >
        Reset
      </Button>
      {contextHolder}
    </div>
  )
}
export default ActionBar
