/** /model 选择器（浮层）。 */
import React from 'react'
import { Box, Text } from '../../../dsh-tui/src/ui.js'
import type { OverlayRenderer } from './types.js'

export const ModelOverlay: OverlayRenderer = ({ channel }) => (
  <Box borderStyle="single" flexDirection="column">
    <Text bold>Model</Text>
    {channel.models?.map((m: any) => <Text key={m.id}>{m.name}</Text>) ?? <Text dimColor>loading…</Text>}
  </Box>
)
