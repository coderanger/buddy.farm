import React, { useContext } from 'react'
import Form, { FormProps } from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

type InputTypes = undefined | "number"

interface InputContextValues {
  id: string
}

const InputContext = React.createContext({ id: "" } as InputContextValues)

interface InputProps extends React.HTMLAttributes<HTMLElement> {
  id: string
  label: string
  children: JSX.Element[] | JSX.Element
}

export const Input = ({ id, label, children, ...props }: InputProps) => (
  <InputContext.Provider value={{ id }}>
    <Form.Group as={Row} className="mb-3" controlId={id} {...props}>
      <Form.Label column sm={2}>{label}</Form.Label>
      <Col sm={10}>
        {children}
      </Col>
    </Form.Group>
  </InputContext.Provider>
)

export interface SwitchInputProps {
  id: string
  label: string
  defaultChecked: boolean
  disabled?: boolean
  onChange?: (value: boolean) => void
}

Input.Switch = ({ id, label, defaultChecked, disabled, onChange }: SwitchInputProps) => (
  <Input id={id} label={label}>
    <Form.Check
      css={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", "& input": { marginTop: 0 } }}
      type="switch"
      name={id}
      defaultChecked={defaultChecked}
      disabled={disabled}
      onChange={evt => onChange && onChange(evt.target.checked)}
    />
  </Input>
)

export interface TextInputProps {
  id: string
  label: string
  placeholder?: string
  after?: string | JSX.Element
  value?: string
  defaultValue?: string
  disabled?: boolean
  pattern?: string
  type?: InputTypes
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
      {typeof after === "string" ? <InputGroup.Text>{after}</InputGroup.Text> : after}
    </InputGroup>
  </Input>
)

export interface SelectInputProps {
  id: string
  label: string
  defaultValue: string
  type?: InputTypes
  onChange?: (value: string) => void
  children: JSX.Element[] | JSX.Element
}

Input.Select = ({ id, label, defaultValue, type, onChange, children }: SelectInputProps) => (
  <Input id={id} label={label}>
    <Form.Select
      name={id}
      defaultValue={defaultValue}
      data-input-type={type}
      onChange={evt => onChange && onChange(evt.target.value)}
    >
      {children}
    </Form.Select>
  </Input>
)


export interface RadioButtonProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string
  data: string
  label: string
}

Input.RadioButton = ({ label, data, value, ...props }: RadioButtonProps) => {
  const ctx = useContext(InputContext)
  return <>
    <input type="radio" className="btn-check" name={ctx.id} id={`${ctx.id}-${value}`} autoComplete="off" value={value} defaultChecked={data === value} {...props} />
    <label className="btn btn-outline-primary" htmlFor={`${ctx.id}-${value}`}>{label}</label>
  </>
}

interface FormInputProps<T> extends FormProps {
  valueSetter?: React.Dispatch<React.SetStateAction<T>>
}

Input.Form = <T,>({ valueSetter, ...props }: FormInputProps<T>) => {
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
