// -*- Mode: js2; tab-width: 2; indent-tabs-mode: nil; js2-basic-offset: 2; js2-skip-preprocessor-directives: t; -*-

"use strict";

const data = require('self').data;
const nw = require("nativewindow.js");
const tabs = require('sdk/tabs');
const utils = require('api-utils/window/utils');
require("sdk/preferences/service").set("extensions.sdk.console.logLevel", "info");
const helper = require('helper.js');

const sharedPrefs = require('sharedPrefs.js');
const productAnnouncements = require('productAnnouncements.js');
const healthReport = require('healthReport.js');

const mainUrl = data.url("lab.html");

function openBackgroundServicesLab() {
  console.log("openBackgroundServicesLab");

  for (let tab of tabs) {
    if (tab && tab.url == mainUrl) {
      console.log("Background Services Lab is already open; reloading.");
      tab.reload();
      return;
    }
  }

  console.log("Background Services Lab is not open; opening.");

  tabs.open({
    url: mainUrl,
    onReady: function (tab) {
      let worker = tab.attach({
        contentScriptFile: [ data.url("lab.js") ],
      });
      sharedPrefs.connect(worker.port);
      productAnnouncements.connect(worker.port);
      healthReport.connect(worker.port);
    },
  });
}

var recent = null;
var menuId = null;

function addMenuItem() {
  if (recent != null) {
    return;
  }
  recent = utils.getMostRecentBrowserWindow();
	menuId = recent.NativeWindow.menu.add("Services Lab",
                                        null,
                                        openBackgroundServicesLab);
}

function removeMenuItem() {
  if (recent == null || menuId == null) {
    return;
  }
  recent.NativeWindow.menu.remove(menuId);
  recent = null;
  menuId = null;
}

exports.main = function (options, callbacks) {
  helper.loadJNI();
  console.log("main");
  addMenuItem();

  openBackgroundServicesLab();
};

exports.onUnload = function (reason) {
  console.log("onUnload");
  removeMenuItem();
  helper.unloadJNI();
};
