import { Form, Badge, Select, Input } from "antd"
import { FormProps } from "antd/es/form/Form"

export const labelOptions = [
  {
    label: <Badge key="red" color="red" text="red" />,
    value: "red",
  },
  {
    label: <Badge key="green" color="green" text="green" />,
    value: "green",
  },
  {
    label: <Badge key="blue" color="blue" text="blue" />,
    value: "blue",
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
  return (
    <Form layout="vertical" {...props}>
      <Form.Item
        name="customLabel"
        label="Label"
        initialValue={labelOptions[0].value}
      >
        <Select options={labelOptions} />
      </Form.Item>
      <Form.Item name="abnormalityName" label="Abnormality Name">
        <Input placeholder="Abnormality Name" />
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
