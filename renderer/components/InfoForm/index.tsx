import { Form, Badge, Select, Input } from "antd"
import { create } from "zustand"
import { xtermColors } from "./colors"
import { FormProps } from "antd/es/form/Form"
import { ReactNode, useEffect, useState } from "react"

type OptionsState = {
  labelOptions: { label: ReactNode; value: string; color: string }[]
  setLabelOptions: (
    labelOptions: { label: ReactNode; value: string; color: string }[]
  ) => void
  originalnewAbnormalityLabelOptions: string[]
  setOriginalnewAbnormalityLabelOptions: (originalOptions: string[]) => void
}

export const labelOptions = [
  {
    label: <Badge key="label 1" color={xtermColors[0]} text="label 1" />,
    value: "label 1",
    color: xtermColors[0],
  },
  {
    label: <Badge key="label 2" color={xtermColors[1]} text="label 2" />,
    value: "label 2",
    color: xtermColors[1],
  },
  {
    label: <Badge key="label 3" color={xtermColors[2]} text="label 3" />,
    value: "label 3",
    color: xtermColors[2],
  },
]

export const useOptionsStore = create<OptionsState>()(set => ({
  labelOptions: labelOptions,
  setLabelOptions: labelOptions => set({ labelOptions }),
  originalnewAbnormalityLabelOptions: [],
  setOriginalnewAbnormalityLabelOptions: originalOptions =>
    set({ originalnewAbnormalityLabelOptions: originalOptions }),
}))

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

export const locationOptions = [
  {
    label: "Lung",
    value: "lung",
  },
  {
    label: "Heart",
    value: "heart",
  },
]

const InfoForm: React.FC<FormProps> = (props: FormProps) => {
  const { labelOptions } = useOptionsStore(state => state)

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
        name="location"
        label="Location"
        initialValue={locationOptions[0].value}
      >
        <Select options={locationOptions} />
      </Form.Item>
      <Form.Item name="description" label="Description">
        <Input.TextArea placeholder="Description" rows={4} />
      </Form.Item>
    </Form>
  )
}
export default InfoForm
