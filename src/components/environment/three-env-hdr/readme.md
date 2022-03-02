# three-env-hdr

| @Prop | @Watch | @Listen | @Event | @State |
| ------ | ------ | ------ | ------ | ------ |
| `path` |  |  |  |  |
| `name` |  |  |  |  |
| `exposure` |  |  |  |  |
|  |  |  | `loadTracker` |  |

## Purpose

-- Short description --

------------

<!-- Auto Generated Below -->


## Properties

| Property   | Attribute  | Description                                              | Type     | Default |
| ---------- | ---------- | -------------------------------------------------------- | -------- | ------- |
| `exposure` | `exposure` | amount of light emitted by HDR texture 0 - 1(normal) - 2 | `number` | `1`     |
| `name`     | `name`     | file name                                                | `string` | `''`    |
| `path`     | `path`     | path to file location                                    | `string` | `''`    |


## Events

| Event         | Description                          | Type                       |
| ------------- | ------------------------------------ | -------------------------- |
| `loadTracker` | transmit load status of this element | `CustomEvent<loadTracker>` |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
