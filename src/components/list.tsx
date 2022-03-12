import { navigate } from "gatsby"
import OverlayTrigger from "react-bootstrap/OverlayTrigger"
import Tooltip from "react-bootstrap/Tooltip"
import ListGroup from "react-bootstrap/ListGroup"
import { BsFillExclamationTriangleFill } from "@react-icons/all-files/bs/BsFillExclamationTriangleFill"
import { BsFillExclamationCircleFill } from "@react-icons/all-files/bs/BsFillExclamationCircleFill"
import { BsFillQuestionCircleFill } from "@react-icons/all-files/bs/BsFillQuestionCircleFill"

export interface ListItem {
  jsonId: string
  image: string
  lineOne: string
  lineTwo?: string | false | null | undefined
  value?: string | false | null | undefined
  href?: string | false | null | undefined
  hrefSlugify?: string | false | null | undefined
  alert?: string
  alertIcon?: string
}

interface ListProps {
  items: ListItem[]
}

const alertIcon = (alertIcon: string | undefined) => {
  switch (alertIcon) {
    case "warning":
      return <BsFillExclamationTriangleFill className="text-warning" />
    case "error":
      return <BsFillExclamationCircleFill className="text-danger" />
    default:
      return <BsFillQuestionCircleFill className="text-info" />
  }
}

export default ({ items }: ListProps) => (
  <ListGroup variant="flush">
    {items.map((item: ListItem) => {
      const href = item.href || (item.hrefSlugify && `/${item.hrefSlugify.toLowerCase().replace(/\s+/g, '-')}/`)
      const alert = item.alert && <OverlayTrigger overlay={
        <Tooltip>{item.alert}</Tooltip>
      }>
        <span className="bf-list-alert" css={{ marginRight: 10, fontSize: 26, display: "inline-block", verticalAlign: "text-bottom" }}>{alertIcon(item.alertIcon)}</span>
      </OverlayTrigger>
      const onClick = (evt: React.MouseEvent) => {
        evt.preventDefault()
        // Typescript doesn't know about .closest().
        // @ts-ignore
        if (href && evt.target.closest(".bf-list-alert") === null) {
          navigate(href)
        }
      }
      return <ListGroup.Item key={item.jsonId} className="d-flex w-100 justify-content-between" onClick={onClick}>
        <div>
          <img src={"https://farmrpg.com" + item.image} className="d-inline-block align-text-top" width="48" height="48" css={{ marginRight: 10, boxSizing: "border-box" }} />
          <div className="d-inline-block align-text-top">
            <div css={{ fontWeight: "bold" }}>{item.lineOne}</div>
            <div>{item.lineTwo}</div>
          </div>
        </div>
        <div>
          {alert}
          <span css={{ fontSize: 32 }}>{item.value}</span>
        </div>
      </ListGroup.Item>
    })}
  </ListGroup>
)
