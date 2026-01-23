import "bootstrap/dist/css/bootstrap.css"
import "bootstrap-dark-5/dist/css/bootstrap-nightshade.css"
import "react-bootstrap-typeahead/css/Typeahead.css"
import "react-bootstrap-typeahead/css/Typeahead.bs5.css"

import { navigate } from "gatsby"
import React, { useContext, useEffect, useRef, useState } from "react"
import Container from "react-bootstrap/Container"
import Navbar from "react-bootstrap/Navbar"
import Toast from "react-bootstrap/Toast"
import ToastContainer from "react-bootstrap/ToastContainer"
import { Link } from "gatsby"

import { BsFillGearFill } from "@react-icons/all-files/bs/BsFillGearFill"
import { FaHome } from "@react-icons/all-files/fa/FaHome"

import { useDebounce } from "../hooks/debounce"
import { GlobalContext } from "../utils/context"

interface PersistentNavProps {
  children: React.ReactNode
}

export const PersistentNav = ({ children }: PersistentNavProps) => {
  const ctx = useContext(GlobalContext)
  const [searchFired, setSearchFired] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const isNavigatingRef = useRef(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Sync input value with URL query parameter when on search page
  // Clear input when navigating away from search page
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isOnSearchPage = window.location.pathname === '/search/'

      if (isOnSearchPage) {
        // On search page: sync input with URL query parameter
        const params = new URLSearchParams(window.location.search)
        const q = params.get('q')
        if (q !== null && q !== inputValue) {
          setInputValue(q)
        }
        // Reset searchFired when navigating to search page
        setSearchFired(false)
      } else {
        // Not on search page: clear the input
        if (inputValue !== '') {
          setInputValue('')
        }
      }
    }
  }, [typeof window !== 'undefined' ? window.location.href : ''])

  const navigateToSearch = useDebounce((query: string, setSearchFired: (arg0: boolean) => void) => {
    isNavigatingRef.current = true
    void navigate(`/search/?q=${encodeURIComponent(query)}`)
    setSearchFired(true)
  }, 250)

  // Reset navigation flag when URL changes (navigation complete)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Small delay to allow search page to refocus
      const timer = setTimeout(() => {
        isNavigatingRef.current = false
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [typeof window !== 'undefined' ? window.location.href : ''])

  // Prevent blur during navigation to keep mobile keyboard open
  const handleBlur = () => {
    if (isNavigatingRef.current && inputRef.current) {
      // Immediately refocus to prevent keyboard from closing
      inputRef.current.focus()
    }
  }

  const handleSettingsClick = (evt: React.MouseEvent<HTMLAnchorElement>) => {
    if (typeof window !== 'undefined' && window.location.pathname === '/settings/') {
      evt.preventDefault()
      void navigate(-1)
    }
  }

  const onSearch = (query: string): void => {
    // Check if we're already on the search page
    const isOnSearchPage = typeof window !== 'undefined' && window.location.pathname === '/search/'

    if (isOnSearchPage) {
      // On search page: update context for real-time search
      ctx.setQuery(query)
      // Update the URL without navigating
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', `?q=${encodeURIComponent(query)}`)
      }
    } else {
      // Not on search page: navigate to search page with query in URL
      if (!searchFired && query.length > 1) {
        ctx.setQuery(query)
        navigateToSearch(query, setSearchFired)
      }
    }
  }

  return (
    <>
      <div
        aria-live="polite"
        aria-atomic="true"
        className="position-fixed top-0 end-0"
        css={{ minWidth: 400, zIndex: 100 }}
      >
        <ToastContainer position="top-end" className="p-3">
          {ctx.toasts.map((toast) => (
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
      <Navbar
        bg={ctx.settings.darkMode ? "dark" : "light"}
        expand="lg"
        css={{ "html.iframe &": { display: "none" } }}
      >
        <Container css={{ paddingLeft: 12, paddingRight: 12 }}>
          <Link className="navbar-brand" to="/">
            <span className="d-none d-sm-inline">Buddy's Almanac</span>
            <FaHome className="d-sm-none" css={{ marginTop: -3 }} />
          </Link>
          <form
            className="d-flex"
            css={{ flexGrow: 1, maxWidth: 600 }}
            onSubmit={(evt) => {
              evt.preventDefault()
              // Navigate to first result on Enter key press
              if (ctx.firstResultHref) {
                void navigate(ctx.firstResultHref)
              }
            }}
          >
            <input
              ref={inputRef}
              id="nav-search"
              className="form-control me-2"
              type="search"
              placeholder="Search"
              aria-label="Search"
              value={inputValue}
              onChange={(evt) => {
                setInputValue(evt.target.value)
                onSearch(evt.target.value)
              }}
              onBlur={handleBlur}
            />
          </form>
          <Link className="btn btn-primary" to="/settings/" onClick={handleSettingsClick}>
            <span className="d-none d-sm-inline">Settings</span>
            <BsFillGearFill className="d-sm-none" css={{ marginTop: -3 }} />
          </Link>
        </Container>
      </Navbar>
      {children}
    </>
  )
}
