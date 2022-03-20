import React from 'react'
import { graphql, useStaticQuery } from 'gatsby'
import { useSettings, Settings } from '../hooks/settings'
import Layout from '../components/layout'
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'
import Button from 'react-bootstrap/Button'
import { useState, useEffect } from 'react';
import { Input } from "../components/input"

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

interface ExploringXpCalcProps {
  locations: Location[]
  settings: Settings
  xp: number
}

const ExploringXpCalc = ({ locations, settings, xp }: ExploringXpCalcProps) => {
  const [location, setLocation] = useState("10") // Default is WC.
  const selectedLocation = locations.find(loc => loc.jsonId === location)
  const xpPerHit = !!settings.ironDepot ? selectedLocation?.extra.xpPerHitIronDepot : selectedLocation?.extra.xpPerHit
  const xpBonus = 1 + (parseInt(settings.primerExploring || "0", 10) / 100)
  const xpPerHitTrue = ((125 + (xpPerHit || 0)) * xpBonus)
  const explores = xp / xpPerHitTrue
  const wanderer = parseInt(settings.wanderer, 10) / 100
  const staminaPerExplore = 1 - wanderer
  const stamina = explores * staminaPerExplore

  return <>
    <Input.Select id="location" label="Location" defaultValue={location} onChange={val => setLocation(val)}>
      {locations.filter(loc => loc.type === "explore").sort((a, b) => parseInt(a.jsonId, 10) - parseInt(b.jsonId, 10)).map(loc => (
        <option value={loc.jsonId}>{loc.name}</option>
      ))}
    </Input.Select>
    <Input.Text id="remainingXp" label="Remaining XP" disabled={true} value={xp.toLocaleString()} />
    <Input.Text id="xpPerHit" label="Avg XP / Explore" disabled={true} value={xpPerHitTrue.toLocaleString()} />
    <Input.Text id="explores" label="Explores" disabled={true} value={Math.ceil(explores).toLocaleString()} />
    <Input.Text id="stamina" label="Stamina" disabled={true} value={Math.ceil(stamina).toLocaleString()} />
    <Input.Text id="oj" label="OJ" disabled={true} value={Math.ceil(stamina / 100).toLocaleString()} />
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
        <Button variant={isXp ? "outline-secondary" : "primary"} onClick={evt => setIsXp(false)}>Level</Button>
        <Button variant={isXp ? "primary" : "outline-secondary"} onClick={evt => setIsXp(true)}>XP</Button>
        <Form.Control
          placeholder={isXp ? "0" : "1"}
          defaultValue={current ? current.toString() : ""}
          onChange={evt => setCurrent(evt.target.value === "" ? null : parseInt(evt.target.value, 10))}
          aria-label="Current level or XP"
        />
      </InputGroup>
    </Input>
    <Input.Text id="target" label="Target Level" placeholder="99" defaultValue={target ? target.toString() : ""} onChange={val => setTarget(val === "" ? null : parseInt(val, 10))} />
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

  const settings = useSettings()[0]
  const [xp, setXp] = useState(0)
  const [skill, setSkill] = useState("exploring")

  const xpMap = [0]
  for (const c of xpCurve.nodes) {
    xpMap.push(c.xp)
  }

  const skillCalc = skill === "exploring" ? <ExploringXpCalc locations={locations.nodes} xp={xp} settings={settings} /> : <div>Coming soon</div>

  return <Layout pageTitle="XP Calculator">
    <h1>XP Calculator</h1>
    <Form onSubmit={evt => evt.preventDefault()}>
      <LevelInput setXp={setXp} xpMap={xpMap} />
      <Input.Select id="skill" label="Skill" defaultValue={skill} onChange={val => setSkill(val)}>
        <option value="exploring">Exploring</option>
        <option value="fishing">Fishing</option>
      </Input.Select>
      {skillCalc}
    </Form>
  </Layout>
}
