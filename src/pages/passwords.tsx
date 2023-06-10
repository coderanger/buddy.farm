import { graphql, PageProps } from "gatsby"
import React, { useContext } from "react"
import Accordion from "react-bootstrap/Accordion"
import Button from "react-bootstrap/Button"

import { css } from "@emotion/react"

import { CopyButton } from "../components/clipboard"
import Layout from "../components/layout"
import List from "../components/list"
import { useDebounceAfter } from "../hooks/debounce"
import { useSettings } from "../hooks/settings"
import { GlobalContext } from "../utils/context"
import linkFor from "../utils/links"

const SPECIAL_IMAGES: { [key: string]: string } = {
  Silver: "/img/items/silver.png",
  Gold: "/img/items/gold.png",
  Masked: "/img/items/item.png",
}

type Password = Queries.PasswordsPageQuery["farmrpg"]["passwords"][0]

interface MaskedStringProps {
  show: boolean
  copyButton?: boolean
  value?: boolean
  children: React.ReactNode
}

const maskedStringStyle = css({
  fontSize: 32,
  lineHeight: "48px",
  fontWeight: "normal",
  // A different breakpoint than the usual for the list value because these are longer.
  "@media (max-width: 768px)": {
    fontSize: 16,
    // lineHeight: "24px",
    // No bold for the small screen value, it reads better here IMO.
  },
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

const maskedStringStyleMultiline = css(maskedStringStyle, {
  "@media (max-width: 768px)": {
    lineHeight: "24px",
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
  if (copyButton) {
    cssToUse.push(css({ whiteSpace: "nowrap" }))
  }
  // HACKS
  if (value && !copyButton && typeof document !== "undefined") {
    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
    const valueWidth = vw - 171
    const valueChars = valueWidth / 8 // 1ch on this font is ~10px
    // console.log("HACKS", children, vw, valueWidth, valueChars, children.length)
    if (typeof children === "string" && children.length >= valueChars) {
      cssToUse.push(maskedStringStyleMultiline)
    }
  }
  return (
    <span key={`${children}-${show}`} css={cssToUse}>
      {children}
      {copyButton && typeof children === "string" && <CopyButton text={children} />}
    </span>
  )
}

interface PasswordListProps {
  pw: Password
  used: number
  setUsed: (arg0: number) => void
  showDefault: boolean
}

const PasswordList = ({ pw, used, setUsed, showDefault }: PasswordListProps) => {
  const onClick = useDebounceAfter(() => setUsed(showDefault ? 5 : used + 1), 350)

  const listItems = []

  if (!showDefault) {
    listItems.push(
      {
        lineOne: "Clue 1",
        value: (
          <MaskedString show={used >= 1} value={true}>
            {pw.clue1}
          </MaskedString>
        ),
      },
      {
        lineOne: "Clue 2",
        value: (
          <MaskedString show={used >= 2} value={true}>
            {pw.clue2}
          </MaskedString>
        ),
      },
      {
        lineOne: "Clue 3",
        value: (
          <MaskedString show={used >= 3} value={true}>
            {pw.clue3}
          </MaskedString>
        ),
      }
    )
  }

  const showPw = used >= 4 || !!showDefault

  listItems.push({
    lineOne: "Password",
    value: (
      <MaskedString show={showPw} copyButton={true} value={true}>
        {pw.password}
      </MaskedString>
    ),
    copyText: showPw ? pw.password : undefined,
  })

  if (pw.rewardSilver) {
    listItems.push({
      image: showPw ? SPECIAL_IMAGES.Silver : SPECIAL_IMAGES.Masked,
      key: "silver",
      lineOne: <MaskedString show={showPw}>Silver</MaskedString>,
      value: (
        <MaskedString show={showPw} value={true}>
          {pw.rewardSilver.toLocaleString()}
        </MaskedString>
      ),
    })
  }

  if (pw.rewardGold) {
    listItems.push({
      image: showPw ? SPECIAL_IMAGES.Gold : SPECIAL_IMAGES.Masked,
      key: "gold",
      lineOne: <MaskedString show={showPw}>Gold</MaskedString>,
      value: (
        <MaskedString show={showPw} value={true}>
          {pw.rewardGold.toLocaleString()}
        </MaskedString>
      ),
    })
  }

  for (const it of pw.rewardItems.slice().sort((a, b) => a.item.id - b.item.id)) {
    listItems.push({
      image: showPw ? it.item.image : SPECIAL_IMAGES.Masked,
      key: it.item.name,
      lineOne: <MaskedString show={showPw}>{it.item.name}</MaskedString>,
      value: (
        <MaskedString show={showPw} value={true}>
          {it.quantity.toLocaleString()}
        </MaskedString>
      ),
      href: showPw ? linkFor(it.item) : undefined,
    })
  }

  let buttonText: string | undefined = "Next Clue"
  if (used === 3) {
    buttonText = "Show Password"
  } else if (used === 4 || (showDefault && used <= 4)) {
    buttonText = "Mark as Done"
  } else if (used === 5) {
    buttonText = undefined
  }

  return (
    <div className="mb-4">
      <div className="d-flex justify-content-between mb-1">
        <h3 id={pw.id.toString()}>Password {pw.id}</h3>
        {buttonText && <Button onClick={onClick}>{buttonText}</Button>}
      </div>
      <List
        items={listItems}
        bigLine={true}
        shrink="value"
        css={{ "& .bf-list-line-one": maskedStringStyle }}
      />
    </div>
  )
}

const PasswordsPage = ({
  data: {
    farmrpg: { passwords },
  },
}: PageProps<Queries.PasswordsPageQuery>) => {
  const [used, setAllUsed, setUsed] = useSettings("buddyFarmPasswords")
  const ctx = useContext(GlobalContext)

  const passwordsByGroup: { [key: string]: Password[] } = {}
  const pwIdToGroup: { [key: string]: string } = {}
  const groups: string[] = []
  for (const pw of passwords) {
    const group = used[pw.id] > 4 ? "Done" : pw.group.name
    if (passwordsByGroup[group] === undefined) {
      if (group !== "Done") {
        groups.push(group)
      }
      passwordsByGroup[group] = []
    }
    passwordsByGroup[group].push(pw)
    pwIdToGroup[pw.id] = group
  }
  if (passwordsByGroup["Done"]) {
    groups.push("Done")
  }

  const locationId = typeof document === "undefined" ? "" : document.location.hash?.substring(1)
  const locationGroup = pwIdToGroup[locationId]
  const defaultGroup = locationGroup || groups[0]

  const content = (
    <Accordion defaultActiveKey={defaultGroup} className="mb-3">
      {groups.map((group) => (
        <Accordion.Item eventKey={group} key={group}>
          <Accordion.Header>{group}</Accordion.Header>
          <Accordion.Body css={{ "& *:last-child": { marginBottom: "0 !important" } }}>
            {group === "Done" ? (
              <Button className="mb-3" onClick={() => setAllUsed({})}>
                Reset Finished Passwords
              </Button>
            ) : undefined}
            {(passwordsByGroup[group] || []).map((pw) => (
              <PasswordList
                key={pw.id}
                pw={pw}
                used={used[pw.id] || 0}
                setUsed={(val: number) => setUsed(pw.id.toString(), val)}
                showDefault={ctx.settings.showPasswords}
              />
            ))}
          </Accordion.Body>
        </Accordion.Item>
      ))}
    </Accordion>
  )

  const showAllButton = ctx.settings.showPasswords ? (
    <Button variant="secondary" onClick={() => ctx.setSetting("showPasswords", false)}>
      Bring back the clues
    </Button>
  ) : (
    <Button onClick={() => ctx.setSetting("showPasswords", true)}>
      Not interested in the puzzle, just show me the passwords
    </Button>
  )

  // A wrapper to functionally disable SSR.
  const allContent = (
    <>
      <div className="mb-4 d-flex gap-3">{showAllButton}</div>
      {content}
    </>
  )

  return <Layout title="Mailbox Passwords">{typeof document !== "undefined" && allContent}</Layout>
}

export default PasswordsPage

export const query = graphql`
  query PasswordsPage {
    farmrpg {
      passwords(filters: { hasClues: true }) {
        id
        group {
          name
        }
        password
        clue1
        clue2
        clue3
        rewardSilver
        rewardGold
        rewardItems {
          quantity
          item {
            __typename
            id
            name
            image
          }
        }
      }
    }
  }
`
