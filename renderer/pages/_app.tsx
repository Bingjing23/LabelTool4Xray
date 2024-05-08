import React from "react"
import Head from "next/head"
import type { AppProps } from "next/app"
import "./globals.css"
import BaseDataProvider from "../components/BaseDataProvider"

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <BaseDataProvider>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Component {...pageProps} />
    </BaseDataProvider>
  )
}

export default MyApp
