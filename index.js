/**
 *
 * @author    Jerry Bendy
 * @since     4/12/2017
 */

function touchX(event) {
    return event.touches[0].clientX;
}

function touchY(event) {
    return event.touches[0].clientY;
}

var isPassiveSupported = (function() {
    var supportsPassive = false;
    try {
        var opts = Object.defineProperty({}, 'passive', {
            get: function() {
                supportsPassive = true;
            }
        });
        window.addEventListener('test', null, opts);
    } catch (e) {}
    return supportsPassive;
})()


var vueTouchEvents = {
    install: function (Vue, options) {

        // Set default options
        options = Object.assign({}, {
            disableClick: false,
            tapTolerance: 10,
            swipeTolerance: 30,
            longTapTimeInterval: 400,
            touchClass: ''
        }, options || {})


        function touchStartEvent(event) {
            var $this = this.$$touchObj

            $this.supportTouch = true

            if ($this.touchStarted) {
                return
            }

            addTouchClass(this)

            $this.touchStarted = true

            $this.touchMoved = false
            $this.swipeOutBounded = false

            $this.startX = touchX(event)
            $this.startY = touchY(event)

            $this.currentX = 0
            $this.currentY = 0

            $this.touchStartTime = event.timeStamp

            triggerEvent(event, this, 'start')
        }

        function touchMoveEvent(event) {
            var $this = this.$$touchObj

            $this.currentX = touchX(event)
            $this.currentY = touchY(event)

            if (!$this.touchMoved) {
                var tapTolerance = options.tapTolerance

                $this.touchMoved = Math.abs($this.startX - $this.currentX) > tapTolerance ||
                    Math.abs($this.startY - $this.currentY) > tapTolerance

                if($this.touchMoved){
					triggerEvent(event, this, 'moved')
                }

            } else if (!$this.swipeOutBounded) {
                var swipeOutBounded = options.swipeTolerance

                $this.swipeOutBounded = Math.abs($this.startX - $this.currentX) > swipeOutBounded &&
                    Math.abs($this.startY - $this.currentY) > swipeOutBounded
            }

			if($this.touchMoved){
				triggerEvent(event, this, 'moving')
			}
        }

        function touchCancelEvent() {
            var $this = this.$$touchObj

            removeTouchClass(this)

            $this.touchStarted = $this.touchMoved = false
            $this.startX = $this.startY = 0
        }

        function touchEndEvent(event) {
            var $this = this.$$touchObj

            $this.touchStarted = false

            removeTouchClass(this)

            if (!$this.touchMoved) {
                // detect if this is a longTap event or not
                if ($this.callbacks.longtap && event.timeStamp - $this.touchStartTime > options.longTapTimeInterval) {
                    event.preventDefault()
                    triggerEvent(event, this, 'longtap')

                } else {
                    // emit tap event
                    triggerEvent(event, this, 'tap')
                }
                triggerEvent(event, this, 'end')

            } else if (!$this.swipeOutBounded) {
                var swipeOutBounded = options.swipeTolerance, direction

                if (Math.abs($this.startX - $this.currentX) < swipeOutBounded) {
                    direction = $this.startY > $this.currentY ? "top" : "bottom"

                } else {
                    direction = $this.startX > $this.currentX ? "left" : "right"
                }

                // Only emit the specified event when it has modifiers
                if ($this.callbacks['swipe.' + direction]) {
                    triggerEvent(event, this, 'swipe.' + direction, direction)

                } else {
                    // Emit a common event when it has no any modifier
                    triggerEvent(event, this, 'swipe', direction)
                }
            }
        }

        function clickEvent(event) {
            var $this = this.$$touchObj

            if (!$this.supportTouch && !options.disableClick) {
                triggerEvent(event, this, 'tap')
            }
        }

        function mouseDownEvent(event) {
        	var $this = this.$$touchObj

			if (!$this.supportTouch && !options.disableClick) {
                triggerEvent(event, this, 'start')
			}
        }

        function mouseUpEvent(event) {
            var $this = this.$$touchObj

			if (!$this.supportTouch && !options.disableClick) {
                triggerEvent(event, this, 'end')
			}
        }

        function mouseEnterEvent() {
            addTouchClass(this)
        }

        function mouseLeaveEvent() {
            removeTouchClass(this)
        }

        function triggerEvent(e, $el, eventType, param) {
            var $this = $el.$$touchObj

            // get the callback list
            var callbacks = $this.callbacks[eventType] || []
            if (callbacks.length === 0) {
                return null
            }

            for (var i = 0; i < callbacks.length; i++) {
                var binding = callbacks[i]

                if (binding.modifiers.stop) {
                    e.stopPropagation();
                }

                if (binding.modifiers.prevent) {
                    e.preventDefault();
                }

                // handle `self` modifier`
                if (binding.modifiers.self && e.target !== e.currentTarget) {
                    continue
                }

                if (typeof binding.value === 'function') {
                    if (param) {
                        binding.value(param, e)
                    } else {
                        binding.value(e)
                    }
                }
            }
        }

        function addTouchClass($el) {
            var className = $el.$$touchClass || options.touchClass
            className && $el.classList.add(className)
        }

        function removeTouchClass($el) {
            var className = $el.$$touchClass || options.touchClass
            className && $el.classList.remove(className)
        }

        Vue.directive('touch', {
            bind: function ($el, binding) {

                $el.$$touchObj = $el.$$touchObj || {
                        // will change to true when `touchstart` event first trigger
                        supportTouch: false,
                        // an object contains all callbacks registered,
                        // key is event name, value is an array
                        callbacks: {},
                        // prevent bind twice, set to true when event bound
                        hasBindTouchEvents: false
                    }


                // register callback
                var eventType = binding.arg || 'tap'
                switch (eventType) {
                    case 'swipe':
                        var _m = binding.modifiers
                        if (_m.left || _m.right || _m.top || _m.bottom) {
                            for (var i in binding.modifiers) {
                                if (['left', 'right', 'top', 'bottom'].indexOf(i) >= 0) {
                                    var _e = 'swipe.' + i
                                    $el.$$touchObj.callbacks[_e] = $el.$$touchObj.callbacks[_e] || []
                                    $el.$$touchObj.callbacks[_e].push(binding)
                                }
                            }
                        } else {
                            $el.$$touchObj.callbacks.swipe = $el.$$touchObj.callbacks.swipe || []
                            $el.$$touchObj.callbacks.swipe.push(binding)
                        }
                        break

                    default:
                        $el.$$touchObj.callbacks[eventType] = $el.$$touchObj.callbacks[eventType] || []
                        $el.$$touchObj.callbacks[eventType].push(binding)
                }

                // prevent bind twice
                if ($el.$$touchObj.hasBindTouchEvents) {
                    return
                }

                var passiveOpt = isPassiveSupported ? { passive: true } : false;
                $el.addEventListener('touchstart', touchStartEvent, passiveOpt)
                $el.addEventListener('touchmove', touchMoveEvent, passiveOpt)
                $el.addEventListener('touchcancel', touchCancelEvent)
                $el.addEventListener('touchend', touchEndEvent)

                if (!options.disableClick) {
                    $el.addEventListener('click', clickEvent)
                    $el.addEventListener('mousedown', mouseDownEvent)
                    $el.addEventListener('mouseup', mouseUpEvent)
                    $el.addEventListener('mouseenter', mouseEnterEvent)
                    $el.addEventListener('mouseleave', mouseLeaveEvent)
                }

                // set bind mark to true
                $el.$$touchObj.hasBindTouchEvents = true
            },

            unbind: function ($el) {
                $el.removeEventListener('touchstart', touchStartEvent)
                $el.removeEventListener('touchmove', touchMoveEvent)
                $el.removeEventListener('touchcancel', touchCancelEvent)
                $el.removeEventListener('touchend', touchEndEvent)

                if (!options.disableClick) {
                    $el.removeEventListener('click', clickEvent)
                    $el.removeEventListener('mousedown', mouseDownEvent)
                    $el.removeEventListener('mouseup', mouseUpEvent)
                    $el.removeEventListener('mouseenter', mouseEnterEvent)
                    $el.removeEventListener('mouseleave', mouseLeaveEvent)
                }

                // remove vars
                delete $el.$$touchObj
            }
        })

        Vue.directive('touch-class', {
            bind: function ($el, binding) {
                $el.$$touchClass = binding.value
            },
            unbind: function ($el) {
                delete $el.$$touchClass
            }
        })
    }
}


/*
 * Exports
 */
if (typeof module === 'object') {
    module.exports = vueTouchEvents

} else if (typeof define === 'function' && define.amd) {
    define([], function () {
        return vueTouchEvents
    })
} else if (window.Vue) {
    window.vueTouchEvents = vueTouchEvents
    Vue.use(vueTouchEvents)
}
