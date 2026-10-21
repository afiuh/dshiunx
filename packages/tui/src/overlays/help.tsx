/** /help 帮助（全屏/浮层）。 */
import React from 'react'
import { Box, Text } from '../../../dsh-tui/src/ui.js'
import type { OverlayRenderer } from './types.js'

export const HelpOverlay: OverlayRenderer = () => (
  <Box borderStyle="single" flexDirection="column">
    <Text bold>Help</Text>
    <Text>/help  /model  /effort  /new  /settings  /exit</Text>
  </Box>
)
