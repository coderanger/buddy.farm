import React, { useContext } from 'react'
import Col from 'react-bootstrap/Col'
import Form, { FormProps } from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Row from 'react-bootstrap/Row'
import Tooltip from 'react-bootstrap/Tooltip'

type InputTypes = undefined | "number"

interface InputContextValues {
  id: string
}

const InputContext = React.createContext({ id: "" } as InputContextValues)

interface InputProps extends Omit<React.HTMLAttributes<HTMLElement>, "onChange"> {
  id: string
  label: string
  tooltip?: React.ReactNode
  children: React.ReactNode
}

export const Input = ({ id, label, tooltip, children, ...props }: InputProps) => {
  let content = children
  if (tooltip) {
    if (!React.isValidElement(content)) {
      throw `Tooltips only work with single element children`
    }
    content = <OverlayTrigger overlay={<Tooltip>{tooltip}</Tooltip>}>{content}</OverlayTrigger>
  }
  return <InputContext.Provider value={{ id }}>
    <Form.Group as={Row} className="mb-3" controlId={id} {...props}>
      <Form.Label column sm={2}>{label}</Form.Label>
      <Col sm={10}>
        {content}
      </Col>
    </Form.Group>
  </InputContext.Provider>
}

export interface SwitchInputProps extends Omit<InputProps, "children"> {
  defaultChecked: boolean
  disabled?: boolean
  onChange?: (value: boolean) => void
}

Input.Switch = ({ id, defaultChecked, disabled, onChange, ...props }: SwitchInputProps) => (
  <Input id={id} {...props}>
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

export interface TextInputProps extends Omit<InputProps, "children"> {
  placeholder?: string
  after?: string | JSX.Element
  value?: string
  defaultValue?: string
  disabled?: boolean
  pattern?: string
  type?: InputTypes
  onChange?: (value: string) => void
}

Input.Text = ({ id, placeholder, after, value, defaultValue, disabled, pattern, type, onChange, ...props }: TextInputProps) => (
  <Input id={id} {...props}>
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

export interface SelectInputProps extends InputProps {
  defaultValue: string
  type?: InputTypes
  onChange?: (value: string) => void
}

Input.Select = ({ id, defaultValue, type, onChange, children, ...props }: SelectInputProps) => (
  <Input id={id} {...props}>
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
