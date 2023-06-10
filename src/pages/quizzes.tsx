import { graphql, PageProps, Link } from "gatsby"
import Layout from "../components/layout"
import List from "../components/list"
import linkFor from "../utils/links"

const QuizzesPage = ({
  data: {
    farmrpg: { quizzes },
  },
}: PageProps<Queries.QuizzesPageQuery>) => {
  return (
    <Layout title="Schoolhouse Quizzes">
      <p>
        Access to Schoolhouse Quizzes requires a <Link to="/i/schoolbook/">Schoolbook</Link> item
        from the <Link to="/ql/schoolhouse-rocks/">Schoolhouse Rocks</Link> quest line.
      </p>
      <List
        items={quizzes
          .slice()
          .sort((a, b) => a.id - b.id)
          .map((l) => ({
            image: "/img/items/schoolhouse.png",
            lineOne: l.name,
            href: linkFor(l),
          }))}
        bigLine={true}
      />
    </Layout>
  )
}

export default QuizzesPage

export const query = graphql`
  query QuizzesPage {
    farmrpg {
      quizzes {
        __typename
        id
        name
      }
    }
  }
`
