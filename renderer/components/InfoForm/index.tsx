import { Form, Badge, Select, Input } from "antd"
import { xtermColors } from "./colors"
import { FormProps } from "antd/es/form/Form"
import { useContext } from "react"
import { OptionsContext } from "../Providers/OptionsProvider"

// disease labels:
// atelectasis, consolidation, pneumothorax, emphysema, nodule, enlarged cardiac silhouette
export const labelOptions = [
  {
    label: (
      <Badge key="Atelectasis" color={xtermColors[0]} text="Atelectasis" />
    ),
    value: "Atelectasis",
    color: xtermColors[0],
  },
  {
    label: (
      <Badge key="Consolidation" color={xtermColors[1]} text="Consolidation" />
    ),
    value: "Consolidation",
    color: xtermColors[1],
  },
  {
    label: (
      <Badge key="Pneumothorax" color={xtermColors[2]} text="Pneumothorax" />
    ),
    value: "Pneumothorax",
    color: xtermColors[2],
  },
  {
    label: <Badge key="Emphysema" color={xtermColors[3]} text="Emphysema" />,
    value: "Emphysema",
    color: xtermColors[3],
  },
  {
    label: <Badge key="Nodule" color={xtermColors[4]} text="Nodule" />,
    value: "Nodule",
    color: xtermColors[4],
  },
  {
    label: (
      <Badge
        key="Enlarged Cardiac Silhouette"
        color={xtermColors[5]}
        text="Enlarged Cardiac Silhouette"
      />
    ),
    value: "Enlarged Cardiac Silhouette",
    color: xtermColors[5],
  },
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
    label: "Left clavicle trachea",
    value: "Left clavicle trachea",
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

const InfoForm: React.FC<FormProps> = (props: FormProps) => {
  const { labelOptions } = useContext(OptionsContext)

  return (
    <Form layout="vertical" {...props}>
      <Form.Item
        name="customLabel"
        label="Label"
        initialValue={labelOptions[0].value}
      >
        <Select options={labelOptions} />
      </Form.Item>
      <Form.Item name="newAbnormalityName" label="New Abnormality Name">
        <Input placeholder="New Abnormality Name" />
      </Form.Item>
      <Form.Item
        name="severity"
        label="Severity"
        initialValue={severityOptions[0].value}
      >
        <Select options={severityOptions} />
      </Form.Item>
      <Form.Item
        name="anatomicalRegions"
        label="Anatomical Regions"
        initialValue={anatomicalRegionsOptions[0].value}
      >
        <Select options={anatomicalRegionsOptions} />
      </Form.Item>
      <Form.Item name="description" label="Description">
        <Input.TextArea placeholder="Description" rows={4} />
      </Form.Item>
    </Form>
  )
}
export default InfoForm
