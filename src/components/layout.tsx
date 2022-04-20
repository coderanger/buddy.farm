import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-dark-5/dist/css/bootstrap-nightshade.css'

import { Link, navigate } from 'gatsby'
import React, { useContext, useState, useEffect } from 'react'
import Container from 'react-bootstrap/Container'
import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'
import NavDropdown from 'react-bootstrap/NavDropdown'
import { Helmet } from 'react-helmet'
import ClipboardJS from "clipboard"

import { BsFillGearFill } from '@react-icons/all-files/bs/BsFillGearFill'
import { FaHome } from '@react-icons/all-files/fa/FaHome'

import { GlobalContext } from '../utils/context'
import { debounce } from '../utils/debounce'

const navigateToSearch = debounce((query: string, setSearchFired: (arg0: boolean) => void) => {
  console.debug("defaultOnSearch actually navigating", query)
  // query = query.substring(0, query.length - 3)
  navigate(`/search/?q=${encodeURIComponent(query)}`, { state: { typing: true, query } })
  setSearchFired(true)
}, 250)

interface LayoutProps {
  pageTitle: string
  query?: string | null | undefined
  searchAutoFocus?: boolean | undefined
  onSearch?: (query: string) => void
  settingsBack?: boolean
  children: React.ReactNode
}

const Layout = ({ pageTitle, query, searchAutoFocus, onSearch, settingsBack, children }: LayoutProps) => {
  const ctx = useContext(GlobalContext)
  const [searchFired, setSearchFired] = useState(false)
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
    return () => clipboard.destroy()
  })

  // Typescript otherwise complains that onSearch could be undefined even though it can't be.
  const onSearchTypescriptSigh = onSearch

  return (<>
    <Helmet>
      <meta charSet="utf-8" />
      <title>{pageTitle}</title>
    </Helmet>
    <Navbar bg="light" expand="lg">
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
        {children}
      </Container>
    </main>
  </>
  )
}
export default Layout
