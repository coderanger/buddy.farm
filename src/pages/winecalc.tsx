import React, { useContext, useEffect, useState } from 'react'

import { Calculator } from '../components/calculator'
import { Input } from '../components/input'
import { useLocations } from '../hooks/locations'

interface WineData {
  farmLevel: number
  maxBottles: number
  maxValue: number
  cellarInsulation: boolean
}

const DEFAULT_DATA: WineData = {
  farmLevel: 99,
  maxBottles: 300,
  maxValue: 10,
  cellarInsulation: true,
}

export default () => {
  const [data, values, setValues] = Calculator.useData(DEFAULT_DATA, (settings) => ({
    maxBottles: settings.maxBottles ? parseInt(settings.maxBottles, 10) : undefined,
    maxValue: settings.maxValue ? parseInt(settings.maxValue, 10) : undefined,
    cellarInsulation: settings.cellarInsulation === undefined ? undefined : !!settings.cellarInsulation,
  }))

  // Calculations.
  const maxValue = data.maxValue * 1_000_000
  const ciMul = 1 + (data.cellarInsulation ? 2 : 0)
  const daysToMaxValue = Math.cbrt((maxValue - 1000) / (data.farmLevel * ciMul))

  const fullDaysToMaxValue = Math.ceil(daysToMaxValue)
  const fullDayProfit = maxValue / fullDaysToMaxValue

  const prevDayToMaxValue = fullDaysToMaxValue - 1
  const valueOnPrevDay = 1000 + (Math.pow(prevDayToMaxValue, 3) * data.farmLevel * ciMul)
  const prevDayProfit = valueOnPrevDay / prevDayToMaxValue

  const daysToOptimal = prevDayProfit >= fullDayProfit ? prevDayToMaxValue : fullDaysToMaxValue
  const optimalProfit = prevDayProfit >= fullDayProfit ? prevDayProfit : fullDayProfit
  const optimalTotalProfit = data.maxBottles * optimalProfit

  const bottlesPerDay = data.maxBottles / daysToOptimal


  return <Calculator pageTitle="Wine Calculator" valueSetter={setValues}>
    <Input.Text
      id="farmLevel"
      label="Farm Level"
      placeholder={DEFAULT_DATA.farmLevel.toString()}
      pattern="^\d{1,2}$"
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
      <Input.Text
        id="maxValue"
        label="Max Value"
        placeholder={DEFAULT_DATA.maxValue.toString()}
        after="M"
        defaultValue={values.maxValue?.toString()}
        pattern="^\d{1,2}$"
        type="number"
      />
      <Input.Switch
        id="cellarInsulation"
        label="Cellar Insulation"
        defaultChecked={data.cellarInsulation}
      />
    </Calculator.Perks>

    <Input.Text id="daysToOptimal" label="Days To Optimal Value" disabled={true} value={daysToOptimal.toLocaleString()} />
    <Input.Text id="optimalProfit" label="Optimal Profit / Day" disabled={true}
      value={optimalTotalProfit.toLocaleString(undefined, { maximumFractionDigits: 2 })}
      tooltip={`${optimalProfit.toLocaleString(undefined, { maximumFractionDigits: 2 })} / bottle`}
    />
    <Input.Text id="daysToMax" label="Days To Max Value" disabled={true} value={fullDaysToMaxValue.toLocaleString()} />
    <Input.Text id="bottlesPerDay" label="Bottles / Day" disabled={true}
      value={Math.ceil(bottlesPerDay).toLocaleString()}
      tooltip={bottlesPerDay.toLocaleString(undefined, { maximumFractionDigits: 2 })}
    />
  </Calculator>
}
