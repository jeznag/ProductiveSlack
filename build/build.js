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

    function startApp(lastRelapse) {
        console.log('***Slack Productivity Starting', lastRelapse);
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
        // if user presses Cmd-K, block the jumper dialog so they can't cheat
        const jumperDialog = document.querySelector('ts-jumper');
        if (jumperDialog) {
            jumperDialog.remove();
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
        var originalTextToContinue = 'I want to destroy my productivity and engage in pointless arguments';
        var textToContinue = originalTextToContinue.split(' ').reverse().join(' ');
        var response = window.prompt('OY! Are you sure you want to get out of flow?\nYou\'ve been good for ' + minutesSinceLastRuleBreak + ' minutes.\nAre you sure you want to become significantly less awesome?\nType this text backwards if you do \'' + textToContinue + '\'');

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

},{"./addHookToSlack.js":1}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9hZGRIb29rVG9TbGFjay5qcyIsImpzL2NhbkNoYW5nZUNoYW5uZWxVdGlsLmpzIiwianMvc2xhY2tQcm9kdWN0aXZpdHkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7a0JDRWUsWUFBYTs7QUFFeEIsaUJBRndCOztBQUl4QixRQUFJLCtCQUErQixFQUEvQixDQUpvQjtBQUt4QixRQUFJLHlCQUFKLENBTHdCOztBQU94QixhQUFTLFFBQVQsQ0FBa0IsV0FBbEIsRUFBK0I7QUFDM0IsZ0JBQVEsR0FBUixDQUFZLGdDQUFaLEVBQThDLFdBQTlDLEVBRDJCO0FBRTNCLHdCQUFnQixXQUFoQixDQUYyQjtBQUczQixlQUFPLGdCQUFQLENBQXlCLE1BQXpCLEVBQWlDLFNBQWpDLEVBQTRDLEtBQTVDLEVBSDJCO0tBQS9COztBQU1BLGFBQVMsU0FBVCxHQUFxQjtBQUNqQixZQUFJLE9BQU8sNEJBQVAsS0FBd0MsUUFBeEMsRUFBa0Q7QUFDbEQseUJBQWMsNEJBQWQsRUFEa0Q7QUFFbEQsMkNBQWdDLEVBQWhDLENBRmtEO1NBQXREOztBQUtBLGlCQUFTLElBQVQsQ0FBYyxnQkFBZCxDQUFnQyxpQkFBaEMsRUFBbUQsZ0JBQW5ELEVBQXFFLEtBQXJFLEVBTmlCO0tBQXJCOztBQVNBLGFBQVMsZ0JBQVQsR0FBNEI7QUFDeEIsWUFBSSxPQUFPLDRCQUFQLEtBQXdDLFFBQXhDLEVBQWtEO0FBQ2xELHlCQUFjLDRCQUFkLEVBRGtEO0FBRWxELDJDQUErQixFQUEvQixDQUZrRDtTQUF0RDs7QUFLQSx1Q0FBK0IsV0FBWSxZQUFXO0FBQ2xELCtCQURrRDtTQUFYLEVBRXhDLEdBRjRCLENBQS9CLENBTndCO0tBQTVCOztBQVdBLGFBQVMsZ0JBQVQsR0FBNEI7QUFDeEIsNEJBQXFCLGlCQUFyQixFQUF3QyxnQkFBeEMsRUFBMEQsS0FBMUQsRUFEd0I7QUFFeEIsWUFB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QUFULENBQXFDLHNCQUFyQyxFQUE2RDtBQUN4RSxXQUFPLHlCQUF5QixJQUF6QixDQUE4QixVQUFVLFNBQVYsRUFBcUI7QUFDdEQsZUFBTyxxQkFBcUIsc0JBQXJCLEVBQTZDLFNBQTdDLENBQVAsQ0FEc0Q7S0FBckIsQ0FBckMsQ0FEd0U7Q0FBN0Q7Ozs7Ozs7Ozs7O0FDdEJmLENBQUMsWUFBWTs7QUFFVCxpQkFGUzs7QUFHVCw2QkFIUzs7QUFLVCxhQUFTLHNCQUFULEdBQWtDO0FBQzlCLGtDQUEwQixJQUExQixDQUErQixVQUFVLFdBQVYsRUFBdUI7QUFDbEQscUNBQWMsUUFBZCxDQUF1QixXQUF2QixFQURrRDtTQUF2QixDQUEvQixDQUQ4QjtLQUFsQzs7QUFNQSxhQUFTLHVCQUFULEdBQW1DO0FBQy9CLFlBQUksVUFBVSxJQUFJLE9BQUosQ0FBWSxVQUFVLE9BQVYsRUFBbUIsTUFBbkIsRUFBMkI7QUFDakQsbUJBQU8sT0FBUCxDQUFlLElBQWYsQ0FBb0IsR0FBcEIsQ0FBd0Isb0NBQXhCLEVBQThELFVBQVUsZUFBVixFQUEyQjtBQUNyRixvQkFBSSxrQkFBa0IsZ0JBQWdCLGtDQUFoQixDQUQrRDs7QUFHckYsb0JBQUksRUFBRSwyQkFBMkIsSUFBM0IsQ0FBRixFQUFvQztBQUNwQyxzQ0FBa0IsSUFBSSxJQUFKLEVBQWxCLENBRG9DO2lCQUF4QztBQUdBLHdCQUFRLGVBQVIsRUFOcUY7YUFBM0IsQ0FBOUQsQ0FEaUQ7U0FBM0IsQ0FBdEIsQ0FEMkI7QUFXL0IsZUFBTyxPQUFQLENBWCtCO0tBQW5DO0NBWEgsQ0FBRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgaXNUeXBpbmdBV2hpdGVMaXN0ZWRDaGFubmVsIGZyb20gJy4vY2FuQ2hhbmdlQ2hhbm5lbFV0aWwuanMnO1xuXG5leHBvcnQgZGVmYXVsdCAoZnVuY3Rpb24gKCkge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgbGV0IHpHYmxfUGFnZUNoYW5nZWRCeUFKQVhfVGltZXIgPSAnJztcbiAgICBsZXQgbGFzdFJ1bGVCcmVhaztcblxuICAgIGZ1bmN0aW9uIHN0YXJ0QXBwKGxhc3RSZWxhcHNlKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCcqKipTbGFjayBQcm9kdWN0aXZpdHkgU3RhcnRpbmcnLCBsYXN0UmVsYXBzZSk7XG4gICAgICAgIGxhc3RSdWxlQnJlYWsgPSBsYXN0UmVsYXBzZTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIgKCdsb2FkJywgbG9jYWxNYWluLCBmYWxzZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbG9jYWxNYWluKCkge1xuICAgICAgICBpZiAodHlwZW9mIHpHYmxfUGFnZUNoYW5nZWRCeUFKQVhfVGltZXIgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQgKHpHYmxfUGFnZUNoYW5nZWRCeUFKQVhfVGltZXIpO1xuICAgICAgICAgICAgekdibF9QYWdlQ2hhbmdlZEJ5QUpBWF9UaW1lciAgPSAnJztcbiAgICAgICAgfVxuXG4gICAgICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lciAoJ0RPTU5vZGVJbnNlcnRlZCcsIHBhZ2VCaXRIYXNMb2FkZWQsIGZhbHNlKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwYWdlQml0SGFzTG9hZGVkKCkge1xuICAgICAgICBpZiAodHlwZW9mIHpHYmxfUGFnZUNoYW5nZWRCeUFKQVhfVGltZXIgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQgKHpHYmxfUGFnZUNoYW5nZWRCeUFKQVhfVGltZXIpO1xuICAgICAgICAgICAgekdibF9QYWdlQ2hhbmdlZEJ5QUpBWF9UaW1lciA9ICcnO1xuICAgICAgICB9XG5cbiAgICAgICAgekdibF9QYWdlQ2hhbmdlZEJ5QUpBWF9UaW1lciA9IHNldFRpbWVvdXQgKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaGFuZGxlUGFnZUNoYW5nZSAoKTsgXG4gICAgICAgIH0sIDY2Nik7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaGFuZGxlUGFnZUNoYW5nZSgpIHtcbiAgICAgICAgcmVtb3ZlRXZlbnRMaXN0ZW5lciAoJ0RPTU5vZGVJbnNlcnRlZCcsIHBhZ2VCaXRIYXNMb2FkZWQsIGZhbHNlKTtcbiAgICAgICAgY29uc3QgY2hhbm5lbHNBcmVWaXNpYmxlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignbGkuY2hhbm5lbCcpICE9PSBudWxsO1xuICAgICAgICBpZiAoY2hhbm5lbHNBcmVWaXNpYmxlKSB7XG4gICAgICAgICAgICBoaWRlU2xhY2tDaGFubmVscygpO1xuICAgICAgICB9XG4gICAgICAgIGJsb2NrSnVtcGluZ1RvQ2hhbm5lbCgpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGJsb2NrSnVtcGluZ1RvQ2hhbm5lbCgpIHtcbiAgICAgICAgLy8gc2VsZWN0IHRoZSB0YXJnZXQgbm9kZVxuICAgICAgICBjb25zdCB0YXJnZXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCd0cy1qdW1wZXInKTtcbiAgICAgICAgLy8gY3JlYXRlIGFuIG9ic2VydmVyIGluc3RhbmNlXG4gICAgICAgIGxldCBvYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGFyZ2V0LnJlbW92ZSgpO1xuICAgICAgICAgICAgaWYgKCF0YXJnZXQucXVlcnlTZWxlY3RvcignI3NsYWNrUHJvZHVjdGl2aXR5V2FybmluZ05vZGUnKSkge1xuICAgICAgICAgICAgICAgIHRhcmdldC5hcHBlbmRDaGlsZChnZXRXYXJuaW5nRGl2KCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgIFxuICAgICAgICAvLyBjb25maWd1cmF0aW9uIG9mIHRoZSBvYnNlcnZlcjpcbiAgICAgICAgbGV0IGNvbmZpZyA9IHsgYXR0cmlidXRlczogdHJ1ZSwgY2hpbGRMaXN0OiB0cnVlLCBjaGFyYWN0ZXJEYXRhOiB0cnVlIH07XG4gICAgICAgICBcbiAgICAgICAgLy8gcGFzcyBpbiB0aGUgdGFyZ2V0IG5vZGUsIGFzIHdlbGwgYXMgdGhlIG9ic2VydmVyIG9wdGlvbnNcbiAgICAgICAgb2JzZXJ2ZXIub2JzZXJ2ZSh0YXJnZXQsIGNvbmZpZyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0V2FybmluZ0Rpdigpe1xuICAgICAgICBsZXQgd2FybmluZ05vZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgd2FybmluZ05vZGUuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ3JlZCc7XG4gICAgICAgIHdhcm5pbmdOb2RlLnN0eWxlLmNvbG9yID0gJ3doaXRlJztcbiAgICAgICAgd2FybmluZ05vZGUuc3R5bGUuZm9udFNpemUgPSAnMTZweCc7XG4gICAgICAgIHdhcm5pbmdOb2RlLnN0eWxlLnRleHRBbGlnbiA9ICdjZW50ZXInO1xuICAgICAgICB3YXJuaW5nTm9kZS5pZCA9ICdzbGFja1Byb2R1Y3Rpdml0eVdhcm5pbmdOb2RlJztcbiAgICAgICAgd2FybmluZ05vZGUuaW5uZXJUZXh0ID0gJ0hleSBidWRkeSBJXFwnbSB3YXRjaGluZyB5b3UhIEkgdGhvdWdodCB5b3Ugd2VyZSBtZWFudCB0byBiZSB3b3JraW5nOyknO1xuICAgICAgICByZXR1cm4gd2FybmluZ05vZGU7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaGlkZVNsYWNrQ2hhbm5lbHMoKSB7XG4gICAgICAgIGNvbnN0IGNoYW5uZWxzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnbGkuY2hhbm5lbCcpO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNoYW5uZWxzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBwcm9jZXNzQ2hhbm5lbChjaGFubmVsc1tpXSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwcm9jZXNzQ2hhbm5lbChjaGFubmVsKSB7XG4gICAgICAgIGlmIChjaGFubmVsLnBhcmVudE5vZGUuY2xhc3NOYW1lLmluZGV4T2YoJ3NsYWNrQ2hhbm5lbEJsb2NrZXInKSA9PT0gLTEpIHtcbiAgICAgICAgICAgIGxldCB3cmFwcGVyRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cbiAgICAgICAgICAgIHdyYXBwZXJEaXYuY2xhc3NOYW1lID0gJ3NsYWNrQ2hhbm5lbEJsb2NrZXInO1xuICAgICAgICAgICAgd3JhcHBlckRpdi5zdHlsZS5tYXJnaW4gPSAnMHB4JztcbiAgICAgICAgICAgIHdyYXBwZXJEaXYuc3R5bGUucGFkZGluZyA9ICcwcHgnO1xuICAgICAgICAgICAgd3JhcHBlckRpdi5zdHlsZS5ib3JkZXIgPSAnbm9uZSc7XG5cbiAgICAgICAgICAgIHdyYXBwZXJEaXYuaW5uZXJIVE1MID0gY2hhbm5lbC5vdXRlckhUTUw7XG4gICAgICAgICAgICBjaGFubmVsLnBhcmVudEVsZW1lbnQuYXBwZW5kQ2hpbGQod3JhcHBlckRpdik7XG4gICAgICAgICAgICBjaGFubmVsLnJlbW92ZSgpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB3cmFwcGVyRGl2LnF1ZXJ5U2VsZWN0b3IoJ2EnKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZUNoYW5uZWxDbGljayk7XG4gICAgICAgICAgICB3cmFwcGVyRGl2LnF1ZXJ5U2VsZWN0b3IoJ2EnKS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWVudGVyJywgaGFuZGxlQ2hhbm5lbE1vdXNlRW50ZXIpO1xuICAgICAgICAgICAgd3JhcHBlckRpdi5xdWVyeVNlbGVjdG9yKCdhJykuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VsZWF2ZScsIGhhbmRsZUNoYW5uZWxNb3VzZUxlYXZlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGhhbmRsZUNoYW5uZWxNb3VzZUVudGVyKGUpIHtcbiAgICAgICAgY29uc3QgY2hhbm5lbE5hbWUgPSBlLnRhcmdldC5pbm5lclRleHQudHJpbSgpO1xuICAgICAgICBpc1R5cGluZ0FXaGl0ZUxpc3RlZENoYW5uZWwoY2hhbm5lbE5hbWUpLnRoZW4oZnVuY3Rpb24gKGlzVmFsaWRDaGFubmVsKSB7XG4gICAgICAgICAgICBpZiAoIWlzVmFsaWRDaGFubmVsKSB7XG4gICAgICAgICAgICAgICAgZS50YXJnZXQuc3R5bGUuY3Vyc29yID0gJ25vdC1hbGxvd2VkJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaGFuZGxlQ2hhbm5lbE1vdXNlTGVhdmUoZSkge1xuICAgICAgICBlLnRhcmdldC5zdHlsZS5jdXJzb3IgPSAnYXV0byc7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaGFuZGxlQ2hhbm5lbENsaWNrKGUpIHtcbiAgICAgICAgY29uc3QgY2hhbm5lbE5hbWUgPSBlLnRhcmdldC5pbm5lclRleHQudHJpbSgpO1xuICAgICAgICBoYW5kbGVDaGFubmVsQ2hhbmdlKGNoYW5uZWxOYW1lLCBlKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBoYW5kbGVDaGFubmVsQ2hhbmdlKGNoYW5uZWxOYW1lLCBlKSB7XG4gICAgICAgIGlmICghZS51c2VEZWZhdWx0KSB7XG4gICAgICAgICAgICBjYW5jZWxDaGFubmVsT3BlbihlKTtcbiAgICAgICAgICAgIGlzVHlwaW5nQVdoaXRlTGlzdGVkQ2hhbm5lbChjaGFubmVsTmFtZSkudGhlbihmdW5jdGlvbiAoaXNWYWxpZENoYW5uZWwpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWlzVmFsaWRDaGFubmVsKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghY29uZmlybUZpcnN0VGltZSgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYW5jZWxDaGFubmVsT3BlbihlKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghY29uZmlybVNlY29uZFRpbWUoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbmNlbENoYW5uZWxPcGVuKGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWNvbmZpcm1UaGlyZFRpbWUoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYW5jZWxDaGFubmVsT3BlbihlKTsgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlTGFzdFJlbGFwc2VEYXRlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlvdVN1Y2tBbGVydCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbGxvd0NoYW5uZWxPcGVuKGUsIGUudGFyZ2V0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBhbGxvd0NoYW5uZWxPcGVuKGUsIGUudGFyZ2V0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHVwZGF0ZUxhc3RSZWxhcHNlRGF0ZSgpIHtcbiAgICAgICAgbGFzdFJ1bGVCcmVhayA9IG5ldyBEYXRlKCk7XG4gICAgICAgIGNocm9tZS5zdG9yYWdlLnN5bmMuc2V0KHtcbiAgICAgICAgICAgIHNsYWNrUHJvZHVjdGl2aXR5RGF0ZU9mTGFzdFJlbGFwc2U6IGxhc3RSdWxlQnJlYWtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYWxsb3dDaGFubmVsT3BlbihlLCBub2RlKSB7XG4gICAgICAgIC8vRmlyaW5nIHRoZSByZWd1bGFyIGFjdGlvblxuICAgICAgICB2YXIgZXZ0ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ01vdXNlRXZlbnRzJyk7XG4gICAgICAgIGV2dC5pbml0RXZlbnQoZS50eXBlLCB0cnVlLCB0cnVlKTtcbiAgICAgICAgZXZ0Wyd1c2VEZWZhdWx0J10gPSB0cnVlO1xuICAgICAgICBub2RlLmRpc3BhdGNoRXZlbnQoZXZ0KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjb25maXJtRmlyc3RUaW1lKCkge1xuICAgICAgICBjb25zdCBtaW51dGVzU2luY2VMYXN0UnVsZUJyZWFrID0gKChuZXcgRGF0ZSgpIC0gbGFzdFJ1bGVCcmVhaykgLyAxMDAwIC8gNjApLnRvRml4ZWQoMik7XG4gICAgICAgIGxldCBvcmlnaW5hbFRleHRUb0NvbnRpbnVlID0gJ0kgd2FudCB0byBkZXN0cm95IG15IHByb2R1Y3Rpdml0eSBhbmQgZW5nYWdlIGluIHBvaW50bGVzcyBhcmd1bWVudHMnO1xuICAgICAgICBsZXQgdGV4dFRvQ29udGludWUgPSBvcmlnaW5hbFRleHRUb0NvbnRpbnVlLnNwbGl0KCcgJykucmV2ZXJzZSgpLmpvaW4oJyAnKTtcbiAgICAgICAgbGV0IHJlc3BvbnNlID0gd2luZG93LnByb21wdChcbmBPWSEgQXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIGdldCBvdXQgb2YgZmxvdz9cbllvdVxcJ3ZlIGJlZW4gZ29vZCBmb3IgJHttaW51dGVzU2luY2VMYXN0UnVsZUJyZWFrfSBtaW51dGVzLlxuQXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIGJlY29tZSBzaWduaWZpY2FudGx5IGxlc3MgYXdlc29tZT9cblR5cGUgdGhpcyB0ZXh0IGJhY2t3YXJkcyBpZiB5b3UgZG8gJyR7dGV4dFRvQ29udGludWV9J2ApO1xuXG4gICAgICAgIHJldHVybiByZXNwb25zZSA9PT0gb3JpZ2luYWxUZXh0VG9Db250aW51ZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjb25maXJtU2Vjb25kVGltZSgpIHtcbiAgICAgICAgcmV0dXJuIHdpbmRvdy5jb25maXJtKCdBcmUgeW91IHJlYWxseSBzdXJlPyBDbGljayBPSyBpZiB5b3Ugd2FudCB0byBwcm9jcmFzdGluYXRlPycpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNvbmZpcm1UaGlyZFRpbWUoKSB7XG4gICAgICAgIHJldHVybiB3aW5kb3cuY29uZmlybSgnU2VyaW91c2x5Pz8/IEdhaCBvaywgSSBwcm9taXNlIHRoaXMgaXMgdGhlIGxhc3QgZGlhbG9nOyknKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB5b3VTdWNrQWxlcnQoKSB7XG4gICAgICAgIHdpbmRvdy5hbGVydCgnSGV5ISBZb3Ugc3VjayEnKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjYW5jZWxDaGFubmVsT3BlbihlKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBzdGFydEFwcFxuICAgIH07XG5cbn0pKCk7IiwibGV0IGxhc3RUaW1lVXBkYXRlZDtcbmxldCBjYWNoZWRXaGl0ZUxpc3Q7XG5mdW5jdGlvbiBnZXRXaGl0ZWxpc3RlZENoYW5uZWxzKCkge1xuICAgIGxldCBwcm9taXNlID0gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBpZiAoIWxhc3RUaW1lVXBkYXRlZCB8fCAobmV3IERhdGUoKSAtIGxhc3RUaW1lVXBkYXRlZCkgPiA2MDAwMCkge1xuICAgICAgICAgICAgY2hyb21lLnN0b3JhZ2Uuc3luYy5nZXQoJ3NsYWNrUHJvZHVjdGl2aXR5V2hpdGVMaXN0JywgZnVuY3Rpb24gKHdoaXRlTGlzdEZyb21TdG9yYWdlKSB7XG4gICAgICAgICAgICAgICAgY2FjaGVkV2hpdGVMaXN0ID0gd2hpdGVMaXN0RnJvbVN0b3JhZ2Uuc2xhY2tQcm9kdWN0aXZpdHlXaGl0ZUxpc3QgfHwgW107XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShjYWNoZWRXaGl0ZUxpc3QpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkV2hpdGVMaXN0O1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHByb21pc2U7XG59XG5cbmZ1bmN0aW9uIGlzV2hpdGVMaXN0ZWRDaGFubmVsKGNoYW5uZWxUaGVVc2VySXNUeXBpbmcsIHdoaXRlTGlzdGVkQ2hhbm5lbHMpIHtcbiAgICByZXR1cm4gd2hpdGVMaXN0ZWRDaGFubmVscy5yZWR1Y2UoZnVuY3Rpb24gKHByZXZpb3VzLCB3aGl0ZUxpc3RlZENoYW5uZWwpIHtcbiAgICAgICAgcmV0dXJuIHByZXZpb3VzIHx8IChjaGFubmVsVGhlVXNlcklzVHlwaW5nLmxlbmd0aCA+PSAod2hpdGVMaXN0ZWRDaGFubmVsLmxlbmd0aCAvIDIpICYmXG4gICAgICAgICAgICB3aGl0ZUxpc3RlZENoYW5uZWwuaW5kZXhPZihjaGFubmVsVGhlVXNlcklzVHlwaW5nKSA9PT0gMCk7ICAgICAgXG4gICAgfSwgZmFsc2UpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBpc1R5cGluZ0FXaGl0ZUxpc3RlZENoYW5uZWwoY2hhbm5lbFRoZVVzZXJJc1R5cGluZykge1xuICAgIHJldHVybiBnZXRXaGl0ZWxpc3RlZENoYW5uZWxzKCkudGhlbihmdW5jdGlvbiAod2hpdGVsaXN0KSB7XG4gICAgICAgIHJldHVybiBpc1doaXRlTGlzdGVkQ2hhbm5lbChjaGFubmVsVGhlVXNlcklzVHlwaW5nLCB3aGl0ZWxpc3QpO1xuICAgIH0pO1xufVxuIiwiaW1wb3J0IHNsYWNrTGlzdGVuZXIgZnJvbSAnLi9hZGRIb29rVG9TbGFjay5qcyc7XG4oZnVuY3Rpb24gKCkge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuICAgIHN0YXJ0U2xhY2tQcm9kdWN0aXZpdHkoKTtcblxuICAgIGZ1bmN0aW9uIHN0YXJ0U2xhY2tQcm9kdWN0aXZpdHkoKSB7XG4gICAgICAgIGdldFRpbWVTaW5jZUxhc3RSZWxhcHNlKCkudGhlbihmdW5jdGlvbiAobGFzdFJlbGFwc2UpIHtcbiAgICAgICAgICAgIHNsYWNrTGlzdGVuZXIuc3RhcnRBcHAobGFzdFJlbGFwc2UpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRUaW1lU2luY2VMYXN0UmVsYXBzZSgpIHtcbiAgICAgICAgbGV0IHByb21pc2UgPSBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7IFxuICAgICAgICAgICAgY2hyb21lLnN0b3JhZ2Uuc3luYy5nZXQoJ3NsYWNrUHJvZHVjdGl2aXR5RGF0ZU9mTGFzdFJlbGFwc2UnLCBmdW5jdGlvbiAoZGF0YUZyb21TdG9yYWdlKSB7XG4gICAgICAgICAgICAgICAgdmFyIGxhc3RSZWxhcHNlRGF0ZSA9IGRhdGFGcm9tU3RvcmFnZS5zbGFja1Byb2R1Y3Rpdml0eURhdGVPZkxhc3RSZWxhcHNlO1xuXG4gICAgICAgICAgICAgICAgaWYgKCEobGFzdFJlbGFwc2VEYXRlIGluc3RhbmNlb2YgRGF0ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgbGFzdFJlbGFwc2VEYXRlID0gbmV3IERhdGUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShsYXN0UmVsYXBzZURhdGUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICB9XG5cbn0pKCk7XG4iXX0=
