/**
 * es5 badjs core
 */
(function() {
    // must es5+
    if (![].forEach || !window.__defineGetter__) {
        return;
    }

    // utils
    var isFunction = function(fn) {
            return typeof fn === 'function';
        },
        // aop 注入
        before = function(obj, props, hook) {
            props.split(/\s+/).forEach(function(prop) {
                var _fn = obj[prop];
                obj[prop] = function() {
                    var args = hook.apply(this, arguments) || arguments;
                    return _fn.apply(this, args);
                };
            });
        },
        // 监听修改属性
        modify = function(obj, props, modifier) {
            if (!obj.__defineSetter__) {
                return;
            }
            props.split(/\s+/).forEach(function(prop) {
                var value = obj[prop];
                // 如果属性已经存在
                if (prop in obj) {
                    obj[prop] = value = modifier.call(this, value);
                }
                obj.__defineSetter__(prop, function(_value) {
                    if (_value !== value) {
                        value = modifier.call(this, _value);
                    }
                });
                obj.__defineGetter__(prop, function() {
                    return value;
                });
            });
        };

    var timeoutkey, orgOnerror, 
        // 最早的时候没有BJ_REPORT,因此把这个时候的异常存起来
        reportPool = [], 
        report = function(e) {
            reportPool.push(e);
        };

    var onthrow = function(e) {
        if (!e._caught) {
            console && console.log(e);
            report(e);
            if (timeoutkey) {
                clearTimeout(timeoutkey);
            } else {
                orgOnerror = window.onerror;
                window.onerror = function() {};
            }
            timeoutkey = setTimeout(function() {
                window.onerror = orgOnerror;
                orgOnerror = null;
                timeoutkey = null;
            }, 50);
            // 设置标志，顶部的throw跳过
            e._caught = true;
        }
        throw e;
    };

    /**
     * 包装函数
     */
    function cat(fn) {
        // 防止多次包装
        if (!isFunction(fn) || fn.__try) {
            return fn;
        }
        // 保持一对一，要不然容易引起未知的问题
        // 例如: 两次ele.bind('', fn)再ele.unbind('')会有一个无法unbind
        if (fn.__tryer) {
            return fn.__tryer;
        }
        var _fn = function() {
            try {
                return fn.apply(this, arguments);
            } catch (e) {
                onthrow(e);
            }
        };
        fn.__tryer = _fn;
        _fn.__try = fn;
        _fn.__proto__ = fn;
        // _fn.__tryer -> fn -> fn.__tryer -> _fn, so set it undefined
        _fn.__tryer = undefined;
        return _fn;
    }

    /**
     * 包装参数中的函数
     */
    function catArgs() {
        return [].slice.call(arguments).map(function(fn) {
            return isFunction(fn) ? cat(fn) : fn;
        });
    }

    /**
     * 从被包装的参数中提取出原始参数
     */
    function uncatArgs() {
        return [].slice.call(arguments).map(function(fn) {
            return isFunction(fn) && fn.__tryer ? fn.__tryer : fn;
        });
    }

    /**
     * 将catArgs, uncatArgs运用到函数上 
     */
    function funArgsFilter(filter) {
        return function(fn) {
            // 保证不重复包装
            if (!isFunction(fn) || fn.__filting) {
                return fn;
            }
            var _fn = function() {
                var args = filter.apply(this, arguments);
                return fn.apply(this, args);
            };
            _fn.__filting = fn;
            _fn.__proto__ = fn;
            return _fn;
        };
    }

    before(XMLHttpRequest.prototype, 'send', function() {
        if (this.onreadystatechange) {
            this.onreadystatechange = cat(this.onreadystatechange);
        }
    });

    if (window.WebSocket) {
        before(WebSocket.prototype, 'send', function() {
            var self = this;
            ['onmessage', 'onclose', 'onerror'].forEach(function(name) {
                if (self[name]) {
                    self[name] = cat(self[name]);
                }
            });
        });
    }

    before(window, 'setTimeout setInterval', catArgs);

    // 打包后define require有时候会被封在函数里，可以手动暴露到window上
    // var define; 不可使用var定义, 会清除__defineGetter__
    modify(window, 'define require', funArgsFilter(catArgs));

    modify(window, 'Jquery Zepto', function($) {
        if ($ && $.fn) {
            modify($.fn, 'on bind', funArgsFilter(catArgs));
            modify($.fn, 'off unbind', funArgsFilter(uncatArgs));
        }
        return $;
    });

    modify(window, 'BJ_REPORT', function(o) {
        if (o && o.report) {
            // BJ_REPORT 到位了
            report = function() {
                o.report.apply(o, arguments);
            };
            // 上报之前收集的错误异常
            reportPool.forEach(function(item) {
                o.report(item);
            });
        }
        return o;
    });

    // 手动接口
    window.cat = cat;

})();

