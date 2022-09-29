import { graphql, PageProps, Link } from "gatsby"
import Layout from "../components/layout"
import Table from "react-bootstrap/Table"
import { useState, useContext } from "react"
import Form from "react-bootstrap/Form"
import { css } from "@emotion/react"
import { GlobalContext } from "../utils/context"

type Item = Queries.TownsfolkGridPageQuery["items"]["nodes"][0]["item"]

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

const emojiByAdj = {
  loves: "❤️",
  likes: "✅",
  hates: "❌",
}

const stickyHeaderStyle = css({
  position: "sticky",
  top: 0,
})

const TownsfolkGridPage = ({
  data: { npcs, items },
}: PageProps<Queries.TownsfolkGridPageQuery>) => {
  const [showLoves, setShowLoves] = useState(true)
  const [showLikes, setShowLikes] = useState(true)
  const [showHates, setShowHates] = useState(false)
  const ctx = useContext(GlobalContext)

  const allItems: string[] = []
  const itemsByName: Record<string, Item> = {}
  const adjByNpc = npcs.nodes.reduce((p, c) => {
    p[c.name] = {}
    return p
  }, {} as Record<string, Record<string, "loves" | "likes" | "hates">>)

  for (const item of items.nodes) {
    if (
      (item.adjective === "loves" && !showLoves) ||
      (item.adjective === "likes" && !showLikes) ||
      (item.adjective === "hates" && !showHates)
    ) {
      continue
    }

    if (itemsByName[item.item.name] === undefined) {
      allItems.push(item.item.name)
      itemsByName[item.item.name] = item.item
    }

    adjByNpc[item.npc_name][item.item.name] = item.adjective as "loves" | "likes" | "hates"
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
          label={`Show Loves (${emojiByAdj.loves})`}
          defaultChecked={showLoves}
          onChange={(e) => setShowLoves(e.target.checked)}
        />
        <Form.Check
          inline
          className="me-5"
          type="switch"
          id="show-likes"
          label={`Show Likes (${emojiByAdj.likes})`}
          defaultChecked={showLikes}
          onChange={(e) => setShowLikes(e.target.checked)}
        />
        <Form.Check
          inline
          type="switch"
          id="show-hates"
          label={`Show Hates (${emojiByAdj.hates})`}
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
              {npcs.nodes.map((n) => (
                <th key={n.name} css={[{ width: 64 }, stickyHeaderStyle]}>
                  <Link to={n.fields.path} className="text-body text-decoration-none text-center">
                    <div css={{ marginTop: 5 }}>
                      <img
                        src={`https://farmrpg.com${n.image}`}
                        title={n.name}
                        css={{ width: 40 }}
                      />
                    </div>
                    <div css={{ fontSize: "70%" }}>{(n.short_name || n.name).split(" ")[0]}</div>
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allItems.map((i) => (
              <tr key={i}>
                <td>
                  <Link
                    to={itemsByName[i].fields.path}
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
                {npcs.nodes.map((n) => (
                  <td
                    key={n.name}
                    css={{
                      textAlign: "center",
                      verticalAlign: "middle",
                      ...cellStyleByAdj[adjByNpc[n.name][i]],
                    }}
                  >
                    {emojiByAdj[adjByNpc[n.name][i]]}
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
  query TownsfolkGridPage {
    npcs: allNpcsJson(sort: { fields: name }) {
      nodes {
        name
        short_name
        image
        fields {
          path
        }
      }
    }

    items: allNpcItemsJson(sort: { fields: item___name }) {
      nodes {
        adjective
        npc_name
        item {
          name
          image
          fields {
            path
          }
        }
      }
    }
  }
`
