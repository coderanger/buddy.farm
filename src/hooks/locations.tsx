import { useStaticQuery, graphql } from "gatsby"

export const useLocations = (type: string | undefined) => {
  const {
    farmrpg: { locations },
  } = useStaticQuery<Queries.UseLocationsHookQuery>(
    graphql`
      query UseLocationsHook {
        farmrpg {
          locations(order: { gameId: ASC }) {
            __typename
            id
            type
            name
            image
            baseDropRate
          }
        }
      }
    `
  )
  const locationsMap: Record<string, (typeof locations)[0]> = {}
  for (const loc of locations) {
    if (type !== undefined && type !== loc.type) {
      continue
    }
    locationsMap[loc.name] = loc
  }
  return locationsMap
}
