# three-raycaster

| @Prop | @Watch | @Listen | @Event | @State |
| ------ | ------ | ------ | ------ | ------ |
| `clockName` |  |  |  |  |
| `leftIndex` |  |  |  |  |
| `rightIndex` |  |  |  |  |
| `armed` | `armed` |  |  |  |
|  |  | `controllerAction` |  |  |
|  |  | `appTick` |  |  |
|  |  |  | `intersect` |  |
|  |  |  | `uiObjectBus` |  |
|  |  |  |  | `xrControllerObject` |
|  |  |  |  | `xrControllerActions` |

## Purpose

-- Short description --

------------

<!-- Auto Generated Below -->


## Properties

| Property     | Attribute     | Description                                                   | Type      | Default |
| ------------ | ------------- | ------------------------------------------------------------- | --------- | ------- |
| `armed`      | `armed`       | Ray-caster is only active in VR                               | `boolean` | `false` |
| `clockName`  | `clock-name`  | clock ID to which this component listens to                   | `string`  | `''`    |
| `leftIndex`  | `left-index`  | Align controller name with index according to user definition | `number`  | `1`     |
| `rightIndex` | `right-index` | Align controller name with index according to user definition | `number`  | `0`     |


## Events

| Event         | Description                       | Type                               |
| ------------- | --------------------------------- | ---------------------------------- |
| `intersect`   | Transmit intersect data           | `CustomEvent<ControllerIntersect>` |
| `uiObjectBus` | Transmit data to other components | `CustomEvent<uiObjectEvent>`       |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
