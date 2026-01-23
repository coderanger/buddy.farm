// @ts-check
import React from "react"
import Provider from "./src/utils/context"
import { PersistentNav } from "./src/components/persistent-nav"

/** @type {import('gatsby').GatsbyBrowser['wrapRootElement']} */
export const wrapRootElement = Provider

/** @type {import('gatsby').GatsbyBrowser['wrapPageElement']} */
export const wrapPageElement = ({ element }) => {
  return <PersistentNav>{element}</PersistentNav>
}
