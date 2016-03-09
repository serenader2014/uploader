# Uploader

A XHR uploader written in ECMAScript 6.

# API

## Contructor

### Uploader(options)

Creating a Uploader instance.

##### Parameters:

- `options`: Object. The configuration object that pass to the Uploader. Default options are:

```javascript
const defaultOption = {
    // upload server's url
    url: null,

    // upload url params object
    params: {},

    // extra upload data
    data: null,

    // the core XHR object
    xhr: new XMLHttpRequest(),

    // current upload status
    status: 'pending',

    // Uploader callback list
    callbackList: [],

    // additional HTTP headers
    headers: {},

    // files that added in the Uploader
    files: [],

    // upload file's type
    limit: '*',

    // an object that contain all the form data
    formData: {},

    // decide whether use multiple files upload or not
    multiple: false,

    // decide whether the Uploader will automatically 
    // upload or not when user has selected a file
    auto: false,

    // upload request method
    method: 'POST',

    // whether the Uploader will listen to the upload progress or not.
    progressEvent: true
};

```


##### Returns:

- Uploader instance.


##### Examples:

```javascript
var fileUploader = new Uploader({
    url: '/upload',
    formData: {
        data: 'form data'
    },
    multiple: true
});
```


## Instance

### .addFile(key, file, filename)

Add file to the upload queue.

##### Parameters:

- key: String.
- file: Blob/File. Will append to the `FormData`.
- filename: String. The file's name.

##### Returns:

- Uploader instance.

##### Examples:

```javascript
var fileUploader = new Uploader({
    url: '/upload'
});

var fileInput = document.getElementById('file');
fileInput.addEventListener('change', function () {
    if (fileInput.files.length) {
        for (var i in fileInput.files) {
            var file = fileInput.files[i];
            if (fileInput.files.hasOwnProperty(i)) {
                fileUploader.addFile('file' + i, file, file.name);
            }
        }

        console.log(fileUploader.files);
    }
});

```

### .addData(key, value)

Add additional data to the form data.

##### Parameters:

- key: String.
- value: String.

##### Returns:

- Uploader instance.

##### Examples:

```javascript
var fileUploader = new Uploader({
    url: '/upload'
});

fileUploader.addData('name', 'value');
console.log(fileUploader.formData);

```

### .start()

Starting upload.

##### Returns:

- Uploader instance.

##### Examples:

```javascript
var fileUploader = new Uploader({
    url: '/upload'
});
var fileInput = document.getElementById('file');

fileInput.addEventListener('change', function () {
    if (fileInput.files.length) {
        for (var i in fileInput.files) {
            var file = fileInput.files[i];
            if (fileInput.files.hasOwnProperty(i)) {
                fileUploader.addFile('file' + i, file, file.name);
            }
        }

        fileUploader.start();
    }
});
```

### .abort()

Abort the upload request.

##### Returns:

- Uploader instance.

##### Examples:

```javascript
var fileUploader = new Uploader({
    url: '/upload'
});
var fileInput = document.getElementById('file');
var cancel = document.getElementById('cancel');

fileInput.addEventListener('change', function () {
    if (fileInput.files.length) {
        for (var i in fileInput.files) {
            var file = fileInput.files[i];
            if (fileInput.files.hasOwnProperty(i)) {
                fileUploader.addFile('file' + i, file, file.name);
            }
        }

        fileUploader.start();
    }
});

cancel.addEventListener('click', function (event) {
    event.preventDefault();
    if (fileUploader.status === 'uploading') {
        fileUploader.abort();
    }
});
```


### .bind(element)

An easier way to initialize the Uploader, it will bind to an element, and when the element was clicked, it will prompt the user to select a file to upload, once the use has selected a file, it will automatically start uploading, without any further configuration.


##### Parameters:

- element: DOM element. The element that use to bind click event.

##### Returns:

- Uploader instance.

##### Examples:

```javascript
var fileUploader = new Uploader({
    url: '/upload'
});
var uploadBtn = document.getElementById('select-file');

fileUploader.bind(uploadBtn);

```

### .reset()

Reset the Uploader status, it will clear the upload queue and all the form data.

##### Returns:

- Uploader instance.

##### Examples:

```javascript
var fileUploader = new Uploader({
    url: '/upload'
});
var fileInput = document.getElementById('file');
var resetBtn = document.getElementById('reset');
var startBtn = document.getElementById('start');

fileInput.addEventListener('change', function () {
    if (fileInput.files.length) {
        for (var i in fileInput.files) {
            var file = fileInput.files[i];
            if (fileInput.files.hasOwnProperty(i)) {
                fileUploader.addFile('file' + i, file, file.name);
            }
        }
    }
});

startBtn.addEventListener('click', function (event) {
    event.preventDefault();
    fileUploader.start();
});

resetBtn.addEventListener('click', function (event) {
    event.preventDefault();
    fileUploader.reset();
});

```

### .on(type, callback [,context] [,once]) 

Bind an event listener.

##### Parameters:

- type: String. The event's name.
- callback: Function. The function that will be called when the event is fired.
- context: Object. Optional. Custom context that will pass to the callback.
- once: Boolean. Optional. When set to `true`, the callback will only excuted once.

##### Returns:

- Uploader instance.

##### Examples:

```javascript
var fileUploader = new Uploader({
    url: '/upload'
});
var uploadBtn = document.getElementById('select-file');

fileUploader.bind(uploadBtn);
fileUploader.on('upload.start', function () {
    console.log('upload started.');
});
```

### .emit(type [, ...arg])

Manually emit an event.

##### Parameters:

- type: String. The event's name.
- arg: Additional arguments that will pass to the `.on` method.

##### Returns:

- Uploader instance.

##### Examples:

```javascript

var fileUploader = new Uploader({
    url: '/upload'
});

fileUploader.on('customEvent', function () {
    console.log(arguments);
});

fileUploader.emit('customEvent', 'one', 'two', 'three');

```

### .setHeader(name, value)

Add a custom HTTP header to the upload request.

##### Parameters:

- name: String.
- value: String.

##### Returns:

- Uploader instance.

##### Examples:

```javascript
var fileUploader = new Uploader({
    url: '/upload'
});

fileUploader.setHeader('custom', 'value');
```

## Events

### XHR events:

##### success

will emit when the XHR is success.

##### error

will emit when the XHR is error.

##### progress

will emit when the XHR is on progress.

##### abort 

will emit when the XHR is abort.


### Uploader events:

##### upload.start

will emit when the uploader starting upload.

##### upload.progress

will emit when uploading files.

##### upload.error

will emit when uploading files error.

##### upload.abort

will emit when abort upload files.

##### upload.success

will emit when the uploading is success.

##### upload.addFile

will emit when adding files to the upload queue.

##### upload.fileExtnameNotMatch

will emit when the added file's extname is not match the `limit` option.

##### upload.addData 

will emit when adding form data.

# Demo

Clone this project, and run `npm i`, after installation finished, run `gulp`.

# License

MIT