 // Change this to whatever you want, then build and deploy the XPI.
const HRP_INTERVAL = 60*1000; // Millis.

let LOG_TAG = "GeckoSetPrefs";

const RSRC = "basicnative-mobile"; // resource prefix
const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;

Cu.import("resource://gre/modules/Services.jsm");

function isNativeUI() {
  return (Services.appinfo.ID == "{aa3c5121-dab2-40e2-81ca-7ea25febc110}");
}

// Tell the JNI module about the signatures of the Java methods
// we want to use.
function loadJNI() {
  let jenv = JNI.GetForThread();

  let Object = JNI.LoadClass(jenv, "java.lang.Object", {
    methods: [
      { name: "toString", sig: "()Ljava/lang/String;" }
    ],
  });

  let GeckoAppShell = JNI.LoadClass(jenv, "org.mozilla.gecko.GeckoAppShell", {
    static_methods: [
      { name: "getContext", sig: "()Landroid/content/Context;" }
    ],
  });

  let GeckoPreferences = JNI.LoadClass(jenv, "org.mozilla.gecko.GeckoPreferences", {
    static_methods: [
      { name: "broadcastHealthReportUploadPref", sig: "(Landroid/content/Context;)V" },
    ],
  });

  let SharedPreferences = JNI.LoadClass(jenv, "android.content.SharedPreferences", {
    methods: [
      { name: "edit", sig: "()Landroid/content/SharedPreferences$Editor;" },
      { name: "getLong", sig: "(Ljava/lang/String;J)J" },
      { name: "getString", sig: "(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;" },
      { name: "getBoolean", sig: "(Ljava/lang/String;Z)Z" },
    ],
  });

  let SharedPreferencesEditor = JNI.LoadClass(jenv, "android.content.SharedPreferences$Editor", {
    methods: [
      { name: "commit", sig: "()Z" },
      { name: "putLong", sig: "(Ljava/lang/String;J)Landroid/content/SharedPreferences$Editor;" },
      { name: "putString", sig: "(Ljava/lang/String;Ljava/lang/String;)Landroid/content/SharedPreferences$Editor;" },
      { name: "putBoolean", sig: "(Ljava/lang/String;Z)Landroid/content/SharedPreferences$Editor;" },
    ],
  });

  let HealthReportConstants = JNI.LoadClass(jenv, "org.mozilla.gecko.background.healthreport.HealthReportConstants", {
    static_fields: [
      { name: "UPLOAD_FEATURE_DISABLED", sig: "Z" },
    ],
  });

  let Logger = JNI.LoadClass(jenv, "org.mozilla.gecko.background.common.log.Logger", {
    static_fields: [
      { name: "LOG_PERSONAL_INFORMATION", sig: "Z" },
    ],
  });

  let Context = JNI.LoadClass(jenv, "android.content.Context", {
    methods: [
      { name: "getSharedPreferences",
        sig: "(Ljava/lang/String;I)Landroid/content/SharedPreferences;" },
      { name: "getSystemService",
        sig: "(Ljava/lang/String;)Ljava/lang/Object;" }
    ],
  });

  let PreferenceManager = JNI.LoadClass(jenv, "android.preference.PreferenceManager", {
    static_methods: [
      { name: "getDefaultSharedPreferences",
        sig: "(Landroid/content/Context;)Landroid/content/SharedPreferences;" },
    ],
  });
}

function unloadJNI() {
  let jenv = JNI.GetForThread();
  JNI.UnloadClasses(jenv);
}

function setupJNI() {
  let jenv = JNI.GetForThread();
  jenv.contents.contents.PushLocalFrame(jenv, 100);
  return jenv;
}

function teardownJNI(jenv) {
  // Clean up memory allocated by JNI.
  jenv.contents.contents.PopLocalFrame(jenv, null);
}
  
function _broadcastPref(context) {
  let GeckoPreferences = JNI.classes.org.mozilla.gecko.GeckoPreferences;
  GeckoPreferences.broadcastHealthReportUploadPref(context);
  android_log(3, LOG_TAG, "Broadcast pref.");
}

function setPrefs(url, interval) {
  let jenv = setupJNI();

  android_log(3, LOG_TAG, "Set prefs to " + url + ", " + interval);
  let Context = JNI.classes.android.content.Context;
  let GeckoAppShell = JNI.classes.org.mozilla.gecko.GeckoAppShell;
  let context = GeckoAppShell.getContext();

  let HealthReportConstants = JNI.classes.org.mozilla.gecko.background.healthreport.HealthReportConstants;
  let prefs = context.getSharedPreferences("background", 0);
  let editor = prefs.edit();
  editor.putString("healthreport_document_server_uri", url);
  editor.putLong("healthreport_submission_intent_interval_msec", interval);
  editor.putLong("healthreport_next_submission", 0);
  editor.putLong("healthreport_time_between_uploads", 4*interval);
  editor.putLong("healthreport_time_between_deletes", 2*interval);
  editor.putLong("healthreport_time_before_first_submission", 2*interval);
  editor.putLong("healthreport_time_after_failure", interval);
  editor.commit();

  let PreferenceManager = JNI.classes.android.preference.PreferenceManager;
  let globalPrefs = PreferenceManager.getDefaultSharedPreferences(context);
  let globalEditor = globalPrefs.edit();
  globalEditor.putBoolean("android.not_a_preference.healthreport.uploadEnabled",
                    !globalPrefs.getBoolean("android.not_a_preference.healthreport.uploadEnabled", false));
  globalEditor.commit();

  android_log(3, LOG_TAG, "Committed.");

  // Now broadcast so that we refresh.
  _broadcastPref(context);

  teardownJNI(jenv);
}
 
let menuID = null;

function loadIntoWindow(window) {
  android_log(3, LOG_TAG, "Loading into window.");
  if (!window || !isNativeUI()) {
    return;
  }

  // Always enable.
  let HealthReportConstants = JNI.classes.org.mozilla.gecko.background.healthreport.HealthReportConstants;
  HealthReportConstants.UPLOAD_FEATURE_DISABLED = false;
  menuID = window.NativeWindow.menu.add("Toggle FHR upload", null,
      function() {
        setPrefs(HRU_URL, HRU_INTERVAL);
      });
  android_log(3, LOG_TAG, "Done loading.");
}

function unloadFromWindow(window) {
  if (!window || !isNativeUI()) {
    return;
  }

  window.NativeWindow.menu.remove(menuID);
}


/**
 * bootstrap.js API
 */
var windowListener = {
  onOpenWindow: function(aWindow) {
    // Wait for the window to finish loading.
    let domWindow = aWindow.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowInternal || Ci.nsIDOMWindow);
    domWindow.addEventListener("load", function() {
      domWindow.removeEventListener("load", arguments.callee, false);
      loadIntoWindow(domWindow);
    }, false);
  },
  
  onCloseWindow: function(aWindow) {
  },
  
  onWindowTitleChange: function(aWindow, aTitle) {
  }
};

function startup(aData, aReason) {
  let resource = Services.io.getProtocolHandler("resource").QueryInterface(Ci.nsIResProtocolHandler);
  let alias = Services.io.newFileURI(aData.installPath);
  if (!aData.installPath.isDirectory()) {
    alias = Services.io.newURI("jar:" + alias.spec + "!/", null, null);
  }
  resource.setSubstitution(RSRC, alias);

  Cu.import("resource://" + RSRC + "/jni.jsm");
  loadJNI();

  // Load into any existing windows.
  let windows = Services.wm.getEnumerator("navigator:browser");
  while (windows.hasMoreElements()) {
    let domWindow = windows.getNext().QueryInterface(Ci.nsIDOMWindow);
    loadIntoWindow(domWindow);
  }

  // Load into any new windows.
  Services.wm.addListener(windowListener);
}

function shutdown(aData, aReason) {
  // When the application is shutting down we normally don't have to clean
  // up any UI changes made.
  if (aReason == APP_SHUTDOWN) {
    return;
  }

  // Unload JNI module.
  unloadJNI();
  Cu.unload("resource://" + RSRC + "/jni.jsm");

  // Teardown resource: alias.
  let resource = Services.io.getProtocolHandler("resource").QueryInterface(Ci.nsIResProtocolHandler);
  resource.setSubstitution(RSRC, null);

  // Stop listening for new windows.
  Services.wm.removeListener(windowListener);

  // Unload from any existing windows.
  let windows = Services.wm.getEnumerator("navigator:browser");
  while (windows.hasMoreElements()) {
    let domWindow = windows.getNext().QueryInterface(Ci.nsIDOMWindow);
    unloadFromWindow(domWindow);
  }
}

function install(aData, aReason) {
}

function uninstall(aData, aReason) {
}
