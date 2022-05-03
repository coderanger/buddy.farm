import { graphql, useStaticQuery } from 'gatsby'
import Layout from '../components/layout'
import List from '../components/list'

interface FishingQuery {
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
  const { locations }: FishingQuery = useStaticQuery(graphql`
    query {
      locations: allLocationsJson(filter: {type: {eq: "fishing"}}) {
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

  return <Layout pageTitle="Fishing">
    <h1>Fishing</h1>
    <List items={locations.nodes.sort((a, b) => parseInt(a.jsonId, 10) - parseInt(b.jsonId, 10)).map(l => ({
      image: l.image,
      lineOne: l.name,
      href: l.fields.path,
    }))} bigLine={true} />
  </Layout>
}
