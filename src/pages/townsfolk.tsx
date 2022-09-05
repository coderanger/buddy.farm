import { graphql, PageProps, Link } from "gatsby"
import Layout from "../components/layout"
import List from "../components/list"

const TownsfolkPage = ({ data: { npcs } }: PageProps<Queries.TownsfolkPageQuery>) => {
  return (
    <Layout title="Townsfolk">
      <p className="mb-2">
        <Link to="/townsfolk-grid/">View all info as a grid.</Link>
      </p>
      <List
        items={npcs.nodes
          .slice()
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((n) => ({
            image: n.image,
            lineOne: n.name,
            href: n.fields.path,
          }))}
        bigLine={true}
      />
    </Layout>
  )
}

export default TownsfolkPage

export const query = graphql`
  query TownsfolkPage {
    npcs: allNpcsJson {
      nodes {
        name
        image
        fields {
          path
        }
      }
    }
  }
`
