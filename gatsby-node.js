// @ts-check

/**
 * @type {import('gatsby').GatsbyNode['createPages']}
 */
exports.createPages = async function ({ actions, graphql }) {
    /**
     * @type {
        {
          data?: {
            allLocationsJson: {
              nodes: {
               name: string
              }[]
            }
          }
        }
      }
     */
    const { data } = await graphql(`
      query {
        allLocationsJson {
          nodes {
            name
          }
        }
      }
    `)
    data.allLocationsJson.nodes.forEach(node => {
      actions.createPage({
        path: node.name.toLowerCase().replace(/\s+/g, '-'),
        component: require.resolve(`./src/templates/location.tsx`),
        context: { name: node.name },
      })
    })
  }
