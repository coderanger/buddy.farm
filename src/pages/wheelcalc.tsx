import { Calculator } from '../components/calculator'
import { Input } from '../components/input'

interface WheelData {
  numSpins: number
  numDays: number
  wheelCredit: boolean
  runecube: boolean
}

const DEFAULT_DATA: WheelData = {
  numSpins: 500,
  numDays: 7,
  wheelCredit: true,
  runecube: true,
}

export default () => {
  const [data, values, setValues] = Calculator.useData(DEFAULT_DATA, (settings) => ({
    wheelCredit: settings.wheelCredit === undefined ? undefined : !!settings.wheelCredit,
    runecube: settings.runecube === undefined ? undefined : !!settings.runecube,
  }))

  // Calculations.
  const wheelCost = data.wheelCredit ? 5 : 10

  let coinsTotal = 0
  let spinsPerDayString = ""
  let coinsPerDayString = ""
  let spinsPerDayTooltip = ""
  let coinsPerDayTooltip = ""
  let hasRemainder = false;
		
  if (data.numSpins % data.numDays !== 0) {
    hasRemainder = true;
    const spinsPerDay = Math.floor(data.numSpins / data.numDays)
    const extraSpinDays = data.numSpins % data.numDays
    const regularDays = data.numDays - extraSpinDays
    spinsPerDayString =  `${(spinsPerDay + 1).toLocaleString()}`
    spinsPerDayTooltip = `${(spinsPerDay + 1).toLocaleString()} spins per day for ${extraSpinDays.toLocaleString()} days, and ${spinsPerDay.toLocaleString()} for ${regularDays.toLocaleString()} days`

    let coinsPerDay = 0;
    const coinsPerExtraSpinDay = (spinsPerDay * (spinsPerDay + 1) * wheelCost) / 2
    for (let i = 0; i < spinsPerDay; i++)
    {
        coinsPerDay += i * wheelCost
    }

    coinsPerDayString = `${coinsPerExtraSpinDay.toLocaleString()}`
    coinsPerDayTooltip = `${coinsPerExtraSpinDay.toLocaleString()} coins per day for ${extraSpinDays.toLocaleString()} days, and ${coinsPerDay.toLocaleString()} for ${regularDays.toLocaleString()} days`
    coinsTotal = coinsPerDay * regularDays + coinsPerExtraSpinDay * extraSpinDays
  } else {
    const spinsPerDay = data.numSpins / data.numDays
    spinsPerDayString =  `${spinsPerDay.toLocaleString()}`

    let coinsPerDay = 0;
    for (let i = 0; i < spinsPerDay; i++)
    {
        coinsPerDay += i * wheelCost
    }
    coinsPerDayString = `${coinsPerDay.toLocaleString()}`
    coinsTotal = coinsPerDay * data.numDays;
  }

  const chestsWithoutExploring = Math.ceil(coinsTotal / 100)
  
  let coinsPerOJ = 0.0
  let coinsPerCider = 0.0
  let coinsPerLemonade = 0.0
  let coinsPerAP = 0.0
    
  let chestsPerOJ = 0.0
  let chestsPerCider = 0.0
  let chestsPerLemonade = 0.0
  let chestsPerAP = 0.0
  
  if (data.runecube) {	
    coinsPerOJ = 1/1.1
    coinsPerCider = 9.11
    coinsPerLemonade = 1/2.74
    coinsPerAP = 9.11

    chestsPerOJ = 1/65.91
    chestsPerCider = 1/6.56
    chestsPerLemonade = 1/163.96
    chestsPerAP = 1/6.56
  } else {	
    coinsPerOJ = 1/1.27
    coinsPerCider = 7.89
    coinsPerLemonade = 1/4.56
    coinsPerAP = 7.89

    chestsPerOJ = 1/84
    chestsPerCider = 1/8.36
    chestsPerLemonade = 1/208.95
    chestsPerAP = 1/8.36
  }
  
  const ojNeeded = Math.ceil(coinsTotal/(coinsPerOJ + (chestsPerOJ * 100)))
  const ciderNeeded = Math.ceil(coinsTotal/(coinsPerCider + (chestsPerCider * 100)))
  const lemonadeNeeded = Math.ceil(coinsTotal/(coinsPerLemonade + (chestsPerLemonade * 100)))
  const apNeeded = Math.ceil(coinsTotal/(coinsPerAP + (chestsPerAP * 100)))
  
  const ojNeededString = `${ojNeeded.toLocaleString()}`
  const ciderNeededString = `${ciderNeeded.toLocaleString()}`
  const lemonadeNeededString = `${lemonadeNeeded.toLocaleString()}`
  const apNeededString = `${apNeeded.toLocaleString()}`

  return (
    <Calculator pageTitle="Wheel Calculator" valueSetter={setValues}>
      <Input.Text
        id="numSpins"
        label="Total Number of Spins Desired"
        placeholder={DEFAULT_DATA.numSpins.toString()}
        defaultValue={values.numSpins?.toString()}
        pattern="^\d{1,4}$"
        type="number"
      />
      <Input.Text
        id="numDays"
        label="Number of Days to Complete Desired Spins"
        placeholder={DEFAULT_DATA.numDays.toString()}
        defaultValue={values.numDays?.toString()}
        pattern="^\d{1,4}$"
        type="number"
      />

      <Calculator.Perks defaultOpen={true}>
        <Input.Switch
          id="wheelCredit"
          label="Wheel Credit"
          defaultChecked={data.wheelCredit}
        />
        <Input.Switch
          id="runecube"
          label="Runecube"
          defaultChecked={data.runecube}
        />
        <Input id="note" label="Note">
          <div className="mb-1">
              This calculator assumes that you have the cinnamon sticks, lemon squeezer, and max 33% wanderer perks.
          </div>
        </Input>
      </Calculator.Perks>

      <Input.Text 
        id="spinsPerDay" 
        label="Spins Per Day" 
        disabled={true} 
        value={spinsPerDayString}
        tooltip={hasRemainder ? spinsPerDayTooltip : ""}
      />
      <Input.Text 
        id="costPerDay" 
        label="Cost Per Day" 
        disabled={true} 
        value={coinsPerDayString}
        tooltip={hasRemainder ? coinsPerDayTooltip : ""}
      />
      <Input.Text 
        id="totalCoins" 
        label="Total Cost in Coins" 
        disabled={true} 
        value={coinsTotal.toLocaleString()}
      />
      <p css={{ "html.iframe &": { "display": "none" } }}>
        Ancient coins can be found in Large Chest 01. Without doing any exploring, this is how many Large Chest 01 you need to fully fund your goal:
      </p>
      <Input.Text 
        id="chestsNeeded" 
        label="Large Chest 01 Needed" 
        disabled={true} 
        value={chestsWithoutExploring.toLocaleString()} 
      />
      <p css={{ "html.iframe &": { "display": "none" } }}>
          Large Chest 01 can be found through exploring Ember Lagoon and you can also get ancient coin drops there. 
          This is how much exploring of Ember Lagoon you will need to do to get enough Coins/Large Chest 01 to fully fund your goal:
      </p>
      <Input.Text 
        id="ojNeeded" 
        label="OJ" 
        disabled={true} 
        value={ojNeededString} 
        tooltip={`${Math.round(ojNeeded * coinsPerOJ).toLocaleString()} coins through exploring & ${Math.round(ojNeeded * chestsPerOJ).toLocaleString()} chests`}
      />
      <Input.Text 
        id="ciderNeeded" 
        label="Cider" 
        disabled={true} 
        value={ciderNeededString} 
        tooltip={`${Math.round(ciderNeeded * coinsPerCider).toLocaleString()} coins through exploring & ${Math.round(ciderNeeded * chestsPerCider).toLocaleString()} chests`}
      />
      <Input.Text 
        id="lemonadeNeeded" 
        label="Lemonade" 
        disabled={true} 
        value={lemonadeNeededString} 
        tooltip={`${Math.round(lemonadeNeeded * coinsPerLemonade).toLocaleString()} coins through exploring & ${Math.round(lemonadeNeeded * chestsPerLemonade).toLocaleString()} chests`}
      />
      <Input.Text 
        id="apNeeded" 
        label="Arnold Palmers" 
        disabled={true} 
        value={apNeededString} 
        tooltip={`${Math.round(apNeeded * coinsPerAP).toLocaleString()} coins through exploring & ${Math.round(apNeeded * chestsPerAP).toLocaleString()} chests`}
      />      
    </Calculator>
  )
}
