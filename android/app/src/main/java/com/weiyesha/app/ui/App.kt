package com.weiyesha.app.ui

import android.util.Log
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import com.weiyesha.app.Prefs
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

private suspend fun call(baseUrl: String, token: String, method: String, path: String, body: String? = null): String =
    withContext(Dispatchers.IO) {
        val conn = (URL(baseUrl.trimEnd('/') + path).openConnection() as HttpURLConnection).apply {
            requestMethod = method
            setRequestProperty("X-Token", token)
            connectTimeout = 5000
            readTimeout = 5000
            if (body != null) {
                doOutput = true
                setRequestProperty("Content-Type", "application/json")
                outputStream.write(body.toByteArray())
            }
        }
        try {
            val stream = if (conn.responseCode in 200..299) conn.inputStream else conn.errorStream
            stream?.bufferedReader()?.readText() ?: "HTTP ${conn.responseCode}"
        } finally {
            conn.disconnect()
        }
    }

@Composable
fun WeiyeshaApp() {
    val ctx = LocalContext.current
    val prefs = remember { Prefs(ctx) }
    val scope = rememberCoroutineScope()
    var baseUrl by remember { mutableStateOf(prefs.baseUrl) }
    var token by remember { mutableStateOf(prefs.token) }
    var armed by remember { mutableStateOf(false) }
    var daemonState by remember { mutableStateOf("unknown") }
    var message by remember { mutableStateOf("") }
    var busy by remember { mutableStateOf(false) }

    LaunchedEffect(Unit) {
        while (true) {
            try {
                val text = call(baseUrl, token, "GET", "/status")
                val obj = JSONObject(text)
                armed = obj.optBoolean("armed", false)
                daemonState = obj.optString("daemon_state", "unknown")
                if (armed) call(baseUrl, token, "POST", "/heartbeat", "{}")
            } catch (e: Exception) {
                message = "连接失败：${e.message}"
            }
            delay(2000)
        }
    }

    Column(
        Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(20.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Text("维叶莎", style = MaterialTheme.typography.headlineMedium)
        Text("电脑控制开关", style = MaterialTheme.typography.bodyMedium)

        OutlinedTextField(baseUrl, { baseUrl = it; prefs.baseUrl = it }, label = { Text("电脑地址") }, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(token, { token = it; prefs.token = it }, label = { Text("Token") }, modifier = Modifier.fillMaxWidth())

        Row(verticalAlignment = androidx.compose.ui.Alignment.CenterVertically) {
            Switch(checked = armed, enabled = !busy, onCheckedChange = { on ->
                busy = true
                armed = on
                scope.launch {
                    try {
                        call(baseUrl, token, "POST", "/arm", "{\"armed\":$on}")
                        message = if (on) "已允许录音" else "已关闭"
                    } catch (e: Exception) {
                        message = "操作失败：${e.message}"
                    } finally { busy = false }
                }
            })
            Spacer(Modifier.width(12.dp))
            Text(if (armed) "允许录音" else "已关闭")
        }

        Button(
            onClick = {
                busy = true
                scope.launch {
                    try {
                        call(baseUrl, token, "POST", "/trigger")
                        message = "开始录音"
                    } catch (e: Exception) {
                        message = "录音失败：${e.message}"
                    } finally { busy = false }
                }
            },
            enabled = armed && !busy,
            modifier = Modifier.fillMaxWidth(),
        ) { Text("录音") }

        Text("状态：$daemonState", style = MaterialTheme.typography.bodyLarge)
        if (message.isNotBlank()) Text(message, style = MaterialTheme.typography.bodySmall)
    }
}
