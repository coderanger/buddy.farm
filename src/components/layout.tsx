import "./layout.css"

import ClipboardJS from "clipboard"
import React, { useContext, useEffect } from "react"
import Container from "react-bootstrap/Container"
import { Helmet } from "react-helmet"

import { CopyButton } from "../components/clipboard"
import { GlobalContext } from "../utils/context"
import { linkFor } from "../utils/links"

interface HeaderFromableOld {
  name: string
  image: string
  fields: {
    path: string
  }
}

interface HeaderFromableNew {
  __typename: string
  name: string
  image: string
}

type HeaderFromable = HeaderFromableOld | HeaderFromableNew

interface LayoutProps {
  title?: string
  headerImage?: string
  headerCopy?: string
  headerImageCopy?: string
  headerFrom?: HeaderFromable
  headerRight?: React.ReactNode
  pageTitle?: string
  children: React.ReactNode
}

const Layout = ({
  title,
  headerImage,
  headerCopy,
  headerImageCopy,
  headerFrom,
  headerRight,
  pageTitle,
  children,
}: LayoutProps) => {
  const ctx = useContext(GlobalContext)

  useEffect(() => {
    const clipboard = new ClipboardJS(".clipboard")
    clipboard.on("success", (evt) => {
      ctx.addToast({
        title: "Copied to clipboard",
        body: `"${evt.text}" copied to the clipboard`,
        delay: 2000,
      })
    })
    return () => clipboard.destroy()
  })

  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>{pageTitle || title || headerFrom?.name || "buddy.farm"}</title>
      </Helmet>
      <main>
        <Container css={{ paddingTop: 10, paddingLeft: 12, paddingRight: 12 }}>
          {headerRight && <div className="d-none d-md-block float-end">{headerRight}</div>}
          {(title || headerFrom) && (
            <h1>
              {(headerImage || headerFrom) && (
                <img
                  src={"https://farmrpg.com" + (headerImage || headerFrom?.image)}
                  className="d-inline-block align-text-top clipboard"
                  width="48"
                  height="48"
                  css={{ marginRight: 10, boxSizing: "border-box" }}
                  data-clipboard-text={headerImageCopy}
                />
              )}
              {title || headerFrom?.name}
              {(headerCopy || headerFrom) && (
                <CopyButton path={headerCopy || linkFor(headerFrom!)} />
              )}
            </h1>
          )}
          {headerRight && <div className="d-md-none my-2">{headerRight}</div>}
          {children}
        </Container>
      </main>
    </>
  )
}
export default Layout
