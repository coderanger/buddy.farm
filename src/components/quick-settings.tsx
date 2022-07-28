
import React, { useContext, useEffect, useState } from 'react'
import Button from 'react-bootstrap/Button'
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import ButtonToolbar from 'react-bootstrap/ButtonToolbar'

import { useOnClient } from '../hooks/client'
import crossMark from '../images/cross-mark.png'
import personRunning from '../images/person-running.png'
import { GlobalContext } from '../utils/context'

interface QuickSettingsUnitsProps {
  settingKey: "unitExploring" | "unitFishing" | "unitFarming"
  units: {
    value: string
    label: string
    image: string
    manualFishing?: boolean | undefined
  }[]
}

const QuickSettingsUnits = ({ settingKey, units }: QuickSettingsUnitsProps) => {
  const ctx = useContext(GlobalContext)
  const currentUnit: string = ctx.settings[settingKey] || ""
  return <ButtonGroup className="ms-2" aria-label="Source unit setting">
    {units.map(unit => (
      <Button
        key={unit.label}
        size="sm"
        variant={currentUnit === unit.value ? "secondary" : "outline-secondary"}
        title={unit.label}
        onClick={() => {
          if (unit.manualFishing === undefined) {
            ctx.setSetting(settingKey, unit.value)
          } else {
            ctx.setSettings((state) => {
              return { ...state, [settingKey]: unit.value, "manualFishing": unit.manualFishing }
            })
          }
        }}>
        <img src={unit.image} css={{ height: 20 }} />
      </Button>
    ))}
  </ButtonGroup>
}

const QuickSettingsRunecube = () => {
  const ctx = useContext(GlobalContext)
  const current: boolean = ctx.settings.runecube || false
  return <ButtonGroup className="ms-2" aria-label="Runecube setting">
    <Button
      size="sm"
      variant={!current ? "secondary" : "outline-secondary"}
      title="Normal"
      onClick={() => ctx.setSetting("runecube", false)}>
      <img src={crossMark} css={{ height: 20 }} />
    </Button>
    <Button
      size="sm"
      variant={current ? "secondary" : "outline-secondary"}
      title="Runecube"
      onClick={() => ctx.setSetting("runecube", true)}>
      <img src="https://farmrpg.com/img/items/2099.png" css={{ height: 20 }} />
    </Button>
  </ButtonGroup>
}

interface QuickSettingsProps {
  dropMode: string | undefined
  manualFishingOnly?: boolean
}

export const QuickSettings = ({ dropMode, manualFishingOnly }: QuickSettingsProps) => {
  const onClient = useOnClient()
  if (!dropMode || !onClient) {
    return <></>
  }
  const parts: React.ReactNode[] = []
  if (dropMode === "explores") {
    parts.push(<QuickSettingsUnits key="unitExploring" settingKey="unitExploring" units={[
      { value: "", label: "Explores", image: "https://farmrpg.com/img/items/6075.png" },
      { value: "stamina", label: "Stamina", image: personRunning },
      { value: "oj", label: "Orange Juices", image: "https://farmrpg.com/img/items/orangejuice.png" },
      { value: "ciders", label: "Apple Ciders", image: "https://farmrpg.com/img/items/8984.png" },
      { value: "lemonade", label: "Lemonades", image: "https://farmrpg.com/img/items/lemonade.png" },
      { value: "palmers", label: "Arnold Palmers", image: "https://farmrpg.com/img/items/ap.png" },
    ]} />)
  } else if (dropMode === "fishes" && !manualFishingOnly) {
    parts.push(<QuickSettingsUnits key="unitFishing" settingKey="unitFishing" units={[
      { value: "", label: "Manual Fishing", image: "https://farmrpg.com/img/items/7783.png", manualFishing: true },
      { value: "nets", label: "Fishing Nets", image: "https://farmrpg.com/img/items/7748.png", manualFishing: false },
      { value: "largeNets", label: "Large Nets", image: "https://farmrpg.com/img/items/lnet.png?1", manualFishing: false },
    ]} />)
  } else if (dropMode === "harvests") {
    parts.push(<QuickSettingsUnits key="unitFarming" settingKey="unitFarming" units={[
      { value: "", label: "Seeds", image: "https://farmrpg.com/img/items/6137.png?1" },
      { value: "harvestAll", label: "Harvest Alls", image: "https://farmrpg.com/img/items/farm2_sm.png" },
    ]} />)
  }
  if (dropMode === "explores" || dropMode === "fishes") {
    parts.push(<QuickSettingsRunecube key="runecube" />)
  }
  return <ButtonToolbar aria-label="Item source settings">{parts}</ButtonToolbar>
}
