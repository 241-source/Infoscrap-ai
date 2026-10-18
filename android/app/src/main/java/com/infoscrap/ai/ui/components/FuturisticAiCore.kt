package com.infoscrap.ai.ui.components

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.size
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.unit.dp
import com.infoscrap.ai.data.model.AssistantStatus
import com.infoscrap.ai.theme.CyanAccent
import com.infoscrap.ai.theme.CyanGlow
import com.infoscrap.ai.theme.ElectricBlue
import com.infoscrap.ai.theme.ErrorRed
import com.infoscrap.ai.theme.PurpleAccent
import kotlin.math.cos
import kotlin.math.sin

@Composable
fun FuturisticAiCore(
    status: AssistantStatus,
    modifier: Modifier = Modifier
) {
    val infiniteTransition = rememberInfiniteTransition(label = "core_anim")

    // Dynamic rotation for futuristic concentric tech rings
    val rotationOuter by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 360f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = if (status == AssistantStatus.THINKING) 3000 else 18000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "rotation_outer"
    )

    val rotationInner by infiniteTransition.animateFloat(
        initialValue = 360f,
        targetValue = 0f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = if (status == AssistantStatus.THINKING) 2000 else 12000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "rotation_inner"
    )

    // Pulse scale depending on status
    val pulseScale by infiniteTransition.animateFloat(
        initialValue = 0.88f,
        targetValue = if (status == AssistantStatus.LISTENING || status == AssistantStatus.SPEAKING) 1.15f else 0.98f,
        animationSpec = infiniteRepeatable(
            animation = tween(
                durationMillis = when (status) {
                    AssistantStatus.LISTENING -> 800
                    AssistantStatus.SPEAKING -> 450
                    AssistantStatus.THINKING -> 600
                    else -> 2400
                },
                easing = LinearEasing
            ),
            repeatMode = RepeatMode.Reverse
        ),
        label = "pulse_scale"
    )

    val primaryColor = when (status) {
        AssistantStatus.LISTENING -> CyanGlow
        AssistantStatus.THINKING -> PurpleAccent
        AssistantStatus.SPEAKING -> ElectricBlue
        AssistantStatus.ERROR -> ErrorRed
        else -> CyanAccent
    }

    Box(
        modifier = modifier.size(190.dp),
        contentAlignment = Alignment.Center
    ) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            val center = Offset(size.width / 2f, size.height / 2f)
            val baseRadius = (size.minDimension / 2f) * 0.85f

            // Outer glow ring
            drawCircle(
                brush = Brush.radialGradient(
                    colors = listOf(primaryColor.copy(alpha = 0.35f), Color.Transparent),
                    center = center,
                    radius = baseRadius * 1.3f
                ),
                radius = baseRadius * 1.3f,
                center = center
            )

            // Segmented arc ring (JARVIS tech aesthetic)
            val segmentCount = 12
            for (i in 0 until segmentCount) {
                val startAngle = (i * (360f / segmentCount)) + rotationOuter
                drawArc(
                    color = primaryColor.copy(alpha = 0.65f),
                    startAngle = startAngle,
                    sweepAngle = 18f,
                    useCenter = false,
                    topLeft = Offset(center.x - baseRadius, center.y - baseRadius),
                    size = androidx.compose.ui.geometry.Size(baseRadius * 2, baseRadius * 2),
                    style = Stroke(width = 3.dp.toPx(), cap = StrokeCap.Round)
                )
            }

            // Inner counter-rotating ring
            val innerRadius = baseRadius * 0.72f
            for (j in 0 until 8) {
                val angle = (j * (360f / 8)) + rotationInner
                drawArc(
                    color = ElectricBlue.copy(alpha = 0.75f),
                    startAngle = angle,
                    sweepAngle = 26f,
                    useCenter = false,
                    topLeft = Offset(center.x - innerRadius, center.y - innerRadius),
                    size = androidx.compose.ui.geometry.Size(innerRadius * 2, innerRadius * 2),
                    style = Stroke(width = 2.dp.toPx(), cap = StrokeCap.Round)
                )
            }

            // Glowing core orb
            val orbRadius = (baseRadius * 0.45f) * pulseScale
            drawCircle(
                brush = Brush.radialGradient(
                    colors = listOf(
                        Color.White,
                        primaryColor,
                        primaryColor.copy(alpha = 0.2f)
                    ),
                    center = center,
                    radius = orbRadius
                ),
                radius = orbRadius,
                center = center
            )

            // Dynamic radiating waveform spikes during speaking or listening
            if (status == AssistantStatus.SPEAKING || status == AssistantStatus.LISTENING) {
                val spikeCount = 24
                for (s in 0 until spikeCount) {
                    val angleRad = Math.toRadians((s * (360.0 / spikeCount) + rotationOuter).toDouble())
                    val spikeLength = if (s % 2 == 0) 18.dp.toPx() * pulseScale else 8.dp.toPx()
                    val startX = center.x + (baseRadius * cos(angleRad)).toFloat()
                    val startY = center.y + (baseRadius * sin(angleRad)).toFloat()
                    val endX = center.x + ((baseRadius + spikeLength) * cos(angleRad)).toFloat()
                    val endY = center.y + ((baseRadius + spikeLength) * sin(angleRad)).toFloat()

                    drawLine(
                        color = primaryColor.copy(alpha = 0.8f),
                        start = Offset(startX, startY),
                        end = Offset(endX, endY),
                        strokeWidth = 2.dp.toPx(),
                        cap = StrokeCap.Round
                    )
                }
            }
        }
    }
}
