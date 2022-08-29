import { graphql, PageProps } from 'gatsby'
import Layout from '../components/layout'
import List from '../components/list'

const QuizzesPage =  ({ data: { quizzes} }: PageProps<Queries.QuizzesPageQuery>) => {
  return <Layout title="Schoolhouse Quizzes">
    <List items={quizzes.nodes.slice().sort((a, b) => parseInt(a.jsonId, 10) - parseInt(b.jsonId, 10)).map(l => ({
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
