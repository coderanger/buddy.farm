import { graphql, Link, PageProps } from "gatsby"
import { DateTime } from "luxon"
import React from "react"
import Col from "react-bootstrap/Col"
import ListGroup from "react-bootstrap/ListGroup"
import Row from "react-bootstrap/Row"
import SunCalc from "suncalc"

import Layout from "../components/layout"
import { useServerTime } from "../hooks/servertime"
import linkFor from "../utils/links"

type ListItem =
  | Queries.IndexPageQuery["farmrpg"]["items"][0]
  | Queries.IndexPageQuery["farmrpg"]["quests"][0]
  | { name: string; image: string; href: string }

// These are close but not quite to (x+0.5)/8 thresholds.
// The game must have a very slightly different moon phase computation
// than I am using or there's some floating point fuckery going on. So
// we just have to cope with ugly numbers. These are the averages of the
// extremes of each range as of 2022-03-26.
const marketLevelThresholds = [
  { threshold: 0.186548029946974, level: "Stable", delta: 1000 },
  { threshold: 0.315270295676886, level: "Unstable", delta: 2500 },
  { threshold: 0.439552597908727, level: "Risky", delta: 10000 },
  { threshold: 0.563290665191551, level: "Wild", delta: 25000 },
  { threshold: 0.688827541911547, level: "Risky", delta: 10000 },
  { threshold: 0.817178892856435, level: "Unstable", delta: 2500 },
  { threshold: 1, level: "Stable", delta: 1000 },
]

const marketLevel = (date: DateTime) => {
  const moon = SunCalc.getMoonIllumination(date.toJSDate())
  for (const market of marketLevelThresholds) {
    if (moon.phase < market.threshold) {
      return { level: market.level, delta: market.delta, phase: moon.phase }
    }
  }
  throw `Unable to find market level for ${date}`
}

const SteakMarketForecastDay = ({ days }: { days: number }) => {
  const date = DateTime.now().setZone("America/Chicago").startOf("day").plus({ days })
  const market = marketLevel(date)

  return (
    <div className="d-inline-block me-3">
      <div className="d-flex justify-content-center">
        {date.toLocaleString({ month: "short", day: "numeric" })}
      </div>
      <div className="d-flex justify-content-center fw-bolder">{market.level}</div>
      <div className="small">
        {(50000 - market.delta).toLocaleString()}-{(50000 + market.delta).toLocaleString()}
      </div>
    </div>
  )
}

const SteakMarketForecast = () => (
  <>
    <h5>Steak Market Forecast</h5>
    <div className="d-flex flex-wrap justify-content-evenly">
      <SteakMarketForecastDay days={0} />
      <SteakMarketForecastDay days={1} />
      <SteakMarketForecastDay days={2} />
    </div>
  </>
)

interface MiniListProps {
  label: string
  items: readonly ListItem[]
}

const MiniList = ({ label, items }: MiniListProps) => (
  <>
    <h5 className="mb-1">{label}</h5>
    <ListGroup variant="flush">
      {items.map((it) => (
        <ListGroup.Item className="px-0" key={it.name}>
          <Link
            to={"href" in it ? it.href : linkFor(it)}
            css={{
              color: "inherit",
              textDecoration: "inherit",
              "&:hover": { color: "inherit", textDecoration: "underline" },
            }}
          >
            <img
              src={"https://farmrpg.com" + it.image}
              className="d-inline-block align-text-top"
              width="20"
              height="20"
              css={{ marginRight: 10, boxSizing: "border-box" }}
            />
            {it.name}
          </Link>
        </ListGroup.Item>
      ))}
    </ListGroup>
  </>
)

const ServerTime = () => {
  const [time, rollover] = useServerTime()

  return (
    <>
      <h5 className="mb-1">Server Time</h5>
      <div>
        <div>
          Server Time is <strong>{time}</strong>
        </div>
        <div>
          Daily Reset in <strong>{rollover}</strong>
        </div>
      </div>
    </>
  )
}

const IndexPage = ({
  data: {
    farmrpg: { items, quests },
  },
}: PageProps<Queries.IndexPageQuery>) => {
  return (
    <Layout pageTitle="Buddy's Almanac">
      <h1>Welcome to Buddy's Almanac</h1>
      <div>
        <p>
          This is a repository of game information for <a href="https://farmrpg.com/">Farm RPG</a>.
        </p>
        <p>Use the search box above to look up items, locations, pets, quests, or more!</p>
        <p>
          Check out the <Link to="/settings/">settings</Link> to configure your perks and other
          preferences. Yes there is a dark mode now. All data is player-contributed and may not
          always be accurate. Do not complain to the Farm RPG team if anything here does not match
          reality, tell Coderanger.
        </p>
      </div>
      <Row>
        <Col sm>
          <div>
            <SteakMarketForecast />
          </div>
          <div className="mt-3">
            <MiniList
              label="Useful Links"
              items={[
                {
                  name: "House of Cards",
                  image: "/img/items/joker.png",
                  href: "/cards/",
                },
                {
                  name: "Townsfolk",
                  image: "/img/items/town_sm.png",
                  href: "/townsfolk/",
                },
                {
                  name: "Schoolhouse Quizzes",
                  image: "/img/items/schoolhouse.png",
                  href: "/quizzes/",
                },
                { name: "The Tower", image: "/img/items/tower.png", href: "/tower/" },
                {
                  name: "Level Rewards",
                  image: "/img/items/7447.png",
                  href: "/level-rewards/",
                },
                {
                  name: "Exploring",
                  image: "/img/items/6075.png",
                  href: "/exploring/",
                },
                { name: "Fishing", image: "/img/items/7783.png", href: "/fishing/" },
                {
                  name: "Calculators",
                  image: "/img/items/7210.png",
                  href: "/calculators/",
                },
                {
                  name: "Profile Backgrounds",
                  image: "/img/emblems/def.png",
                  href: "/backgrounds/",
                },
                {
                  name: "Mailbox Passwords",
                  image: "/img/items/postoffice.png",
                  href: "/passwords/",
                },
                {
                  name: "Exchange Center",
                  image: "/img/items/exchange.png?1",
                  href: "/exchange-center/",
                },
                { name: "Random", image: "/img/items/buddy.png", href: "/random/" },
              ]}
            />
          </div>
        </Col>
        <Col sm>
          <MiniList label="New Quests" items={quests} />
          <div className="mt-2">
            <ServerTime />
          </div>
        </Col>
        <Col sm>
          <MiniList label="New Items" items={items} />
        </Col>
      </Row>
      <div className="mt-5">
        <p>Please contact Coderanger in-game or on Discord with any questions or feedback.</p>
      </div>
    </Layout>
  )
}

export default IndexPage

export const query = graphql`
  query IndexPage {
    farmrpg {
      items(order: { createdAt: DESC }, pagination: { limit: 5 }) {
        __typename
        name
        image
      }

      quests(order: { createdAt: DESC }, pagination: { limit: 5 }) {
        __typename
        name: cleanTitle
        image: npcImg
      }
    }
  }
`
