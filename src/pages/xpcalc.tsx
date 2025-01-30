import { graphql, PageProps } from "gatsby"
import React, { useEffect, useState } from "react"
import Button from "react-bootstrap/Button"
import Form from "react-bootstrap/Form"
import InputGroup from "react-bootstrap/InputGroup"
import { Duration } from "luxon"

import { Calculator } from "../components/calculator"
import { Input } from "../components/input"

type Location = Queries.XpCalcPageLocationFragment

interface XpData {
  isXp: boolean
  current: number
  target: number
  skill: "exploring" | "fishing" | "farming" | "cooking"
  event: boolean
  // Exploring data.
  exploringLocation: string
  // Exploring settings.
  primerExploring: number
  ironDepot: boolean
  wanderer: number
  lemonSqueezer: boolean
  runecube: boolean
  // Fishing data.
  fishingLocation: string
  bait: number
  streak: number
  // Fishing settings.
  primerFishing: number
  reinforcedNetting: boolean
  fishingTrawl: boolean
  // Farming data.
  cropXp: number
  gjPerDay: number
  // Farming settings.
  primerFarming: number
  cropRows: number
  // Cooking data.
  mealData: string
  stir: boolean
  taste: boolean
  season: boolean
  // Cooking settings.
  primerCooking: number
  quickCooking: number
  ovens: number
}

const DEFAULT_DATA: XpData = {
  isXp: false,
  current: 1,
  target: 99,
  skill: "exploring",
  event: false,
  exploringLocation: "13", // Jundland
  primerExploring: 0,
  ironDepot: false,
  runecube: false,
  wanderer: 33,
  lemonSqueezer: true,
  fishingLocation: "12", // Glacier
  bait: 1,
  streak: 0,
  primerFishing: 0,
  reinforcedNetting: true,
  fishingTrawl: false,
  cropXp: 100000, // Rice
  gjPerDay: 2,
  primerFarming: 0,
  cropRows: 9,
  mealData: "100,10", // Bone Broth
  stir: true,
  taste: false,
  season: false,
  primerCooking: 0,
  quickCooking: 0,
  ovens: 1,
}

interface XpCalcProps {
  xp: number
  data: XpData
  values: Partial<XpData>
}

interface LocationXpCalcProps extends XpCalcProps {
  locations: readonly Location[]
}

const FishingXpCalc = ({ locations, xp, data, values }: LocationXpCalcProps) => {
  const parsedData = parseInt(data.fishingLocation, 10)
  const selectedLocation = locations.find((loc) => loc.id === parsedData)
  const dropRates =
    selectedLocation?.dropRates.find(
      (dr) => dr.manualFishing === false && dr.runecube === data.runecube
    ) || selectedLocation?.dropRates[0]
  const xpPerHit = dropRates?.xpPerHit || 0
  const xpBonus = 1 + data.primerFishing / 100
  const xpPerHitNet = (75 + xpPerHit) * xpBonus * (data.event ? 1.2 : 1)
  const xpPerHitManual = xpPerHitNet * (1 + data.streak / 1000) * data.bait
  const manualFishes = xp / xpPerHitManual
  const fishPerNet = data.reinforcedNetting ? 15 : 10
  const nets = xp / (xpPerHitNet * fishPerNet)
  const fishPerLargeNet = 250 + (data.reinforcedNetting ? 150 : 0) + (data.fishingTrawl ? 100 : 0)
  const largeNets = xp / (xpPerHitNet * fishPerLargeNet)

  return (
    <>
      <Input.Select id="fishingLocation" label="Location" defaultValue={data.fishingLocation}>
        {locations.map((loc) => (
          <option key={loc.id} value={loc.id}>
            {loc.name}
          </option>
        ))}
      </Input.Select>
      <Input.Select id="bait" label="Bait" defaultValue={data.bait.toString()}>
        <option value="1">Worms / Minnows / Mealworms</option>
        <option value="2">Grubs</option>
        <option value="3">Gummy Worms</option>
      </Input.Select>
      <Input.Text
        id="streak"
        label="Streak"
        placeholder="1000"
        pattern="^(\d{1,3}|1000)$"
        type="number"
        defaultValue={values.streak?.toString()}
      />
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
        <Input.Switch id="fishingTrawl" label="Fishing Trawl" defaultChecked={data.fishingTrawl} />
        <Input.Switch id="runecube" label="Eagle Eye (Runecube)" defaultChecked={data.runecube} />
      </Calculator.Perks>

      <Input.Text
        id="remainingXp"
        label="Remaining XP"
        disabled={true}
        value={xp.toLocaleString()}
      />
      <Input.Text
        id="xpPerHit"
        label="Avg XP / Fish"
        disabled={true}
        value={xpPerHitManual.toLocaleString()}
      />
      <Input.Text
        id="manual"
        label="Manual Fishes"
        disabled={true}
        value={Math.ceil(manualFishes).toLocaleString()}
      />
      <Input.Text id="nets" label="Nets" disabled={true} value={Math.ceil(nets).toLocaleString()} />
      <Input.Text
        id="largeNets"
        label="Large Nets"
        disabled={true}
        value={Math.ceil(largeNets).toLocaleString()}
      />
    </>
  )
}

const ExploringXpCalc = ({ locations, xp, data, values }: LocationXpCalcProps) => {
  const parsedData = parseInt(data.exploringLocation, 10)
  const selectedLocation = locations.find((loc) => loc.id === parsedData)
  const dropRates =
    selectedLocation?.dropRates.find(
      (dr) => dr.ironDepot === data.ironDepot && dr.runecube === data.runecube
    ) || selectedLocation?.dropRates[0]
  const xpPerHit = dropRates?.xpPerHit || 0
  const xpBonus = 1 + data.primerExploring / 100
  const xpPerHitTrue = (125 + xpPerHit) * xpBonus * (data.event ? 1.2 : 1)
  const explores = xp / xpPerHitTrue
  const wanderer = data.wanderer / 100
  const staminaPerExplore = 1 - wanderer
  const stamina = explores * staminaPerExplore
  const itemDropRate = selectedLocation?.baseDropRate || 1
  const itemsPerLem = data.lemonSqueezer ? 20 : 10
  const lemXpPerHit = (xpPerHit / itemDropRate + 250) * (data.event ? 1.2 : 1)
  const xpPerLemonade = itemsPerLem * lemXpPerHit
  const lemonade = xp / xpPerLemonade
  const itemsPerPalmer = data.lemonSqueezer ? 500 : 200
  const xpPerPalmer = itemsPerPalmer * lemXpPerHit
  const palmers = xp / xpPerPalmer

  return (
    <>
      <Input.Select id="exploringLocation" label="Location" defaultValue={data.exploringLocation}>
        {locations.map((loc) => (
          <option key={loc.id} value={loc.id}>
            {loc.name}
          </option>
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
        <Input.Switch id="ironDepot" label="Iron Depot" defaultChecked={data.ironDepot} />
        <Input.Switch id="runecube" label="Eagle Eye (Runecube)" defaultChecked={data.runecube} />
      </Calculator.Perks>

      <Input.Text
        id="remainingXp"
        label="Remaining XP"
        disabled={true}
        value={xp.toLocaleString()}
      />
      <Input.Text
        id="xpPerHit"
        label="Avg XP / Explore"
        disabled={true}
        value={xpPerHitTrue.toLocaleString()}
      />
      <Input.Text
        id="explores"
        label="Explores"
        disabled={true}
        value={Math.ceil(explores).toLocaleString()}
      />
      <Input.Text
        id="stamina"
        label="Stamina"
        disabled={true}
        value={Math.ceil(stamina).toLocaleString()}
        tooltip={`~${(xp / stamina).toLocaleString(undefined, {
          maximumFractionDigits: 2,
        })} XP/Stamina`}
      />
      <Input.Text
        id="oj"
        label="OJ"
        disabled={true}
        value={Math.ceil(stamina / 100).toLocaleString()}
        tooltip={`~${((xp * 100) / stamina).toLocaleString(undefined, {
          maximumFractionDigits: 2,
        })} XP/OJ`}
      />
      <Input.Text
        id="lem"
        label="Lemonade"
        disabled={true}
        value={Math.ceil(lemonade).toLocaleString()}
        tooltip={`~${xpPerLemonade.toLocaleString(undefined, {
          maximumFractionDigits: 2,
        })} XP/Lemonade`}
      />
      <Input.Text
        id="palmers"
        label="Arnold Palmers"
        disabled={true}
        value={Math.ceil(palmers).toLocaleString()}
        tooltip={`~${xpPerPalmer.toLocaleString(undefined, {
          maximumFractionDigits: 2,
        })} XP/Arnold Palmer`}
      />
    </>
  )
}

const FarmingXpCalc = ({ xp, data, values }: XpCalcProps) => {
  const xpBonus = 1 + data.primerFarming / 100
  const xpPerSeed = (data.cropXp + 15) * xpBonus * (data.event ? 1.2 : 1)
  const seeds = xp / xpPerSeed
  const harvests = seeds / (data.cropRows * 4)
  const days = harvests / data.gjPerDay

  return (
    <>
      <Input id="note" label="Note">
        <div className="mb-1">
          You will get the vast majority of your Farming XP from crop rows and farm buildings. All
          together the available buildings and the crop rows through the one which costs 1 billion
          silver (the 9th row) will get you to around level 95. Don't worry about optimal XP from
          growing crops normally, it's such a small amount compared to rows/buildings or late game
          crops with Grape Juice that it doesn't really affect things.
        </div>
        <div>
          This calculator is only to help with the last bits of XP when already at a high level.
        </div>
      </Input>
      <Input.Select id="cropXp" label="Crop" defaultValue={data.cropXp.toString()} type="number">
        <option value="40320">Cotton (level 70)</option>
        <option value="60480">Sunflowers (level 80)</option>
        <option value="90720">Beets (level 90)</option>
        <option value="100000">Rice (level 91)</option>
      </Input.Select>
      <Input.Text
        id="gjPerDay"
        label="GJ / Day"
        placeholder="2"
        type="number"
        defaultValue={values.gjPerDay?.toString()}
      />
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

      <Input.Text
        id="remainingXp"
        label="Remaining XP"
        disabled={true}
        value={xp.toLocaleString()}
      />
      <Input.Text
        id="seeds"
        label="Seeds"
        disabled={true}
        value={Math.ceil(seeds).toLocaleString()}
      />
      <Input.Text
        id="harvests"
        label="Harvests"
        disabled={true}
        value={Math.ceil(harvests).toLocaleString()}
      />
      <Input.Text id="days" label="Days" disabled={true} value={Math.ceil(days).toLocaleString()} />
    </>
  )
}

const CookingXpCalc = ({ xp, data, values }: XpCalcProps) => {
  const xpBonus = 1 + data.primerCooking / 100
  const timeMul = 1 - data.quickCooking / 100
  const mealDataParts = data.mealData.split(/,/)
  const mealXp = parseInt(mealDataParts[0], 10)
  const mealMinutes = parseInt(mealDataParts[1], 10) * timeMul
  let cookMinutes = 0
  if (data.stir) {
    let countdown = mealMinutes
    if (countdown >= 1) {
      cookMinutes += 1
      countdown -= 1
      countdown *= 0.9
    }
    while (countdown >= 15) {
      cookMinutes += 15
      countdown -= 15
      countdown *= 0.9
    }
    cookMinutes += countdown
  } else {
    cookMinutes = mealMinutes
  }
  const xpPerMeal = mealXp * xpBonus * (data.event ? 1.2 : 1) + 40
  const meals = xp / xpPerMeal
  const totalMinutes = Math.ceil(meals / data.ovens) * cookMinutes
  let delta = Duration.fromObject({ minutes: totalMinutes })
    .shiftTo("days", "hours", "minutes")
    .normalize()
  if (delta.days === 0) {
    delta = delta.shiftTo("hours", "minutes").normalize()
  }
  if (delta.days === 0 && delta.hours === 0) {
    delta = delta.shiftTo("minutes").normalize()
  }

  return (
    <>
      <Input.Select id="mealData" label="Meal" defaultValue={data.mealData.toString()}>
        <option value="100,10">Bone Broth (level 1)</option>
        <option value="300,60">Onion Soup (level 5)</option>
        <option value="600,120">Over The Moon (level 10)</option>
        <option value="600,120">Cat’s Meow (level 15)</option>
        <option value="1500,180">Mushroom Stew (level 20)</option>
        <option value="2000,240">Quandary Chowder (level 25)</option>
        <option value="4500,480">Cabbage Stew (level 25)</option>
        <option value="1500,180">Neigh Neigh (level 30)</option>
        <option value="3000,360">Sea Pincher Special (level 30)</option>
        <option value="750,120">Shrimp-a-Plenty (level 35)</option>
        <option value="2000,240">Hickory Omelette (level 35)</option>
        <option value="900,120">Breakfast Boost (level 40)</option>
        <option value="6500,720">Red Berry Pie (level 40)</option>
        <option value="6500,720">Concord Grape Pie (level 40)</option>
      </Input.Select>
      <p>
        Enabling a cooking action assumes you perform it immediately when available with perfect
        timing.
      </p>
      <p>
        XP from the three cooking actions is not yet mapped out and so is not included here.
        Enabling stir does correctly reduce cooking time though.
      </p>
      <Input.Switch id="stir" label="Stir" defaultChecked={data.stir} />
      <Input.Switch id="taste" label="Taste" defaultChecked={data.taste} disabled={true} />
      <Input.Switch id="season" label="Season" defaultChecked={data.season} disabled={true} />
      <Input.Switch id="event" label="Event Bonus" defaultChecked={data.event} />

      <Calculator.Perks>
        <Input.Text
          id="primerCooking"
          label="Bonus Cooking XP"
          placeholder="0"
          after="%"
          defaultValue={values.primerCooking?.toString()}
          pattern="^\d{1,2}$"
          type="number"
        />
        <Input.Text
          id="ovens"
          label="Ovens"
          placeholder="1"
          defaultValue={values.ovens?.toString()}
          pattern="^\d{1,2}$"
          type="number"
        />
      </Calculator.Perks>

      <Input.Text
        id="remainingXp"
        label="Remaining XP"
        disabled={true}
        value={xp.toLocaleString()}
      />
      <Input.Text
        id="meals"
        label="Meals"
        disabled={true}
        value={Math.ceil(meals).toLocaleString()}
      />
      <Input.Text
        id="time"
        label="Total Time"
        disabled={true}
        value={delta.toHuman({ maximumFractionDigits: 0 })}
      />
    </>
  )
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
    const currentXp = isXp ? current || 0 : xpMap[current || 1]
    setXp(xpMap[target || 99] - currentXp)
  }, [isXp, current, target])

  return (
    <>
      <Input id="current" label="Current">
        <InputGroup>
          <Button variant={isXp ? "outline-secondary" : "primary"} onClick={() => setIsXp(false)}>
            Level
          </Button>
          <Button variant={isXp ? "primary" : "outline-secondary"} onClick={() => setIsXp(true)}>
            XP
          </Button>
          <Form.Control
            placeholder={isXp ? "0" : "1"}
            onChange={(evt: React.ChangeEvent<HTMLInputElement>) =>
              setCurrent(
                evt.target.value === "" ? null : parseInt(evt.target.value.replace(/,/g, ""), 10)
              )
            }
            pattern={isXp ? "^[0-9,]+$" : "^\\d{1,2}$"}
            aria-label="Current level or XP"
          />
        </InputGroup>
      </Input>
      <Input.Text
        id="target"
        label="Target Level"
        placeholder="99"
        onChange={(val) => setTarget(val === "" ? null : parseInt(val, 10))}
        pattern="^\d{1,2}$"
      />
    </>
  )
}

const XpCalcPage = ({
  data: {
    farmrpg: { exploringLocations, fishingLocations },
    xpCurve,
  },
}: PageProps<Queries.XpCalcPageQuery>) => {
  // Combine inputs and defaults.
  const [data, values, setValues] = Calculator.useData(DEFAULT_DATA, (settings) => ({
    primerExploring: settings.primerExploring ? parseInt(settings.primerExploring, 10) : undefined,
    primerFishing: settings.primerFishing ? parseInt(settings.primerFishing, 10) : undefined,
    primerFarming: settings.primerFarming ? parseInt(settings.primerFarming, 10) : undefined,
    primerCooking: settings.primerCooking ? parseInt(settings.primerCooking, 10) : undefined,
    wanderer: settings.wanderer ? parseInt(settings.wanderer, 10) : undefined,
    lemonSqueezer: settings.lemonSqueezer === undefined ? undefined : !!settings.lemonSqueezer,
    reinforcedNetting:
      settings.reinforcedNetting === undefined ? undefined : !!settings.reinforcedNetting,
    fishingTrawl: settings.fishingTrawl === undefined ? undefined : !!settings.fishingTrawl,
    cropRows: settings.cropRows ? parseInt(settings.cropRows, 10) : undefined,
    quickCooking: settings.quickCooking ? parseInt(settings.quickCooking, 10) : undefined,
    ovens: settings.ovens ? parseInt(settings.ovens, 10) : undefined,
  }))

  // Special handling for the total XP the user is looking for.
  // It's not a form value to it gets its own state.
  const [xp, setXp] = useState(0)
  const xpMap = [0]
  for (const c of xpCurve.nodes) {
    xpMap.push(c.xp)
  }

  return (
    <Calculator pageTitle="XP Calculator" valueSetter={setValues}>
      <LevelInput setXp={setXp} xpMap={xpMap} />
      <Input.Select id="skill" label="Skill" defaultValue={data.skill}>
        <option value="exploring">Exploring</option>
        <option value="fishing">Fishing</option>
        <option value="farming">Farming</option>
        <option value="cooking">Cooking</option>
      </Input.Select>
      {data.skill === "exploring" && (
        <ExploringXpCalc locations={exploringLocations} xp={xp} data={data} values={values} />
      )}
      {data.skill === "fishing" && (
        <FishingXpCalc locations={fishingLocations} xp={xp} data={data} values={values} />
      )}
      {data.skill === "farming" && <FarmingXpCalc xp={xp} data={data} values={values} />}
      {data.skill === "cooking" && <CookingXpCalc xp={xp} data={data} values={values} />}
    </Calculator>
  )
}

export default XpCalcPage

export const query = graphql`
  fragment XpCalcPageLocation on FarmRPG_Location {
    id: gameId
    name
    image
    baseDropRate
    dropRates {
      ironDepot
      manualFishing
      runecube
      xpPerHit
    }
  }

  query XpCalcPage {
    farmrpg {
      exploringLocations: locations(filters: { type: "explore" }, order: { gameId: ASC }) {
        ...XpCalcPageLocation
      }

      fishingLocations: locations(filters: { type: "fishing" }, order: { gameId: ASC }) {
        ...XpCalcPageLocation
      }
    }

    xpCurve: allXpJson(sort: { level: ASC }) {
      nodes {
        xp
      }
    }
  }
`
