
import { graphql } from 'gatsby'
import { useState } from 'react'

import { CopyButton } from '../components/clipboard'
import { Input } from '../components/input'
import Layout from '../components/layout'
import List from '../components/list'
import { useSettings } from '../hooks/settings'

interface QuestlinesProps {
  data: {
    questline: {
      name: string
      image: string
      quests: {
        name: string
        fromImage: string
        text: string
        fields: {
          path: string
        }
      }[]
      fields: {
        path: string
      }
    }
  }
}

export default ({ data: { questline } }: QuestlinesProps) => {
  const settings = useSettings()[0]
  const [showText, setShowText] = useState(false)
  return <Layout pageTitle={questline.name}>
    <h1>
      <img src={"https://farmrpg.com" + questline.image} className="d-inline-block align-text-top" width="48" height="48" css={{ marginRight: 10, boxSizing: "border-box" }} />
      {questline.name}
      <CopyButton text={settings.staffMode ? `buddy.farm${questline.fields.path} https://buddy.farm${questline.fields.path}` : `buddy.farm${questline.fields.path}`} />
    </h1>
    <p>
      <Input.Switch id="showText" label="Show Quest Text" defaultChecked={showText} onChange={setShowText} />
    </p>
    <List items={questline.quests.map(q => ({ image: q.fromImage, lineOne: q.name, lineTwo: showText ? q.text : undefined, href: q.fields.path }))} bigLine={true} />
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
