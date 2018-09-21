# simple-image-editor.js
Lightweight .js plugin for generating a simple image editor with some basic image editing functions.

## Demo


### Features
* Select image from file explorer
* Paste image from clipboard
* Load existing image through javascript
* Save edited image as base64 
* Download edited image
* Rotate image
* Draw on image with different drawing tools

#### Drawing tools
* Color Selector
* Line width
* Eraser
* Free draw pencil
* Line
* Arrow
* Square
* Circle

### Configuration Options

Setting name | Value
------------ | -------------
containerId | Target HTML element id for containing the generated the plugin 
exportImageFileType | default **png**
width | default **300**
showSaveButton | default **false**
showDownloadButton | default **true**
defaultDrawingControl | default **pencil**
defaultDrawingColor | default **FF0000**
defaultDrawingThickness | default **6**