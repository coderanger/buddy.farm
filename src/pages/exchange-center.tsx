import { graphql, Link, PageProps } from "gatsby"
import { DateTime } from "luxon"
import ListGroup from "react-bootstrap/ListGroup"
import OverlayTrigger from "react-bootstrap/OverlayTrigger"
import Tooltip from "react-bootstrap/Tooltip"

import { BsFillExclamationCircleFill } from "@react-icons/all-files/bs/BsFillExclamationCircleFill"

import Layout from "../components/layout"
import { useServerTime } from "../hooks/servertime"
import linkFor from "../utils/links"
import { classNames } from "../utils/classnames"

// Highlight (or ignore on item pages) trades more than 14 days old at the time fixtures
// were generated because they are probably out of the pool.
export const TRADE_LAST_SEEN_THRESHOLD = 60 * 60 * 24 * 14

interface TradeItemProps {
  item: Queries.ExchangeCenterPageItemFragment
  quantity: number
  right: boolean
}

const TradeItem = ({ item, quantity, right }: TradeItemProps) => {
  return (
    <div className={classNames({ "text-end": right })}>
      <Link to={linkFor(item)} className="text-body text-decoration-none">
        <img
          src={`https://farmrpg.com${item.image}`}
          title={item.name}
          className="me-2 align-text-bottom"
          css={{ height: "2rem" }}
        />
        <span className="fs-2">
          {item.name}
          <span className="ms-2 fs-3">x{quantity}</span>
        </span>
      </Link>
    </div>
  )
}

const UpdateTime = () => {
  const ecUpdate = useServerTime({ exchangeCenter: true })[1]
  return <p>The Exchange Center will update in {ecUpdate}.</p>
}

const ExchangeCenterPage = ({
  data: {
    farmrpg: { trades },
  },
}: PageProps<Queries.ExchangeCenterPageQuery>) => {
  return (
    <Layout title="Exchange Center">
      <UpdateTime />
      <ListGroup variant="flush" css={{ maxWidth: 750, margin: "auto" }}>
        <div className="mb-1 d-flex justify-content-around">
          <div className="fw-bold">Trade In:</div>
          <div className="fw-bold">You Receive:</div>
        </div>
        {trades
          .map((t) => ({ ...t, lastSeen: DateTime.fromISO(t.lastSeen) }))
          .map((t) => (
            <ListGroup.Item key={t.id}>
              <div className="mb-2 d-flex justify-content-between" gap-3>
                <TradeItem item={t.inputItem} quantity={t.inputQuantity} right={false} />
                <TradeItem item={t.outputItem} quantity={t.outputQuantity} right={true} />
              </div>
              <div className="mb-2">
                <span className="fw-bold me-1">First Seen:</span>
                {DateTime.fromISO(t.firstSeen).toLocaleString()}
              </div>
              {!t.oneshot && (
                <div className="mb-2">
                  <span className="fw-bold me-1">Last Seen:</span>
                  {t.lastSeen.toLocaleString()}
                  {t.lastSeen.diffNow("seconds").seconds * -1 > TRADE_LAST_SEEN_THRESHOLD && (
                    <OverlayTrigger
                      overlay={
                        <Tooltip>
                          This trade has not been seen in{" "}
                          {Math.floor(t.lastSeen.diffNow("days").days * -1)} days and is likely no
                          longer available
                        </Tooltip>
                      }
                    >
                      <span>
                        <BsFillExclamationCircleFill
                          className="text-danger ms-2 align-text-bottom"
                          css={{ width: 20, height: 20 }}
                        />
                      </span>
                    </OverlayTrigger>
                  )}
                </div>
              )}
              {t.oneshot && (
                <div className="mb-2">
                  <span className="fw-bold me-1">One Shot</span>
                </div>
              )}
            </ListGroup.Item>
          ))}
      </ListGroup>
    </Layout>
  )
}

export default ExchangeCenterPage

export const query = graphql`
  fragment ExchangeCenterPageItem on FarmRPG_Item {
    __typename
    name
    image
  }

  query ExchangeCenterPage {
    farmrpg {
      trades(order: { firstSeen: DESC, inputItem: { name: ASC } }) {
        id
        inputItem {
          ...ExchangeCenterPageItem
        }
        inputQuantity
        outputItem {
          ...ExchangeCenterPageItem
        }
        outputQuantity
        firstSeen
        lastSeen
        oneshot
      }
    }
  }
`
