package com.infoscrap.ai.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Key
import androidx.compose.material.icons.filled.ModelTraining
import androidx.compose.material.icons.filled.RecordVoiceOver
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Slider
import androidx.compose.material3.SliderDefaults
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.infoscrap.ai.data.model.ProviderType
import com.infoscrap.ai.theme.CyanAccent
import com.infoscrap.ai.theme.DarkBackground
import com.infoscrap.ai.theme.DeepNavySurface
import com.infoscrap.ai.theme.ElectricBlue
import com.infoscrap.ai.theme.TextPrimary
import com.infoscrap.ai.theme.TextSecondary
import com.infoscrap.ai.viewmodel.AssistantViewModel

@Composable
fun SettingsScreen(
    viewModel: AssistantViewModel,
    onBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val currentModel by viewModel.currentModel.collectAsState()
    val apiKey by viewModel.apiKey.collectAsState()
    val currentProvider by viewModel.currentProvider.collectAsState()

    var keyInput by remember(apiKey) { mutableStateOf(apiKey) }
    var showKey by remember { mutableStateOf(false) }
    var speedVal by remember { mutableFloatStateOf(0.95f) }
    var pitchVal by remember { mutableFloatStateOf(0.85f) }
    var memoryActive by remember { mutableStateOf(true) }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(DarkBackground)
            .padding(16.dp)
            .verticalScroll(rememberScrollState())
    ) {
        // Header
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.padding(bottom = 16.dp)
        ) {
            IconButton(onClick = onBack) {
                Icon(
                    imageVector = Icons.Default.ArrowBack,
                    contentDescription = "Back",
                    tint = CyanAccent
                )
            }
            Text(
                text = "SYSTEM CONFIGURATION",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = CyanAccent,
                fontFamily = FontFamily.Monospace,
                letterSpacing = 1.sp
            )
        }

        // Section: Gemini AI Brain
        SettingsCard(title = "GEMINI AI BRAIN (PRIMARY)") {
            Text(
                text = "Configure official Google Gemini neural connection.",
                fontSize = 12.sp,
                color = TextSecondary,
                modifier = Modifier.padding(bottom = 8.dp)
            )

            OutlinedTextField(
                value = keyInput,
                onValueChange = { keyInput = it },
                label = { Text("Gemini API Key") },
                singleLine = true,
                visualTransformation = if (showKey) VisualTransformation.None else PasswordVisualTransformation(),
                trailingIcon = {
                    IconButton(onClick = { showKey = !showKey }) {
                        Icon(
                            imageVector = if (showKey) Icons.Default.VisibilityOff else Icons.Default.Visibility,
                            contentDescription = "Toggle Visibility",
                            tint = CyanAccent
                        )
                    }
                },
                modifier = Modifier.fillMaxWidth(),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = CyanAccent,
                    unfocusedBorderColor = CyanAccent.copy(alpha = 0.3f),
                    focusedContainerColor = DarkBackground,
                    unfocusedContainerColor = DarkBackground,
                    focusedTextColor = TextPrimary,
                    unfocusedTextColor = TextPrimary
                )
            )

            Spacer(modifier = Modifier.height(8.dp))

            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Button(
                    onClick = { viewModel.setApiKey(keyInput) },
                    colors = ButtonDefaults.buttonColors(containerColor = CyanAccent),
                    modifier = Modifier.weight(1f)
                ) {
                    Text("Save Key", color = DarkBackground)
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            Text("Selected Model: $currentModel", color = TextPrimary, fontSize = 13.sp)
            Row(
                horizontalArrangement = Arrangement.spacedBy(6.dp),
                modifier = Modifier.padding(top = 4.dp)
            ) {
                listOf("gemini-3.8-flash", "gemini-4-argon", "gemini-3.1-flash-lite").forEach { model ->
                    Button(
                        onClick = { viewModel.setModel(model) },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (currentModel == model) ElectricBlue else DeepNavySurface
                        ),
                        modifier = Modifier.weight(1f)
                    ) {
                        Text(
                            text = model.replace("gemini-", "").replace("-preview", ""),
                            fontSize = 10.sp,
                            maxLines = 1
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Section: Natural Voice Persona
        SettingsCard(title = "VOICE ENGINE (MASCULINE JARVIS STYLE)") {
            Text(
                text = "Voice Pitch (Masculine Calibrated: ${(pitchVal * 100).toInt()}%)",
                fontSize = 12.sp,
                color = TextSecondary
            )
            Slider(
                value = pitchVal,
                onValueChange = {
                    pitchVal = it
                    viewModel.setVoicePitch(it)
                },
                valueRange = 0.5f..1.5f,
                colors = SliderDefaults.colors(thumbColor = CyanAccent, activeTrackColor = CyanAccent)
            )

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = "Speaking Rate (Soft-Spoken: ${(speedVal * 100).toInt()}%)",
                fontSize = 12.sp,
                color = TextSecondary
            )
            Slider(
                value = speedVal,
                onValueChange = {
                    speedVal = it
                    viewModel.setVoiceSpeed(it)
                },
                valueRange = 0.6f..1.4f,
                colors = SliderDefaults.colors(thumbColor = ElectricBlue, activeTrackColor = ElectricBlue)
            )
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Section: Multi-Model & Local Termux System
        SettingsCard(title = "MULTI-MODEL ARCHITECTURE") {
            Text(
                text = "Active Provider: ${currentProvider.name}",
                fontSize = 13.sp,
                color = TextPrimary
            )
            Text(
                text = "Switch dynamically between Gemini, OpenAI-compatible backends, and local Termux / Ollama daemon running on 127.0.0.1:11434.",
                fontSize = 11.sp,
                color = TextSecondary,
                modifier = Modifier.padding(top = 4.dp)
            )
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Section: Cybersecurity & Storage
        SettingsCard(title = "CYBERSECURITY & ANDROID PERMISSIONS") {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text("Persistent Memory", color = TextPrimary, fontSize = 13.sp)
                    Text("Store context across queries", color = TextSecondary, fontSize = 11.sp)
                }
                Switch(
                    checked = memoryActive,
                    onCheckedChange = { memoryActive = it },
                    colors = SwitchDefaults.colors(checkedThumbColor = CyanAccent)
                )
            }
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "Note: API credentials stored locally in Android DataStore. Do not expose keys in publicly distributed APKs.",
                fontSize = 10.sp,
                color = TextSecondary
            )
        }
    }
}

@Composable
fun SettingsCard(
    title: String,
    content: @Composable () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(DeepNavySurface.copy(alpha = 0.8f))
            .border(1.dp, CyanAccent.copy(alpha = 0.25f), RoundedCornerShape(12.dp))
            .padding(14.dp)
    ) {
        Column {
            Text(
                text = title,
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                color = CyanAccent,
                fontFamily = FontFamily.Monospace,
                letterSpacing = 1.sp,
                modifier = Modifier.padding(bottom = 10.dp)
            )
            content()
        }
    }
}
