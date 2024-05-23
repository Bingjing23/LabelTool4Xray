import { ReactNode, createContext, useState } from "react"
import { xtermColors } from "../../InfoForm/colors"
import { Badge } from "antd"

// disease labels:
// atelectasis, consolidation, pneumothorax, emphysema, nodule, enlarged cardiac silhouette
export const defaultLabelOptions = [
  {
    label: (
      <Badge
        key="alveolar consolidation"
        color={xtermColors[0]}
        text="肺泡实变（alveolar consolidation）"
      />
    ),
    value: "alveolar consolidation",
    color: xtermColors[0],
  },
  {
    label: (
      <Badge
        key="interstitial thickening"
        color={xtermColors[1]}
        text="肺间质增厚（interstitial thickening）"
      />
    ),
    value: "interstitial thickening",
    color: xtermColors[1],
  },
  {
    label: (
      <Badge
        key="pleural effusion"
        color={xtermColors[2]}
        text="胸腔积液（pleural effusion）"
      />
    ),
    value: "pleural effusion",
    color: xtermColors[2],
  },
  {
    label: (
      <Badge
        key="pneumothorax"
        color={xtermColors[3]}
        text="气胸（pneumothorax）"
      />
    ),
    value: "pneumothorax",
    color: xtermColors[3],
  },
  {
    label: (
      <Badge key="pneumonia" color={xtermColors[4]} text="肺炎（pneumonia）" />
    ),
    value: "pneumonia",
    color: xtermColors[4],
  },
  {
    label: (
      <Badge
        key="bronchitis"
        color={xtermColors[5]}
        text="支气管炎（bronchitis）"
      />
    ),
    value: "bronchitis",
    color: xtermColors[5],
  },
  {
    label: (
      <Badge
        key="pulmonary edema"
        color={xtermColors[6]}
        text="肺水肿（pulmonary edema）"
      />
    ),
    value: "pulmonary edema",
    color: xtermColors[6],
  },
  // {
  //   label: <Badge key="Nodule" color={xtermColors[7]} text="Nodule" />,
  //   value: "Nodule",
  //   color: xtermColors[7],
  // },
  // {
  //   label: (
  //     <Badge key="Cardiomegaly" color={xtermColors[8]} text="Cardiomegaly" />
  //   ),
  //   value: "Cardiomegaly",
  //   color: xtermColors[8],
  // }
]

export const severityOptions = [
  {
    label: "Critical",
    value: "critical",
  },
  {
    label: "Moderate",
    value: "moderate",
  },
  {
    label: "Mild",
    value: "mild",
  },
]

// anatomical regions:
// right lung, right upper lung zone, right mid lung zone, right lower lung zone, right apical zone,
// left lung, left upper lung zone, left mid lung zone, left lower lung zone, left apical zone,
// right hilar structures, right costophrenic angle, right hemidiaphragm
// left hilar structures, left costophrenic angle, left hemidiaphragm
// right clavicle, left clavicle trachea, spine,
// aortic arch, mediastinum, upper mediastinum, superior vena cava,
// cardiac silhouette, cavoatrial junction, right atrium, carina, abdomen
// a右肺上野内带 (right upper medial lung zone)
// b右肺上野中带 (right upper central lung zone)
// c右肺上野外带 (right upper lateral lung zone)
// d右肺中野内带 (right middle medial lung zone)
// e右肺中野中带 (right middle central lung zone)
// f右肺中野外带 (right middle lateral lung zone)
// g右肺下野内带 (right lower medial lung zone)
// h右肺下野中带 (right lower central lung zone)
// i右肺下野外带 (right lower lateral lung zone)
// A左肺上野内带 (left upper medial lung zone)
// B左肺上野中带 (left upper central lung zone)
// C左肺上野外带 (left upper lateral lung zone)
// D左肺中野内带 (left middle medial lung zone)
// E左肺中野中带 (left middle central lung zone)
// F左肺中野外带 (left middle lateral lung zone)
// G左肺下野内带 (left lower medial lung zone)
// H左肺下野中带 (left lower central lung zone)
// I左肺下野外带 (left lower lateral lung zone)
export const anatomicalRegionsOptions = [
  {
    label: "a右肺上野内带 (right upper medial lung zone)",
    value: "right upper medial lung zone",
  },
  {
    label: "b右肺上野中带 (right upper central lung zone)",
    value: "right upper central lung zone",
  },
  {
    label: "c右肺上野外带 (right upper lateral lung zone)",
    value: "right upper lateral lung zone",
  },
  {
    label: "d右肺中野内带 (right middle medial lung zone)",
    value: "right middle medial lung zone",
  },
  {
    label: "e右肺中野中带 (right middle central lung zone)",
    value: "right middle central lung zone",
  },
  {
    label: "f右肺中野外带 (right middle lateral lung zone)",
    value: "right middle lateral lung zone",
  },
  {
    label: "g右肺下野内带 (right lower medial lung zone)",
    value: "right lower medial lung zone",
  },
  {
    label: "h右肺下野中带 (right lower central lung zone)",
    value: "right lower central lung zone",
  },
  {
    label: "i右肺下野外带 (right lower lateral lung zone)",
    value: "right lower lateral lung zone",
  },
  {
    label: "A左肺上野内带 (left upper medial lung zone)",
    value: "left upper medial lung zone",
  },
  {
    label: "B左肺上野中带 (left upper central lung zone)",
    value: "left upper central lung zone",
  },
  {
    label: "C左肺上野外带 (left upper lateral lung zone)",
    value: "left upper lateral lung zone",
  },
  {
    label: "D左肺中野内带 (left middle medial lung zone)",
    value: "left middle medial lung zone",
  },
  {
    label: "E左肺中野中带 (left middle central lung zone)",
    value: "left middle central lung zone",
  },
  {
    label: "F左肺中野外带 (left middle lateral lung zone)",
    value: "left middle lateral lung zone",
  },
  {
    label: "G左肺下野内带 (left lower medial lung zone)",
    value: "left lower medial lung zone",
  },
  {
    label: "H左肺下野中带 (left lower central lung zone)",
    value: "left lower central lung zone",
  },
  {
    label: "I左肺下野外带 (left lower lateral lung zone)",
    value: "left lower lateral lung zone",
  },
]

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
  const [labelOptions, setLabelOptions] =
    useState<{ label: ReactNode; value: string; color: string }[]>(
      defaultLabelOptions
    )
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
