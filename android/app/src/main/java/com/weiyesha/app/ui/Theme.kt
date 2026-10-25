package com.weiyesha.app.ui

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily

// ---- 简记事风格色板（契约 v2 / D-8）----
// 纸白、墨色、灰阶、克制的点缀色；不用大面积色块
val PaperWhite = Color(0xFFFAF9F7)
val InkBlack = Color(0xFF1F1F1F)
val InkGray = Color(0xFF8C8C8C)
val InkFaint = Color(0xFFC4C4C4)
val SuccessInk = Color(0xFF4A7C59)
val FailInk = Color(0xFFA94442)
val WarnInk = Color(0xFF9A7B4F)
val DividerColor = Color(0xFFE8E6E1)
val FieldFill = Color(0xFFF3F1EC)

private val LightColors = lightColorScheme(
    primary = InkBlack,
    onPrimary = PaperWhite,
    background = PaperWhite,
    onBackground = InkBlack,
    surface = PaperWhite,
    onSurface = InkBlack,
    surfaceVariant = FieldFill,
    onSurfaceVariant = InkGray,
    outline = InkFaint,
    error = FailInk,
)

/** 衬线字体（状态大字 / 标题用，书卷气） */
val SerifFamily = FontFamily.Serif

@Composable
fun WeiyeshaTheme(content: @Composable () -> Unit) {
    MaterialTheme(colorScheme = LightColors, content = content)
}
