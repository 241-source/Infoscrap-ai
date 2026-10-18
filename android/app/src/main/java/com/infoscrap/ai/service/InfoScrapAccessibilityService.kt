package com.infoscrap.ai.service

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.GestureDescription
import android.graphics.Path
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo

class InfoScrapAccessibilityService : AccessibilityService() {

    companion object {
        var instance: InfoScrapAccessibilityService? = null
            private set
    }

    override fun onServiceConnected() {
        super.onServiceConnected()
        instance = this
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        // Track view changes if needed
    }

    override fun onInterrupt() {}

    override fun onDestroy() {
        super.onDestroy()
        instance = null
    }

    /**
     * Reads visible text on the active window
     */
    fun extractScreenText(): String {
        val rootNode = rootInActiveWindow ?: return "Unable to access current screen node. Please ensure permissions are granted."
        val builder = StringBuilder()
        traverseNode(rootNode, builder)
        return if (builder.isBlank()) "No readable text detected on screen." else builder.toString()
    }

    private fun traverseNode(node: AccessibilityNodeInfo, builder: StringBuilder) {
        node.text?.let {
            if (it.isNotBlank()) {
                builder.append(it).append("\n")
            }
        }
        node.contentDescription?.let {
            if (it.isNotBlank()) {
                builder.append("[Description: ").append(it).append("]\n")
            }
        }
        for (i in 0 until node.childCount) {
            val child = node.getChild(i) ?: continue
            traverseNode(child, builder)
        }
    }

    /**
     * Performs automated scroll down gesture
     */
    fun performScrollDown(): Boolean {
        val root = rootInActiveWindow
        if (root != null) {
            val scrolled = root.performAction(AccessibilityNodeInfo.ACTION_SCROLL_FORWARD)
            if (scrolled) return true
        }

        // Fallback to swipe gesture
        val displayMetrics = resources.displayMetrics
        val width = displayMetrics.widthPixels.toFloat()
        val height = displayMetrics.heightPixels.toFloat()

        val path = Path().apply {
            moveTo(width / 2, height * 0.75f)
            lineTo(width / 2, height * 0.25f)
        }

        val gesture = GestureDescription.Builder()
            .addStroke(GestureDescription.StrokeDescription(path, 0, 300))
            .build()

        return dispatchGesture(gesture, null, null)
    }

    /**
     * Performs automated scroll up gesture
     */
    fun performScrollUp(): Boolean {
        val root = rootInActiveWindow
        if (root != null) {
            val scrolled = root.performAction(AccessibilityNodeInfo.ACTION_SCROLL_BACKWARD)
            if (scrolled) return true
        }

        val displayMetrics = resources.displayMetrics
        val width = displayMetrics.widthPixels.toFloat()
        val height = displayMetrics.heightPixels.toFloat()

        val path = Path().apply {
            moveTo(width / 2, height * 0.25f)
            lineTo(width / 2, height * 0.75f)
        }

        val gesture = GestureDescription.Builder()
            .addStroke(GestureDescription.StrokeDescription(path, 0, 300))
            .build()

        return dispatchGesture(gesture, null, null)
    }
}
