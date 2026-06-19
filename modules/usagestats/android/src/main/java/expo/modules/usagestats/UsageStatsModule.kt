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
      val defaultLauncherIntent = Intent(Intent.ACTION_MAIN)
      defaultLauncherIntent.addCategory(Intent.CATEGORY_HOME)
      val launcherResolveInfo = pm.resolveActivity(defaultLauncherIntent, PackageManager.MATCH_DEFAULT_ONLY)
      val defaultLauncherPackage = launcherResolveInfo?.activityInfo?.packageName

      val startOfDay = calendar.timeInMillis
      val endTime = System.currentTimeMillis()

      val usageEvents = usageStatsManager.queryEvents(startOfDay, endTime)
      val event = android.app.usage.UsageEvents.Event()
      
      val appUsageMap = mutableMapOf<String, Long>()
      val appResumeTimes = mutableMapOf<String, Long>()
      
      var totalScreenTime = 0L
      var screenOnTime = -1L

      while (usageEvents.hasNextEvent()) {
          usageEvents.getNextEvent(event)
          val packageName = event.packageName
          val timeStamp = event.timeStamp
          val eventType = event.eventType

          if (eventType == android.app.usage.UsageEvents.Event.SCREEN_INTERACTIVE) {
              screenOnTime = timeStamp
          } else if (eventType == android.app.usage.UsageEvents.Event.SCREEN_NON_INTERACTIVE) {
              if (screenOnTime != -1L) {
                  totalScreenTime += (timeStamp - screenOnTime)
                  screenOnTime = -1L
              } else {
                  totalScreenTime += (timeStamp - startOfDay)
              }
          }

          if (eventType == android.app.usage.UsageEvents.Event.ACTIVITY_RESUMED) {
              appResumeTimes[packageName] = timeStamp
          } else if (eventType == android.app.usage.UsageEvents.Event.ACTIVITY_PAUSED || 
                     eventType == android.app.usage.UsageEvents.Event.ACTIVITY_STOPPED) {
              val resumeTime = appResumeTimes.remove(packageName)
              if (resumeTime != null) {
                  val duration = timeStamp - resumeTime
                  if (duration > 0) {
                      appUsageMap[packageName] = appUsageMap.getOrDefault(packageName, 0L) + duration
                  }
              } else {
                  if (!appUsageMap.containsKey(packageName)) {
                      val duration = timeStamp - startOfDay
                      if (duration > 0) {
                          appUsageMap[packageName] = duration
                      }
                  }
              }
          }
      }

      if (screenOnTime != -1L) {
          totalScreenTime += (endTime - screenOnTime)
      }

      for ((packageName, resumeTime) in appResumeTimes) {
          val duration = endTime - resumeTime
          if (duration > 0) {
              appUsageMap[packageName] = appUsageMap.getOrDefault(packageName, 0L) + duration
          }
      }

      val statsList = mutableListOf<Map<String, Any>>()
      var totalAppTime = 0L
      
      for ((packageName, appTime) in appUsageMap) {
          if (appTime <= 0) continue
          
          if (packageName == defaultLauncherPackage) continue
          
          val launchIntent = pm.getLaunchIntentForPackage(packageName)
          if (launchIntent == null) continue
          
          var appName = packageName
          var iconBase64: String? = null
          
          try {
            val appInfo = pm.getApplicationInfo(packageName, 0)
            appName = pm.getApplicationLabel(appInfo).toString()
            val iconDrawable = pm.getApplicationIcon(appInfo)
            iconBase64 = drawableToBase64(iconDrawable)
          } catch (e: PackageManager.NameNotFoundException) {
            // Fallback gracefully
          }
          
          totalAppTime += appTime
          
          val map = mutableMapOf<String, Any>(
            "packageName" to packageName,
            "appName" to appName,
            "totalTimeInForeground" to appTime
          )
          
          if (iconBase64 != null) {
            map["icon"] = iconBase64
          }
          
          statsList.add(map)
      }
      
      return@Function mapOf(
        "totalScreenTime" to maxOf(totalScreenTime, totalAppTime),
        "apps" to statsList
      )
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
