/** AI 提问面板。 */
import React from 'react'
import { Box, Text } from '../../../dsh-tui/src/ui.js'
import type { OverlayRenderer } from './types.js'

export const QuestionOverlay: OverlayRenderer = ({ question }) => (
  <Box borderStyle="single" flexDirection="column">
    <Text bold>{question?.question?.header ?? 'Question'}</Text>
    <Text>{question?.question?.question ?? ''}</Text>
  </Box>
)
