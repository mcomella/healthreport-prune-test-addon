// -*- Mode: js2; tab-width: 2; indent-tabs-mode: nil; js2-basic-offset: 2; js2-skip-preprocessor-directives: t; -*-

"use strict";

const helper = require('helper.js');

function broadcastAnnouncementsPref(JNI, context) {
  let GeckoPreferences = JNI.classes.org.mozilla.gecko.GeckoPreferences;
  GeckoPreferences.broadcastAnnouncementsPref(context);
  console.log("GeckoSetPrefs: Announcement broadcast.");
}

function increaseIdle() {
  let [jenv, JNI] = helper.setupJNI();

  console.log("GeckoSetPrefs: Pushing last launch back.");
  let GeckoAppShell = JNI.classes.org.mozilla.gecko.GeckoAppShell;
  let context = GeckoAppShell.getContext();
  let sharedPrefs = context.getSharedPreferences("background", 0);
  let lastLaunch = sharedPrefs.getLong("last_firefox_launch", Date.now());
  let older = lastLaunch - (24 * 60 * 60 * 1000);
  console.log("GeckoSetPrefs: Setting last launch to " + older);
  let editor = sharedPrefs.edit();
  editor.putLong("last_firefox_launch", older);
  editor.commit();
  console.log("GeckoSetPrefs: Committed.");

  helper.teardownJNI(jenv);
}

function setPrefs(url, interval) {
  let [jenv, JNI] = helper.setupJNI();

  console.log("GeckoSetPrefs: Set prefs to " + url + ", " + interval);
  let GeckoAppShell = JNI.classes.org.mozilla.gecko.GeckoAppShell;
  let context = GeckoAppShell.getContext();

  let editor = context.getSharedPreferences("background", 0).edit();
  if (url) {
    editor.putString("announce_server_base_url", url);
  }
  if (interval) {
    editor.putLong("announce_fetch_interval_msec", interval);
  }
  editor.putLong("earliest_next_announce_fetch", 0);
  editor.commit();
  console.log("GeckoSetPrefs: Committed.");

  // Set the minimum to our interval.
  try {
    let AnnouncementsConstants = JNI.classes.org.mozilla.gecko.background.announcements.AnnouncementsConstants;
    console.log("GeckoSetPrefs: Setting MINIMUM_FETCH_INTERVAL_MSEC to " + interval);
    AnnouncementsConstants.DEFAULT_BACKOFF_MSEC = 100;  // So we retry on error.
    AnnouncementsConstants.DISABLED = false;
    if (interval) {
      AnnouncementsConstants.MINIMUM_FETCH_INTERVAL_MSEC = interval;
    }
  } catch (ex) {
    console.log("GeckoSetPrefs: Error setting AnnouncementsConstants.MINIMUM_FETCH_INTERVAL_MSEC.");
  }

  // Now broadcast so that we refresh.
  broadcastAnnouncementsPref(JNI, context);

  helper.teardownJNI(jenv);
}

exports.connect = function(port) {
  port.on('productAnnouncements-increase-idle', function() {
    console.log('productAnnouncements-increase-idle');
    increaseIdle();
  });
  port.on('productAnnouncements-set', function(data) {
    console.log('productAnnouncements-set: ' + JSON.stringify(data));
    setPrefs(data.uri, data.interval);
  });
};
