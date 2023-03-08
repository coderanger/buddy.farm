// @ts-check

const DATA_ROOT = process.env.FARMRPG_DATA_ROOT
if (!DATA_ROOT) {
  throw "Set $FARMRPG_DATA_ROOT"
}

/** @type {import('gatsby').GatsbyConfig} */
module.exports = {
  siteMetadata: {
    title: `Buddy's Almanac`,
    siteUrl: `https://buddy.farm`,
  },
  graphqlTypegen: true,
  plugins: [
    "gatsby-plugin-sass",
    "gatsby-plugin-emotion",
    {
      resolve: "gatsby-plugin-google-gtag",
      options: {
        trackingIds: ["G-RYLMF5ZX56"],
      },
    },
    "gatsby-plugin-react-helmet",
    "gatsby-plugin-mdx",
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "pages",
        path: "./src/pages/",
      },
      __key: "pages",
    },
    "gatsby-transformer-json",
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "data",
        path: DATA_ROOT,
      },
    },
    {
      resolve: `gatsby-plugin-s3`,
      options: {
        bucketName: "buddy.farm",
        protocol: "https",
        hostname: "buddy.farm",
      },
    },
    {
      resolve: "gatsby-plugin-manifest",
      options: {
        name: "Buddy's Almanac",
        short_name: "buddy.farm",
        description: "Unofficial reference data for Farm RPG.",
        icon: "src/images/icon.svg",
      },
    },
    "gatsby-plugin-sharp",
    "gatsby-transformer-sharp",
    {
      resolve: "gatsby-transformer-remark",
      options: {
        plugins: ["gatsby-remark-images"],
      },
    },
    {
      resolve: "gatsby-source-google-docs",
      options: {
        createPages: true,
      },
    },
  ],
}
