import React, { useContext, useEffect, useState } from "react"

import { Calculator } from "../components/calculator"
import { Input } from "../components/input"
import { useLocations } from "../hooks/locations"

const DEFAULT_TREES = 2100

interface OrchardData {
  appleTrees: number
  orangeTrees: number
  lemonTrees: number
  maxInventory: number
  forester: number
  resourceSaver: number
  wanderer: number
  lemonSqueezer: boolean
  cinnamonSticks: boolean
  location: string
  makeCiders: boolean
  makePalmers: boolean
}

const DEFAULT_DATA: OrchardData = {
  appleTrees: DEFAULT_TREES,
  orangeTrees: DEFAULT_TREES,
  lemonTrees: DEFAULT_TREES,
  maxInventory: Math.ceil(DEFAULT_TREES * 1.3),
  forester: 30,
  resourceSaver: 20,
  wanderer: 33,
  lemonSqueezer: true,
  cinnamonSticks: false,
  location: "Whispering Creek",
  makeCiders: false,
  makePalmers: true,
}

export default () => {
  const locations = useLocations("explore")
  const [data, values, setValues] = Calculator.useData(DEFAULT_DATA, (settings) => ({
    forester: settings.forester ? parseInt(settings.forester, 10) : undefined,
    resourceSaver: settings.resourceSaver ? parseInt(settings.resourceSaver, 10) : undefined,
    wanderer: settings.wanderer ? parseInt(settings.wanderer, 10) : undefined,
    lemonSqueezer: settings.lemonSqueezer === undefined ? undefined : !!settings.lemonSqueezer,
    cinnamonSticks: settings.cinnamonSticks === undefined ? undefined : !!settings.cinnamonSticks,
  }))

  // Calculations.
  const resourceSaverMul = 1 / (1 - data.resourceSaver / 100)
  const foresterMul = 1 + data.forester / 100
  const wandererMul = 1 - data.wanderer / 100
  const apples = Math.min(Math.round(data.appleTrees * foresterMul), data.maxInventory)
  const oranges = Math.min(Math.round(data.orangeTrees * foresterMul), data.maxInventory)
  const lemons = Math.min(Math.round(data.lemonTrees * foresterMul), data.maxInventory)
  const appleStamina = data.makeCiders ? 0 : apples * 15
  const ciders = data.makeCiders ? Math.floor((apples / 40) * resourceSaverMul) : 0
  const ciderStamina = Math.round(ciders * (data.cinnamonSticks ? 1250 : 1000) * wandererMul)
  const availableOranges = oranges - (data.makeCiders ? Math.floor(apples / 40) : 0)
  const oj = Math.floor((availableOranges / 6) * resourceSaverMul)
  const ojStamina = oj * 100
  const lemonade = Math.floor((lemons / 6) * resourceSaverMul)
  const palmers = Math.floor((lemonade / 20) * resourceSaverMul)
  const lemonadeItems = data.makePalmers
    ? palmers * (data.lemonSqueezer ? 500 : 250)
    : lemonade * (data.lemonSqueezer ? 20 : 10)
  const lemonadeExplores = Math.round(lemonadeItems / (locations[data.location].baseDropRate || 1))
  const explores = Math.floor((appleStamina + ojStamina) / wandererMul) + lemonadeExplores
  const stamina = appleStamina + ojStamina + Math.floor(lemonadeExplores * wandererMul)

  return (
    <Calculator pageTitle="Orchard Calculator" valueSetter={setValues}>
      <Input.Text
        id="appleTrees"
        label="Apple Trees"
        placeholder={DEFAULT_TREES.toString()}
        pattern="^\d{1,4}$"
        type="number"
      />
      <Input.Text
        id="orangeTrees"
        label="Orange Trees"
        placeholder={DEFAULT_TREES.toString()}
        pattern="^\d{1,4}$"
        type="number"
      />
      <Input.Text
        id="lemonTrees"
        label="Lemon Trees"
        placeholder={DEFAULT_TREES.toString()}
        pattern="^\d{1,4}$"
        type="number"
      />
      <Input.Text
        id="maxInventory"
        label="Max Inventory"
        placeholder={DEFAULT_DATA.maxInventory.toString()}
        pattern="^\d{3,100}$"
        type="number"
      />
      <Input.Select id="location" label="Location" defaultValue={data.location}>
        {Object.values(locations).map((l) => (
          <option key={l.name} value={l.name}>
            {l.name}
          </option>
        ))}
      </Input.Select>
      <Input.Switch id="makeCiders" label="Make Ciders" defaultChecked={data.makeCiders} />
      <Input.Switch
        id="makePalmers"
        label="Make Arnold Palmers"
        defaultChecked={data.makePalmers}
      />

      <Calculator.Perks>
        <Input.Text
          id="forester"
          label="Forester"
          placeholder="30"
          after="%"
          defaultValue={values.forester?.toString()}
          pattern="^\d{1,2}$"
          type="number"
        />
        <Input.Text
          id="resourceSaver"
          label="Resource Saver"
          placeholder="20"
          after="%"
          defaultValue={values.resourceSaver?.toString()}
          pattern="^\d{1,2}$"
          type="number"
        />
        <Input.Text
          id="wanderer"
          label="Wanderer"
          placeholder="33"
          after="%"
          defaultValue={values.wanderer?.toString()}
          pattern="^\d{1,2}$"
          type="number"
        />
        <Input.Switch
          id="lemonSqueezer"
          label="Lemon Squeezer"
          defaultChecked={data.lemonSqueezer}
        />
        <Input.Switch
          id="cinnamonSticks"
          label="Cinnamon Sticks"
          defaultChecked={data.cinnamonSticks}
        />
      </Calculator.Perks>
      <Input.Text id="apples" label="Apples" disabled={true} value={apples.toLocaleString()} />
      {data.makeCiders && (
        <Input.Text
          id="ciders"
          label="Ciders"
          disabled={true}
          value={ciders.toLocaleString()}
          tooltip={`${ciderStamina.toLocaleString()} Stamina`}
        />
      )}
      <Input.Text id="oj" label="OJ" disabled={true} value={oj.toLocaleString()} />
      <Input.Text
        id="lemOrPalmers"
        label={data.makePalmers ? "Arnold Palmers" : "Lemonade"}
        disabled={true}
        value={(data.makePalmers ? palmers : lemonade).toLocaleString()}
      />
      <Input.Text
        id="explores"
        label="Explores"
        disabled={true}
        value={explores.toLocaleString()}
      />
      <Input.Text id="stamina" label="Stamina" disabled={true} value={stamina.toLocaleString()} />
    </Calculator>
  )
}
