/** 通用覆盖层：未实现具体 UI 的 kind 用它（标题 + 提示）。 */
import React from 'react'
import { Box, Text } from '../../../dsh-tui/src/ui.js'
import type { OverlayRenderer } from './types.js'

export const GenericOverlay: OverlayRenderer = ({ overlay }) => (
  <Box borderStyle="single" flexDirection="column">
    <Text bold>{overlay?.kind ?? 'Overlay'}</Text>
    <Text dimColor>Esc = close</Text>
  </Box>
)
