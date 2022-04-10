import { graphql, useStaticQuery } from 'gatsby'
import ButtonGroup from 'react-bootstrap/ButtonGroup'

import { Calculator } from '../components/calculator'
import { Input } from '../components/input'

type AnimalName = "chickens" | "cows" | "pigs" | "raptors"

interface AnimalData {
  animal: AnimalName
  leatherValue: number
  feedCost: number
  animalLover: boolean
  animalCharmer: boolean
  sellPrice: number
  verbose: boolean
}

const DEFAULT_DATA: AnimalData = {
  animal: "pigs",
  leatherValue: 1625,
  feedCost: 2083,
  animalLover: true,
  sellPrice: 60,
  verbose: false,
}

interface AnimalTableProps {
  data: AnimalData
  xpMap: number[]
}

interface AnimalTable {
  headers: string[]
  rows: {
    values: (string | number)[]
    best: boolean[]
    profitPerDay?: number
    itemPerDay?: number
  }[]
}

const chickenTable = ({ data, xpMap }: AnimalTableProps): AnimalTable => {
  const table: AnimalTable = {
    headers: ["Level", "Days", "Eggs/day"],
    rows: [],
  }
  const xpPerDay = data.animalLover ? 700 : 350
  for (let level = 2; level <= 15; level++) {
    const days = Math.ceil(xpMap[level] / xpPerDay)
    table.rows.push({
      values: [level, days, level],
      best: Array(3).fill(false),
    })
  }
  return table
}

const cowTable = ({ data, xpMap }: AnimalTableProps): AnimalTable => {
  const table: AnimalTable = {
    headers: ["Level", "Days", "Cows/day", "Profit/day", "Leather/day"],
    rows: [],
  }
  if (data.verbose) {
    table.headers.splice(3, 0, "Value/day", "Cost/day")
  }
  const xpPerDay = data.animalLover ? 700 : 350
  const sellPriceMul = 1 + (data.sellPrice / 100)
  let lastDays = 0
  let milk = 0
  for (let level = 1; level <= 15; level++) {
    const days = Math.ceil(xpMap[level] / xpPerDay)
    milk += ((days - lastDays) * (level - 1))
    lastDays = days
    if (level === 1) {
      // Can't just start level at 2 without breaking the milk math. Sigh.
      continue
    }
    let cowsPerDay = 250 / days
    if (cowsPerDay >= 1) {
      cowsPerDay = Math.floor(cowsPerDay)
    }
    const steakPerDay = (level >= 5 ? (level - 4) * 2 : 0) * cowsPerDay
    const valuePerDay = (steakPerDay * 50000) + (steakPerDay * 5 * data.leatherValue * sellPriceMul) + (milk * cowsPerDay * 150 * sellPriceMul)
    const costPerDay = cowsPerDay * ((501 - cowsPerDay) / 2) * 500
    const profitPerDay = valuePerDay - costPerDay
    const row = {
      values: [
        level,
        days,
        cowsPerDay,
        profitPerDay,
        steakPerDay * 5,
      ],
      best: Array(10).fill(false),
      profitPerDay,
      itemPerDay: steakPerDay * 5,
    }
    if (data.verbose) {
      row.values.splice(3, 0, valuePerDay, costPerDay)
    }
    table.rows.push(row)
  }
  // A bunch of convoluted code to mark the best cells for both profit and leather.
  let bestProfit = 0, bestProfitRow = 0, bestLeather = 0, bestLeatherRow = 0
  for (let i = 0; i < 9; i++) {
    const row = table.rows[i]
    if (row.profitPerDay && row.profitPerDay > bestProfit) {
      bestProfit = row.profitPerDay
      bestProfitRow = i
    }
    if (row.itemPerDay && row.itemPerDay > bestLeather) {
      bestLeather = row.itemPerDay
      bestLeatherRow = i
    }
  }
  table.rows[bestProfitRow].best.fill(true, 0, table.rows[bestProfitRow].values.length - 1)
  table.rows[bestLeatherRow].best[table.rows[bestProfitRow].values.length - 1] = true
  return table
}

const pigTable = ({ data, xpMap }: AnimalTableProps): AnimalTable => {
  const table: AnimalTable = {
    headers: ["Level", "Days", "Pigs/day", "Profit/day", "Bacon/day"],
    rows: [],
  }
  if (data.verbose) {
    table.headers.splice(3, 0, "Value/day", "Cost/day")
  }
  const xpPerDay = data.animalLover ? 1350 : 1000
  const sellPriceMul = 1 + (data.sellPrice / 100)
  for (let level = 2; level <= 15; level++) {
    const days = Math.ceil(xpMap[level] / xpPerDay)
    let pigsPerDay = 250 / days
    if (pigsPerDay >= 1) {
      pigsPerDay = Math.floor(pigsPerDay)
    }
    const baconPerDay = (level >= 5 ? 25 + ((level - 5) * 10) : 0) * pigsPerDay
    const valuePerDay = baconPerDay * 5000 * sellPriceMul
    const costPerDay = (pigsPerDay * ((501 - pigsPerDay) / 2) * 250) + Math.round(data.feedCost * sellPriceMul * pigsPerDay * days)
    const profitPerDay = valuePerDay - costPerDay
    const row = {
      values: [
        level,
        days,
        pigsPerDay,
        profitPerDay,
        baconPerDay,
      ],
      best: Array(10).fill(false),
      profitPerDay
    }
    if (data.verbose) {
      row.values.splice(3, 0, valuePerDay, costPerDay)
    }
    table.rows.push(row)
  }
  let bestProfit = 0, bestProfitRow = 0
  for (let i = 0; i < 9; i++) {
    const row = table.rows[i]
    if (row.profitPerDay && row.profitPerDay > bestProfit) {
      bestProfit = row.profitPerDay
      bestProfitRow = i
    }
  }
  table.rows[bestProfitRow].best.fill(true)
  return table
}

const raptorsTable = ({ data, xpMap }: AnimalTableProps): AnimalTable => {
  const table: AnimalTable = {
    headers: ["Level", "Days", "Antlers/day", "Kabobs/day"],
    rows: [],
  }
  const xpPerDay = data.animalLover ? 1700 : 850
  for (let level = 2; level <= 15; level++) {
    const days = Math.ceil(xpMap[level] / xpPerDay)
    const bobs = level >= 5 ? level * 5 : 0
    table.rows.push({
      values: [level, days, bobs * 2, bobs],
      best: Array(3).fill(false),
    })
  }
  return table
}


interface AnimalCalcQuery {
  xpCurve: {
    nodes: {
      xp: number
    }[]
  }
}

export default () => {
  const { xpCurve }: AnimalCalcQuery = useStaticQuery(graphql`
    query {
      xpCurve: allXpJson(sort: {fields: level}, limit: 15) {
        nodes {
          xp
        }
      }
    }
  `)

  const xpMap = [0]
  for (const c of xpCurve.nodes) {
    xpMap.push(c.xp)
  }

  const [data, values, setValues] = Calculator.useData(DEFAULT_DATA, (settings) => ({
    animalLover: settings.animalLover === undefined ? undefined : !!settings.animalLover,
    animalCharmer: settings.animalCharmer === undefined ? undefined : !!settings.animalCharmer,
    sellPrice: settings.sellPrice ? parseInt(settings.sellPrice, 10) : undefined,
  }))

  const table = {
    "chickens": chickenTable,
    "cows": cowTable,
    "pigs": pigTable,
    "raptors": raptorsTable,
  }[data.animal]({ data, xpMap })

  return <Calculator pageTitle="Farm Animal Calculator" valueSetter={setValues}>
    <Input id="animal" label="Animal">
      <ButtonGroup aria-label="Mode select buttons">
        <Input.RadioButton value="chickens" label="Chickens" data={data.animal} />
        <Input.RadioButton value="cows" label="Cows" data={data.animal} />
        <Input.RadioButton value="pigs" label="Pigs" data={data.animal} />
        <Input.RadioButton value="raptors" label="Raptors" data={data.animal} />
      </ButtonGroup>
    </Input>
    {data.animal === "cows" && <Input.Text id="leatherValue" label="Value of Leather" placeholder={DEFAULT_DATA.leatherValue.toLocaleString()} after="Silver" />}
    {data.animal === "pigs" && <Input.Select id="feedCost" label="Feed Cost" type="number" defaultValue={data.feedCost.toString()}>
      <option value="0">Ignore (0)</option>
      <option value="1982">All Pets (1982)</option>
      <option value="2083">Hedgehog Broccoli (2083)</option>
    </Input.Select>}
    {(data.animal === "cows" || data.animal === "pigs") && <Input.Switch
      id="verbose"
      label="Verbose"
      defaultChecked={data.verbose}
    />}

    <Calculator.Perks>
      <Input.Switch
        id="animalLover"
        label="Animal Lover"
        defaultChecked={data.animalLover}
      />
      <Input.Switch
        id="animalCharmer"
        label="Animal Charmer (not supported yet)"
        defaultChecked={data.animalCharmer}
        disabled={true}
      />
      <Input.Text
        id="sellPrice"
        label="Sell Price Bonus"
        placeholder="60"
        after="%"
        defaultValue={values.sellPrice?.toString()}
        pattern="^\d{1,2}$"
        type="number"
      />
    </Calculator.Perks>

    <table className="table table-striped">
      <thead>
        <tr>
          {table.headers.map(val => <th key={val}>{val}</th>)}
        </tr>
      </thead>
      <tbody>
        {table.rows.map((row, i) => (
          <tr key={i}>
            {row.values.map((val, j) => (
              <td key={j} className={row.best[j] ? "table-success" : ""}>
                {typeof val === "number" ? val.toLocaleString(undefined, { maximumFractionDigits: 2 }) : val}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </Calculator>
}
