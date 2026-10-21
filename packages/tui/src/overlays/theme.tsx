/** /theme 选择器（浮层）。 */
import React from 'react'
import { Box, Text } from '../../../dsh-tui/src/ui.js'
import type { OverlayRenderer } from './types.js'

export const ThemeOverlay: OverlayRenderer = () => (
  <Box borderStyle="single" flexDirection="column">
    <Text bold>Theme</Text>
    <Text>dark</Text>
    <Text>light</Text>
  </Box>
)
