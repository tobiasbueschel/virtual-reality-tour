'use scrict';

/*
 * Based on farbtastic 2.0.0-alpha.1
 * https://github.com/mattfarina/farbtastic
 *
 * Farbtastic was originally written by Steven Wittens and is licensed under the GPL.
 */
(function($) {
    var Farbtastic = function($container, callback, options) {
        var self = this;

        this.options = $.extend({
            width: 300,
            wheelWidth: (options.width || 300) / 10,
            color: '#808080'
        }, options);

        this.$container = $container;
        // Initialize.
        this.initWidget();

        // Set linked elements/callback
        this.callback = callback;

        this.setColor(this.options.color);

        this.mousemove = function(event) {
            Farbtastic.prototype.mousemove.call(self, event);
        };

        this.mouseup = function(event) {
            Farbtastic.prototype.mouseup.call(self, event);
        };

        this.mousedown = function(event) {
            Farbtastic.prototype.mousedown.call(self, event);
        };

        // Install mousedown handler (the others are set on the document on-demand)
        $('canvas.farbtastic-overlay', $container).bind('mousedown', this.mousedown);
    };

    Farbtastic.prototype.updateValue = function() {
        if (this.value && this.value !== this.color) {
            this.setColor(this.value);
        }
        return this;
    };

    /**
     * Change color with HTML syntax #123456
     */
    Farbtastic.prototype.setColor = function(color) {
        var unpacked = unpack(color);
        if (this.color !== color && unpacked) {
            this.color = color;
            this.rgb = unpacked;
            this.hsl = RGBToHSL(this.rgb);
            this.updateDisplay();
        }
        return this;
    };

    /**
     * Change color with HSL triplet [0..1, 0..1, 0..1]
     */
    Farbtastic.prototype.setHSL = function(hsl) {
        this.hsl = hsl;
        this.rgb = HSLToRGB(hsl);
        this.color = pack(this.rgb);
        this.updateDisplay();
        return this;
    };

    /////////////////////////////////////////////////////

    /**
     * Initialize the color picker widget.
     */
    Farbtastic.prototype.initWidget = function() {

        // Insert markup and size accordingly.
        var dim = {
            width: this.options.width,
            height: this.options.width
        };
        this.$container
                .html(
                        '<div class="farbtastic" style="position: relative">' +
                        '<div class="farbtastic-solid"></div>' +
                        '<canvas class="farbtastic-mask"></canvas>' +
                        '<canvas class="farbtastic-overlay"></canvas>' +
                        '</div>'
                        )
                .find('*').attr(dim).css(dim).end()
                .find('div>*').css('position', 'absolute');

        // Determine layout
        this.radius = (this.options.width - this.options.wheelWidth) / 2 - 1;
        this.square = Math.floor((this.radius - this.options.wheelWidth / 2) * 0.7) - 1;
        this.mid = Math.floor(this.options.width / 2);
        this.markerSize = this.options.wheelWidth * 0.3;
        this.solidFill = $('.farbtastic-solid', this.$container).css({
            width: this.square * 2 - 1,
            height: this.square * 2 - 1,
            left: this.mid - this.square,
            top: this.mid - this.square
        });

        // Set up drawing context.
        this.cnvMask = $('.farbtastic-mask', this.$container);
        this.ctxMask = this.cnvMask[0].getContext('2d');
        this.cnvOverlay = $('.farbtastic-overlay', this.$container);
        this.ctxOverlay = this.cnvOverlay[0].getContext('2d');
        this.ctxMask.translate(this.mid, this.mid);
        this.ctxOverlay.translate(this.mid, this.mid);

        // Draw widget base layers.
        this.drawCircle();
        this.drawMask();

        return this;
    };

    /**
     * Draw the color wheel.
     */
    Farbtastic.prototype.drawCircle = function() {
        var tm = +(new Date());
        // Draw a hue circle with a bunch of gradient-stroked beziers.
        // Have to use beziers, as gradient-stroked arcs don't work.
        var n = 24,
                r = this.radius,
                w = this.options.wheelWidth,
                nudge = 8 / r / n * Math.PI, // Fudge factor for seams.
                m = this.ctxMask,
                angle1 = 0, color1, d1;
        m.save();
        m.lineWidth = w / r;
        m.scale(r, r);
        // Each segment goes from angle1 to angle2.
        for (var i = 0; i <= n; ++i) {
            var d2 = i / n,
                    angle2 = d2 * Math.PI * 2,
                    // Endpoints
                    x1 = Math.sin(angle1), y1 = -Math.cos(angle1);
            x2 = Math.sin(angle2), y2 = -Math.cos(angle2),
                    // Midpoint chosen so that the endpoints are tangent to the circle.
                    am = (angle1 + angle2) / 2,
                    tan = 1 / Math.cos((angle2 - angle1) / 2),
                    xm = Math.sin(am) * tan, ym = -Math.cos(am) * tan,
                    // New color
                    color2 = pack(HSLToRGB([d2, 1, 0.5]));
            if (i > 0) {
                var grad = m.createLinearGradient(x1, y1, x2, y2);
                grad.addColorStop(0, color1);
                grad.addColorStop(1, color2);
                m.strokeStyle = grad;
                // Draw quadratic curve segment.
                m.beginPath();
                m.moveTo(x1, y1);
                m.quadraticCurveTo(xm, ym, x2, y2);
                m.stroke();
            }
            // Prevent seams where curves join.
            angle1 = angle2 - nudge;
            color1 = color2;
            d1 = d2;
        }
        m.restore();
        return this;
    };

    /**
     * Draw the saturation/luminance mask.
     */
    Farbtastic.prototype.drawMask = function() {
        // Iterate over sat/lum space and calculate appropriate mask pixel values.
        var size = this.square * 2, sq = this.square;
        function calculateMask(sizex, sizey, outputPixel) {
            var isx = 1 / sizex, isy = 1 / sizey;
            for (var y = 0; y <= sizey; ++y) {
                var l = 1 - y * isy;
                for (var x = 0; x <= sizex; ++x) {
                    var s = 1 - x * isx;
                    // From sat/lum to alpha and color (grayscale)
                    var a = 1 - 2 * Math.min(l * s, (1 - l) * s);
                    var c = (a > 0) ? ((2 * l - 1 + a) * .5 / a) : 0;
                    outputPixel(x, y, c, a);
                }
            }
        }

        // Method #1: direct pixel access (new Canvas).
        if (this.ctxMask.getImageData) {
            // Create half-resolution buffer.
            var sz = Math.floor(size / 2);
            var buffer = document.createElement('canvas');
            buffer.width = buffer.height = sz + 1;
            var ctx = buffer.getContext('2d');
            var frame = ctx.getImageData(0, 0, sz + 1, sz + 1);

            var i = 0;
            calculateMask(sz, sz, function(x, y, c, a) {
                frame.data[i++] = frame.data[i++] = frame.data[i++] = c * 255;
                frame.data[i++] = a * 255;
            });

            ctx.putImageData(frame, 0, 0);
            this.ctxMask.drawImage(buffer, 0, 0, sz + 1, sz + 1, -sq, -sq, sq * 2, sq * 2);
        }
        // Method #2: vertical DXImageTransform gradient strips (IE).
        else {
            var cache_last, cache, w = 6; // Each strip is 6 pixels wide.
            var sizex = Math.floor(size / w);
            // 6 vertical pieces of gradient per strip.
            calculateMask(sizex, 6, function(x, y, c, a) {
                if (x === 0) {
                    cache_last = cache;
                    cache = [];
                }
                c = Math.round(c * 255);
                a = Math.round(a * 255);
                // We can only start outputting gradients once we have two rows of pixels.
                if (y > 0) {
                    var c_last = cache_last[x][0],
                            a_last = cache_last[x][1],
                            color1 = packDx(c_last, a_last),
                            color2 = packDx(c, a),
                            y1 = Math.round(this.mid + ((y - 1) * .333 - 1) * sq),
                            y2 = Math.round(this.mid + (y * .333 - 1) * sq);
                    $('<div>').css({
                        position: 'absolute',
                        filter: "progid:DXImageTransform.Microsoft.Gradient(StartColorStr=" + color1 + ", EndColorStr=" + color2 + ", GradientType=0)",
                        top: y1,
                        height: y2 - y1,
                        // Avoid right-edge sticking out.
                        left: this.mid + (x * w - sq - 1),
                        width: w - (x === sizex ? Math.round(w / 2) : 0)
                    }).appendTo(this.cnvMask);
                }
                cache.push([c, a]);
            });
        }
        return this;
    };

    /**
     * Draw the selection markers.
     */
    Farbtastic.prototype.drawMarkers = function() {
        // Determine marker dimensions
        var sz = this.options.width, lw = Math.ceil(this.markerSize / 4), r = this.markerSize - lw + 1;
        var angle = this.hsl[0] * 6.28,
                x1 = Math.sin(angle) * this.radius,
                y1 = -Math.cos(angle) * this.radius,
                x2 = 2 * this.square * (.5 - this.hsl[1]),
                y2 = 2 * this.square * (.5 - this.hsl[2]),
                c1 = this.invert ? '#fff' : '#000',
                c2 = this.invert ? '#000' : '#fff';
        var circles = [
            {x: x1, y: y1, r: r, c: '#000', lw: lw + 1},
            {x: x1, y: y1, r: this.markerSize, c: '#fff', lw: lw},
            {x: x2, y: y2, r: r, c: c2, lw: lw + 1},
            {x: x2, y: y2, r: this.markerSize, c: c1, lw: lw},
        ];

        // Update the overlay canvas.
        this.ctxOverlay.clearRect(-this.mid, -this.mid, sz, sz);
        for (var i = 0; i < circles.length; i++) {
            var c = circles[i];
            this.ctxOverlay.lineWidth = c.lw;
            this.ctxOverlay.strokeStyle = c.c;
            this.ctxOverlay.beginPath();
            this.ctxOverlay.arc(c.x, c.y, c.r, 0, Math.PI * 2, true);
            this.ctxOverlay.stroke();
        }
        return this;
    };

    /**
     * Update the markers and styles
     */
    Farbtastic.prototype.updateDisplay = function() {
        // Determine whether labels/markers should invert.
        this.invert = (this.rgb[0] * 0.3 + this.rgb[1] * .59 + this.rgb[2] * .11) <= 0.6;

        // Update the solid background fill.
        this.solidFill.css('backgroundColor', pack(HSLToRGB([this.hsl[0], 1, 0.5])));

        // Draw markers
        this.drawMarkers();

        // Linked callback
        this.callback.call(this, this.color);

        return this;
    };

    /**
     * Helper for returning coordinates relative to the center.
     */
    Farbtastic.prototype.widgetCoords = function(event) {
        return {
            x: event.pageX - this.offset.left - this.mid,
            y: event.pageY - this.offset.top - this.mid
        };
    };

    /**
     * Mousedown handler
     */
    Farbtastic.prototype.mousedown = function(event) {
        // Capture mouse
        if (!this.dragging) {
            $(document).bind('mousemove', this.mousemove)
                    .bind('mouseup', this.mouseup);
            this.dragging = true;
        }

        // Update the stored offset for the widget.
        this.offset = this.$container.offset();

        // Check which area is being dragged
        var pos = this.widgetCoords(event);
        this.circleDrag = Math.max(Math.abs(pos.x), Math.abs(pos.y)) > (this.square + 2);

        // Process
        this.mousemove(event);
        return false;
    };

    /**
     * Mousemove handler
     */
    Farbtastic.prototype.mousemove = function(event) {
        // Get coordinates relative to color picker center
        var pos = this.widgetCoords(event);

        // Set new HSL parameters
        if (this.circleDrag) {
            var hue = Math.atan2(pos.x, -pos.y) / 6.28;
            this.setHSL([(hue + 1) % 1, this.hsl[1], this.hsl[2]]);
        }
        else {
            var sat = Math.max(0, Math.min(1, -(pos.x / this.square / 2) + .5));
            var lum = Math.max(0, Math.min(1, -(pos.y / this.square / 2) + .5));
            this.setHSL([this.hsl[0], sat, lum]);
        }
        return false;
    };

    /**
     * Mouseup handler
     */
    Farbtastic.prototype.mouseup = function() {
        // Uncapture mouse
        $(document).unbind('mousemove', this.mousemove);
        $(document).unbind('mouseup', this.mouseup);
        this.dragging = false;
    };

    /* Various color utility functions */
    function dec2hex(x) {
        return (x < 16 ? '0' : '') + x.toString(16);
    }

    function packDx(c, a) {
        return '#' + dec2hex(a) + dec2hex(c) + dec2hex(c) + dec2hex(c);
    }

    function pack(rgb) {
        var r = Math.round(rgb[0] * 255);
        var g = Math.round(rgb[1] * 255);
        var b = Math.round(rgb[2] * 255);
        return '#' + dec2hex(r) + dec2hex(g) + dec2hex(b);
    }

    function unpack(color) {
        if (color.length === 7) {
            function x(i) {
                return parseInt(color.substring(i, i + 2), 16) / 255;
            }
            return [x(1), x(3), x(5)];
        }
        else if (color.length === 4) {
            function x(i) {
                return parseInt(color.substring(i, i + 1), 16) / 15;
            }
            return [x(1), x(2), x(3)];
        }
    }

    function HSLToRGB(hsl) {
        var m1, m2;
        var h = hsl[0], s = hsl[1], l = hsl[2];
        m2 = (l <= 0.5) ? l * (s + 1) : l + s - l * s;
        m1 = l * 2 - m2;
        return [
            hueToRGB(m1, m2, h + 0.33333),
            hueToRGB(m1, m2, h),
            hueToRGB(m1, m2, h - 0.33333)
        ];
    }

    function hueToRGB(m1, m2, h) {
        h = (h + 1) % 1;
        if (h * 6 < 1)
            return m1 + (m2 - m1) * h * 6;
        if (h * 2 < 1)
            return m2;
        if (h * 3 < 2)
            return m1 + (m2 - m1) * (0.66666 - h) * 6;
        return m1;
    }

    function RGBToHSL(rgb) {
        var r = rgb[0], g = rgb[1], b = rgb[2],
                min = Math.min(r, g, b),
                max = Math.max(r, g, b),
                delta = max - min,
                h = 0,
                s = 0,
                l = (min + max) / 2;
        if (l > 0 && l < 1) {
            s = delta / (l < 0.5 ? (2 * l) : (2 - 2 * l));
        }
        if (delta > 0) {
            if (max === r && max !== g)
                h += (g - b) / delta;
            if (max === g && max !== b)
                h += (2 + (b - r) / delta);
            if (max === b && max !== r)
                h += (4 + (r - g) / delta);
            h /= 6;
        }
        return [h, s, l];
    }

    var safeApply = function($scope, fn) {
        var phase = $scope.$root.$$phase;
        if (phase === '$apply' || phase === '$digest') {
            if (fn && (typeof (fn) === 'function')) {
                fn();
            }
        } else {
            $scope.$root.$apply(fn);
        }
    };

    angular.module('farbtastic', [])
            .directive('ngFarbtastic',
                    function() {
                        return {
                            restrict: 'E',
                            require: '^ngModel',
                            link: function($scope, $element, $attrs, ngModel) {
                                var farbtastic;

                                ngModel.$render = function(){
                                    if (!farbtastic) {
                                        farbtastic = new Farbtastic($element, function(color) {
                                            safeApply($scope, function() {
                                                ngModel.$setViewValue(color);
                                            });
                                        }, {
                                            color: ngModel.$viewValue
                                        });
                                    }
                                    else{
                                        farbtastic.setColor(ngModel.$viewValue);
                                    }
                                }
                            }
                        };
                    });

})(jQuery);