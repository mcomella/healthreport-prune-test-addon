// -*- Mode: js2; tab-width: 2; indent-tabs-mode: nil; js2-basic-offset: 2; js2-skip-preprocessor-directives: t; -*-

console.log("lab.js");

self.port.on("settings-response", function(data) {
  let section = data.section ? data.section : "global";
  let keys = Object.keys(data.prefs).splice(0);
  keys.sort();
  let container = document
        .getElementById("settings-" + section)
        .querySelector("tbody");

  while (container.hasChildNodes()) {
    container.removeChild(container.lastChild);
  }

  for (let key of keys) {
    let val = data.prefs[key];
    try {
      val = JSON.stringify(JSON.parse(val), null, 4);
    } catch (e) {
    }

    let elkey = document.createElement("td");
    elkey.appendChild(document.createTextNode(key));
    elkey.classList.add("key");
    let elkeyrow = document.createElement("tr");
    elkeyrow.appendChild(elkey);
    container.appendChild(elkeyrow);

    let elval = document.createElement("td");
    elval.appendChild(document.createTextNode(val));
    elval.classList.add("val");
    let elvalpre = document.createElement("pre");
    elvalpre.appendChild(elval);
    let elvalrow = document.createElement("tr");
    elvalrow.appendChild(elvalpre);
    container.appendChild(elvalrow);
  }

  if (section != "global") {
    return;
  }
  document.getElementById("productAnnouncementsDisabled").style.display =
    (data.prefs["android.not_a_preference.privacy.announcements.enabled"] == "true")
    ? "none" : "inline";
  document.getElementById("healthReportDisabled").style.display =
    (data.prefs["android.not_a_preference.healthreport.uploadEnabled"] == "true")
    ? "none" : "inline";
});

function requestSettings(event) {
  if (event) {
    event.preventDefault();
  }
  self.port.emit("settings-request");
  self.port.emit("settings-request", "background");
}

function eraseAllSettings(event) {
  if (event) {
    event.preventDefault();
  }
  if (!window.confirm("Erase all background settings?")) {
    return;
  }
  self.port.emit("settings-erase-all", "background");
  requestSettings();
}

requestSettings();

document
  .getElementById("settings-request")
  .addEventListener('click', requestSettings, false);

document
  .getElementById("settings-erase-all")
  .addEventListener('click', eraseAllSettings, false);

function setHealthReport(event) {
  event.preventDefault();
  self.port.emit("healthReport-set",
                 { uri: event.target.dataset.uri,
                   interval: parseInt(event.target.dataset.interval, 10),
                 });
  requestSettings();
}

for (let el of document.querySelectorAll(".healthReport-set")) {
    el.addEventListener('click', setHealthReport, false);
}

function setProductAnnouncements(event) {
  event.preventDefault();
  self.port.emit("productAnnouncements-set",
                 { uri: event.target.dataset.uri,
                   interval: parseInt(event.target.dataset.interval, 10),
                 });
  requestSettings();
}

for (let el of document.querySelectorAll(".productAnnouncements-set")) {
    el.addEventListener('click', setProductAnnouncements, false);
}

document
  .getElementById("productAnnouncements-increase-idle")
  .addEventListener('click', function(event) {
    if (event) {
      event.preventDefault();
    }
    self.port.emit("productAnnouncements-increase-idle");
    requestSettings();
  }, false);
