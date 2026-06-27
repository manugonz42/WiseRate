package com.wiserate

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import com.wiserate.design.theme.WiseRateTheme
import com.wiserate.navigation.WiseRateApp
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            WiseRateTheme {
                Surface(modifier = Modifier.fillMaxSize()) {
                    // intent?.data carries wiserate:// deep links — wired in WiseRateApp.
                    WiseRateApp(deepLinkUri = intent?.data?.toString())
                }
            }
        }
    }
}
