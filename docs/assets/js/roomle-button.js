(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
var controllers = require("./controllers/Controllers");
var SettingsService_1 = require("./services/SettingsService");
var EventHandlerService_1 = require("./services/EventHandlerService");
var ButtonsService_1 = require("./services/ButtonsService");
var DomBuilderService_1 = require("./services/DomBuilderService");
var PolyfillService_1 = require("./services/PolyfillService");
var MobileRedirectService_1 = require("./services/MobileRedirectService");
var MobileDetectService_1 = require("./services/MobileDetectService");
var RoomleTypeService_1 = require("./services/RoomleTypeService");
var ImagesService_1 = require("./services/ImagesService");
var RoomleButton = (function () {
    function RoomleButton(settings) {
        this.domBuilder = DomBuilderService_1.DomBuilderService.inject();
        this.imagesService = ImagesService_1.ImagesService.inject();
        this.eventHandler = EventHandlerService_1.EventHandlerService.inject();
        this.polyfillService = PolyfillService_1.PolyfillService.inject();
        this.mobileRedirectService = MobileRedirectService_1.MobileRedirectService.inject();
        this.mobileDetectService = MobileDetectService_1.MobileDetectService.inject();
        SettingsService_1.SettingsService.init(settings);
        this.imagesService.preloadImages();
        this._addCSS();
        this._boot();
    }
    ;
    RoomleButton.prototype._addCSS = function () {
        var scriptId = 'rml-button-lib';
        var script = document.getElementById(scriptId);
        if (!script) {
            return;
        }
        var head = document.head || document.getElementsByTagName('head')[0];
        var href = script.getAttribute('src');
        var styleHref = href.replace(/\.js/g, '.css');
        if (styleHref && styleHref.length > 1 && styleHref[0] === 'j' && styleHref[1] === 's') {
            styleHref = styleHref.substr(2);
            styleHref = 'css' + styleHref;
        }
        else {
            styleHref = styleHref.replace(/\/js\//g, '/css/');
        }
        var style = document.createElement('link');
        //style.async = true;
        style.href = styleHref;
        style.rel = 'stylesheet';
        style.media = 'all';
        style.setAttribute('integrity', 'sha256-gwxlsRMRCnPYXO6QX4r+JeNmtH0qSQ+sJuB/WFK/6l0=');
        head.appendChild(style);
    };
    RoomleButton.prototype._setupClickListener = function (container) {
        var _this = this;
        container.addEventListener('click', function (e) { return _this.eventHandler.handle(e); });
    };
    RoomleButton.prototype._boot = function () {
        var controllerClasses = controllers;
        var element = document.body;
        this.domBuilder.addCSS();
        if (SettingsService_1.SettingsService.settings.container) {
            var elementList = document.body.querySelectorAll(SettingsService_1.SettingsService.settings.container);
            if (elementList.length) {
                element = elementList[0];
            }
        }
        if (SettingsService_1.SettingsService.settings.createPopUp) {
            this.domBuilder.buildPopUp(element);
        }
        this._setupClickListener(element);
        var instanceSelector = SettingsService_1.SettingsService.settings.selector; // ? this.settings.selector : '[data-roomle-id]';
        for (var key in controllerClasses) {
            if (controllerClasses.hasOwnProperty(key)) {
                if (key === 'RoomleController' && SettingsService_1.SettingsService.settings.mode === 'lib') {
                    continue;
                }
                var controllerClass = controllerClasses[key];
                if (typeof controllerClass.parse === 'function') {
                    controllerClass.parse(instanceSelector, element);
                }
            }
        }
    };
    RoomleButton.prototype.openCustomPopUp = function (e, content, parent) {
        var _this = this;
        this.domBuilder.buildCustomPopUp(content, parent);
        setTimeout(function () {
            _this.eventHandler.dispatchOpenPopUp(e);
        }, 1);
    };
    RoomleButton.prototype.dispatchClick = function (e, type, id, buttonType, highlight) {
        if (highlight === void 0) { highlight = null; }
        this.eventHandler.dispatch(e, type, id, ButtonsService_1.ButtonsService.convertButtonTypeToEnum(buttonType), highlight);
    };
    RoomleButton.prototype.getDomLinkFor = function (action, id, type, isHighlighted) {
        if (isHighlighted === void 0) { isHighlighted = false; }
        var roomleType = RoomleTypeService_1.RoomleTypeService.convertTypeToEnum(type);
        var buttonType = ButtonsService_1.ButtonsService.convertButtonTypeToEnum(action);
        var link = this.mobileDetectService.generateLink(id, roomleType, buttonType);
        var buildOptions = { isHighlighted: isHighlighted, buildAnyway: true };
        return this.domBuilder.buildLink(link, buildOptions);
    };
    RoomleButton.prototype.appendButtons = function (container, id, type) {
        var _this = this;
        var links = this.getLinks(id, type);
        links.forEach(function (link) {
            container.appendChild(_this.domBuilder.buildLink(link));
        });
    };
    RoomleButton.prototype.execDeeplink = function (id, type, clickedButton, newWindow, callback) {
        if (newWindow === void 0) { newWindow = false; }
        if (callback === void 0) { callback = null; }
        var roomleType = RoomleTypeService_1.RoomleTypeService.convertTypeToEnum(type);
        var buttonType = ButtonsService_1.ButtonsService.convertButtonTypeToEnum(clickedButton);
        var link = this.mobileDetectService.generateLink(id, roomleType, buttonType);
        if (link.alternate) {
            var event_1 = document.createEvent('Event');
            event_1.initEvent('execDeeplink', true, true);
            this.eventHandler.dispatch(event_1, type, id, ButtonsService_1.BUTTON_TYPE.TRIGGER, clickedButton, newWindow);
        }
        else {
            this.mobileRedirectService.redirect(link, newWindow, callback);
        }
    };
    RoomleButton.prototype.getLinks = function (id, type, callbackUrl) {
        if (callbackUrl === void 0) { callbackUrl = null; }
        return this.mobileDetectService.getLinks(id, RoomleTypeService_1.RoomleTypeService.convertTypeToEnum(type), callbackUrl);
    };
    RoomleButton.getInstance = function (settings) {
        if (!(this._instance instanceof RoomleButton)) {
            this._instance = new this(settings);
        }
        if (!window.RoomleButtonInstance) {
            var rmlObject = Object.getPrototypeOf(this._instance);
            var exposedObject = {};
            for (var key in rmlObject) {
                if (key && rmlObject.hasOwnProperty(key) && key[0] !== '_') {
                    exposedObject[key] = rmlObject[key];
                }
            }
            window.RoomleButtonInstance = exposedObject;
            SettingsService_1.SettingsService.settings.callback.booted();
        }
        return this._instance;
    };
    return RoomleButton;
}());
exports.RoomleButton = RoomleButton;

},{"./controllers/Controllers":4,"./services/ButtonsService":10,"./services/DomBuilderService":12,"./services/EventHandlerService":13,"./services/ImagesService":15,"./services/MobileDetectService":16,"./services/MobileRedirectService":17,"./services/PolyfillService":18,"./services/RoomleTypeService":20,"./services/SettingsService":21}],2:[function(require,module,exports){
"use strict";
var Environments_1 = require("./Environments");
var Environment = (function () {
    function Environment() {
    }
    Environment.settings = function () {
        var settings = {
            rapi: 'api.test.roomle.com/v2',
            protocol: 'https://',
            rmlco: '',
            shortlink: function (type, id, button, shortId) {
                if (shortId === void 0) { shortId = null; }
                if (Environment.env !== Environments_1.Environments.TEST && !!shortId) {
                    return 'http://rml.co/' + shortId + '/' + button;
                }
                return window.location.host + '/deeplink?id=' + id + '&type=' + type + '&button=' + button;
            }
        };
        if (Environment.env !== Environments_1.Environments.TEST) {
            settings.rapi = 'api.roomle.com/v2';
        }
        settings.rmlco = settings.protocol + settings.rapi + '/shortIds';
        return settings;
    };
    Object.defineProperty(Environment, "env", {
        get: function () {
            return this.envIndicator.substring(3, this.envIndicator.length - 3);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Environment, "config", {
        get: function () {
            return Environment.settings();
        },
        enumerable: true,
        configurable: true
    });
    return Environment;
}());
Environment.envIndicator = '###development###';
exports.Environment = Environment;

},{"./Environments":3}],3:[function(require,module,exports){
"use strict";
var Environments = (function () {
    function Environments() {
    }
    return Environments;
}());
Environments.PRODUCTION = 'production';
Environments.TEST = 'test';
exports.Environments = Environments;

},{}],4:[function(require,module,exports){
"use strict";
var RoomleController_1 = require("./RoomleController");
exports.RoomleController = RoomleController_1.RoomleController;
var PopupController_1 = require("./PopupController");
exports.PopupController = PopupController_1.PopupController;

},{"./PopupController":5,"./RoomleController":6}],5:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Controller_1 = require("../lib/Controller");
var SettingsService_1 = require("../services/SettingsService");
var EventHandlerService_1 = require("../services/EventHandlerService");
var DomBuilderService_1 = require("../services/DomBuilderService");
var ImagesService_1 = require("../services/ImagesService");
var PopupController = (function (_super) {
    __extends(PopupController, _super);
    function PopupController(element) {
        var _this = _super.call(this, element) || this;
        _this.eventHandlerService = EventHandlerService_1.EventHandlerService.inject();
        _this.domBuilderService = DomBuilderService_1.DomBuilderService.inject();
        _this.imagesService = ImagesService_1.ImagesService.inject();
        if (!SettingsService_1.SettingsService.settings.createPopUp) {
            return _this;
        }
        _this.eventHandlerService.subscribe(EventHandlerService_1.EVENT_TYPES.TRIGGER, _this.openPopup.bind(_this));
        _this.eventHandlerService.subscribe(EventHandlerService_1.EVENT_TYPES.POP_UP_OPEN, _this.simpleOpen.bind(_this));
        _this.eventHandlerService.subscribe(EventHandlerService_1.EVENT_TYPES.POP_UP_CLOSE, _this.closePopup.bind(_this));
        _this.$('.rml-md-overlay')[0].addEventListener('click', function () { return _this.closePopup(); });
        _this.$('.rml-popup--close')[0].addEventListener('click', function () { return _this.closePopup(); });
        if (SettingsService_1.SettingsService.settings.showBackButton) {
            _this.$('.rml-popup--back')[0].addEventListener('click', function () { return _this.back(); });
        }
        else {
            _this.$('.rml-popup--back')[0].classList.add('rml-popup--back__hide');
        }
        return _this;
        //this.roomleButtonService.addRoomleButton(this.triggerClicked.bind(this));
    }
    PopupController.prototype.closePopup = function () {
        var classList = this.$('.rml-popup')[0].classList;
        if (classList.contains('rml-md-show')) {
            classList.remove('rml-md-show');
            var back = this.$('.rml-popup--back')[0];
            back.classList.remove('rml-popup--back__show');
            this.unfreezeScrolling();
            if (typeof SettingsService_1.SettingsService.settings.callback.popupClose === 'function') {
                var id = (this.id) ? this.id : 'CUSTOM';
                var type = (this.type) ? this.type : 'CUSTOM';
                SettingsService_1.SettingsService.settings.callback.popupClose(id, type);
            }
        }
        else {
            classList.add('rml-md-show');
            this.freezeScrolling();
        }
    };
    PopupController.prototype.back = function () {
        var linksContainer = this.$('.rml-deeplink--slider')[0];
        linksContainer.classList.remove('rml-deeplink__hint');
        var hintContainer = this.$('.rml-deeplink__hint-container')[0];
        hintContainer.innerHTML = '';
        var back = this.$('.rml-popup--back')[0];
        back.classList.remove('rml-popup--back__show');
        var hintText = this.$('.rml-deeplink--hint');
        if (hintText.length) {
            var text = hintText[0];
            text.classList.remove('rml-hint__show');
        }
    };
    PopupController.prototype.simpleOpen = function (e, id, type) {
        e.preventDefault();
        this.id = id;
        this.type = type;
        var popUp = document.querySelectorAll('[' + SettingsService_1.SettingsService.settings.popUpSelector + ']');
        var modal = popUp[0].querySelectorAll('.rml-md-modal');
        if (modal[0].classList.contains('rml-md-show')) {
            modal[0].classList.remove('rml-md-show');
        }
        else {
            modal[0].classList.add('rml-md-show');
        }
        this.freezeScrolling();
        if (typeof SettingsService_1.SettingsService.settings.callback.popupOpen === 'function') {
            SettingsService_1.SettingsService.settings.callback.popupOpen((id) ? id : 'CUSTOM', (type) ? type : 'CUSTOM');
        }
        return modal[0];
    };
    PopupController.prototype.openPopup = function (e, id, type, links, highlight) {
        var _this = this;
        var modal = this.simpleOpen(e, id, type);
        var container = modal.querySelectorAll('.rml-generated-content');
        container[0].innerHTML = '';
        var linksContainer = document.createElement('div');
        linksContainer.classList.add('rml-deeplink--slider');
        linksContainer.classList.add('rml-deeplink--links');
        var slide = document.createElement('div');
        slide.classList.add('rml-deeplink--slide');
        slide.classList.add('rml-deeplink--overview');
        var alternate = document.createElement('div');
        alternate.classList.add('rml-deeplink--slide');
        alternate.classList.add('rml-deeplink--alternate');
        links.forEach(function (link) {
            var isHighlighted = link.type === highlight;
            var linkDom = _this.domBuilderService.buildLink(link, {
                isHighlighted: isHighlighted,
                slideMode: true,
                clickedHint: function () {
                    alternate.innerHTML = '';
                    var hintContainer = document.createElement('div');
                    hintContainer.classList.add('rml-deeplink__hint-container');
                    var imgContainer = document.createElement('div');
                    var dom = document.createElement('div');
                    imgContainer.classList.add('rml-deeplink__hint-img');
                    dom.classList.add('rml-deeplink__hint-link');
                    var img = document.createElement('img');
                    var imgUrl = _this.imagesService.images[link.alternate];
                    img.setAttribute('src', imgUrl);
                    imgContainer.appendChild(img);
                    hintContainer.appendChild(imgContainer);
                    var back = document.querySelector('.rml-popup--back');
                    if (SettingsService_1.SettingsService.settings.showBackButton) {
                        back.classList.add('rml-popup--back__show');
                    }
                    var domLink = linkDom.cloneNode(true);
                    dom.appendChild(domLink);
                    _this.domBuilderService.addShortlink(dom, link.roomleType, link.type, link.id);
                    hintContainer.appendChild(dom);
                    alternate.appendChild(hintContainer);
                    if (linksContainer.classList.contains('rml-deeplink__hint')) {
                        linksContainer.classList.remove('rml-deeplink__hint');
                    }
                    else {
                        linksContainer.classList.add('rml-deeplink__hint');
                    }
                    var hint = dom.querySelector('.rml-deeplink--hint');
                    _this.domBuilderService.addShortlink(dom, link.roomleType, link.type, link.id);
                    hint.classList.add('rml-hint__show');
                    var newlinkDom = alternate.querySelector('.rml-deeplink--row');
                    newlinkDom.addEventListener('click', function (e) {
                        e.preventDefault();
                        var input = dom.querySelector('input');
                        input.select();
                        return false;
                    });
                    if (typeof SettingsService_1.SettingsService.settings.callback.clickedHint === 'function') {
                        SettingsService_1.SettingsService.settings.callback.clickedHint(link.id, link.roomleType, link.type);
                    }
                }
            });
            if (!linkDom) {
                return;
            }
            slide.appendChild(linkDom);
        });
        linksContainer.appendChild(slide);
        linksContainer.appendChild(alternate);
        container[0].appendChild(linksContainer);
    };
    PopupController.prototype.freezeScrolling = function () {
        var html = document.querySelector('html');
        var body = document.body;
        if (html.style.position !== 'fixed') {
            var top_1 = html.scrollTop ? html.scrollTop : body.scrollTop;
            if (window.innerWidth > html.offsetWidth) {
                html.style.overflowY = 'scroll';
            }
            html.style.width = '100%';
            html.style.height = '100%';
            html.style.position = 'fixed';
            html.style.top = (-top_1) + 'px';
        }
    };
    PopupController.prototype.unfreezeScrolling = function () {
        var html = document.querySelector('html');
        var body = document.body;
        if (html.style.position === 'fixed') {
            html.style.position = 'static';
            var scrollTopValue = -parseInt(html.style.top, 10);
            html.scrollTop = scrollTopValue;
            body.scrollTop = scrollTopValue;
            html.style.position = '';
            html.style.width = '';
            html.style.height = '';
            html.style.top = '';
            html.style.overflowY = '';
        }
    };
    return PopupController;
}(Controller_1.Controller));
PopupController.selector = '[data-rml-deeplink-popup-container]';
exports.PopupController = PopupController;

},{"../lib/Controller":7,"../services/DomBuilderService":12,"../services/EventHandlerService":13,"../services/ImagesService":15,"../services/SettingsService":21}],6:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Controller_1 = require("../lib/Controller");
var DomBuilderService_1 = require("../services/DomBuilderService");
var RoomleTypeService_1 = require("../services/RoomleTypeService");
var SettingsService_1 = require("../services/SettingsService");
var RoomleController = (function (_super) {
    __extends(RoomleController, _super);
    function RoomleController(element) {
        var _this = _super.call(this, element) || this;
        _this.id = null;
        _this.type = null;
        _this.domBuilder = DomBuilderService_1.DomBuilderService.inject();
        if (element) {
            var idSelector = SettingsService_1.SettingsService.settings.dataSelector.id;
            var typeSelector = SettingsService_1.SettingsService.settings.dataSelector.type;
            _this.id = element.getAttribute(idSelector);
            _this.type = RoomleTypeService_1.RoomleTypeService.convertTypeToEnum(element.getAttribute(typeSelector));
            if (_this.type !== null && _this.id) {
                _this.addButtons(_this.type);
            }
        }
        return _this;
    }
    RoomleController.prototype.addButtons = function (type) {
        if (SettingsService_1.SettingsService.settings.createNoButtons) {
            return;
        }
        var item = this.$();
        if (!item) {
            return;
        }
        var buttons = this.domBuilder.getButtons(type);
        item.appendChild(buttons);
    };
    return RoomleController;
}(Controller_1.Controller));
exports.RoomleController = RoomleController;

},{"../lib/Controller":7,"../services/DomBuilderService":12,"../services/RoomleTypeService":20,"../services/SettingsService":21}],7:[function(require,module,exports){
"use strict";
/**
 * Generic controller class to entcapsulate the parsing
 * and other generic stuff
 *
 * @export
 * @class Controller
 */
var Controller = (function () {
    /**
     * Creates an instance of a Controller.
     *
     * @param {Element} root The element where the controller has been applied
     */
    function Controller(element) {
        this._element = element;
    }
    Controller.prototype.$ = function (selector) {
        if (!(this._element instanceof Element)) {
            throw new Error('This controller has no element!');
        }
        return selector ? this._element.querySelectorAll(selector) : this._element;
    };
    Controller.prototype.getControllersByClass = function (controllerClass) {
        var instances = Controller._instances;
        var result = [];
        for (var i = 0, max = instances.length; i < max; i++) {
            var instance = instances[i];
            if (instance instanceof controllerClass) {
                result.push(instance);
            }
        }
        return result;
    };
    /**
     * Hook for running code before the controller is instantiated
     *
     * @static
     * @param {NodeListOf<Element>} elements List of elements where the controller will be applied
     */
    Controller.beforeInstantiating = function (elements) {
    };
    /**
     * Hook for running code after the controller has been instantiated.
     *
     * @static
     * @param {NodeListOf<Element>} elements List of elements where the controller has been applied
     * @param {Array<Controller>} instances List of controller instances created
     */
    Controller.afterInstantiating = function (elements, instances) {
    };
    /**
     * Look for elements with a specific selector and creates an instance for
     * every element.
     *
     * @static
     * @param {string} selector Dom selector
     * @param {Element} [root=document.body] Starting element for parsing
     */
    Controller.parse = function (selector, root) {
        if (root === void 0) { root = document.body; }
        if (typeof this.selector === 'string' && this.selector.length) {
            selector = this.selector;
        }
        else if (!selector) {
            return;
        }
        var elements = root.querySelectorAll(selector);
        this.beforeInstantiating(elements);
        for (var i = 0; i < elements.length; i++) {
            var element = elements[i];
            var className = /^function\s+([\w\$]+)\s*\(/.exec(this.toString())[1];
            className = className.toLocaleLowerCase();
            if (element.getAttribute(Controller.PARSE_ID_ATTRIBUTE + '-' + className)) {
                continue;
            }
            element.setAttribute(Controller.PARSE_ID_ATTRIBUTE + '-' + className, Math.floor(Math.random() * 10 + 1) * Date.now() + '');
            Controller._instances.push(new this(element));
        }
        this.afterInstantiating(elements, Controller._instances);
    };
    return Controller;
}());
/**
 * Instances of the Controller
 *
 * @static
 * @type {Array<Controller>}
 */
Controller._instances = [];
/**
 * HTML attribute to mark elements which are already parsed
 *
 * @static
 */
Controller.PARSE_ID_ATTRIBUTE = 'data-parse-id';
exports.Controller = Controller;

},{}],8:[function(require,module,exports){
"use strict";
/**
 * Simple Singelton Service implementation
 * which will be extended by the other Services like
 * - DataSerivce
 * - TemplateService
 * - ...
 *
 * @export
 * @class Service
 */
var Service = (function () {
    function Service() {
    }
    /**
     * Returns the current instance or creates a new
     * one if there isn't already an instance available.
     *
     * @static
     * @returns {Service} Instance of the current Service
     */
    Service.getInstance = function () {
        if (!(this._instance instanceof Service)) {
            this._instance = new this();
        }
        return this._instance;
    };
    /**
     * Naming Wrapper for the getInstance() function
     * because inject sounds cooler.
     *
     * @static
     * @returns {Service} Instance of the current Service
     */
    Service.inject = function () {
        return this.getInstance();
    };
    return Service;
}());
exports.Service = Service;

},{}],9:[function(require,module,exports){
"use strict";
var MobileDetectService_1 = require("./services/MobileDetectService");
var RoomleButton_1 = require("./RoomleButton");
var mobileDetect = MobileDetectService_1.MobileDetectService.inject();
mobileDetect.isIOS();
if (!window.Promise) {
    var scriptId = 'rml-button-lib';
    var script = document.getElementById(scriptId);
    var href = script.getAttribute('src');
    var element = document.createElement('script');
    var url = href.slice(0, href.lastIndexOf('/'));
    element.onload = function () { return RoomleButton_1.RoomleButton.getInstance(window.RoomleButtonSettings); };
    element.onerror = function (error) { return RoomleButton_1.RoomleButton.getInstance(window.RoomleButtonSettings); };
    element.async = true;
    element.src = url + '/es6-promise.min.js';
    element.setAttribute('type', 'text/javascript');
    document.body.appendChild(element);
}
else {
    RoomleButton_1.RoomleButton.getInstance(window.RoomleButtonSettings);
}

},{"./RoomleButton":1,"./services/MobileDetectService":16}],10:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Service_1 = require("../lib/Service");
var EnumEx_1 = require("../utils/EnumEx");
var BUTTON_TYPE;
(function (BUTTON_TYPE) {
    BUTTON_TYPE[BUTTON_TYPE["TRIGGER"] = 0] = "TRIGGER";
    BUTTON_TYPE[BUTTON_TYPE["ADD"] = 1] = "ADD";
    BUTTON_TYPE[BUTTON_TYPE["VISUALIZE"] = 2] = "VISUALIZE";
    BUTTON_TYPE[BUTTON_TYPE["CONFIGURE"] = 3] = "CONFIGURE";
    BUTTON_TYPE[BUTTON_TYPE["AR"] = 4] = "AR";
    BUTTON_TYPE[BUTTON_TYPE["MARK"] = 5] = "MARK";
    BUTTON_TYPE[BUTTON_TYPE["START_NOW"] = 6] = "START_NOW";
    BUTTON_TYPE[BUTTON_TYPE["VR"] = 7] = "VR";
})(BUTTON_TYPE = exports.BUTTON_TYPE || (exports.BUTTON_TYPE = {}));
var ButtonsService = (function (_super) {
    __extends(ButtonsService, _super);
    function ButtonsService() {
        var _this = _super.call(this) || this;
        _this.availableButtons = EnumEx_1.EnumEx.getValues(BUTTON_TYPE);
        return _this;
    }
    ButtonsService.convertButtonTypeToEnum = function (buttonType) {
        if (buttonType === 'trigger') {
            return BUTTON_TYPE.TRIGGER;
        }
        if (buttonType === 'add') {
            return BUTTON_TYPE.ADD;
        }
        if (buttonType === 'ar') {
            return BUTTON_TYPE.AR;
        }
        if (buttonType === 'configure') {
            return BUTTON_TYPE.CONFIGURE;
        }
        if (buttonType === 'mark') {
            return BUTTON_TYPE.MARK;
        }
        if (buttonType === 'visualize') {
            return BUTTON_TYPE.VISUALIZE;
        }
        if (buttonType === 'vr') {
            return BUTTON_TYPE.VR;
        }
        if (buttonType === 'start_now') {
            return BUTTON_TYPE.START_NOW;
        }
    };
    // USED TO DEFINE HOOKS FOR OUTSIDE TS WORLD. AR IS NICER THAN "0"
    ButtonsService.convertButtonType = function (buttonType) {
        if (buttonType === BUTTON_TYPE.TRIGGER) {
            return 'trigger';
        }
        if (buttonType === BUTTON_TYPE.ADD) {
            return 'add';
        }
        if (buttonType === BUTTON_TYPE.AR) {
            return 'ar';
        }
        if (buttonType === BUTTON_TYPE.CONFIGURE) {
            return 'configure';
        }
        if (buttonType === BUTTON_TYPE.MARK) {
            return 'mark';
        }
        if (buttonType === BUTTON_TYPE.VISUALIZE) {
            return 'visualize';
        }
        if (buttonType === BUTTON_TYPE.VR) {
            return 'vr';
        }
        if (buttonType === BUTTON_TYPE.START_NOW) {
            return 'start_now';
        }
    };
    return ButtonsService;
}(Service_1.Service));
exports.ButtonsService = ButtonsService;

},{"../lib/Service":8,"../utils/EnumEx":22}],11:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Service_1 = require("../lib/Service");
var ConsoleService = (function (_super) {
    __extends(ConsoleService, _super);
    function ConsoleService() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ConsoleService.log = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        console.log.apply(console, args);
    };
    ConsoleService.warn = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        console.warn.apply(console, args);
    };
    ConsoleService.error = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        console.error.apply(console, args);
    };
    return ConsoleService;
}(Service_1.Service));
exports.ConsoleService = ConsoleService;

},{"../lib/Service":8}],12:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Service_1 = require("../lib/Service");
var MobileDetectService_1 = require("./MobileDetectService");
var SettingsService_1 = require("./SettingsService");
var ButtonsService_1 = require("./ButtonsService");
var RoomleTypeService_1 = require("./RoomleTypeService");
var IconsService_1 = require("./IconsService");
var ConsoleService_1 = require("./ConsoleService");
var MobileRedirectService_1 = require("./MobileRedirectService");
var PopupController_1 = require("../controllers/PopupController");
var RequestService_1 = require("../services/RequestService");
var Environment_1 = require("../config/Environment");
var DomBuilderService = (function (_super) {
    __extends(DomBuilderService, _super);
    function DomBuilderService() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.mobileDetect = MobileDetectService_1.MobileDetectService.inject();
        _this.buttonsService = ButtonsService_1.ButtonsService.inject();
        _this.iconsService = IconsService_1.IconsService.inject();
        _this.mobileRedirectService = MobileRedirectService_1.MobileRedirectService.inject();
        _this.requestService = RequestService_1.RequestService.inject();
        _this.elementCache = {};
        _this.buttonsCache = {};
        _this.shortLinkCache = {};
        _this.waitingForShortLink = false;
        return _this;
    }
    DomBuilderService.prototype.createCSS = function (css) {
        var string = '';
        for (var property in css) {
            if (css.hasOwnProperty(property)) {
                string += property + ':' + css[property] + ';';
            }
        }
        return string;
    };
    DomBuilderService.prototype.addCSS = function () {
        if (SettingsService_1.SettingsService.settings.createNoButtons) {
            return;
        }
        var buttonsCSS = this.createCSS(SettingsService_1.SettingsService.settings.css.buttons);
        buttonsCSS = '.' + SettingsService_1.SettingsService.settings.html.containerClass + '{' + buttonsCSS + 'visibility: hidden;}';
        var itemCSS = this.createCSS(SettingsService_1.SettingsService.settings.css.item);
        itemCSS = SettingsService_1.SettingsService.settings.selector + '{' + itemCSS + '}';
        var inlineCss = '.rml-md-modal{visibility:hidden;}';
        var css = buttonsCSS + itemCSS + inlineCss;
        var head = document.head || document.getElementsByTagName('head')[0];
        var style = document.createElement('style');
        style.type = 'text/css';
        style.appendChild(document.createTextNode(css));
        head.appendChild(style);
    };
    DomBuilderService.prototype.build = function (cacheKey, content) {
        if (!this.elementCache[cacheKey]) {
            var fragment = document.createDocumentFragment();
            var li = document.createElement(SettingsService_1.SettingsService.settings.html.buttonElement);
            var buttonType = ButtonsService_1.ButtonsService.convertButtonType(cacheKey);
            li.setAttribute(SettingsService_1.SettingsService.settings.dataSelector.action, buttonType);
            fragment.appendChild(li);
            this.elementCache[cacheKey] = fragment;
        }
        return this.elementCache[cacheKey].cloneNode(true);
    };
    DomBuilderService.prototype.buildTrigger = function () {
        var cacheKey = ButtonsService_1.BUTTON_TYPE.TRIGGER;
        var buttonTypeStr = ButtonsService_1.ButtonsService.convertButtonType(cacheKey);
        if (!this.elementCache[cacheKey]) {
            var fragment = document.createDocumentFragment();
            var li = document.createElement(SettingsService_1.SettingsService.settings.html.buttonElement);
            li.setAttribute(SettingsService_1.SettingsService.settings.dataSelector.action, buttonTypeStr);
            var icon = this.iconsService.create(buttonTypeStr);
            //let contentNode = document.createTextNode(content);
            //li.appendChild(contentNode);
            li.appendChild(icon);
            fragment.appendChild(li);
            this.elementCache[cacheKey] = fragment;
        }
        return this.elementCache[cacheKey].cloneNode(true);
    };
    DomBuilderService.prototype.buildPopUpDom = function () {
        var popUp = document.body.querySelectorAll('[data-rml-deeplink-popup-container]');
        if (popUp && popUp.length > 0) {
            return popUp[0];
        }
        var container = document.createElement('div');
        container.setAttribute('data-rml-deeplink-popup-container', '');
        container.classList.add('rml-btn');
        var modal = document.createElement('div');
        modal.classList.add('rml-md-modal');
        modal.classList.add('rml-popup');
        modal.classList.add('rml-md-effect-1');
        modal.setAttribute('data-rml-deeplink-popup', '');
        var content = document.createElement('div');
        content.classList.add('rml-md-content');
        var closer = document.createElement('div');
        closer.classList.add('rml-popup--close');
        var back = document.createElement('div');
        back.classList.add('rml-popup--back');
        var links = document.createElement('div');
        links.classList.add('rml-generated-content');
        var overlay = document.createElement('div');
        overlay.classList.add('rml-md-overlay');
        content.appendChild(closer);
        content.appendChild(back);
        content.appendChild(links);
        modal.appendChild(content);
        container.appendChild(modal);
        container.appendChild(overlay);
        return container;
    };
    DomBuilderService.prototype.buildCustomPopUp = function (content, parent) {
        if (parent === void 0) { parent = document.body; }
        var container = this.buildPopUpDom();
        var contentDiv = container.querySelectorAll('.rml-md-content')[0];
        var oldContent = contentDiv.querySelector('.rml-generated-content');
        oldContent.innerHTML = '';
        if (content) {
            oldContent.appendChild(content);
        }
        var popUp = document.body.querySelectorAll('[data-rml-deeplink-popup-container]');
        if (!popUp || popUp.length === 0) {
            parent.appendChild(container);
            var instanceSelector = SettingsService_1.SettingsService.settings.selector;
            var element = document.body;
            PopupController_1.PopupController.parse(instanceSelector, element);
        }
    };
    DomBuilderService.prototype.buildPopUp = function (parent) {
        if (parent === void 0) { parent = document.body; }
        var container = this.buildPopUpDom();
        parent.appendChild(container);
    };
    DomBuilderService.prototype.buildAddToPlan = function () {
        return this.build(ButtonsService_1.BUTTON_TYPE.ADD, 'Plan');
    };
    DomBuilderService.prototype.buildVisualize = function () {
        return this.build(ButtonsService_1.BUTTON_TYPE.VISUALIZE, 'Visualize');
    };
    DomBuilderService.prototype.buildConfigure = function () {
        return this.build(ButtonsService_1.BUTTON_TYPE.CONFIGURE, 'Configure');
    };
    DomBuilderService.prototype.buildAR = function () {
        return this.build(ButtonsService_1.BUTTON_TYPE.AR, 'Augmented Reality');
    };
    DomBuilderService.prototype.buildMark = function () {
        return this.build(ButtonsService_1.BUTTON_TYPE.MARK, 'Mark');
    };
    DomBuilderService.prototype.buildVR = function () {
        return this.build(ButtonsService_1.BUTTON_TYPE.VR, 'Virtual Reality');
    };
    DomBuilderService.prototype.buildButtons = function (type) {
        var _this = this;
        var cacheKey = '';
        this.buttonsService.availableButtons.forEach(function (buttonType) {
            if (_this.mobileDetect.generateLink('', type, buttonType)) {
                cacheKey += buttonType;
            }
        });
        if (!this.buttonsCache[cacheKey]) {
            var fragment = document.createDocumentFragment();
            var div = document.createElement(SettingsService_1.SettingsService.settings.html.containerType);
            div.classList.add(SettingsService_1.SettingsService.settings.html.containerClass);
            var ul_1 = document.createElement(SettingsService_1.SettingsService.settings.html.buttonsContainer);
            var oneAdded_1 = false;
            this.buttonsService.availableButtons.forEach(function (buttonType) {
                var link = _this.mobileDetect.generateLink('', type, buttonType);
                if (!link) {
                    return;
                }
                if (SettingsService_1.SettingsService.settings.showOnlyTrigger) {
                    oneAdded_1 = true;
                    return;
                }
                if (buttonType === ButtonsService_1.BUTTON_TYPE.ADD) {
                    var add = _this.buildAddToPlan();
                    ul_1.appendChild(add);
                    oneAdded_1 = true;
                    return;
                }
                if (buttonType === ButtonsService_1.BUTTON_TYPE.AR) {
                    var ar = _this.buildAR();
                    ul_1.appendChild(ar);
                    oneAdded_1 = true;
                    return;
                }
                if (buttonType === ButtonsService_1.BUTTON_TYPE.CONFIGURE) {
                    var conf = _this.buildConfigure();
                    ul_1.appendChild(conf);
                    oneAdded_1 = true;
                    return;
                }
                if (buttonType === ButtonsService_1.BUTTON_TYPE.MARK) {
                    var mark = _this.buildMark();
                    ul_1.appendChild(mark);
                    oneAdded_1 = true;
                    return;
                }
                if (buttonType === ButtonsService_1.BUTTON_TYPE.VISUALIZE) {
                    var vis = _this.buildVisualize();
                    ul_1.appendChild(vis);
                    oneAdded_1 = true;
                    return;
                }
                if (buttonType === ButtonsService_1.BUTTON_TYPE.VR) {
                    var vr = _this.buildVR();
                    ul_1.appendChild(vr);
                    oneAdded_1 = true;
                    return;
                }
                ConsoleService_1.ConsoleService.error('ButtonType "' + buttonType + '" unknown');
            });
            if (oneAdded_1) {
                var trigger = this.buildTrigger();
                ul_1.insertBefore(trigger, ul_1.firstChild);
                div.appendChild(ul_1);
            }
            fragment.appendChild(div);
            this.buttonsCache[cacheKey] = fragment;
        }
        return this.buttonsCache[cacheKey].cloneNode(true);
    };
    DomBuilderService.prototype.getButtons = function (type) {
        return this.buildButtons(type);
    };
    DomBuilderService.prototype.buildDeeplink = function (type, id) {
        var shortenId = 1;
        if (type === RoomleTypeService_1.ROOMLE_TYPE.CONFIGURATION) {
            shortenId = 3;
        }
        if (type === RoomleTypeService_1.ROOMLE_TYPE.CONFIGURABLE_ITEM || type === RoomleTypeService_1.ROOMLE_TYPE.ITEM) {
            shortenId = 4;
        }
        var token = 'anonymous';
        var today = new Date();
        var apiKey = 'roomle_portal_v2';
        var tokenEncoded = today.toISOString() + ';' + token + ';' + apiKey;
        tokenEncoded = '03-' + window.btoa(tokenEncoded);
        return this.requestService.fetchJSON(Environment_1.Environment.config.rmlco, {
            method: 'POST',
            headers: {
                'apiKey': 'roomle_portal_v2',
                'currentTenant': 9,
                'language': 'en',
                'locale': 'en',
                'token': tokenEncoded
            },
            body: {
                shortId: {
                    type: shortenId,
                    referencedId: id
                }
            }
        });
    };
    DomBuilderService.prototype.isAvailableLink = function (linkType) {
        if (ButtonsService_1.ButtonsService.convertButtonTypeToEnum(linkType) === ButtonsService_1.BUTTON_TYPE.MARK) {
            return false;
        }
        if (ButtonsService_1.ButtonsService.convertButtonTypeToEnum(linkType) === ButtonsService_1.BUTTON_TYPE.START_NOW) {
            return false;
        }
        return true;
    };
    DomBuilderService.prototype.createDeeplinkInput = function (container, link) {
        container.innerHTML = '';
        var input = document.createElement('input');
        input.setAttribute('type', 'text');
        input.setAttribute('value', link);
        input.setAttribute('readonly', 'readonly');
        input.addEventListener('click', function (e) {
            e.stopImmediatePropagation();
            e.preventDefault();
            input.select();
        });
        container.appendChild(input);
        return input;
    };
    DomBuilderService.prototype.createCopySvg = function (container, input) {
        if (typeof document.execCommand !== 'function') {
            return;
        }
        var copySvg = this.iconsService.createCopy();
        copySvg.classList.add('rml-clickable');
        copySvg.classList.add('rml-fake-link');
        copySvg.classList.add('rml-icons__copy');
        copySvg.addEventListener('click', function () {
            input.select();
            try {
                document.execCommand('copy');
            }
            catch (e) {
            }
        });
        container.appendChild(copySvg);
    };
    DomBuilderService.prototype.addShortlink = function (element, type, buttonType, id) {
        var _this = this;
        var h3 = element.querySelector('.rml-deeplink--link');
        var needsAppend = false;
        if (!h3) {
            h3 = document.createElement('span');
            needsAppend = true;
        }
        h3.classList.add('rml-deeplink--link');
        h3.classList.add('rml-deeplink--heading');
        h3.classList.add('text--red');
        if (needsAppend) {
            element.appendChild(h3);
        }
        var cacheKey = type + ':' + id;
        var cachedLink = this.shortLinkCache[cacheKey];
        if (cachedLink) {
            var inputCached = this.createDeeplinkInput(h3, cachedLink);
            this.createCopySvg(h3, inputCached);
        }
        else {
            if (this.waitingForShortLink) {
                return;
            }
            this.waitingForShortLink = true;
            var spinner_1 = document.createElement('span');
            spinner_1.classList.add('rml-spinner');
            spinner_1.classList.add('rml-spinner--white');
            h3.appendChild(spinner_1);
            this.buildDeeplink(type, id).then(function (shortLink) {
                var link = Environment_1.Environment.config.shortlink(RoomleTypeService_1.RoomleTypeService.convertRoomleType(type), id, buttonType, shortLink.shortId.shortId);
                var input = _this.createDeeplinkInput(h3, link);
                _this.createCopySvg(h3, input);
                _this.shortLinkCache[cacheKey] = link;
                _this.waitingForShortLink = false;
            }, function () {
                _this.waitingForShortLink = false;
                h3.removeChild(spinner_1);
                h3.textContent = SettingsService_1.SettingsService.settings.translations.errors.deeplinkcreate;
            });
        }
    };
    DomBuilderService.prototype.buildLink = function (link, options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        var _a = options.isHighlighted, isHighlighted = _a === void 0 ? false : _a, _b = options.buildAnyway, buildAnyway = _b === void 0 ? false : _b, _c = options.slideMode, slideMode = _c === void 0 ? false : _c, _d = options.clickedHint, clickedHint = _d === void 0 ? function () {
        } : _d;
        if (!this.isAvailableLink(link.type) && !buildAnyway) {
            return;
        }
        var container = document.createElement('a');
        container.classList.add('rml-deeplink--row');
        container.setAttribute('target', '_blank');
        container.setAttribute('href', link.link);
        var text = document.createElement('span');
        text.classList.add('rml-deeplink--text');
        text.classList.add('rml-deeplink--heading');
        text.textContent = SettingsService_1.SettingsService.settings.translations[link.type].heading;
        var icon = document.createElement('span');
        icon.classList.add('rml-deeplink--icon');
        var svgIcon = this.iconsService.create(link.type);
        icon.appendChild(svgIcon); //= 'i';//SettingsService.settings.translations[link.type].icon;
        container.appendChild(text);
        container.appendChild(icon);
        var callback = SettingsService_1.SettingsService.settings.callback.button[link.type];
        if (callback) {
            container.addEventListener('click', function () {
                callback(link.id, RoomleTypeService_1.RoomleTypeService.convertRoomleType(link.roomleType), link.type);
            });
        }
        if (link.alternate) {
            var alternate_1 = document.createElement('span');
            alternate_1.classList.add('rml-deeplink--hint');
            alternate_1.textContent = SettingsService_1.SettingsService.settings.translations[link.type].hint[link.alternate];
            container.appendChild(alternate_1);
            container.addEventListener('click', function (e) {
                e.preventDefault();
                if (slideMode) {
                    alternate_1.classList.add('rml-hint__slide');
                }
                else {
                    if (alternate_1.classList.contains('rml-hint__show')) {
                        alternate_1.classList.remove('rml-hint__show');
                    }
                    else {
                        _this.addShortlink(alternate_1, link.roomleType, link.type, link.id);
                        alternate_1.classList.add('rml-hint__show');
                    }
                }
                clickedHint();
                return false;
            });
            if (isHighlighted) {
                setTimeout(function () {
                    alternate_1.classList.add('rml-hint__show');
                    if (slideMode) {
                        alternate_1.classList.add('rml-hint__slide');
                        clickedHint();
                    }
                    else {
                        _this.addShortlink(alternate_1, link.roomleType, link.type, link.id);
                    }
                }, 1);
            }
        }
        else {
            if (link.os !== 'desktop') {
                this.mobileRedirectService.createDeeplinkFor(container, link.os);
            }
        }
        return container;
    };
    return DomBuilderService;
}(Service_1.Service));
exports.DomBuilderService = DomBuilderService;

},{"../config/Environment":2,"../controllers/PopupController":5,"../lib/Service":8,"../services/RequestService":19,"./ButtonsService":10,"./ConsoleService":11,"./IconsService":14,"./MobileDetectService":16,"./MobileRedirectService":17,"./RoomleTypeService":20,"./SettingsService":21}],13:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Service_1 = require("../lib/Service");
var RoomleTypeService_1 = require("./RoomleTypeService");
var ButtonsService_1 = require("./ButtonsService");
var SettingsService_1 = require("./SettingsService");
var MobileDetectService_1 = require("./MobileDetectService");
var EVENT_TYPES;
(function (EVENT_TYPES) {
    EVENT_TYPES[EVENT_TYPES["TRIGGER"] = 0] = "TRIGGER";
    EVENT_TYPES[EVENT_TYPES["POP_UP_OPEN"] = 1] = "POP_UP_OPEN";
    EVENT_TYPES[EVENT_TYPES["POP_UP_CLOSE"] = 2] = "POP_UP_CLOSE";
})(EVENT_TYPES = exports.EVENT_TYPES || (exports.EVENT_TYPES = {}));
var EventHandlerService = (function (_super) {
    __extends(EventHandlerService, _super);
    function EventHandlerService() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.mobileDetectService = MobileDetectService_1.MobileDetectService.inject();
        _this.triggerCallbacks = [];
        _this.openPopUpCallbacks = [];
        return _this;
    }
    EventHandlerService.prototype.subscribe = function (event, callback) {
        if (event === EVENT_TYPES.TRIGGER) {
            this.triggerCallbacks.push(callback);
        }
        if (event === EVENT_TYPES.POP_UP_OPEN) {
            this.openPopUpCallbacks.push(callback);
        }
    };
    EventHandlerService.prototype.findSelector = function (element, selector, depth, maxDepth) {
        if (depth === void 0) { depth = 0; }
        if (maxDepth === void 0) { maxDepth = 20; }
        if (maxDepth === depth) {
            return null;
        }
        if (element.matches && element.matches(selector)) {
            return element;
        }
        var parent = element.parentElement || element.parentNode;
        if (!parent) {
            return null;
        }
        return this.findSelector(parent, selector, depth + 1);
    };
    EventHandlerService.prototype.dispatchOpenPopUp = function (e) {
        this.openPopUpCallbacks.forEach(function (callback) {
            callback(e);
        });
    };
    // DO NOT USE ENUM FOR TYPE, BECAUSE CALLBACKS ARE ON "item" and not "0"
    EventHandlerService.prototype.dispatch = function (e, type, id, buttonType, highlight, newWindow) {
        if (highlight === void 0) { highlight = null; }
        if (newWindow === void 0) { newWindow = false; }
        var clickedButton = ButtonsService_1.ButtonsService.convertButtonType(buttonType);
        var links = this.mobileDetectService.getLinks(id, RoomleTypeService_1.RoomleTypeService.convertTypeToEnum(type));
        if (buttonType === ButtonsService_1.BUTTON_TYPE.TRIGGER) {
            var triggerKey = ButtonsService_1.ButtonsService.convertButtonType(ButtonsService_1.BUTTON_TYPE.TRIGGER);
            var callbackTrigger = SettingsService_1.SettingsService.settings.callback[triggerKey];
            if (typeof callbackTrigger === 'function') {
                callbackTrigger(e, id, type, links, highlight, newWindow);
            }
            this.triggerCallbacks.forEach(function (callback) {
                callback(e, id, type, links, highlight, newWindow);
            });
        }
        var callbackForType = SettingsService_1.SettingsService.settings.callback[type];
        if (callbackForType && callbackForType[clickedButton] && typeof callbackForType[clickedButton] === 'function') {
            callbackForType[clickedButton](e, id, type, links, highlight, newWindow);
        }
    };
    EventHandlerService.prototype.getElement = function (parent, selector) {
        var elements = parent.querySelectorAll('[' + selector + ']');
        if (!elements || elements.length === 0) {
            if (parent.hasAttribute(selector)) {
                return parent;
            }
        }
        return elements[0];
    };
    EventHandlerService.prototype.handle = function (e) {
        var target = (e.target || e.srcElement);
        var button = this.findSelector(target, '[' + SettingsService_1.SettingsService.settings.dataSelector.action + ']');
        if (!button) {
            return;
        }
        var buttonType = button.getAttribute(SettingsService_1.SettingsService.settings.dataSelector.action);
        if (buttonType) {
            var roomleElement = this.findSelector(target, SettingsService_1.SettingsService.settings.selector);
            if (!roomleElement) {
                return;
            }
            var typeElement = this.getElement(roomleElement, SettingsService_1.SettingsService.settings.dataSelector.type);
            var type = null;
            var id = null;
            if (typeElement) {
                type = typeElement.getAttribute(SettingsService_1.SettingsService.settings.dataSelector.type);
            }
            var idElement = this.getElement(roomleElement, SettingsService_1.SettingsService.settings.dataSelector.id);
            if (idElement) {
                id = idElement.getAttribute(SettingsService_1.SettingsService.settings.dataSelector.id);
            }
            this.dispatch(e, type, id, ButtonsService_1.ButtonsService.convertButtonTypeToEnum(buttonType));
        }
    };
    return EventHandlerService;
}(Service_1.Service));
exports.EventHandlerService = EventHandlerService;

},{"../lib/Service":8,"./ButtonsService":10,"./MobileDetectService":16,"./RoomleTypeService":20,"./SettingsService":21}],14:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Service_1 = require("../lib/Service");
var ButtonsService_1 = require("./ButtonsService");
var IconsService = (function (_super) {
    __extends(IconsService, _super);
    function IconsService() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    IconsService.prototype.getSvg = function (attributes) {
        attributes = attributes || {};
        if (!attributes['width']) {
            attributes['width'] = '64';
        }
        if (!attributes['height']) {
            attributes['height'] = '64';
        }
        //attributes['xmlns'] = IconsService.SVG_NS;
        var svg = document.createElementNS(IconsService.SVG_NS, 'svg');
        for (var attribute in attributes) {
            svg.setAttributeNS(null, attribute, attributes[attribute]);
        }
        return svg;
    };
    IconsService.prototype.getNode = function (name, attributes) {
        var element = document.createElementNS(IconsService.SVG_NS, name);
        for (var attribute in attributes) {
            element.setAttributeNS(null, attribute, attributes[attribute]);
        }
        return element;
    };
    IconsService.prototype.buildPlanIcon = function (isPlus) {
        var svg = this.getSvg({ viewBox: '0 0 50 50' });
        var firstPath = this.getNode('path', {
            d: 'M39.72,23.16,31,17.93h0l-.36-.22-5.13-3.07h0l-.36-.22a.33.33,0,0,0-.35,0l-.36.22h0l-13.87,8.3h0l-.36.22a.53.53,0,0,0,0,.85l.36.22h0l5.13,3.07h0l.36.22h0l8.38,5h0l.24.14.12.07a.33.33,0,0,0,.35,0L39.72,24a.53.53,0,0,0,0-.85Zm-5.09,2.4-3.34-2a.33.33,0,0,0-.35,0l-.36.22a.53.53,0,0,0,0,.85l2.8,1.68-8.43,5-7.49-4.48,2.89-1.73a.53.53,0,0,0,0-.85l-.18-.11h0l-.91-.54a.33.33,0,0,0-.35,0l-.36.22a.53.53,0,0,0,0,.85h0l-2.36,1.41L12,23.58l2.36-1.41,2.45,1.47a.34.34,0,0,0,.17,0,.34.34,0,0,0,.17,0l.36-.22a.53.53,0,0,0,0-.85l-1.91-1.14L25,15.82l4.24,2.54-7.85,4.7a.53.53,0,0,0,0,.85l.36.22a.33.33,0,0,0,.35,0l3.84-2.3,1.83,1.1a.34.34,0,0,0,.17,0,.34.34,0,0,0,.17,0l.36-.22a.53.53,0,0,0,0-.85l-1.3-.77,3.3-2,7.49,4.48Z',
        });
        /*let secondPath = this.getNode('path', {
         d: 'M48,21.46L34.61,14.87h0l-0.55-.27-7.83-3.87h0l-0.55-.27a0.6,0.6,0,0,0-.53,0l-0.55.27h0L3.42,21.19h0l-0.55.27a0.6,0.6,0,0,0,0,1.08l0.55,0.27h0l7.83,3.87h0l0.55,0.27h0l12.8,6.32h0L25,33.45l0.18,0.09a0.61,0.61,0,0,0,.53,0L48,22.54A0.6,0.6,0,0,0,48,21.46Zm-7.77,3L35.09,22a0.6,0.6,0,0,0-.53,0L34,22.24a0.6,0.6,0,0,0,0,1.08l4.28,2.11L25.41,31.79,14,26.14,18.39,24a0.6,0.6,0,0,0,0-1.08l-0.28-.14h0l-1.39-.69a0.6,0.6,0,0,0-.53,0l-0.55.27a0.6,0.6,0,0,0,0,1.08h0l-3.6,1.78L5.59,22l3.6-1.78,3.74,1.85a0.61,0.61,0,0,0,.27.06,0.6,0.6,0,0,0,.27-0.06L14,21.8a0.6,0.6,0,0,0,0-1.08l-2.92-1.44,14.32-7.07,6.48,3.2-12,5.92a0.6,0.6,0,0,0,0,1.08l0.55,0.27a0.6,0.6,0,0,0,.53,0l5.86-2.89,2.8,1.38a0.61,0.61,0,0,0,.27.06,0.6,0.6,0,0,0,.27-0.06l0.55-.27a0.6,0.6,0,0,0,0-1.08l-2-1,5-2.49L45.24,22Z',
         transform: 'translate(-2.53 -10.4)'
         });*/
        svg.appendChild(firstPath);
        //svg.appendChild(secondPath);
        if (isPlus) {
            var thirdPath = this.getNode('path', {
                d: 'M37.29,33.15v2.48h-1.4V33.15H33.42v-1.4h2.47V29.29h1.4v2.46h2.47v1.4Z',
            });
            svg.appendChild(thirdPath);
        }
        return svg;
    };
    IconsService.prototype.buildAdd = function () {
        return this.buildPlanIcon(true);
    };
    IconsService.prototype.buildPlanNow = function () {
        return this.buildPlanIcon(false);
    };
    IconsService.prototype.buildAr = function () {
        var svg = this.getSvg({ viewBox: '0 0 50 50' });
        var firstPath = this.getNode('path', {
            d: 'M24.41,33.24h0c-5.22-.08-9.5-2.78-14.31-9a.75.75,0,0,1-.16-.46c0-.63,4.46-6.73,10.67-8.84,8.34-2.84,15,3,19.19,8.38a.75.75,0,0,1,.16.46c0,.45-.63,1.34-1.87,2.63a.75.75,0,0,1-1.09-1,13.24,13.24,0,0,0,1.3-1.52c-4.4-5.57-9-8.3-13.69-8.15-6.69.23-11.71,6.36-13,8.06,5.49,7,9.55,8,12.8,8a.75.75,0,0,1,0,1.5Z',
        });
        var secondPath = this.getNode('path', {
            d: 'M24.94,29.4a5.42,5.42,0,0,1-5.05-3.5,5.58,5.58,0,0,1,1.56-6.51,5.3,5.3,0,0,1,6.44-.3,5.66,5.66,0,0,1,2.34,6.39A.75.75,0,1,1,28.79,25a4.18,4.18,0,0,0-1.74-4.7,3.79,3.79,0,0,0-4.65.21,4.12,4.12,0,0,0-1.12,4.79,3.9,3.9,0,0,0,4,2.55.74.74,0,0,1,.81.69.75.75,0,0,1-.69.81Z',
        });
        var graph = this.getNode('g');
        var thirdPath = this.getNode('path', {
            d: 'M30.5,35.1,30,33.68H27.18L26.7,35.1H25.06l2.92-8h1.23l2.93,8Zm-1.87-5.65-1,2.92h2Z',
        });
        var fourthPath = this.getNode('path', {
            d: 'M37.39,35.1l-1.57-3.2H34.69v3.2H33.13v-8h3.14a2.42,2.42,0,0,1,2.6,2.46,2.16,2.16,0,0,1-1.46,2.11L39.2,35.1Zm-1.22-6.62H34.69v2.12h1.48a1.06,1.06,0,1,0,0-2.12Z',
        });
        graph.appendChild(thirdPath);
        graph.appendChild(fourthPath);
        svg.appendChild(firstPath);
        svg.appendChild(secondPath);
        svg.appendChild(graph);
        return svg;
    };
    IconsService.prototype.buildConfigure = function () {
        var svg = this.getSvg({ viewBox: '0 0 50 50' });
        var path = this.getNode('path', {
            d: 'M34.67,10.9,28.9,8.22a1.87,1.87,0,0,0-2.48.91L16,31.42a1.86,1.86,0,0,0-.17.75L15.66,40a1.85,1.85,0,0,0,.53,1.34,1.9,1.9,0,0,0,1.35.57,1.86,1.86,0,0,0,1.23-.47l5.93-5.22a1.86,1.86,0,0,0,.46-.62L35.58,13.37A1.88,1.88,0,0,0,34.67,10.9ZM17.47,40.22l.14-7,4.91,2.55ZM32,16.94l-5.88-2.73,1.94-4.38L34,12.57Z',
        });
        svg.appendChild(path);
        return svg;
    };
    IconsService.prototype.buildMark = function () {
        var svg = this.getSvg({ viewBox: '0 0 50 50' });
        var path = this.getNode('path', {
            d: 'M32.16,12.05A7.89,7.89,0,0,0,25,16.51,7.93,7.93,0,0,0,10,20C10,29.35,25,39.64,25,39.64s15-10.37,15-19.66A7.91,7.91,0,0,0,32.16,12.05Z',
        });
        svg.appendChild(path);
        return svg;
    };
    IconsService.prototype.buildCopy = function () {
        var svg = this.getSvg({ viewBox: '0 0 32 32' });
        var firstPath = this.getNode('path', {
            d: 'M28.681 11.159c-0.694-0.947-1.662-2.053-2.724-3.116s-2.169-2.030-3.116-2.724c-1.612-1.182-2.393-1.319-2.841-1.319h-11.5c-1.379 0-2.5 1.122-2.5 2.5v23c0 1.378 1.121 2.5 2.5 2.5h19c1.378 0 2.5-1.122 2.5-2.5v-15.5c0-0.448-0.137-1.23-1.319-2.841zM24.543 9.457c0.959 0.959 1.712 1.825 2.268 2.543h-4.811v-4.811c0.718 0.556 1.584 1.309 2.543 2.268v0zM28 29.5c0 0.271-0.229 0.5-0.5 0.5h-19c-0.271 0-0.5-0.229-0.5-0.5v-23c0-0.271 0.229-0.5 0.5-0.5 0 0 11.499-0 11.5 0v7c0 0.552 0.448 1 1 1h7v15.5z',
        });
        var secondPath = this.getNode('path', {
            d: 'M18.841 1.319c-1.612-1.182-2.393-1.319-2.841-1.319h-11.5c-1.378 0-2.5 1.121-2.5 2.5v23c0 1.207 0.86 2.217 2 2.45v-25.45c0-0.271 0.229-0.5 0.5-0.5h15.215c-0.301-0.248-0.595-0.477-0.873-0.681z',
        });
        svg.appendChild(firstPath);
        svg.appendChild(secondPath);
        return svg;
    };
    IconsService.prototype.buildTrigger = function () {
        var svg = this.getSvg({ viewBox: '0 0 32.19 29.5' });
        var path1 = this.getNode('path', {
            d: 'M21,22.36c-1.57,0-1.87,1.36-1.87,3s0.17,3,1.87,3,1.87-1.36,1.87-3S22.59,22.36,21,22.36Z',
            transform: 'translate(-9 -15.26)'
        });
        var path2 = this.getNode('path', {
            d: 'M31.1,22.36c-1.57,0-1.87,1.36-1.87,3s0.17,3,1.87,3S33,27,33,25.36,32.66,22.36,31.1,22.36Z',
            transform: 'translate(-9 -15.26)'
        });
        var path3 = this.getNode('path', {
            d: 'M26,15.26c-5.86,0-17,.73-17,3.48V31.89a1.16,1.16,0,0,0,.17.49c1,2.06,9.46,3,16.85,3,5.86,0,17-.73,17-3.48V18.74C43,16,31.86,15.26,26,15.26ZM21,30.11c-3.46,0-4.69-2.14-4.69-4.79S17.6,20.53,21,20.53s4.69,2.14,4.69,4.79S24.47,30.11,21,30.11Zm10.08,0c-3.46,0-4.69-2.14-4.69-4.79s1.28-4.79,4.69-4.79,4.69,2.14,4.69,4.79S34.55,30.11,31.1,30.11Z',
            transform: 'translate(-9 -15.26)'
        });
        var path4 = this.getNode('path', {
            d: 'M31.1,28.36c-1.7,0-1.87-1.36-1.87-3s0.3-3,1.87-3,1.87,1.36,1.87,3S32.8,28.36,31.1,28.36Z',
            transform: 'translate(-9 -15.26)'
        });
        var path5 = this.getNode('path', {
            d: 'M21,28.36c-1.7,0-1.87-1.36-1.87-3s0.3-3,1.87-3,1.87,1.36,1.87,3S22.72,28.36,21,28.36Z',
            transform: 'translate(-9 -15.26)'
        });
        svg.appendChild(path1);
        svg.appendChild(path2);
        svg.appendChild(path3);
        svg.appendChild(path4);
        svg.appendChild(path5);
        return svg;
    };
    IconsService.prototype.buildVisualize = function () {
        var svg = this.getSvg({ viewBox: '0 0 50 50' });
        var path = this.getNode('path', {
            d: 'M25,34.59c-6.32,0-11.44-4.71-14.84-9.13a.75.75,0,0,1,0-.87c.24-.36,6-8.87,14.49-9.17C29.9,15.23,35,18.3,39.85,24.55A.74.74,0,0,1,40,25c0,.6-4.61,6.78-10.68,8.84A13.47,13.47,0,0,1,25,34.59ZM11.65,25c4.4,5.55,9,8.28,13.68,8.12,6.7-.23,11.74-6.38,13-8.08-4.4-5.55-9-8.28-13.69-8.12C17.93,17.14,12.91,23.28,11.65,25ZM25,30.49A5.49,5.49,0,1,1,30.38,25,5.45,5.45,0,0,1,25,30.49ZM25,21a4,4,0,1,0,3.91,4A4,4,0,0,0,25,21Z',
        });
        svg.appendChild(path);
        return svg;
    };
    IconsService.prototype.buildVr = function () {
        var svg = this.getSvg({ viewBox: '0 0 50 50' });
        var path = this.getNode('path', {
            d: 'M37.88,16.24H12.18A2.16,2.16,0,0,0,10,18.4V31.6a2.16,2.16,0,0,0,2.16,2.16H20a1.54,1.54,0,0,0,1.46-.93l1.75-4.38a1.92,1.92,0,0,1,3.5.06l1.52,4.26a1.59,1.59,0,0,0,1.46,1h8.12A2.16,2.16,0,0,0,40,31.6V18.46A2.05,2.05,0,0,0,37.88,16.24ZM18.6,28.8a3.33,3.33,0,0,1-3.33-3.33,3.33,3.33,0,1,1,6.66,0A3.33,3.33,0,0,1,18.6,28.8Zm12.85,0a3.33,3.33,0,0,1-3.33-3.33,3.33,3.33,0,0,1,6.66,0A3.33,3.33,0,0,1,31.45,28.8Z',
        });
        svg.appendChild(path);
        return svg;
    };
    IconsService.prototype.create = function (buttonType) {
        var button = ButtonsService_1.ButtonsService.convertButtonTypeToEnum(buttonType);
        if (button === ButtonsService_1.BUTTON_TYPE.ADD) {
            return this.buildAdd();
        }
        if (button === ButtonsService_1.BUTTON_TYPE.AR) {
            return this.buildAr();
        }
        if (button === ButtonsService_1.BUTTON_TYPE.CONFIGURE) {
            return this.buildConfigure();
        }
        if (button === ButtonsService_1.BUTTON_TYPE.VISUALIZE) {
            return this.buildVisualize();
        }
        if (button === ButtonsService_1.BUTTON_TYPE.VR) {
            return this.buildVr();
        }
        if (button === ButtonsService_1.BUTTON_TYPE.TRIGGER) {
            return this.buildTrigger();
        }
        if (button === ButtonsService_1.BUTTON_TYPE.MARK) {
            return this.buildMark();
        }
        if (button === ButtonsService_1.BUTTON_TYPE.START_NOW) {
            return this.buildPlanNow();
        }
    };
    IconsService.prototype.createCopy = function () {
        return this.buildCopy();
    };
    return IconsService;
}(Service_1.Service));
IconsService.SVG_NS = 'http://www.w3.org/2000/svg';
exports.IconsService = IconsService;

},{"../lib/Service":8,"./ButtonsService":10}],15:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Service_1 = require("../lib/Service");
var ImagesService = (function (_super) {
    __extends(ImagesService, _super);
    function ImagesService() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.images = {
            ios: 'https://a.storyblok.com/f/4e779959c8/ios.png',
            android: 'https://a.storyblok.com/f/1386db8cd0/android.png',
            desktop: 'https://a.storyblok.com/f/cf5aa03c64/desktop.png',
        };
        return _this;
    }
    ImagesService.prototype.preloadImages = function () {
        var ios = new Image();
        var android = new Image();
        var desktop = new Image();
        ios.src = this.images.ios;
        android.src = this.images.android;
        desktop.src = this.images.desktop;
    };
    return ImagesService;
}(Service_1.Service));
exports.ImagesService = ImagesService;

},{"../lib/Service":8}],16:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Service_1 = require("../lib/Service");
var RoomleTypeService_1 = require("./RoomleTypeService");
var ButtonsService_1 = require("./ButtonsService");
var SettingsService_1 = require("./SettingsService");
var MobileDetectService = (function (_super) {
    __extends(MobileDetectService, _super);
    function MobileDetectService() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.isOSCached = null;
        _this.isAndroidCached = null;
        _this.isIPadCached = null;
        _this.isSupportedMobileCached = null;
        _this.buttonsService = ButtonsService_1.ButtonsService.inject();
        return _this;
    }
    MobileDetectService.prototype.isIOS = function () {
        if (this.isOSCached !== null) {
            return this.isOSCached;
        }
        return /iPad|iPhone|iPod/i.test(navigator.userAgent) && !window.MSStream; // USE MSStream because of http://stackoverflow.com/a/9039885
    };
    MobileDetectService.prototype.isAndroid = function () {
        if (this.isAndroidCached !== null) {
            return this.isAndroidCached;
        }
        return /Android/i.test(navigator.userAgent) && !window.MSStream; // USE MSStream because of http://stackoverflow.com/a/9039885
    };
    MobileDetectService.prototype.isSupportedMobile = function () {
        if (this.isSupportedMobileCached !== null) {
            return this.isSupportedMobileCached;
        }
        return this.isIOS() || this.isAndroid();
    };
    MobileDetectService.prototype.isIPad = function () {
        if (this.isIPadCached !== null) {
            return this.isIPadCached;
        }
        return /iPad/i.test(navigator.userAgent) && !window.MSStream; // USE MSStream because of http://stackoverflow.com/a/9039885
    };
    MobileDetectService.prototype.handlePlan = function (id, type, buttonType) {
        var buttonTypeStr = ButtonsService_1.ButtonsService.convertButtonType(buttonType);
        var typeStr = type;
        var iosPlanLink = 'roomle://3d/planId/' + id;
        var desktopLink = SettingsService_1.SettingsService.settings.web.baseUrl + 'editor/' + id;
        if (buttonType === ButtonsService_1.BUTTON_TYPE.VISUALIZE) {
            var viewrLink = 'roomleviewer://plan/' + id;
            if (this.isAndroid()) {
                return {
                    type: buttonTypeStr,
                    alternate: null,
                    link: viewrLink,
                    os: 'android',
                    roomleType: typeStr,
                    id: id
                };
            }
            if (this.isIOS()) {
                return {
                    type: buttonTypeStr,
                    alternate: null,
                    link: iosPlanLink,
                    os: 'ios',
                    roomleType: typeStr,
                    id: id
                };
            }
            return {
                type: buttonTypeStr,
                alternate: null,
                link: desktopLink,
                os: 'desktop',
                roomleType: typeStr,
                id: id
            };
        }
        if (buttonType === ButtonsService_1.BUTTON_TYPE.VR) {
            var viewrLink = 'roomleviewer://vr/' + id;
            if (this.isAndroid()) {
                return {
                    type: buttonTypeStr,
                    alternate: null,
                    link: viewrLink,
                    os: 'android',
                    roomleType: typeStr,
                    id: id
                };
            }
            if (this.isIOS()) {
                return { type: buttonTypeStr, alternate: null, link: viewrLink, os: 'ios', roomleType: typeStr, id: id };
            }
            return { type: buttonTypeStr, alternate: 'ios', link: viewrLink, os: 'desktop', roomleType: typeStr, id: id };
        }
        if (buttonType === ButtonsService_1.BUTTON_TYPE.START_NOW) {
            var viewrLink = 'roomleviewer://plan/' + id;
            if (this.isAndroid()) {
                return {
                    type: buttonTypeStr,
                    alternate: null,
                    link: viewrLink,
                    os: 'android',
                    roomleType: typeStr,
                    id: id
                };
            }
            if (this.isIOS()) {
                return {
                    type: buttonTypeStr,
                    alternate: null,
                    link: iosPlanLink,
                    os: 'ios',
                    roomleType: typeStr,
                    id: id
                };
            }
            return {
                type: buttonTypeStr,
                alternate: null,
                link: desktopLink,
                os: 'desktop',
                roomleType: typeStr,
                id: id
            };
        }
        return null;
    };
    MobileDetectService.prototype.createLinkForItemOrConfiguration = function (id, type, buttonType, isItem) {
        var typeStr = type;
        var buttonTypeStr = ButtonsService_1.ButtonsService.convertButtonType(buttonType);
        if (isItem) {
        }
        var iosIdentifier = (!isItem && type !== RoomleTypeService_1.ROOMLE_TYPE.CONFIGURABLE_ITEM) ? 'configurationId' : 'catalogItemId';
        var webIdentifier = (!isItem && type !== RoomleTypeService_1.ROOMLE_TYPE.CONFIGURABLE_ITEM) ? 'configurationId[]' : 'itemId[]';
        if (buttonType === ButtonsService_1.BUTTON_TYPE.ADD) {
            var desktopLink = SettingsService_1.SettingsService.settings.web.baseUrl + 'editor/' + SettingsService_1.SettingsService.settings.planId + '?' + webIdentifier + '=' + id;
            var iosLink = 'roomle://addToPlan/' + iosIdentifier + '/' + id + '?planId=' + SettingsService_1.SettingsService.settings.planId;
            if (this.isAndroid()) {
                return {
                    type: buttonTypeStr,
                    alternate: 'desktop',
                    link: desktopLink,
                    os: 'android',
                    roomleType: typeStr,
                    id: id
                };
            }
            if (this.isIOS()) {
                return null; //{type: buttonTypeStr, alternate: null, link: iosLink, os: 'ios', roomleType: typeStr, id: id};
            }
            return {
                type: buttonTypeStr,
                alternate: null,
                link: desktopLink,
                os: 'desktop',
                roomleType: typeStr,
                id: id
            };
        }
        if (buttonType === ButtonsService_1.BUTTON_TYPE.AR) {
            var iosLink = 'roomle://ar/' + iosIdentifier + '/' + id;
            if (this.isAndroid()) {
                return {
                    type: buttonTypeStr,
                    alternate: 'ios',
                    link: iosLink,
                    os: 'android',
                    roomleType: typeStr,
                    id: id
                };
            }
            if (this.isIOS()) {
                return { type: buttonTypeStr, alternate: null, link: iosLink, os: 'ios', roomleType: typeStr, id: id };
            }
            return { type: buttonTypeStr, alternate: 'ios', link: iosLink, os: 'desktop', roomleType: typeStr, id: id };
        }
        if (buttonType === ButtonsService_1.BUTTON_TYPE.CONFIGURE && (type === RoomleTypeService_1.ROOMLE_TYPE.CONFIGURATION || type === RoomleTypeService_1.ROOMLE_TYPE.CONFIGURABLE_ITEM)) {
            var isConfigurableItem = (type === RoomleTypeService_1.ROOMLE_TYPE.CONFIGURATION) ? false : true;
            var desktopLink = SettingsService_1.SettingsService.settings.web.baseUrl + 'configurator/' + id + (isConfigurableItem ? '?isItem=true' : '');
            var iosLink = 'roomle://configuration/' + iosIdentifier + '/' + id;
            if (this.isAndroid()) {
                return {
                    type: buttonTypeStr,
                    alternate: 'desktop',
                    link: desktopLink,
                    os: 'android',
                    roomleType: typeStr,
                    id: id
                };
            }
            if (this.isIOS()) {
                return { type: buttonTypeStr, alternate: null, link: iosLink, os: 'ios', roomleType: typeStr, id: id };
            }
            return {
                type: buttonTypeStr,
                alternate: null,
                link: desktopLink,
                os: 'desktop',
                roomleType: typeStr,
                id: id
            };
        }
        if (buttonType === ButtonsService_1.BUTTON_TYPE.MARK) {
            if (this.isAndroid()) {
                return {
                    type: buttonTypeStr,
                    alternate: null,
                    link: 'www.roomle.com',
                    os: 'android',
                    roomleType: typeStr,
                    id: id
                };
            }
            if (this.isIOS()) {
                return {
                    type: buttonTypeStr,
                    alternate: null,
                    link: 'www.roomle.com',
                    os: 'ios',
                    roomleType: typeStr,
                    id: id
                };
            }
            return {
                type: buttonTypeStr,
                alternate: null,
                link: 'www.roomle.com',
                os: 'desktop',
                roomleType: typeStr,
                id: id
            };
        }
        if (buttonType === ButtonsService_1.BUTTON_TYPE.VISUALIZE) {
            if (this.isAndroid()) {
                return {
                    type: buttonTypeStr,
                    alternate: null,
                    link: 'roomleviewer://item/' + id,
                    os: 'android',
                    roomleType: typeStr,
                    id: id
                };
            }
            if (this.isIOS()) {
                return null;
            }
            return null; // {type: buttonTypeStr, alternate: '', link: 'www.roomle'};
        }
        return null;
    };
    MobileDetectService.prototype.handleItem = function (id, type, buttonType) {
        var isItem = true;
        return this.createLinkForItemOrConfiguration(id, type, buttonType, isItem);
    };
    MobileDetectService.prototype.handleConfiguration = function (id, type, buttonType) {
        var isItem = false;
        return this.createLinkForItemOrConfiguration(id, type, buttonType, isItem);
    };
    MobileDetectService.prototype.generateLink = function (id, type, buttonType, callbackUrl) {
        if (callbackUrl === void 0) { callbackUrl = null; }
        var deeplink = null;
        if (type === RoomleTypeService_1.ROOMLE_TYPE.ITEM) {
            deeplink = this.handleItem(id, type, buttonType);
        }
        else if (type === RoomleTypeService_1.ROOMLE_TYPE.CONFIGURATION || type === RoomleTypeService_1.ROOMLE_TYPE.CONFIGURABLE_ITEM) {
            deeplink = this.handleConfiguration(id, type, buttonType);
        }
        else if (type === RoomleTypeService_1.ROOMLE_TYPE.PLAN) {
            deeplink = this.handlePlan(id, type, buttonType);
        }
        if (!deeplink) {
            return null;
        }
        var seperator = deeplink.link.indexOf('?') === -1 ? '?' : '&';
        deeplink.link = deeplink.link + seperator + 'callback=' + callbackUrl;
        return deeplink;
    };
    MobileDetectService.prototype.getLinks = function (id, type, callbackUrl) {
        var _this = this;
        if (callbackUrl === void 0) { callbackUrl = null; }
        var availableButtons = this.buttonsService.availableButtons;
        var links = [];
        availableButtons.forEach(function (button) {
            var link = _this.generateLink(id, type, button, callbackUrl);
            if (link) {
                links.push(link);
            }
        });
        return links;
    };
    return MobileDetectService;
}(Service_1.Service));
exports.MobileDetectService = MobileDetectService;

},{"../lib/Service":8,"./ButtonsService":10,"./RoomleTypeService":20,"./SettingsService":21}],17:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Service_1 = require("../lib/Service");
var MobileRedirectService = (function (_super) {
    __extends(MobileRedirectService, _super);
    function MobileRedirectService() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.delay = 1200;
        _this.oss = {
            android: {
                storePrefix: 'https://play.google.com/store/apps/details?id='
            },
            ios: {
                storePrefix: 'https://itunes.apple.com/app/'
            }
        };
        return _this;
    }
    MobileRedirectService.prototype.getTime = function () {
        return new Date().getTime();
    };
    MobileRedirectService.prototype.open = function (url, newWindow, callback) {
        if (newWindow === void 0) { newWindow = false; }
        if (callback === void 0) { callback = null; }
        if (typeof callback === 'function') {
            return callback(url);
        }
        if (newWindow) {
            window.open(url);
        }
        else {
            window.location.href = url;
        }
    };
    MobileRedirectService.prototype.handleAndroidBrowsers = function (appId, href, scheme) {
        // Android Mobile
        var isAndroidMobile = navigator.userAgent.indexOf('Android') > -1 &&
            navigator.userAgent.indexOf('Mozilla/5.0') > -1 &&
            navigator.userAgent.indexOf('AppleWebKit') > -1;
        // Android Browser (not Chrome)
        var regExAppleWebKit = new RegExp('AppleWebKit\/([\d.]+)');
        var resultAppleWebKitRegEx = regExAppleWebKit.exec(navigator.userAgent);
        var appleWebKitVersion = (resultAppleWebKitRegEx === null ? null : parseFloat(regExAppleWebKit.exec(navigator.userAgent)[1]));
        var isAndroidBrowser = isAndroidMobile && appleWebKitVersion !== null && appleWebKitVersion > 500;
        if (isAndroidBrowser) {
            return 'intent:' + href.split(':')[1] + '#Intent;scheme=' + scheme + ';package=' +
                appId + ';S.browser_fallback_url=' + encodeURI(href);
        }
        else {
            return href;
        }
    };
    MobileRedirectService.prototype.redirect = function (deeplink, newWindow, callback) {
        if (newWindow === void 0) { newWindow = false; }
        if (callback === void 0) { callback = null; }
        this.perfromDeepLink(deeplink.link, deeplink.os, newWindow, callback);
    };
    MobileRedirectService.prototype.perfromDeepLink = function (href, os, newWindow, callback) {
        var _this = this;
        if (newWindow === void 0) { newWindow = false; }
        if (callback === void 0) { callback = null; }
        var clicked = false;
        var timeout = null;
        var data = this.parseHref(href, os);
        var scheme = data.scheme;
        var appId = data.appId;
        var start = this.getTime();
        clicked = true;
        timeout = setTimeout(function () {
            if (os === 'desktop') {
                return;
            }
            if (!clicked || !timeout) {
                return;
            }
            var now = _this.getTime();
            clicked = false;
            timeout = null;
            if (now - start >= _this.delay * 2) {
                return;
            }
            if (appId) {
                _this.open(_this.oss[os].storePrefix + appId, newWindow);
            }
            else if (href) {
                _this.open(href, newWindow);
            }
        }, this.delay);
        //appId, this.oss[os].storePrefix + appId, href, scheme
        var finalURI = this.handleAndroidBrowsers(appId, href, scheme);
        this.open(finalURI, newWindow, callback);
    };
    MobileRedirectService.prototype.parseHref = function (href, osin) {
        var hrefParts = href.split(':');
        var scheme = hrefParts[0];
        var appId = 'roomle/id732050356';
        if (scheme === 'roomleviewer') {
            appId = 'com.roomle.viewer';
            if (osin === 'ios') {
                appId = 'roomle-viewr/id1053860177';
            }
        }
        return { appId: appId, scheme: scheme, os: osin };
    };
    MobileRedirectService.prototype.createDeeplinkFor = function (el, os) {
        var _this = this;
        var href = el.getAttribute('href');
        var data = this.parseHref(href, os);
        var appId = data.appId;
        if (os && appId) {
            el.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopImmediatePropagation();
                _this.perfromDeepLink(href, os);
            });
        }
        else if (!href || href === '#') {
            el.style.display = 'none';
        }
    };
    ;
    return MobileRedirectService;
}(Service_1.Service));
exports.MobileRedirectService = MobileRedirectService;

},{"../lib/Service":8}],18:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Service_1 = require("../lib/Service");
var PolyfillService = (function (_super) {
    __extends(PolyfillService, _super);
    function PolyfillService() {
        var _this = _super.call(this) || this;
        if (!Element.prototype.matches) {
            // CAST TO ANY AS QUICK&DIRTY SOLUTION FOR NON STANDARD NAMES!
            Element.prototype.matches =
                Element.prototype.matchesSelector ||
                    Element.prototype.mozMatchesSelector ||
                    Element.prototype.msMatchesSelector ||
                    Element.prototype.oMatchesSelector ||
                    Element.prototype.webkitMatchesSelector ||
                    function (s) {
                        var matches = (this.document || this.ownerDocument).querySelectorAll(s), i = matches.length;
                        while (--i >= 0 && matches.item(i) !== this) {
                        }
                        return i > -1;
                    };
        }
        return _this;
    }
    return PolyfillService;
}(Service_1.Service));
exports.PolyfillService = PolyfillService;

},{"../lib/Service":8}],19:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
//import { Promise } from 'es6-promise';
var Service_1 = require("../lib/Service");
var RequestService = (function (_super) {
    __extends(RequestService, _super);
    function RequestService() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RequestService.prototype.fetch = function (url, options) {
        return new Promise(function (resolve, reject) {
            if (!options) {
                options = {};
            }
            var xhr = new XMLHttpRequest();
            var headers = options.headers;
            // Check if method is GET and body ias an object
            // If it is so, parse body object an append all properties as GET parameters to the url
            if (options.method === 'GET' && options.body) {
                if (typeof options.body === 'object') {
                    var separator = '';
                    var uri = '';
                    for (var key in options.body) {
                        if (options.body.hasOwnProperty(key)) {
                            var encodedKey = encodeURIComponent(key);
                            var encodedContent = encodeURIComponent(options.body[key]);
                            uri += "" + separator + encodedKey + "=" + encodedContent;
                            separator = '&';
                        }
                    }
                    // append the parameters to the url
                    url = url + (url.indexOf('?') === -1 ? '?' : '&') + uri;
                }
                else {
                    // Body is not an object => not allowed
                    reject(new TypeError('Non object like body not allowed for GET requests. The body has to be an object so the properties will be appended as a GET parameter to the url.'));
                    return;
                }
            }
            else if (typeof options.body !== 'string') {
                // if body is not a string, parse it to a json string
                options.body = JSON.stringify(options.body);
            }
            // Body not allowed for HEAD requests
            if (options.method === 'HEAD' && options.body) {
                reject(new TypeError('Body not allowed for HEAD requests'));
                return;
            }
            // Add onload event listener
            xhr.onload = function (event) {
                if (xhr.status >= 400 || xhr.status === 0) {
                    reject(new Error(xhr.responseText));
                }
                else {
                    resolve('response' in xhr ? xhr.response : xhr.responseText);
                }
            };
            // Add onerror event listener
            xhr.onerror = function (event) {
                reject(event.error);
            };
            xhr.onabort = function (event) {
                reject(new TypeError('Network request aborted'));
            };
            // Add timeout event listener
            xhr.ontimeout = function (event) {
                reject(new TypeError('Network request timed out'));
            };
            if (options.credentials && options.credentials.username) {
                xhr.open(options.method ? options.method : 'GET', url, true, options.credentials.username, options.credentials.password);
            }
            else {
                xhr.open(options.method ? options.method : 'GET', url, true);
            }
            if (typeof headers === 'object') {
                for (var key in headers) {
                    if (headers.hasOwnProperty(key)) {
                        xhr.setRequestHeader(key, headers[key]);
                    }
                }
            }
            xhr.send(typeof options.body === 'undefined' ? null : options.body);
        });
    };
    RequestService.prototype.fetchJSON = function (url, options) {
        if (!options) {
            options = {};
        }
        if (!options.headers) {
            options.headers = {};
        }
        if (!options.headers['Content-Type']) {
            options.headers['Content-Type'] = 'application/json';
        }
        return this.fetch(url, options).then(function (result) {
            return JSON.parse(result);
        });
    };
    return RequestService;
}(Service_1.Service));
exports.RequestService = RequestService;

},{"../lib/Service":8}],20:[function(require,module,exports){
"use strict";
var ROOMLE_TYPE;
(function (ROOMLE_TYPE) {
    ROOMLE_TYPE[ROOMLE_TYPE["ITEM"] = 0] = "ITEM";
    ROOMLE_TYPE[ROOMLE_TYPE["CONFIGURATION"] = 1] = "CONFIGURATION";
    ROOMLE_TYPE[ROOMLE_TYPE["PLAN"] = 2] = "PLAN";
    ROOMLE_TYPE[ROOMLE_TYPE["CONFIGURABLE_ITEM"] = 3] = "CONFIGURABLE_ITEM";
})(ROOMLE_TYPE = exports.ROOMLE_TYPE || (exports.ROOMLE_TYPE = {}));
var RoomleTypeService = (function () {
    function RoomleTypeService() {
    }
    // TYPES ARE FROM OUTSIDE CONVERT THEM TO ENUM BECAUSE "item" is nicer than "0"
    RoomleTypeService.convertTypeToEnum = function (type) {
        if (type === 'item') {
            return ROOMLE_TYPE.ITEM;
        }
        if (type === 'configuration') {
            return ROOMLE_TYPE.CONFIGURATION;
        }
        if (type === 'plan') {
            return ROOMLE_TYPE.PLAN;
        }
        if (type === 'configurable-item') {
            return ROOMLE_TYPE.CONFIGURABLE_ITEM;
        }
        return null;
    };
    RoomleTypeService.convertRoomleType = function (type) {
        if (type === ROOMLE_TYPE.ITEM) {
            return 'item';
        }
        if (type === ROOMLE_TYPE.CONFIGURATION) {
            return 'configuration';
        }
        if (type === ROOMLE_TYPE.PLAN) {
            return 'plan';
        }
        if (type === ROOMLE_TYPE.CONFIGURABLE_ITEM) {
            return 'configurable-item';
        }
        return null;
    };
    return RoomleTypeService;
}());
exports.RoomleTypeService = RoomleTypeService;

},{}],21:[function(require,module,exports){
"use strict";
var SettingsService = (function () {
    function SettingsService(settings) {
        this.settings = settings;
    }
    SettingsService.setDefault = function (settings, key, defaultValue) {
        var toCheck = settings;
        var keys = key.split('.');
        var keysLength = keys.length - 1; // LAST ONE IS SET OUTSIDE THE LOOP
        for (var i = 0; i < keysLength; i++) {
            if (!toCheck[keys[i]]) {
                toCheck[keys[i]] = {};
            }
            toCheck = toCheck[keys[i]];
        }
        if (toCheck[keys[keysLength]] === undefined) {
            toCheck[keys[keysLength]] = defaultValue;
        }
    };
    SettingsService.setDeeplinkTranslation = function (settings, linkType, translation) {
        SettingsService.setDefault(settings, 'translations.' + linkType + '.heading', translation.heading);
        SettingsService.setDefault(settings, 'translations.' + linkType + '.hint.ios', translation.hint.ios);
        SettingsService.setDefault(settings, 'translations.' + linkType + '.hint.android', translation.hint.android);
        SettingsService.setDefault(settings, 'translations.' + linkType + '.hint.desktop', translation.hint.desktop);
    };
    SettingsService.init = function (settings) {
        if (!(this._instance instanceof SettingsService)) {
            SettingsService.setDefault(settings, 'web.baseUrl', 'https://www.roomle.com/app/');
            SettingsService.setDefault(settings, 'viewr.baseUrl', 'https://www.roomle.com/');
            SettingsService.setDefault(settings, 'ios.baseUrl', 'https://www.roomle.com/');
            SettingsService.setDefault(settings, 'dataSelector.type', 'data-rml-type');
            SettingsService.setDefault(settings, 'dataSelector.id', 'data-rml-id');
            SettingsService.setDefault(settings, 'dataSelector.action', 'data-rml-action');
            SettingsService.setDefault(settings, 'planId', '8a708083560ca6cf01560cd7361a014a');
            SettingsService.setDefault(settings, 'createPopUp', true);
            SettingsService.setDefault(settings, 'showBackButton', true);
            SettingsService.setDefault(settings, 'html.containerClass', 'roomle-buttons');
            SettingsService.setDefault(settings, 'html.containerType', 'div');
            SettingsService.setDefault(settings, 'html.buttonsContainer', 'ul');
            SettingsService.setDefault(settings, 'html.buttonElement', 'li');
            SettingsService.setDefault(settings, 'css.buttons.position', 'absolute');
            SettingsService.setDefault(settings, 'css.buttons.top', '0');
            SettingsService.setDefault(settings, 'css.buttons.right', '0');
            SettingsService.setDefault(settings, 'css.buttons.line-height', 'normal');
            SettingsService.setDefault(settings, 'css.buttons.visibility', 'visible !important');
            SettingsService.setDefault(settings, 'css.item.position', 'relative');
            SettingsService.setDefault(settings, 'callback', {});
            SettingsService.setDefault(settings, 'callback.button', {});
            SettingsService.setDefault(settings, 'popUpSelector', 'data-rml-deeplink-popup-container');
            SettingsService.setDefault(settings, 'callback.booted', function () {
            });
            SettingsService.setDefault(settings, 'translations.errors.deeplinkcreate', 'Error creating deeplink');
            var hint = ''; //'This feature is not available on your platform. ';
            var androidHint = hint + 'Enter the following link into the browser of your desktop device';
            var iosHint = hint + 'Enter the following link into the browser of your iOS device';
            this.setDeeplinkTranslation(settings, 'ar', {
                heading: 'Visualize in AR',
                hint: { ios: iosHint, android: null, desktop: null }
            });
            this.setDeeplinkTranslation(settings, 'add', {
                heading: 'Add to plan',
                hint: { ios: null, android: null, desktop: androidHint }
            });
            this.setDeeplinkTranslation(settings, 'configure', {
                heading: 'Customize',
                hint: { ios: null, android: null, desktop: androidHint }
            });
            this.setDeeplinkTranslation(settings, 'mark', {
                heading: 'Favourite',
                hint: { ios: null, android: null, desktop: null }
            });
            this.setDeeplinkTranslation(settings, 'trigger', {
                heading: 'Trigger',
                hint: { ios: null, android: null, desktop: null }
            });
            this.setDeeplinkTranslation(settings, 'visualize', {
                heading: 'Visualize',
                hint: { ios: null, android: androidHint, desktop: null }
            });
            this.setDeeplinkTranslation(settings, 'vr', {
                heading: 'View in VR',
                hint: { ios: iosHint, android: '', desktop: '' }
            });
            this.setDeeplinkTranslation(settings, 'start_now', {
                heading: 'Start planning now',
                hint: { ios: iosHint, android: '', desktop: '' }
            });
            this._instance = new this(settings);
        }
        return this._instance;
    };
    SettingsService.getInstance = function () {
        return this._instance;
    };
    Object.defineProperty(SettingsService, "settings", {
        get: function () {
            return SettingsService.getInstance().settings;
        },
        enumerable: true,
        configurable: true
    });
    return SettingsService;
}());
exports.SettingsService = SettingsService;

},{}],22:[function(require,module,exports){
"use strict";
var EnumEx = (function () {
    function EnumEx() {
    }
    EnumEx.getNamesAndValues = function (e) {
        return this.getNames(e).map(function (n) { return { name: n, value: e[n] }; });
    };
    EnumEx.getNames = function (e) {
        return this.getObjValues(e).filter(function (v) { return typeof v === 'string'; });
    };
    EnumEx.getValues = function (e) {
        return this.getObjValues(e).filter(function (v) { return typeof v === 'number'; });
    };
    EnumEx.getObjValues = function (e) {
        return Object.keys(e).map(function (k) { return e[k]; });
    };
    return EnumEx;
}());
exports.EnumEx = EnumEx;

},{}]},{},[9])

//# sourceMappingURL=roomle-button.js.map
