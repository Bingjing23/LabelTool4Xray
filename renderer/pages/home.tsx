import React, { useEffect, useRef } from "react"
import Head from "next/head"
import { Badge, Layout, Spin, Typography } from "antd"
import RightOverview from "../components/RightOverview"
import ActionBar from "../components/ActionBar"
import dynamic from "next/dynamic"
import { useBaseStore } from "../lib/store"
import { useShallow } from "zustand/react/shallow"
import { useOptionsStore } from "../components/InfoForm"
import { xtermColors } from "../components/InfoForm/colors"

const { Content } = Layout

export default function HomePage() {
  const DrawImage = dynamic(() => import("../components/DrawImage"), {
    ssr: false,
  })

  const { loading, fileDirectory } = useBaseStore(
    useShallow(state => ({
      loading: state.loading,
      fileDirectory: state.fileDirectory,
    }))
  )

  const {
    labelOptions,
    setLabelOptions,
    originalnewAbnormalityLabelOptions,
    setOriginalnewAbnormalityLabelOptions,
  } = useOptionsStore(state => state)

  const firstRender = useRef(true)

  // 初始化文件里储存的标签值
  useEffect(() => {
    if (!firstRender.current || !fileDirectory) return
    window.ipc.send("read-json", {
      fileDirectory,
      fileName: "newAbnormalityNames",
      folderName: "labels_data",
    })
    firstRender.current = false

    window.ipc.on("readed-label-json", (data: any[], state) => {
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
                xtermColors[(labelOptions.length + index) % xtermColors.length]
              }
              text={item}
            />
          ),
          value: item,
          color:
            xtermColors[(labelOptions.length + index) % xtermColors.length],
        })),
      ])
    })
  }, [fileDirectory])

  return (
    <React.Fragment>
      <Head>
        <title>Label</title>
      </Head>

      <Content>
        <div className="container mx-auto">
          <Spin size="large" spinning={loading}>
            <div>
              <Typography.Title level={2} className="mt-2">
                Medical Image Annotation
              </Typography.Title>
              <div className="flex flex-col md:flex-row md:space-x-4">
                <div className="md:w-3/4">
                  <ActionBar />
                  <DrawImage />
                </div>
                <div className="md:w-1/4">
                  <RightOverview />
                </div>
              </div>
            </div>
          </Spin>
        </div>
      </Content>
    </React.Fragment>
  )
}
