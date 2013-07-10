// -*- Mode: js2; tab-width: 2; indent-tabs-mode: nil; js2-basic-offset: 2; js2-skip-preprocessor-directives: t; -*-

"use strict";

const helper = require('helper.js');

function broadcastPref(JNI, context) {
  let GeckoPreferences = JNI.classes.org.mozilla.gecko.GeckoPreferences;
  GeckoPreferences.broadcastHealthReportUploadPref(context);
}

function setPrefs(url, interval) {
  let jenv;
  let JNI;

  try {
    [jenv, JNI] = helper.setupJNI();

    let GeckoAppShell = JNI.classes.org.mozilla.gecko.GeckoAppShell;
    let context = GeckoAppShell.getContext();
    let prefs = context.getSharedPreferences("background", 0);
    let editor = prefs.edit();
    editor.putLong("healthreport_next_submission", 0);

    if (url) {
      editor.putString("healthreport_document_server_uri", url);
    }

    if (interval) {
      editor.putLong("healthreport_submission_intent_interval_msec", interval);
      editor.putLong("healthreport_time_between_uploads", 4*interval);
      editor.putLong("healthreport_time_between_deletes", 2*interval);
      editor.putLong("healthreport_time_before_first_submission", 2*interval);
      editor.putLong("healthreport_time_after_failure", interval);
    }

    editor.commit();

    // Now broadcast so that we refresh.
    broadcastPref(JNI, context);
  } finally {
    if (jenv) {
      helper.teardownJNI(jenv);
    }
  }
}

exports.connect = function(port) {
  port.on('healthReport-set', function(data) {
    console.log('healthReport-set: ' + JSON.stringify(data));
    setPrefs(data.uri, data.interval);
  });
};
