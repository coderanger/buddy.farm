import { Calculator } from "../components/calculator"
import { Input } from "../components/input"
import ButtonGroup from "react-bootstrap/ButtonGroup"
import React from "react"

interface TowerData {
  fromLevel: number
  mode: "level" | "silver" | "ak"
  toLevel: number
  toSilver: number
  toSilverUnit: "B" | "M"
  toAK: number
}

const DEFAULT_DATA: TowerData = {
  fromLevel: 0,
  mode: "level",
  toLevel: 100,
  toSilver: 1,
  toSilverUnit: "B",
  toAK: 100,
}

export default () => {
  const [data, , setValues] = Calculator.useData(DEFAULT_DATA, () => ({}))

  // Calculations.
  let totalSilver = 0
  let totalAK = 0
  let levelsClimbed = 0
  let endCondition = () => data.fromLevel + levelsClimbed < data.toLevel
  if (data.mode === "silver") {
    const toSilver = data.toSilverUnit === "B" ? data.toSilver * 1000 : data.toSilver
    endCondition = () => totalSilver + (data.fromLevel + levelsClimbed + 1) * 50 - 1 < toSilver
  } else if (data.mode === "ak") {
    endCondition = () => totalAK + 99 < data.toAK
  }
  while (endCondition()) {
    levelsClimbed += 1
    const curLevel = data.fromLevel + levelsClimbed
    totalSilver += curLevel * (curLevel > 100 ? (curLevel > 200 ? 150 : 100) : 50)
    totalAK += 100
  }
  const displaySilverUnit = totalSilver > 1000 ? "B" : "M"
  const displaySilver = totalSilver > 1000 ? totalSilver / 1000 : totalSilver

  const endLevel = data.fromLevel + levelsClimbed
  const mmsRequired = endLevel <= 100 ? 0 : Math.ceil((endLevel - 100) / 4)

  return (
    <Calculator pageTitle="Tower Calculator" valueSetter={setValues}>
      <Input.Text
        id="fromLevel"
        label="Current Level"
        placeholder={DEFAULT_DATA.fromLevel.toString()}
        pattern="^\d{1,4}$"
        type="number"
      />
      <Input id="mode" label="Mode">
        <ButtonGroup aria-label="Mode select buttons">
          <Input.RadioButton value="level" label="To Level" data={data.mode} />
          <Input.RadioButton value="silver" label="Available Silver" data={data.mode} />
          <Input.RadioButton value="ak" label="Available AK" data={data.mode} />
        </ButtonGroup>
      </Input>
      {data.mode === "level" && (
        <Input.Text
          key="toLevel"
          id="toLevel"
          label="Goal Level"
          placeholder={DEFAULT_DATA.toLevel.toString()}
          pattern="^\d{1,4}$"
          type="number"
        />
      )}
      {data.mode === "silver" && (
        <Input.Text
          key="toSilver"
          id="toSilver"
          label="Available Silver"
          placeholder={DEFAULT_DATA.toSilver.toString()}
          pattern="^[0-9.]+$"
          type="number"
          after={
            <>
              <input
                type="radio"
                className="btn-check"
                name="toSilverUnit"
                id="toSilverUnit-b"
                autoComplete="off"
                value="B"
                defaultChecked={data.toSilverUnit === "B"}
              />
              <label className="btn btn-outline-secondary" htmlFor="toSilverUnit-b">
                B
              </label>
              <input
                type="radio"
                className="btn-check"
                name="toSilverUnit"
                id="toSilverUnit-m"
                autoComplete="off"
                value="M"
                defaultChecked={data.toSilverUnit === "M"}
              />
              <label className="btn btn-outline-secondary" htmlFor="toSilverUnit-m">
                M
              </label>
            </>
          }
        />
      )}
      {data.mode === "ak" && (
        <Input.Text
          key="toAK"
          id="toAK"
          label="Available AK"
          placeholder={DEFAULT_DATA.toAK.toString()}
          pattern="^\d+$"
          type="number"
        />
      )}

      {data.mode !== "level" && (
        <Input.Text
          id="level"
          label="Gets To Level"
          disabled={true}
          value={(data.fromLevel + levelsClimbed).toLocaleString()}
        />
      )}
      <Input.Text
        id="silver"
        label="Silver Used"
        disabled={true}
        value={
          displaySilver.toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          }) + displaySilverUnit
        }
      />
      <Input.Text id="ak" label="AK Used" disabled={true} value={totalAK.toLocaleString()} />
      <Input.Text
        id="mms"
        label="Mega-Masteries Required"
        disabled={true}
        value={mmsRequired.toLocaleString()}
      />
    </Calculator>
  )
}
