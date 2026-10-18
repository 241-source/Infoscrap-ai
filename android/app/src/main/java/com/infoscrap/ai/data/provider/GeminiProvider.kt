package com.infoscrap.ai.data.provider

import com.infoscrap.ai.data.model.ChatMessage
import com.infoscrap.ai.data.model.MessageSender
import io.ktor.client.HttpClient
import io.ktor.client.engine.okhttp.OkHttp
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.client.request.header
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.client.statement.bodyAsText
import io.ktor.http.ContentType
import io.ktor.http.contentType
import io.ktor.serialization.kotlinx.json.json
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.buildJsonArray
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import kotlinx.serialization.json.put
import kotlinx.serialization.json.putJsonArray
import kotlinx.serialization.json.putJsonObject

class GeminiProvider : AiProvider {
    override val id: String = "gemini"
    override val displayName: String = "Google Gemini"

    private val client = HttpClient(OkHttp) {
        install(ContentNegotiation) {
            json(Json {
                ignoreUnknownKeys = true
                isLenient = true
            })
        }
    }

    private val systemInstruction = """
        You are InfoScrap AI, an advanced Android Personal AI Assistant.
        Personality: Soft-spoken, calm, intelligent, friendly, supportive, respectful, emotionally considerate, occasionally humorous.
        Voice: Masculine style, natural conversational cadence.
        Device support: You can execute commands like "Open YouTube", "Search Google", "Scroll down", "Read screen text", "Translate into Hindi", "Dark mode".
        When answering, provide precise, friendly, and structured guidance.
    """.trimIndent()

    override suspend fun generateResponse(
        prompt: String,
        conversationHistory: List<ChatMessage>,
        model: String,
        apiKey: String
    ): Result<String> {
        return try {
            val endpoint = "https://generativelanguage.googleapis.com/v1beta/models/$model:generateContent"
            
            val payload = buildJsonObject {
                putJsonObject("systemInstruction") {
                    putJsonArray("parts") {
                        add(buildJsonObject { put("text", systemInstruction) })
                    }
                }
                putJsonArray("contents") {
                    // Send up to last 6 history messages
                    conversationHistory.takeLast(6).forEach { msg ->
                        add(buildJsonObject {
                            put("role", if (msg.sender == MessageSender.USER) "user" else "model")
                            putJsonArray("parts") {
                                add(buildJsonObject { put("text", msg.text) })
                            }
                        })
                    }
                    // Current message
                    add(buildJsonObject {
                        put("role", "user")
                        putJsonArray("parts") {
                            add(buildJsonObject { put("text", prompt) })
                        }
                    })
                }
                putJsonObject("generationConfig") {
                    put("temperature", 0.7)
                    put("topP", 0.95)
                }
            }

            val response = client.post(endpoint) {
                contentType(ContentType.Application.Json)
                header("x-goog-api-key", apiKey)
                setBody(payload.toString())
            }

            val responseText = response.bodyAsText()
            val jsonResponse = Json.parseToJsonElement(responseText).jsonObject

            val candidates = jsonResponse["candidates"]?.jsonArray
            val text = candidates?.firstOrNull()?.jsonObject
                ?.get("content")?.jsonObject
                ?.get("parts")?.jsonArray
                ?.firstOrNull()?.jsonObject
                ?.get("text")?.jsonPrimitive?.content

            if (text != null) {
                Result.success(text)
            } else {
                val errorMsg = jsonResponse["error"]?.jsonObject?.get("message")?.jsonPrimitive?.content
                    ?: "Unexpected empty response from Gemini core"
                Result.failure(Exception(errorMsg))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun testConnection(apiKey: String, model: String): Result<Boolean> {
        return generateResponse("Ping", emptyList(), model, apiKey).map { true }
    }
}
