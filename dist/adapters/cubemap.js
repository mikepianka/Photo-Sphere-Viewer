/*!
* Photo Sphere Viewer 4.7.0
* @copyright 2014-2015 Jérémy Heleine
* @copyright 2015-2022 Damien "Mistic" Sorel
* @licence MIT (https://opensource.org/licenses/MIT)
*/
import * as THREE from 'three';
import { PSVError, utils, SYSTEM, CONSTANTS, AbstractAdapter } from 'photo-sphere-viewer';

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
 * @typedef {Object} PSV.adapters.CubemapAdapter.Cubemap
 * @summary Object defining a cubemap
 * @property {string} left
 * @property {string} front
 * @property {string} right
 * @property {string} back
 * @property {string} top
 * @property {string} bottom
 */

/**
 * @typedef {Object} PSV.adapters.CubemapAdapter.Options
 * @property {boolean} [flipTopBottom=false] - set to true if the top and bottom faces are not correctly oriented
 */
// PSV faces order is left, front, right, back, top, bottom
// 3JS faces order is left, right, top, bottom, back, front

var CUBE_ARRAY = [0, 2, 4, 5, 3, 1];
var CUBE_HASHMAP = ['left', 'right', 'top', 'bottom', 'back', 'front'];
/**
 * @summary Adapter for cubemaps
 * @memberof PSV.adapters
 * @extends PSV.adapters.AbstractAdapter
 */

var CubemapAdapter = /*#__PURE__*/function (_AbstractAdapter) {
  _inheritsLoose(CubemapAdapter, _AbstractAdapter);

  /**
   * @param {PSV.Viewer} psv
   * @param {PSV.adapters.CubemapAdapter.Options} options
   */
  function CubemapAdapter(psv, options) {
    var _this;

    _this = _AbstractAdapter.call(this, psv) || this;
    /**
     * @member {PSV.adapters.CubemapAdapter.Options}
     * @private
     */

    _this.config = _extends({
      flipTopBottom: false
    }, options);
    return _this;
  }
  /**
   * @override
   */


  var _proto = CubemapAdapter.prototype;

  _proto.supportsTransition = function supportsTransition() {
    return true;
  }
  /**
   * @override
   */
  ;

  _proto.supportsPreload = function supportsPreload() {
    return true;
  }
  /**
   * @override
   * @param {string[] | PSV.adapters.CubemapAdapter.Cubemap} panorama
   * @returns {Promise.<PSV.TextureData>}
   */
  ;

  _proto.loadTexture = function loadTexture(panorama) {
    var _this2 = this;

    var cleanPanorama = [];

    if (Array.isArray(panorama)) {
      if (panorama.length !== 6) {
        return Promise.reject(new PSVError('Must provide exactly 6 image paths when using cubemap.'));
      } // reorder images


      for (var i = 0; i < 6; i++) {
        cleanPanorama[i] = panorama[CUBE_ARRAY[i]];
      }
    } else if (typeof panorama === 'object') {
      if (!CUBE_HASHMAP.every(function (side) {
        return !!panorama[side];
      })) {
        return Promise.reject(new PSVError('Must provide exactly left, front, right, back, top, bottom when using cubemap.'));
      } // transform into array


      CUBE_HASHMAP.forEach(function (side, i) {
        cleanPanorama[i] = panorama[side];
      });
    } else {
      return Promise.reject(new PSVError('Invalid cubemap panorama, are you using the right adapter?'));
    }

    if (this.psv.config.fisheye) {
      utils.logWarn('fisheye effect with cubemap texture can generate distorsion');
    }

    var promises = [];
    var progress = [0, 0, 0, 0, 0, 0];

    var _loop = function _loop(_i) {
      promises.push(_this2.psv.textureLoader.loadImage(cleanPanorama[_i], function (p) {
        progress[_i] = p;

        _this2.psv.loader.setProgress(utils.sum(progress) / 6);
      }).then(function (img) {
        return _this2.__createCubemapTexture(img);
      }));
    };

    for (var _i = 0; _i < 6; _i++) {
      _loop(_i);
    }

    return Promise.all(promises).then(function (texture) {
      return {
        panorama: panorama,
        texture: texture
      };
    });
  }
  /**
   * @summary Creates the final texture from image
   * @param {HTMLImageElement} img
   * @returns {external:THREE.Texture}
   * @private
   */
  ;

  _proto.__createCubemapTexture = function __createCubemapTexture(img) {
    if (img.width !== img.height) {
      utils.logWarn('Invalid base image, the width equal the height');
    } // resize image


    if (img.width > SYSTEM.maxTextureWidth) {
      var ratio = SYSTEM.getMaxCanvasWidth() / img.width;
      var buffer = document.createElement('canvas');
      buffer.width = img.width * ratio;
      buffer.height = img.height * ratio;
      var ctx = buffer.getContext('2d');
      ctx.drawImage(img, 0, 0, buffer.width, buffer.height);
      return utils.createTexture(buffer);
    }

    return utils.createTexture(img);
  }
  /**
   * @override
   */
  ;

  _proto.createMesh = function createMesh(scale) {
    if (scale === void 0) {
      scale = 1;
    }

    var cubeSize = CONSTANTS.SPHERE_RADIUS * 2 * scale;
    var geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize).scale(1, 1, -1);
    var materials = [];

    for (var i = 0; i < 6; i++) {
      materials.push(new THREE.MeshBasicMaterial());
    }

    return new THREE.Mesh(geometry, materials);
  }
  /**
   * @override
   */
  ;

  _proto.setTexture = function setTexture(mesh, textureData) {
    var texture = textureData.texture;

    for (var i = 0; i < 6; i++) {
      var _mesh$material$i$map;

      if (this.config.flipTopBottom && (i === 2 || i === 3)) {
        texture[i].center = new THREE.Vector2(0.5, 0.5);
        texture[i].rotation = Math.PI;
      }

      (_mesh$material$i$map = mesh.material[i].map) == null ? void 0 : _mesh$material$i$map.dispose();
      mesh.material[i].map = texture[i];
    }
  }
  /**
   * @override
   */
  ;

  _proto.setTextureOpacity = function setTextureOpacity(mesh, opacity) {
    for (var i = 0; i < 6; i++) {
      mesh.material[i].opacity = opacity;
      mesh.material[i].transparent = opacity < 1;
    }
  }
  /**
   * @override
   */
  ;

  _proto.disposeTexture = function disposeTexture(textureData) {
    var _textureData$texture;

    (_textureData$texture = textureData.texture) == null ? void 0 : _textureData$texture.forEach(function (texture) {
      return texture.dispose();
    });
  };

  return CubemapAdapter;
}(AbstractAdapter);
CubemapAdapter.id = 'cubemap';
CubemapAdapter.supportsDownload = false;

export { CUBE_ARRAY, CUBE_HASHMAP, CubemapAdapter };
//# sourceMappingURL=cubemap.js.map
