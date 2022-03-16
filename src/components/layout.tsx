import * as React from 'react'
import { Link, navigate } from 'gatsby'
import Container from "react-bootstrap/Container"
import Nav from "react-bootstrap/Nav"
import NavDropdown from "react-bootstrap/NavDropdown"
import Navbar from "react-bootstrap/Navbar"
import { Helmet } from "react-helmet"
import "bootstrap/dist/css/bootstrap.css"


interface LayoutProps {
    pageTitle: string
    query?: string | null | undefined
    searchAutoFocus?: boolean
    onSearch?: (query: string) => void
    onSearchFocus?: (focus: boolean) => void
    children: JSX.Element[] | JSX.Element
}

const defaultOnSearch = (query: string) => {
    navigate(`/search/?q=${encodeURIComponent(query)}`, { state: { typing: true, query } })
    return true
}

const Layout = ({ pageTitle, query, searchAutoFocus, onSearch = defaultOnSearch, onSearchFocus, children }: LayoutProps) => {
    return (
        <>
            <Helmet>
                <meta charSet="utf-8" />
                <title>{pageTitle}</title>
            </Helmet>
            <Navbar bg="light" expand="lg">
                <Container>
                    <Link className='navbar-brand' to="/">
                        Buddy's Almanac
                    </Link>
                    <form className="d-flex" css={{ flexGrow: 1, maxWidth: 600 }} onSubmit={evt => evt.preventDefault()}>
                        <input id="nav-search" className="form-control me-2" type="search" placeholder="Search"
                            aria-label="Search" defaultValue={query || undefined}
                            autoFocus={searchAutoFocus}
                            onChange={evt => onSearch(evt.target.value)}
                            onFocus={onSearchFocus && (() => onSearchFocus(true))}
                            onBlur={onSearchFocus && (() => onSearchFocus(false))} />
                    </form>
                    <Link className="btn btn-primary" to="/settings/">Settings</Link>
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
