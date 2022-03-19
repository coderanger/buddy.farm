import * as React from 'react'
import { Link, navigate } from 'gatsby'
import Container from "react-bootstrap/Container"
import Nav from "react-bootstrap/Nav"
import NavDropdown from "react-bootstrap/NavDropdown"
import Navbar from "react-bootstrap/Navbar"
import { Helmet } from "react-helmet"
import { BsFillGearFill } from "@react-icons/all-files/bs/BsFillGearFill"
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

const debounce = (func: (...args: any[]) => void, wait: number) => {
    let timeout: number | undefined
    return (...args: any[]) => {
        const context = this
        const later = () => {
            timeout = undefined
            func.apply(context, args)
        }
        clearTimeout(timeout)
        timeout = window.setTimeout(later, wait)
    }
}


const Layout = ({ pageTitle, query, searchAutoFocus, onSearch = defaultOnSearch, onSearchFocus, children }: LayoutProps) => {
    const onSearchDebounce = debounce(onSearch, 250)
    return (
        <>
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
                            aria-label="Search" defaultValue={query || undefined}
                            autoFocus={searchAutoFocus}
                            onChange={evt => onSearchDebounce(evt.target.value)}
                            onFocus={onSearchFocus && (() => onSearchFocus(true))}
                            onBlur={onSearchFocus && (() => onSearchFocus(false))} />
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
