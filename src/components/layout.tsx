import 'bootstrap/dist/css/bootstrap.css'

import { Link, navigate } from 'gatsby'
import React, { useContext, useState } from 'react'
import Container from 'react-bootstrap/Container'
import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'
import NavDropdown from 'react-bootstrap/NavDropdown'
import { Helmet } from 'react-helmet'

import { BsFillGearFill } from '@react-icons/all-files/bs/BsFillGearFill'

import { GlobalContext } from '../utils/context'
import { debounce } from '../utils/debounce'

const navigateToSearch = debounce((query: string, setSearchFired: (arg0: boolean) => void) => {
  console.debug("defaultOnSearch actually navigating", query)
  // query = query.substring(0, query.length - 3)
  navigate(`/search/?q=${encodeURIComponent(query)}`, { state: { typing: true, query } })
  setSearchFired(true)
}, 500)

interface LayoutProps {
  pageTitle: string
  query?: string | null | undefined
  searchAutoFocus?: boolean | undefined
  onSearch?: (query: string) => void
  onSearchFocus?: (focus: boolean) => void
  children: JSX.Element[] | JSX.Element
}

const Layout = ({ pageTitle, query, searchAutoFocus, onSearch, onSearchFocus, children }: LayoutProps) => {
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
  return (<>
    <Helmet>
      <meta charSet="utf-8" />
      <title>{pageTitle}</title>
    </Helmet>
    <Navbar bg="light" expand="lg">
      <Container>
        <Link className='navbar-brand d-none d-sm-inline' to="/">
          Buddy's Almanac
        </Link>
        <form className="d-flex" css={{ flexGrow: 1, maxWidth: 600 }} onSubmit={evt => evt.preventDefault()}>
          <input id="nav-search" className="form-control me-2" type="search" placeholder="Search"
            aria-label="Search" defaultValue={ctx.query || query || undefined}
            autoFocus={searchAutoFocus}
            onChange={evt => onSearch(evt.target.value)}
          // onFocus={onSearchFocus && (() => onSearchFocus(true))}
          // onBlur={onSearchFocus && (() => onSearchFocus(false))}
          />
        </form>
        <Link className="btn btn-primary" to="/settings/">
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
