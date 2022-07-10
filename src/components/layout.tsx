import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-dark-5/dist/css/bootstrap-nightshade.css'
import './layout.css'

import ClipboardJS from 'clipboard'
import { Link, navigate } from 'gatsby'
import React, { useContext, useEffect, useState } from 'react'
import Container from 'react-bootstrap/Container'
import Navbar from 'react-bootstrap/Navbar'
import Toast from 'react-bootstrap/Toast'
import ToastContainer from 'react-bootstrap/ToastContainer'
import { Helmet } from 'react-helmet'

import { BsFillGearFill } from '@react-icons/all-files/bs/BsFillGearFill'
import { FaHome } from '@react-icons/all-files/fa/FaHome'

import { CopyButton } from '../components/clipboard'
import { useDebounce } from '../hooks/debounce'
import { GlobalContext } from '../utils/context'

interface HeaderFromable {
  name: string
  image: string
  fields: {
    path: string
  }
}

interface LayoutProps {
  title?: string
  headerImage?: string
  headerCopy?: string
  headerImageCopy?: string
  headerFrom?: HeaderFromable
  pageTitle?: string
  query?: string | null | undefined
  searchAutoFocus?: boolean | undefined
  onSearch?: (query: string) => void
  settingsBack?: boolean
  children: React.ReactNode
}

const Layout = ({ title, headerImage, headerCopy, headerImageCopy, headerFrom, pageTitle, query, searchAutoFocus, onSearch, settingsBack, children }: LayoutProps) => {
  const ctx = useContext(GlobalContext)
  const [searchFired, setSearchFired] = useState(false)
  const navigateToSearch = useDebounce((query: string, setSearchFired: (arg0: boolean) => void) => {
    console.debug("defaultOnSearch actually navigating", query)
    // query = query.substring(0, query.length - 3)
    navigate(`/search/?q=${encodeURIComponent(query)}`, { state: { typing: true, query } })
    setSearchFired(true)
  }, 250)
  if (!onSearch) {
    onSearch = (query: string): void => {
      console.debug("defaultOnSearch firing", query)
      if (!searchFired) {
        console.debug("defaultOnSearch navigating", query)
        navigateToSearch(query, setSearchFired)
      }
      ctx.setQuery(query)
    }
  }

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

  // Typescript otherwise complains that onSearch could be undefined even though it can't be.
  const onSearchTypescriptSigh = onSearch

  return (<>
    <Helmet>
      <meta charSet="utf-8" />
      <title>{pageTitle || title || headerFrom?.name || "buddy.farm"}</title>
    </Helmet>
    <div
      aria-live="polite"
      aria-atomic="true"
      className="position-fixed top-0 end-0"
      css={{ minWidth: 400, zIndex: 100 }}
    >
      <ToastContainer position="top-end" className="p-3">
        {ctx.toasts.map(toast => (
          <Toast
            key={toast.id}
            show={!toast.hiding}
            autohide={toast.delay !== undefined}
            delay={toast.delay}
            onClose={() => ctx.removeToast(toast.id)}
          >
            <Toast.Header>
              <strong className="me-auto">{toast.title}</strong>
              <small className="text-muted">just now</small>
            </Toast.Header>
            <Toast.Body>{toast.body}</Toast.Body>
          </Toast>
        ))}
      </ToastContainer>
    </div>
    <Navbar bg="light" expand="lg" css={{ "html.iframe &": { "display": "none" } }}>
      <Container>
        <Link className='navbar-brand' to="/">
          <span className="d-none d-sm-inline">Buddy's Almanac</span>
          <FaHome className="d-sm-none" css={{ marginTop: -3 }} />
        </Link>
        <form className="d-flex" css={{ flexGrow: 1, maxWidth: 600 }} onSubmit={evt => evt.preventDefault()}>
          <input id="nav-search" className="form-control me-2" type="search" placeholder="Search"
            aria-label="Search" defaultValue={ctx.query || query || undefined}
            autoFocus={searchAutoFocus}
            onChange={evt => onSearchTypescriptSigh(evt.target.value)}
          />
        </form>
        <Link className="btn btn-primary" to="/settings/" onClick={settingsBack ? (evt => { evt.preventDefault(); navigate(-1) }) : undefined}>
          <span className="d-none d-sm-inline">Settings</span>
          <BsFillGearFill className="d-sm-none" css={{ marginTop: -3 }} />
        </Link>
      </Container>
    </Navbar>
    <main>
      <Container css={{ paddingTop: 10 }}>
        {(title || headerFrom) && <h1>
          {(headerImage || headerFrom) && <img
            src={"https://farmrpg.com" + (headerImage || headerFrom?.image)}
            className="d-inline-block align-text-top clipboard"
            width="48" height="48"
            css={{ marginRight: 10, boxSizing: "border-box" }}
            data-clipboard-text={headerImageCopy}
          />}
          {title || headerFrom?.name}
          {(headerCopy || headerFrom) && <CopyButton path={headerCopy || headerFrom?.fields.path} />}
        </h1>}
        {children}
      </Container>
    </main>
  </>
  )
}
export default Layout
