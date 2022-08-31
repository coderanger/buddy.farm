import { graphql, PageProps, Link } from 'gatsby'
import Layout from '../components/layout'
import List from '../components/list'

const TownsfolkPage =  ({ data: { npcs } }: PageProps<Queries.TownsfolkPageQuery>) => {
  return <Layout title="Townsfolk">
    <List items={npcs.nodes.slice().sort((a, b) => a.name.localeCompare(b.name)).map(n => ({
      image: n.image,
      lineOne: n.name,
      href: n.fields.path,
    }))} bigLine={true} />
    <p className="mt-2">
      For a tabular view of the same data as of the launch of the feature, see <a href="https://docs.google.com/spreadsheets/d/1e2rWPl8FmgS2nlhnKFmmYYDUh-7l30Bl-1E3CAKhL5E/edit?usp=sharing">the Google Sheet</a>.
    </p>
  </Layout>
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
