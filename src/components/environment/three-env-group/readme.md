# three-env-group

| @Prop | @Watch | @Listen | @Event | @State |
| ------ | ------ | ------ | ------ | ------ |
| `clockName` |  |  |  |  |
|  |  | `loadComplete` |  |  |
|  |  |  | `uiObjectBus` |  |

## Purpose

-- Short description --

------------

<!-- Auto Generated Below -->


## Properties

| Property    | Attribute    | Description                                 | Type     | Default |
| ----------- | ------------ | ------------------------------------------- | -------- | ------- |
| `clockName` | `clock-name` | clock ID to which this component listens to | `string` | `''`    |


## Events

| Event         | Description                       | Type                         |
| ------------- | --------------------------------- | ---------------------------- |
| `uiObjectBus` | Transmit data to other components | `CustomEvent<uiObjectEvent>` |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
