import browser from "webextension-polyfill";
import $ from "jquery";
import optionsStorage from "./options-storage";
import replyPlugin from "./plugins/reply-plugin";
import emojiPlugin from "./plugins/emoji-plugin";
const locationChangeEventType = "MY_APP-location-change";

function observeUrlChanges(cb) {
	assertLocationChangeObserver();
	window.addEventListener(locationChangeEventType, () => cb(window.location));
	cb(window.location);
}

function assertLocationChangeObserver() {
	const state = window;
	if (state.MY_APP_locationWatchSetup) {
		return;
	}
	state.MY_APP_locationWatchSetup = true;

	let lastHref = location.href;

	["popstate", "click", "keydown", "keyup", "touchstart", "touchend"].forEach(
		(eventType) => {
			window.addEventListener(eventType, () => {
				requestAnimationFrame(() => {
					const currentHref = location.href;
					if (currentHref !== lastHref) {
						lastHref = currentHref;
						window.dispatchEvent(new Event(locationChangeEventType));
					}
				});
			});
		}
	);
}

const waitForEl = function (selector, callback) {
	if ($(selector).length) {
		callback();
	} else {
		setTimeout(function () {
			waitForEl(selector, callback);
		}, 100);
	}
};

const onEnterChats = (cb) => {
	observeUrlChanges((location) => {
		if (location.href.includes("circles")) {
			waitForEl(".main--chat", function () {
				cb();
			});
		}
	});
};

const loadPlugins = async () => {
	const { replyEnabled } = await optionsStorage.getAll();

	onEnterChats(() => {
		if (replyEnabled) {
			replyPlugin.apply();
		}

		emojiPlugin.apply();
	});
};

$(loadPlugins);
