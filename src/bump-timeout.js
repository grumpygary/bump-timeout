"use strict";

// bumpTimeout(name,function,ms_delay) is a wrapper around setTimeout / clearTimeout
// essentially, if it is call and already has a timer for the "key"
// the previous timer will be cancelled, and the new one restarted
// -- great for tasks that would result in unnecessary duplication
// ---- 

let isDevelopment = false;

let _bumpTimers = {};
const bumpTimeout = async (key,fnOnTimeout,delay,options = {}) => {
    if (typeof(key) !== "string") {
        if (isDevelopment)
            console.error(`[BUMP-TIMEOUT] 'string' required for key`)
        return;
    }
    // you can cancel a bumpTimeout simply by calling it with the name of the tomeout to cancel
    let oldTimeout, bumped = 0;
    if (oldTimeout = _bumpTimers[key]) {
        clearTimeout(oldTimeout.timer);
        bumped = (oldTimeout.bumped || 0) + 1;
        _bumpTimers[key] = undefined;
    }
    if (fnOnTimeout) {  // gotta have function to call
        return new Promise((resolve,reject) => {
            let timer = setTimeout(() => {
                try {
                    oldTimeout = _bumpTimers[key];
                    _bumpTimers[key] = undefined;
                    resolve(fnOnTimeout())
                } catch (err) {
                    _bumpTimers[key] = undefined;
                    console.error(`[BUMP-TIMEOUT] fnOnTimeout.catch;`,err);
                    reject(err);
                }
            },delay);
            _bumpTimers[key] = { timer, bumped, delay, tsBase: Date.now() };
        });
    }
}
const listActiveBumpTimeouts = (options = {}) => {
    let timers = [];
    let tsNow = Date.now();
    let keys = Object.keys(_bumpTimers);
    keys.forEach(key => {
        let rec = _bumpTimers[key];
        if (rec) {
            let { bumped, delay, tsBase } = rec;
            let msLeft = (tsBase + delay) - tsNow;
            timers.push({ msLeft, str: `    ${key}: ${msLeft} / ${delay} ${bumped ? `(${bumped}x)` : ``}` });
        }
    });
    timers.sort((a,b) => a.msLeft - b.msLeft || 0);
    timers = timers.map(timer => timer.str);
    if (options.verbose) {
        console.debug(`[BUMP-TIMEOUTS]`,timers.length ? ("\n" + timers.join("\n")) : "-- none --");
    }
    return timers;
}
const timeout = async (ms,value) => { 
    return new Promise((resolve) => { 
        setTimeout(() => { 
            resolve(value);
        },ms); 
    }); 
}

const init = (root,options = {}) => {
    root.bumpTimeout = bumpTimeout;
    root.timeout = timeout;
    if (root.g && !root.g.production) {
        root.bumpTimeouts = listActiveBumpTimeouts;
        isDevelopment = options.dev;
    }
}

init.bumpTimeout = bumpTimeout;
init.timeout = timeout;
init.listActiveBumpTimeouts = listActiveBumpTimeouts;
module.exports = init;
// export { bumpTimeout, listActiveBumpTimeouts, timeout };
// export default 
