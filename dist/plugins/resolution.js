/*!
* Photo Sphere Viewer 4.7.0
* @copyright 2014-2015 Jérémy Heleine
* @copyright 2015-2022 Damien "Mistic" Sorel
* @licence MIT (https://opensource.org/licenses/MIT)
*/
import { DEFAULTS, PSVError, CONSTANTS, utils, AbstractPlugin } from 'photo-sphere-viewer';

function _extends() {
  _extends = Object.assign ? Object.assign.bind() : function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };
  return _extends.apply(this, arguments);
}

function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;

  _setPrototypeOf(subClass, superClass);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };
  return _setPrototypeOf(o, p);
}

/**
 * @summary Available events
 * @enum {string}
 * @memberof PSV.plugins.ResolutionPlugin
 * @constant
 */
var EVENTS = {
  /**
   * @event resolution-changed
   * @memberof PSV.plugins.ResolutionPlugin
   * @summary Triggered when the resolution is changed
   * @param {string} resolutionId
   */
  RESOLUTION_CHANGED: 'resolution-changed'
};

/**
 * @typedef {Object} PSV.plugins.ResolutionPlugin.Resolution
 * @property {string} id
 * @property {string} label
 * @property {*} panorama
 */

/**
 * @typedef {Object} PSV.plugins.ResolutionPlugin.Options
 * @property {PSV.plugins.ResolutionPlugin.Resolution[]} resolutions - list of available resolutions
 * @property {boolean} [showBadge=true] - show the resolution id as a badge on the settings button
 */

DEFAULTS.lang.resolution = 'Quality';
/**
 * @summary Adds a setting to choose between multiple resolutions of the panorama.
 * @extends PSV.plugins.AbstractPlugin
 * @memberof PSV.plugins
 */

var ResolutionPlugin = /*#__PURE__*/function (_AbstractPlugin) {
  _inheritsLoose(ResolutionPlugin, _AbstractPlugin);

  /**
   * @param {PSV.Viewer} psv
   * @param {PSV.plugins.ResolutionPlugin.Options} options
   */
  function ResolutionPlugin(psv, options) {
    var _this;

    _this = _AbstractPlugin.call(this, psv) || this;
    /**
     * @type {PSV.plugins.SettingsPlugin}
     * @readonly
     * @private
     */

    _this.settings = null;
    /**
     * @summary Available resolutions
     * @member {PSV.plugins.ResolutionPlugin.Resolution[]}
     */

    _this.resolutions = [];
    /**
     * @summary Available resolutions
     * @member {Object.<string, PSV.plugins.ResolutionPlugin.Resolution>}
     * @private
     */

    _this.resolutionsById = {};
    /**
     * @type {Object}
     * @property {string} resolution - Current resolution
     * @private
     */

    _this.prop = {
      resolution: null
    };
    /**
     * @type {PSV.plugins.ResolutionPlugin.Options}
     */

    _this.config = _extends({
      showBadge: true
    }, options);
    return _this;
  }
  /**
   * @package
   */


  var _proto = ResolutionPlugin.prototype;

  _proto.init = function init() {
    var _this2 = this;

    _AbstractPlugin.prototype.init.call(this);

    this.settings = this.psv.getPlugin('settings');

    if (!this.settings) {
      throw new PSVError('Resolution plugin requires the Settings plugin');
    }

    this.settings.addSetting({
      id: ResolutionPlugin.id,
      type: 'options',
      label: this.psv.config.lang.resolution,
      current: function current() {
        return _this2.prop.resolution;
      },
      options: function options() {
        return _this2.__getSettingsOptions();
      },
      apply: function apply(resolution) {
        return _this2.setResolution(resolution);
      },
      badge: !this.config.showBadge ? null : function () {
        return _this2.prop.resolution;
      }
    });
    this.psv.on(CONSTANTS.EVENTS.PANORAMA_LOADED, this);

    if (this.config.resolutions) {
      this.setResolutions(this.config.resolutions);
      delete this.config.resolutions;
    }
  }
  /**
   * @package
   */
  ;

  _proto.destroy = function destroy() {
    this.psv.off(CONSTANTS.EVENTS.PANORAMA_LOADED, this);
    this.settings.removeSetting(ResolutionPlugin.id);

    _AbstractPlugin.prototype.destroy.call(this);
  }
  /**
   * @summary Handles events
   * @param {Event} e
   * @private
   */
  ;

  _proto.handleEvent = function handleEvent(e) {
    if (e.type === CONSTANTS.EVENTS.PANORAMA_LOADED) {
      this.__refreshResolution();
    }
  }
  /**
   * @summary Changes the available resolutions
   * @param {PSV.plugins.ResolutionPlugin.Resolution[]} resolutions
   */
  ;

  _proto.setResolutions = function setResolutions(resolutions) {
    var _this3 = this;

    this.resolutions = resolutions;
    this.resolutionsById = {};
    resolutions.forEach(function (resolution) {
      if (!resolution.id) {
        throw new PSVError('Missing resolution id');
      }

      _this3.resolutionsById[resolution.id] = resolution;
    });

    this.__refreshResolution();
  }
  /**
   * @summary Changes the current resolution
   * @param {string} id
   */
  ;

  _proto.setResolution = function setResolution(id) {
    if (!this.resolutionsById[id]) {
      throw new PSVError("Resolution " + id + " unknown");
    }

    return this.psv.setPanorama(this.resolutionsById[id].panorama, {
      transition: false,
      showLoader: false
    });
  }
  /**
   * @summary Returns the current resolution
   * @return {string}
   */
  ;

  _proto.getResolution = function getResolution() {
    return this.prop.resolution;
  }
  /**
   * @summary Updates current resolution on panorama load
   * @private
   */
  ;

  _proto.__refreshResolution = function __refreshResolution() {
    var _this4 = this;

    var resolution = this.resolutions.find(function (r) {
      return utils.deepEqual(_this4.psv.config.panorama, r.panorama);
    });

    if (this.prop.resolution !== (resolution == null ? void 0 : resolution.id)) {
      var _this$settings;

      this.prop.resolution = resolution == null ? void 0 : resolution.id;
      (_this$settings = this.settings) == null ? void 0 : _this$settings.updateBadge();
      this.trigger(EVENTS.RESOLUTION_CHANGED, this.prop.resolution);
    }
  }
  /**
   * @summary Returns options for Settings plugin
   * @return {PSV.plugins.SettingsPlugin.Option[]}
   * @private
   */
  ;

  _proto.__getSettingsOptions = function __getSettingsOptions() {
    return this.resolutions.map(function (resolution) {
      return {
        id: resolution.id,
        label: resolution.label
      };
    });
  };

  return ResolutionPlugin;
}(AbstractPlugin);
ResolutionPlugin.id = 'resolution';
ResolutionPlugin.EVENTS = EVENTS;

export { EVENTS, ResolutionPlugin };
//# sourceMappingURL=resolution.js.map
