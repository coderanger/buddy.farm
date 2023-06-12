import { graphql, PageProps } from "gatsby"

import Layout from "../components/layout"
import List from "../components/list"
import linkFor from "../utils/links"

const FishingPage = ({
  data: {
    farmrpg: { locations },
  },
}: PageProps<Queries.FishingPageQuery>) => {
  return (
    <Layout title="Fishing">
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

export default FishingPage

export const query = graphql`
  query FishingPage {
    farmrpg {
      locations(filters: { type: "fishing" }) {
        __typename
        id: gameId
        name
        image
      }
    }
  }
`
