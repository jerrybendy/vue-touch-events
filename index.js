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


        var touchStartEvent = function (event) {
                var $this = this.$$touchObj

                $this.supportTouch = true

                if ($this.touchStarted) {
                    return
                }

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

                $this.touchStarted = $this.touchMoved = false
                $this.startX = $this.startY = 0
            },
            touchEndEvent = function () {
                var $this = this.$$touchObj,
                    binding = this.$$binding

                $this.touchStarted = false

                if (!$this.touchMoved) {
                    // emit tap event
                    if (binding.name === 'tap' && typeof binding.value === 'function') {
                        binding.value(event)
                    }

                } else if (!$this.swipeOutBounded) {
                    if (binding.name === 'swipe' && typeof binding.value === 'function') {
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
                                binding.value(direction, event)
                            }

                        } else {
                            // Emit a common event when it has no any modifier
                            binding.value(direction, event)
                        }
                    }
                }
            },
            clickEvent = function (event) {
                var $this = this.$$touchObj,
                    binding = this.$$binding

                if (!$this.supportTouch && !options.disableClick && binding.name === 'tap' && typeof binding.value === 'function') {
                    binding.value(event)
                }
            }


        function bindEvents($el, binding) {
            $el.$$touchObj = {
                supportTouch: false,  // will change to true when `touchstart` event first trigger
            }
            $el.$$binding = binding

            $el.addEventListener('touchstart', touchStartEvent)
            $el.addEventListener('touchmove', touchMoveEvent)
            $el.addEventListener('touchcancel', touchCancelEvent)
            $el.addEventListener('touchend', touchEndEvent)

            if (!options.disableClick) {
                $el.addEventListener('click', clickEvent)
            }
        }

        function unbindEvents($el) {
            $el.removeEventListener('touchstart', touchStartEvent)
            $el.removeEventListener('touchmove', touchMoveEvent)
            $el.removeEventListener('touchcancel', touchCancelEvent)
            $el.removeEventListener('touchend', touchEndEvent)

            if (!options.disableClick) {
                $el.removeEventListener('click', clickEvent)
            }
        }


        Vue.directive('tap', {
            bind: function ($el, binding) {
                bindEvents($el, binding)
            },

            unbind: function ($el) {
                unbindEvents($el)
            }
        })

        Vue.directive('swipe', {
            bind: function ($el, binding) {
                bindEvents($el, binding)
            },

            unbind: function ($el) {
                unbindEvents($el)
            }
        })
    }
}


/*
 * Exports
 */
module.exports = vueTouchEvents
