import { graphql, useStaticQuery } from 'gatsby'
import { useState } from 'react'
import ListGroup from 'react-bootstrap/ListGroup'
import Form from "react-bootstrap/Form"

import Layout from '../components/layout'

interface Quest {
  jsonId: string
  name: string
  from: string
  fromImage: string
  requiresFarming: number | null
  requiresFishing: number | null
  requiresCrafting: number | null
  requiresExploring: number | null
  text: string
  fields: {
    path: string
  }
  extra: {
    questlines: string[]
    availableFrom: number | null
    availableTo: number | null
  }
}

interface QuestsQuery {
  quests: {
    nodes: Quest[]
  }
  questlines: {
    nodes: {
      name: string
    }[]
  }
}

export default () => {
  let data: QuestsQuery = useStaticQuery(graphql`
    query {
      quests: allQuestsJson {
        nodes {
          jsonId
          name
          from
          fromImage
          requiresFarming
          requiresFishing
          requiresCrafting
          requiresExploring
          text
          fields {
            path
          }
          extra {
            questlines
            availableFrom
            availableTo
          }
        }
      }

      questlines: allQuestlinesJson {
        nodes {
          name
        }
      }
    }
  `)

  // Filter states.
  const [filterFrom, setFilterFrom] = useState<string>("")
  const [filterQuestline, setFilterQuestline] = useState<string>("")

  // Do the filtering.
  let quests = data.quests.nodes
  if (filterFrom !== "") {
    quests = quests.filter(q => q.from == filterFrom)
  }
  if (filterQuestline !== "") {
    quests = quests.filter(q => q.extra.questlines.includes(filterQuestline))
  }
  quests = quests.sort((a, b) => parseInt(a.jsonId, 10) - parseInt(b.jsonId, 10))

  // Filter options.
  const fromOptions: { [key: string]: boolean } = {}
  for (const quest of data.quests.nodes) {
    fromOptions[quest.from] = true
  }

  return <Layout pageTitle="Quests">
    <h1>Quests ({quests.length})</h1>
    <div className="d-flex">
      <Form.Select onChange={(evt: React.ChangeEvent<HTMLSelectElement>) => setFilterFrom(evt.target.value)} className="mx-2">
        <option value="">From</option>
        {Object.keys(fromOptions).map(from => (
          <option value={from}>{from}</option>
        ))}
      </Form.Select>
      <Form.Select onChange={(evt: React.ChangeEvent<HTMLSelectElement>) => setFilterQuestline(evt.target.value)} className="mx-2">
        <option value="">Questline</option>
        {data.questlines.nodes.map(ql => (
          <option value={ql.name}>{ql.name}</option>
        ))}
      </Form.Select>
    </div>
    <ListGroup variant="flush">
      {quests.map(q => (
        <ListGroup.Item key={q.jsonId}>
          <div className="mb-2 fs-3">
            <img src={"https://farmrpg.com" + q.fromImage} width="34" height="34" className="d-inline-block align-text-top me-1" />
            <span>{q.name}</span>
          </div>
          {q.requiresFarming && <div className="mb-2">
            <span className="fw-bold me-1">Farming:</span>
            {q.requiresFarming}
          </div>}
          {q.requiresFishing && <div className="mb-2">
            <span className="fw-bold me-1">Fishing:</span>
            {q.requiresFishing}
          </div>}
          {q.requiresCrafting && <div className="mb-2">
            <span className="fw-bold me-1">Crafting:</span>
            {q.requiresCrafting}
          </div>}
          {q.requiresExploring && <div className="mb-2">
            <span className="fw-bold me-1">Exploring:</span>
            {q.requiresExploring}
          </div>}
          <div className="mb-2">
            <span className="fw-bold me-1">From:</span>
            {q.from}
          </div>
          <div className="mb-2">
            {q.text}
          </div>
        </ListGroup.Item>
      ))}
    </ListGroup>
  </Layout>
}
