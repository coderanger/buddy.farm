import { useStaticQuery, graphql } from "gatsby"

export const useItems = () => {
  const {
    farmrpg: { items },
  } = useStaticQuery<Queries.UseItemsHookQuery>(
    graphql`
      query UseItemsHook {
        farmrpg {
          items {
            __typename
            id
            name
            image
          }
        }
      }
    `
  )
  return Object.fromEntries(items.map((n) => [n.name, n]))
}
