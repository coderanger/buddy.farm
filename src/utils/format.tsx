import { Settings } from '../hooks/settings'

const formatDropRateNumber = (rate: number) => rate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const formatDropRateUnit = (rate: number, unit: string, reciprocalUnit: string): [string, string] => {
  if (rate < 1) {
    return [formatDropRateNumber(1 / rate), reciprocalUnit]
  } else {
    return [formatDropRateNumber(rate), unit]
  }
}

export const formatDropRate = (settings: Settings, locationType: string, rate: number, manualFishingOnly: boolean, baseDropRate: number | null): [string, string] => {
  switch (locationType) {
    case "fishing":
      if (manualFishingOnly) {
        return formatDropRateUnit(rate, "Fishes/drop", "Drops/fish")
      }
      switch (settings.unitFishing) {
        case "nets":
          const fishPerNet = !!settings.reinforcedNetting ? 15 : 10
          return formatDropRateUnit(rate / fishPerNet, "Nets/drop", "Drops/net")
        case "largeNets":
          const fishPerLargeNet = 250 + (settings.reinforcedNetting ? 150 : 0) + (settings.fishingTrawl ? 100 : 0)
          return formatDropRateUnit(rate / fishPerLargeNet, "Large nets/drop", "Drops/large net")
        default:
          return formatDropRateUnit(rate, "Fishes/drop", "Drops/fish")
      }
    case "explore":
      switch (settings.unitExploring) {
        case "stamina":
        case "oj":
          const wanderer = parseInt(settings.wanderer || "0", 10) / 100
          const staminaPerExplore = 1 - wanderer
          if (settings.unitExploring === "oj") {
            return formatDropRateUnit((rate * staminaPerExplore) / 100, "OJ/drop", "Drops/OJ")
          } else {
            return formatDropRateUnit(rate * staminaPerExplore, "Stamina/drop", "Drops/stamina")
          }
        case "lemonade":
          if (baseDropRate !== null) {
            const itemsPerLem = !!settings.lemonSqueezer ? 20 : 10
            const lemExplores = (1 / baseDropRate) * itemsPerLem
            return formatDropRateUnit(rate / lemExplores, "Lemonades/drop", "Drops/lemonade")
          }
        // If there was no base drop rate, fall through to the default.
        default:
          return formatDropRateUnit(rate, "Explores/drop", "Drops/explore")
      }
    case "farming":
      switch (settings.unitFarming) {
        case "harvestAll":
          const cropRows = parseInt(settings.cropRows || "3", 10) || 2
          return formatDropRateUnit(rate / (4 * cropRows), "Harvest alls/crop", "Crops/harvest all")
        default:
          return formatDropRateUnit(rate, "Plot harvests/drop", "Drops/plot harvest")
      }
    default:
      throw `Unknown location type ${locationType}`
  }
}
