import isTypingAWhiteListedChannel from './canChangeChannelUtil.js';

export default (function () {

    'use strict';

    let zGbl_PageChangedByAJAX_Timer = '';
    let lastRuleBreak;

    function startApp(lastRelapse) {
        console.log('***Slack Productivity Starting', lastRelapse);
        lastRuleBreak = lastRelapse;
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
        let observer = new MutationObserver(function() {
            target.remove();
            if (!target.querySelector('#slackProductivityWarningNode')) {
                target.appendChild(getWarningDiv());
            }
        });
         
        // configuration of the observer:
        let config = { attributes: true, childList: true, characterData: true };
         
        // pass in the target node, as well as the observer options
        observer.observe(target, config);
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
            wrapperDiv.querySelector('a').addEventListener('mouseenter', handleChannelMouseEnter);
            wrapperDiv.querySelector('a').addEventListener('mouseleave', handleChannelMouseLeave);
        }
    }

    function handleChannelMouseEnter(e) {
        const channelName = e.target.innerText.trim();
        isTypingAWhiteListedChannel(channelName).then(function (isValidChannel) {
            if (!isValidChannel) {
                e.target.style.cursor = 'not-allowed';
            }
        });
    }

    function handleChannelMouseLeave(e) {
        e.target.style.cursor = 'auto';
    }

    function handleChannelClick(e) {
        const channelName = e.target.innerText.trim();
        handleChannelChange(channelName, e);
    }

    function handleChannelChange(channelName, e) {
        if (!e.useDefault) {
            cancelChannelOpen(e);
            isTypingAWhiteListedChannel(channelName).then(function (isValidChannel) {
                if (!isValidChannel) {
                    if (!confirmFirstTime()) {
                        cancelChannelOpen(e);
                    } else {
                        if (!confirmSecondTime()) {
                            cancelChannelOpen(e);
                        } else {
                            if (!confirmThirdTime()) {
                                cancelChannelOpen(e); 
                            } else {
                                updateLastRelapseDate();
                                youSuckAlert();
                                allowChannelOpen(e, e.target);
                            }
                        }
                    }
                } else {
                    allowChannelOpen(e, e.target);
                }
            });
        }
    }

    function updateLastRelapseDate() {
        lastRuleBreak = new Date();
        chrome.storage.sync.set({
            slackProductivityDateOfLastRelapse: lastRuleBreak
        });
    }

    function allowChannelOpen(e, node) {
        //Firing the regular action
        var evt = document.createEvent('MouseEvents');
        evt.initEvent(e.type, true, true);
        evt['useDefault'] = true;
        node.dispatchEvent(evt);
    }

    function confirmFirstTime() {
        const minutesSinceLastRuleBreak = ((new Date() - lastRuleBreak) / 1000 / 60).toFixed(2);
        let originalTextToContinue = 'I want to destroy my productivity and engage in pointless arguments';
        let textToContinue = originalTextToContinue.split(' ').reverse().join(' ');
        let response = window.prompt(
`OY! Are you sure you want to get out of flow?
You\'ve been good for ${minutesSinceLastRuleBreak} minutes.
Are you sure you want to become significantly less awesome?
Type this text backwards if you do '${textToContinue}'`);

        return response === originalTextToContinue;
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