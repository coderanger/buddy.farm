
import { navigate } from "gatsby"
import ListGroup from "react-bootstrap/ListGroup"

interface ListItem {
  image: string
  lineOne: string
  lineTwo: string
  value: string
  href?: string | false | null | undefined
  hrefSlugify?: string | false | null | undefined
}

interface ListProps {
  items: ListItem[]
}

export default ({items} : ListProps) => (
    <ListGroup variant="flush">
    {items.map((item: ListItem) => {
      const href = item.href || (item.hrefSlugify && `/${item.hrefSlugify.toLowerCase().replace(/\s+/g, '-')}/`)
      return <ListGroup.Item className="d-flex w-100 justify-content-between" onClick={evt => {evt.preventDefault(); href && navigate(href)}}>
        <div>
          <img src={"https://farmrpg.com" + item.image} className="d-inline-block align-text-top" width="48" height="48" css={{marginRight: 10, boxSizing: "border-box"}} />
          <div className="d-inline-block align-text-top">
            <div css={{fontWeight: "bold"}}>{item.lineOne}</div>
            <div>{item.lineTwo}</div>
          </div>
        </div>
        <div css={{fontSize: 32}}>{item.value}</div>
      </ListGroup.Item>
    })}
  </ListGroup>
)
