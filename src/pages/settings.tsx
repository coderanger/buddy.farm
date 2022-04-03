import React, { useState, useContext } from 'react'
import Form from 'react-bootstrap/Form'

import Layout from '../components/layout'
import { Settings } from '../hooks/settings'
import { Input } from "../components/input"
import { GlobalContext } from '../utils/context'

interface SwitchSettingProps {
  id: string
  label: string
  settings: Settings
}

const SwitchSetting = ({ id, label, settings }: SwitchSettingProps) => (
  <Input.Switch id={id} label={label} defaultChecked={!!settings[id]} />
)

interface TextSettingProps {
  id: string
  label: string
  placeholder: string
  after?: string
  settings: Settings
}

const TextSetting = ({ id, label, placeholder, after, settings }: TextSettingProps) => (
  <Input.Text id={id} label={label} placeholder={placeholder} after={after} defaultValue={settings[id]} />
)

interface SelectSettingProps {
  id: string
  label: string
  settings: Settings
  children: JSX.Element[] | JSX.Element
}

const SelectSetting = ({ id, label, settings, children }: SelectSettingProps) => (
  <Input.Select id={id} label={label} defaultValue={settings[id]}>
    {children}
  </Input.Select>
)

export default () => {
  const ctx = useContext(GlobalContext)
  const settings = ctx.settings
  const [secretKnock, setSecretKnock] = useState(0)
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
    ctx.setSettings(data)
  }

  const secretKnockEnabled = secretKnock >= 3
  return <Layout pageTitle="Settings" settingsBack={true}>
    <Form ref={formRef} onChange={onChange} onSubmit={evt => evt.preventDefault()}>
      <fieldset>
        <legend onClick={() => setSecretKnock(secretKnock + 1)}>Settings</legend>
        <SwitchSetting id="darkMode" label="Dark Mode" settings={settings} />
        <SwitchSetting id="manualFishing" label="Manual Fishing" settings={settings} />
        <SwitchSetting id="oldQuests" label="Show Unavailable Quests" settings={settings} />
        <div className={secretKnockEnabled ? "" : "d-none"}>
          <SwitchSetting id="staffMode" label="Staff Mode" settings={settings} />
        </div>
      </fieldset>
      <fieldset>
        <legend>Units</legend>
        <SelectSetting id="unitExploring" label="Exploring" settings={settings}>
          <option value="">Explores</option>
          <option value="stamina">Stamina</option>
          <option value="oj">Orange Juice</option>
          <option value="lemonade">Lemonade</option>
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
        <TextSetting id="primerFarming" label="Bonus Farming XP" placeholder='0' after="%" settings={settings} />
        <TextSetting id="primerFishing" label="Bonus Fishing XP" placeholder='0' after="%" settings={settings} />
        <TextSetting id="primerCrafting" label="Bonus Crafting XP" placeholder='0' after="%" settings={settings} />
        <TextSetting id="primerExploring" label="Bonus Exploring XP" placeholder='0' after="%" settings={settings} />
        <TextSetting id="resourceSaver" label="Resource Saver" placeholder='20' after="%" settings={settings} />
      </fieldset>
    </Form>
  </Layout>
}
