import React from 'react'
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import Layout from '../components/layout'
import { useSettings, Settings } from '../hooks/settings'
interface SettingProps {
  id: string
  label: string
  children: JSX.Element[] | JSX.Element
}

const Setting = ({ id, label, children }: SettingProps) => (
  <Form.Group as={Row} className="mb-3" controlId={id}>
    <Form.Label column sm={2}>{label}</Form.Label>
    <Col sm={10}>
      {children}
    </Col>
  </Form.Group>
)

interface SwitchSettingProps {
  id: string
  label: string
  settings: Settings
}

const SwitchSetting = ({ id, label, settings }: SwitchSettingProps) => (
  <Setting id={id} label={label}>
    <Form.Check
      css={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", "& input": { marginTop: 0 } }}
      type="switch"
      name={id}
      defaultChecked={!!settings[id]}
    />
  </Setting>
)

interface TextSettingProps {
  id: string
  label: string
  placeholder: string
  after?: string
  settings: Settings
}

const TextSetting = ({ id, label, placeholder, after, settings }: TextSettingProps) => (
  <Setting id={id} label={label}>
    <InputGroup>
      <Form.Control
        name={id}
        placeholder={placeholder}
        defaultValue={settings[id]}
      />
      {after && <InputGroup.Text>{after}</InputGroup.Text>}
    </InputGroup>
  </Setting>
)

interface SelectSettingProps {
  id: string
  label: string
  settings: Settings
  children: JSX.Element[] | JSX.Element
}

const SelectSetting = ({ id, label, settings, children }: SelectSettingProps) => (
  <Setting id={id} label={label}>
    <Form.Select
      name={id}
      defaultValue={settings[id]}
    >
      {children}
    </Form.Select>
  </Setting>
)


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
        <SwitchSetting id="manualFishing" label="Manual Fishing" settings={settings} />
      </fieldset>
      <fieldset>
        <legend>Units</legend>
        <SelectSetting id="unitExploring" label="Exploring" settings={settings}>
          <option value="">Explores</option>
          <option value="stamina">Stamina</option>
          <option value="oj">Orange Juice</option>
        </SelectSetting>
        <SelectSetting id="unitFishing" label="Fishing" settings={settings}>
          <option value="">Fishes</option>
          <option value="nets">Fishing Nets</option>
          <option value="largeNets">Large Nets</option>
        </SelectSetting>
        <SelectSetting id="unitFarming" label="Farming" settings={settings}>
          <option value="">Plot Harvests</option>
          <option value="harvestAll">Harvest Alls</option>
        </SelectSetting>
        <TextSetting id="cropRows" label="Crop Rows" placeholder='2' settings={settings} />
      </fieldset>
      <fieldset>
        <legend>Perks</legend>
        <SwitchSetting id="ironDepot" label="Iron Depot" settings={settings} />
        <TextSetting id="wanderer" label="Wanderer" placeholder='0' after="%" settings={settings} />
        <SwitchSetting id="lemonSqueezer" label="Lemon Squeezer" settings={settings} />
        <SwitchSetting id="reinforcedNetting" label="Reinforced Netting" settings={settings} />
      </fieldset>
    </Form>
  </Layout>
}
