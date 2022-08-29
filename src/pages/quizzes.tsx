import { graphql, PageProps, Link } from 'gatsby'
import Layout from '../components/layout'
import List from '../components/list'

const QuizzesPage =  ({ data: { quizzes} }: PageProps<Queries.QuizzesPageQuery>) => {
  return <Layout title="Schoolhouse Quizzes">
    <p>
      Access to Schoolhouse Quizzes requires a <Link to="/i/schoolbook/">Schoolbook</Link> item
      from the <Link to="/ql/schoolhouse-rocks/">Schoolhouse Rocks</Link> quest line.
    </p>
    <List items={quizzes.nodes.slice().sort((a, b) => a.jsonId - b.jsonId).map(l => ({
      image: "/img/items/schoolhouse.png",
      lineOne: l.name,
      href: l.fields.path,
    }))} bigLine={true} />
  </Layout>
}

export default QuizzesPage

export const query = graphql`
    query QuizzesPage {
      quizzes: allQuizzesJson {
        nodes {
          jsonId
          name
          fields {
            path
          }
        }
      }
    }
  `
