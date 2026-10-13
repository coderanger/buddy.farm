import { Calculator } from "../components/calculator"
import { Input } from "../components/input"

interface WineData {
  farmLevel: number
  maxBottles: number
  fancyBottle: boolean
  designerBottle: boolean
  couturierBottle: boolean
  cellarInsulation: boolean
  cellarInsulation2: boolean
  cellarInsulation3: boolean
  inpergonsBlessing: boolean
  towerLevel: number
}

const DEFAULT_DATA: WineData = {
  farmLevel: 99,
  maxBottles: 300,
  fancyBottle: false,
  designerBottle: false,
  couturierBottle: false,
  cellarInsulation: true,
  cellarInsulation2: false,
  cellarInsulation3: false,
  inpergonsBlessing: false,
  towerLevel: 0,
}

export default () => {
  const [data, values, setValues] = Calculator.useData(DEFAULT_DATA, (settings) => ({
    maxBottles: settings.maxBottles ? parseInt(settings.maxBottles, 10) : undefined,
    fancyBottle: settings.fancyBottle === undefined ? undefined : !!settings.fancyBottle,
    designerBottle: settings.designerBottle === undefined ? undefined : !!settings.designerBottle,
    couturierBottle:
      settings.couturierBottle === undefined ? undefined : !!settings.couturierBottle,
    cellarInsulation:
      settings.cellarInsulation === undefined ? undefined : !!settings.cellarInsulation,
    cellarInsulation2:
      settings.cellarInsulation2 === undefined ? undefined : !!settings.cellarInsulation2,
    cellarInsulation3:
      settings.cellarInsulation3 === undefined ? undefined : !!settings.cellarInsulation3,
    inpergonsBlessing:
      settings.inpergonsBlessing === undefined ? undefined : !!settings.inpergonsBlessing,
    towerLevel: settings.towerLevel ? parseInt(settings.towerLevel, 10) : undefined,
  }))

  // Calculations.
  const maxValue =
    8_000_000 +
    (data.fancyBottle ? 2_000_000 : 0) +
    (data.designerBottle ? 5_000_000 : 0) +
    (data.couturierBottle ? 8_000_000 : 0) +
    Math.ceil(data.towerLevel / 10) * 1_000_000

  const ciMul =
    1 +
    (data.cellarInsulation ? 2 : 0) +
    (data.cellarInsulation2 ? 3 : 0) +
    (data.cellarInsulation3 ? 3 : 0)
  const ibMul = data.towerLevel >= 190 && data.inpergonsBlessing ? 0.4 * data.towerLevel : 1
  const daysToMaxValue = Math.cbrt((maxValue - 1000) / (data.farmLevel * ciMul))

  const fullDaysToMaxValue = Math.ceil(daysToMaxValue)
  const fullDayProfit = (maxValue / fullDaysToMaxValue) * ibMul

  const prevDayToMaxValue = fullDaysToMaxValue - 1
  const valueOnPrevDay = 1000 + Math.pow(prevDayToMaxValue, 3) * data.farmLevel * ciMul
  const prevDayProfit = (valueOnPrevDay / prevDayToMaxValue) * ibMul

  const daysToOptimal = prevDayProfit >= fullDayProfit ? prevDayToMaxValue : fullDaysToMaxValue
  const optimalProfit = prevDayProfit >= fullDayProfit ? prevDayProfit : fullDayProfit
  const optimalTotalProfit = data.maxBottles * optimalProfit

  const bottlesPerDay = data.maxBottles / daysToOptimal

  return (
    <Calculator pageTitle="Wine Calculator" valueSetter={setValues}>
      <Input.Text
        id="farmLevel"
        label="Farm Level"
        placeholder={DEFAULT_DATA.farmLevel.toString()}
        pattern="^\d{1,2}$"
        type="number"
      />
      <Input.Text
        id="towerLevel"
        label="Tower Level"
        placeholder={DEFAULT_DATA.towerLevel.toString()}
        defaultValue={values.towerLevel?.toString()}
        pattern="^\d{1,3}$"
        type="number"
      />

      <Calculator.Perks defaultOpen={true}>
        <Input.Text
          id="maxBottles"
          label="Max Bottles"
          placeholder={DEFAULT_DATA.maxBottles.toString()}
          defaultValue={values.maxBottles?.toString()}
          pattern="^\d{1,4}$"
          type="number"
        />
        <Input.Switch id="fancyBottle" label="Fancy Bottle" defaultChecked={data.fancyBottle} />
        <Input.Switch
          id="designerBottle"
          label="Designer Bottle"
          defaultChecked={data.designerBottle}
        />
        <Input.Switch
          id="couturierBottle"
          label="Couturier Bottle"
          defaultChecked={data.couturierBottle}
        />
        <Input.Switch
          id="cellarInsulation"
          label="Cellar Insulation"
          defaultChecked={data.cellarInsulation}
        />
        <Input.Switch
          id="cellarInsulation2"
          label="Cellar Insulation II"
          defaultChecked={data.cellarInsulation2}
        />
        <Input.Switch
          id="cellarInsulation3"
          label="Cellar Insulation III"
          defaultChecked={data.cellarInsulation3}
        />
        {data.towerLevel >= 190 && (
          <Input.Switch
            id="inpergonsBlessing"
            label="Inpergon's Blessing"
            defaultChecked={data.inpergonsBlessing}
          />
        )}
      </Calculator.Perks>

      <Input.Text
        id="maxValue"
        label="Max Value"
        disabled={true}
        value={(maxValue * ibMul).toLocaleString()}
      />
      <Input.Text
        id="daysToOptimal"
        label="Days To Optimal Value"
        disabled={true}
        value={daysToOptimal.toLocaleString()}
      />
      <Input.Text
        id="optimalProfit"
        label="Optimal Profit / Day"
        disabled={true}
        value={optimalTotalProfit.toLocaleString(undefined, { maximumFractionDigits: 2 })}
        tooltip={`${optimalProfit.toLocaleString(undefined, {
          maximumFractionDigits: 2,
        })} / bottle`}
      />
      <Input.Text
        id="daysToMax"
        label="Days To Max Value"
        disabled={true}
        value={fullDaysToMaxValue.toLocaleString()}
      />
      <Input.Text
        id="bottlesPerDay"
        label="Bottles / Day"
        disabled={true}
        value={Math.ceil(bottlesPerDay).toLocaleString()}
        tooltip={bottlesPerDay.toLocaleString(undefined, { maximumFractionDigits: 2 })}
      />
    </Calculator>
  )
}
