const RSRC = "basicnative-mobile"; // resource prefix
const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;

Cu.import("resource://gre/modules/Services.jsm");

function isNativeUI() {
  return (Services.appinfo.ID == "{aa3c5121-dab2-40e2-81ca-7ea25febc110}");
}

function showToast(aWindow) {
  aWindow.NativeWindow.toast.show("Showing you a toast", "short");
}

function showNotification(aWindow) {
  // This shows an Android notification, using the JNI interface to the
  // Android SDK.
  var jenv = JNI.GetForThread();

  // declare fields & methods in java classes that we're going to use.
  var Object = JNI.LoadClass(jenv, "java.lang.Object", {
    methods: [
      { name: "toString", desc: "()Ljava/lang/String;" }
    ],
  });
  var R = {};
  R.drawable = JNI.LoadClass(jenv, "android.R$drawable", {
    static_fields: [
      { name: "stat_notify_more", desc: "I" },
    ],
  });
  var Context = JNI.LoadClass(jenv, "android.content.Context", {
    static_fields: [
      { name: "NOTIFICATION_SERVICE", desc: "Ljava/lang/String;" }
    ],
    methods: [
      { name: "getSystemService",
        desc: "(Ljava/lang/String;)Ljava/lang/Object;" }
    ],
  });
  var GeckoApp = JNI.LoadClass(jenv, "org.mozilla.gecko.GeckoApp", {
    static_fields: [
      { name: "mAppContext", desc: "Lorg/mozilla/gecko/GeckoApp;" }
    ],
  });
  var NotificationManager=JNI.LoadClass(jenv,"android.app.NotificationManager",{
    methods: [
      { name: "notify", desc: "(ILandroid/app/Notification;)V" },
    ],
  });
  var NotificationBuilder=JNI.LoadClass(jenv,"android.app.Notification$Builder",{
    constructors: [
      { name: "<init>", desc: "(Landroid/content/Context;)V" },
    ],
    methods: [
      { name: "setContentText",
        desc: "(Ljava/lang/CharSequence;)Landroid/app/Notification$Builder;" },
      { name: "setContentTitle",
        desc: "(Ljava/lang/CharSequence;)Landroid/app/Notification$Builder;" },
      { name: "setSmallIcon",
        desc: "(I)Landroid/app/Notification$Builder;" },
      { name: "getNotification", // renamed to build() in API 16 (Jelly Bean)
        desc: "()Landroid/app/Notification;" },
    ],
  });

  // String ns = Context.NOTIFICATION_SERVICE;
  // NotificationManager mNotificationManager =
  //     (NotificationManager) getSystemService(ns);
  var ns = Context.NOTIFICATION_SERVICE;
  var ctxt = GeckoApp.mAppContext; // XXX hacky way to get Context
  var mNotificationManager = NotificationManager.__cast__
    (ctxt.getSystemService(Context.NOTIFICATION_SERVICE));

  // Notification noti = new Notification.Builder(context)
  //     .setContentTitle("Hello, World!")
  //     .setContentText("This is a notification")
  //     .build();
  var noti = NotificationBuilder['new'](ctxt)
    .setContentTitle(JNI.NewString(jenv, "Hello, World!"))
    .setContentText(JNI.NewString(jenv, "This is a notification"))
    .setSmallIcon(JNI.jint(R.drawable.stat_notify_more))
    .getNotification();

  // final int HELLO_ID = 1;
  // mNotificationManager.notify(HELLO_ID, notification);
  var HELLO_ID = 1;
  mNotificationManager.notify(JNI.jint(HELLO_ID), noti);

  // demonstrate how to use toString()
  aWindow.NativeWindow.toast.show(JNI.ReadString(jenv,noti.toString()),"short");
}

function showDoorhanger(aWindow) {
  buttons = [
    {
      label: "Button 1",
      callback: function() {
        aWindow.NativeWindow.toast.show("Button 1 was tapped", "short");
      }
    } , {
      label: "Button 2",
      callback: function() {
        aWindow.NativeWindow.toast.show("Button 2 was tapped", "short");
      }
    }];

  aWindow.NativeWindow.doorhanger.show("Showing a doorhanger with two button choices.", "doorhanger-test", buttons);
}

function copyLink(aWindow, aTarget) {
  let url = aWindow.NativeWindow.contextmenus._getLinkURL(aTarget);
  aWindow.NativeWindow.toast.show("Todo: copy > " + url, "short");
}

var gToastMenuId = null;
var gDoorhangerMenuId = null;
var gContextMenuId = null;

function loadIntoWindow(window) {
  if (!window)
    return;

  if (isNativeUI()) {
    gToastMenuId = window.NativeWindow.menu.add("Show Toast", null, function() { showToast(window); });
    gDoorhangerMenuId = window.NativeWindow.menu.add("Show Doorhanger", null, function() { showDoorhanger(window); });
    gNotificationMenuId = window.NativeWindow.menu.add("Show Notification", null, function() { showNotification(window); });
    gContextMenuId = window.NativeWindow.contextmenus.add("Copy Link", window.NativeWindow.contextmenus.linkOpenableContext, function(aTarget) { copyLink(window, aTarget); });
  }
}

function unloadFromWindow(window) {
  if (!window)
    return;

  if (isNativeUI()) {
    window.NativeWindow.menu.remove(gToastMenuId);
    window.NativeWindow.menu.remove(gDoorhangerMenuId);
    window.NativeWindow.menu.remove(gNotificationMenuId);
    window.NativeWindow.contextmenus.remove(gContextMenuId);
  }
}


/**
 * bootstrap.js API
 */
var windowListener = {
  onOpenWindow: function(aWindow) {
    // Wait for the window to finish loading
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
  // setup resource: alias
  let resource = Services.io.getProtocolHandler("resource")
        .QueryInterface(Ci.nsIResProtocolHandler);
  let alias = Services.io.newFileURI(aData.installPath);
  if (!aData.installPath.isDirectory())
    alias = Services.io.newURI("jar:" + alias.spec + "!/", null, null);
  resource.setSubstitution(RSRC, alias);

  // Load JNI module
  Cu.import("resource://"+RSRC+"/jni.jsm");

  // Load into any existing windows
  let windows = Services.wm.getEnumerator("navigator:browser");
  while (windows.hasMoreElements()) {
    let domWindow = windows.getNext().QueryInterface(Ci.nsIDOMWindow);
    loadIntoWindow(domWindow);
  }

  // Load into any new windows
  Services.wm.addListener(windowListener);
}

function shutdown(aData, aReason) {
  // When the application is shutting down we normally don't have to clean
  // up any UI changes made
  if (aReason == APP_SHUTDOWN)
    return;

  // Unload JNI module
  Cu.unload("resource://"+RSRC+"/jni.jsm");

  // teardown resource: alias
  let resource = Services.io.getProtocolHandler("resource")
        .QueryInterface(Ci.nsIResProtocolHandler);
  resource.setSubstitution(RSRC, null);

  // Stop listening for new windows
  Services.wm.removeListener(windowListener);

  // Unload from any existing windows
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
