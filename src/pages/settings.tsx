import React, { useContext, useState } from 'react'

import { Input, SwitchInputProps, TextInputProps, SelectInputProps } from '../components/input'
import Layout from '../components/layout'
import { Settings } from '../hooks/settings'
import { GlobalContext } from '../utils/context'

interface SwitchSettingProps extends Omit<SwitchInputProps, "defaultChecked"> {
  settings: Settings
}

const SwitchSetting = ({ settings, ...props }: SwitchSettingProps) => (
  <Input.Switch defaultChecked={!!settings[props.id]} {...props} />
)

interface TextSettingProps extends Omit<TextInputProps, "defaultValue"> {
  settings: Settings
}

const TextSetting = ({ settings, ...props }: TextSettingProps) => (
  <Input.Text defaultValue={settings[props.id]} {...props} />
)

interface SelectSettingProps extends Omit<SelectInputProps, "defaultValue"> {
  id: string
  label: string
  settings: Settings
  children: JSX.Element[] | JSX.Element
}

const SelectSetting = ({ settings, ...props }: SelectSettingProps) => (
  <Input.Select defaultValue={settings[props.id]} {...props} />
)

export default () => {
  const ctx = useContext(GlobalContext)
  const settings = ctx.settings
  const [secretKnock, setSecretKnock] = useState(0)

  const secretKnockEnabled = secretKnock >= 3
  return <Layout pageTitle="Settings" settingsBack={true}>
    <Input.Form valueSetter={ctx.setSettings}>
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
        <TextSetting id="cropRows" label="Crop Rows" placeholder='2' type="number" settings={settings} />
      </fieldset>
      <fieldset>
        <legend>Perks</legend>
        <SwitchSetting id="ironDepot" label="Iron Depot" settings={settings} />
        <TextSetting id="wanderer" label="Wanderer" placeholder='0' after="%" type="number" settings={settings} />
        <SwitchSetting id="lemonSqueezer" label="Lemon Squeezer" settings={settings} />
        <SwitchSetting id="reinforcedNetting" label="Reinforced Netting" settings={settings} />
        <SwitchSetting id="fishingTrawl" label="Fishing Trawl" settings={settings} />
        <TextSetting id="primerFarming" label="Bonus Farming XP" placeholder='0' type="number" after="%" settings={settings} />
        <TextSetting id="primerFishing" label="Bonus Fishing XP" placeholder='0' type="number" after="%" settings={settings} />
        <TextSetting id="primerCrafting" label="Bonus Crafting XP" placeholder='0' type="number" after="%" settings={settings} />
        <TextSetting id="primerExploring" label="Bonus Exploring XP" placeholder='0' type="number" after="%" settings={settings} />
        <TextSetting id="resourceSaver" label="Resource Saver" placeholder='20' type="number" after="%" settings={settings} />
      </fieldset>
    </Input.Form>
  </Layout>
}
