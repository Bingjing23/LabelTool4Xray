import React from "react"
import Head from "next/head"
import Link from "next/link"
import { Layout, Typography } from "antd"
import DrawImage from "../components/DrawImage"
import RightOverview from "../components/RightOverview"
import ActionBar from "../components/ActionBar"
import { useBaseStore } from "../lib/store"

const { Header, Content } = Layout

export default function HomePage() {
  const { fileUrl, hasImage } = useBaseStore(state => state)
  return (
    <React.Fragment>
      <Head>
        <title>Label</title>
      </Head>

      <Content>
        <div className="container mx-auto">
          <Typography.Title level={2} className="mt-2">
            Medical Image Annotation
          </Typography.Title>
          <div className="flex flex-col md:flex-row md:space-x-4">
            <div className="md:w-3/4">
              <ActionBar />
              <DrawImage width={960} hasImage={hasImage} fileUrl={fileUrl} />
            </div>
            <div className="md:w-1/4">
              <RightOverview />
            </div>
          </div>
        </div>
      </Content>
    </React.Fragment>
  )
}
