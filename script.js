const pageToggleOption = document.getElementById('this-page');
const siteToggleOption = document.getElementById('whole-site');

function executeInTabContext(fn) {
	if (!fn || !{}.toString.call(fn) === '[object Function]') {
		return false;
	}

	const self = this;

	chrome.tabs.query({ active: true, lastFocusedWindow: true }, tabs => {
		try {
			const pageURL = new URL(tabs[0].url);

			if (!pageURL.origin.match(/^http(s?):\/\//)) {
				return true;
			}

			fn.call(self, pageURL);
		} catch (e) {
			console.error(e.message);
		}
	});

	return true;
}

function toggleOnPage(URLObject) {
	const isChecked = this.checked === true;
	const pageLink = (URLObject.origin + URLObject.pathname).replace(/\/$/, '');

	chrome.storage.sync.get(['pages'], function (result) {
		let { pages } = result;

		if (!Array.isArray(pages)) {
			pages = [];
		}

		if (isChecked) {
			pages.push(pageLink);
			pages = [...pages].filter((element, index, list) => list.indexOf(element) === index);

			chrome.storage.sync.set({ pages });
		} else {
			const index = pages.indexOf(pageLink);

			if (index !== -1) {
				pages.splice(index, 1);

				chrome.storage.sync.set({ pages });
			}
		}
	});
}

function toggleOnSite(URLObject) {
	const isChecked = this.checked === true;
	const pageLink = URLObject.origin.replace(/\/$/, '');

	chrome.storage.sync.get(['sites'], function (result) {
		let { sites } = result;

		if (!Array.isArray(sites)) {
			sites = [];
		}

		if (isChecked) {
			sites.push(pageLink);
			sites = [...sites].filter((element, index, list) => list.indexOf(element) === index);

			chrome.storage.sync.set({ sites });

			pageToggleOption.setAttribute('disabled', 'disabled');
		} else {
			const index = sites.indexOf(pageLink);

			if (index !== -1) {
				sites.splice(index, 1);

				chrome.storage.sync.set({ sites });

				pageToggleOption.removeAttribute('disabled');
			}
		}
	});

	return true;
}

function onLoadExec(URLObject) {
	const pageLink = (URLObject.origin + URLObject.pathname).replace(/\/$/, '');

	chrome.storage.sync.get(['pages', 'sites'], function (result) {
		const { sites, pages } = result;

		if (-1 !== sites.indexOf(URLObject.origin)) {
			document.getElementById('whole-site').checked = true;
			document.getElementById('this-page').disabled = true;
		}

		if (-1 !== pages.indexOf(pageLink)) {
			document.getElementById('this-page').checked = true;
		}
	});
}

//Listeners
document.addEventListener('change', function (e) {
	const { target } = e;

	if (!target.id) {
		return true;
	}

	const { id } = target;

	if ('this-page' === id) {
		executeInTabContext.call(target, toggleOnPage);
	} else if ('whole-site' === id) {
		executeInTabContext.call(target, toggleOnSite);
	}
}, { passive: true });

window.addEventListener('load', function () {
	executeInTabContext.call(this, onLoadExec);
}, { passive: true });