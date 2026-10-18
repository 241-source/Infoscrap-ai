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

class OpenAiProvider(
    private val customBaseUrl: String = "https://api.openai.com/v1"
) : AiProvider {
    override val id: String = "openai_compatible"
    override val displayName: String = "OpenAI Compatible"

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
            val endpoint = "$customBaseUrl/chat/completions"
            val payload = buildJsonObject {
                put("model", model)
                putJsonArray("messages") {
                    add(buildJsonObject {
                        put("role", "system")
                        put("content", "You are InfoScrap AI, an advanced Android Personal AI Assistant. Voice: Masculine, calm, intelligent, friendly.")
                    })
                    conversationHistory.takeLast(6).forEach { msg ->
                        add(buildJsonObject {
                            put("role", if (msg.sender == MessageSender.USER) "user" else "assistant")
                            put("content", msg.text)
                        })
                    }
                    add(buildJsonObject {
                        put("role", "user")
                        put("content", prompt)
                    })
                }
            }

            val response = client.post(endpoint) {
                contentType(ContentType.Application.Json)
                header("Authorization", "Bearer $apiKey")
                setBody(payload.toString())
            }

            val body = response.bodyAsText()
            val parsed = Json.parseToJsonElement(body).jsonObject
            val choices = parsed["choices"]?.jsonArray
            val content = choices?.firstOrNull()?.jsonObject
                ?.get("message")?.jsonObject
                ?.get("content")?.jsonPrimitive?.content

            if (content != null) {
                Result.success(content)
            } else {
                val errorMsg = parsed["error"]?.jsonObject?.get("message")?.jsonPrimitive?.content
                    ?: "OpenAI API returned an invalid response"
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
