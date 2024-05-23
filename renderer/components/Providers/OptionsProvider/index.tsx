import { ReactNode, createContext, useState } from "react"
import { xtermColors } from "../../InfoForm/colors"
import { Badge } from "antd"

// disease labels:
// atelectasis, consolidation, pneumothorax, emphysema, nodule, enlarged cardiac silhouette
export const defaultLabelOptions = [
  {
    label: (
      <Badge key="alveolar consolidation" color={xtermColors[0]} text="肺泡实变（alveolar consolidation）" />
    ),
    value: "alveolar consolidation",
    color: xtermColors[0],
  },
  {
    label: (
      <Badge key="interstitial thickening" color={xtermColors[1]} text="肺间质增厚（interstitial thickening）" />
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
    label: <Badge key="pneumothorax" color={xtermColors[3]} text="气胸（pneumothorax）" />,
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
    label: <Badge key="bronchitis" color={xtermColors[5]} text="支气管炎（bronchitis）" />,
    value: "bronchitis",
    color: xtermColors[5],
  },
  {
    label: <Badge key="pulmonary edema" color={xtermColors[6]} text="肺水肿（pulmonary edema）" />,
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
export const anatomicalRegionsOptions = [
  {
    label: "Right lung",
    value: "Right lung",
  },
  {
    label: "Right upper lung zone",
    value: "Right upper lung zone",
  },
  {
    label: "Right mid lung zone",
    value: "Right mid lung zone",
  },
  {
    label: "Right lower lung zone",
    value: "Right lower lung zone",
  },
  {
    label: "Right apical zone",
    value: "Right apical zone",
  },
  {
    label: "Left lung",
    value: "Left lung",
  },
  {
    label: "Left upper lung zone",
    value: "Left upper lung zone",
  },
  {
    label: "Left mid lung zone",
    value: "Left mid lung zone",
  },
  {
    label: "Left lower lung zone",
    value: "Left lower lung zone",
  },
  {
    label: "Left apical zone",
    value: "Left apical zone",
  },
  {
    label: "Right hilar structures",
    value: "Right hilar structures",
  },
  {
    label: "Right costophrenic angle",
    value: "Right costophrenic angle",
  },
  {
    label: "Right hemidiaphragm",
    value: "Right hemidiaphragm",
  },
  {
    label: "Left hilar structures",
    value: "Left hilar structures",
  },
  {
    label: "Left costophrenic angle",
    value: "Left costophrenic angle",
  },
  {
    label: "Left hemidiaphragm",
    value: "Left hemidiaphragm",
  },
  {
    label: "Right clavicle",
    value: "Right clavicle",
  },
  {
    label: "Left clavicle",
    value: "Left clavicle",
  },
  {
    label: "Trachea",
    value: "Trachea",
  },
  {
    label: "Spine",
    value: "Spine",
  },
  {
    label: "Aortic arch",
    value: "Aortic arch",
  },
  {
    label: "Mediastinum",
    value: "Mediastinum",
  },
  {
    label: "Upper mediastinum",
    value: "Upper mediastinum",
  },
  {
    label: "Superior vena cava",
    value: "Superior vena cava",
  },
  {
    label: "Cardiac silhouette",
    value: "Cardiac silhouette",
  },
  {
    label: "Cavoatrial junction",
    value: "Cavoatrial junction",
  },
  {
    label: "Right atrium",
    value: "Right atrium",
  },
  {
    label: "Carina",
    value: "Carina",
  },
  {
    label: "Abdomen",
    value: "Abdomen",
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
