# three-canvas-altmenu

| @Prop | @Watch | @Listen | @Event | @State |
| ------ | ------ | ------ | ------ | ------ |
| `clockName` |  |  |  |  |
| `domId` |  |  |  |  |
| `width` |  |  |  |  |
| `height` |  |  |  |  |
| `hires` |  |  |  |  |
| `uigroup` |  |  |  |  |
| `uiid` |  |  |  |  |
| `default` |  |  |  |  |
| `rowLocation` |  |  |  |  |
| `rowHdr` |  |  |  |  |
| `rowTools` |  |  |  |  |
| `iconExit` |  |  |  |  |
|  |  | `appTick` |  |  |
|  |  | `intersect` |  |  |
|  |  | `uiObjectBus` |  |  |
|  |  |  | `cameraUpdate` |  |
|  |  |  | `loadComplete` |  |

## Purpose

-- Short description --

------------

<!-- Auto Generated Below -->


## Properties

| Property      | Attribute      | Description                                                         | Type      | Default |
| ------------- | -------------- | ------------------------------------------------------------------- | --------- | ------- |
| `clockName`   | `clock-name`   | clock ID to which this component listens to                         | `string`  | `''`    |
| `default`     | `default`      | this menu is default amongst all other alt-menus                    | `boolean` | `false` |
| `domId`       | `dom-id`       | location on page where canvas is placed before rendered as material | `string`  | `''`    |
| `height`      | `height`       | height in meters                                                    | `number`  | `0`     |
| `hires`       | `hires`        | switch to higher density of pixels of canvas material               | `boolean` | `false` |
| `iconExit`    | `icon-exit`    | path to thumbnail of exit VR icon                                   | `string`  | `''`    |
| `rowHdr`      | `row-hdr`      | path to thumbnail of Location row                                   | `string`  | `''`    |
| `rowLocation` | `row-location` | path to thumbnail of Location row                                   | `string`  | `''`    |
| `rowTools`    | `row-tools`    | path to thumbnail of Location row                                   | `string`  | `''`    |
| `uigroup`     | `uigroup`      | unique ID of group in which this object resides                     | `string`  | `''`    |
| `uiid`        | `uiid`         | unique ID assigned and identified by within its group               | `string`  | `''`    |
| `width`       | `width`        | width in meters                                                     | `number`  | `0`     |


## Events

| Event          | Description                                      | Type                             |
| -------------- | ------------------------------------------------ | -------------------------------- |
| `cameraUpdate` | Transmit event of new camera location / rotation | `CustomEvent<CameraNewLocation>` |
| `loadComplete` | Transmit VR exit event                           | `CustomEvent<loadComplete>`      |
| `uiObjectBus`  | Transmit data to other components                | `CustomEvent<uiObjectEvent>`     |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
