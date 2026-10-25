package com.weiyesha.app

import android.content.Context

class Prefs(context: Context) {
    private val sp = context.getSharedPreferences("weiyesha", Context.MODE_PRIVATE)
    // 手机/电脑唯一，内置地址与 token，不做配对/手填
    var baseUrl: String
        get() = sp.getString("baseUrl", "http://192.168.1.2:8387") ?: "http://192.168.1.2:8387"
        set(v) = sp.edit().putString("baseUrl", v).apply()
    var token: String
        get() = sp.getString("token", "wys-local-7f3a9c") ?: "wys-local-7f3a9c"
        set(v) = sp.edit().putString("token", v).apply()
}
