export const extend = (src, ...dist) => {
    for (let i of dist) {
        for (let j in i) {
            if (i.hasOwnProperty(j)) {
                src[j] = i[j];
            }
        }
    }
    return src;
};


export const notEmpty = (obj) => {
    let i;
    let flag = false;
    if (Object.keys) {
        flag = !!Object.keys(obj).length;
    } else {
        for (i in obj) {
            if (obj.hasOwnProperty(i)) {
                flag = true;
                break;
            }
        }
    }
    return flag;
};

export const isArray = (obj) => {
    if (Array.isArray) {
        return Array.isArray(obj);
    } else {
        return Object.prototype.toString.call(obj) === '[object Array]';
    }
};