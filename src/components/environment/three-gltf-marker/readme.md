# three-gltf-marker

| @Prop | @Watch | @Listen | @Event | @State |
| ------ | ------ | ------ | ------ | ------ |
| `clockName` |  |  |  |  |
| `path` |  |  |  |  |
| `name` |  |  |  |  |
| `mcescher` |  |  |  |  |
|  |  | `appTick` |  |  |
|  |  | `intersect` |  |  |
|  |  |  | `cameraUpdate` |  |
|  |  |  | `loadTracker` |  |

## Purpose

-- Short description --

------------

<!-- Auto Generated Below -->


## Properties

| Property    | Attribute    | Description                                                                                                     | Type      | Default |
| ----------- | ------------ | --------------------------------------------------------------------------------------------------------------- | --------- | ------- |
| `clockName` | `clock-name` | clock ID to which this component listens to                                                                     | `string`  | `''`    |
| `mcescher`  | `mcescher`   | This flag allows users avatar to align with rotation of floor object !!!! POTENTIALLY extremely nauseating !!!! | `boolean` | `false` |
| `name`      | `name`       | file name                                                                                                       | `string`  | `''`    |
| `path`      | `path`       | path to file location                                                                                           | `string`  | `''`    |


## Events

| Event          | Description                                      | Type                             |
| -------------- | ------------------------------------------------ | -------------------------------- |
| `cameraUpdate` | Transmit event of new camera location / rotation | `CustomEvent<CameraNewLocation>` |
| `loadTracker`  | transmit load status of this element             | `CustomEvent<loadTracker>`       |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
