import { Settings } from '../hooks/settings'

export const formatDropRate = (settings: Settings, locationType: string, rate: number, manualFishingOnly: boolean = false): [number, string] => {
  switch (locationType) {
    case "fishing":
      if (manualFishingOnly) {
        return [rate, "Fishes/drop"]
      }
      switch (settings.unitFishing) {
        case "nets":
          const fishPerNet = !!settings.reinforcedNetting ? 15 : 10
          return [rate / fishPerNet, "Nets/drop"]
        case "largeNets":
          const fishPerLargeNet = !!settings.reinforcedNetting ? 400 : 250
          return [rate / fishPerLargeNet, "Large nets/drop"]
        default:
          return [rate, "Fishes/drop"]
      }
    case "explore":
      switch (settings.unitExploring) {
        case "stamina":
        case "oj":
          const wanderer = parseInt(settings.wanderer, 10) / 100
          const staminaPerExplore = 1 - wanderer
          const oj = settings.unitExploring === "oj" ? 100 : 1
          return [(rate * staminaPerExplore) / oj, settings.unitExploring === "oj" ? "OJ/drop" : "Stamina/drop"]
        default:
          return [rate, "Explores/drop"]
      }
    case "farming":
      switch (settings.unitFarming) {
        case "harvestAll":
          const cropRows = parseInt(settings.cropRows, 10) || 2
          return [rate / (4 * cropRows), "Harvest alls/crop"]
        default:
          return [rate, "Plot harvests/drop"]
      }
    default:
      throw `Unknown location type ${locationType}`
  }
}
