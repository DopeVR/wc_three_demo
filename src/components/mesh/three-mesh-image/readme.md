# three-mesh-image

| @Prop | @Watch | @Listen | @Event | @State |
| ------ | ------ | ------ | ------ | ------ |
| `path` |  |  |  |  |
| `name` |  |  |  |  |
| `uigroup` |  |  |  |  |
| `uiid` |  |  |  |  |
| `ratio` |  |  |  |  |
| `color` |  |  |  |  |
| `size` | `size` |  |  |  |
| `offset` | `offset` |  |  |  |
| `rotation` | `rotation` |  |  |  |
| `visible` | `visible` |  |  |  |
| `link` |  |  |  |  |
|  |  |  | `uiObjectBus` |  |

## Purpose

-- Short description --

------------

<!-- Auto Generated Below -->


## Properties

| Property   | Attribute  | Description                                                                      | Type      | Default     |
| ---------- | ---------- | -------------------------------------------------------------------------------- | --------- | ----------- |
| `color`    | `color`    | color for the 5 unused sides of the box                                          | `string`  | `'#080808'` |
| `link`     | `link`     | helper GLTF file links to obejcts with that helper                               | `string`  | `''`        |
| `name`     | `name`     | file name                                                                        | `string`  | `''`        |
| `offset`   | `offset`   | offset position of this object to new x,y,z location                             | `string`  | `'0,0,0'`   |
| `path`     | `path`     | path to file location                                                            | `string`  | `''`        |
| `ratio`    | `ratio`    | aspect ratio of image that will be used                                          | `string`  | `'1:1'`     |
| `rotation` | `rotation` | change rotation of this object on x,y,z axis, values provided must be in degrees | `string`  | `'0,0,0'`   |
| `size`     | `size`     | Size of the image in meters                                                      | `number`  | `1`         |
| `uigroup`  | `uigroup`  | unique ID of group in which this object resides                                  | `string`  | `''`        |
| `uiid`     | `uiid`     | unique ID assigned and identified by within its group                            | `string`  | `''`        |
| `visible`  | `visible`  | indicate whether this object is visible or not                                   | `boolean` | `false`     |


## Events

| Event         | Description                       | Type                         |
| ------------- | --------------------------------- | ---------------------------- |
| `uiObjectBus` | Transmit data to other components | `CustomEvent<uiObjectEvent>` |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
