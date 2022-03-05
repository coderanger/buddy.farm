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
                <link rel="canonical" href="http://mysite.com/example" />
            </Helmet>
            <Navbar bg="light" expand="lg">
                <Container>
                    <Link className='navbar-brand' to="/">
                        Buddy's Almanac
                    </Link>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto">
                            <Nav.Link href="#home">Home</Nav.Link>
                            <Nav.Link href="#link">Link</Nav.Link>
                            <NavDropdown title="Dropdown" id="basic-nav-dropdown">
                                <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
                                <NavDropdown.Item href="#action/3.2">Another action</NavDropdown.Item>
                                <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item href="#action/3.4">Separated link</NavDropdown.Item>
                            </NavDropdown>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
            <main>
                <Container>
                    <h1>{pageTitle}</h1>
                    {children}
                </Container>
            </main>
        </div>
    )
}
export default Layout
