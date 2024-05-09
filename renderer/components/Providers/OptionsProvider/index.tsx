import { ReactNode, createContext, useState } from "react"

type OptionsState = {
  labelOptions: { label: ReactNode; value: string; color: string }[]
  setLabelOptions: (
    labelOptions: { label: ReactNode; value: string; color: string }[]
  ) => void
  originalnewAbnormalityLabelOptions: string[]
  setOriginalnewAbnormalityLabelOptions: (originalOptions: string[]) => void
}

export const OptionsContext = createContext<OptionsState | null>(null)

const OptionsProvider = ({ children }: { children: ReactNode }) => {
  const [labelOptions, setLabelOptions] = useState<
    { label: ReactNode; value: string; color: string }[]
  >([])
  const [
    originalnewAbnormalityLabelOptions,
    setOriginalnewAbnormalityLabelOptions,
  ] = useState<string[]>([])

  return (
    <OptionsContext.Provider
      value={{
        labelOptions,
        setLabelOptions,
        originalnewAbnormalityLabelOptions,
        setOriginalnewAbnormalityLabelOptions,
      }}
    >
      {children}
    </OptionsContext.Provider>
  )
}

export default OptionsProvider
