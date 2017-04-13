# vue-touch-events
Enable tap / swipe events for VueJS 2.x

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

### Global config (optional)

```js
Vue.use(Vue2TouchEvents, {
    disableClick: false,
    tapTolerance: 10,
    swipeTolerance: 30,
})
```

* `disableClick` default `false`. Use touch event only, will not trigger click event.
    Set to `true` can resolve some touch pass-through issue.
* `tapTolerance` default `10`. The tolerance to ensure whether the tap event effective or not.
* `swipeTolerance` default `30`. The tolerance to ensure whether the swipe event effective or not.

If you don't want bind `click` event at same time, just set `disableClick` to `true`.

### Directives

#### Tap

You can bind `tap` event use `v-tap` directive. The value should be a callback function.

```html
<span v-tap="tapHandler">Tap Me</span>
```

#### swipe

Use `v-swipe` directive when you want bind a simple swipe event. The value should be a callback function, 
too. 

```html
<span v-swipe="swipeHandler">Swipe here</span>
```

And you can use modifier here if you want bind a specified direction of swipe event only.

```html
<span v-swipe.left="swipeLeftHandler">Swipe Left</span>
```

The first argument of the callback function is the swipe direction string, no matter there is a modifier or not.

```js
export default {
    methods: {
        swipeHandler (direction) {
            console.log(direction)  // May be left / right / top / bottom
        }
    }
}
```

## LICENSE

MIT License