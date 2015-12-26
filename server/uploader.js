import express from 'express';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

const app = express();

app.set('port', 8888);

try {
    fs.statSync(path.resolve(__dirname, '..', 'data'));
} catch(e) {
    if (e.code === 'ENOENT') {
        fs.mkdirSync(path.resolve(__dirname, '..', 'data'));
    }
}

let rename = (oldPath, newPath) => {
    try {
        let status = fs.statSync(newPath);
        if (status.isFile() || status.isDirectory()) {
            let filename = path.basename(newPath);
            let extname = path.extname(newPath);
            let tmpArr1 = filename.split(extname);
            let name = tmpArr1.slice(0, tmpArr1.length - 1).join(extname);
            let tmpArr2 = name.split('_');
            let hasNumber = !Number.isNaN(+tmpArr2[tmpArr2.length - 1]);
            if (tmpArr2.length > 1 && hasNumber) {
                let number = tmpArr2.pop();
                name = tmpArr2.join('_') + '_' + (+number + 1).toString();
            } else {
                name = name + '_1';
            }
            let target = path.join(path.dirname(newPath), name + extname);
            return rename(oldPath, target);
        }
    } catch (e) {
        if (e.code === 'ENOENT') {
            fs.renameSync(oldPath, newPath);
            return newPath;
        }
    }
};

app.all('/upload', (req, res, next) => {
    res.set('Access-Control-Allow-Origin', '*');
    next();
});

app.post('/upload', (req, res) => {
    let form = new formidable.IncomingForm();
    let dirs = [];
    form.uploadDir = path.resolve(__dirname, '..', 'data');
    form.on('file', (name, file) => {
        let dir = rename(file.path, path.resolve(path.dirname(file.path), file.name));
        dirs.push(`/data/${path.basename(dir)}`);
    }).on('end', () => {
        res.json({code: 0, data: dirs});
    });

    form.parse(req);
});

app.use('/data', express.static(path.resolve(__dirname, '..', 'data')));

app.use((req, res) => {
    res.send('OK');
});

app.listen(app.get('port'), (err) => {
    if (err) {throw err;}
    console.log(`server is running on port ${app.get('port')}`);
});