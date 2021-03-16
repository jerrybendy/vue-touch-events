# vue-touch-events  [![](https://img.shields.io/npm/v/vue2-touch-events.svg)](https://www.npmjs.com/package/vue2-touch-events)

Enable tap / swipe / touch hold events for vue.js 2.x

Features:

* Common touch events, such as `tap`, `swipe`, `touchhold` ([more](#Bindings))
* All events support mouse and touch screen at same time
* Optimized touch effects with `touchClass` option and `v-touch-class` directive
* Binding multiple touch events on one DOM element
* Customizable events with native-likely events handler
* Allow splitting configurations for different DOM elements by `v-touch-options` directive
* Directive names can be customized to avoid namespace conflict

**This is for **vue.js 2.x** only**

## Install

To install with npm or yarn, use

```shell
npm i -S vue2-touch-events

// or

yarn add vue2-touch-events
```

## Usage

```js
import Vue from 'vue'
import Vue2TouchEvents from 'vue2-touch-events'

Vue.use(Vue2TouchEvents)
```

In your `.vue` file:

```html
<!-- bind a tap event -->
<span v-touch:tap="touchHandler">Tap Me</span>

<!-- tap is the default event, you can omit it -->
<span v-touch="touchHandler">Tap Me</span>

<!-- bind the swipe event, no matter direction -->
<span v-touch:swipe="swipeHandler">Swipe Here</span>

<!-- only when swipe left can trigger the callback -->
<span v-touch:swipe.left="swipeHandler">Swipe Here</span>

<!-- bind a long tap event -->
<span v-touch:longtap="longtapHandler">Long Tap Event</span>

<!-- bind a start and end event -->
<span v-touch:start="startHandler" v-touch:end="endHandler">Down,start/Up,end Event</span>

<!-- bind a move and moving event -->
<span v-touch:moved="movedHandler">Triggered once when starting to move and tapTolerance is exceeded</span>
<span v-touch:moving="movingHandler">Continuously triggering Event</span>

<!-- touch and hold -->
<span v-touch:touchhold="touchHoldHandler">Touch and hold on the screen for a while</span>

<!-- you can even mix multiple events -->
<span v-touch:tap="tapHandler"
    v-touch:longtap="longtapHandler"
    v-touch:swipe.left="swipeLeftHandler"
    v-touch:start="startHandler" 
    v-touch:end="endHandler"
    v-touch:swipe.right="swipeRightHandler">Mix Multiple Events</span>

<!-- using different options for specified element -->
<span v-touch:tap="tapHandler"
    v-touch-options="{touchClass: 'active', swipeTolerance: 80, touchHoldTolerance: 300}">Different options</span>

<!-- customize touch effects by CSS class -->
<span v-touch:tap="tapHandler" v-touch-class="active">Customize touch class</span>
<!-- or -->
<span v-touch:tap="tapHandler" v-touch-options="{touchClass: 'active'}">Customize touch class</span>
```

If you use vue and this plugin in UMD way (in a script tag) , this plugin is auto used. So it's not necessary to write `Vue.use(Vue2TouchEvents)`.

```html
<script src="path/to/vue.js"></script>
<script src="path/to/vue-touch-events.js"></script>
```

## APIs

### Global configuration (optional)

```js
Vue.use(Vue2TouchEvents, {
    disableClick: false,
    touchClass: '',
    tapTolerance: 10,
    touchHoldTolerance: 400,
    swipeTolerance: 30,
    longTapTimeInterval: 400,
    namespace: 'touch'
})
```

* `disableClick` default `false`. Use touch event only, will not trigger click event.
  
    You should keep this value default if you use your website on both mobile and PC.
  
    If your website uses on mobile only, it's a good choice to set this value to `true` to get a better user experience, and it can resolve some touch pass-through issue.

* `touchClass`  default: `''`. Add an extra CSS class when touch start, and remove it when touch end.
  
    This is a global config, and you can use `v-touch-class` directive to overwrite this setting in a single component.

* `tapTolerance` default `10`. The tolerance to ensure whether the tap event effective or not.

* `touchHoldTolerance` default `400` in millisecond. The timeout for a `touchhold` event.

* `swipeTolerance` default `30`. The tolerance to ensure whether the swipe event effective or not.

* `longTapTimeInterval` default `400` in millisecond. The minimum time interval to detect whether long tap event effective or not.

* `namespace` default `touch`(v3.2.0). Customize the directive names to avoid namespace conflict. By default, the `touch` means `v-touch` and `v-touch-class` are available, and you can use `v-click` and `v-click-class` by change `namespace` to `click`.

### Directives

#### v-touch

Bind the `v-touch` directive to components which you want to enable touch events.

`v-touch` accepts an argument to tell it which event you want to bind.

```html
<span v-touch:tap="tapHandler">Tap</span>
```

The first argument of the `v-swipe` callback is the direction of swipe event. It could be `left`, `right`, `top` or `bottom`.

`v-swipe` can accept extra modifiers. It means you can bind events only for specify direction.

```js
export default {
    methods: {
        swipeHandler (direction) {
            console.log(direction)  // May be left / right / top / bottom
        }
    }
}
```

### v-touch-options `(v2.2.0)`

`v-touch-options` directive allows you set a different configuration for a specified component. It will override global configurations.

#### v-touch-class

`v-touch-class` directive allows you set an extra class on your components. If you already have a global config `touchClass`, this value will **overwrite** it.

For example:

```html
<span v-touch:tap="touchHandler" v-touch-class="'active'">Tap Me</span>
```

Now, when you start to touch, it will add an extra `active` class automatically. And remove it when touch end.

If your setting of `disableClick` is `false` (it's default), it will bind `mouseenter` and `mouseleave` events, too.

So that you can use this feature to instead of `:active` and `:hover` pseudo class, for a better user experience.

```css
/* before */
span:active, span:hover {
  background: green;
}

/* now, you can write like this */
span.active {
  background: green;
}
```

### Bindings

#### v-touch:tap / v-touch

`tap` is the default event type of `v-touch`. It will be trigger when tap on the screen or click the mouse.

#### v-touch:swipe

`swipe` means touch on the screen and move in a direction. The direction could be `top`,`bottom`,`left` or `right`. 

#### v-touch:longtap

> `longtap` will be deprecated in next major version. Please use `touchhold` insead. If you still want to use this feature, please let me know.

`longtap` means touch on the screen and hold for a while. It will be triggered when you release your finger. (It's not normal when we use touch devices, so it's a good choice to use `touchhold` instaed)

#### v-touch:touchhold `(v2.1.0)`

`touchhold` will be triggered when touch on the screen and hold for `touchHoldTolerance` milliseconds. This will be triggered before your finger released, as what native APP does.

#### v-touch:start / v-touch:end / v-touch:moving

* `start` is same as `touchstart` or `mousedown`.
* `end` is same as `touchend` or `mouseup`.
* `moving` is same as `touchmovoe` or `mousemove`.

These three events are like native DOM events. You can use these events to custom behaviors which this library doesn't support yet.

### Modifiers

#### left, right, top, bottom

This four modifiers are for `v-touch:swipe` only, to specify which direction you want to bind events to.

#### self

Same as `v-on:click.self`, only trigger events when the event target is the `currentTarget`.

#### stop

Same as `v-on:click.stop`, stops event propagation.

#### prevent

Same as `v-on:click.prevent`, prevents default event handler from firing.

#### disablePassive `(v2.3.0)`

`{passive: true}` is set for touch event listeners if your browser supports `passive`. This is good for user experience. If this is not what you want, you can use `disablePassive` modifier to prevent this behavior.

## Others

### How to add extra parameters

As mentioned by [#3](https://github.com/jerrybendy/vue-touch-events/issues/3), if you want to add extra
parameters for `v-touch`, you can't do that like `v-on`. The hack is that you can let your method returns
a `function` and handle the extra parameters in the returned function.

```html
<div v-touch:swipe="myMethod('myOtherParam')">Swipe</div>
```

```js
export default {
  methods: {
    myMethod (param) {
      return function(direction, event) {
        console.log(direction, param);
        // do something ~
      }
    }
  }
}
```

### How to resolve conflict with vuetify
Upgrade to the latest version (>= v3.2.0), and use the `namespace` parameter. For example:

```js
import Vue2TouchEvents from 'vue2-touch-events'

Vue.use(Vue2TouchEvents, {
    namespace: 'my-touch'
})
```

## Change History

[Look at here](https://github.com/jerrybendy/vue-touch-events/releases)

## LICENSE

MIT License
