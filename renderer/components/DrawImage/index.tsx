import { Badge, Empty, Form, Modal } from "antd"
import React, { Fragment, useEffect, useRef, useState } from "react"
import { v4 as uuidv4 } from "uuid"
import { Stage, Layer, Image, Rect } from "react-konva"
import useImage from "use-image"
import InfoForm, { useOptionsStore } from "../InfoForm"
import useSelectMethodFuncs from "./useSelectMethodFuncs"
import {
  useBaseStore,
  usePolygonStore,
  useRectsStore,
  useTableStore,
} from "../../lib/store"
import { xtermColors } from "../InfoForm/colors"

const isDicomFile = (fileName: string) => {
  const lowerCaseFileName = fileName.toLowerCase()
  return [".dcm", ".dicom"].some(ext => lowerCaseFileName.endsWith(ext))
}

const DrawImage = () => {
  const { selectMethod, hasImage, fileUrl } = useBaseStore(state => state)
  const [size, setSize] = useState<{ width: number; height: number }>({
    width: 960,
    height: 720,
  })
  const [image] = useImage(`atom://${fileUrl}`, "anonymous")
  const [dicomImage, setDicomImage] = useState<HTMLImageElement>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    if (!image) return
    const imageWidth = image.width,
      imageHeight = image.height
    const scale = imageWidth / imageHeight
    if (imageWidth > imageHeight) setSize({ width: 960, height: 960 / scale })
    else setSize({ width: 720 * scale, height: 720 })
  }, [image])

  const { rects: rectangles, setRects: setRectangles } = useRectsStore(
    state => state
  )
  const { polygons, setPolygons } = usePolygonStore(state => state)
  const { addTableDataSource } = useTableStore(state => state)

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
  } = useOptionsStore(state => state)

  const firstRender = useRef(true)

  useEffect(() => {
    if (!modalOpen) return
    window.ipc.on("readed-label-json", (data: any[], state) => {
      if (firstRender.current) {
        setOriginalnewAbnormalityLabelOptions([
          ...originalnewAbnormalityLabelOptions,
          ...data,
        ])
        setLabelOptions([
          ...labelOptions,
          ...data?.map((item, index) => ({
            label: (
              <Badge
                key={item}
                color={
                  xtermColors[
                    (labelOptions.length + index) % xtermColors.length
                  ]
                }
                text={item}
              />
            ),
            value: item,
            color:
              xtermColors[(labelOptions.length + index) % xtermColors.length],
          })),
        ])
        firstRender.current = false
      }
    })
    window.ipc.send("read-json", {
      fileName: "newAbnormalityNames",
      folderName: "labels_data",
    })
  }, [modalOpen])

  const handleSubmit = values => {
    console.log("Form Values:", values)
    console.log("currentPoints:", currentPoints, currentRect)
    const newAbnormalityName = values.newAbnormalityName

    setOriginalnewAbnormalityLabelOptions([
      ...originalnewAbnormalityLabelOptions,
      newAbnormalityName,
    ])

    window.ipc.send("save-label-json", {
      data: [...originalnewAbnormalityLabelOptions, newAbnormalityName],
      fileName: "newAbnormalityNames",
      path: fileUrl,
    })
    window.ipc.on("saved-label-json", message => {
      console.log("🦄 ~ saveLabelJson ~ message:", message)
    })

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
      addTableDataSource({
        ...values,
        customLabel: newAbnormalityName || values.customLabel,
        rect: currentRect,
        rowId: uuidv4(),
      })
      setCurrentRect(null)
    } else if (selectMethod === "polygon") {
      addTableDataSource({
        ...values,
        customLabel: newAbnormalityName || values.customLabel,
        polygon: currentPoints,
        rowId: uuidv4(),
      })
      setCurrentPoints(null)
    }

    setModalOpen(false)
    form.resetFields()
  }

  return (
    <>
      {hasImage && fileUrl ? (
        <Stage
          className="flex justify-center"
          width={size.width}
          height={size.height}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
        >
          <Layer>
            <Image
              width={size.width}
              height={size.height}
              image={image || dicomImage}
            />
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
        onOk={() => form.submit()}
        onCancel={() => {
          setModalOpen(false)
          if (selectMethod === "rectangle") {
            setRectangles(rectangles.slice(0, -1))
            setCurrentRect(null)
          } else if (selectMethod === "polygon") {
            setPolygons(polygons.slice(0, -1))
            setCurrentPoints(null)
          }
        }}
      >
        <InfoForm form={form} onFinish={handleSubmit} />
      </Modal>
    </>
  )
}

export default DrawImage
