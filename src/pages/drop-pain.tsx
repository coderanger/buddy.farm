import { graphql, PageProps } from "gatsby"
import { useRef, useEffect, useState, useMemo, useContext } from "react"
import Button from "react-bootstrap/Button"
import Col from "react-bootstrap/Col"
import Form from "react-bootstrap/Form"
import Row from "react-bootstrap/Row"
import { Typeahead } from "react-bootstrap-typeahead"
import type { Option } from "react-bootstrap-typeahead/types/types"
import type TypeaheadClass from "react-bootstrap-typeahead/types/core/Typeahead"
import { GlobalContext } from "../utils/context"
import Layout from "../components/layout"

interface Selection {
  id: string
  name: string
  image: string | undefined
}

interface DropPainTypeaheadProps {
  id: string
  onChange: (sel: Selection | undefined) => void
  options: Selection[]
  defaultInputValue: string
  selected: Selection | undefined
}

const DropPainTypeahead = ({
  onChange,
  selected,
  defaultInputValue,
  ...props
}: DropPainTypeaheadProps) => {
  const ref = useRef<TypeaheadClass | null>(null)

  const onTypeaheadChange = (selection: Option[]) => {
    if (selection.length === 0) {
      onChange(undefined)
    } else {
      onChange(selection[0] as Selection)
    }
  }

  const onMenuToggle = (isOpen: boolean) => {
    if (ref.current === null) return
    const input = ref.current.getInput()
    if (isOpen && input?.value === defaultInputValue) {
      ref.current.clear()
    } else if (!isOpen && input?.value === "") {
      input.value = defaultInputValue
    }
  }

  const onBlur = () => {
    if (ref.current === null) return
    const input = ref.current.getInput()
    if (input?.value === "") {
      input.value = defaultInputValue
    }
  }

  return (
    <Typeahead
      ref={ref}
      onChange={onTypeaheadChange}
      onMenuToggle={onMenuToggle}
      onBlur={onBlur}
      labelKey="name"
      flip={true}
      clearButton={true}
      selected={selected === undefined ? [] : [selected]}
      defaultInputValue={defaultInputValue}
      {...props}
    />
  )
}

const useImage = () => {
  const image = useRef<HTMLImageElement | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)
  const [selection, setSelection] = useState<Selection | undefined>(undefined)
  const loadImage = (sel: Selection | undefined) => {
    const newImage = new Image()
    newImage.onload = () => {
      if (Object.is(newImage, image.current)) {
        setIsLoading(false)
      }
    }
    newImage.src = `https://farmrpg.com${sel?.image || "/img/items/item.png"}`
    image.current = newImage
    setIsLoading(true)
    setSelection(sel)
  }
  if (image.current === undefined) {
    loadImage(undefined)
  }
  return [image.current as HTMLImageElement, selection, isLoading, loadImage] as const
}

const DropPainPage = ({
  data: { items, locations, npcs },
}: PageProps<Queries.DropPainPageQuery>) => {
  const canvasElm = useRef<HTMLCanvasElement | null>(null)
  const downloadElm = useRef<HTMLAnchorElement | null>(null)
  const badgeOptions = useMemo(() => {
    const options: { name: string; image: string; id: string }[] = []
    for (const o of items.nodes) {
      options.push({
        name: o.name,
        image: o.image,
        id: `i${o.id}`,
      })
    }
    for (const o of locations.nodes) {
      options.push({
        name: o.name,
        image: o.image,
        id: `l${o.id}`,
      })
    }
    for (const o of npcs.nodes) {
      options.push({
        name: o.name,
        image: o.image,
        id: `n${o.name}`,
      })
    }
    return options.sort((a, b) => a.name.localeCompare(b.name))
  }, [items, locations, npcs])
  const itemOptions = useMemo(() => items.nodes.slice(), [items.nodes])
  const [title, setTitle] = useState("")
  const [titleImg, titleImgSel, titleImgLoading, setTitleImg] = useImage()
  const [itemOne, itemOneSel, itemOneLoading, setItemOne] = useImage()
  const [itemTwo, itemTwoSel, itemTwoLoading, setItemTwo] = useImage()
  const [itemThree, itemThreeSel, itemThreeLoading, setItemThree] = useImage()
  const [itemFour, itemFourSel, itemFourLoading, setItemFour] = useImage()
  const [itemFive, itemFiveSel, itemFiveLoading, setItemFive] = useImage()
  const [itemSix, itemSixSel, itemSixLoading, setItemSix] = useImage()
  const [urlHash, setUrlHash] = useState("#")
  const globalCtx = useContext(GlobalContext)

  useEffect(() => {
    if (typeof document === "undefined") return
    const [
      inTitle,
      inTitleImg,
      inItemOne,
      inItemTwo,
      inItemThree,
      inItemFour,
      inItemFive,
      inItemSix,
    ] = document.location.hash.substring(1).split(";")
    setTitle(inTitle)
    setTitleImg(badgeOptions.find((o) => o.id === inTitleImg))
    setItemOne(items.nodes.find((o) => o.id === inItemOne))
    setItemTwo(items.nodes.find((o) => o.id === inItemTwo))
    setItemThree(items.nodes.find((o) => o.id === inItemThree))
    setItemFour(items.nodes.find((o) => o.id === inItemFour))
    setItemFive(items.nodes.find((o) => o.id === inItemFive))
    setItemSix(items.nodes.find((o) => o.id === inItemSix))
  }, [])

  useEffect(() => {
    if (typeof document === "undefined" || canvasElm.current === null) return
    const canvas = canvasElm.current
    const ctx = canvas.getContext("2d")
    if (ctx === null) throw "Unable to initialize canvas"

    // Only draw when all images are loaded.
    if (
      titleImgLoading ||
      itemOneLoading ||
      itemTwoLoading ||
      itemThreeLoading ||
      itemFourLoading ||
      itemFiveLoading ||
      itemSixLoading
    )
      return

    // Erase everything.
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    const color = globalCtx.settings.darkMode ? "white" : "black"
    ctx.fillStyle = color

    // Work out how to draw the title. y=50-150
    ctx.font = "100px Arial"
    ctx.textAlign = "left"
    ctx.textBaseline = "top"
    const titleText = `${title || "Untitled"} Edition`
    const titleMetrics = ctx.measureText(titleText)
    const scaledWidth = (titleImg.width / titleImg.height) * titleMetrics.actualBoundingBoxDescent
    const margin = 25
    const totalWidth = scaledWidth + margin + titleMetrics.actualBoundingBoxRight
    const imageLeft = (canvas.width - totalWidth) / 2
    ctx.drawImage(titleImg, imageLeft, 50, scaledWidth, titleMetrics.actualBoundingBoxDescent)
    ctx.fillText(titleText, imageLeft + scaledWidth + margin, 50)

    // Compute the tick offsets. This is the centerline of each tick.
    const tickOffsets = []
    for (let i = 0; i <= 10; i++) {
      tickOffsets.push(100 + 80 * i)
    }
    // Draw the tick labels. y=200-250
    ctx.font = "50px Arial"
    ctx.textAlign = "center"
    ctx.textBaseline = "top"
    for (let i = 0; i <= 10; i++) {
      ctx.fillText(i.toString(), tickOffsets[i], 200)
    }

    // Draw the bar. y=260-272
    const gradient = ctx.createLinearGradient(100, 0, 900, 0)
    gradient.addColorStop(0.0, "#308945")
    gradient.addColorStop(0.35, "#F2F21D")
    gradient.addColorStop(1.0, "#D61411")
    ctx.fillStyle = gradient
    ctx.fillRect(94, 260, 812, 12)

    // Draw the ticks. y=272-296
    for (let i = 0; i <= 10; i++) {
      ctx.fillRect(tickOffsets[i] - 6, 272, 12, 24)
    }
    ctx.fillStyle = color

    // Draw the pain labels. y=306-348
    ctx.font = "30px Arial"
    ctx.textAlign = "center"
    ctx.textBaseline = "top"
    ctx.fillText("No Pain", 100, 312)
    ctx.fillText("Mild", 260, 312)
    ctx.fillText("Moderate", 420, 312)
    ctx.fillText("Severe", 580, 312)
    ctx.fillText("Very Severe", 740, 312)
    ctx.font = "20px Arial"
    ctx.fillText("Worst Pain", 900, 306)
    ctx.fillText("Possible", 900, 328)

    // Draw the item images. y=358-518
    const drawItem = (img: HTMLImageElement, x: number) => {
      const width = (img.width / img.height) * 160
      ctx.drawImage(img, x - width / 2, 358, width, 160)
    }
    drawItem(itemOne, 100)
    drawItem(itemTwo, 260)
    drawItem(itemThree, 420)
    drawItem(itemFour, 580)
    drawItem(itemFive, 740)
    drawItem(itemSix, 900)

    // Draw the bottom labels. y=528-578
    ctx.font = "50px Arial"
    ctx.textAlign = "center"
    ctx.textBaseline = "top"
    ctx.fillText("0", 100, 528)
    ctx.fillText("1-3", 300, 528)
    ctx.fillText("4-6", 500, 528)
    ctx.fillText("7-9", 700, 528)
    ctx.fillText("10", 900, 528)

    // Update the hash.
    const newUrlHash = `#${title};${titleImgSel?.id || ""};${itemOneSel?.id || ""};${
      itemTwoSel?.id || ""
    };${itemThreeSel?.id || ""};${itemFourSel?.id || ""};${itemFiveSel?.id || ""};${
      itemSixSel?.id || ""
    }`
    document.location.hash = newUrlHash
    setUrlHash(newUrlHash)
  }, [
    canvasElm.current,
    title,
    titleImg,
    titleImgLoading,
    itemOne,
    itemOneLoading,
    itemTwo,
    itemTwoLoading,
    itemThree,
    itemThreeLoading,
    itemFour,
    itemFourLoading,
    itemFive,
    itemFiveLoading,
    itemSix,
    itemSixLoading,
  ])

  return (
    <Layout title="Drop Pain Chart Creator">
      <Row className="mb-3">
        <Form.Group as={Col} controlId="titleBadgeInput">
          <Form.Label>Title Badge</Form.Label>
          <DropPainTypeahead
            id="titleBadgeInput"
            onChange={setTitleImg}
            options={badgeOptions}
            defaultInputValue="Select an item, location, or NPC"
            selected={titleImgSel}
          />
        </Form.Group>
        <Form.Group as={Col} controlId="titleInput">
          <Form.Label>Title</Form.Label>
          <Form.Control
            type="text"
            placeholder="Untitled"
            defaultValue={title}
            onChange={(evt) => setTitle(evt.target.value)}
          />
        </Form.Group>
      </Row>

      <canvas
        ref={canvasElm}
        width="1000"
        height="600"
        css={{ width: "100%", aspectRatio: "10 / 6" }}
      ></canvas>

      <Row xs={1} sm={2} lg={6}>
        <Col className="mb-3">
          <DropPainTypeahead
            id="itemOneInput"
            onChange={setItemOne}
            options={itemOptions}
            defaultInputValue="Select item one"
            selected={itemOneSel}
          />
        </Col>
        <Col className="mb-3">
          <DropPainTypeahead
            id="itemTwoInput"
            onChange={setItemTwo}
            options={itemOptions}
            defaultInputValue="Select item two"
            selected={itemTwoSel}
          />
        </Col>
        <Col className="mb-3">
          <DropPainTypeahead
            id="itemThreeInput"
            onChange={setItemThree}
            options={itemOptions}
            defaultInputValue="Select item three"
            selected={itemThreeSel}
          />
        </Col>
        <Col className="mb-3">
          <DropPainTypeahead
            id="itemFourInput"
            onChange={setItemFour}
            options={itemOptions}
            defaultInputValue="Select item four"
            selected={itemFourSel}
          />
        </Col>
        <Col className="mb-3">
          <DropPainTypeahead
            id="itemFiveInput"
            onChange={setItemFive}
            options={itemOptions}
            defaultInputValue="Select item five"
            selected={itemFiveSel}
          />
        </Col>
        <Col className="mb-3">
          <DropPainTypeahead
            id="itemSixInput"
            onChange={setItemSix}
            options={itemOptions}
            defaultInputValue="Select item six"
            selected={itemSixSel}
          />
        </Col>
      </Row>
      <Row>
        <Col>
          <Button
            className="clipboard me-4"
            data-clipboard-text={`https://buddy.farm/drop-pain/${urlHash}`}
          >
            Copy Link
          </Button>
          <Button
            className="d-none"
            onClick={() => {
              if (downloadElm.current !== null && canvasElm.current !== null) {
                downloadElm.current.download = `Drop Pain Chart - ${
                  title || "Untitled"
                } Edition.png`
                downloadElm.current.href = canvasElm.current
                  .toDataURL()
                  .replace("image/png", "image/octet-stream")
                downloadElm.current.click()
              }
            }}
          >
            Download Image
          </Button>
          <a ref={downloadElm} />
        </Col>
      </Row>
    </Layout>
  )
}

export default DropPainPage

export const query = graphql`
  query DropPainPage {
    items: allItemsJson(sort: { fields: name }) {
      nodes {
        id: jsonId
        name
        image
      }
    }

    locations: allLocationsJson {
      nodes {
        id: jsonId
        name
        image
      }
    }

    npcs: allNpcsJson {
      nodes {
        name
        image
      }
    }
  }
`
