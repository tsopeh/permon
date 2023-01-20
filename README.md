# permon

A batteries-included **per**formance **mon**itor for web apps. Checkout the [Features](#features) section for the detailed overview.

## Quick Start

### Bookmarklet

You can quickly test `permon` on **any** webpage by copying the following `code` and pasting in the browser's address bar. It's important that the pasted line **starts with** `javscript:`. Some browsers automatically remove this text (on paste) as a security measure, and you have to type it by yourself.

```javascript
javascript:(function(){var e=document.createElement("script");e.onload=function(){new permon.Permon({onPublishStats:e=>{console.table(e)}})},e.src="//tsopeh.github.io/permon/dist/permon.iife.js",document.head.appendChild(e)})();
```

## Installation

## Features

## Configuration

## Contribute