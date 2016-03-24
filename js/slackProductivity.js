import slackListener from './addHookToSlack.js';

(function () {

    'use strict';
    startSlackProductivity();

    function startSlackProductivity() {
        getTimeSinceLastRelapse().then(function (lastRelapse) {
            slackListener.startApp(lastRelapse);
        });
    }

    function getTimeSinceLastRelapse() {
        let promise = new Promise(function (resolve, reject) { 
            chrome.storage.sync.get('slackProductivityDateOfLastRelapse', function (whiteListFromStorage) {
                resolve(whiteListFromStorage.slackProductivityDateOfLastRelapse || new Date());
            });
        });
        return promise;
    }

})();
