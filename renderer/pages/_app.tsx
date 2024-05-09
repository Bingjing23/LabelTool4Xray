import React from "react"
import Head from "next/head"
import type { AppProps } from "next/app"
import "./globals.css"
import BaseDataProvider from "../components/Providers/BaseDataProvider"
import OptionsProvider from "../components/Providers/OptionsProvider"

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <BaseDataProvider>
      <OptionsProvider>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <Component {...pageProps} />
      </OptionsProvider>
    </BaseDataProvider>
  )
}

export default MyApp
