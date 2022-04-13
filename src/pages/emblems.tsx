import { graphql, useStaticQuery } from 'gatsby'
import Layout from '../components/layout'
import List from '../components/list'

interface EmblemsQuery {
  emblems: {
    nodes: {
      jsonId: string
      image: string
      beta: boolean
    }[]
  }
}

export default () => {
  const query: EmblemsQuery = useStaticQuery(graphql`
    query {
      emblems: allEmblemsJson {
        nodes {
          jsonId
          image
          beta
        }
      }
    }
  `)

  const emblems = query.emblems.nodes.map(e => {
    const id = parseInt(e.jsonId, 10)
    let name = e.image
    const match = name.match(/\/(?:emblem)?([^\/]*?)(?:96(?:\s*|test)?)?\.(?:png|gif|jpg|jpeg)$/)
    if (match) {
      // Process into something like a useful name.
      name = match[1].replace(/[_.-]+/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2").trim()
      name = name.charAt(0).toUpperCase() + name.slice(1)
    }
    const image = e.image[0] == "/" ? e.image : `/${e.image}`
    return { ...e, id, name, image }
  })

  return <Layout pageTitle="Emblems">
    <h1>Emblems</h1>
    <List items={emblems.sort((a, b) => b.id - a.id).map(e => ({
      image: e.image,
      lineOne: e.name,
      value: e.beta ? "Beta/Alpha" : "",
    }))} bigLine={true} />
  </Layout>
}
