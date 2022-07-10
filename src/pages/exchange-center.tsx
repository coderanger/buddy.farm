import { graphql, Link, PageProps } from 'gatsby'
import { DateTime } from 'luxon'
import ListGroup from 'react-bootstrap/ListGroup'

import { BsFillExclamationCircleFill } from '@react-icons/all-files/bs/BsFillExclamationCircleFill'

import Layout from '../components/layout'
import { useServerTime } from '../hooks/servertime'

// Highlight (or ignore on item pages) trades more than 14 days old at the time fixtures
// were generated because they are probably out of the pool.
export const TRADE_LAST_SEEN_THRESHOLD = 60 * 60 * 24 * 14

interface TradeItemProps {
  item: Queries.ExchangeCenterPageItemFragment
  quantity: number
}

const TradeItem = ({ item, quantity }: TradeItemProps) => {
  return <div>
    <Link to={item.fields.path} className="text-body text-decoration-none">
      <img
        src={`https://farmrpg.com${item.image}`}
        title={item.name}
        className="me-2 align-text-bottom"
        css={{ height: "2rem" }}
      />
      <span className="fs-2">
        {item.name}
        <span className="ms-2 fs-3">
          x{quantity}
        </span>
      </span>
    </Link>
  </div>
}

const UpdateTime = () => {
  const ecUpdate = useServerTime({ exchangeCenter: true })[1]
  return <p>
    The Exchange Center will update in {ecUpdate}.
  </p>
}

const ExchangeCenterPage = ({ data }: PageProps<Queries.ExchangeCenterPageQuery>) => {
  return <Layout title="Exchange Center">
    <UpdateTime />
    <ListGroup variant="flush" css={{ maxWidth: 750, margin: "auto" }}>
      <div className="mb-1 d-flex justify-content-around">
        <div className="fw-bold">Trade In:</div>
        <div className="fw-bold">You Receive:</div>
      </div>
      {data.trades.nodes.map(t => (
        <ListGroup.Item key={t.id}>
          <div className="mb-2 d-flex justify-content-between" gap-3>
            <TradeItem item={t.giveItem} quantity={t.giveQuantity} />
            <TradeItem item={t.receiveItem} quantity={t.receiveQuantity} />
          </div>
          <div className="mb-2">
            <span className="fw-bold me-1">First Seen:</span>
            {DateTime.fromSeconds(t.firstSeen).toLocaleString()}
          </div>
          {!t.oneShot && <div className="mb-2">
            <span className="fw-bold me-1">Last Seen:</span>
            {DateTime.fromSeconds(t.lastSeen).toLocaleString()}
            {t.lastSeenRelative > TRADE_LAST_SEEN_THRESHOLD && <BsFillExclamationCircleFill className="text-danger ms-2 align-text-bottom" css={{ width: 20, height: 20 }} />}
          </div>}
          {t.oneShot && <div className="mb-2">
            <span className="fw-bold me-1">One Shot</span>
          </div>}
        </ListGroup.Item>
      ))}
    </ListGroup>
  </Layout>
}

export default ExchangeCenterPage

export const query = graphql`
  fragment ExchangeCenterPageItem on ItemsJson {
    jsonId
    name
    image
    fields {
      path
    }
  }

  query ExchangeCenterPage {
    trades: allTradesJson(sort: {fields: [firstSeen, giveItem___name], order: [DESC, ASC]}) {
      nodes {
        id
        jsonId
        giveItem {
          ...ExchangeCenterPageItem
        }
        giveQuantity
        receiveItem {
          ...ExchangeCenterPageItem
        }
        receiveQuantity
        firstSeen
        lastSeen
        lastSeenRelative
        oneShot
      }
    }
  }
`
