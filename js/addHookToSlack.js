export default (function () {

    'use strict';

    let zGbl_PageChangedByAJAX_Timer = '';
    let whiteListedChannels = [];
    let lastRuleBreak = new Date();
    let jumpToChannelBlocked = false;

    function startApp(whiteList) {
        console.log('***Slack Productivity Starting with whitelist', whiteList);
        whiteListedChannels = whiteList;
        window.addEventListener ('load', localMain, false);
    }

    function localMain() {
        if (typeof zGbl_PageChangedByAJAX_Timer === 'number') {
            clearTimeout (zGbl_PageChangedByAJAX_Timer);
            zGbl_PageChangedByAJAX_Timer  = '';
        }

        document.body.addEventListener ('DOMNodeInserted', pageBitHasLoaded, false);
    }

    function pageBitHasLoaded() {
        if (typeof zGbl_PageChangedByAJAX_Timer === 'number') {
            clearTimeout (zGbl_PageChangedByAJAX_Timer);
            zGbl_PageChangedByAJAX_Timer = '';
        }

        zGbl_PageChangedByAJAX_Timer = setTimeout (function() {
            handlePageChange (); 
        }, 666);
    }

    function handlePageChange() {
        removeEventListener ('DOMNodeInserted', pageBitHasLoaded, false);
        const channelsAreVisible = document.querySelector('li.channel') !== null;
        if (channelsAreVisible) {
            hideSlackChannels();
        }
        blockJumpingToChannel();
    }

    function blockJumpingToChannel() {
        // select the target node
        const target = document.querySelector('ts-jumper');
        // create an observer instance
        let observer = new MutationObserver(function(mutations) {
            if (!target.querySelector('#slackProductivityWarningNode')) {
                target.appendChild(getWarningDiv());
            }

            addJumpToChannelBlocker();
        });
         
        // configuration of the observer:
        let config = { attributes: true, childList: true, characterData: true };
         
        // pass in the target node, as well as the observer options
        observer.observe(target, config);
    }

    function addJumpToChannelBlocker() {
        if (!jumpToChannelBlocked) {
            const jumpToInput = document.querySelector('[data-qa="jumper_input"]');

            jumpToInput.addEventListener('keydown', function (e) {
                const ENTER_KEY = 13;
                if (e.keyCode === ENTER_KEY) {
                    handleChannelChange(jumpToInput.value, e);
                } else {
                    showWhitelistedChannelWarning(jumpToInput.value);
                }
            });
            jumpToChannelBlocked = true;
        }
    }

    function getWarningDiv(){
        let warningNode = document.createElement('div');
        warningNode.style.backgroundColor = 'red';
        warningNode.style.color = 'white';
        warningNode.style.fontSize = '16px';
        warningNode.style.textAlign = 'center';
        warningNode.id = 'slackProductivityWarningNode';
        warningNode.innerText = 'Hey buddy I\'m watching you! I thought you were meant to be working;)';
        return warningNode;
    }

    function showWhitelistedChannelWarning(channelTheUserIsTyping) {
        let warningNode = document.querySelector('#slackProductivityWarningNode');

        if (isTypingAWhiteListedChannel(channelTheUserIsTyping)) {
            warningNode.innerText = 'Right on - I\'m happy for you to visit that channel';
            warningNode.style.backgroundColor = 'green';
        } else {
            warningNode.innerText = 'Hey buddy I\'m watching you! I don\'t like the look of that channel at all. I thought you were meant to be working.';
            warningNode.style.backgroundColor = 'red';
        }
    }

    function isTypingAWhiteListedChannel(channelTheUserIsTyping) {
        return whiteListedChannels.reduce(function (previous, whiteListedChannel) {
           return channelTheUserIsTyping.length >= (whiteListedChannel.length / 2) &&
            whiteListedChannel.indexOf(channelTheUserIsTyping) > -1; 
        });
    }

    function hideSlackChannels() {
        const channels = document.querySelectorAll('li.channel');
        for (let i = 0; i < channels.length; i++) {
            processChannel(channels[i]);
        }
    }

    function processChannel(channel) {
        if (channel.parentNode.className.indexOf('slackChannelBlocker') === -1) {
            let wrapperDiv = document.createElement('div');

            wrapperDiv.className = 'slackChannelBlocker';
            wrapperDiv.style.margin = '0px';
            wrapperDiv.style.padding = '0px';
            wrapperDiv.style.border = 'none';

            wrapperDiv.innerHTML = channel.outerHTML;
            channel.parentElement.appendChild(wrapperDiv);
            channel.remove();
            
            wrapperDiv.querySelector('a').addEventListener('click', handleChannelClick);
        }
    }

    function handleChannelClick(e) {
        const channelName = e.target.innerText.trim();
        handleChannelChange(channelName, e);
    }

    function handleChannelChange(channelName, e) {
        const isChannelWhitelisted = isTypingAWhiteListedChannel(channelName);

        if (!isChannelWhitelisted) {
            if (!confirmFirstTime()) {
                cancelChannelOpen(e);
            } else {
                if (!confirmSecondTime()) {
                    cancelChannelOpen(e);
                } else {
                    if (!confirmThirdTime()) {
                        cancelChannelOpen(e); 
                    } else {
                        lastRuleBreak = new Date();
                        youSuckAlert();
                    }
                }
            }
        }
    }

    function confirmFirstTime() {
        const minutesSinceLastRuleBreak = ((new Date() - lastRuleBreak) / 1000 / 60).toFixed(2);

        return window.confirm(
`OY! Are you sure you want to get out of flow?
You\'ve been good for ${minutesSinceLastRuleBreak} minutes.
Are you sure you want to become significantly less awesome?
Press cancel to back out now.`);
    }

    function confirmSecondTime() {
        return window.confirm('Are you really sure? Click OK if you want to procrastinate?');
    }

    function confirmThirdTime() {
        return window.confirm('Seriously??? Gah ok, I promise this is the last dialog;)');
    }

    function youSuckAlert() {
        window.alert('Hey! You suck!');
    }

    function cancelChannelOpen(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    return {
        startApp
    };

})();