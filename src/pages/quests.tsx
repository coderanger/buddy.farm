import { graphql, PageProps, Link } from "gatsby"
import { useState } from "react"
import ListGroup from "react-bootstrap/ListGroup"
import Form from "react-bootstrap/Form"

import Layout from "../components/layout"
import linkFor from "../utils/links"

const QuestsPage = ({
  data: {
    farmrpg: { quests, questlines },
  },
}: PageProps<Queries.QuestsPageQuery>) => {
  // Filter states.
  const [filterFrom, setFilterFrom] = useState<string>("")
  const [filterQuestline, setFilterQuestline] = useState<string>("")

  // Do the filtering.
  let filteredQuests = quests
  if (filterFrom !== "") {
    filteredQuests = filteredQuests.filter((q) => q.npc === filterFrom)
  }
  if (filterQuestline !== "") {
    filteredQuests = filteredQuests.filter(
      (q) => q.questlines.find((ql) => ql.questline.title === filterQuestline) !== undefined
    )
  }

  // Filter options.
  const fromOptions: { [key: string]: boolean } = {}
  for (const quest of quests) {
    fromOptions[quest.npc] = true
  }

  return (
    <Layout title={`Quests (${quests.length})`} pageTitle="Quests">
      <div className="d-flex">
        <Form.Select
          onChange={(evt: React.ChangeEvent<HTMLSelectElement>) => setFilterFrom(evt.target.value)}
          className="mx-2"
        >
          <option value="">From</option>
          {Object.keys(fromOptions).map((from) => (
            <option value={from}>{from}</option>
          ))}
        </Form.Select>
        <Form.Select
          onChange={(evt: React.ChangeEvent<HTMLSelectElement>) =>
            setFilterQuestline(evt.target.value)
          }
          className="mx-2"
        >
          <option value="">Questline</option>
          {questlines.map((ql) => (
            <option value={ql.title}>{ql.title}</option>
          ))}
        </Form.Select>
      </div>
      <ListGroup variant="flush">
        {filteredQuests.map((q) => (
          <ListGroup.Item key={q.id}>
            <div className="mb-2 fs-3">
              <Link to={linkFor(q)}>
                <img
                  src={"https://farmrpg.com" + q.image}
                  width="34"
                  height="34"
                  className="d-inline-block align-text-top me-1"
                />
                <span>{q.name}</span>
              </Link>
            </div>
            {q.requiredFarmingLevel !== 0 && (
              <div className="mb-2">
                <span className="fw-bold me-1">Farming:</span>
                {q.requiredFarmingLevel}
              </div>
            )}
            {q.requiredFishingLevel !== 0 && (
              <div className="mb-2">
                <span className="fw-bold me-1">Fishing:</span>
                {q.requiredFishingLevel}
              </div>
            )}
            {q.requiredCraftingLevel !== 0 && (
              <div className="mb-2">
                <span className="fw-bold me-1">Crafting:</span>
                {q.requiredCraftingLevel}
              </div>
            )}
            {q.requiredExploringLevel !== 0 && (
              <div className="mb-2">
                <span className="fw-bold me-1">Exploring:</span>
                {q.requiredExploringLevel}
              </div>
            )}
            {q.requiredCookingLevel !== 0 && (
              <div className="mb-2">
                <span className="fw-bold me-1">Cooking:</span>
                {q.requiredCookingLevel}
              </div>
            )}
            {q.requiredTowerLevel !== 0 && (
              <div className="mb-2">
                <span className="fw-bold me-1">Tower:</span>
                {q.requiredTowerLevel}
              </div>
            )}
            {q.requiredNpc && (
              <div className="mb-2">
                <span className="fw-bold me-1">{q.requiredNpc.name} Friendship:</span>
                {q.requiredNpcLevel}
              </div>
            )}
            <div className="mb-2">
              <span className="fw-bold me-1">From:</span>
              {q.npc}
            </div>
            {!q.isHidden && (
              <div className="mb-2" dangerouslySetInnerHTML={{ __html: q.cleanDescription }} />
            )}
          </ListGroup.Item>
        ))}
      </ListGroup>
    </Layout>
  )
}

export default QuestsPage

export const query = graphql`
  query QuestsPage {
    farmrpg {
      quests(order: { id: ASC }) {
        __typename
        id
        name: title
        image: npcImg
        npc
        requiredFarmingLevel
        requiredFishingLevel
        requiredCraftingLevel
        requiredExploringLevel
        requiredCookingLevel
        requiredTowerLevel
        requiredNpc {
          name
        }
        requiredNpcLevel
        cleanDescription
        startDate
        endDate
        isHidden
        questlines {
          questline {
            title
          }
        }
      }

      questlines(order: { title: ASC }) {
        title
      }
    }
  }
`
