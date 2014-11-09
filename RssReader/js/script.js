/// <reference path="../scripts/jquery-2.1.1.intellisense.js" />

function downLoad() {

    //requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fileSystem) {
    //    fileSystem
    //    fileSystem.root.getDirectory("file_mobile/download", { create: true },
    //           function (fileEntry) { },
    //           function () {
    //               alert("创建目录失败");
    //           });


    //    var fileTransfer = new FileTransfer();

    //    var url = encodeURI($("#url").val());
    //    var filePath = "file:///file_mobile/download/a.png"

    //    fileTransfer.download(url, filePath, function () {
    //        alert("ok");
    //        //下载成功
    //    }, function () {
    //        //下载失败
    //        alert("error");

    //    });
    //});


    //window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onFileSystemSuccess, fail);
    //window.resolveLocalFileSystemURI("file:///example.txt", onResolveSuccess, fail);

    //function onFileSystemSuccess(fileSystem) {
    //    console.log(fileSystem.name);
    //}

    //function onResolveSuccess(fileEntry) {
    //    console.log(fileEntry.name);
    //}

    //function fail(evt) {
    //    console.log(evt.target.error.code);
    //}
    onDeviceReady();
 //   downFile($("#url").val());
}
util.appRootDirName = "test";
// 等待加载PhoneGap
document.addEventListener("deviceready", onDeviceReady, false);
// PhoneGap加载完毕
function onDeviceReady() {
    //查找是否有zgky这个文件夹，没有则创建，然后找到这个文件夹的绝对路径
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fileSystem) {
        //util.appRootDirName 全局变量，这里是zgky
        fileSystem.root.getDirectory(util.appRootDirName, {
            create: true,
            exclusive: false
        }, function (entry) {
            //网上流传的资料中都是使用fullPath，在这里我获取到的是相对目录，在下载时使用会报错，所以换做了toURL()
            //这是一个全局全局变量，用以保存路径
            util.fullPath = entry.toURL();
            //console.log('创建文件夹成功');
            //console.log(util.fullPath);
        }, function () {
            alert('创建文件夹失败');
        });
    }, function () {
        alert('创建文件夹失败');
    });
}

function downFile(url) {
    var me = this,
        //正则表达式，用于获取文件名称
    reg = /[^\\\/]*[\\\/]+/g,
    //获取下载地址，me.fullPath在main控制层中获取，这是一个全局变量
    filePath = me.fullPath + "/" + url.replace(reg, ''),
    //下载地址
    url = encodeURI(url),
    fileTransfer = new FileTransfer();
    alert('正在下载中，请等待...');
    fileTransfer.download(url, filePath,
    function (entry) {
        alert('下载成功！请在' + entry.fullPath + '目录中查看');
    },
    function (error) {
        alert('下载失败！' + error.code);
    });
}