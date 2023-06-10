interface LinkableOld {
  name: string
  fields: {
    path: string
  }
}

interface LinkableNew {
  __typename: string
  name: string
}

const pathPrefixes: Record<string, string> = {
  FarmRPG_Item: "i",
  FarmRPG_Location: "l",
  FarmRPG_Pet: "p",
  FarmRPG_Questline: "ql",
  FarmRPG_Quest: "q",
  FarmRPG_Trade: "t",
  FarmRPG_Quiz: "qz",
  FarmRPG_NPC: "t",
}

export const linkFor = (node: LinkableOld | LinkableNew): string => {
  if ("fields" in node) {
    return node.fields.path
  }
  const prefix = pathPrefixes[node.__typename]
  if (!prefix) {
    throw `No prefix for type ${node.__typename}`
  }
  const slug = node.name.trim().toLowerCase().replace(/\W+/g, "-")
  return `/${prefix}/${slug}/`
}

export default linkFor
