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
            chrome.storage.sync.get('slackProductivityDateOfLastRelapse', function (dataFromStorage) {
                var lastRelapseDate = dataFromStorage.slackProductivityDateOfLastRelapse;

                if (!(lastRelapseDate instanceof Date)) {
                    lastRelapseDate = new Date();
                }
                resolve(lastRelapseDate);
            });
        });
        return promise;
    }

})();
