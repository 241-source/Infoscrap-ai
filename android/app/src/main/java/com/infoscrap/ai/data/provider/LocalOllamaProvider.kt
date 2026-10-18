package com.infoscrap.ai.data.provider

import com.infoscrap.ai.data.model.ChatMessage
import io.ktor.client.HttpClient
import io.ktor.client.engine.okhttp.OkHttp
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.client.statement.bodyAsText
import io.ktor.http.ContentType
import io.ktor.http.contentType
import io.ktor.serialization.kotlinx.json.json
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import kotlinx.serialization.json.put

class LocalOllamaProvider(
    private val localHostUrl: String = "http://127.0.0.1:11434"
) : AiProvider {
    override val id: String = "local_ollama"
    override val displayName: String = "Local Termux / Ollama"

    private val client = HttpClient(OkHttp) {
        install(ContentNegotiation) {
            json(Json { ignoreUnknownKeys = true })
        }
    }

    override suspend fun generateResponse(
        prompt: String,
        conversationHistory: List<ChatMessage>,
        model: String,
        apiKey: String
    ): Result<String> {
        return try {
            val endpoint = "$localHostUrl/api/generate"
            val payload = buildJsonObject {
                put("model", model.ifBlank { "llama3.2:1b" })
                put("prompt", prompt)
                put("stream", false)
            }

            val response = client.post(endpoint) {
                contentType(ContentType.Application.Json)
                setBody(payload.toString())
            }

            val body = response.bodyAsText()
            val parsed = Json.parseToJsonElement(body).jsonObject
            val responseText = parsed["response"]?.jsonPrimitive?.content

            if (responseText != null) {
                Result.success(responseText)
            } else {
                Result.failure(Exception("Failed to receive output from local Ollama endpoint"))
            }
        } catch (e: Exception) {
            Result.failure(Exception("Cannot connect to local model daemon at $localHostUrl. Make sure Ollama or Termux llama.cpp is running."))
        }
    }

    override suspend fun testConnection(apiKey: String, model: String): Result<Boolean> {
        return generateResponse("ping", emptyList(), model, apiKey).map { true }
    }
}
