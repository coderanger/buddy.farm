import { graphql, useStaticQuery } from 'gatsby'
import Layout from '../components/layout'
import List from '../components/list'

interface ExploringQuery {
  locations: {
    nodes: {
      name: string
      image: string
      jsonId: string
      fields: {
        path: string
      }
    }[]
  }
}

export default () => {
  const { locations }: ExploringQuery = useStaticQuery(graphql`
    query {
      locations: allLocationsJson(filter: {type: {eq: "explore"}}) {
        nodes {
          name
          image
          jsonId
          fields {
            path
          }
        }
      }
    }
  `)

  return <Layout title="Exploring">
    <List items={locations.nodes.sort((a, b) => parseInt(a.jsonId, 10) - parseInt(b.jsonId, 10)).map(l => ({
      image: l.image,
      lineOne: l.name,
      href: l.fields.path,
    }))} bigLine={true} />
  </Layout>
}
