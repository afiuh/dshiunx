/** 搜索栏。 */
import React from 'react'
import { Box, Text } from '../../../dsh-tui/src/ui.js'
import type { OverlayRenderer } from './types.js'

export const SearchOverlay: OverlayRenderer = ({ query, count, current }) => (
  <Box borderStyle="single">
    <Text>/{query ?? ''}</Text>
    <Text dimColor>  {count ?? 0} matches {current ?? 0}/{count ?? 0}</Text>
  </Box>
)
