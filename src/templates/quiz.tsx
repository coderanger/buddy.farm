import { graphql, PageProps, Link } from 'gatsby'

import Layout from '../components/layout'
import List from '../components/list'

export default ({ data: { maybeQuiz } }: PageProps<Queries.QuizTemplateQuery>) => {
  const quiz = maybeQuiz!

  const header = {
    name: quiz.name,
    image: "/img/items/schoolhouse.png",
    fields: quiz.fields,
  }

  const rewardsListItems = quiz.rewards.slice().sort((a,b) => a.score - b.score).map(r => ({
    lineOne: r.item.name,
    lineTwo: `Score ${r.score}%${r.score < 100 ? " or better" : ""}`,
    image: r.item.image,
    href: r.item.fields.path,
    value: r.amount.toLocaleString(),
  }))

  return <Layout headerFrom={header}>
    <p><Link to="/quizzes/">Back to all quizzes</Link></p>
    <p>{quiz.description.replace(/<br.*\/?>/, " ")}</p>
    <List items={rewardsListItems} />
    {quiz.answers.slice().sort((a, b) => a.display_order - b.display_order).map(a => (
      <List label={a.question} items={[
        a.answer1,
        a.answer2,
        a.answer3,
        a.answer4,
      ].filter(an => an !== "").map((an, i) => ({
          lineOne: an,
          background: a.correct === i + 1 ? "rgba(180, 255, 180, 0.5) !important" : undefined,
          value: a.correct === i + 1 ? "✅" : ""
      }))} bigLine={true} />
    ))}
  </Layout >
}

export const pageQuery = graphql`
  query QuizTemplate($name: String!) {
    maybeQuiz: quizzesJson(name: {eq: $name}) {
      name
      description
      fields {
        path
      }

      rewards {
        score
        amount
        item {
          name
          image
          fields {
            path
          }
        }
      }

      answers {
        question
        display_order
        answer1
        answer2
        answer3
        answer4
        correct
      }
    }
  }
`
