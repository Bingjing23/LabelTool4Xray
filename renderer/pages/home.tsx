import React from "react"
import Head from "next/head"
import { Layout, Spin, Typography } from "antd"
import RightOverview from "../components/RightOverview"
import ActionBar from "../components/ActionBar"
import dynamic from "next/dynamic"
import { useBaseStore } from "../lib/store"

const { Content } = Layout

export default function HomePage() {
  const DrawImage = dynamic(() => import("../components/DrawImage"), {
    ssr: false,
  })

  const { loading } = useBaseStore(state => state)

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
