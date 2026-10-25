package com.weiyesha.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import com.weiyesha.app.ui.WeiyeshaApp
import com.weiyesha.app.ui.WeiyeshaTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        installSplashScreen()
        super.onCreate(savedInstanceState)
        setContent { WeiyeshaTheme { WeiyeshaApp() } }
    }
}
