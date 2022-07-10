import { Link } from 'gatsby'
import React, { useContext, useEffect, useState } from 'react'
import Accordion from 'react-bootstrap/Accordion'
import Form from 'react-bootstrap/Form'

import { Input } from '../components/input'
import Layout from '../components/layout'
import { GlobalContext } from '../utils/context'
import { Settings } from "../hooks/settings"

interface CalculatorProps<T> {
  pageTitle: string
  valueSetter?: React.Dispatch<React.SetStateAction<T>>
  children: React.ReactNode
}

export const Calculator = <T,>({ pageTitle, valueSetter, children }: CalculatorProps<T>) => {
  const [validated, setValidated] = useState(false);

  const onChange = (evt: React.FormEvent<HTMLFormElement>) => {
    const form = evt.currentTarget
    if (form.checkValidity() === false) {
      evt.preventDefault()
      evt.stopPropagation()
    }
    setValidated(true)
  }

  return <Layout title={pageTitle}>
    <p css={{ "html.iframe &": { "display": "none" } }}>
      Ensure your perks are set correctly in <Link to="/settings/">Settings</Link> for maximum accuracy.
    </p>
    <Input.Form
      valueSetter={valueSetter}
      onSubmit={evt => evt.preventDefault()}
      onChange={onChange}
      noValidate validated={validated}
      css={{
        "&.was-validated *:valid": {
          borderColor: "#ced4da !important",
          backgroundImage: "none !important",
          "&:focus": {
            boxShadow: "0 0 0 0.25rem rgba(13, 110, 253, 0.25) !important",
          },
          "html.dark &": {
            borderColor: "#515151 !important",
          },
        },
        "&.was-validated .form-check-input:valid": {
          borderColor: "rgba(0, 0, 0, 0.25) !important",
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='-4 -4 8 8'%3e%3ccircle r='3' fill='rgba%280, 0, 0, 0.25%29'/%3e%3c/svg%3e") !important`,
          "&:checked": {
            backgroundColor: "#0d6efd !important",
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='-4 -4 8 8'%3e%3ccircle r='3' fill='%23fff'/%3e%3c/svg%3e") !important`,
          },
        },
      }}
    >
      {children}
    </Input.Form>
  </Layout>
}

interface CalculatorPerksProps {
  defaultOpen?: boolean
  children: JSX.Element | JSX.Element[]
}

Calculator.Perks = ({ defaultOpen, children }: CalculatorPerksProps) => {
  return <Accordion className="mb-3" defaultActiveKey={defaultOpen ? "0" : undefined}>
    <Accordion.Item eventKey="0">
      <Accordion.Header>Perks</Accordion.Header>
      <Accordion.Body css={{ "& *:last-child": { marginBottom: "0 !important" } }}>
        {children}
      </Accordion.Body>
    </Accordion.Item>
  </Accordion>
}

// Compile values and defaults to a single set of data.
const compileData = <T,>(values: Partial<T>, defaults: T) => {
  const data: T = { ...defaults }
  for (const key of Object.keys(values) as Array<keyof T>) {
    const value = values[key]
    if (value !== undefined) {
      (data[key] as any) = value
    }
  }
  return data as Readonly<T>
}

// Set up hooks for a calculator.
Calculator.useData = <T,>(defaults: T, settingsFn: (settings: Settings) => Partial<T>): [Readonly<T>, Partial<T>, React.Dispatch<React.SetStateAction<Partial<T>>>] => {
  const ctx = useContext(GlobalContext)
  const defaultValues = settingsFn(ctx.settings)
  const [values, setValues] = useState(defaultValues)
  for (const key in defaultValues) {
    useEffect(() => {
      ctx.setSetting(key as string, values[key])
    }, [values[key]])
  }
  return [compileData(values, defaults), values, setValues]
}
