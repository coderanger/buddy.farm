import { graphql, PageProps } from "gatsby"
import { DateTime } from "luxon"

import Layout from "../components/layout"
import List from "../components/list"

const EmblemsPage = ({
  data: {
    farmrpg: { emblems },
  },
}: PageProps<Queries.EmblemsPageQuery>) => {
  const data = emblems
    .map((e) => {
      const image = e.image[0] == "/" ? e.image : `/${e.image}`
      const createdAt = DateTime.fromISO(e.createdAt).toMillis()
      return { ...e, image, createdAt }
    })
    .sort((a, b) => b.createdAt - a.createdAt)

  return (
    <Layout title="Emblems">
      <List
        items={data.map((e) => ({
          image: e.image,
          lineOne: e.name,
          value: e.type ? "Beta/Alpha" : "",
        }))}
        bigLine={true}
      />
    </Layout>
  )
}

export default EmblemsPage

export const query = graphql`
  query EmblemsPage {
    farmrpg {
      emblems(filters: { nonStaff: true }) {
        id
        name
        image
        type
        createdAt
      }
    }
  }
`
