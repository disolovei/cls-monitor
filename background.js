chrome.webNavigation.onCommitted.addListener(function (frame) {
    let enabled = false;

    try {
        const pageURL = new URL(frame.url);
        const pageLink = (pageURL.origin + pageURL.pathname).replace(/\/$/, '');

        if (!pageLink.match(/^http(s?):\/\//)) {
            return true;
        }

        chrome.storage.sync.get(['pages', 'sites'], function (result) {
            const { sites, pages } = result;

            if (Array.isArray(sites) && -1 !== sites.indexOf(pageURL.origin)) {
                enabled = true;
            }

            if (Array.isArray(pages) && -1 !== pages.indexOf(pageLink)) {
                enabled = true;
            }

            if (enabled) {
                chrome.scripting.executeScript({
                    target: {
                        tabId: frame.tabId,
                        allFrames: true,
                    },
                    files: ['js/content.js'],
                });

                chrome.scripting.insertCSS({
                    target: {
                        tabId: frame.tabId,
                    },
                    files: ['css/style.css'],
                });
            }
        });
    } catch (e) {
        console.error(e.message);
    };
});