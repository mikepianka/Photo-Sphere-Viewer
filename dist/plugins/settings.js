/*!
* Photo Sphere Viewer 4.7.0
* @copyright 2014-2015 Jérémy Heleine
* @copyright 2015-2022 Damien "Mistic" Sorel
* @licence MIT (https://opensource.org/licenses/MIT)
*/
import { CONSTANTS, AbstractButton, DEFAULTS, registerButton, PSVError, utils, AbstractPlugin } from 'photo-sphere-viewer';

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

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

var check = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 90 90\"><polygon fill=\"currentColor\" points=\"0,48 10,35 36,57 78,10 90,21 37,79 \"/><!-- Created by Zahroe from the Noun Project --></svg>\r\n";

var chevron = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><path fill=\"currentColor\" d=\"M86.2 50.7l-44 44-9.9-9.9 34.1-34.1-34.7-34.8L41.6 6z\"/><!-- Created by Renee Ramsey-Passmore from the Noun Project--></svg>\r\n";

var switchOff = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 200 100\" width=\"2.4em\" height=\"1.2em\"><path fill=\"currentColor\" transform=\"scale(1.88) translate(0, -25)\" d=\"M72 73.2H44A26.4 26.4 0 0044 30h28a21.6 21.6 0 010 43.2M7.2 51.6a21.6 21.6 0 1143.2 0 21.6 21.6 0 01-43.2 0M72 25.2H28.8a26.4 26.4 0 000 52.8H72a26.4 26.4 0 000-52.8\"/><!-- Created by Nikita from the Noun Project --></svg>\r\n";

var switchOn = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 200 100\" width=\"2.4em\" height=\"1.2em\"><path fill=\"currentColor\" transform=\"scale(1.88) translate(0, -25)\" d=\"M72 73.2A21.6 21.6 0 1172 30a21.6 21.6 0 010 43.2M2.4 51.6A26.4 26.4 0 0028.8 78H72a26.4 26.4 0 000-52.8H28.8A26.4 26.4 0 002.4 51.6\"/><!-- Created by Nikita from the Noun Project --></svg>\r\n";

/**
 * @summary Available events
 * @enum {string}
 * @memberof PSV.plugins.ResolutionPlugin
 * @constant
 */

var EVENTS = {
  /**
   * @event setting-changed
   * @memberof PSV.plugins.SettingsPlugin
   * @summary Triggered when a setting is changed
   * @param {string} settingId
   * @param {any} value
   */
  SETTING_CHANGED: 'setting-changed'
};
/**
 * @summary Panel identifier for settings content
 * @type {string}
 * @constant
 * @private
 */

var ID_PANEL = 'settings';
/**
 * @summary Property name added to settings items
 * @type {string}
 * @constant
 * @private
 */

var SETTING_DATA = 'settingId';
/**
 * @summary Setting item template, by type
 * @constant
 * @private
 */

var SETTINGS_TEMPLATE_ = {
  options: function options(setting, optionsCurrent) {
    return "\n      <span class=\"psv-settings-item-label\">" + setting.label + "</span>\n      <span class=\"psv-settings-item-value\">" + optionsCurrent(setting) + "</span>\n      <span class=\"psv-settings-item-icon\">" + chevron + "</span>\n    ";
  },
  toggle: function toggle(setting) {
    return "\n      <span class=\"psv-settings-item-label\">" + setting.label + "</span>\n      <span class=\"psv-settings-item-value\">" + (setting.active() ? switchOn : switchOff) + "</span>\n    ";
  }
};
/**
 * @summary Settings list template
 * @param {PSV.plugins.SettingsPlugin.Setting[]} settings
 * @param {string} dataKey
 * @param {function} optionsCurrent
 * @returns {string}
 * @constant
 * @private
 */

var SETTINGS_TEMPLATE = function SETTINGS_TEMPLATE(settings, dataKey, optionsCurrent) {
  return "\n<div class=\"psv-panel-menu psv-settings-menu\">\n  <ul class=\"psv-panel-menu-list\">\n    " + settings.map(function (s) {
    return "\n      <li class=\"psv-panel-menu-item\" data-" + dataKey + "=\"" + s.id + "\">\n        " + SETTINGS_TEMPLATE_[s.type](s, optionsCurrent) + "\n      </li>\n    ";
  }).join('') + "\n  </ul>\n</div>\n";
};
/**
 * @summary Settings options template
 * @param {PSV.plugins.SettingsPlugin.OptionsSetting} setting
 * @param {string} dataKey
 * @param {function} optionActive
 * @returns {string}
 * @constant
 * @private
 */

var SETTING_OPTIONS_TEMPLATE = function SETTING_OPTIONS_TEMPLATE(setting, dataKey, optionActive) {
  return "\n<div class=\"psv-panel-menu psv-settings-menu\">\n  <ul class=\"psv-panel-menu-list\">\n    <li class=\"psv-panel-menu-item psv-settings-item--header\" data-" + dataKey + "=\"__back\">\n      <span class=\"psv-settings-item-icon\">" + chevron + "</span>\n      <span class=\"psv-settings-item-label\">" + setting.label + "</span>\n    </li>\n    " + setting.options().map(function (s) {
    return "\n      <li class=\"psv-panel-menu-item\" data-" + dataKey + "=\"" + s.id + "\">\n        <span class=\"psv-settings-item-icon\">" + (optionActive(s) ? check : '') + "</span>\n        <span class=\"psv-settings-item-value\">" + s.label + "</span>\n      </li>\n    ";
  }).join('') + "\n  </ul>\n</div>\n";
};

var icon = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><path fill=\"currentColor\" d=\"M98.4 43.7c-.8-.5-7-4.3-9.6-5.4l-3-7.5c.9-2.5 2.6-9.4 3-10.6a3.3 3.3 0 00-1-3.1L83 12.2a3.3 3.3 0 00-3-.9c-1 .2-8 2-10.7 3l-7.5-3.1c-1-2.4-4.8-8.6-5.4-9.6A3.3 3.3 0 0053.4 0h-6.8a3.4 3.4 0 00-2.9 1.6c-.5.8-4.2 7-5.4 9.6l-7.5 3-10.6-3a3.3 3.3 0 00-3.1 1L12.2 17a3.3 3.3 0 00-.9 3c.2 1 2 8 3 10.7l-3.1 7.5c-2.4 1-8.6 4.8-9.6 5.4A3.3 3.3 0 000 46.6v6.8a3.4 3.4 0 001.6 2.9c.8.5 7 4.2 9.6 5.4l3 7.5-3 10.6a3.3 3.3 0 001 3.1l4.8 4.9a3.3 3.3 0 003.1.9c1-.2 8-2 10.7-3l7.5 3c1 2.5 4.7 8.6 5.4 9.7a3.3 3.3 0 002.9 1.6h6.8a3.4 3.4 0 002.9-1.6c.5-.8 4.2-7 5.4-9.6l7.5-3c2.5.9 9.4 2.6 10.6 3a3.3 3.3 0 003.1-1l4.9-4.8a3.3 3.3 0 00.9-3.1c-.2-1-2-8-3-10.7l3-7.5c2.5-1 8.6-4.7 9.7-5.4a3.3 3.3 0 001.6-2.9v-6.8a3.3 3.3 0 00-1.6-2.9zM50 71.7A21.8 21.8 0 1171.8 50 21.8 21.8 0 0150 71.8z\"/><!-- Created by i cons from the Noun Project --></svg>\r\n";

/**
 * @summary Navigation bar settings button class
 * @extends PSV.buttons.AbstractButton
 * @memberof PSV.buttons
 */

var SettingsButton = /*#__PURE__*/function (_AbstractButton) {
  _inheritsLoose(SettingsButton, _AbstractButton);

  /**
   * @param {PSV.components.Navbar} navbar
   */
  function SettingsButton(navbar) {
    var _this;

    _this = _AbstractButton.call(this, navbar, 'psv-button--hover-scale psv-settings-button', true) || this;
    /**
     * @type {PSV.plugins.SettingsPlugin}
     * @private
     * @readonly
     */

    _this.plugin = _this.psv.getPlugin('settings');
    /**
     * @member {HTMLElement}
     * @private
     * @readonly
     */

    _this.badge = document.createElement('div');
    _this.badge.className = 'psv-settings-badge';
    _this.badge.style.display = 'none';

    _this.container.appendChild(_this.badge);

    if (_this.plugin) {
      _this.psv.on(CONSTANTS.EVENTS.OPEN_PANEL, _assertThisInitialized(_this));

      _this.psv.on(CONSTANTS.EVENTS.CLOSE_PANEL, _assertThisInitialized(_this));
    }

    return _this;
  }
  /**
   * @override
   */


  var _proto = SettingsButton.prototype;

  _proto.destroy = function destroy() {
    this.psv.off(CONSTANTS.EVENTS.OPEN_PANEL, this);
    this.psv.off(CONSTANTS.EVENTS.CLOSE_PANEL, this);
    delete this.plugin;

    _AbstractButton.prototype.destroy.call(this);
  }
  /**
   * @override
   */
  ;

  _proto.isSupported = function isSupported() {
    return !!this.plugin;
  }
  /**
   * @summary Handles events
   * @param {Event} e
   * @private
   */
  ;

  _proto.handleEvent = function handleEvent(e) {
    /* eslint-disable */
    switch (e.type) {
      // @formatter:off
      case CONSTANTS.EVENTS.OPEN_PANEL:
        this.toggleActive(e.args[0] === ID_PANEL);
        break;

      case CONSTANTS.EVENTS.CLOSE_PANEL:
        this.toggleActive(false);
        break;
      // @formatter:on
    }
    /* eslint-enable */

  }
  /**
   * @override
   * @description Toggles settings
   */
  ;

  _proto.onClick = function onClick() {
    this.plugin.toggleSettings();
  }
  /**
   * @summary Changes the badge value
   * @param {string} value
   */
  ;

  _proto.setBadge = function setBadge(value) {
    this.badge.innerText = value;
    this.badge.style.display = value ? '' : 'none';
  };

  return SettingsButton;
}(AbstractButton);
SettingsButton.id = 'settings';
SettingsButton.icon = icon;

/**
 * @typedef {Object} PSV.plugins.SettingsPlugin.Setting
 * @summary Description of a setting
 * @property {string} id - identifier of the setting
 * @property {string} label - label of the setting
 * @property {'options' | 'toggle'} type - type of the setting
 * @property {function} [badge] - function which returns the value of the button badge
 */

/**
 * @typedef {PSV.plugins.SettingsPlugin.Setting} PSV.plugins.SettingsPlugin.OptionsSetting
 * @summary Description of a 'options' setting
 * @property {'options'} type - type of the setting
 * @property {function} current - function which returns the current option id
 * @property {function} options - function which the possible options as an array of {@link PSV.plugins.SettingsPlugin.Option}
 * @property {function} apply - function called with the id of the selected option
 */

/**
 * @typedef {PSV.plugins.SettingsPlugin.Setting} PSV.plugins.SettingsPlugin.ToggleSetting
 * @summary Description of a 'toggle' setting
 * @property {'toggle'} type - type of the setting
 * @property {function} active - function which return whereas the setting is active or not
 * @property {function} toggle - function called when the setting is toggled
 */

/**
 * @typedef {Object} PSV.plugins.SettingsPlugin.Option
 * @summary Option of an 'option' setting
 * @property {string} id - identifier of the option
 * @property {string} label - label of the option
 */
// add settings button

DEFAULTS.lang[SettingsButton.id] = 'Settings';
registerButton(SettingsButton, 'fullscreen:left');
/**
 * @summary Adds a button to access various settings.
 * @extends PSV.plugins.AbstractPlugin
 * @memberof PSV.plugins
 */

var SettingsPlugin = /*#__PURE__*/function (_AbstractPlugin) {
  _inheritsLoose(SettingsPlugin, _AbstractPlugin);

  /**
   * @param {PSV.Viewer} psv
   */
  function SettingsPlugin(psv) {
    var _this;

    _this = _AbstractPlugin.call(this, psv) || this;
    /**
     * @type {PSV.plugins.SettingsPlugin.Setting[]}
     * @private
     */

    _this.settings = [];
    return _this;
  }
  /**
   * @package
   */


  var _proto = SettingsPlugin.prototype;

  _proto.init = function init() {
    var _this2 = this;

    _AbstractPlugin.prototype.init.call(this); // buttons are initialized just after plugins


    setTimeout(function () {
      return _this2.updateBadge();
    });
  }
  /**
   * @package
   */
  ;

  _proto.destroy = function destroy() {
    this.settings.length = 0;

    _AbstractPlugin.prototype.destroy.call(this);
  }
  /**
   * @summary Registers a new setting
   * @param {PSV.plugins.SettingsPlugin.Setting} setting
   */
  ;

  _proto.addSetting = function addSetting(setting) {
    if (!setting.id) {
      throw new PSVError('Missing setting id');
    }

    if (!setting.type) {
      throw new PSVError('Missing setting type');
    }

    if (!SETTINGS_TEMPLATE_[setting.type]) {
      throw new PSVError('Unsupported setting type');
    }

    if (setting.badge && this.settings.some(function (s) {
      return s.badge;
    })) {
      utils.logWarn('More than one setting with a badge are declared, the result is unpredictable.');
    }

    this.settings.push(setting);

    if (this.psv.panel.prop.contentId === ID_PANEL) {
      this.showSettings();
    }

    this.updateBadge();
  }
  /**
   * @summary Removes a setting
   * @param {string} id
   */
  ;

  _proto.removeSetting = function removeSetting(id) {
    var idx = this.settings.findIndex(function (setting) {
      return setting.id === id;
    });

    if (idx !== -1) {
      this.settings.splice(idx, 1);

      if (this.psv.panel.prop.contentId === ID_PANEL) {
        this.showSettings();
      }

      this.updateBadge();
    }
  }
  /**
   * @summary Toggles the settings panel
   */
  ;

  _proto.toggleSettings = function toggleSettings() {
    if (this.psv.panel.prop.contentId === ID_PANEL) {
      this.hideSettings();
    } else {
      this.showSettings();
    }
  }
  /**
   * @summary Hides the settings panel
   */
  ;

  _proto.hideSettings = function hideSettings() {
    this.psv.panel.hide(ID_PANEL);
  }
  /**
   * @summary Shows the settings panel
   */
  ;

  _proto.showSettings = function showSettings() {
    var _this3 = this;

    this.psv.panel.show({
      id: ID_PANEL,
      content: SETTINGS_TEMPLATE(this.settings, utils.dasherize(SETTING_DATA), function (setting) {
        // retrocompatibility with "current" returning a label
        var current = setting.current();
        var option = setting.options().find(function (opt) {
          return opt.id === current;
        });
        return (option == null ? void 0 : option.label) || current;
      }),
      noMargin: true,
      clickHandler: function clickHandler(e) {
        var li = e.target ? utils.getClosest(e.target, 'li') : undefined;
        var settingId = li ? li.dataset[SETTING_DATA] : undefined;

        var setting = _this3.settings.find(function (s) {
          return s.id === settingId;
        });

        if (setting) {
          switch (setting.type) {
            case 'toggle':
              setting.toggle();

              _this3.trigger(EVENTS.SETTING_CHANGED, setting.id, setting.active());

              _this3.showSettings();

              _this3.updateBadge();

              break;

            case 'options':
              _this3.__showOptions(setting);

              break;

          }
        }
      }
    });
  }
  /**
   * @summary Shows setting options panel
   * @param {PSV.plugins.SettingsPlugin.OptionsSetting} setting
   * @private
   */
  ;

  _proto.__showOptions = function __showOptions(setting) {
    var _this4 = this;

    var current = setting.current();
    this.psv.panel.show({
      id: ID_PANEL,
      content: SETTING_OPTIONS_TEMPLATE(setting, utils.dasherize(SETTING_DATA), function (option) {
        // retrocompatibility with options having an "active" flag
        return 'active' in option ? option.active : option.id === current;
      }),
      noMargin: true,
      clickHandler: function clickHandler(e) {
        var li = e.target ? utils.getClosest(e.target, 'li') : undefined;
        var optionId = li ? li.dataset[SETTING_DATA] : undefined;

        if (optionId === '__back') {
          _this4.showSettings();
        } else {
          setting.apply(optionId);

          _this4.trigger(EVENTS.SETTING_CHANGED, setting.id, setting.current());

          _this4.hideSettings();

          _this4.updateBadge();
        }
      }
    });
  }
  /**
   * @summary Updates the badge in the button
   */
  ;

  _proto.updateBadge = function updateBadge() {
    var _this$settings$find, _this$psv$navbar$getB;

    var value = (_this$settings$find = this.settings.find(function (s) {
      return s.badge;
    })) == null ? void 0 : _this$settings$find.badge();
    (_this$psv$navbar$getB = this.psv.navbar.getButton(SettingsButton.id, false)) == null ? void 0 : _this$psv$navbar$getB.setBadge(value);
  };

  return SettingsPlugin;
}(AbstractPlugin);
SettingsPlugin.id = 'settings';
SettingsPlugin.EVENTS = EVENTS;

export { EVENTS, SettingsPlugin };
//# sourceMappingURL=settings.js.map
