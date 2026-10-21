/** 确认对话框。 */
import React from 'react'
import { Box, Text } from '../../../dsh-tui/src/ui.js'
import type { OverlayRenderer } from './types.js'

export const ConfirmOverlay: OverlayRenderer = ({ overlay }) => (
  <Box borderStyle="single" flexDirection="column">
    <Text bold>{overlay?.message ?? 'Confirm?'}</Text>
    <Text dimColor>Enter = yes · Esc = no</Text>
  </Box>
)
