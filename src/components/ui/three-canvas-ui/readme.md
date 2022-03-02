# three-canvas-ui

| @Prop | @Watch | @Listen | @Event | @State |
| ------ | ------ | ------ | ------ | ------ |
| `clockName` |  |  |  |  |
| `domId` |  |  |  |  |
| `width` |  |  |  |  |
| `height` |  |  |  |  |
| `offset` |  |  |  |  |
| `rotation` |  |  |  |  |
| `hires` |  |  |  |  |
| `uigroup` |  |  |  |  |
| `uiid` |  |  |  |  |
|  |  | `appTick` |  |  |
|  |  | `intersect` |  |  |
|  |  | `uiObjectBus` | `uiObjectBus` |  |

## Purpose

-- Short description --

------------

<!-- Auto Generated Below -->


## Properties

| Property    | Attribute    | Description                                                                      | Type      | Default   |
| ----------- | ------------ | -------------------------------------------------------------------------------- | --------- | --------- |
| `clockName` | `clock-name` | clock ID to which this component listens to                                      | `string`  | `''`      |
| `domId`     | `dom-id`     | Location on page where canvas is placed before rendered as material              | `string`  | `''`      |
| `height`    | `height`     | height in meters                                                                 | `number`  | `0`       |
| `hires`     | `hires`      | Switch to higher density of pixels of canvas material                            | `boolean` | `false`   |
| `offset`    | `offset`     | offset position of this object to new x,y,z location                             | `string`  | `'0,0,0'` |
| `rotation`  | `rotation`   | change rotation of this object on x,y,z axis, values provided must be in degrees | `string`  | `'0,0,0'` |
| `uigroup`   | `uigroup`    | unique ID of group in which this object resides                                  | `string`  | `''`      |
| `uiid`      | `uiid`       | unique ID assigned and identified by within its group                            | `string`  | `''`      |
| `width`     | `width`      | width in meters                                                                  | `number`  | `0`       |


## Events

| Event         | Description                       | Type                         |
| ------------- | --------------------------------- | ---------------------------- |
| `uiObjectBus` | Transmit data to other components | `CustomEvent<uiObjectEvent>` |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
