package com.infoscrap.ai.data.provider

import com.infoscrap.ai.data.model.ChatMessage
import kotlinx.coroutines.flow.Flow

interface AiProvider {
    val id: String
    val displayName: String

    suspend fun generateResponse(
        prompt: String,
        conversationHistory: List<ChatMessage>,
        model: String,
        apiKey: String
    ): Result<String>

    suspend fun testConnection(apiKey: String, model: String): Result<Boolean>
}
