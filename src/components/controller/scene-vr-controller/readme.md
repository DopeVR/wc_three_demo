# scene-vr-controller

| @Prop | @Watch | @Listen | @Event | @State |
| ------ | ------ | ------ | ------ | ------ |
| `controllerId` |  |  |  |  |
| `controllerName` |  |  |  |  |
| `armed` | `armed` |  |  |  |
|  |  |  | `controllerAction` |  |
|  |  |  |  | `xrControllerObject` |

## Purpose

-- Short description --

------------

<!-- Auto Generated Below -->


## Properties

| Property         | Attribute         | Description                            | Type      | Default |
| ---------------- | ----------------- | -------------------------------------- | --------- | ------- |
| `armed`          | `armed`           | controller is only active in VR        | `boolean` | `false` |
| `controllerId`   | `controller-id`   | numeric ID that is assigned by headset | `number`  | `null`  |
| `controllerName` | `controller-name` | verbal identification assigned by user | `string`  | `''`    |


## Events

| Event              | Description                        | Type                           |
| ------------------ | ---------------------------------- | ------------------------------ |
| `controllerAction` | Transmit actions performed by user | `CustomEvent<ControllerEvent>` |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
