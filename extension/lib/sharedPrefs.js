// -*- Mode: js2; tab-width: 2; indent-tabs-mode: nil; js2-basic-offset: 2; js2-skip-preprocessor-directives: t; -*-

"use strict";

const helper = require('helper.js');

function toJSMap(JNI, jenv, javaMap) {
  let map = {};
  let keySet = javaMap.keySet();
  let iterator = keySet.iterator();
  while (iterator.hasNext()) {
    let key = iterator.next();
    let val = javaMap.get(key);
    let keyStr = JNI.ReadString(jenv, key.toString());
    let valStr = JNI.ReadString(jenv, val.toString());
    map[keyStr] = valStr;
  }
  return map;
};

function get(section) {
  let jenv, JNI;
  try {
    [jenv, JNI] = helper.setupJNI();

    let Context = JNI.classes.android.content.Context;
    let GeckoAppShell = JNI.classes.org.mozilla.gecko.GeckoAppShell;
    let context = GeckoAppShell.getContext();
    let prefs = null;
    if (section) {
      prefs = context.getSharedPreferences(section, 0);
    } else {
      let PreferenceManager = JNI.classes.android.preference.PreferenceManager;
      prefs = PreferenceManager.getDefaultSharedPreferences(context);
    }
    let all = prefs.getAll();

    return toJSMap(JNI, jenv, all);
  } finally {
    if (jenv) {
      helper.teardownJNI(jenv);
    }
  }
};

function eraseAll(section) {
  let jenv, JNI;
  try {
    [jenv, JNI] = helper.setupJNI();

    let Context = JNI.classes.android.content.Context;
    let GeckoAppShell = JNI.classes.org.mozilla.gecko.GeckoAppShell;
    let context = GeckoAppShell.getContext();
    let prefs = null;
    if (section) {
      prefs = context.getSharedPreferences(section, 0);
    } else {
      let PreferenceManager = JNI.classes.android.preference.PreferenceManager;
      prefs = PreferenceManager.getDefaultSharedPreferences(context);
    }
    let editor = prefs.edit();
    editor.clear();
    editor.commit();
  } finally {
    if (jenv) {
      helper.teardownJNI(jenv);
    }
  }
};

exports.connect = function(port) {
  port.on('settings-request', function(section) {
    console.log('settings-request received: ' + section);
    port.emit('settings-response', { section: section,
                                     prefs: get(section) });
  });
  port.on('settings-erase-all', function(section) {
    console.log('settings-erase-all received: ' + section);
    eraseAll(section);
  });
};
