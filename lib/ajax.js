import * as util from './util';

const defaultOption = {
    url: null,
    params: {},
    data: null,
    xhr: new XMLHttpRequest(),
    status: 'pending',
    callbackList: [],
    headers: {}
};

export default class Ajax {
    constructor (option) {
        if (typeof XMLHttpRequest === 'undefined') {
            Ajax.Error('NOT_SUPPORT');
            return;
        }
        util.extend(this, defaultOption, option);
        this.xhr.addEventListener('load', () => {
            let response = this.xhr.response;
            this.status = 'complete';
            if (this.xhr.status === 200) {
                try {
                    response = JSON.parse(response);
                } catch (e) {}
                this.emit('success', response);
            } else {
                this.emit('error', this.xhr);
            }
        });
        this.xhr.addEventListener('progress', (event) => {
            let percent;
            this.status = 'uploading';
            percent = event.lengthComputable ? (event.loaded / event.total) : 0;
            this.emit('progress', event, percent);
        });
        this.xhr.addEventListener('error', (e) => {
            this.emit('error', e);
        });
        this.xhr.addEventListener('abort', (e) => {
            this.emit('abort', e);
        });
        if (util.notEmpty(this.headers)) {
            for (let i of Object.keys(this.headers)) {
                this.setHeader(i, this.headers[i]);
            }
        }
        return this;
    }
    static Error (type) {
        let errorMsg;
        switch (type) {
            case 'NOT_SUPPORT':
                errorMsg = `Browser not support XMLHttpRequest.`;
                break;
            case 'NO_URL':
                errorMsg = 'No url provided.';
                break;
        }
        if (errorMsg) {
            throw `Ajax Error: ${errorMsg}`;
        }
    }
    send () {
        if (!this.url) {
            Ajax.Error('NO_URL');
            return;
        }
        let url = this.url;
        let tmpArr = [];
        for (let i in this.params) {
            if (this.params.hasOwnProperty(i)) {
                tmpArr.push(`${i}=${this.params[i]}`);
            }
        }
        url = `${url}?${tmpArr.join('&')}`;
        this.xhr.open('POST', url);
        if (util.notEmpty(this.headers)) {
            for (let i in this.headers) {
                if (this.headers.hasOwnProperty(i)) {
                    this.xhr.setRequestHeader(i, this.headers[i]);
                }
            }
        }
        this.xhr.send(this.data);
        return this;
    }
    abort () {
        this.xhr.abort();
        return this;
    }
    setHeader (name, value) {
        this.headers[name] = value;
        return this;
    }
    on (type, callback, context, once) {
        this.callbackList[type] = this.callbackList[type] || [];
        this.callbackList[type].push({fn: callback, context, once});
        return this;
    }
    emit (type, ...arg) {
        if (this.callbackList[type] && this.callbackList[type].length) {
            let i = 0;
            let list = this.callbackList[type];
            for (; i < list.length; i += 1) {
                let obj = list[i];
                obj.fn.apply(obj.context, arg);
                if (obj.once) {
                    list.splice(i, 1);
                    i -= 1;
                }
            }
        }
    }
}