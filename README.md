# simple-image-editor.js
------
Lightweight .js plugin for generating a simple image editor with some basic image editing functions

## Getting Started
------
Load the simple-image-editor dist minified script within the page of the app
```javascript
    <script type="text/javascript" src="../dist/simple-image-editor.min.js"></script>
```

Instantiate!
```javascript
    //Simplest
    var imageEditor = simpleImageEditor('element-id');

    //With more configuration settings
    var settings = {
        containerId: 'element-id'
        width: 900,
        defaultDrawingControl: 'arrow',
        defaultDrawingColor: '#ffff00',
    };
    var imageEditor = simpleImageEditor(settings);

    //Load an image programmatically
    function loadImageIntoPlugin() {
        var img = new Image();
        img.onload = function () {
            imageEditor.loadImage(img);
        };
    img.src = loadedImage.src;
}
```

### Features
------
* Select image from file explorer
* Paste image from clipboard
* Load existing image through javascript
* Save edited image as base64 
* Download edited image
* Rotate image
* Draw on image with different drawing tools

#### Drawing tools
------
* Color Selector
* Line width
* Eraser
* Free draw pencil
* Line
* Arrow
* Square
* Circle

### Configuration Options
------

**containerId** - __***(Required)***__
Type: ```String```
The HTML element id for containing the generated the plugin 

**exportImageFileType**
Type: ```String```
Default ```'png' ```

**width**
Type: ```Number```
Default: ```300 ```

**showSaveButton**
Type: ```Boolean```
Default: ```false```

**showDownloadButton**
Type: ```Boolean```
Default: ```true```

**defaultDrawingControl**
Type: ```String```
Default: ```'pencil'```

**defaultDrawingColor**
Type: ```Number```
Default: ```'#FF0000'```

**defaultDrawingThickness**
Type: ```Number```
Default: ```6```

**hideAllControls**
Type: ```Boolean```
Default: ```false```

### Functions
------

| name | description |
|------|-------------|
|saveImage() | Saves the edited image in its current state and will return and object with an originalFileName, base64Image, and editedFileName|
|loadImage(image) | Takes a javascript Image as a parameter to load an image programmatically|
|rotateRight() | Rotates the edited image +90&deg; or 90&deg; clockwise|
|rotateLeft() | Rotates the edited image -90&deg; or 90&deg; counterclockwise|
|setColor(color) | Takes a hex string color as parameter and sets the drawing tools to use the specified color (ex: \'#000000\')|
|setDrawingThickness(lineWidth) | Takes a Number and sets the line width for drawing tools to the specified width|
|setDrawingControl(controlType) | Sets the current drawing tool to the specified control type as a Number or String|
|toggleControls(showHide)| Sets the control container display based on the passed in.  Expected parameters are ('show'), ('hide') and () where parameterless just toggles from the current visibility state|