import { Form, Select, Input } from "antd"
import { FormProps } from "antd/es/form/Form"
import { useContext } from "react"
import { OptionsContext, anatomicalRegionsOptions, severityOptions } from "../Providers/OptionsProvider"

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
