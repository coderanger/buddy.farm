import { Link, graphql, PageProps } from "gatsby"
import { GatsbyImage, getImage } from "gatsby-plugin-image"
import React from "react"

import Layout from "../components/layout"

const GdocTemplate = ({
  data: {
    page: {
      name,
      cover,
      childMarkdownRemark: { html },
    },
  },
}: PageProps<Queries.GdocTemplateQuery>) => {
  return (
    <Layout>
      <Link to="/">
        <button>{"Home"}</button>
      </Link>
      <h1>{name}</h1>
      {/*
        To add a cover:
        Add an image in your Google Doc first page header
        https://support.google.com/docs/answer/86629
      */}
      {cover && <GatsbyImage image={getImage(cover.image)} />}
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </Layout>
  )
}

export default GdocTemplate

export const pageQuery = graphql`
  query GdocTemplate($path: String!) {
    page: googleDocs(slug: { eq: $path }) {
      name
      cover {
        image {
          childImageSharp {
            gatsbyImageData
          }
        }
      }
      childMarkdownRemark {
        html
      }
    }
  }
`
