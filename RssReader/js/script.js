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
        var xmlDoc = loadXML(evt.target.result)

        var channel = xmlDoc.getElementsByTagName("channel");
        var item = channel[0].getElementsByTagName("item");
        for (var i = 0; i < item.length; i++) {
            var title = item[i].getElementsByTagName("title")[0].firstChild.nodeValue;
            var description = item[i].getElementsByTagName("description")[0].firstChild.data;
            $("#title").html(title);
            $("#content").html(description);
        }
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


loadXML = function (xmlString) {
    var xmlDoc = null;
    //判断浏览器的类型
    //支持IE浏览器 
    if (!window.DOMParser && window.ActiveXObject) {   //window.DOMParser 判断是否是非ie浏览器
        var xmlDomVersions = ['MSXML.2.DOMDocument.6.0', 'MSXML.2.DOMDocument.3.0', 'Microsoft.XMLDOM'];
        for (var i = 0; i < xmlDomVersions.length; i++) {
            try {
                xmlDoc = new ActiveXObject(xmlDomVersions[i]);
                xmlDoc.async = false;
                xmlDoc.loadXML(xmlString); //loadXML方法载入xml字符串
                break;
            } catch (e) {
            }
        }
    }
        //支持Mozilla浏览器
    else if (window.DOMParser && document.implementation && document.implementation.createDocument) {
        try {
            /* DOMParser 对象解析 XML 文本并返回一个 XML Document 对象。
             * 要使用 DOMParser，使用不带参数的构造函数来实例化它，然后调用其 parseFromString() 方法
             * parseFromString(text, contentType) 参数text:要解析的 XML 标记 参数contentType文本的内容类型
             * 可能是 "text/xml" 、"application/xml" 或 "application/xhtml+xml" 中的一个。注意，不支持 "text/html"。
             */
            domParser = new DOMParser();
            xmlDoc = domParser.parseFromString(xmlString, 'text/xml');
        } catch (e) {
        }
    }
    else {
        return null;
    }

    return xmlDoc;
}
