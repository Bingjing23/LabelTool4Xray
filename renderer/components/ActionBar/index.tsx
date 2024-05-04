import { Button, Dropdown, MenuProps, Modal, Slider } from "antd"
import { DownOutlined } from "@ant-design/icons"
import { useBaseStore, useTableStore } from "../../lib/store"
import { useEffect } from "react"

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

    window.ipc.send("save-label-json", {
      fileDirectory,
      data: {
        windowWidth: document.querySelector("#stage")?.clientWidth,
        windowHeight: document.querySelector("#stage")?.clientHeight,
      },
      fileName: getFileNameFromPath(fileUrl) + "_windowSize",
      path: fileUrl,
    })
    window.ipc.on("saved-label-json", message => {
      console.log("🦄 ~ saveSizeJson ~ message:", message)
    })

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

  const handleSaveFile = () => {
    setHasSaved(true)
    saveJson(tableDataSource)
  }

  useEffect(() => {
    if (!fileDirectory) return
    window.ipc.on("choose rectangle", () => {
      setSelectMethod("rectangle")
    })
    window.ipc.on("choose polygon", () => {
      setSelectMethod("polygon")
    })
    window.ipc.on("save file", () => {
      handleSaveFile()
    })
  }, [fileDirectory])

  useEffect(() => {
    window.ipc.on(
      "outputExists",
      async (params: {
        directoryPath: string
        outputDirectoryPath: string
      }) => {
        const confirmed = await modal.confirm({
          title: "Warning",
          content:
            "The output folder already exists. Do you want to overwrite it?",
          okText: "Yes",
          cancelText: "No",
        })
        window.ipc.send("confirm-output-exists", { confirmed, ...params })
      }
    )
  }, [])

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
            handleSaveFile()
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
        <Button className="px-2" type="text">
          <div className="flex gap-2">
            Files
            <DownOutlined />
          </div>
        </Button>
      </Dropdown>
      <Button
        className="px-2"
        type="text"
        onClick={() => setSelectMethod("rectangle")}
      >
        Rectangle
      </Button>
      <Button
        className="px-2"
        type="text"
        onClick={() => setSelectMethod("polygon")}
      >
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
