# badjs-es5

---

借助`es5`的`__defineGetter__`, `setTimeout`等监控badjs, 简化badjs的监控

# Dependencies

- [badjs-report](http://lego.imweb.io/package/badjs-report)

## Install

```
$ lego install badjs-report
$ lego install badjs-es5
```

## Usage

```js
// fis-conf.js
fis.hook('lego')
    .match('/lego_modules/badjs-es5/**.js', {
        isMod: false
    })
```

```js
// main.js
/*
 * @require 'badjs-es5'
 */
require('badjs-report').init({
    id: 1,
    onReport: function() {
        // monitor
        monitor(0000);
    }
});
// 请勿 BJ_REPORT.tryJs().spyAll()
```

# Supported browser

- IE 11+
- WebKit

# 已自动切入点

- setTimeout, setInterval
- Jquery/Zepto 事件
- Ajax onreadystatechange
- define require
- WebSocket onmessage/onclose/onerror

# 需手动切入点

- new Image().onload etc..

# 常见问题

- define require 需暴露到window上来, 如果core.js在requirejs之前，则不可用var require定义require

