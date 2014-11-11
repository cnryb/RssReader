/// <reference path="../scripts/jquery-2.1.1.intellisense.js" />

Util = {
    //程序创建的根目录
    RootDir: "RssReader",
    //下载文章目录
    ArticleDir: "Article",
    //临时文件的路径
    TmpFilePath: "tmp.xml",
};
(function () {
    document.addEventListener("deviceready", onDeviceReady, false);
    function onDeviceReady() {
        console.log("device is ready ");
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onFileSystemSuccess, onFileSystemFail);
    }


    //获取RootDir目录，如果不存在则创建该目录
    function onFileSystemSuccess(fileSystem) {
        var rootDir = fileSystem.root.getDirectory(Util.RootDir, {
            create: true,
            exclusive: false
        }, onDirectorySuccess, onFileSystemFail);
    }
    //获取RootDir目录下面的TmpFilePath文件，如果不存在则创建此文件
    function onDirectorySuccess(newFile) {

        Util.RootDir = newFile.toURL();
        console.log("成功创建目录" + Util.RootDir);

        var articleDir = newFile.getDirectory(Util.ArticleDir, {
            create: true,
            exclusive: false
        }, function (dir) {
            Util.ArticleDir = dir.toURL();
            console.log("成功创建目录" + Util.ArticleDir);
        }, onFileSystemFail);

        var thisFile = newFile.getFile(Util.TmpFilePath, {
            create: true,
            exclusive: false
        }, onFileSuccess, onFileSystemFail);
    }
    /**
     * 获取FileWriter对象，用于写入数据
     * @param fileEntry
     */
    function onFileSuccess(fileEntry) {
        Util.TmpFilePath = fileEntry.toURL();
        console.log("成功创建文件 in onFileSuccess  " + Util.TmpFilePath);
    }

    function onFileSystemFail(error) {
        console.error("Failed to retrieve file:" + error.code);
    }


})();

function downLoad() {
    var url = $("#url").val();
    downFile(url, Util.TmpFilePath);
}


//从网络上下载文件
function downFile(url, filePath) {
    console.log("开始下载: " + url);

    var fileTransfer = new FileTransfer();
    var uri = encodeURI(url);

    fileTransfer.download(
        uri,
        filePath,
        function (entry) {
            console.log("download complete: " + entry.fullPath);
            readFile(filePath);
        },
        function (error) {
            console.error("download error source " + error.source);
            console.error("download error target " + error.target);
            console.error("download error code" + error.code);
            /*
            1 = FileTransferError.FILE_NOT_FOUND_ERR
            2 = FileTransferError.INVALID_URL_ERR
            3 = FileTransferError.CONNECTION_ERR
            4 = FileTransferError.ABORT_ERR
            5 = FileTransferError.NOT_MODIFIED_ERR
            */
        }
    );
}


function readFile(filePath) {
    console.log(filePath);
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0,
        function (fileSystem) {
            //console.log("获取文件权限成功" + fileSystem.toURL());
            console.log("fileSystem" + filePath);
            //filePath Either an absolute path or a relative path
            //An absolute path is a relative path from the root directory, prepended with a '/'.
            //see http://www.w3.org/TR/2011/WD-file-system-api-20110419/#dfn-absolute-path
            filePath = filePath.replace("file://", "");
            console.log("replace" + filePath);
            fileSystem.root.getFile(filePath, null,
                function (fileEntry) {
                    console.log("fileEntry" + fileEntry);

                    fileEntry.file(function (file) {
                        console.log("file" + file);
                        readAsText(file);
                    }, fail);
                }, fail);
        }, fail);
}
function fail(error) {
    console.error(error.code);
}

function readAsText(file) {
    var reader = new FileReader();
    reader.onloadend = function (evt) {
        var element = document.getElementById('msg');
        element.innerHTML = '<strong>Read as data text:</strong> <br><pre>' + evt.target.result + '</pre>';
    };
    reader.readAsText(file, "utf-8");
}
//应该可以把图片转为base64编码
function readDataUrl(file) {
    var reader = new FileReader();
    reader.onloadend = function (evt) {
        var element = document.getElementById('data1');
        element.innerHTML = '<strong>Read as data URL:</strong> <br><pre>' + evt.target.result + '</pre>';
    };
    reader.readAsDataURL(file);
}

///**
//   * write datas
//   * @param writer
//   */
//function onFileWriterSuccess(writer) {
//    //	log("fileName="+writer.fileName+";fileLength="+writer.length+";position="+writer.position);
//    writer.onwrite = function (evt) {//当写入成功完成后调用的回调函数
//        alert("write success");
//    };
//    writer.onerror = function (evt) {//写入失败后调用的回调函数
//        alert("write error");
//    };
//    writer.onabort = function (evt) {//写入被中止后调用的回调函数，例如通过调用abort()
//        alert("write abort");
//    };
//    // 快速将文件指针指向文件的尾部 ,可以append
//    //	writer.seek(writer.length);
//    writer.write(datas);//向文件中写入数据
//    //	writer.truncate(11);//按照指定长度截断文件
//    //	writer.abort();//中止写入文件
//}

//function onFileSystemFail(error) {
//    alert("Failed to retrieve file:" + error.code);
//}