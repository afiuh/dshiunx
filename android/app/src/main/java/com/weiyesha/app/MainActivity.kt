package com.weiyesha.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import com.weiyesha.app.ui.WeiyeshaApp
import com.weiyesha.app.ui.WeiyeshaTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent { WeiyeshaTheme { WeiyeshaApp() } }
    }
}
