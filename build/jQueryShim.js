'use strict';

var jQueryDeferred = require('jquery-deferred');

var jqueryFunction = function jqueryFunction(subject) {
    var events = subject.events || {};

    if (subject && subject === subject.window) return {
        0: subject,
        load: function load(handler) {
            return subject.addEventListener('load', handler, false);
        },
        bind: function bind(event, handler) {
            return subject.addEventListener(event, handler, false);
        },
        unbind: function unbind(event, handler) {
            return subject.removeEventListener(event, handler, false);
        }
    };

    return {
        0: subject,

        unbind: function unbind(event, handler) {
            var handlers = events[event] || [];

            if (handler) {
                var idx = handlers.indexOf(handler);
                if (idx !== -1) handlers.splice(idx, 1);
            } else handlers = [];

            events[event] = handlers;
            subject.events = events;
        },
        bind: function bind(event, handler) {
            var current = events[event] || [];
            events[event] = current.concat(handler);
            subject.events = events;
        },
        triggerHandler: function triggerHandler(event, args) {
            var _this = this;

            var handlers = events[event] || [];
            handlers.forEach(function (fn) {
                if (args && args[0] && args[0].type === undefined) {
                    args = [{
                        type: event
                    }].concat(args || []);
                } else {
                    args = args || [];
                }

                fn.apply(_this, args);
            });
        }
    };
};

var xhr = function xhr() {
    try {
        return new window.XMLHttpRequest();
    } catch (e) {}
};

var ajax = function ajax(options) {
    var request = xhr();
    request.onreadystatechange = function () {
        if (request.readyState !== 4) {
            return;
        }

        if (request.status === 200 && !request._hasError) {
            options.success && options.success(JSON.parse(request.responseText));
        } else {
            options.error && options.error(request);
        }
    };

    request.open(options.type, options.url);
    request.setRequestHeader('content-type', options.contentType);

    request.send(options.data.data && 'data=' + options.data.data);

    return {
        abort: function abort(reason) {
            return request.abort(reason);
        }
    };
};

function isObject(o) {
  return null != o && (typeof o === 'undefined' ? 'undefined' : _typeof(o)) === 'object' && Object.prototype.toString.call(o) === '[object Object]';
}

var param = function param(data) {
  if (!isObject(data)) {
    return data == null ? "" : data.toString();
  }

  var buffer = [];

  for (var name in data) {
    if (!data.hasOwnProperty(name)) {
      continue;
    }

    var value = data[name];

    buffer.push(encodeURIComponent(name) + "=" + encodeURIComponent(value == null ? "" : value));
  }

  var source = buffer.join("&").replace(/%20/g, "+");
  return source;
};

module.exports = jQueryDeferred.extend(jqueryFunction, jQueryDeferred, {
    defaultAjaxHeaders: null,
    ajax: ajax,
    inArray: function inArray(arr, item) {
        return arr.indexOf(item) !== -1;
    },
    trim: function trim(str) {
        return str && str.trim();
    },
    isEmptyObject: function isEmptyObject(obj) {
        return !obj || Object.keys(obj).length === 0;
    },
    makeArray: function makeArray(arr) {
        return [].slice.call(arr, 0);
    },
    param: param,
    support: {
        cors: function () {
            var xhrObj = xhr();
            return !!xhrObj && "withCredentials" in xhrObj;
        }()
    }
});
