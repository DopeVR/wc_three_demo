# three-group-object

| @Prop | @Watch | @Listen | @Event | @State |
| ------ | ------ | ------ | ------ | ------ |
| `clockName` |  |  |  |  |
| `uigroup` |  |  |  |  |
| `uiid` |  |  |  |  |
| `offset` |  |  |  |  |
| `rotation` |  |  |  |  |
| `scale` |  |  |  |  |
|  |  | `uiObjectBus` | `uiObjectBus` |  |

## Purpose

-- Short description --

------------

<!-- Auto Generated Below -->


## Properties

| Property    | Attribute    | Description                                                                      | Type     | Default |
| ----------- | ------------ | -------------------------------------------------------------------------------- | -------- | ------- |
| `clockName` | `clock-name` | clock ID to which this component listens to                                      | `string` | `''`    |
| `offset`    | `offset`     | offset position of this object to new x,y,z location                             | `string` | `''`    |
| `rotation`  | `rotation`   | change rotation of this object on x,y,z axis, values provided must be in degrees | `string` | `''`    |
| `scale`     | `scale`      | scale multiplier passed down to children                                         | `string` | `''`    |
| `uigroup`   | `uigroup`    | unique ID of group in which this object resides                                  | `string` | `''`    |
| `uiid`      | `uiid`       | unique ID assigned and identified by within its group                            | `string` | `''`    |


## Events

| Event         | Description                       | Type                         |
| ------------- | --------------------------------- | ---------------------------- |
| `uiObjectBus` | Transmit data to other components | `CustomEvent<uiObjectEvent>` |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
