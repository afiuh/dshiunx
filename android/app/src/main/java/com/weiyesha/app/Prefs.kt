package com.weiyesha.app

import android.content.Context

class Prefs(context: Context) {
    private val sp = context.getSharedPreferences("weiyesha", Context.MODE_PRIVATE)
    var baseUrl: String
        get() = sp.getString("baseUrl", "http://192.168.1.6:8387") ?: ""
        set(v) = sp.edit().putString("baseUrl", v).apply()
    var token: String
        get() = sp.getString("token", "") ?: ""
        set(v) = sp.edit().putString("token", v).apply()
}
