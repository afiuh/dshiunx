/** /effort 选择器（浮层）。 */
import React from 'react'
import { Box, Text } from '../../../dsh-tui/src/ui.js'
import type { OverlayRenderer } from './types.js'

export const EffortOverlay: OverlayRenderer = () => (
  <Box borderStyle="single" flexDirection="column">
    <Text bold>Effort</Text>
    <Text>low</Text>
    <Text>medium</Text>
    <Text>high</Text>
  </Box>
)
