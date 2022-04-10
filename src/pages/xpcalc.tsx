import { graphql, useStaticQuery } from 'gatsby'
import React, { useContext, useEffect, useState } from 'react'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'

import { Calculator } from '../components/calculator'
import { Input } from '../components/input'
import { Settings } from '../hooks/settings'
import { GlobalContext } from '../utils/context'

interface Location {
  name: string
  jsonId: string
  image: string
  type: string
  extra: {
    xpPerHit: number
    xpPerHitIronDepot: number
  }
}

interface Xp {
  xp: number
}

interface XpData {
  isXp: boolean
  current: number
  target: number
  skill: "exploring" | "fishing" | "farming"
  event: boolean
  // Exploring data.
  exploringLocation: string
  // Exploring settings.
  primerExploring: number
  ironDepot: boolean
  wanderer: number
  lemonSqueezer: boolean
  // Fishing data.
  fishingLocation: string
  bait: number
  streak: number
  // Fishing settings.
  primerFishing: number
  reinforcedNetting: boolean
  // Farming data.
  cropXp: number
  gjPerDay: number
  // Farming settings.
  primerFarming: number
  cropRows: number
}

const DEFAULT_DATA: XpData = {
  isXp: false,
  current: 1,
  target: 99,
  skill: "exploring",
  event: false,
  exploringLocation: "10", // Whispering Creek
  primerExploring: 0,
  ironDepot: false,
  wanderer: 33,
  lemonSqueezer: true,
  fishingLocation: "10", // Large Island
  bait: 1,
  streak: 0,
  primerFishing: 0,
  reinforcedNetting: true,
  cropXp: 90720, // Beets
  gjPerDay: 2,
  primerFarming: 0,
  cropRows: 9,
}

interface XpCalcProps {
  xp: number
  data: XpData
  values: Partial<XpData>
}

interface LocationXpCalcProps extends XpCalcProps {
  locations: Location[]
}

const FishingXpCalc = ({ locations, xp, data, values }: LocationXpCalcProps) => {
  const selectedLocation = locations.find(loc => loc.type === "fishing" && loc.jsonId === data.fishingLocation)
  const xpPerHit = selectedLocation?.extra.xpPerHit
  const xpBonus = 1 + (data.primerFishing / 100)
  const xpPerHitNet = ((75 + (xpPerHit || 0)) * xpBonus * (data.event ? 1.2 : 1))
  const xpPerHitManual = xpPerHitNet * (1 + (data.streak / 1000)) * data.bait
  const manualFishes = xp / xpPerHitManual
  const fishPerNet = data.reinforcedNetting ? 15 : 10
  const nets = xp / (xpPerHitNet * fishPerNet)
  const fishPerLargeNet = data.reinforcedNetting ? 400 : 250
  const largeNets = xp / (xpPerHitNet * fishPerLargeNet)

  return <>
    <Input.Select id="fishingLocation" label="Location" defaultValue={data.fishingLocation}>
      {locations.filter(loc => loc.type === "fishing").sort((a, b) => parseInt(a.jsonId, 10) - parseInt(b.jsonId, 10)).map(loc => (
        <option key={loc.jsonId} value={loc.jsonId}>{loc.name}</option>
      ))}
    </Input.Select>
    <Input.Select id="bait" label="Bait" defaultValue={data.bait.toString()}>
      <option value="1">Worms / Minnows / Mealworms</option>
      <option value="2">Grubs</option>
      <option value="3">Gummy Worms</option>
    </Input.Select>
    <Input.Text id="streak" label="Streak" placeholder="1000" pattern="^(\d{1,3}|1000)$" type="number" defaultValue={values.streak?.toString()} />
    <Input.Switch id="event" label="Event Bonus" defaultChecked={data.event} />

    <Calculator.Perks>
      <Input.Text
        id="primerFishing"
        label="Bonus Fishing XP"
        placeholder="0"
        after="%"
        defaultValue={values.primerFishing?.toString()}
        pattern="^\d{1,2}$"
        type="number"
      />
      <Input.Switch
        id="reinforcedNetting"
        label="Reinforced Netting"
        defaultChecked={data.reinforcedNetting}
      />
    </Calculator.Perks>

    <Input.Text id="remainingXp" label="Remaining XP" disabled={true} value={xp.toLocaleString()} />
    <Input.Text id="xpPerHit" label="Avg XP / Fish" disabled={true} value={xpPerHitManual.toLocaleString()} />
    <Input.Text id="manual" label="Manual Fishes" disabled={true} value={Math.ceil(manualFishes).toLocaleString()} />
    <Input.Text id="nets" label="Nets" disabled={true} value={Math.ceil(nets).toLocaleString()} />
    <Input.Text id="largeNets" label="Large Nets" disabled={true} value={Math.ceil(largeNets).toLocaleString()} />
  </>
}

const ExploringXpCalc = ({ locations, xp, data, values }: LocationXpCalcProps) => {
  const selectedLocation = locations.find(loc => loc.type === "explore" && loc.jsonId === data.exploringLocation)
  const xpPerHit = data.ironDepot ? selectedLocation?.extra.xpPerHitIronDepot : selectedLocation?.extra.xpPerHit
  const xpBonus = 1 + (data.primerExploring / 100)
  const xpPerHitTrue = ((125 + (xpPerHit || 0)) * xpBonus * (data.event ? 1.2 : 1))
  const explores = xp / xpPerHitTrue
  const wanderer = data.wanderer / 100
  const staminaPerExplore = 1 - wanderer
  const stamina = explores * staminaPerExplore
  const itemsPerLem = data.lemonSqueezer ? 20 : 10
  // TODO: Check if the event bonus actually works on lemonade.
  const xpPerLemonade = (5000 + (itemsPerLem * (xpPerHit || 0))) * (data.event ? 1.2 : 1)
  const lemonade = xp / xpPerLemonade

  return <>
    <Input.Select id="exploringLocation" label="Location" defaultValue={data.exploringLocation}>
      {locations.filter(loc => loc.type === "explore").sort((a, b) => parseInt(a.jsonId, 10) - parseInt(b.jsonId, 10)).map(loc => (
        <option key={loc.jsonId} value={loc.jsonId}>{loc.name}</option>
      ))}
    </Input.Select>
    <Input.Switch id="event" label="Event Bonus" defaultChecked={data.event} />

    <Calculator.Perks>
      <Input.Text
        id="primerExploring"
        label="Bonus Exploring XP"
        placeholder="0"
        after="%"
        defaultValue={values.primerExploring?.toString()}
        pattern="^\d{1,2}$"
        type="number"
      />
      <Input.Text
        id="wanderer"
        label="Wanderer"
        placeholder='33'
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
        id="ironDepot"
        label="Iron Depot"
        defaultChecked={data.ironDepot}
      />
    </Calculator.Perks>

    <Input.Text id="remainingXp" label="Remaining XP" disabled={true} value={xp.toLocaleString()} />
    <Input.Text id="xpPerHit" label="Avg XP / Explore" disabled={true} value={xpPerHitTrue.toLocaleString()} />
    <Input.Text id="explores" label="Explores" disabled={true} value={Math.ceil(explores).toLocaleString()} />
    <Input.Text id="stamina" label="Stamina" disabled={true} value={Math.ceil(stamina).toLocaleString()} />
    <Input.Text id="oj" label="OJ" disabled={true} value={Math.ceil(stamina / 100).toLocaleString()} />
    <Input.Text id="lem" label="Lemonade" disabled={true} value={Math.ceil(lemonade).toLocaleString()} />
  </>
}

const FarmingXpCalc = ({ xp, data, values }: XpCalcProps) => {
  const xpBonus = 1 + (data.primerFarming / 100)
  const xpPerSeed = (data.cropXp + 15) * xpBonus * (data.event ? 1.2 : 1)
  const seeds = xp / xpPerSeed
  const harvests = seeds / (data.cropRows * 4)
  const days = harvests / data.gjPerDay

  return <>
    <Input id="note" label="Note">
      <div className="mb-1">
        You will get the vast majority of your Farming XP from crop rows and farm buildings. All together
        the available buildings and the crop rows through the one which costs 1 billion silver (the 9th row) will
        get you to around level 95. Don't worry about optimal XP from growing crops normally, it's such a small
        amount compared to rows/buildings or late game crops with Grape Juice that it doesn't really affect things.
      </div>
      <div>
        This calculator is only to help with the last bits of XP when already at a high level.
      </div>
    </Input>
    <Input.Select id="cropXp" label="Crop" defaultValue={data.cropXp.toString()}>
      <option value="40320">Cotton (level 70)</option>
      <option value="60480">Sunflowers (level 80)</option>
      <option value="90720">Beets (level 90)</option>
    </Input.Select>
    <Input.Text id="gjPerDay" label="GJ / Day" placeholder="2" type="number" defaultValue={values.gjPerDay?.toString()} />
    <Input.Switch id="event" label="Event Bonus" defaultChecked={data.event} />

    <Calculator.Perks>
      <Input.Text
        id="primerFarming"
        label="Bonus Farming XP"
        placeholder="0"
        after="%"
        defaultValue={values.primerFarming?.toString()}
        pattern="^\d{1,2}$"
        type="number"
      />
      <Input.Text
        id="cropRows"
        label="Crop Rows"
        placeholder="9"
        defaultValue={values.cropRows?.toString()}
        pattern="^\d{1,2}$"
        type="number"
      />
    </Calculator.Perks>

    <Input.Text id="remainingXp" label="Remaining XP" disabled={true} value={xp.toLocaleString()} />
    <Input.Text id="seeds" label="Seeds" disabled={true} value={Math.ceil(seeds).toLocaleString()} />
    <Input.Text id="harvests" label="Harvests" disabled={true} value={Math.ceil(harvests).toLocaleString()} />
    <Input.Text id="days" label="Days" disabled={true} value={Math.ceil(days).toLocaleString()} />
  </>
}

interface LevelInputProps {
  setXp: (value: number) => void
  xpMap: number[]
}

const LevelInput = ({ setXp, xpMap }: LevelInputProps) => {
  const [isXp, setIsXp] = useState(false)
  const [current, setCurrent] = useState<number | null>(null)
  const [target, setTarget] = useState<number | null>(null)

  useEffect(() => {
    const currentXp = isXp ? (current || 0) : xpMap[current || 1]
    setXp(xpMap[target || 99] - currentXp)
  }, [isXp, current, target])

  return <>
    <Input id="current" label="Current">
      <InputGroup>
        <Button variant={isXp ? "outline-secondary" : "primary"} onClick={() => setIsXp(false)}>Level</Button>
        <Button variant={isXp ? "primary" : "outline-secondary"} onClick={() => setIsXp(true)}>XP</Button>
        <Form.Control
          placeholder={isXp ? "0" : "1"}
          onChange={evt => setCurrent(evt.target.value === "" ? null : parseInt(evt.target.value.replace(/,/g, ""), 10))}
          pattern={isXp ? "^[0-9,]+$" : "^\\d{1,2}$"}
          aria-label="Current level or XP"
        />
      </InputGroup>
    </Input>
    <Input.Text
      id="target"
      label="Target Level"
      placeholder="99"
      onChange={val => setTarget(val === "" ? null : parseInt(val, 10))}
      pattern="^\d{1,2}$"
    />
  </>
}

interface XpCalcQuery {
  locations: {
    nodes: Location[]
  }
  xpCurve: {
    nodes: Xp[]
  }
}

export default () => {
  const { locations, xpCurve }: XpCalcQuery = useStaticQuery(graphql`
    query {
      locations: allLocationsJson {
        nodes {
          name
          jsonId
          image
          type
          extra {
            xpPerHit
            xpPerHitIronDepot
          }
        }
      }

      xpCurve: allXpJson(sort: {fields: level}) {
        nodes {
          xp
        }
      }
    }
  `)

  // Combine inputs and defaults.
  const [data, values, setValues] = Calculator.useData(DEFAULT_DATA, (settings) => ({
    primerExploring: settings.primerExploring ? parseInt(settings.primerExploring, 10) : undefined,
    primerFishing: settings.primerFishing ? parseInt(settings.primerFishing, 10) : undefined,
    primerFarming: settings.primerFarming ? parseInt(settings.primerFarming, 10) : undefined,
    wanderer: settings.wanderer ? parseInt(settings.wanderer, 10) : undefined,
    lemonSqueezer: settings.lemonSqueezer === undefined ? undefined : !!settings.lemonSqueezer,
    reinforcedNetting: settings.reinforcedNetting === undefined ? undefined : !!settings.reinforcedNetting,
    cropRows: settings.cropRows ? parseInt(settings.cropRows, 10) : undefined,
  }))

  // Special handling for the total XP the user is looking for.
  // It's not a form value to it gets its own state.
  const [xp, setXp] = useState(0)
  const xpMap = [0]
  for (const c of xpCurve.nodes) {
    xpMap.push(c.xp)
  }

  return <Calculator pageTitle="XP Calculator" valueSetter={setValues}>
    <LevelInput setXp={setXp} xpMap={xpMap} />
    <Input.Select id="skill" label="Skill" defaultValue={data.skill}>
      <option value="exploring">Exploring</option>
      <option value="fishing">Fishing</option>
      <option value="farming">Farming</option>
    </Input.Select>
    {data.skill === "exploring" && <ExploringXpCalc locations={locations.nodes} xp={xp} data={data} values={values} />}
    {data.skill === "fishing" && <FishingXpCalc locations={locations.nodes} xp={xp} data={data} values={values} />}
    {data.skill === "farming" && <FarmingXpCalc xp={xp} data={data} values={values} />}
  </Calculator>
}
