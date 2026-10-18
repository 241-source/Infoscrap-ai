package com.infoscrap.ai.data.repository

import android.content.Context
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.infoscrap.ai.data.model.AiProviderConfig
import com.infoscrap.ai.data.model.ChatMessage
import com.infoscrap.ai.data.model.ProviderType
import com.infoscrap.ai.data.provider.AiProvider
import com.infoscrap.ai.data.provider.GeminiProvider
import com.infoscrap.ai.data.provider.LocalOllamaProvider
import com.infoscrap.ai.data.provider.OpenAiProvider
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.map

private val Context.dataStore by preferencesDataStore(name = "infoscrap_settings")

class AssistantRepository(private val context: Context) {

    private val geminiProvider = GeminiProvider()
    private val openAiProvider = OpenAiProvider()
    private val localOllamaProvider = LocalOllamaProvider()

    private val _messages = MutableStateFlow<List<ChatMessage>>(emptyList())
    val messages = _messages.asStateFlow()

    companion object {
        val KEY_ACTIVE_PROVIDER = stringPreferencesKey("active_provider")
        val KEY_GEMINI_KEY = stringPreferencesKey("gemini_key")
        val KEY_GEMINI_MODEL = stringPreferencesKey("gemini_model")
        val KEY_OPENAI_KEY = stringPreferencesKey("openai_key")
        val KEY_OPENAI_MODEL = stringPreferencesKey("openai_model")
        val KEY_MEMORY_ENABLED = booleanPreferencesKey("memory_enabled")
        val KEY_VOICE_PITCH = stringPreferencesKey("voice_pitch")
        val KEY_VOICE_SPEED = stringPreferencesKey("voice_speed")
    }

    suspend fun saveMessage(message: ChatMessage) {
        _messages.value = _messages.value + message
    }

    fun clearHistory() {
        _messages.value = emptyList()
    }

    fun getActiveProvider(type: ProviderType): AiProvider {
        return when (type) {
            ProviderType.GEMINI -> geminiProvider
            ProviderType.OPENAI_COMPATIBLE -> openAiProvider
            ProviderType.LOCAL_OLLAMA -> localOllamaProvider
            ProviderType.ANTHROPIC -> openAiProvider // Anthropics adapter fallback
        }
    }

    suspend fun setGeminiApiKey(key: String) {
        context.dataStore.edit { it[KEY_GEMINI_KEY] = key }
    }

    suspend fun setGeminiModel(model: String) {
        context.dataStore.edit { it[KEY_GEMINI_MODEL] = model }
    }

    val geminiKeyFlow: Flow<String> = context.dataStore.data.map {
        it[KEY_GEMINI_KEY] ?: ""
    }

    val geminiModelFlow: Flow<String> = context.dataStore.data.map {
        it[KEY_GEMINI_MODEL] ?: "gemini-3.8-flash"
    }

    val memoryEnabledFlow: Flow<Boolean> = context.dataStore.data.map {
        it[KEY_MEMORY_ENABLED] ?: true
    }

    suspend fun toggleMemory(enabled: Boolean) {
        context.dataStore.edit { it[KEY_MEMORY_ENABLED] = enabled }
    }
}
