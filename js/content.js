let statElement = null;

function showStat(value) {
    if (!statElement) {
        const statElem = document.createElement('div');
        statElem.id = 'lcp-cls-stats-monitor';
        statElem.classList.add('stat');
        document.body.appendChild(statElem);

        statElement = document.getElementById('lcp-cls-stats-monitor');
    }

    if (value <= 0.24) {
        statElement.classList.remove('lcp-cls-stats-error');
    } else {
        statElement.classList.add('lcp-cls-stats-error');
    }

    statElement.innerText = `CLS: ${value.toFixed(3)}`;
}

let style = 'font-size:1.2em;font-weight:bold;';

try {
    new PerformanceObserver(entryList => {
        const entries = entryList.getEntries() || [];
        let cls = 0;

        entries.forEach(entity => {
            if (!entity.hadRecentInput) {
                cls += entity.value;
            }
        });

        if (cls <= 0.24) {
            style += 'color:green;';
        } else {
            style += 'color:red;';

            entries.forEach(entity => {

                [...document.getElementsByClassName('cls-shift')].forEach((item) => {
                    if (!!item.classList) {
                        item.classList.remove('cls-shift');
                    }
                })

                entity.sources.forEach(item => {
                    if (!!item.node.classList) {
                        item.node.classList.add('cls-shift');
                    }
                });
            });
        }

        showStat(cls);
        console.log(`%c CLS: ${cls.toFixed(4)}`, style);
    }).observe({ type: "layout-shift", buffered: true });
} catch (e) {
    console.error(e.message);
}

try {
    let lastEntry;

    new PerformanceObserver(entryList => {
        const entries = entryList.getEntries();
        lastEntry = entries[entries.length - 1];
    }).observe({ type: "largest-contentful-paint", buffered: true });

    addEventListener('load', function fn() {
        if (lastEntry) {
            const lcp = ((lastEntry.renderTime || lastEntry.loadTime) / 1000).toFixed(2);

            if (lcp <= 2.5) {
                style += 'color:green;';
            } else if (lcp <= 4) {
                style += 'color:orange;';
                lastEntry.element.classList.add('cls-shift--orange');
            } else {
                style += 'color:red;';
                lastEntry.element.classList.add('cls-shift');
            }

            console.log(`%c LCP: ${lcp}s`, style);

            removeEventListener('load', fn, true);
        }
    }, { passive: true });
} catch (e) {
    console.error(e.message);
};