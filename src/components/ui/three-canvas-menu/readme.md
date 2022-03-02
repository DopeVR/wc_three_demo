# three-canvas-menu

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
|  |  | `appTick` |  |  |
|  |  | `intersect` |  |  |
|  |  | `uiObjectBus` | `uiObjectBus` |  |

## Purpose

-- Short description --

------------

<!-- Auto Generated Below -->


## Properties

| Property    | Attribute    | Description                                                         | Type      | Default |
| ----------- | ------------ | ------------------------------------------------------------------- | --------- | ------- |
| `clockName` | `clock-name` | clock ID to which this component listens to                         | `string`  | `''`    |
| `default`   | `default`    | this menu is default amongst all other menus                        | `boolean` | `false` |
| `domId`     | `dom-id`     | Location on page where canvas is placed before rendered as material | `string`  | `''`    |
| `height`    | `height`     | height in meters                                                    | `number`  | `0`     |
| `hires`     | `hires`      | Switch to higher density of pixels of canvas material               | `boolean` | `false` |
| `uigroup`   | `uigroup`    | unique ID of group in which this object resides                     | `string`  | `''`    |
| `uiid`      | `uiid`       | unique ID assigned and identified by within its group               | `string`  | `''`    |
| `width`     | `width`      | width in meters                                                     | `number`  | `0`     |


## Events

| Event         | Description                       | Type                         |
| ------------- | --------------------------------- | ---------------------------- |
| `uiObjectBus` | Transmit data to other components | `CustomEvent<uiObjectEvent>` |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
