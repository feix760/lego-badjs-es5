# badjs-es5

借助`es5`的`__defineGetter__`, `setTimeout`等捕获badjs异常栈, 简化badjs的监控

## Author

[fishine](https://github.com/feix760/)

## Dependencies

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
// badjs-es5需要替换define,require函数所以不能被require包裹
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
// badjs-report需要将BJ_REPORT暴露到window上来, 通信接收捕获的异常
```

## Supported browser

- IE 11+
- WebKit

## 已自动切入点

- setTimeout, setInterval
- Jquery/Zepto 事件
- Ajax onreadystatechange
- define require
- WebSocket onmessage/onclose/onerror

## 需手动切入点

- new Image().onload 

## 常见问题

- define require 需暴露到window上来, 如果badjs-es5在requirejs之前，则不可用var require定义require

