import React from 'react'
import Form, { FormProps } from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

interface InputProps extends React.HTMLAttributes<HTMLElement> {
  id: string
  label: string
  children: JSX.Element[] | JSX.Element
}

export const Input = ({ id, label, children, ...props }: InputProps) => (
  <Form.Group as={Row} className="mb-3" controlId={id} {...props}>
    <Form.Label column sm={2}>{label}</Form.Label>
    <Col sm={10}>
      {children}
    </Col>
  </Form.Group>
)

interface SwitchInputProps {
  id: string
  label: string
  defaultChecked: boolean
  onChange?: (value: boolean) => void
}

Input.Switch = ({ id, label, defaultChecked, onChange }: SwitchInputProps) => (
  <Input id={id} label={label}>
    <Form.Check
      css={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", "& input": { marginTop: 0 } }}
      type="switch"
      name={id}
      defaultChecked={defaultChecked}
      onChange={evt => onChange && onChange(evt.target.checked)}
    />
  </Input>
)

interface TextInputProps {
  id: string
  label: string
  placeholder?: string
  after?: string
  value?: string
  defaultValue?: string
  disabled?: boolean
  pattern?: string
  type?: string
  onChange?: (value: string) => void
}

Input.Text = ({ id, label, placeholder, after, value, defaultValue, disabled, pattern, type, onChange }: TextInputProps) => (
  <Input id={id} label={label}>
    <InputGroup>
      <Form.Control
        name={id}
        placeholder={placeholder}
        value={value}
        defaultValue={defaultValue}
        onChange={evt => onChange && onChange(evt.target.value)}
        disabled={disabled}
        pattern={pattern}
        data-input-type={type}
      />
      {after && <InputGroup.Text>{after}</InputGroup.Text>}
    </InputGroup>
  </Input>
)

interface SelectInputProps {
  id: string
  label: string
  defaultValue: string
  onChange?: (value: string) => void
  children: JSX.Element[] | JSX.Element
}

Input.Select = ({ id, label, defaultValue, onChange, children }: SelectInputProps) => (
  <Input id={id} label={label}>
    <Form.Select
      name={id}
      defaultValue={defaultValue}
      onChange={evt => onChange && onChange(evt.target.value)}
    >
      {children}
    </Form.Select>
  </Input>
)


interface FormInputProps<T> extends FormProps {
  valueSetter?: React.Dispatch<React.SetStateAction<T>>
}

Input.Form = <T,>({ valueSetter, ...props }: FormInputProps<T>) => {
  // const onChange = (evt: React.FormEvent<HTMLFormElement>) => {
  //   const data = { } as FormDataBase
  //   // Typescript is wrong about the inputs to URLSearchParams.
  //   // @ts-ignore
  //   for (const [key, value] of new URLSearchParams(new FormData(evt.currentTarget))) {
  //     data[key] = value
  //   }
  //   setter(data as T)
  // }

  const onChangeOriginal = props.onChange
  props.onChange = (evt: React.FormEvent<HTMLFormElement>) => {
    // Call the provided one if needed.
    if (onChangeOriginal) {
      onChangeOriginal(evt)
      if (evt.defaultPrevented) {
        return
      }
    }

    if (valueSetter !== undefined) {
      const elm = evt.target as HTMLFormElement
      const key = elm.name
      let value = elm.value
      if (value === "") {
        value = undefined
      }
      if (elm.type === "checkbox") {
        value = elm.checked
      } else if (elm.dataset.inputType === "number" && value) {
        value = parseInt(value, 10)
      }

      valueSetter((state: T) => {
        return { ...state, [key]: value }
      })
    }
  }

  return <Form onSubmit={evt => evt.preventDefault()} {...props} />
}
