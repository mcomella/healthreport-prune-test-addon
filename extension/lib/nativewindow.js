// -*- Mode: js2; tab-width: 2; indent-tabs-mode: nil; js2-basic-offset: 2; js2-skip-preprocessor-directives: t; -*-

"use strict";

const data = require('self').data;
var menuId = null;
const utils = require('api-utils/window/utils');
const recent = utils.getMostRecentBrowserWindow();
const windows = require('sdk/windows');

/**
 * opts: an options object that includes a name, an image and a callback.
 * note: the image can only be a file or data uri, see bug 802003
 */
function addMenu(opts) {
	let icon = opts.icon || null;
	menuId = recent.NativeWindow.menu.add(opts.label, icon, opts.callback);
  return [recent, menuId];
}

exports.addMenu = addMenu;

// add a listener to the 'close' event
windows.browserWindows.on('close', function(window) {
  if (window != recent) {
    return;
  }
  if (menuId) {
    window.NativeWindow.menu.remove(menuId);
    menuId = null;
  }
});

/**  
 * default context objects for contextmenus.
 * for docs: https://developer.mozilla.org/en-US/docs/Extensions/Mobile/API/NativeWindow/contextmenus/add
 */
exports.defaultContext = {
	matches: function(el) { return true; }
}
exports.textContext = recent.NativeWindow.contextmenus.textContext;
exports.SelectorContext = recent.NativeWindow.contextmenus.SelectorContext;
exports.linkBookmarkableContext = recent.NativeWindow.contextmenus.linkBookmarkableContext;
exports.linkShareableContext = recent.NativeWindow.contextmenus.linkShareableContext;
exports.linkOpenableContext = recent.NativeWindow.contextmenus.linkOpenableContext;
exports.imageSaveableContext = recent.NativeWindow.contextmenus.imageSaveableContext;

/**  
 * opts: an options object that includes a name, a context and a callback.
 */
function addContextMenu(opts) {
	recent.NativeWindow.contextmenus.add(
		opts.name, 
		opts.context,
		opts.callback
	);
};

exports.addContextMenu = addContextMenu;

/**  
 * show an android toast. Not particularly useful except for
 * in-app notifications or debugging messages?
 */
function showToast(opts) {
	let duration = opts.duration || 'short';
	recent.NativeWindow.toast.show(opts.message, duration);
};

exports.showToast = showToast;

