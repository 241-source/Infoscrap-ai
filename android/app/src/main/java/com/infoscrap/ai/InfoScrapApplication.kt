package com.infoscrap.ai

import android.app.Application

class InfoScrapApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        instance = this
    }

    companion object {
        lateinit var instance: InfoScrapApplication
            private set
    }
}
