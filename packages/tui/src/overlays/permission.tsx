/** 权限模式 / 审批面板。 */
import React from 'react'
import { Box, Text } from '../../../dsh-tui/src/ui.js'
import type { OverlayRenderer } from './types.js'

export const PermissionOverlay: OverlayRenderer = ({ approval }) => (
  <Box borderStyle="single" flexDirection="column">
    <Text bold>{approval ? `Approve: ${approval.toolName ?? 'tool'}` : 'Permission'}</Text>
    <Text dimColor>y = allow · n = deny · Esc = cancel</Text>
  </Box>
)
