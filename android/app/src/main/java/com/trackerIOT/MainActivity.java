package com.trackerIOT;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.ContentResolver;
import android.media.AudioAttributes;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle; // here
import androidx.core.app.NotificationCompat;
import com.facebook.react.ReactActivity;
import org.devio.rn.splashscreen.SplashScreen;

public class MainActivity extends ReactActivity {

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    SplashScreen.show(this);
    super.onCreate(null);

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      NotificationChannel notificationChannel = new NotificationChannel(
        "ignition_on",
        "ignition_on",
        NotificationManager.IMPORTANCE_HIGH
      );
      notificationChannel.setShowBadge(true);
      notificationChannel.setDescription("");
      AudioAttributes att = new AudioAttributes.Builder()
        .setUsage(AudioAttributes.USAGE_NOTIFICATION)
        .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
        .build();
      notificationChannel.setSound(
        Uri.parse(
          ContentResolver.SCHEME_ANDROID_RESOURCE +
          "://" +
          getPackageName() +
          "/raw/ignitionon"
        ),
        att
      );
      notificationChannel.enableLights(true);
      notificationChannel.enableVibration(true);
      notificationChannel.setVibrationPattern(new long[] { 400, 400 });
      notificationChannel.setLockscreenVisibility(
        NotificationCompat.VISIBILITY_PUBLIC
      );
      NotificationManager manager = getSystemService(NotificationManager.class);
      manager.createNotificationChannel(notificationChannel);

      NotificationChannel notificationChannel2 = new NotificationChannel(
        "ignition_off",
        "ignition_off",
        NotificationManager.IMPORTANCE_HIGH
      );
      notificationChannel2.setShowBadge(true);
      notificationChannel2.setDescription("");
      AudioAttributes att2 = new AudioAttributes.Builder()
        .setUsage(AudioAttributes.USAGE_NOTIFICATION)
        .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
        .build();
      notificationChannel2.setSound(
        Uri.parse(
          ContentResolver.SCHEME_ANDROID_RESOURCE +
          "://" +
          getPackageName() +
          "/raw/ignitionoff"
        ),
        att2
      );
      notificationChannel2.enableLights(true);
      notificationChannel2.enableVibration(true);
      notificationChannel2.setVibrationPattern(new long[] { 400, 400 });
      notificationChannel2.setLockscreenVisibility(
        NotificationCompat.VISIBILITY_PUBLIC
      );
      manager.createNotificationChannel(notificationChannel2);
      //            Toast.makeText(this, "Notification Set up", Toast.LENGTH_LONG).show();
    }
  }

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "Tracker";
  }
}
