import Layout from '../components/layout'
import Form from 'react-bootstrap/Form'
import { Link } from 'gatsby'
import React, { useState } from 'react'

import { Input } from '../components/input'

interface CalculatorProps<T> {
  pageTitle: string
  valueSetter?: React.Dispatch<React.SetStateAction<T>>
  children: JSX.Element[] | JSX.Element
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

  return <Layout pageTitle={pageTitle}>
    <h1>{pageTitle}</h1>
    <p>
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
