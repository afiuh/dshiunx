/** 图片预览。 */
import React from 'react'
import { Box, Text } from '../../../dsh-tui/src/ui.js'
import type { OverlayRenderer } from './types.js'

export const ImagePreviewOverlay: OverlayRenderer = ({ preview }) => (
  <Box borderStyle="single" flexDirection="column">
    <Text bold>{preview?.title ?? 'Image'}</Text>
    <Text dimColor>Esc = close</Text>
  </Box>
)
