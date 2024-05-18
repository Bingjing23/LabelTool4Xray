import React, { useContext, useEffect, useRef } from "react"
import Head from "next/head"
import { Badge, Layout, Spin, Typography } from "antd"
import RightOverview from "../components/RightOverview"
import ActionBar from "../components/ActionBar"
import dynamic from "next/dynamic"
import { xtermColors } from "../components/InfoForm/colors"
import GraphicDataProvider from "../components/Providers/GraphicDataProvider"
import { BaseDataContext } from "../components/Providers/BaseDataProvider"
import TableDataProvider from "../components/Providers/TableDataProvider"
import { OptionsContext } from "../components/Providers/OptionsProvider"

const { Content } = Layout

export default function HomePage() {
  const DrawImage = dynamic(() => import("../components/DrawImage"), {
    ssr: false,
  })

  const { baseData } = useContext(BaseDataContext)
  const { fileDirectory, fileName, loading } = baseData

  const {
    labelOptions,
    setLabelOptions,
    originalnewAbnormalityLabelOptions,
    setOriginalnewAbnormalityLabelOptions,
  } = useContext(OptionsContext)

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
    return () => {
      window.ipc.remove("readed-label-json")
    }
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
              <Typography.Title level={2} className="mt-2 truncate">
                {fileName}
              </Typography.Title>
              <GraphicDataProvider>
                <TableDataProvider>
                  <div className="flex portrait:flex-col flex-row landscape:space-x-4">
                    <div className="portrait:w-full w-3/4">
                      <ActionBar />
                      <div className="portrait:w-full portrait:my-4 landscape:hidden">
                        <RightOverview />
                      </div>
                      <DrawImage />
                    </div>
                    <div className="landscape:w-1/4 portrait:hidden">
                      <RightOverview />
                    </div>
                  </div>
                </TableDataProvider>
              </GraphicDataProvider>
            </div>
          </Spin>
        </div>
      </Content>
    </React.Fragment>
  )
}
