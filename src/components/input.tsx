import React from 'react'
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

interface InputProps {
  id: string
  label: string
  children: JSX.Element[] | JSX.Element
}

export const Input = ({ id, label, children }: InputProps) => (
  <Form.Group as={Row} className="mb-3" controlId={id}>
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
      onChange={evt => onChange && onChange(evt.target.value === "on")}
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
  onChange?: (value: string) => void
}

Input.Text = ({ id, label, placeholder, after, value, defaultValue, disabled, onChange }: TextInputProps) => (
  <Input id={id} label={label}>
    <InputGroup>
      <Form.Control
        name={id}
        placeholder={placeholder}
        value={value}
        defaultValue={defaultValue}
        onChange={evt => onChange && onChange(evt.target.value)}
        disabled={disabled}
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
