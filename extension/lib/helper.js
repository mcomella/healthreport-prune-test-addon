// -*- Mode: js2; tab-width: 2; indent-tabs-mode: nil; js2-basic-offset: 2; js2-skip-preprocessor-directives: t; -*-

"use strict";

const Cu = require("chrome").Cu;
const data = require("self").data;

let theJNI = null;

// Tell the JNI module about the signatures of the Java methods
// we want to use.
exports.loadJNI = function() {
  console.log("loadJNI: theJNI = " + theJNI);
  if (theJNI) {
    console.warn("loadJNI: theJNI is already set; not loading again.");
    return;
  }
  theJNI = Cu.import(data.url("jni.jsm")).JNI;
  let jenv = theJNI.GetForThread();

  let Object = theJNI.LoadClass(jenv, "java.lang.Object", {
    methods: [
      { name: "toString", sig: "()Ljava/lang/String;" }
    ],
  });

  let Iterator = theJNI.LoadClass(jenv, "java.util.Iterator", {
    methods: [
      { name: "hasNext", sig: "()Z" },
      { name: "next", sig: "()Ljava/lang/Object;" },
    ],
  });

  let Set = theJNI.LoadClass(jenv, "java.util.Set", {
    methods: [
      { name: "iterator", sig: "()Ljava/util/Iterator;" },
    ],
  });

  let Map = theJNI.LoadClass(jenv, "java.util.Map", {
    methods: [
      { name: "keySet", sig: "()Ljava/util/Set;" },
      { name: "get", sig: "(Ljava/lang/Object;)Ljava/lang/Object;" },
    ],
  });

  let GeckoAppShell = theJNI.LoadClass(jenv, "org.mozilla.gecko.GeckoAppShell", {
    static_methods: [
      { name: "getContext", sig: "()Landroid/content/Context;" },
    ],
  });

  let GeckoPreferences = theJNI.LoadClass(jenv, "org.mozilla.gecko.GeckoPreferences", {
    static_methods: [
      { name: "broadcastHealthReportUploadPref", sig: "(Landroid/content/Context;)V" },
      { name: "broadcastAnnouncementsPref", sig: "(Landroid/content/Context;)V" },
    ],
  });

  let SharedPreferences = theJNI.LoadClass(jenv, "android.content.SharedPreferences", {
    methods: [
      { name: "edit", sig: "()Landroid/content/SharedPreferences$Editor;" },
      { name: "getLong", sig: "(Ljava/lang/String;J)J" },
      { name: "getString", sig: "(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;" },
      { name: "getBoolean", sig: "(Ljava/lang/String;Z)Z" },
      { name: "getAll", sig: "()Ljava/util/Map;" },
    ],
  });

  let SharedPreferencesEditor = theJNI.LoadClass(jenv, "android.content.SharedPreferences$Editor", {
    methods: [
      { name: "clear", sig: "()Landroid/content/SharedPreferences$Editor;" },
      { name: "commit", sig: "()Z" },
      { name: "putLong", sig: "(Ljava/lang/String;J)Landroid/content/SharedPreferences$Editor;" },
      { name: "putString", sig: "(Ljava/lang/String;Ljava/lang/String;)Landroid/content/SharedPreferences$Editor;" },
      { name: "putBoolean", sig: "(Ljava/lang/String;Z)Landroid/content/SharedPreferences$Editor;" },
    ],
  });

  let HealthReportConstants = theJNI.LoadClass(jenv, "org.mozilla.gecko.background.healthreport.HealthReportConstants", {
    static_fields: [
      { name: "UPLOAD_FEATURE_DISABLED", sig: "Z" },
    ],
  });

  let AnnouncementsConstants = theJNI.LoadClass(jenv, "org.mozilla.gecko.background.announcements.AnnouncementsConstants", {
    static_fields: [
      { name: "DEFAULT_BACKOFF_MSEC", sig: "J" },
      { name: "DISABLED", sig: "Z" },
      { name: "MINIMUM_FETCH_INTERVAL_MSEC", sig: "J" },
    ],
  });

  let Logger = theJNI.LoadClass(jenv, "org.mozilla.gecko.background.common.log.Logger", {
    static_fields: [
      { name: "LOG_PERSONAL_INFORMATION", sig: "Z" },
    ],
  });

  let Context = theJNI.LoadClass(jenv, "android.content.Context", {
    methods: [
      { name: "getSharedPreferences", sig: "(Ljava/lang/String;I)Landroid/content/SharedPreferences;" },
      { name: "getSystemService", sig: "(Ljava/lang/String;)Ljava/lang/Object;" }
    ],
  });

  let PreferenceManager = theJNI.LoadClass(jenv, "android.preference.PreferenceManager", {
    static_methods: [
      { name: "getDefaultSharedPreferences", sig: "(Landroid/content/Context;)Landroid/content/SharedPreferences;" },
    ],
  });
};

exports.unloadJNI = function() {
  console.log("unloadJNI: theJNI = " + theJNI);  
  if (!theJNI) {
    console.warn("unloadJNI: theJNI is not set; not unloading.");
    return;
  }
  let jenv = theJNI.GetForThread();
  theJNI.UnloadClasses(jenv);
  theJNI = null;
  Cu.unload(data.url("jni.jsm"));
};

exports.setupJNI = function() {
  let jenv = theJNI.GetForThread();
  jenv.contents.contents.PushLocalFrame(jenv, 100);
  return [jenv, theJNI];
};

exports.teardownJNI = function(jenv) {
  jenv.contents.contents.PopLocalFrame(jenv, null);
};
