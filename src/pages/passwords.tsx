import { graphql, useStaticQuery } from 'gatsby'
import React, { useContext } from 'react'
import Accordion from 'react-bootstrap/Accordion'
import Button from 'react-bootstrap/Button'

import { css } from '@emotion/react'

import { CopyButton } from '../components/clipboard'
import Layout from '../components/layout'
import List from '../components/list'
import { useDebounceAfter } from '../hooks/debounce'
import { useSettings } from '../hooks/settings'
import { GlobalContext } from '../utils/context'

const SPECIAL_IMAGES: { [key: string]: string } = {
  Silver: "/img/items/silver.png",
  Gold: "/img/items/gold.png",
  Masked: "/img/items/item.png",
}

interface Password {
  jsonId: number
  group: string
  password: string
  clue1: string
  clue2: string
  clue3: string
  silver: number | null
  gold: number | null
  items: {
    quantity: number
    item: {
      jsonId: string
      name: string
      image: string
      fields: {
        path: string
      }
    }
  }[]
}

interface MaskedStringProps {
  show: boolean
  copyButton?: boolean
  value?: boolean
  children: string
}

const maskedStringStyle = css({
  fontSize: 32,
  lineHeight: "48px",
  fontWeight: "normal",
  // A different breakpoint than the usual for the list value because these are longer.
  "@media (max-width: 768px)": {
    fontSize: 16,
    lineHeight: "24px",
    // No bold for the small screen value, it reads better here IMO.
  }
})

const maskedStringStyleMasked = css({
  userSelect: "none",
  backgroundColor: "#212529",
  color: "#212529",
  "html.dark &": {
    backgroundColor: "#3b3b3b",
    color: "#3b3b3b",
  },
  "& button": {
    visibility: "hidden",
  },
})



const MaskedString = ({ show, copyButton, value, children }: MaskedStringProps) => {
  const cssToUse = []
  if (!show) {
    cssToUse.push(maskedStringStyleMasked)
  }
  if (value) {
    cssToUse.push(maskedStringStyle)
  }
  return <span key={`${children}-${show}`} css={cssToUse}>
    {children}
    {copyButton && <CopyButton text={children} />}
  </span>
}

interface PasswordListProps {
  pw: Password
  used: number
  setUsed: (arg0: number) => void
  showDefault: boolean
}

const PasswordList = ({ pw, used, setUsed, showDefault }: PasswordListProps) => {
  const onClick = useDebounceAfter(() => setUsed(showDefault ? 5 : used + 1), 500)

  const listItems = []

  if (!showDefault) {
    listItems.push(
      { lineOne: "Clue 1", value: <MaskedString show={used >= 1} value={true}>{pw.clue1}</MaskedString> },
      { lineOne: "Clue 2", value: <MaskedString show={used >= 2} value={true}>{pw.clue2}</MaskedString> },
      { lineOne: "Clue 3", value: <MaskedString show={used >= 3} value={true}>{pw.clue3}</MaskedString> },
    )
  }

  const showPw = used >= 4 || !!showDefault

  listItems.push(
    {
      lineOne: "Password",
      value: <MaskedString show={showPw} copyButton={true} value={true}>{pw.password}</MaskedString>,
      copyText: showPw ? pw.password : undefined
    },
  )

  if (pw.silver) {
    listItems.push(
      { image: showPw ? SPECIAL_IMAGES.Silver : SPECIAL_IMAGES.Masked, key: "silver", lineOne: <MaskedString show={showPw}>Silver</MaskedString>, value: <MaskedString show={showPw} value={true}>{pw.silver.toLocaleString()}</MaskedString> }
    )
  }

  if (pw.gold) {
    listItems.push(
      { image: showPw ? SPECIAL_IMAGES.Gold : SPECIAL_IMAGES.Masked, key: "gold", lineOne: <MaskedString show={showPw}>Gold</MaskedString>, value: <MaskedString show={showPw} value={true}>{pw.gold.toLocaleString()}</MaskedString> }
    )
  }

  for (const it of pw.items.sort((a, b) => parseInt(a.item.jsonId, 10) - parseInt(b.item.jsonId, 10))) {
    listItems.push(
      { image: showPw ? it.item.image : SPECIAL_IMAGES.Masked, key: it.item.name, lineOne: <MaskedString show={showPw}>{it.item.name}</MaskedString>, value: <MaskedString show={showPw} value={true}>{it.quantity.toLocaleString()}</MaskedString>, href: showPw ? it.item.fields.path : undefined }
    )
  }

  let buttonText: string | undefined = "Next Clue"
  if (used === 3) {
    buttonText = "Show Password"
  } else if (used === 4 || (showDefault && used <= 4)) {
    buttonText = "Mark as Done"
  } else if (used === 5) {
    buttonText = undefined
  }

  return <div className="mb-4">
    <div className="d-flex justify-content-between mb-1">
      <h3 id={pw.jsonId.toString()}>Password {pw.jsonId}</h3>
      {buttonText && <Button onClick={onClick}>{buttonText}</Button>}
    </div>
    <List items={listItems} bigLine={true} css={{ "& .bf-list-line-one": maskedStringStyle }} />
  </div>
}

interface PasswordsQuery {
  passwords: {
    nodes: Password[]
  }
}

export default () => {
  const { passwords }: PasswordsQuery = useStaticQuery(graphql`
    query {
      passwords: allPasswordsJson(sort: {fields: jsonId}) {
        nodes {
          jsonId
          group
          password
          clue1
          clue2
          clue3
          silver
          gold
          items {
            quantity
            item {
              jsonId
              name
              image
              fields {
                path
              }
            }
          }
        }
      }
    }
  `)
  const [used, setAllUsed, setUsed] = useSettings("buddyFarmPasswords")
  const ctx = useContext(GlobalContext)

  const passwordsByGroup: { [key: string]: Password[] } = {}
  const pwIdToGroup: { [key: string]: string } = {}
  const groups: string[] = []
  for (const pw of passwords.nodes) {
    const group = used[pw.jsonId] > 4 ? "Done" : pw.group
    if (passwordsByGroup[group] === undefined) {
      if (group !== "Done") {
        groups.push(group)
      }
      passwordsByGroup[group] = []
    }
    passwordsByGroup[group].push(pw)
    pwIdToGroup[pw.jsonId] = group
  }
  if (passwordsByGroup["Done"]) {
    groups.push("Done")
  }

  const locationId = typeof document === "undefined" ? "" : document.location.hash?.substring(1)
  const locationGroup = pwIdToGroup[locationId]
  const defaultGroup = locationGroup || groups[0]

  const content = <Accordion defaultActiveKey={defaultGroup} className="mb-3">
    {groups.map(group => (
      <Accordion.Item eventKey={group} key={group}>
        <Accordion.Header>{group}</Accordion.Header>
        <Accordion.Body css={{ "& *:last-child": { marginBottom: "0 !important" } }}>
          {group === "Done" ? <Button className="mb-3" onClick={() => setAllUsed({})}>Reset Finished Passwords</Button> : undefined}
          {(passwordsByGroup[group] || []).map(pw => (
            <PasswordList key={pw.jsonId} pw={pw} used={used[pw.jsonId] || 0} setUsed={(val: number) => setUsed(pw.jsonId.toString(), val)} showDefault={ctx.settings.showPasswords} />
          ))}
        </Accordion.Body>
      </Accordion.Item>

    ))}
  </Accordion>

  const showAllButton = ctx.settings.showPasswords ?
    <Button variant="secondary" onClick={() => ctx.setSetting("showPasswords", false)}>Bring back the clues</Button>
    : <Button onClick={() => ctx.setSetting("showPasswords", true)}>Not interested in the puzzle, just show me the passwords</Button>

  // A wrapper to functionally disable SSR.
  const allContent = <>
    <div className="mb-4 d-flex gap-3">
      {showAllButton}
    </div>
    {content}
  </>

  return <Layout pageTitle="Mailbox Passwords">
    <h1>Mailbox Passwords</h1>
    {typeof document !== 'undefined' && allContent}
  </Layout>
}
