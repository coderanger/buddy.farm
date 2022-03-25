import Button from 'react-bootstrap/Button'

import { BsClipboard } from '@react-icons/all-files/bs/BsClipboard'

interface CopyButtonProps {
  text: string
}

export const CopyButton = ({ text }: CopyButtonProps) => (
  <Button
    data-clipboard-text={text}
    variant="outline-secondary"
    className="clipboard"
    css={{
      marginLeft: 20,
      lineHeight: "0 !important",
      padding: "0.5rem !important",
      verticalAlign: "middle !important",
      marginTop: -5
    }}
  >
    <BsClipboard css={{ fontSize: 12, verticalAlign: "text-top" }} />
  </Button>
)

// TODO Tooltip-y feedback when a copy succeeds.
