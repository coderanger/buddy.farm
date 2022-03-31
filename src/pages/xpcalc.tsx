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
  level: number
  xp: number
}

interface FishingXpCalcProps {
  locations: Location[]
  settings: Settings
  xp: number
}

const FishingXpCalc = ({ locations, settings, xp }: FishingXpCalcProps) => {
  const [location, setLocation] = useState("10") // Default is LI.
  const [bait, setBait] = useState(1)
  const [event, setEvent] = useState(false)
  const [streak, setStreak] = useState<number | null>(null)
  const selectedLocation = locations.find(loc => loc.type === "fishing" && loc.jsonId === location)
  const xpPerHit = selectedLocation?.extra.xpPerHit
  const xpBonus = 1 + (parseInt(settings.primerFishing || "0", 10) / 100)
  const xpPerHitNet = ((75 + (xpPerHit || 0)) * xpBonus * (event ? 1.2 : 1))
  const xpPerHitManual = xpPerHitNet * (1 + ((streak || 0) / 1000)) * bait
  const manualFishes = xp / xpPerHitManual
  const fishPerNet = !!settings.reinforcedNetting ? 15 : 10
  const nets = xp / (xpPerHitNet * fishPerNet)
  const fishPerLargeNet = !!settings.reinforcedNetting ? 400 : 250
  const largeNets = xp / (xpPerHitNet * fishPerLargeNet)

  return <>
    <Input.Select id="location" label="Location" defaultValue={location} onChange={val => setLocation(val)}>
      {locations.filter(loc => loc.type === "fishing").sort((a, b) => parseInt(a.jsonId, 10) - parseInt(b.jsonId, 10)).map(loc => (
        <option key={loc.jsonId} value={loc.jsonId}>{loc.name}</option>
      ))}
    </Input.Select>
    <Input.Select id="bait" label="Bait" defaultValue={bait.toString()} onChange={val => setBait(parseInt(val, 10))}>
      <option value="1">Worms / Minnows / Mealworms</option>
      <option value="2">Grubs</option>
      <option value="3">Gummy Worms</option>
    </Input.Select>
    <Input.Text id="streak" label="Streak" placeholder="1000" pattern="^(\d{1,3}|1000)$" defaultValue={streak?.toString()} onChange={val => setStreak(val === "" ? null : parseInt(val, 10))} />
    <Input.Switch id="event" label="Event Bonus" defaultChecked={event} onChange={val => setEvent(val)} />
    <Input.Text id="remainingXp" label="Remaining XP" disabled={true} value={xp.toLocaleString()} />
    <Input.Text id="xpPerHit" label="Avg XP / Fish" disabled={true} value={xpPerHitManual.toLocaleString()} />
    <Input.Text id="manual" label="Manual Fishes" disabled={true} value={Math.ceil(manualFishes).toLocaleString()} />
    <Input.Text id="nets" label="Nets" disabled={true} value={Math.ceil(nets).toLocaleString()} />
    <Input.Text id="largeNets" label="Large Nets" disabled={true} value={Math.ceil(largeNets).toLocaleString()} />
  </>
}

interface ExploringXpCalcProps {
  locations: Location[]
  settings: Settings
  xp: number
}

const ExploringXpCalc = ({ locations, settings, xp }: ExploringXpCalcProps) => {
  const [location, setLocation] = useState("10") // Default is WC.
  const [event, setEvent] = useState(false)
  const selectedLocation = locations.find(loc => loc.type === "explore" && loc.jsonId === location)
  const xpPerHit = !!settings.ironDepot ? selectedLocation?.extra.xpPerHitIronDepot : selectedLocation?.extra.xpPerHit
  const xpBonus = 1 + (parseInt(settings.primerExploring || "0", 10) / 100)
  const xpPerHitTrue = ((125 + (xpPerHit || 0)) * xpBonus * (event ? 1.2 : 1))
  const explores = xp / xpPerHitTrue
  const wanderer = parseInt(settings.wanderer || "0", 10) / 100
  const staminaPerExplore = 1 - wanderer
  const stamina = explores * staminaPerExplore
  const itemsPerLem = !!settings.lemonSqueezer ? 20 : 10
  // TODO: Check if the event bonus actually works on lemonade.
  const xpPerLemonade = (5000 + (itemsPerLem * (xpPerHit || 0))) * (event ? 1.2 : 1)
  const lemonade = xp / xpPerLemonade


  return <>
    <Input.Select id="location" label="Location" defaultValue={location} onChange={val => setLocation(val)}>
      {locations.filter(loc => loc.type === "explore").sort((a, b) => parseInt(a.jsonId, 10) - parseInt(b.jsonId, 10)).map(loc => (
        <option key={loc.jsonId} value={loc.jsonId}>{loc.name}</option>
      ))}
    </Input.Select>
    <Input.Switch id="event" label="Event Bonus" defaultChecked={event} onChange={val => setEvent(val)} />
    <Input.Text id="remainingXp" label="Remaining XP" disabled={true} value={xp.toLocaleString()} />
    <Input.Text id="xpPerHit" label="Avg XP / Explore" disabled={true} value={xpPerHitTrue.toLocaleString()} />
    <Input.Text id="explores" label="Explores" disabled={true} value={Math.ceil(explores).toLocaleString()} />
    <Input.Text id="stamina" label="Stamina" disabled={true} value={Math.ceil(stamina).toLocaleString()} />
    <Input.Text id="oj" label="OJ" disabled={true} value={Math.ceil(stamina / 100).toLocaleString()} />
    <Input.Text id="lem" label="Lemonade" disabled={true} value={Math.ceil(lemonade).toLocaleString()} />
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
          defaultValue={current ? current.toString() : ""}
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
      defaultValue={target ? target.toString() : ""}
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

      xpCurve: allXpJson {
        nodes {
          level
          xp
        }
      }
    }
  `)

  const ctx = useContext(GlobalContext)
  const [xp, setXp] = useState(0)
  const [skill, setSkill] = useState("exploring")

  const xpMap = [0]
  for (const c of xpCurve.nodes) {
    xpMap.push(c.xp)
  }

  const skillCalc = skill === "exploring" ?
    <ExploringXpCalc locations={locations.nodes} xp={xp} settings={ctx.settings} /> :
    <FishingXpCalc locations={locations.nodes} xp={xp} settings={ctx.settings} />

  return <Calculator pageTitle="XP Calculator">
    <LevelInput setXp={setXp} xpMap={xpMap} />
    <Input.Select id="skill" label="Skill" defaultValue={skill} onChange={val => setSkill(val)}>
      <option value="exploring">Exploring</option>
      <option value="fishing">Fishing</option>
    </Input.Select>
    {skillCalc}
  </Calculator>
}
