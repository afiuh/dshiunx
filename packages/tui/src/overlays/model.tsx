/** /model 选择器（浮层）。 */
import React from 'react'
import { Box, Text } from '../../../dsh-tui/src/ui.js'
import type { OverlayRenderer } from './types.js'

export const ModelOverlay: OverlayRenderer = ({ channel }) => (
  <Box borderStyle="single" flexDirection="column">
    <Text bold>Model CORE</Text>
    {channel.models?.map((m: any) => <React.Fragment key={m.id}><Text>{m.name}</Text></React.Fragment>) ?? <Text dimColor>loading…</Text>}
  </Box>
)

// hmr test
