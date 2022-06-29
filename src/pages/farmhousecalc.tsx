import { Calculator } from '../components/calculator'
import { Input } from '../components/input'

interface FarmhouseData {
  maxStamina: number
  energyDrink: boolean
}

const DEFAULT_DATA: FarmhouseData = {
  maxStamina: 100,
  energyDrink: false,
}

export default () => {
  const [data, values, setValues] = Calculator.useData(DEFAULT_DATA, (settings) => ({
    energyDrink: settings.energyDrink === undefined ? undefined : !!settings.energyDrink,
  }))

  // Calculations.
  const naturalRegenPerMinute = data.energyDrink ? 4 : 2
  const naturalRegenPerDay = naturalRegenPerMinute * 60 * 24
  const farmhouseRegenPerThreeHours = data.maxStamina
  const farmhouseRegenPerDay = farmhouseRegenPerThreeHours * 8
  const optimal = naturalRegenPerDay < farmhouseRegenPerDay ? "Stay over your maximum stamina" : "Stay under your maximum stamina"

  return <Calculator pageTitle="Farmhouse Calculator" valueSetter={setValues}>
    <Input.Text
      id="maxStamina"
      label="Max Stamina"
      placeholder={DEFAULT_DATA.maxStamina.toString()}
      pattern="^\d+$"
      type="number"
    />

    <Calculator.Perks defaultOpen={true}>
      <Input.Switch
        id="energyDrink"
        label="Energy Drink"
        defaultChecked={data.energyDrink}
      />
    </Calculator.Perks>

    <Input.Text id="naturalRegenPerDay" label="Natural Stamina / Day" disabled={true} value={naturalRegenPerDay.toLocaleString()} />
    <Input.Text id="farmhouseRegenPerDay" label="Farmhouse Stamina / Day" disabled={true} value={farmhouseRegenPerDay.toLocaleString()} />
    <Input.Text id="optimal" label="Optimal Play" disabled={true} value={optimal} />
  </Calculator>
}
