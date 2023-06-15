import { graphql, PageProps, Link } from "gatsby"
import Table from "react-bootstrap/Table"
import { useState, useContext } from "react"
import Form from "react-bootstrap/Form"
import { css } from "@emotion/react"

import Layout from "../components/layout"
import { GlobalContext } from "../utils/context"
import linkFor from "../utils/links"

type NPCItem = Queries.TownsfolkGridPageNPCItemFragment
type Item = NPCItem["item"]

const cellStyleByAdj = {
  loves: {
    backgroundColor: "rgba(180, 255, 180, 0.8) !important",
  },
  likes: {
    backgroundColor: "rgba(200, 255, 160, 0.25) !important",
  },
  hates: {
    backgroundColor: "rgba(255, 180, 180, 0.5) !important",
  },
}

const emojiByRel = {
  loves: "❤️",
  likes: "✅",
  hates: "❌",
}

const stickyHeaderStyle = css({
  position: "sticky",
  top: 0,
})

const TownsfolkGridPage = ({
  data: {
    farmrpg: { npcs },
  },
}: PageProps<Queries.TownsfolkGridPageQuery>) => {
  const [showLoves, setShowLoves] = useState(true)
  const [showLikes, setShowLikes] = useState(true)
  const [showHates, setShowHates] = useState(false)
  const ctx = useContext(GlobalContext)

  const allItems: string[] = []
  const itemsByName: Record<string, Item> = {}
  const relByNpc = npcs.reduce((p, c) => {
    p[c.name] = {}
    return p
  }, {} as Record<string, Record<string, "loves" | "likes" | "hates">>)

  for (const npc of npcs) {
    for (const ni of npc.npcItems) {
      if (
        (ni.relationship === "loves" && !showLoves) ||
        (ni.relationship === "likes" && !showLikes) ||
        (ni.relationship === "hates" && !showHates)
      ) {
        continue
      }

      if (itemsByName[ni.item.name] === undefined) {
        allItems.push(ni.item.name)
        itemsByName[ni.item.name] = ni.item
      }

      relByNpc[npc.name][ni.item.name] = ni.relationship as "loves" | "likes" | "hates"
    }
  }

  return (
    <Layout title="Townsfolk Grid">
      <p className="d-xl-none">This may not display well on smaller screens.</p>
      <div className="mb-3">
        <Form.Check
          inline
          className="me-5"
          type="switch"
          id="show-loves"
          label={`Show Loves (${emojiByRel.loves})`}
          defaultChecked={showLoves}
          onChange={(e) => setShowLoves(e.target.checked)}
        />
        <Form.Check
          inline
          className="me-5"
          type="switch"
          id="show-likes"
          label={`Show Likes (${emojiByRel.likes})`}
          defaultChecked={showLikes}
          onChange={(e) => setShowLikes(e.target.checked)}
        />
        <Form.Check
          inline
          type="switch"
          id="show-hates"
          label={`Show Hates (${emojiByRel.hates})`}
          defaultChecked={showHates}
          onChange={(e) => setShowHates(e.target.checked)}
        />
      </div>
      <div
        className="table-wrapper"
        css={{ "& > .table-responsive": { height: "calc(100vh - 170px)" } }}
      >
        <Table bordered hover size="sm" responsive>
          <thead className={ctx.settings.darkMode ? "table-dark" : "table-light"}>
            <tr>
              <th css={stickyHeaderStyle}>Item</th>
              {npcs.map((n) => (
                <th key={n.name} css={[{ width: 64 }, stickyHeaderStyle]}>
                  <Link to={linkFor(n)} className="text-body text-decoration-none text-center">
                    <div css={{ marginTop: 5 }}>
                      <img
                        src={`https://farmrpg.com${n.image}`}
                        title={n.name}
                        css={{ width: 40 }}
                      />
                    </div>
                    <div css={{ fontSize: "70%" }}>{(n.shortName || n.name).split(" ")[0]}</div>
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allItems
              .sort((a, b) => a.localeCompare(b))
              .map((i) => (
                <tr key={i}>
                  <td>
                    <Link
                      to={linkFor(itemsByName[i])}
                      className="text-body text-decoration-none text-center"
                    >
                      <div css={{ marginTop: 5 }}>
                        <img
                          src={`https://farmrpg.com${itemsByName[i].image}`}
                          title={itemsByName[i].name}
                          css={{ width: 40 }}
                        />
                      </div>
                      <div css={{ fontSize: "70%" }}>{i}</div>
                    </Link>
                  </td>
                  {npcs.map((n) => (
                    <td
                      key={n.name}
                      css={{
                        textAlign: "center",
                        verticalAlign: "middle",
                        ...cellStyleByAdj[relByNpc[n.name][i]],
                      }}
                    >
                      {emojiByRel[relByNpc[n.name][i]]}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </Table>
      </div>
    </Layout>
  )
}

export default TownsfolkGridPage

export const query = graphql`
  fragment TownsfolkGridPageNPCItem on FarmRPG_NPCItem {
    relationship
    item {
      __typename
      name
      image
    }
  }

  query TownsfolkGridPage {
    farmrpg {
      npcs(filters: { isAvailable: true }, order: { name: ASC }) {
        __typename
        name
        shortName
        image

        npcItems(filters: { item: { canMail: true } }) {
          ...TownsfolkGridPageNPCItem
        }
      }
    }
  }
`
