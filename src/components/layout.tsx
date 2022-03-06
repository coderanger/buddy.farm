import * as React from 'react'
import { Link } from 'gatsby'
import Container from "react-bootstrap/Container"
import Nav from "react-bootstrap/Nav"
import NavDropdown from "react-bootstrap/NavDropdown"
import Navbar from "react-bootstrap/Navbar"
import { Helmet } from "react-helmet"
import "bootstrap/dist/css/bootstrap.css"


interface LayoutProps {
    pageTitle: string
    children: JSX.Element[] | JSX.Element
}

const Layout = ({ pageTitle, children }: LayoutProps) => {
    return (
        <div>
            <Helmet>
                <meta charSet="utf-8" />
                <title>{pageTitle}</title>
            </Helmet>
            <Navbar bg="light" expand="lg">
                <Container>
                    <Link className='navbar-brand' to="/">
                        Buddy's Almanac
                    </Link>
                    <form className="d-flex" css={{flexGrow: 1, maxWidth: 600}}>
                        <input className="form-control me-2" type="search" placeholder="Search" aria-label="Search" />
                    </form>
                    <Link className="btn btn-primary" to="/">Settings</Link>
                </Container>
            </Navbar>
            <main>
                <Container>
                    {children}
                </Container>
            </main>
        </div>
    )
}
export default Layout
