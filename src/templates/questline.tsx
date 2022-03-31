
import { graphql } from 'gatsby'
import { useContext, useState } from 'react'

import { CopyButton } from '../components/clipboard'
import { Input } from '../components/input'
import Layout from '../components/layout'
import List from '../components/list'
import { GlobalContext } from '../utils/context'

interface Quest {
  name: string
  fromImage: string
  requiresFarming: number | null
  requiresFishing: number | null
  requiresCrafting: number | null
  requiresExploring: number | null
  text: string
  fields: {
    path: string
  }
}


const questText = (q: Quest, showText: boolean, showLevels: boolean) => {
  if (!showText && !showLevels) {
    return undefined
  }
  let text = []
  if (showLevels) {
    const levelsText: JSX.Element[] = []
    if (q.requiresFarming) {
      levelsText.push(<span className="me-2"><b className="me-1">Farming:</b>{q.requiresFarming}</span>)
    }
    if (q.requiresFishing) {
      levelsText.push(<span className="me-2"><b className="me-1">Fishing:</b>{q.requiresFishing}</span>)
    }
    if (q.requiresCrafting) {
      levelsText.push(<span className="me-2"><b className="me-1">Crafting:</b>{q.requiresCrafting}</span>)
    }
    if (q.requiresExploring) {
      levelsText.push(<span className="me-2"><b className="me-1">Exploring:</b>{q.requiresExploring}</span>)
    }
    text.push(<div>{levelsText}</div>)
  }
  if (showText) {
    text.push(<div>{q.text}</div>)
  }
  return text
}

interface QuestlinesProps {
  data: {
    questline: {
      name: string
      image: string
      quests: Quest[]
      fields: {
        path: string
      }
    }
  }
}



export default ({ data: { questline } }: QuestlinesProps) => {
  const ctx = useContext(GlobalContext)
  const settings = ctx.settings
  const [showText, setShowText] = useState(false)
  const [showLevels, setshowLevels] = useState(false)
  return <Layout pageTitle={questline.name}>
    <h1>
      <img src={"https://farmrpg.com" + questline.image} className="d-inline-block align-text-top" width="48" height="48" css={{ marginRight: 10, boxSizing: "border-box" }} />
      {questline.name}
      <CopyButton text={settings.staffMode ? `buddy.farm${questline.fields.path} https://buddy.farm${questline.fields.path}` : `buddy.farm${questline.fields.path}`} />
    </h1>
    <p>
      <Input.Switch id="showText" label="Show Quest Text" defaultChecked={showText} onChange={setShowText} />
      <Input.Switch id="showLevels" label="Show Quest Levels" defaultChecked={showLevels} onChange={setshowLevels} />
    </p>
    <List items={questline.quests.map(q => ({
      image: q.fromImage,
      lineOne: q.name,
      lineTwo: questText(q, showText, showLevels),
      href: q.fields.path
    }))} bigLine={true} />
  </Layout>
}

export const pageQuery = graphql`
  query($name: String!) {
    questline: questlinesJson(name: {eq: $name}) {
      name
      image
      quests {
        name
        fromImage
        requiresFarming
        requiresFishing
        requiresCrafting
        requiresExploring
        text
        fields {
          path
        }
      }
      fields {
        path
      }
    }
  }
`
