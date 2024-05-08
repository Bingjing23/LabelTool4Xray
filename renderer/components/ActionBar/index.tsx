import { Button, Dropdown, MenuProps, Modal, Slider } from "antd"
import { DownOutlined } from "@ant-design/icons"
import { useContext, useEffect } from "react"
import { BaseDataContext } from "../BaseDataProvider"
import { TableDataContext } from "../TableDataProvider"

export const getFileNameFromPath = (path: string) => {
  // 正则表达式匹配最后一个斜杠后的所有字符
  const match = path.match(/[^\\/]+\.[^\\/]+$/)
  return match ? match[0] : ""
}

const ActionBar = () => {
  const [modal, contextHolder] = Modal.useModal()
  const { tableData } = useContext(TableDataContext)
  const { tableDataSource } = tableData

  const { baseData, dispatchBaseData } = useContext(BaseDataContext)
  const { fileDirectory, fileUrl, imageBrightness, imageContrast } = baseData
  const openDialogAndFetchFiles = async () => {
    dispatchBaseData({ type: "setLoading", loading: true })
    window.ipc.send("open-directory-dialog", [])
  }

  useEffect(() => {
    window.ipc.on(
      "selected-directory",
      (files: string[], outputDirectory: string) => {
        dispatchBaseData({ type: "setLoading", loading: false })
        dispatchBaseData({
          type: "setFileDirectory",
          fileDirectory: outputDirectory,
        })
        dispatchBaseData({
          type: "setFilesData",
          filesData: files.map((item: string) => ({
            key: item,
            path: item,
            fileName: getFileNameFromPath(item),
          })),
        })
      }
    )
    return () => {
      window.ipc.remove("selected-directory")
    }
  }, [])

  const saveJson = async (values: any) => {
    if (!fileDirectory) {
      modal.warning({
        title: "Warning",
        content: "Please choose a folder first.",
      })
      return
    }

    const fullFileName = getFileNameFromPath(fileUrl).split(".")
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
      data: values,
      fileName: getFileNameFromPath(fileUrl),
      path: fileUrl,
    })
  }

  useEffect(() => {
    window.ipc.on("saved-label-json", message => {
      console.log("🦄 ~ saveSizeJson ~ message:", message)
    })
    window.ipc.on("saved-image-json", message => {
      console.log("🦄 ~ saveImageJson ~ message:", message)
    })
    return () => {
      window.ipc.remove("saved-label-json")
      window.ipc.remove("saved-image-json")
    }
  }, [fileDirectory])

  const handleSaveFile = () => {
    dispatchBaseData({ type: "setHasSaved", hasSaved: true })
    saveJson(tableDataSource)
  }

  useEffect(() => {
    if (!fileDirectory) return
    window.ipc.on("choose rectangle", () => {
      dispatchBaseData({ type: "setSelectMethod", selectMethod: "rectangle" })
    })
    window.ipc.on("choose polygon", () => {
      dispatchBaseData({ type: "setSelectMethod", selectMethod: "polygon" })
    })
    window.ipc.on("save file", () => {
      handleSaveFile()
    })
    return () => {
      window.ipc.remove("choose rectangle")
      window.ipc.remove("choose polygon")
      window.ipc.remove("save file")
    }
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
    return () => {
      window.ipc.remove("outputExists")
    }
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
        onClick={() =>
          dispatchBaseData({
            type: "setSelectMethod",
            selectMethod: "rectangle",
          })
        }
      >
        Rectangle
      </Button>
      <Button
        className="px-2"
        type="text"
        onClick={() => {
          dispatchBaseData({ type: "setSelectMethod", selectMethod: "polygon" })
        }}
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
            dispatchBaseData({
              type: "setImageBrightness",
              imageBrightness: value,
            })
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
            dispatchBaseData({
              type: "setImageContrast",
              imageContrast: value,
            })
          }}
        />
      </div>
      <Button
        type="text"
        onClick={() => {
          dispatchBaseData({ type: "setImageBrightness", imageBrightness: 100 })
          dispatchBaseData({ type: "setImageContrast", imageContrast: 100 })
        }}
      >
        Reset
      </Button>
      {contextHolder}
    </div>
  )
}
export default ActionBar
