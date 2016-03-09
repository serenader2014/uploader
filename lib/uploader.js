import Ajax      from './ajax';
import * as util from './util';

const defaultOption = {
    files        : [],
    limit        : '*',
    formData     : {},
    multiple     : false,
    auto         : false,
    method       : 'POST',
    // 是否监听上传事件。如果监听上传事件的话，会强制将请求 preflight，
    // 如果服务器没有为 option 方法配制跨域请求头的话 则会上传失败。
    progressEvent: true
};

export default class Uploader extends Ajax {
    constructor (option) {
        super(util.extend(defaultOption, option));
        if (typeof FormData === 'undefined') {
            Uploader.Error('NOT_SUPPORT', 'FormData');
            return;
        }
        if (typeof File === 'undefined') {
            Uploader.Error('NOT_SUPPORT', 'File');
            return;
        }
        if (typeof Blob === 'undefined') {
            Uploader.Error('NOT_SUPPORT', 'Blob');
            return;
        }
        this.data = new FormData();
        if (this.progressEvent) {
            this.upload = this.xhr.upload;
            this.upload.addEventListener('progress', (event) => {
                let percent;
                this.status = 'uploading';
                percent = event.lengthComputable ? (event.loaded / event.total) : 0;
                this.emit('upload.progress', event, percent);
            });
            this.upload.addEventListener('error', (e) => {
                this.status = 'error';
                this.emit('upload.error', e);
            });
            this.upload.addEventListener('abort', (e) => {
                this.status = 'abort';
                this.emit('upload.abort', e);
            });
        }
        this.on('success', (...args) => {
            this.status = 'success';
            this.emit.apply(this, ['upload.success'].concat(args));
        });
        this._files = [];
        for (let i of Object.keys(this.formData)) {
            this.addData(i, this.formData[i]);
        }
        if (this.auto) {
            this.start();
        }
    }
    static Error (type, ...msg) {
        let errorMsg;
        switch (type) {
            case 'NOT_SUPPORT':
                errorMsg = `Browser not support ${msg[0]}`;
                break;
            case 'NOT_INIT':
                errorMsg = 'Uploader haven\'t inited.';
                break;
            case 'NO_FILES':
                errorMsg = 'Target file is empty.';
                break;
            case 'NO_URL':
                errorMsg = 'No upload url provided.';
                break;
            case 'NO_ELEMENT':
                errorMsg = 'No element to trigger select file.';
                break;
        }
        if (errorMsg) {
            throw `Uploader Error: ${errorMsg}`;
        }
    }
    addFile (key, file, filename) {
        let flag = false;
        let name = file.name;
        let extname = name.split('.').pop();

        if (util.isArray(this.limit)) {
            for (let i = 0, l = this.limit.length; i < l; i += 1) {
                if (extname === this.limit[i]) {
                    flag = true;
                    break;
                }
            }
        } else if (this.limit === '*' || extname === this.limit) {
            flag = true;
        }
        if (flag) {
            this._files.push({[filename]: file});
            this.formData[filename] = file;
            this.data.append(key, file, filename);
            this.emit('upload.addFile', file);
        } else {
            this.emit('upload.fileExtnameNotMatch', file);
        }
        return this;
    }
    addData (key, value) {
        this.formData[key] = value;
        this.data.append(key, value);
        this.emit('upload.addData', {[key]: value});
        return this;
    }
    start () {
        if (!this.files.length) {
            Uploader.Error('NO_FILES');
            return;
        }
        if (!this.url) {
            Uploader.Error('NO_URL');
            return;
        }
        super.send();
        this.emit('upload.start');
        return this;
    }
    bind (element) {
        if (!element) {
            Uploader.Error('NO_ELEMENT');
            return;
        }
        let input = document.createElement('input');
        input.setAttribute('type', 'file');
        if (this.multiple) {
            input.setAttribute('multiple', true);
        }
        input.addEventListener('change', () => {
            if (input.files.length) {
                for (let i of Object.keys(input.files)) {
                    this.addFile('file', input.files[i], input.files[i].name);
                }
                this.start();
            }
        });
        element.addEventListener('click', () => {
            input.click();
        });

        return this;
    }
    reset () {
        this.formData = {};
        this._files   = [];
        this.files    = [];
        this.status   = 'pending'
        this.data     = new FormData();
    }
    get files () {
        return this._files;
    }
    set files (arr) {
        if (util.isArray(arr) && arr.length) {
            let _formData = this.formData;
            let formData  = {};
            for (let i of Object.keys(_formData)) {
                let item = _formData[i];
                if (!(item instanceof File || item instanceof Blob)) {
                    formData[i] = item;
                }
            }
            this.reset();
            this.formData = formData;
            for (let i of Object.keys(this.formData)) {
                this.data.append(i, this.formData[i]);
            }
            arr.forEach((item) => { 
                this.addFile('file', item, item.name || 'file'); 
            });
        }
    }
}