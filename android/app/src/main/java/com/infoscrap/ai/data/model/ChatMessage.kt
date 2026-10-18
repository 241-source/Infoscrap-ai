package com.infoscrap.ai.data.model

import kotlinx.serialization.Serializable
import java.util.UUID

@Serializable
data class ChatMessage(
    val id: String = UUID.randomUUID().toString(),
    val sender: MessageSender,
    val text: String,
    val timestamp: Long = System.currentTimeMillis(),
    val containsCode: Boolean = false,
    val actionPayload: ActionPayload? = null
)

@Serializable
enum class MessageSender {
    USER,
    ASSISTANT,
    SYSTEM
}

@Serializable
data class ActionPayload(
    val actionType: String,
    val target: String? = null,
    val query: String? = null
)

enum class AssistantStatus {
    IDLE,
    LISTENING,
    THINKING,
    SPEAKING,
    ERROR,
    OFFLINE
}

@Serializable
enum class ProviderType {
    GEMINI,
    OPENAI_COMPATIBLE,
    ANTHROPIC,
    LOCAL_OLLAMA
}

@Serializable
data class AiProviderConfig(
    val providerType: ProviderType,
    val name: String,
    val isEnabled: Boolean = true,
    val isDefault: Boolean = false,
    val apiKey: String = "",
    val baseUrl: String = "",
    val selectedModel: String,
    val availableModels: List<String> = emptyList(),
    val supportsStreaming: Boolean = true,
    val timeoutSeconds: Int = 30
)
