
import { graphql } from "gatsby"
import Layout from '../components/layout'
import List from "../components/list"

interface QuestlinesProps {
  data: {
    questline: {
      name: string
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
      <img src={"https://farmrpg.com" + questline.quests[0].fromImage} className="d-inline-block align-text-top" width="48" height="48" css={{ marginRight: 10, boxSizing: "border-box" }} />
      {questline.name}
    </h1>
  </Layout>
}

export const pageQuery = graphql`
  query($name: String!) {
    questline: questlinesJson(name: {eq: $name}) {
      name
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
