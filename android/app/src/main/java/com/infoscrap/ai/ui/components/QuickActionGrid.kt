package com.infoscrap.ai.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Code
import androidx.compose.material.icons.filled.Language
import androidx.compose.material.icons.filled.Mic
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Psychology
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.ShortText
import androidx.compose.material.icons.filled.SmartDisplay
import androidx.compose.material.icons.filled.TouchApp
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.infoscrap.ai.theme.CyanAccent
import com.infoscrap.ai.theme.DeepNavySurface
import com.infoscrap.ai.theme.TextPrimary

data class QuickActionItem(
    val title: String,
    val prompt: String,
    val icon: ImageVector
)

val defaultQuickActions = listOf(
    QuickActionItem("Open YouTube", "Open YouTube", Icons.Default.PlayArrow),
    QuickActionItem("Search Web", "Search the web for latest AI news", Icons.Default.Search),
    QuickActionItem("Ask AI", "What are the core fundamentals of clean architecture?", Icons.Default.Psychology),
    QuickActionItem("Write Code", "Write a clean Kotlin coroutine function for retry logic", Icons.Default.Code),
    QuickActionItem("Read Screen", "Read the text on my screen", Icons.Default.SmartDisplay),
    QuickActionItem("Translate Hindi", "Translate this into Hindi: Welcome to the future of personal intelligence", Icons.Default.Language),
    QuickActionItem("Summarize", "Summarize the key differences between Jetpack Compose and traditional Views", Icons.Default.ShortText),
    QuickActionItem("Scroll Down", "Scroll down", Icons.Default.TouchApp),
    QuickActionItem("Voice Mode", "Hello InfoScrap, give me a quick system status check", Icons.Default.Mic)
)

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun QuickActionGrid(
    onActionSelected: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    FlowRow(
        modifier = modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp),
        maxItemsInEachRow = 3
    ) {
        defaultQuickActions.forEach { action ->
            QuickActionButton(
                item = action,
                onClick = { onActionSelected(action.prompt) }
            )
        }
    }
}

@Composable
fun QuickActionButton(
    item: QuickActionItem,
    onClick: () -> Unit
) {
    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(8.dp))
            .background(DeepNavySurface.copy(alpha = 0.85f))
            .border(1.dp, CyanAccent.copy(alpha = 0.3f), RoundedCornerShape(8.dp))
            .clickable { onClick() }
            .padding(horizontal = 10.dp, vertical = 7.dp)
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            Icon(
                imageVector = item.icon,
                contentDescription = item.title,
                tint = CyanAccent,
                modifier = Modifier.size(14.dp)
            )
            Text(
                text = item.title,
                color = TextPrimary,
                fontSize = 12.sp
            )
        }
    }
}
