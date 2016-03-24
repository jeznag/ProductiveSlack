(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _canChangeChannelUtil = require('./canChangeChannelUtil.js');

var _canChangeChannelUtil2 = _interopRequireDefault(_canChangeChannelUtil);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function () {

    'use strict';

    var zGbl_PageChangedByAJAX_Timer = '';
    var lastRuleBreak = undefined;
    var jumpToChannelBlocked = false;

    function startApp(lastRelapse) {
        console.log('***Slack Productivity Starting');
        lastRuleBreak = lastRelapse;
        window.addEventListener('load', localMain, false);
    }

    function localMain() {
        if (typeof zGbl_PageChangedByAJAX_Timer === 'number') {
            clearTimeout(zGbl_PageChangedByAJAX_Timer);
            zGbl_PageChangedByAJAX_Timer = '';
        }

        document.body.addEventListener('DOMNodeInserted', pageBitHasLoaded, false);
    }

    function pageBitHasLoaded() {
        if (typeof zGbl_PageChangedByAJAX_Timer === 'number') {
            clearTimeout(zGbl_PageChangedByAJAX_Timer);
            zGbl_PageChangedByAJAX_Timer = '';
        }

        zGbl_PageChangedByAJAX_Timer = setTimeout(function () {
            handlePageChange();
        }, 666);
    }

    function handlePageChange() {
        removeEventListener('DOMNodeInserted', pageBitHasLoaded, false);
        var channelsAreVisible = document.querySelector('li.channel') !== null;
        if (channelsAreVisible) {
            hideSlackChannels();
        }
        blockJumpingToChannel();
    }

    function blockJumpingToChannel() {
        // select the target node
        var target = document.querySelector('ts-jumper');
        // create an observer instance
        var observer = new MutationObserver(function (mutations) {
            if (!target.querySelector('#slackProductivityWarningNode')) {
                target.appendChild(getWarningDiv());
            }

            addJumpToChannelBlocker();
        });

        // configuration of the observer:
        var config = { attributes: true, childList: true, characterData: true };

        // pass in the target node, as well as the observer options
        observer.observe(target, config);
    }

    function addJumpToChannelBlocker() {
        if (!jumpToChannelBlocked) {
            (function () {
                var jumpToInput = document.querySelector('[data-qa=\'jumper_input\']');

                jumpToInput.addEventListener('keydown', function (e) {
                    var ENTER_KEY = 13;
                    if (e.keyCode === ENTER_KEY) {
                        handleChannelChange(jumpToInput.value, e);
                    } else {
                        showWhitelistedChannelWarning(jumpToInput.value);
                    }
                });
                jumpToChannelBlocked = true;
            })();
        }
    }

    function getWarningDiv() {
        var warningNode = document.createElement('div');
        warningNode.style.backgroundColor = 'red';
        warningNode.style.color = 'white';
        warningNode.style.fontSize = '16px';
        warningNode.style.textAlign = 'center';
        warningNode.id = 'slackProductivityWarningNode';
        warningNode.innerText = 'Hey buddy I\'m watching you! I thought you were meant to be working;)';
        return warningNode;
    }

    function showWhitelistedChannelWarning(channelTheUserIsTyping) {
        var warningNode = document.querySelector('#slackProductivityWarningNode');

        (0, _canChangeChannelUtil2.default)(channelTheUserIsTyping).then(function (isValidChannel) {
            console.log('isValidChannel', isValidChannel);
            if (isValidChannel) {
                warningNode.innerText = 'Right on - I\'m happy for you to visit that channel';
                warningNode.style.backgroundColor = 'green';
            } else {
                warningNode.innerText = 'Hey buddy I\'m watching you! I don\'t like the look of that channel at all. I thought you were meant to be working.';
                warningNode.style.backgroundColor = 'red';
            }
        });
    }

    function hideSlackChannels() {
        var channels = document.querySelectorAll('li.channel');
        for (var i = 0; i < channels.length; i++) {
            processChannel(channels[i]);
        }
    }

    function processChannel(channel) {
        if (channel.parentNode.className.indexOf('slackChannelBlocker') === -1) {
            var wrapperDiv = document.createElement('div');

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
        var channelName = e.target.innerText.trim();
        (0, _canChangeChannelUtil2.default)(channelName).then(function (isValidChannel) {
            if (!isValidChannel) {
                e.target.style.cursor = 'not-allowed';
            }
        });
    }

    function handleChannelMouseLeave(e) {
        e.target.style.cursor = 'auto';
    }

    function handleChannelClick(e) {
        var channelName = e.target.innerText.trim();
        handleChannelChange(channelName, e);
    }

    function handleChannelChange(channelName, e) {
        if (!e.useDefault) {
            cancelChannelOpen(e);
            (0, _canChangeChannelUtil2.default)(channelName).then(function (isValidChannel) {
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
        var minutesSinceLastRuleBreak = ((new Date() - lastRuleBreak) / 1000 / 60).toFixed(2);

        return window.confirm('OY! Are you sure you want to get out of flow?\nYou\'ve been good for ' + minutesSinceLastRuleBreak + ' minutes.\nAre you sure you want to become significantly less awesome?\nPress cancel to back out now.');
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
        startApp: startApp
    };
}();

},{"./canChangeChannelUtil.js":2}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = isTypingAWhiteListedChannel;
var lastTimeUpdated = undefined;
var cachedWhiteList = undefined;
function getWhitelistedChannels() {
    var promise = new Promise(function (resolve, reject) {
        if (!lastTimeUpdated || new Date() - lastTimeUpdated > 60000) {
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
        return previous || channelTheUserIsTyping.length >= whiteListedChannel.length / 2 && whiteListedChannel.indexOf(channelTheUserIsTyping) === 0;
    }, false);
}

function isTypingAWhiteListedChannel(channelTheUserIsTyping) {
    return getWhitelistedChannels().then(function (whitelist) {
        return isWhiteListedChannel(channelTheUserIsTyping, whitelist);
    });
}

},{}],3:[function(require,module,exports){
'use strict';

var _addHookToSlack = require('./addHookToSlack.js');

var _addHookToSlack2 = _interopRequireDefault(_addHookToSlack);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(function () {

    'use strict';

    startSlackProductivity();

    function startSlackProductivity() {
        getTimeSinceLastRelapse().then(function (lastRelapse) {
            _addHookToSlack2.default.startApp(lastRelapse);
        });
    }

    function getTimeSinceLastRelapse() {
        var promise = new Promise(function (resolve, reject) {
            chrome.storage.sync.get('slackProductivityDateOfLastRelapse', function (whiteListFromStorage) {
                resolve(whiteListFromStorage.slackProductivityDateOfLastRelapse || new Date());
            });
        });
        return promise;
    }
})();

},{"./addHookToSlack.js":1}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9hZGRIb29rVG9TbGFjay5qcyIsImpzL2NhbkNoYW5nZUNoYW5uZWxVdGlsLmpzIiwianMvc2xhY2tQcm9kdWN0aXZpdHkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7a0JDRWUsWUFBYTs7QUFFeEIsaUJBRndCOztBQUl4QixRQUFJLCtCQUErQixFQUEvQixDQUpvQjtBQUt4QixRQUFJLHlCQUFKLENBTHdCO0FBTXhCLFFBQUksdUJBQXVCLEtBQXZCLENBTm9COztBQVF4QixhQUFTLFFBQVQsQ0FBa0IsV0FBbEIsRUFBK0I7QUFDM0IsZ0JBQVEsR0FBUixDQUFZLGdDQUFaLEVBRDJCO0FBRTNCLHdCQUFnQixXQUFoQixDQUYyQjtBQUczQixlQUFPLGdCQUFQLENBQXlCLE1BQXpCLEVBQWlDLFNBQWpDLEVBQTRDLEtBQTVDLEVBSDJCO0tBQS9COztBQU1BLGFBQVMsU0FBVCxHQUFxQjtBQUNqQixZQUFJLE9BQU8sNEJBQVAsS0FBd0MsUUFBeEMsRUFBa0Q7QUFDbEQseUJBQWMsNEJBQWQsRUFEa0Q7QUFFbEQsMkNBQWdDLEVBQWhDLENBRmtEO1NBQXREOztBQUtBLGlCQUFTLElBQVQsQ0FBYyxnQkFBZCxDQUFnQyxpQkFBaEMsRUFBbUQsZ0JBQW5ELEVBQXFFLEtBQXJFLEVBTmlCO0tBQXJCOztBQVNBLGFBQVMsZ0JBQVQsR0FBNEI7QUFDeEIsWUFBSSxPQUFPLDRCQUFQLEtBQXdDLFFBQXhDLEVBQWtEO0FBQ2xELHlCQUFjLDRCQUFkLEVBRGtEO0FBRWxELDJDQUErQixFQUEvQixDQUZrRDtTQUF0RDs7QUFLQSx1Q0FBK0IsV0FBWSxZQUFXO0FBQ2xELCtCQURrRDtTQUFYLEVBRXhDLEdBRjRCLENBQS9CLENBTndCO0tBQTVCOztBQVdBLGFBQVMsZ0JBQVQsR0FBNEI7QUFDeEIsNEJBQXFCLGlCQUFyQixFQUF3QyxnQkFBeEMsRUFBMEQsS0FB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Q0FBdUIsV0FBdkIsRUFEa0Q7U0FBdkIsQ0FBL0IsQ0FEOEI7S0FBbEM7O0FBTUEsYUFBUyx1QkFBVCxHQUFtQztBQUMvQixZQUFJLFVBQVUsSUFBSSxPQUFKLENBQVksVUFBVSxPQUFWLEVBQW1CLE1BQW5CLEVBQTJCO0FBQ2pELG1CQUFPLE9BQVAsQ0FBZSxJQUFmLENBQW9CLEdBQXBCLENBQXdCLG9DQUF4QixFQUE4RCxVQUFVLG9CQUFWLEVBQWdDO0FBQzFGLHdCQUFRLHFCQUFxQixrQ0FBckIsSUFBMkQsSUFBSSxJQUFKLEVBQTNELENBQVIsQ0FEMEY7YUFBaEMsQ0FBOUQsQ0FEaUQ7U0FBM0IsQ0FBdEIsQ0FEMkI7QUFNL0IsZUFBTyxPQUFQLENBTitCO0tBQW5DO0NBWEgsQ0FBRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgaXNUeXBpbmdBV2hpdGVMaXN0ZWRDaGFubmVsIGZyb20gJy4vY2FuQ2hhbmdlQ2hhbm5lbFV0aWwuanMnO1xuXG5leHBvcnQgZGVmYXVsdCAoZnVuY3Rpb24gKCkge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgbGV0IHpHYmxfUGFnZUNoYW5nZWRCeUFKQVhfVGltZXIgPSAnJztcbiAgICBsZXQgbGFzdFJ1bGVCcmVhaztcbiAgICBsZXQganVtcFRvQ2hhbm5lbEJsb2NrZWQgPSBmYWxzZTtcblxuICAgIGZ1bmN0aW9uIHN0YXJ0QXBwKGxhc3RSZWxhcHNlKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCcqKipTbGFjayBQcm9kdWN0aXZpdHkgU3RhcnRpbmcnKTtcbiAgICAgICAgbGFzdFJ1bGVCcmVhayA9IGxhc3RSZWxhcHNlO1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciAoJ2xvYWQnLCBsb2NhbE1haW4sIGZhbHNlKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsb2NhbE1haW4oKSB7XG4gICAgICAgIGlmICh0eXBlb2YgekdibF9QYWdlQ2hhbmdlZEJ5QUpBWF9UaW1lciA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCAoekdibF9QYWdlQ2hhbmdlZEJ5QUpBWF9UaW1lcik7XG4gICAgICAgICAgICB6R2JsX1BhZ2VDaGFuZ2VkQnlBSkFYX1RpbWVyICA9ICcnO1xuICAgICAgICB9XG5cbiAgICAgICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyICgnRE9NTm9kZUluc2VydGVkJywgcGFnZUJpdEhhc0xvYWRlZCwgZmFsc2UpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBhZ2VCaXRIYXNMb2FkZWQoKSB7XG4gICAgICAgIGlmICh0eXBlb2YgekdibF9QYWdlQ2hhbmdlZEJ5QUpBWF9UaW1lciA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCAoekdibF9QYWdlQ2hhbmdlZEJ5QUpBWF9UaW1lcik7XG4gICAgICAgICAgICB6R2JsX1BhZ2VDaGFuZ2VkQnlBSkFYX1RpbWVyID0gJyc7XG4gICAgICAgIH1cblxuICAgICAgICB6R2JsX1BhZ2VDaGFuZ2VkQnlBSkFYX1RpbWVyID0gc2V0VGltZW91dCAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBoYW5kbGVQYWdlQ2hhbmdlICgpOyBcbiAgICAgICAgfSwgNjY2KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBoYW5kbGVQYWdlQ2hhbmdlKCkge1xuICAgICAgICByZW1vdmVFdmVudExpc3RlbmVyICgnRE9NTm9kZUluc2VydGVkJywgcGFnZUJpdEhhc0xvYWRlZCwgZmFsc2UpO1xuICAgICAgICBjb25zdCBjaGFubmVsc0FyZVZpc2libGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdsaS5jaGFubmVsJykgIT09IG51bGw7XG4gICAgICAgIGlmIChjaGFubmVsc0FyZVZpc2libGUpIHtcbiAgICAgICAgICAgIGhpZGVTbGFja0NoYW5uZWxzKCk7XG4gICAgICAgIH1cbiAgICAgICAgYmxvY2tKdW1waW5nVG9DaGFubmVsKCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYmxvY2tKdW1waW5nVG9DaGFubmVsKCkge1xuICAgICAgICAvLyBzZWxlY3QgdGhlIHRhcmdldCBub2RlXG4gICAgICAgIGNvbnN0IHRhcmdldCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ3RzLWp1bXBlcicpO1xuICAgICAgICAvLyBjcmVhdGUgYW4gb2JzZXJ2ZXIgaW5zdGFuY2VcbiAgICAgICAgbGV0IG9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoZnVuY3Rpb24obXV0YXRpb25zKSB7XG4gICAgICAgICAgICBpZiAoIXRhcmdldC5xdWVyeVNlbGVjdG9yKCcjc2xhY2tQcm9kdWN0aXZpdHlXYXJuaW5nTm9kZScpKSB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0LmFwcGVuZENoaWxkKGdldFdhcm5pbmdEaXYoKSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGFkZEp1bXBUb0NoYW5uZWxCbG9ja2VyKCk7XG4gICAgICAgIH0pO1xuICAgICAgICAgXG4gICAgICAgIC8vIGNvbmZpZ3VyYXRpb24gb2YgdGhlIG9ic2VydmVyOlxuICAgICAgICBsZXQgY29uZmlnID0geyBhdHRyaWJ1dGVzOiB0cnVlLCBjaGlsZExpc3Q6IHRydWUsIGNoYXJhY3RlckRhdGE6IHRydWUgfTtcbiAgICAgICAgIFxuICAgICAgICAvLyBwYXNzIGluIHRoZSB0YXJnZXQgbm9kZSwgYXMgd2VsbCBhcyB0aGUgb2JzZXJ2ZXIgb3B0aW9uc1xuICAgICAgICBvYnNlcnZlci5vYnNlcnZlKHRhcmdldCwgY29uZmlnKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBhZGRKdW1wVG9DaGFubmVsQmxvY2tlcigpIHtcbiAgICAgICAgaWYgKCFqdW1wVG9DaGFubmVsQmxvY2tlZCkge1xuICAgICAgICAgICAgY29uc3QganVtcFRvSW5wdXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1xYT1cXCdqdW1wZXJfaW5wdXRcXCddJyk7XG5cbiAgICAgICAgICAgIGp1bXBUb0lucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IEVOVEVSX0tFWSA9IDEzO1xuICAgICAgICAgICAgICAgIGlmIChlLmtleUNvZGUgPT09IEVOVEVSX0tFWSkge1xuICAgICAgICAgICAgICAgICAgICBoYW5kbGVDaGFubmVsQ2hhbmdlKGp1bXBUb0lucHV0LnZhbHVlLCBlKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBzaG93V2hpdGVsaXN0ZWRDaGFubmVsV2FybmluZyhqdW1wVG9JbnB1dC52YWx1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBqdW1wVG9DaGFubmVsQmxvY2tlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRXYXJuaW5nRGl2KCl7XG4gICAgICAgIGxldCB3YXJuaW5nTm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICB3YXJuaW5nTm9kZS5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAncmVkJztcbiAgICAgICAgd2FybmluZ05vZGUuc3R5bGUuY29sb3IgPSAnd2hpdGUnO1xuICAgICAgICB3YXJuaW5nTm9kZS5zdHlsZS5mb250U2l6ZSA9ICcxNnB4JztcbiAgICAgICAgd2FybmluZ05vZGUuc3R5bGUudGV4dEFsaWduID0gJ2NlbnRlcic7XG4gICAgICAgIHdhcm5pbmdOb2RlLmlkID0gJ3NsYWNrUHJvZHVjdGl2aXR5V2FybmluZ05vZGUnO1xuICAgICAgICB3YXJuaW5nTm9kZS5pbm5lclRleHQgPSAnSGV5IGJ1ZGR5IElcXCdtIHdhdGNoaW5nIHlvdSEgSSB0aG91Z2h0IHlvdSB3ZXJlIG1lYW50IHRvIGJlIHdvcmtpbmc7KSc7XG4gICAgICAgIHJldHVybiB3YXJuaW5nTm9kZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzaG93V2hpdGVsaXN0ZWRDaGFubmVsV2FybmluZyhjaGFubmVsVGhlVXNlcklzVHlwaW5nKSB7XG4gICAgICAgIGxldCB3YXJuaW5nTm9kZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNzbGFja1Byb2R1Y3Rpdml0eVdhcm5pbmdOb2RlJyk7XG5cbiAgICAgICAgaXNUeXBpbmdBV2hpdGVMaXN0ZWRDaGFubmVsKGNoYW5uZWxUaGVVc2VySXNUeXBpbmcpLnRoZW4oZnVuY3Rpb24gKGlzVmFsaWRDaGFubmVsKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnaXNWYWxpZENoYW5uZWwnLCBpc1ZhbGlkQ2hhbm5lbCk7XG4gICAgICAgICAgICBpZiAoaXNWYWxpZENoYW5uZWwpIHtcbiAgICAgICAgICAgICAgICB3YXJuaW5nTm9kZS5pbm5lclRleHQgPSAnUmlnaHQgb24gLSBJXFwnbSBoYXBweSBmb3IgeW91IHRvIHZpc2l0IHRoYXQgY2hhbm5lbCc7XG4gICAgICAgICAgICAgICAgd2FybmluZ05vZGUuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ2dyZWVuJztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgd2FybmluZ05vZGUuaW5uZXJUZXh0ID0gJ0hleSBidWRkeSBJXFwnbSB3YXRjaGluZyB5b3UhIEkgZG9uXFwndCBsaWtlIHRoZSBsb29rIG9mIHRoYXQgY2hhbm5lbCBhdCBhbGwuIEkgdGhvdWdodCB5b3Ugd2VyZSBtZWFudCB0byBiZSB3b3JraW5nLic7XG4gICAgICAgICAgICAgICAgd2FybmluZ05vZGUuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ3JlZCc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGhpZGVTbGFja0NoYW5uZWxzKCkge1xuICAgICAgICBjb25zdCBjaGFubmVscyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ2xpLmNoYW5uZWwnKTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGFubmVscy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgcHJvY2Vzc0NoYW5uZWwoY2hhbm5lbHNbaV0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcHJvY2Vzc0NoYW5uZWwoY2hhbm5lbCkge1xuICAgICAgICBpZiAoY2hhbm5lbC5wYXJlbnROb2RlLmNsYXNzTmFtZS5pbmRleE9mKCdzbGFja0NoYW5uZWxCbG9ja2VyJykgPT09IC0xKSB7XG4gICAgICAgICAgICBsZXQgd3JhcHBlckRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXG4gICAgICAgICAgICB3cmFwcGVyRGl2LmNsYXNzTmFtZSA9ICdzbGFja0NoYW5uZWxCbG9ja2VyJztcbiAgICAgICAgICAgIHdyYXBwZXJEaXYuc3R5bGUubWFyZ2luID0gJzBweCc7XG4gICAgICAgICAgICB3cmFwcGVyRGl2LnN0eWxlLnBhZGRpbmcgPSAnMHB4JztcbiAgICAgICAgICAgIHdyYXBwZXJEaXYuc3R5bGUuYm9yZGVyID0gJ25vbmUnO1xuXG4gICAgICAgICAgICB3cmFwcGVyRGl2LmlubmVySFRNTCA9IGNoYW5uZWwub3V0ZXJIVE1MO1xuICAgICAgICAgICAgY2hhbm5lbC5wYXJlbnRFbGVtZW50LmFwcGVuZENoaWxkKHdyYXBwZXJEaXYpO1xuICAgICAgICAgICAgY2hhbm5lbC5yZW1vdmUoKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgd3JhcHBlckRpdi5xdWVyeVNlbGVjdG9yKCdhJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVDaGFubmVsQ2xpY2spO1xuICAgICAgICAgICAgd3JhcHBlckRpdi5xdWVyeVNlbGVjdG9yKCdhJykuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VlbnRlcicsIGhhbmRsZUNoYW5uZWxNb3VzZUVudGVyKTtcbiAgICAgICAgICAgIHdyYXBwZXJEaXYucXVlcnlTZWxlY3RvcignYScpLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCBoYW5kbGVDaGFubmVsTW91c2VMZWF2ZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBoYW5kbGVDaGFubmVsTW91c2VFbnRlcihlKSB7XG4gICAgICAgIGNvbnN0IGNoYW5uZWxOYW1lID0gZS50YXJnZXQuaW5uZXJUZXh0LnRyaW0oKTtcbiAgICAgICAgaXNUeXBpbmdBV2hpdGVMaXN0ZWRDaGFubmVsKGNoYW5uZWxOYW1lKS50aGVuKGZ1bmN0aW9uIChpc1ZhbGlkQ2hhbm5lbCkge1xuICAgICAgICAgICAgaWYgKCFpc1ZhbGlkQ2hhbm5lbCkge1xuICAgICAgICAgICAgICAgIGUudGFyZ2V0LnN0eWxlLmN1cnNvciA9ICdub3QtYWxsb3dlZCc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGhhbmRsZUNoYW5uZWxNb3VzZUxlYXZlKGUpIHtcbiAgICAgICAgZS50YXJnZXQuc3R5bGUuY3Vyc29yID0gJ2F1dG8nO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGhhbmRsZUNoYW5uZWxDbGljayhlKSB7XG4gICAgICAgIGNvbnN0IGNoYW5uZWxOYW1lID0gZS50YXJnZXQuaW5uZXJUZXh0LnRyaW0oKTtcbiAgICAgICAgaGFuZGxlQ2hhbm5lbENoYW5nZShjaGFubmVsTmFtZSwgZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaGFuZGxlQ2hhbm5lbENoYW5nZShjaGFubmVsTmFtZSwgZSkge1xuICAgICAgICBpZiAoIWUudXNlRGVmYXVsdCkge1xuICAgICAgICAgICAgY2FuY2VsQ2hhbm5lbE9wZW4oZSk7XG4gICAgICAgICAgICBpc1R5cGluZ0FXaGl0ZUxpc3RlZENoYW5uZWwoY2hhbm5lbE5hbWUpLnRoZW4oZnVuY3Rpb24gKGlzVmFsaWRDaGFubmVsKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFpc1ZhbGlkQ2hhbm5lbCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWNvbmZpcm1GaXJzdFRpbWUoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FuY2VsQ2hhbm5lbE9wZW4oZSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWNvbmZpcm1TZWNvbmRUaW1lKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYW5jZWxDaGFubmVsT3BlbihlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFjb25maXJtVGhpcmRUaW1lKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FuY2VsQ2hhbm5lbE9wZW4oZSk7IFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUxhc3RSZWxhcHNlRGF0ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5b3VTdWNrQWxlcnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWxsb3dDaGFubmVsT3BlbihlLCBlLnRhcmdldCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgYWxsb3dDaGFubmVsT3BlbihlLCBlLnRhcmdldCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiB1cGRhdGVMYXN0UmVsYXBzZURhdGUoKSB7XG4gICAgICAgIGxhc3RSdWxlQnJlYWsgPSBuZXcgRGF0ZSgpO1xuICAgICAgICBjaHJvbWUuc3RvcmFnZS5zeW5jLnNldCh7XG4gICAgICAgICAgICBzbGFja1Byb2R1Y3Rpdml0eURhdGVPZkxhc3RSZWxhcHNlOiBsYXN0UnVsZUJyZWFrXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGFsbG93Q2hhbm5lbE9wZW4oZSwgbm9kZSkge1xuICAgICAgICAvL0ZpcmluZyB0aGUgcmVndWxhciBhY3Rpb25cbiAgICAgICAgdmFyIGV2dCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdNb3VzZUV2ZW50cycpO1xuICAgICAgICBldnQuaW5pdEV2ZW50KGUudHlwZSwgdHJ1ZSwgdHJ1ZSk7XG4gICAgICAgIGV2dFsndXNlRGVmYXVsdCddID0gdHJ1ZTtcbiAgICAgICAgbm9kZS5kaXNwYXRjaEV2ZW50KGV2dCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY29uZmlybUZpcnN0VGltZSgpIHtcbiAgICAgICAgY29uc3QgbWludXRlc1NpbmNlTGFzdFJ1bGVCcmVhayA9ICgobmV3IERhdGUoKSAtIGxhc3RSdWxlQnJlYWspIC8gMTAwMCAvIDYwKS50b0ZpeGVkKDIpO1xuXG4gICAgICAgIHJldHVybiB3aW5kb3cuY29uZmlybShcbmBPWSEgQXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIGdldCBvdXQgb2YgZmxvdz9cbllvdVxcJ3ZlIGJlZW4gZ29vZCBmb3IgJHttaW51dGVzU2luY2VMYXN0UnVsZUJyZWFrfSBtaW51dGVzLlxuQXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIGJlY29tZSBzaWduaWZpY2FudGx5IGxlc3MgYXdlc29tZT9cblByZXNzIGNhbmNlbCB0byBiYWNrIG91dCBub3cuYCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY29uZmlybVNlY29uZFRpbWUoKSB7XG4gICAgICAgIHJldHVybiB3aW5kb3cuY29uZmlybSgnQXJlIHlvdSByZWFsbHkgc3VyZT8gQ2xpY2sgT0sgaWYgeW91IHdhbnQgdG8gcHJvY3Jhc3RpbmF0ZT8nKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjb25maXJtVGhpcmRUaW1lKCkge1xuICAgICAgICByZXR1cm4gd2luZG93LmNvbmZpcm0oJ1NlcmlvdXNseT8/PyBHYWggb2ssIEkgcHJvbWlzZSB0aGlzIGlzIHRoZSBsYXN0IGRpYWxvZzspJyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24geW91U3Vja0FsZXJ0KCkge1xuICAgICAgICB3aW5kb3cuYWxlcnQoJ0hleSEgWW91IHN1Y2shJyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY2FuY2VsQ2hhbm5lbE9wZW4oZSkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgc3RhcnRBcHBcbiAgICB9O1xuXG59KSgpOyIsImxldCBsYXN0VGltZVVwZGF0ZWQ7XG5sZXQgY2FjaGVkV2hpdGVMaXN0O1xuZnVuY3Rpb24gZ2V0V2hpdGVsaXN0ZWRDaGFubmVscygpIHtcbiAgICBsZXQgcHJvbWlzZSA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgaWYgKCFsYXN0VGltZVVwZGF0ZWQgfHwgKG5ldyBEYXRlKCkgLSBsYXN0VGltZVVwZGF0ZWQpID4gNjAwMDApIHtcbiAgICAgICAgICAgIGNocm9tZS5zdG9yYWdlLnN5bmMuZ2V0KCdzbGFja1Byb2R1Y3Rpdml0eVdoaXRlTGlzdCcsIGZ1bmN0aW9uICh3aGl0ZUxpc3RGcm9tU3RvcmFnZSkge1xuICAgICAgICAgICAgICAgIGNhY2hlZFdoaXRlTGlzdCA9IHdoaXRlTGlzdEZyb21TdG9yYWdlLnNsYWNrUHJvZHVjdGl2aXR5V2hpdGVMaXN0IHx8IFtdO1xuICAgICAgICAgICAgICAgIHJlc29sdmUoY2FjaGVkV2hpdGVMaXN0KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFdoaXRlTGlzdDtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBwcm9taXNlO1xufVxuXG5mdW5jdGlvbiBpc1doaXRlTGlzdGVkQ2hhbm5lbChjaGFubmVsVGhlVXNlcklzVHlwaW5nLCB3aGl0ZUxpc3RlZENoYW5uZWxzKSB7XG4gICAgcmV0dXJuIHdoaXRlTGlzdGVkQ2hhbm5lbHMucmVkdWNlKGZ1bmN0aW9uIChwcmV2aW91cywgd2hpdGVMaXN0ZWRDaGFubmVsKSB7XG4gICAgICAgIHJldHVybiBwcmV2aW91cyB8fCAoY2hhbm5lbFRoZVVzZXJJc1R5cGluZy5sZW5ndGggPj0gKHdoaXRlTGlzdGVkQ2hhbm5lbC5sZW5ndGggLyAyKSAmJlxuICAgICAgICAgICAgd2hpdGVMaXN0ZWRDaGFubmVsLmluZGV4T2YoY2hhbm5lbFRoZVVzZXJJc1R5cGluZykgPT09IDApOyAgICAgIFxuICAgIH0sIGZhbHNlKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gaXNUeXBpbmdBV2hpdGVMaXN0ZWRDaGFubmVsKGNoYW5uZWxUaGVVc2VySXNUeXBpbmcpIHtcbiAgICByZXR1cm4gZ2V0V2hpdGVsaXN0ZWRDaGFubmVscygpLnRoZW4oZnVuY3Rpb24gKHdoaXRlbGlzdCkge1xuICAgICAgICByZXR1cm4gaXNXaGl0ZUxpc3RlZENoYW5uZWwoY2hhbm5lbFRoZVVzZXJJc1R5cGluZywgd2hpdGVsaXN0KTtcbiAgICB9KTtcbn1cbiIsImltcG9ydCBzbGFja0xpc3RlbmVyIGZyb20gJy4vYWRkSG9va1RvU2xhY2suanMnO1xuXG4oZnVuY3Rpb24gKCkge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuICAgIHN0YXJ0U2xhY2tQcm9kdWN0aXZpdHkoKTtcblxuICAgIGZ1bmN0aW9uIHN0YXJ0U2xhY2tQcm9kdWN0aXZpdHkoKSB7XG4gICAgICAgIGdldFRpbWVTaW5jZUxhc3RSZWxhcHNlKCkudGhlbihmdW5jdGlvbiAobGFzdFJlbGFwc2UpIHtcbiAgICAgICAgICAgIHNsYWNrTGlzdGVuZXIuc3RhcnRBcHAobGFzdFJlbGFwc2UpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRUaW1lU2luY2VMYXN0UmVsYXBzZSgpIHtcbiAgICAgICAgbGV0IHByb21pc2UgPSBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7IFxuICAgICAgICAgICAgY2hyb21lLnN0b3JhZ2Uuc3luYy5nZXQoJ3NsYWNrUHJvZHVjdGl2aXR5RGF0ZU9mTGFzdFJlbGFwc2UnLCBmdW5jdGlvbiAod2hpdGVMaXN0RnJvbVN0b3JhZ2UpIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHdoaXRlTGlzdEZyb21TdG9yYWdlLnNsYWNrUHJvZHVjdGl2aXR5RGF0ZU9mTGFzdFJlbGFwc2UgfHwgbmV3IERhdGUoKSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBwcm9taXNlO1xuICAgIH1cblxufSkoKTtcbiJdfQ==
