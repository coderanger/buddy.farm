import { Link } from 'gatsby'
import * as React from 'react'
import ListGroup from 'react-bootstrap/ListGroup'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Tooltip from 'react-bootstrap/Tooltip'

import { css } from '@emotion/react'
import { BsFillExclamationCircleFill } from '@react-icons/all-files/bs/BsFillExclamationCircleFill'
import {
  BsFillExclamationTriangleFill
} from '@react-icons/all-files/bs/BsFillExclamationTriangleFill'
import { BsFillQuestionCircleFill } from '@react-icons/all-files/bs/BsFillQuestionCircleFill'

import { CopyButton } from '../components/clipboard'
import { classNames } from '../utils/classnames'

export interface ListItem {
  key?: string
  image?: string
  lineOne: Exclude<React.ReactNode, boolean | null | undefined>
  lineTwo?: React.ReactNode | false | null | undefined
  value?: React.ReactNode | false | null | undefined
  href?: string | false | null | undefined
  hrefSlugify?: string | false | null | undefined
  alert?: string | null
  alertIcon?: string | null
  onClick?: React.MouseEventHandler<HTMLDivElement>
  copyText?: string
  background?: string
}

interface ListItemProps {
  item: ListItem
  bigLine: boolean | undefined
}

type listPropsBase = Parameters<typeof ListGroup>[0]
interface ListProps extends listPropsBase {
  label?: string
  labelAnchor?: string
  items: ListItem[]
  bigLine?: boolean
  copyText?: string
  shrink?: undefined | "none" | "key" | "value" | "both"
}

const alertIcon = (alertIcon: string | null | undefined) => {
  switch (alertIcon) {
    case "warning":
      return <BsFillExclamationTriangleFill className="text-warning" />
    case "error":
      return <BsFillExclamationCircleFill className="text-danger" />
    default:
      return <BsFillQuestionCircleFill className="text-info" />
  }
}

const listDivStyle = css({
  flexShrink: 0,
  maxWidth: "100%",
})

const listKeyDivStyle = css(listDivStyle, {
  ".bf-list-shrink-key &": { flexShrink: 1 },
})

const listValueDivStyle = css(listDivStyle, {
  ".bf-list-shrink-value &": { flexShrink: 1 },
})


const bigLineStyle = css({
  fontSize: 32,
  lineHeight: "48px",
  fontWeight: "normal",
  "@media (max-width: 576px)": {
    fontSize: 16,
    fontWeight: "bold",
  }
})

const listLineOneStyle = css({
  fontWeight: "bold",
  ".bf-list-big-line &.bf-list-line-one-allow-big": bigLineStyle,
})

const listValueStyle = css([bigLineStyle])

const ListItem = ({ item }: ListItemProps) => {
  const href = item.href || (item.hrefSlugify && `/${item.hrefSlugify.toLowerCase().replace(/\s+/g, '-')}/`)
  const alert = item.alert && <OverlayTrigger overlay={
    <Tooltip>{item.alert}</Tooltip>
  }>
    <span className="bf-list-alert" css={{ marginRight: 10, fontSize: 26, display: "inline-block", verticalAlign: "text-bottom" }} onClick={evt => evt.preventDefault()}>{alertIcon(item.alertIcon)}</span>
  </OverlayTrigger>
  let elm = <>
    <div className="d-flex" css={listKeyDivStyle}>
      {item.image && <img src={"https://farmrpg.com" + item.image} className="d-inline-block align-text-top bf-list-image" width="48" height="48" css={{ marginRight: 10, boxSizing: "border-box" }} />}
      <div className="d-inline-block align-text-top flex-shrink-1">
        <div className={`bf-list-line-one ${item.lineTwo ? "" : "bf-list-line-one-allow-big"}`} css={listLineOneStyle}>{item.lineOne}</div>
        <div className="bf-list-line-two">{item.lineTwo}</div>
      </div>
    </div>
    <div className="d-flex justify-content-end" css={listValueDivStyle}>
      {alert}
      <span className="bf-list-value d-flex justify-content-end" css={typeof item.value === "string" ? listValueStyle : {}}>{item.value}</span>
    </div>
  </>
  if (href) {
    elm = <Link className="d-flex w-100 justify-content-between" css={{ flexWrap: "wrap", color: "inherit", textDecoration: "inherit", "&:hover": { color: "inherit" } }} to={href}>{elm}</Link>
  }
  return <ListGroup.Item className={`d-flex w-100 justify-content-between gap-4 ${item.copyText ? "clipboard" : ""}`} css={{backgroundColor: item.background}} onClick={item.onClick} data-clipboard-text={item.copyText}>{elm}</ListGroup.Item>
}

export default ({ label, labelAnchor, items, bigLine, copyText, shrink, className, ...props }: ListProps) => (
  <>
    {label && items.length > 0 && <h3 id={labelAnchor} css={{ marginTop: 20 }}>{label}{copyText && <CopyButton text={copyText} />}</h3>}
    <ListGroup
      variant="flush"
      {...props}
      className={classNames(className, {
        "bf-list-big-line": bigLine,
        "bf-list-shrink-key": shrink === undefined || shrink === "key" || shrink === "both",
        "bf-list-shrink-value": shrink === "value" || shrink === "both",
      })}>
      {items.map((item: ListItem) => <ListItem key={item.key || item.lineOne.toString()} item={item} bigLine={bigLine} />)}
    </ListGroup>
  </>
)
