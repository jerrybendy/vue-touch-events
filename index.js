/**
 *
 * @author    Jerry Bendy
 * @since     4/12/2017
 */

function touchX(event) {
    return event.touches [0].clientX;
}

function touchY(event) {
    return event.touches [0].clientY;
}


var vueTouchEvents = {
    install: function (Vue, options) {

        // Set default options
        options = options || {}
        options.disableClick = options.disableClick || false
        options.tapTolerance = options.tapTolerance || 10
        options.swipeTolerance = options.swipeTolerance || 30
        options.touchClass = options.touchClass || ''


        var touchStartEvent = function (event) {
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
            },
            touchMoveEvent = function (event) {
                var $this = this.$$touchObj

                $this.currentX = touchX(event)
                $this.currentY = touchY(event)

                if (!$this.touchMoved) {
                    var tapTolerance = options.tapTolerance

                    $this.touchMoved = Math.abs($this.startX - $this.currentX) > tapTolerance ||
                        Math.abs($this.startY - $this.currentY) > tapTolerance

                } else if (!$this.swipeOutBounded) {
                    var swipeOutBounded = options.swipeTolerance

                    $this.swipeOutBounded = Math.abs($this.startX - $this.currentX) > swipeOutBounded &&
                        Math.abs($this.startY - $this.currentY) > swipeOutBounded
                }
            },
            touchCancelEvent = function () {
                var $this = this.$$touchObj

                removeTouchClass(this)

                $this.touchStarted = $this.touchMoved = false
                $this.startX = $this.startY = 0
            },
            touchEndEvent = function () {
                var $this = this.$$touchObj,
                    binding = this.$$binding

                $this.touchStarted = false

                removeTouchClass(this)

                if (!$this.touchMoved) {
                    // emit tap event
                    if (binding.arg === 'tap') {
                        triggerEvent(event, binding)
                    }

                } else if (!$this.swipeOutBounded) {
                    if (binding.arg === 'swipe') {
                        var swipeOutBounded = options.swipeTolerance, direction

                        if (Math.abs($this.startX - $this.currentX) < swipeOutBounded) {
                            direction = $this.startY > $this.currentY ? "top" : "bottom"

                        } else {
                            direction = $this.startX > $this.currentX ? "left" : "right"
                        }

                        var modifiers = binding.modifiers
                        // Only emit the specified event when it has modifiers
                        if (modifiers.left || modifiers.right || modifiers.top || modifiers.bottom) {
                            if (modifiers [direction]) {
                                triggerEvent(event, binding, direction)
                            }

                        } else {
                            // Emit a common event when it has no any modifier
                            triggerEvent(event, binding, direction)
                        }
                    }
                }
            },
            clickEvent = function (event) {
                var $this = this.$$touchObj,
                    binding = this.$$binding

                if (!$this.supportTouch &&
                    !options.disableClick &&
                    binding.arg === 'tap' &&
                    typeof binding.value === 'function'
                ) {
                    triggerEvent(event, binding)
                }
            },
            mouseEnterEvent = function () {
                addTouchClass(this)
            },
            mouseLeaveEvent = function () {
                removeTouchClass(this)
            },
            triggerEvent = function (event, binding, param) {

                // handle `self` modifier`
                if (binding.modifiers.self && event.target !== event.currentTarget) {
                    return null
                }

                if (typeof binding.value === 'function') {
                    if (param) {
                        binding.value(param, event)
                    } else {
                        binding.value(event)
                    }
                }
            },
            addTouchClass = function ($el) {
                var className = $el.$$touchClass || options.touchClass
                $el.classList.add(className)
            },
            removeTouchClass = function ($el) {
                var className = $el.$$touchClass || options.touchClass
                $el.classList.remove(className)
            }


        Vue.directive('touch', {
            bind: function ($el, binding) {
                $el.$$touchObj = {
                    // will change to true when `touchstart` event first trigger
                    supportTouch: false
                }
                $el.$$binding = binding

                // parse the arg argument, default is `tap`
                $el.$$binding.arg = binding.arg ? binding.arg : 'tap'


                $el.addEventListener('touchstart', touchStartEvent)
                $el.addEventListener('touchmove', touchMoveEvent)
                $el.addEventListener('touchcancel', touchCancelEvent)
                $el.addEventListener('touchend', touchEndEvent)

                if (!options.disableClick) {
                    $el.addEventListener('click', clickEvent)
                    $el.addEventListener('mouseenter', mouseEnterEvent)
                    $el.addEventListener('mouseleave', mouseLeaveEvent)
                }
            },

            unbind: function ($el) {
                $el.removeEventListener('touchstart', touchStartEvent)
                $el.removeEventListener('touchmove', touchMoveEvent)
                $el.removeEventListener('touchcancel', touchCancelEvent)
                $el.removeEventListener('touchend', touchEndEvent)

                if (!options.disableClick) {
                    $el.removeEventListener('click', clickEvent)
                    $el.removeEventListener('mouseenter', mouseEnterEvent)
                    $el.removeEventListener('mouseleave', mouseLeaveEvent)
                }
            }
        })

        Vue.directive('touch-class', {
            bind: function ($el, binding) {
                $el.$$touchClass = binding.value
            }
        })
    }
}


/*
 * Exports
 */
module.exports = vueTouchEvents
