# three-gltf

| @Prop | @Watch | @Listen | @Event | @State |
| ------ | ------ | ------ | ------ | ------ |
| `path` |  |  |  |  |
| `name` |  |  |  |  |
| `offset` | `offset` |  |  |  |
| `rotation` | `rotation` |  |  |  |
| `scale` | `scale` |  |  |  |
| `clockName` |  |  |  |  |
| `uigroup` |  |  |  |  |
| `uiid` |  |  |  |  |
| `objects` |  |  |  |  |
| `thumbnail` |  |  |  |  |
| `visible` | `visible` |  |  |  |
| `developer` |  |  |  |  |
|  |  | `appTick` |  |  |
|  |  | `uiObjectBus` | `uiObjectBus` |  |
|  |  |  | `loadTracker` |  |

## Purpose

-- Short description --

------------

<!-- Auto Generated Below -->


## Properties

| Property    | Attribute    | Description                                                                      | Type      | Default |
| ----------- | ------------ | -------------------------------------------------------------------------------- | --------- | ------- |
| `clockName` | `clock-name` | clock ID to which this component listens to                                      | `string`  | `''`    |
| `developer` | `developer`  | Development tool to gain access to more information                              | `boolean` | `false` |
| `name`      | `name`       | file name                                                                        | `string`  | `''`    |
| `objects`   | `objects`    | objects that will be designated as active with additional functionality          | `string`  | `''`    |
| `offset`    | `offset`     | offset position of this object to new x,y,z location                             | `string`  | `''`    |
| `path`      | `path`       | path to file location                                                            | `string`  | `''`    |
| `rotation`  | `rotation`   | change rotation of this object on x,y,z axis, values provided must be in degrees | `string`  | `''`    |
| `scale`     | `scale`      | scale multiplier for imported scene                                              | `string`  | `''`    |
| `thumbnail` | `thumbnail`  | path to thumbnail for UI integration                                             | `string`  | `''`    |
| `uigroup`   | `uigroup`    | unique ID of group in which this object resides                                  | `string`  | `''`    |
| `uiid`      | `uiid`       | unique ID assigned and identified by within its group                            | `string`  | `''`    |
| `visible`   | `visible`    | indicate whether this object is visible or not                                   | `boolean` | `true`  |


## Events

| Event         | Description                          | Type                         |
| ------------- | ------------------------------------ | ---------------------------- |
| `loadTracker` | transmit load status of this element | `CustomEvent<loadTracker>`   |
| `uiObjectBus` | Transmit data to other components    | `CustomEvent<uiObjectEvent>` |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
