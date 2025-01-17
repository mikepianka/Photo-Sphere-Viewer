# Methods

[[toc]]

## Presentation

Many methods are available to control the viewer from your application. The full list of methods is available in the <ApiLink page="classes/Core.Viewer.html"/>.

::: tip Modular architecture
Photo Sphere Viewer is internally splitted in multiple components, this has an impact on where are located each method. For example, the methods to control the navbar are in the `navbar` object.

Read more about [reusable components](./components/).
:::

It is good practice to wait for the `ready` event before calling any method.

```js
viewer.addEventListener('ready', () => {
  viewer.rotate({
    textureX: 1500,
    textureY: 1000
  });
}, { once: true });
```

## Main methods

This section describes the most useful methods available.

### `animate(options): Animation`

Rotate and zoom the view with a smooth animation. You can change the position (`yaw`, `pitch` or `textureX`, `textureY`) and the zoom level (`zoom`). The `speed` option is either a duration in milliseconds or a string containing the speed in revolutions per minute (`2rpm`). It returns a `Animation` object which is a standard Promise with an additional `cancel` method.

```js
viewer.animate({
  yaw: Math.PI / 2,
  pitch: '20deg',
  zoom: 50,
  speed: '2rpm',
})
  .then(() => /* animation complete */);
```

### `destroy()`

Remove the viewer from the page and free the memory used by Three.js.

### `getPosition(): Position`

Return the current position of the view.

### `getZoomLevel(): number`

Return the current zoom level between 0 and 100.

### `rotate(position)`

Immediately rotate the view without animation.

```js
// you can also use yaw and pitch
viewer.rotate({
    textureX: 1500,
    textureY: 600,
});
```

### `setOption(option, value)`

Update an option of the viewer. Some options cannot be changed : `panorama`, `panoData`, `container`, `overlay`, `overlayOpacity`, `adapter` and `plugins`.

```js
viewer.setOption('fisheye', true);
```

### `setOptions(options)`

Update multiple options at once.

```js
viewer.setOptions({
    fisheye: true,
});
```

### `setPanorama(panorama[, options]): Promise`

Change the panorama image with an optional transition animation (enabled by default). See all options in the <ApiLink page="types/Core.PanoramaOptions.html"/>.

```js
viewer.setPanorama('image.jpg')
  .then(() => /* update complete */);
```

### `zoom(level)` | `zoomIn()` | `zoomOut()`

Change the zoom level without animation.
