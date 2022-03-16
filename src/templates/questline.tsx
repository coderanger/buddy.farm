
import { graphql } from "gatsby"
import Layout from '../components/layout'
import List from "../components/list"

interface QuestlinesProps {
  data: {
    questline: {
      name: string
      image: string
      quests: {
        name: string
        fromImage: string
        fields: {
          path: string
        }
      }[]
    }
  }
}

export default ({ data: { questline } }: QuestlinesProps) => {
  return <Layout pageTitle={questline.name}>
    <h1>
      <img src={"https://farmrpg.com" + questline.image} className="d-inline-block align-text-top" width="48" height="48" css={{ marginRight: 10, boxSizing: "border-box" }} />
      {questline.name}
    </h1>
    <List items={questline.quests.map(q => ({ image: q.fromImage, lineOne: q.name, href: q.fields.path }))} bigLine={true} />
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
        fields {
          path
        }
      }
    }
  }
`
