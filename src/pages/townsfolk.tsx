import { graphql, PageProps, Link } from "gatsby"

import Layout from "../components/layout"
import List from "../components/list"
import linkFor from "../utils/links"

const TownsfolkPage = ({
  data: {
    farmrpg: { npcs },
  },
}: PageProps<Queries.TownsfolkPageQuery>) => {
  return (
    <Layout title="Townsfolk">
      <p className="mb-2">
        <Link to="/townsfolk-grid/">View all info as a grid.</Link>
      </p>
      <List
        items={npcs
          .slice()
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((n) => ({
            image: n.image,
            lineOne: n.name,
            href: linkFor(n),
          }))}
        bigLine={true}
      />
    </Layout>
  )
}

export default TownsfolkPage

export const query = graphql`
  query TownsfolkPage {
    farmrpg {
      npcs {
        __typename
        name
        image
      }
    }
  }
`
