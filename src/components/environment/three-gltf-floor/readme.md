# three-gltf-floor

| @Prop | @Watch | @Listen | @Event | @State |
| ------ | ------ | ------ | ------ | ------ |
| `path` |  |  |  |  |
| `name` |  |  |  |  |
| `offset` |  |  |  |  |
| `rotation` |  |  |  |  |
| `visible` |  |  |  |  |
| `default` |  |  |  |  |
| `uigroup` |  |  |  |  |
| `uiid` |  |  |  |  |
| `link` |  |  |  |  |
| `thumbnail` |  |  |  |  |
|  |  |  | `loadTracker` |  |

## Purpose

-- Short description --

------------

<!-- Auto Generated Below -->


## Properties

| Property      | Attribute      | Description                                                                                       | Type      | Default   |
| ------------- | -------------- | ------------------------------------------------------------------------------------------------- | --------- | --------- |
| `default`     | `default`      | indicate whether this floor is the first one user will land upon entry                            | `boolean` | `false`   |
| `link`        | `link`         | link to object name within imported file - This prop is only used to be collected by parent group | `string`  | `''`      |
| `name`        | `name`         | file name                                                                                         | `string`  | `''`      |
| `offset`      | `offset`       | offset position of this object to new x,y,z location                                              | `string`  | `'0,0,0'` |
| `path`        | `path`         | path to file location                                                                             | `string`  | `''`      |
| `rotation`    | `rotation`     | change rotation of this object on x,y,z axis, values provided must be in degrees                  | `string`  | `'0,0,0'` |
| `shiftOrigin` | `shift-origin` | Shift place where user lands after long distance teleport                                         | `string`  | `''`      |
| `thumbnail`   | `thumbnail`    | thumbnail location - This prop is only used to be collected by parent group                       | `string`  | `''`      |
| `uigroup`     | `uigroup`      | unique ID of group in which this object resides                                                   | `string`  | `''`      |
| `uiid`        | `uiid`         | unique ID assigned and identified by within its group                                             | `string`  | `''`      |
| `visible`     | `visible`      | indicate whether this object is visible or not                                                    | `boolean` | `false`   |


## Events

| Event         | Description                          | Type                       |
| ------------- | ------------------------------------ | -------------------------- |
| `loadTracker` | transmit load status of this element | `CustomEvent<loadTracker>` |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
