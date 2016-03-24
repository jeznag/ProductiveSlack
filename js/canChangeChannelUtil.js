let lastTimeUpdated;
let cachedWhiteList;
function getWhitelistedChannels() {
    let promise = new Promise(function (resolve, reject) {
        if (!lastTimeUpdated || (new Date() - lastTimeUpdated) > 60000) {
            chrome.storage.sync.get('slackProductivityWhiteList', function (whiteListFromStorage) {
                cachedWhiteList = whiteListFromStorage.slackProductivityWhiteList || [];
                resolve(cachedWhiteList);
            });
        } else {
            return cachedWhiteList;
        }
    });
    return promise;
}

function isWhiteListedChannel(channelTheUserIsTyping, whiteListedChannels) {
    return whiteListedChannels.reduce(function (previous, whiteListedChannel) {
        return previous || (channelTheUserIsTyping.length >= (whiteListedChannel.length / 2) &&
            whiteListedChannel.indexOf(channelTheUserIsTyping) === 0);      
    }, false);
}

export default function isTypingAWhiteListedChannel(channelTheUserIsTyping) {
    return getWhitelistedChannels().then(function (whitelist) {
        return isWhiteListedChannel(channelTheUserIsTyping, whitelist);
    });
}
