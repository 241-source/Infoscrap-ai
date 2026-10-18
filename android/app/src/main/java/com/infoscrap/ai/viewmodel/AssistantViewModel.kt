package com.infoscrap.ai.viewmodel

import android.app.Application
import android.content.Intent
import android.net.Uri
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.infoscrap.ai.data.model.AssistantStatus
import com.infoscrap.ai.data.model.ChatMessage
import com.infoscrap.ai.data.model.MessageSender
import com.infoscrap.ai.data.model.ProviderType
import com.infoscrap.ai.data.repository.AssistantRepository
import com.infoscrap.ai.service.InfoScrapAccessibilityService
import com.infoscrap.ai.service.InfoScrapVoiceService
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.net.URLEncoder

class AssistantViewModel(application: Application) : AndroidViewModel(application) {

    private val repository = AssistantRepository(application)

    private val _status = MutableStateFlow(AssistantStatus.IDLE)
    val status = _status.asStateFlow()

    private val _messages = MutableStateFlow<List<ChatMessage>>(emptyList())
    val messages = _messages.asStateFlow()

    private val _isDarkTheme = MutableStateFlow(true)
    val isDarkTheme = _isDarkTheme.asStateFlow()

    private val _currentProvider = MutableStateFlow(ProviderType.GEMINI)
    val currentProvider = _currentProvider.asStateFlow()

    private val _currentModel = MutableStateFlow("gemini-3.8-flash")
    val currentModel = _currentModel.asStateFlow()

    private val _apiKey = MutableStateFlow("")
    val apiKey = _apiKey.asStateFlow()

    private val _lastActionNotice = MutableStateFlow<String?>(null)
    val lastActionNotice = _lastActionNotice.asStateFlow()

    private var voiceService: InfoScrapVoiceService? = null

    init {
        // Welcome message with masculine, polite assistant persona
        val initialGreeting = ChatMessage(
            sender = MessageSender.ASSISTANT,
            text = "Good day, sir. InfoScrap AI is online and operational. All core neural pathways and Android subsystems are ready at your command."
        )
        _messages.value = listOf(initialGreeting)

        voiceService = InfoScrapVoiceService(
            context = application,
            onSpeechRecognized = { spokenText ->
                processUserPrompt(spokenText)
            },
            onListeningStatusChanged = { listening ->
                _status.value = if (listening) AssistantStatus.LISTENING else AssistantStatus.IDLE
            }
        )

        viewModelScope.launch {
            repository.geminiKeyFlow.collect { _apiKey.value = it }
        }
        viewModelScope.launch {
            repository.geminiModelFlow.collect { _currentModel.value = it }
        }
    }

    fun startListening() {
        voiceService?.startListening()
    }

    fun stopListening() {
        voiceService?.stopListening()
    }

    fun stopSpeaking() {
        voiceService?.stopSpeaking()
        if (_status.value == AssistantStatus.SPEAKING) {
            _status.value = AssistantStatus.IDLE
        }
    }

    fun toggleTheme() {
        _isDarkTheme.value = !_isDarkTheme.value
    }

    fun processUserPrompt(userInput: String) {
        val trimmed = userInput.trim()
        if (trimmed.isBlank()) return

        // Add user message
        val userMsg = ChatMessage(sender = MessageSender.USER, text = trimmed)
        _messages.value = _messages.value + userMsg

        // Check for recognized local device commands
        val lower = trimmed.lowercase()

        when {
            lower.contains("open youtube") -> {
                executeOpenApp("com.google.android.youtube", "https://youtube.com", "Opening YouTube for you, sir.")
                return
            }
            lower.startsWith("search") || lower.contains("search this on google") -> {
                val query = trimmed.replace(Regex("(?i)^search (this on google|google for|for)?"), "").trim()
                executeWebSearch(query)
                return
            }
            lower.contains("read the text on my screen") || lower.contains("read screen") -> {
                executeReadScreen()
                return
            }
            lower.contains("scroll down") -> {
                executeScroll(down = true)
                return
            }
            lower.contains("scroll up") -> {
                executeScroll(down = false)
                return
            }
            lower.contains("turn on dark mode") -> {
                _isDarkTheme.value = true
                respondLocal("Dark mode activated. Visual luminescence adjusted.")
                return
            }
            lower.contains("turn on light mode") -> {
                _isDarkTheme.value = false
                respondLocal("Light mode engaged, sir.")
                return
            }
            lower.contains("stop speaking") -> {
                stopSpeaking()
                return
            }
        }

        // Query AI Brain
        queryAiBrain(trimmed)
    }

    private fun queryAiBrain(prompt: String) {
        _status.value = AssistantStatus.THINKING

        viewModelScope.launch {
            val provider = repository.getActiveProvider(_currentProvider.value)
            val result = provider.generateResponse(
                prompt = prompt,
                conversationHistory = _messages.value,
                model = _currentModel.value,
                apiKey = _apiKey.value
            )

            result.onSuccess { responseText ->
                _status.value = AssistantStatus.SPEAKING
                val isHindi = prompt.contains(Regex("[\\u0900-\\u097F]")) || responseText.contains(Regex("[\\u0900-\\u097F]"))
                
                val aiMsg = ChatMessage(
                    sender = MessageSender.ASSISTANT,
                    text = responseText,
                    containsCode = responseText.contains("```")
                )
                _messages.value = _messages.value + aiMsg

                // Speak response with masculine voice
                voiceService?.speak(stripMarkdownForSpeech(responseText), isHindi = isHindi)
            }.onFailure { error ->
                _status.value = AssistantStatus.ERROR
                val errorMsg = ChatMessage(
                    sender = MessageSender.SYSTEM,
                    text = "Neural interface error: ${error.localizedMessage ?: "Unable to establish connection to core."}"
                )
                _messages.value = _messages.value + errorMsg
            }
        }
    }

    private fun executeOpenApp(packageName: String, fallbackUrl: String, acknowledgement: String) {
        respondLocal(acknowledgement)
        val pm = getApplication<Application>().packageManager
        val launchIntent = pm.getLaunchIntentForPackage(packageName)
        if (launchIntent != null) {
            launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            getApplication<Application>().startActivity(launchIntent)
        } else {
            val browserIntent = Intent(Intent.ACTION_VIEW, Uri.parse(fallbackUrl)).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            getApplication<Application>().startActivity(browserIntent)
        }
    }

    private fun executeWebSearch(query: String) {
        val cleanQuery = if (query.isBlank()) "latest technology" else query
        respondLocal("Searching Google for '$cleanQuery', right away.")
        val url = "https://www.google.com/search?q=" + URLEncoder.encode(cleanQuery, "UTF-8")
        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url)).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        getApplication<Application>().startActivity(intent)
    }

    private fun executeReadScreen() {
        val service = InfoScrapAccessibilityService.instance
        if (service != null) {
            val screenText = service.extractScreenText()
            respondLocal("Analyzing screen context. Here is what I detected:\n\n$screenText")
        } else {
            respondLocal("Accessibility service is not active. Please grant InfoScrap AI accessibility permissions in Android Settings to read on-screen elements.")
        }
    }

    private fun executeScroll(down: Boolean) {
        val service = InfoScrapAccessibilityService.instance
        if (service != null) {
            val success = if (down) service.performScrollDown() else service.performScrollUp()
            if (success) {
                respondLocal(if (down) "Scrolling downward, sir." else "Scrolling upward, sir.")
            } else {
                respondLocal("Screen is already at the limit or cannot be scrolled.")
            }
        } else {
            respondLocal("Accessibility permissions required to execute scroll gestures.")
        }
    }

    private fun respondLocal(text: String) {
        _status.value = AssistantStatus.SPEAKING
        val msg = ChatMessage(sender = MessageSender.ASSISTANT, text = text)
        _messages.value = _messages.value + msg
        voiceService?.speak(text)
    }

    private fun stripMarkdownForSpeech(markdown: String): String {
        return markdown
            .replace(Regex("```[\\s\\S]*?```"), "Code block provided on screen.")
            .replace(Regex("[*#_`>]"), "")
            .trim()
    }

    fun clearConversation() {
        _messages.value = emptyList()
        repository.clearHistory()
    }

    fun setApiKey(key: String) {
        viewModelScope.launch { repository.setGeminiApiKey(key) }
    }

    fun setModel(model: String) {
        viewModelScope.launch { repository.setGeminiModel(model) }
    }

    fun setVoicePitch(pitch: Float) {
        voiceService?.setVoicePitch(pitch)
    }

    fun setVoiceSpeed(speed: Float) {
        voiceService?.setVoiceSpeed(speed)
    }

    override fun onCleared() {
        super.onCleared()
        voiceService?.destroy()
    }
}
