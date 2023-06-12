import { graphql, PageProps } from "gatsby"

import Layout from "../components/layout"
import List from "../components/list"
import linkFor from "../utils/links"

const ExploringPage = ({
  data: {
    farmrpg: { locations },
  },
}: PageProps<Queries.ExploringPageQuery>) => {
  return (
    <Layout title="Exploring">
      <List
        items={locations
          .slice()
          .sort((a, b) => a.id - b.id)
          .map((l) => ({
            image: l.image,
            lineOne: l.name,
            href: linkFor(l),
          }))}
        bigLine={true}
      />
    </Layout>
  )
}

export default ExploringPage

export const query = graphql`
  query ExploringPage {
    farmrpg {
      locations(filters: { type: "explore" }) {
        __typename
        id: gameId
        name
        image
      }
    }
  }
`
