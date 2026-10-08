import { Settings } from "../hooks/settings"

type Location = Queries.LocationTemplateQuery["farmrpg"]["locations"][0]
type ItemDropRate = Location["dropRates"][0]["items"][0]

const MINING_FLOOR_ITEM_HIT_RATE = {
  1: 0.314,
  10: 0.305833333333333,
  100: 0.265,
  1000: 0.265,
  10000: 0.265,
}

const MINING_FLOOR_ITEM_QUANTITY = {
  1: 3,
  10: 4,
  100: 5,
  1000: 6,
  10000: 7,
}

export const miningFloorSettingKey = (locationName: string) =>
  `miningFloor${locationName.replace(/[^a-zA-Z0-9]/g, "")}`

export const miningFloorRound = (floor: number) => {
  if (floor < 10) {
    return 1
  } else if (floor < 100) {
    return 10
  } else if (floor < 1000) {
    return 100
  } else if (floor < 10000) {
    return 1000
  } else {
    return 10000
  }
}

export const miningBaseDropRate = (
  location: Location,
  settings: Settings,
  itemRate: ItemDropRate,
) => {
  const floor = miningFloorRound(settings[miningFloorSettingKey(location.name)])
  const itemHitRate = MINING_FLOOR_ITEM_HIT_RATE[floor]
  const quantity =
    MINING_FLOOR_ITEM_QUANTITY[floor] +
    (settings.effectiveMining1 ? 1 : 0) +
    (settings.effectiveMining2 ? 1 : 0)
  return itemHitRate * quantity
}
