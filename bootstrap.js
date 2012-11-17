/**
 * Test values.
 * Change these to whatever you want, then build and deploy the XPI.
 */
const ANNO_URL = "http://twinql.com/tmp/announce/";
const ANNO_INTERVAL = 15000;


/**
 * Actual code follows.
 */

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

  let GeckoApp = JNI.LoadClass(jenv, "org.mozilla.gecko.GeckoApp", {
    static_fields: [
      { name: "mAppContext", sig: "Lorg/mozilla/gecko/GeckoApp;" }
    ],
  });

  let GeckoPreferences = JNI.LoadClass(jenv, "org.mozilla.gecko.GeckoPreferences", {
    static_methods: [
      { name: "broadcastAnnouncementsPref", sig: "(Landroid/content/Context;)V" },
    ],
  });

  let SharedPreferences = JNI.LoadClass(jenv, "android.content.SharedPreferences", {
    methods: [
      { name: "edit", sig: "()Landroid/content/SharedPreferences$Editor;" },
      { name: "getLong", sig: "(Ljava/lang/String;J)J" },
      { name: "getString", sig: "(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;" },
    ],
  });

  let SharedPreferencesEditor = JNI.LoadClass(jenv, "android.content.SharedPreferences$Editor", {
    methods: [
      { name: "commit", sig: "()Z" },
      { name: "putString", sig: "(Ljava/lang/String;Ljava/lang/String;)Landroid/content/SharedPreferences$Editor;" },
      { name: "putLong", sig: "(Ljava/lang/String;J)Landroid/content/SharedPreferences$Editor;" },
    ],
  });

  try {
    let AnnouncementsConstants = JNI.LoadClass(jenv, "org.mozilla.gecko.background.announcements.AnnouncementsConstants", {
      static_fields: [
        { name: "MINIMUM_FETCH_INTERVAL_MSEC", sig: "J" },
        { name: "DEFAULT_BACKOFF_MSEC", sig: "J" },
      ],
    });
  } catch (ex) {
  }

  let Context = JNI.LoadClass(jenv, "android.content.Context", {
    methods: [
      { name: "getSharedPreferences",
        sig: "(Ljava/lang/String;I)Landroid/content/SharedPreferences;" },
      { name: "getSystemService",
        sig: "(Ljava/lang/String;)Ljava/lang/Object;" }
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
  
function _broadcastAnnouncementsPref(context) {
  let GeckoPreferences = JNI.classes.org.mozilla.gecko.GeckoPreferences;
  GeckoPreferences.broadcastAnnouncementsPref(context);
  android_log(3, "GeckoSetPrefs", "Announcement broadcast.");
}

function setAnnouncementsPrefs(url, interval) {
  let jenv = setupJNI();

  android_log(3, "GeckoSetPrefs", "Set prefs to " + url + ", " + interval);
  let Context = JNI.classes.android.content.Context;
  let GeckoApp = JNI.classes.org.mozilla.gecko.GeckoApp;
  let context = GeckoApp.mAppContext;

  let editor = context.getSharedPreferences("background", 0).edit();
  editor.putString("announce_server_base_url", url);
  editor.putLong("announce_fetch_interval_msec", interval);
  editor.commit();
  android_log(3, "GeckoSetPrefs", "Committed.");

  // Set the minimum to our interval.
  try {
    let AnnouncementsConstants = JNI.classes.org.mozilla.gecko.background.announcements.AnnouncementsConstants;
    android_log(3, "GeckoSetPrefs", "Setting MINIMUM_FETCH_INTERVAL_MSEC to " + interval);
    AnnouncementsConstants.MINIMUM_FETCH_INTERVAL_MSEC = interval;
    AnnouncementsConstants.DEFAULT_BACKOFF_MSEC = 100;  // So we retry on error.
  } catch (ex) {
    android_log(3, "GeckoSetPrefs", "Error setting AnnouncementsConstants.MINIMUM_FETCH_INTERVAL_MSEC.");
  }

  // Now broadcast so that we refresh.
  _broadcastAnnouncementsPref(context);

  teardownJNI(jenv);
}
 
let menuID = null;

function loadIntoWindow(window) {
  android_log(3, "GeckoSetPrefs", "Loading into window.");
  if (!window || !isNativeUI()) {
    return;
  }

  menuID = window.NativeWindow.menu.add("Set announcements prefs", null,
      function() {
        setAnnouncementsPrefs(ANNO_URL, ANNO_INTERVAL);
      });
  android_log(3, "GeckoSetPrefs", "Done loading.");
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
