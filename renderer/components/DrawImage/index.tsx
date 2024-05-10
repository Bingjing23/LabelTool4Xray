import { Badge, Empty, Form, Modal } from "antd"
import React, { Fragment, useContext, useEffect, useRef, useState } from "react"
import { v4 as uuidv4 } from "uuid"
import { Stage, Layer, Image } from "react-konva"
import useImage from "use-image"
import InfoForm from "../InfoForm"
import useSelectMethodFuncs from "./useSelectMethodFuncs"
import { xtermColors } from "../InfoForm/colors"
import ResizeObserverFC from "./ResizeObserver"
import {
  BASE_WIDTH,
  GraphicDataContext,
} from "../Providers/GraphicDataProvider"
import { BaseDataContext } from "../Providers/BaseDataProvider"
import { TableDataContext } from "../Providers/TableDataProvider"
import { OptionsContext } from "../Providers/OptionsProvider"

const isWindows = () => {
  const userAgent = navigator.userAgent.toLowerCase()
  return userAgent.includes("win")
}

const DrawImage = () => {
  const { baseData, dispatchBaseData } = useContext(BaseDataContext)
  const {
    fileUrl,
    selectMethod,
    fileDirectory,
    imageBrightness,
    imageContrast,
    hasImage,
  } = baseData
  const [image] = useImage(
    `${isWindows() ? "file" : "atom"}://${fileUrl}`,
    "anonymous"
  )
  const [form] = Form.useForm()
  const [modalFn, contextHolder] = Modal.useModal()
  const [resetSizeFlag, setResetSizeFlag] = useState(0)
  const setOnceRef = useRef(false)
  const [lastSize, setLastSize] = useState([])
  const [currentSize, setCurrentSize] = useState([])
  const {
    rects,
    dispatchRects,
    polygons,
    dispatchPolygons,
    storedWindowWidth,
    setStoredWindowWidth,
    storedWindowHeight,
    setStoredWindowHeight,
    size,
    setSize,
  } = useContext(GraphicDataContext)
  const { tableData, dispatchTableData } = useContext(TableDataContext)
  const { tableDataSource } = tableData

  useEffect(() => {
    if (!image) return
    const imageWidth = image.width,
      imageHeight = image.height
    const scale = imageWidth / imageHeight
    const currentInnerWidth =
      document.querySelector("#stage")?.clientWidth || BASE_WIDTH
    if (imageWidth > imageHeight) {
      const width = currentInnerWidth
      const height = currentInnerWidth / scale
      setSize({ width, height })
      if (!setOnceRef.current) {
        setOnceRef.current = true
        setLastSize([width, height])
      } else {
        if (lastSize[0] !== width || lastSize[1] !== height) {
          setCurrentSize([width, height])
        }
      }
    } else {
      const width = currentInnerWidth * 0.9375 * scale
      const height = currentInnerWidth * 0.9375
      setSize({ width, height })
      if (!setOnceRef.current) {
        setOnceRef.current = true
        setLastSize([width, height])
      } else {
        if (lastSize[0] !== width || lastSize[1] !== height) {
          setCurrentSize([width, height])
        }
      }
    }
  }, [image, resetSizeFlag])

  useEffect(() => {
    if (!lastSize.length || !currentSize.length) return
    let scaleX = currentSize[0] / lastSize[0]
    scaleX = Math.abs(Number(scaleX.toFixed(3)) - 1) <= 0.002 ? 1 : scaleX
    let scaleY = currentSize[1] / lastSize[1]
    scaleY = Math.abs(Number(scaleY.toFixed(3)) - 1) <= 0.002 ? 1 : scaleY
    if (scaleX !== 1 || scaleY !== 1) {
      dispatchRects({
        type: "setRects",
        rects: rects.map(rect => ({
          ...rect,
          x: rect.x * scaleX,
          y: rect.y * scaleY,
          width: rect.width * scaleX,
          height: rect.height * scaleY,
        })),
      })
      dispatchPolygons({
        type: "setPolygons",
        polygons: polygons.map(pts => ({
          ...pts,
          points: pts.points.map(p => p * (scaleX === 1 ? scaleY : scaleX)),
        })),
      })

      dispatchTableData({
        type: "setTableDataSource",
        tableDataSource: tableDataSource.map(item => {
          if (item.rect) {
            return {
              ...item,
              rect: {
                ...item.rect,
                x: item.rect.x * scaleX,
                y: item.rect.y * scaleY,
                width: item.rect.width * scaleX,
                height: item.rect.height * scaleY,
              },
            }
          } else if (item.polygon) {
            return {
              ...item,
              polygon: {
                ...item.polygon,
                points: item.polygon.points.map(
                  p => p * (scaleX === 1 ? scaleY : scaleX)
                ),
              },
            }
          }
        }),
      })
      setLastSize(currentSize)
    }
  }, [rects, polygons, currentSize])

  useEffect(() => {
    if (!lastSize.length || !currentSize.length) return

    // 只有当 currentSize 真正变化时才更新 lastSize
    if (lastSize[0] !== currentSize[0] || lastSize[1] !== currentSize[1]) {
      setLastSize(currentSize)
    }
  }, [currentSize])

  useEffect(() => {
    if (!storedWindowWidth || !storedWindowHeight || !lastSize.length) return
    console.log("🦄 ~ useEffect ~ storedWindowWidth:", [
      storedWindowWidth,
      storedWindowHeight,
    ])
    console.log("🦄 ~ useEffect ~ lastSize:", lastSize)
    let scaleX = lastSize[0] / storedWindowWidth
    scaleX = Math.abs(Number(scaleX.toFixed(3)) - 1) <= 0.002 ? 1 : scaleX
    let scaleY = lastSize[1] / storedWindowHeight
    scaleY = Math.abs(Number(scaleY.toFixed(3)) - 1) <= 0.002 ? 1 : scaleY

    if (scaleX !== 1 || scaleY !== 1) {
      dispatchRects({
        type: "setRects",
        rects: rects.map(rect => ({
          ...rect,
          x: rect.x * scaleX,
          y: rect.y * scaleY,
          width: rect.width * scaleX,
          height: rect.height * scaleY,
        })),
      })
      dispatchPolygons({
        type: "setPolygons",
        polygons: polygons.map(pts => ({
          ...pts,
          points: pts.points.map(p => p * (scaleX === 1 ? scaleY : scaleX)),
        })),
      })
      dispatchTableData({
        type: "setTableDataSource",
        tableDataSource: tableDataSource.map(item => {
          if (item.rect) {
            return {
              ...item,
              rect: {
                ...item.rect,
                x: item.rect.x * scaleX,
                y: item.rect.y * scaleY,
                width: item.rect.width * scaleX,
                height: item.rect.height * scaleY,
              },
            }
          } else if (item.polygon) {
            return {
              ...item,
              polygon: {
                ...item.polygon,
                points: item.polygon.points.map(
                  p => p * (scaleX === 1 ? scaleY : scaleX)
                ),
              },
            }
          }
        }),
      })
    }
    setStoredWindowWidth(0)
    setStoredWindowHeight(0)
  }, [storedWindowWidth, storedWindowHeight, lastSize])

  useEffect(() => {
    window.ipc.on("saved-label-json", message => {
      console.log("🦄 ~ saveLabelJson ~ message:", message)
    })
    return () => {
      window.ipc.remove("saved-label-json")
    }
  }, [])

  const { modal, methods } = useSelectMethodFuncs()
  const { open: modalOpen, setOpen: setModalOpen } = modal
  const { currentRect, setCurrentRect } = methods.rectangle
  const { currentPoints, setCurrentPoints } = methods.polygon

  const handleMouseDown = methods[selectMethod].handleMouseDown
  const handleMouseMove = methods[selectMethod].handleMouseMove

  const {
    labelOptions,
    setLabelOptions,
    originalnewAbnormalityLabelOptions,
    setOriginalnewAbnormalityLabelOptions,
  } = useContext(OptionsContext)

  const handleSubmit = values => {
    console.log("Form Values:", values)
    console.log("currentPoints:", currentPoints, currentRect)
    const newAbnormalityName = values.newAbnormalityName

    setOriginalnewAbnormalityLabelOptions([
      ...originalnewAbnormalityLabelOptions,
      newAbnormalityName,
    ])

    if (!fileDirectory) {
      modalFn.warning({
        title: "Warning",
        content: "Please choose a folder first.",
      })
      return
    }
    if (newAbnormalityName) {
      window.ipc.send("save-label-json", {
        fileDirectory,
        data: [
          ...originalnewAbnormalityLabelOptions,
          newAbnormalityName,
        ].filter(Boolean),
        fileName: "newAbnormalityNames",
        path: fileUrl,
      })
    }

    setLabelOptions([
      ...labelOptions,
      {
        label: (
          <Badge
            key={newAbnormalityName}
            color={xtermColors[labelOptions.length % xtermColors.length]}
            text={newAbnormalityName}
          />
        ),
        value: newAbnormalityName,
        color: xtermColors[labelOptions.length % xtermColors.length],
      },
    ])
    if (selectMethod === "rectangle") {
      dispatchTableData({
        type: "addTableDataSource",
        addTableDataSource: {
          ...values,
          customLabel: newAbnormalityName || values.customLabel,
          rect: currentRect,
          rowId: uuidv4(),
        },
      })
      setCurrentRect(null)
    } else if (selectMethod === "polygon") {
      dispatchTableData({
        type: "addTableDataSource",
        addTableDataSource: {
          ...values,
          customLabel: newAbnormalityName || values.customLabel,
          polygon: currentPoints,
          rowId: uuidv4(),
        },
      })
      setCurrentPoints(null)
    }
    dispatchBaseData({ type: "setHasChanged", hasChanged: true })
    setModalOpen(false)
    form.resetFields()
  }

  return (
    <ResizeObserverFC
      onResize={() => {
        setResetSizeFlag(resetSizeFlag => resetSizeFlag + 1)
      }}
    >
      {hasImage && fileUrl ? (
        <Stage
          id="stage"
          className="flex justify-center"
          style={{
            filter: `brightness(${imageBrightness / 100}) contrast(${
              imageContrast / 100
            })`,
          }}
          width={size.width}
          height={size.height}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
        >
          <Layer>
            <Image width={size.width} height={size.height} image={image} />
            {Object.entries(methods).map(([key, value]) => (
              <Fragment key={key}>{value.render}</Fragment>
            ))}
          </Layer>
        </Stage>
      ) : (
        <div
          style={{ width: size.width, height: size.height }}
          className="flex justify-center items-center"
        >
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
        </div>
      )}
      <Modal
        title="Additional Information"
        open={modalOpen}
        maskClosable={false}
        onOk={() => form.submit()}
        onCancel={() => {
          setModalOpen(false)
          if (selectMethod === "rectangle") {
            dispatchRects({ type: "setRects", rects: rects.slice(0, -1) })
            setCurrentRect(null)
          } else if (selectMethod === "polygon") {
            dispatchPolygons({
              type: "setPolygons",
              polygons: polygons.slice(0, -1),
            })
            setCurrentPoints(null)
          }
        }}
      >
        <InfoForm form={form} onFinish={handleSubmit} />
      </Modal>
      {contextHolder}
    </ResizeObserverFC>
  )
}

export default DrawImage
