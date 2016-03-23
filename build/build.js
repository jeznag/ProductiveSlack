(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function () {

    'use strict';

    var zGbl_PageChangedByAJAX_Timer = '';
    var whiteListedChannels = [];
    var lastRuleBreak = new Date();
    var jumpToChannelBlocked = false;

    function startApp(whiteList) {
        console.log('***Slack Productivity Starting with whitelist', whiteList);
        whiteListedChannels = whiteList;
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
                var jumpToInput = document.querySelector('[data-qa="jumper_input"]');

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
            return channelTheUserIsTyping.length >= whiteListedChannel.length / 2 && whiteListedChannel.indexOf(channelTheUserIsTyping) > -1;
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
        }
    }

    function handleChannelClick(e) {
        var channelName = e.target.innerText.trim();
        handleChannelChange(channelName, e);
    }

    function handleChannelChange(channelName, e) {
        var isChannelWhitelisted = isTypingAWhiteListedChannel(channelName);

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

},{}],2:[function(require,module,exports){
'use strict';

var _addHookToSlack = require('./addHookToSlack.js');

var _addHookToSlack2 = _interopRequireDefault(_addHookToSlack);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(function () {

    'use strict';

    startSlackProductivity();

    function startSlackProductivity() {
        getWhitelistedChannels().then(function (whiteList) {
            _addHookToSlack2.default.startApp(whiteList);
        });
    }

    function getWhitelistedChannels() {
        var promise = new Promise(function (resolve, reject) {
            chrome.storage.sync.get('slackProductivityWhiteList', function (whiteListFromStorage) {
                resolve(whiteListFromStorage.slackProductivityWhiteList || []);
            });
        });
        return promise;
    }
})();

},{"./addHookToSlack.js":1}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9hZGRIb29rVG9TbGFjay5qcyIsImpzL3NsYWNrUHJvZHVjdGl2aXR5LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7O2tCQ0FlLFlBQWE7O0FBRXhCLGlCQUZ3Qjs7QUFJeEIsUUFBSSwrQkFBK0IsRUFBL0IsQ0FKb0I7QUFLeEIsUUFBSSxzQkFBc0IsRUFBdEIsQ0FMb0I7QUFNeEIsUUFBSSxnQkFBZ0IsSUFBSSxJQUFKLEVBQWhCLENBTm9CO0FBT3hCLFFBQUksdUJBQXVCLEtBQXZCLENBUG9COztBQVN4QixhQUFTLFFBQVQsQ0FBa0IsU0FBbEIsRUFBNkI7QUFDekIsZ0JBQVEsR0FBUixDQUFZLCtDQUFaLEVBQTZELFNBQTdELEVBRHlCO0FBRXpCLDhCQUFzQixTQUF0QixDQUZ5QjtBQUd6QixlQUFPLGdCQUFQLENBQXlCLE1BQXpCLEVBQWlDLFNBQWpDLEVBQTRDLEtBQTVDLEVBSHlCO0tBQTdCOztBQU1BLGFBQVMsU0FBVCxHQUFxQjtBQUNqQixZQUFJLE9BQU8sNEJBQVAsS0FBd0MsUUFBeEMsRUFBa0Q7QUFDbEQseUJBQWMsNEJBQWQsRUFEa0Q7QUFFbEQsMkNBQWdDLEVBQWhDLENBRmtEO1NBQXREOztBQUtBLGlCQUFTLElBQVQsQ0FBYyxnQkFBZCxDQUFnQyxpQkFBaEMsRUFBbUQsZ0JBQW5ELEVBQXFFLEtBQXJFLEVBTmlCO0tBQXJCOztBQVNBLGFBQVMsZ0JBQVQsR0FBNEI7QUFDeEIsWUFBSSxPQUFPLDRCQUFQLEtBQXdDLFFBQXhDLEVBQWtEO0FBQ2xELHlCQUFjLDRCQUFkLEVBRGtEO0FBRWxELDJDQUErQixFQUEvQixDQUZrRDtTQUF0RDs7QUFLQSx1Q0FBK0IsV0FBWSxZQUFXO0FBQ2xELCtCQURrRDtTQUFYLEVBRXhDLEdBRjRCLENBQS9CLENBTndCO0tBQTVCOztBQVdBLGFBQVMsZ0JBQVQsR0FBNEI7QUFDeEIsNEJBQXFCLGlCQUFy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R0FBa0M7QUFDOUIsaUNBQXlCLElBQXpCLENBQThCLFVBQVUsU0FBVixFQUFxQjtBQUMvQyxxQ0FBYyxRQUFkLENBQXVCLFNBQXZCLEVBRCtDO1NBQXJCLENBQTlCLENBRDhCO0tBQWxDOztBQU1BLGFBQVMsc0JBQVQsR0FBa0M7QUFDOUIsWUFBSSxVQUFVLElBQUksT0FBSixDQUFZLFVBQVUsT0FBVixFQUFtQixNQUFuQixFQUEyQjtBQUNqRCxtQkFBTyxPQUFQLENBQWUsSUFBZixDQUFvQixHQUFwQixDQUF3Qiw0QkFBeEIsRUFBc0QsVUFBVSxvQkFBVixFQUFnQztBQUNsRix3QkFBUSxxQkFBcUIsMEJBQXJCLElBQW1ELEVBQW5ELENBQVIsQ0FEa0Y7YUFBaEMsQ0FBdEQsQ0FEaUQ7U0FBM0IsQ0FBdEIsQ0FEMEI7QUFNOUIsZUFBTyxPQUFQLENBTjhCO0tBQWxDO0NBWEgsQ0FBRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJleHBvcnQgZGVmYXVsdCAoZnVuY3Rpb24gKCkge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgbGV0IHpHYmxfUGFnZUNoYW5nZWRCeUFKQVhfVGltZXIgPSAnJztcbiAgICBsZXQgd2hpdGVMaXN0ZWRDaGFubmVscyA9IFtdO1xuICAgIGxldCBsYXN0UnVsZUJyZWFrID0gbmV3IERhdGUoKTtcbiAgICBsZXQganVtcFRvQ2hhbm5lbEJsb2NrZWQgPSBmYWxzZTtcblxuICAgIGZ1bmN0aW9uIHN0YXJ0QXBwKHdoaXRlTGlzdCkge1xuICAgICAgICBjb25zb2xlLmxvZygnKioqU2xhY2sgUHJvZHVjdGl2aXR5IFN0YXJ0aW5nIHdpdGggd2hpdGVsaXN0Jywgd2hpdGVMaXN0KTtcbiAgICAgICAgd2hpdGVMaXN0ZWRDaGFubmVscyA9IHdoaXRlTGlzdDtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIgKCdsb2FkJywgbG9jYWxNYWluLCBmYWxzZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbG9jYWxNYWluKCkge1xuICAgICAgICBpZiAodHlwZW9mIHpHYmxfUGFnZUNoYW5nZWRCeUFKQVhfVGltZXIgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQgKHpHYmxfUGFnZUNoYW5nZWRCeUFKQVhfVGltZXIpO1xuICAgICAgICAgICAgekdibF9QYWdlQ2hhbmdlZEJ5QUpBWF9UaW1lciAgPSAnJztcbiAgICAgICAgfVxuXG4gICAgICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lciAoJ0RPTU5vZGVJbnNlcnRlZCcsIHBhZ2VCaXRIYXNMb2FkZWQsIGZhbHNlKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwYWdlQml0SGFzTG9hZGVkKCkge1xuICAgICAgICBpZiAodHlwZW9mIHpHYmxfUGFnZUNoYW5nZWRCeUFKQVhfVGltZXIgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQgKHpHYmxfUGFnZUNoYW5nZWRCeUFKQVhfVGltZXIpO1xuICAgICAgICAgICAgekdibF9QYWdlQ2hhbmdlZEJ5QUpBWF9UaW1lciA9ICcnO1xuICAgICAgICB9XG5cbiAgICAgICAgekdibF9QYWdlQ2hhbmdlZEJ5QUpBWF9UaW1lciA9IHNldFRpbWVvdXQgKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaGFuZGxlUGFnZUNoYW5nZSAoKTsgXG4gICAgICAgIH0sIDY2Nik7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaGFuZGxlUGFnZUNoYW5nZSgpIHtcbiAgICAgICAgcmVtb3ZlRXZlbnRMaXN0ZW5lciAoJ0RPTU5vZGVJbnNlcnRlZCcsIHBhZ2VCaXRIYXNMb2FkZWQsIGZhbHNlKTtcbiAgICAgICAgY29uc3QgY2hhbm5lbHNBcmVWaXNpYmxlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignbGkuY2hhbm5lbCcpICE9PSBudWxsO1xuICAgICAgICBpZiAoY2hhbm5lbHNBcmVWaXNpYmxlKSB7XG4gICAgICAgICAgICBoaWRlU2xhY2tDaGFubmVscygpO1xuICAgICAgICB9XG4gICAgICAgIGJsb2NrSnVtcGluZ1RvQ2hhbm5lbCgpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGJsb2NrSnVtcGluZ1RvQ2hhbm5lbCgpIHtcbiAgICAgICAgLy8gc2VsZWN0IHRoZSB0YXJnZXQgbm9kZVxuICAgICAgICBjb25zdCB0YXJnZXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCd0cy1qdW1wZXInKTtcbiAgICAgICAgLy8gY3JlYXRlIGFuIG9ic2VydmVyIGluc3RhbmNlXG4gICAgICAgIGxldCBvYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKGZ1bmN0aW9uKG11dGF0aW9ucykge1xuICAgICAgICAgICAgaWYgKCF0YXJnZXQucXVlcnlTZWxlY3RvcignI3NsYWNrUHJvZHVjdGl2aXR5V2FybmluZ05vZGUnKSkge1xuICAgICAgICAgICAgICAgIHRhcmdldC5hcHBlbmRDaGlsZChnZXRXYXJuaW5nRGl2KCkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBhZGRKdW1wVG9DaGFubmVsQmxvY2tlcigpO1xuICAgICAgICB9KTtcbiAgICAgICAgIFxuICAgICAgICAvLyBjb25maWd1cmF0aW9uIG9mIHRoZSBvYnNlcnZlcjpcbiAgICAgICAgbGV0IGNvbmZpZyA9IHsgYXR0cmlidXRlczogdHJ1ZSwgY2hpbGRMaXN0OiB0cnVlLCBjaGFyYWN0ZXJEYXRhOiB0cnVlIH07XG4gICAgICAgICBcbiAgICAgICAgLy8gcGFzcyBpbiB0aGUgdGFyZ2V0IG5vZGUsIGFzIHdlbGwgYXMgdGhlIG9ic2VydmVyIG9wdGlvbnNcbiAgICAgICAgb2JzZXJ2ZXIub2JzZXJ2ZSh0YXJnZXQsIGNvbmZpZyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYWRkSnVtcFRvQ2hhbm5lbEJsb2NrZXIoKSB7XG4gICAgICAgIGlmICghanVtcFRvQ2hhbm5lbEJsb2NrZWQpIHtcbiAgICAgICAgICAgIGNvbnN0IGp1bXBUb0lucHV0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignW2RhdGEtcWE9XCJqdW1wZXJfaW5wdXRcIl0nKTtcblxuICAgICAgICAgICAganVtcFRvSW5wdXQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgRU5URVJfS0VZID0gMTM7XG4gICAgICAgICAgICAgICAgaWYgKGUua2V5Q29kZSA9PT0gRU5URVJfS0VZKSB7XG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZUNoYW5uZWxDaGFuZ2UoanVtcFRvSW5wdXQudmFsdWUsIGUpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHNob3dXaGl0ZWxpc3RlZENoYW5uZWxXYXJuaW5nKGp1bXBUb0lucHV0LnZhbHVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGp1bXBUb0NoYW5uZWxCbG9ja2VkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldFdhcm5pbmdEaXYoKXtcbiAgICAgICAgbGV0IHdhcm5pbmdOb2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIHdhcm5pbmdOb2RlLnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICdyZWQnO1xuICAgICAgICB3YXJuaW5nTm9kZS5zdHlsZS5jb2xvciA9ICd3aGl0ZSc7XG4gICAgICAgIHdhcm5pbmdOb2RlLnN0eWxlLmZvbnRTaXplID0gJzE2cHgnO1xuICAgICAgICB3YXJuaW5nTm9kZS5zdHlsZS50ZXh0QWxpZ24gPSAnY2VudGVyJztcbiAgICAgICAgd2FybmluZ05vZGUuaWQgPSAnc2xhY2tQcm9kdWN0aXZpdHlXYXJuaW5nTm9kZSc7XG4gICAgICAgIHdhcm5pbmdOb2RlLmlubmVyVGV4dCA9ICdIZXkgYnVkZHkgSVxcJ20gd2F0Y2hpbmcgeW91ISBJIHRob3VnaHQgeW91IHdlcmUgbWVhbnQgdG8gYmUgd29ya2luZzspJztcbiAgICAgICAgcmV0dXJuIHdhcm5pbmdOb2RlO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNob3dXaGl0ZWxpc3RlZENoYW5uZWxXYXJuaW5nKGNoYW5uZWxUaGVVc2VySXNUeXBpbmcpIHtcbiAgICAgICAgbGV0IHdhcm5pbmdOb2RlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3NsYWNrUHJvZHVjdGl2aXR5V2FybmluZ05vZGUnKTtcblxuICAgICAgICBpZiAoaXNUeXBpbmdBV2hpdGVMaXN0ZWRDaGFubmVsKGNoYW5uZWxUaGVVc2VySXNUeXBpbmcpKSB7XG4gICAgICAgICAgICB3YXJuaW5nTm9kZS5pbm5lclRleHQgPSAnUmlnaHQgb24gLSBJXFwnbSBoYXBweSBmb3IgeW91IHRvIHZpc2l0IHRoYXQgY2hhbm5lbCc7XG4gICAgICAgICAgICB3YXJuaW5nTm9kZS5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnZ3JlZW4nO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgd2FybmluZ05vZGUuaW5uZXJUZXh0ID0gJ0hleSBidWRkeSBJXFwnbSB3YXRjaGluZyB5b3UhIEkgZG9uXFwndCBsaWtlIHRoZSBsb29rIG9mIHRoYXQgY2hhbm5lbCBhdCBhbGwuIEkgdGhvdWdodCB5b3Ugd2VyZSBtZWFudCB0byBiZSB3b3JraW5nLic7XG4gICAgICAgICAgICB3YXJuaW5nTm9kZS5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAncmVkJztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGlzVHlwaW5nQVdoaXRlTGlzdGVkQ2hhbm5lbChjaGFubmVsVGhlVXNlcklzVHlwaW5nKSB7XG4gICAgICAgIHJldHVybiB3aGl0ZUxpc3RlZENoYW5uZWxzLnJlZHVjZShmdW5jdGlvbiAocHJldmlvdXMsIHdoaXRlTGlzdGVkQ2hhbm5lbCkge1xuICAgICAgICAgICByZXR1cm4gY2hhbm5lbFRoZVVzZXJJc1R5cGluZy5sZW5ndGggPj0gKHdoaXRlTGlzdGVkQ2hhbm5lbC5sZW5ndGggLyAyKSAmJlxuICAgICAgICAgICAgd2hpdGVMaXN0ZWRDaGFubmVsLmluZGV4T2YoY2hhbm5lbFRoZVVzZXJJc1R5cGluZykgPiAtMTsgXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGhpZGVTbGFja0NoYW5uZWxzKCkge1xuICAgICAgICBjb25zdCBjaGFubmVscyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ2xpLmNoYW5uZWwnKTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGFubmVscy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgcHJvY2Vzc0NoYW5uZWwoY2hhbm5lbHNbaV0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcHJvY2Vzc0NoYW5uZWwoY2hhbm5lbCkge1xuICAgICAgICBpZiAoY2hhbm5lbC5wYXJlbnROb2RlLmNsYXNzTmFtZS5pbmRleE9mKCdzbGFja0NoYW5uZWxCbG9ja2VyJykgPT09IC0xKSB7XG4gICAgICAgICAgICBsZXQgd3JhcHBlckRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXG4gICAgICAgICAgICB3cmFwcGVyRGl2LmNsYXNzTmFtZSA9ICdzbGFja0NoYW5uZWxCbG9ja2VyJztcbiAgICAgICAgICAgIHdyYXBwZXJEaXYuc3R5bGUubWFyZ2luID0gJzBweCc7XG4gICAgICAgICAgICB3cmFwcGVyRGl2LnN0eWxlLnBhZGRpbmcgPSAnMHB4JztcbiAgICAgICAgICAgIHdyYXBwZXJEaXYuc3R5bGUuYm9yZGVyID0gJ25vbmUnO1xuXG4gICAgICAgICAgICB3cmFwcGVyRGl2LmlubmVySFRNTCA9IGNoYW5uZWwub3V0ZXJIVE1MO1xuICAgICAgICAgICAgY2hhbm5lbC5wYXJlbnRFbGVtZW50LmFwcGVuZENoaWxkKHdyYXBwZXJEaXYpO1xuICAgICAgICAgICAgY2hhbm5lbC5yZW1vdmUoKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgd3JhcHBlckRpdi5xdWVyeVNlbGVjdG9yKCdhJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoYW5kbGVDaGFubmVsQ2xpY2spO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaGFuZGxlQ2hhbm5lbENsaWNrKGUpIHtcbiAgICAgICAgY29uc3QgY2hhbm5lbE5hbWUgPSBlLnRhcmdldC5pbm5lclRleHQudHJpbSgpO1xuICAgICAgICBoYW5kbGVDaGFubmVsQ2hhbmdlKGNoYW5uZWxOYW1lLCBlKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBoYW5kbGVDaGFubmVsQ2hhbmdlKGNoYW5uZWxOYW1lLCBlKSB7XG4gICAgICAgIGNvbnN0IGlzQ2hhbm5lbFdoaXRlbGlzdGVkID0gaXNUeXBpbmdBV2hpdGVMaXN0ZWRDaGFubmVsKGNoYW5uZWxOYW1lKTtcblxuICAgICAgICBpZiAoIWlzQ2hhbm5lbFdoaXRlbGlzdGVkKSB7XG4gICAgICAgICAgICBpZiAoIWNvbmZpcm1GaXJzdFRpbWUoKSkge1xuICAgICAgICAgICAgICAgIGNhbmNlbENoYW5uZWxPcGVuKGUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoIWNvbmZpcm1TZWNvbmRUaW1lKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FuY2VsQ2hhbm5lbE9wZW4oZSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFjb25maXJtVGhpcmRUaW1lKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbmNlbENoYW5uZWxPcGVuKGUpOyBcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RSdWxlQnJlYWsgPSBuZXcgRGF0ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgeW91U3Vja0FsZXJ0KCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjb25maXJtRmlyc3RUaW1lKCkge1xuICAgICAgICBjb25zdCBtaW51dGVzU2luY2VMYXN0UnVsZUJyZWFrID0gKChuZXcgRGF0ZSgpIC0gbGFzdFJ1bGVCcmVhaykgLyAxMDAwIC8gNjApLnRvRml4ZWQoMik7XG5cbiAgICAgICAgcmV0dXJuIHdpbmRvdy5jb25maXJtKFxuYE9ZISBBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gZ2V0IG91dCBvZiBmbG93P1xuWW91XFwndmUgYmVlbiBnb29kIGZvciAke21pbnV0ZXNTaW5jZUxhc3RSdWxlQnJlYWt9IG1pbnV0ZXMuXG5BcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gYmVjb21lIHNpZ25pZmljYW50bHkgbGVzcyBhd2Vzb21lP1xuUHJlc3MgY2FuY2VsIHRvIGJhY2sgb3V0IG5vdy5gKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjb25maXJtU2Vjb25kVGltZSgpIHtcbiAgICAgICAgcmV0dXJuIHdpbmRvdy5jb25maXJtKCdBcmUgeW91IHJlYWxseSBzdXJlPyBDbGljayBPSyBpZiB5b3Ugd2FudCB0byBwcm9jcmFzdGluYXRlPycpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNvbmZpcm1UaGlyZFRpbWUoKSB7XG4gICAgICAgIHJldHVybiB3aW5kb3cuY29uZmlybSgnU2VyaW91c2x5Pz8/IEdhaCBvaywgSSBwcm9taXNlIHRoaXMgaXMgdGhlIGxhc3QgZGlhbG9nOyknKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB5b3VTdWNrQWxlcnQoKSB7XG4gICAgICAgIHdpbmRvdy5hbGVydCgnSGV5ISBZb3Ugc3VjayEnKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjYW5jZWxDaGFubmVsT3BlbihlKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBzdGFydEFwcFxuICAgIH07XG5cbn0pKCk7IiwiaW1wb3J0IHNsYWNrTGlzdGVuZXIgZnJvbSAnLi9hZGRIb29rVG9TbGFjay5qcyc7XG5cbihmdW5jdGlvbiAoKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG4gICAgc3RhcnRTbGFja1Byb2R1Y3Rpdml0eSgpO1xuXG4gICAgZnVuY3Rpb24gc3RhcnRTbGFja1Byb2R1Y3Rpdml0eSgpIHtcbiAgICAgICAgZ2V0V2hpdGVsaXN0ZWRDaGFubmVscygpLnRoZW4oZnVuY3Rpb24gKHdoaXRlTGlzdCkge1xuICAgICAgICAgICAgc2xhY2tMaXN0ZW5lci5zdGFydEFwcCh3aGl0ZUxpc3QpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRXaGl0ZWxpc3RlZENoYW5uZWxzKCkge1xuICAgICAgICBsZXQgcHJvbWlzZSA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHsgXG4gICAgICAgICAgICBjaHJvbWUuc3RvcmFnZS5zeW5jLmdldCgnc2xhY2tQcm9kdWN0aXZpdHlXaGl0ZUxpc3QnLCBmdW5jdGlvbiAod2hpdGVMaXN0RnJvbVN0b3JhZ2UpIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHdoaXRlTGlzdEZyb21TdG9yYWdlLnNsYWNrUHJvZHVjdGl2aXR5V2hpdGVMaXN0IHx8IFtdKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgfVxuXG59KSgpO1xuIl19
