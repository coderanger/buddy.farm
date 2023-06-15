import { graphql, PageProps, Link } from "gatsby"
import React from "react"
import ListGroup from "react-bootstrap/ListGroup"

import Layout from "../components/layout"
import linkFor from "../utils/links"
import { useServerTime } from "../hooks/servertime"

interface Item {
  __typename: string
  name: string
  image: string
}

const CARD_ITEMS = {
  spades: {
    __typename: "FarmRPG_Item",
    name: "Spades",
    image: "/img/items/card_spades.png",
  } as Item,
  hearts: {
    __typename: "FarmRPG_Item",
    name: "Hearts",
    image: "/img/items/card_hearts.png",
  } as Item,
  diamonds: {
    __typename: "FarmRPG_Item",
    name: "Diamonds",
    image: "/img/items/card_diamonds.png",
  } as Item,
  clubs: {
    __typename: "FarmRPG_Item",
    name: "Clubs",
    image: "/img/items/card_clubs.png",
  } as Item,
  joker: {
    __typename: "FarmRPG_Item",
    name: "Joker",
    image: "/img/items/joker.png",
  } as Item,
}

interface CardItemProps {
  item: Item
  quantity: number | null
}

const CardItem = ({ item, quantity }: CardItemProps) => {
  if (!quantity) {
    return <></>
  }

  return (
    <div>
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
  const update = useServerTime()[1]
  return <p>The House of Cards will update in {update}.</p>
}

const CardsPage = ({
  data: {
    farmrpg: { cardsTrades },
  },
}: PageProps<Queries.CardsPageQuery>) => {
  return (
    <Layout title="House of Cards">
      <UpdateTime />
      <ListGroup variant="flush" css={{ maxWidth: 750, margin: "auto" }}>
        <div className="mb-1 d-flex justify-content-around">
          <div className="fw-bold">Trade In:</div>
          <div className="fw-bold">You Receive:</div>
        </div>
        {cardsTrades.map((t) => (
          <ListGroup.Item key={t.id} id={t.id.toString()}>
            <div className="mb-2 d-flex justify-content-between" gap-3>
              <div>
                <CardItem item={CARD_ITEMS.spades} quantity={t.spadesQuantity} />
                <CardItem item={CARD_ITEMS.hearts} quantity={t.heartsQuantity} />
                <CardItem item={CARD_ITEMS.diamonds} quantity={t.diamondsQuantity} />
                <CardItem item={CARD_ITEMS.clubs} quantity={t.clubsQuantity} />
                <CardItem item={CARD_ITEMS.joker} quantity={t.jokerQuantity} />
              </div>
              <div className="text-end">
                <CardItem item={t.outputItem} quantity={t.outputQuantity} />
              </div>
            </div>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </Layout>
  )
}

export default CardsPage

export const query = graphql`
  query CardsPage {
    farmrpg {
      cardsTrades(filters: { isDisabled: false }, order: { id: ASC }) {
        id
        spadesQuantity
        heartsQuantity
        diamondsQuantity
        clubsQuantity
        jokerQuantity
        outputItem {
          __typename
          name
          image
        }
        outputQuantity
      }
    }
  }
`
