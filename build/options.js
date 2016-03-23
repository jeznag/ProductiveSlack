
chrome.storage.sync.get('slackProductivityWhiteList', function(storageObj) {
    const whiteListString = storageObj.slackProductivityWhiteList.join(',');
    document.querySelector('#whitelist').value = whiteListString;
});

document.querySelector('#saveWhiteList').addEventListener('click', function () {
        const whiteListFromUser = document.querySelector('#whitelist').value;
        const whiteListArray = whiteListFromUser.replace(' ', '').split(',');

        chrome.storage.sync.set({
            slackProductivityWhiteList: whiteListArray
        }, function() {
            // Update status to let user know options were saved.
            var status = document.getElementById('status');
            status.textContent = 'Options saved.';
            setTimeout(function() {
              status.textContent = '';
            }, 750);
        });
    }
);