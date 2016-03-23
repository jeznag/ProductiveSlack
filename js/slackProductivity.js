import slackListener from './addHookToSlack.js';

(function () {

    'use strict';
    startSlackProductivity();

    function startSlackProductivity() {
        getWhitelistedChannels().then(function (whiteList) {
            slackListener.startApp(whiteList);
        });
    }

    function getWhitelistedChannels() {
        let promise = new Promise(function (resolve, reject) { 
            chrome.storage.sync.get('slackProductivityWhiteList', function (whiteListFromStorage) {
                resolve(whiteListFromStorage.slackProductivityWhiteList || []);
            });
        });
        return promise;
    }

})();
