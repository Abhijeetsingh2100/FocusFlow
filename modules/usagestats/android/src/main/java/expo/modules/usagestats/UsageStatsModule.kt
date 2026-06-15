package expo.modules.usagestats

import android.app.usage.UsageStats
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.drawable.BitmapDrawable
import android.graphics.drawable.Drawable
import android.provider.Settings
import android.util.Base64
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.io.ByteArrayOutputStream
import java.util.Calendar

class UsageStatsModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("UsageStats")

    Function("checkForPermission") {
      val context = appContext.reactContext ?: return@Function false
      val appOps = context.getSystemService(Context.APP_OPS_SERVICE) as android.app.AppOpsManager
      val mode = appOps.checkOpNoThrow(
        android.app.AppOpsManager.OPSTR_GET_USAGE_STATS,
        android.os.Process.myUid(),
        context.packageName
      )
      return@Function mode == android.app.AppOpsManager.MODE_ALLOWED
    }

    Function("showUsageAccessSettings") {
      val context = appContext.reactContext
      if (context != null) {
        val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS)
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        context.startActivity(intent)
      }
    }

    Function("getDailyUsage") {
      val context = appContext.reactContext ?: return@Function emptyList<Map<String, Any>>()
      
      val usageStatsManager = context.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
      val pm = context.packageManager
      
      val calendar = Calendar.getInstance()
      calendar.set(Calendar.HOUR_OF_DAY, 0)
      calendar.set(Calendar.MINUTE, 0)
      calendar.set(Calendar.SECOND, 0)
      calendar.set(Calendar.MILLISECOND, 0)
      val startTime = calendar.timeInMillis
      val endTime = System.currentTimeMillis()
      
      val usageStats = usageStatsManager.queryUsageStats(UsageStatsManager.INTERVAL_DAILY, startTime, endTime)
      
      val statsList = mutableListOf<Map<String, Any>>()
      
      for (stats in usageStats) {
        if (stats.totalTimeInForeground > 0) {
          try {
            val appInfo = pm.getApplicationInfo(stats.packageName, 0)
            val appName = pm.getApplicationLabel(appInfo).toString()
            
            // Generate icon
            val iconDrawable = pm.getApplicationIcon(appInfo)
            val iconBase64 = drawableToBase64(iconDrawable)
            
            val map = mapOf(
              "packageName" to stats.packageName,
              "appName" to appName,
              "totalTimeInForeground" to stats.totalTimeInForeground,
              "icon" to iconBase64
            )
            statsList.add(map)
          } catch (e: PackageManager.NameNotFoundException) {
            // Ignore apps not found
          }
        }
      }
      
      return@Function statsList
    }
  }
  
  private fun drawableToBase64(drawable: Drawable): String {
    val bitmap: Bitmap = if (drawable is BitmapDrawable) {
      drawable.bitmap
    } else {
      val bmp = Bitmap.createBitmap(
        drawable.intrinsicWidth.takeIf { it > 0 } ?: 1,
        drawable.intrinsicHeight.takeIf { it > 0 } ?: 1,
        Bitmap.Config.ARGB_8888
      )
      val canvas = Canvas(bmp)
      drawable.setBounds(0, 0, canvas.width, canvas.height)
      drawable.draw(canvas)
      bmp
    }
    
    // Scale down to avoid huge base64 strings
    val scaledBitmap = Bitmap.createScaledBitmap(bitmap, 64, 64, true)
    
    val outputStream = ByteArrayOutputStream()
    scaledBitmap.compress(Bitmap.CompressFormat.PNG, 100, outputStream)
    val byteArray = outputStream.toByteArray()
    return "data:image/png;base64," + Base64.encodeToString(byteArray, Base64.NO_WRAP)
  }
}
