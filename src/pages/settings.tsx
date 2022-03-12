import React from 'react'
import Form from 'react-bootstrap/Form'

import Layout from '../components/layout'
import { useSettings } from '../hooks/settings'

export default () => {
  const [settings, setSettings] = useSettings()
  const formRef = React.createRef<HTMLFormElement>()
  const onChange = () => {
    if (formRef.current === null) {
      return
    }
    const data: { [key: string]: string } = {}
    // Typescript is wrong about the inputs to URLSearchParams.
    // @ts-ignore
    for (const [key, value] of new URLSearchParams(new FormData(formRef.current))) {
      data[key] = value
    }
    setSettings(data)
  }
  return <Layout pageTitle="Settings">
    <Form ref={formRef} onChange={onChange}>
      <fieldset>
        <legend>Settings</legend>
        <Form.Group className="mb-3">
          <Form.Check
            type="switch"
            id="manualFishing"
            name="manualFishing"
            label="Show manual fishing data"
            defaultChecked={!!settings.manualFishing}
          />
        </Form.Group>
      </fieldset>
      <fieldset>
        <legend>Perks</legend>
        <Form.Group className="mb-3">
          <Form.Check
            type="switch"
            id="ironDepot"
            name="ironDepot"
            label="Iron Depot"
            defaultChecked={!!settings.ironDepot}
          />
        </Form.Group>
      </fieldset>
    </Form>
  </Layout>
}
