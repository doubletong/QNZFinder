﻿/*!
 * QNZFinder - file manager for web
 * Version 1.0.1 (2020-01-31)
 * http://heiniaozhi.cn
 *
 * Copyright 2012-2020, 黑鸟志
 * Licensed under a 3-clauses BSD license
 */


var SIG = (function () {
    var instance;

    //获取根目录列表
    function getDirectories(url) {

        $.getJSON(url, function (result) {
            var lastOpenPath = localStorage.getItem('lastOpenPath');
            var dirs = '';
            $.each(result, function (i, item) {
                //     console.log(item);
                var isHidden = item.hasChildren ? "" : "hidden";
                var isplus = item.isOpen ? "minus" : "plus";
                dirs += '<li class="' + isplus + '">';
                dirs += '<div class="exp"><a href="#" class="btnDir" data-loaded="1" data-path="' + item.dirPath + '" ' + isHidden + '>';
                dirs += '<span class="iconfont icon-' + isplus + ' fa-fw"></span></a></div> ';
                if (lastOpenPath == item.dirPath) {
                    dirs += '<a href="#" class="btnFile active" data-path="' + item.dirPath + '"><span class="iconfont icon-folder-open-fill fa-fw"></span>' + item.name + '</a>';
                } else {
                    dirs += '<a href="#" class="btnFile" data-path="' + item.dirPath + '"><span class="iconfont icon-folder-fill fa-fw"></span>' + item.name + '</a>';
                }

                dirs += loadSubDirectories(item.children);

                dirs += '</li > ';
            });

            $("#dirTree").html(dirs);

        });
    }


    // 递归加载子目录
    function loadSubDirectories(items) {
        var lastOpenPath = localStorage.getItem('lastOpenPath');
        var dirs = '<ul class="subTree">';
        $.each(items, function (key, val) {

            var isHidden = val.hasChildren ? "" : "hidden";
            var isplus = val.isOpen ? "minus" : "plus";
            dirs += '<li class="' + isplus + '">';
            dirs += '<div class="exp"><a href="#" class="btnDir" data-loaded="1" data-path="' + val.dirPath + '" ' + isHidden + '>' +
                '<span class="iconfont icon-plus fa-fw"></span>' +
                '</a></div>';
            if (lastOpenPath == val.dirPath) {
                dirs += '<a href="#" class="btnFile active" data-path="' + val.dirPath + '"><span class="iconfont icon-folder-open-fill"></span>' + val.name + '</a>';
            } else {
                dirs += '<a href="#" class="btnFile" data-path="' + val.dirPath + '"><span class="iconfont icon-folder-fill"></span>' + val.name + '</a>';
            }

            dirs += loadSubDirectories(val.children);  // 递归加载
            dirs += '</li>';

        });
        dirs += '</ul>';
        return dirs;
    }

    //获取子目录列表
    function getSubDirectories(url, li) {
        li.find("ul").remove();
        //console.log(li);
        $.getJSON(url, function (result) {

            var item = "";
            $.each(result, function (key, val) {
                // debugger;
                var isHidden = val.hasChildren ? "" : "hidden";
                item += '<li>' +
                    '<div class="exp"><a href="#" class="btnDir" data-loaded="0" data-path="' + val.dirPath + '" ' + isHidden + '>' +
                    '<span class="iconfont icon-plus fa-fw"></span>' +
                    '</a></div>' +
                    '<a href="#" class="btnFile" data-path="' + val.dirPath + '"><span class="iconfont icon-folder-fill"></span>' + val.name + '</a>' +
                    '</li>';

            });

            $('<ul/>', { html: item }).addClass("subTree").appendTo(li);

            li.children(".exp").find("a").attr("data-loaded", "1").find("span").removeClass("icon-plus").addClass("icon-minus");

        });
    }



    //获取文件列表
    function getFiles(url) {
        $.getJSON(url, function (result) {
            loadFiles(result);
        });
    }


    function loadFiles(result) {
        $('#fileList').empty(); // Clear the table body.

        $.each(result, function (key, val) {
            // debugger;
            var item = '<div class="itembox">' +
                '<div class="qnz-card item" data-file="' + val.filePath + '" data-name="' + val.name + '">' +
                '<div class="qnz-card-body">' +
                '<img src="' + val.imgUrl + '" class="img-responsive" />' +
                '</div>' +
                '<div class="qnz-card-footer">' +
                '<div class="filename"><span>' + val.name + '</span></div>' +
                '<div class="date">date: ' + val.createdDate + '</div> ' +
                '<div class="buttons">' +
                '<div class="qnz-btn-group" role="group">' +
                '<button type="button" class="qnz-btn rename" title="重命名"><i class="iconfont icon-edit"></i></button>' +
                '<button type="button" class="qnz-btn download" title="下载"><i class="iconfont icon-download"></i></button>' +
                '<button type="button" class="qnz-btn btnDelete" title="删除"><i class="iconfont icon-delete"></i></button>' +
                '</div><div class="fileSize">' + val.fileSize + 'KB</div>' +
                '</div>' +
                '' +
                '</div>' +
                '</div>';
            $(item).appendTo($('#fileList'));
        });
    };


    //打开当前的路径
    function loadCurrentURL(url) {
        url = url;
        var baseUrl = "/Uploads/";


        if (url.startsWith(baseUrl)) {
            var dir = url.split("/");
            var index = url.indexOf(dir[dir.length - 1]) - 1;

            var subStr = url.substring(9, index);
            var subDir = subStr.split("/");
            var goDir = baseUrl;
            for (var i = 0; i < subDir.length; i++) {
                goDir = goDir + subDir[i];
                goDir = goDir;

                var li = $("a[data-path='" + goDir + "']").eq(0).closest("li");

                if (i < (subDir.length - 1)) {

                    var urlDir = "/qnzfinder/GetSubDirectories?dir=" + goDir;
                    SIG.getInstance().getSubDirectories(urlDir, li);
                    goDir = goDir + "/";
                } else {

                    var urlDir = "/qnzfinder/GetSubFiles?dir=" + goDir;

                    SIG.getInstance().getFiles(urlDir);
                    $("#btnRefresh").attr("data-dir", goDir);

                    setTimeout(function () {
                        $("[data-path='" + goDir + "']").eq(1).addClass("active").children("span").removeClass("icon-folder-fill").addClass("icon-folder-open-fill");
                        $("#fileList div[data-file='" + url + "']").addClass("active");
                    }, 1000);

                }


            }
            //alert(url.substring(9, index));
        }

    }

    function renameFile(oldpath, newpath, item) {

        $.ajax({
            type: "POST",
            contentType: "application/json",
            url: "/qnzfinder/RenameFile?filePath=" + oldpath + "&newFilePath=" + newpath,
            //  data: JSON.stringify({filePath: filePath }),
            dataType: 'json',
            success: function (result) {
                if (result.status === 1) {
                    // container.remove()
                    toastr.success(result.message);
                    item.attr("data-file", newpath);
                    item.find(".boxfooter").children("span").text(newpath.split('/').pop());

                } else {
                    toastr.error(result.message);
                }

            }
        });
    }

    // 初始化
    function Initialize() {

        var lastOpenPath = localStorage.getItem('lastOpenPath');
        var url = lastOpenPath != null ? "/qnzfinder/currentdirectories?currentDir=" + lastOpenPath : "/qnzfinder/currentdirectories";
        getDirectories(url);

        var url2 = lastOpenPath != null ? "/qnzfinder/GetSubFiles?dir=" + lastOpenPath : "/qnzfinder/GetSubFiles";
        getFiles(url2);

        var tdir = lastOpenPath == null ? $("#rootDir").val() : lastOpenPath;

        setCurrentFilePath(tdir);

    }

    // 设置当前目录
    function setCurrentFilePath(filePath) {

        var elFilePath = document.getElementById("filePath");
        elFilePath.innerText = filePath;

        var elFilePath2 = document.getElementById("filePathForm");
        elFilePath2.value = filePath;
    }




    function createInstance() {
        return {
            Initialize: Initialize,
            getFiles: getFiles,
            getSubDirectories: getSubDirectories,
            getDirectories: getDirectories,
            renameFile: renameFile,
            loadCurrentURL: loadCurrentURL,
            setCurrentFilePath: setCurrentFilePath
        }
    }
    return {
        getInstance: function () {
            return instance || (instance = createInstance());
        }
    }

}());


//右键菜单
(function () {

    "use strict";

    //////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////
    //
    // H E L P E R    F U N C T I O N S
    //
    //////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////

    /**
     * Function to check if we clicked inside an element with a particular class
     * name.
     * 
     * @param {Object} e The event
     * @param {String} className The class name to check against
     * @return {Boolean}
     */
    function clickInsideElement(e, className) {
        var el = e.srcElement || e.target;

        if (el.classList.contains(className)) {
            return el;
        } else {
            while (el = el.parentNode) {
                if (el.classList && el.classList.contains(className)) {
                    return el;
                }
            }
        }

        return false;
    }

    /**
     * Get's exact position of event.
     * 
     * @param {Object} e The event passed in
     * @return {Object} Returns the x and y position
     */
    function getPosition(e) {
        var posx = 0;
        var posy = 0;

        if (!e) var e = window.event;

        if (e.pageX || e.pageY) {
            posx = e.pageX;
            posy = e.pageY;
        } else if (e.clientX || e.clientY) {
            posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }

        return {
            x: posx,
            y: posy
        }
    }

    //////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////
    //
    // C O R E    F U N C T I O N S
    //
    //////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////

    /**
     * Variables.
     */
    var contextMenuClassName = "context-menu";
    var contextMenuItemClassName = "context-menu__item";
    var contextMenuLinkClassName = "context-menu__link";
    var contextMenuActive = "context-menu--active";

    var taskItemClassName = "btnFile";
    var taskItemInContext;

    var clickCoords;
    var clickCoordsX;
    var clickCoordsY;

    var menu = document.querySelector("#context-menu");
    //var menuItems = menu.querySelectorAll(".context-menu__item");
    var menuState = 0;
    var menuWidth;
    var menuHeight;
    var menuPosition;
    var menuPositionX;
    var menuPositionY;

    var windowWidth;
    var windowHeight;

    /**
     * Initialise our application's code.
     */
    function init() {
        contextListener();
        clickListener();
        keyupListener();
        resizeListener();
    }

    /**
     * Listens for contextmenu events.
     */
    function contextListener() {
        document.addEventListener("contextmenu", function (e) {
            taskItemInContext = clickInsideElement(e, taskItemClassName);

            if (taskItemInContext) {
                e.preventDefault();
                toggleMenuOn();
                positionMenu(e);
            } else {
                taskItemInContext = null;
                toggleMenuOff();
            }
        });
    }

    /**
     * Listens for click events.
     */
    function clickListener() {
        document.addEventListener("click", function (e) {
            var clickeElIsLink = clickInsideElement(e, contextMenuLinkClassName);

            if (clickeElIsLink) {
                e.preventDefault();
                menuItemListener(clickeElIsLink);
            } else {
                var button = e.which || e.button;
                if (button === 1) {
                    toggleMenuOff();
                }
            }
        });
    }

    /**
     * Listens for keyup events.
     */
    function keyupListener() {
        window.onkeyup = function (e) {
            if (e.keyCode === 27) {
                toggleMenuOff();
            }
        }
    }

    /**
     * Window resize event listener
     */
    function resizeListener() {
        window.onresize = function (e) {
            toggleMenuOff();
        };
    }

    /**
     * Turns the custom context menu on.
     */
    function toggleMenuOn() {
        if (menuState !== 1) {
            menuState = 1;
            menu.classList.add(contextMenuActive);
        }
    }

    /**
     * Turns the custom context menu off.
     */
    function toggleMenuOff() {
        if (menuState !== 0) {
            menuState = 0;
            menu.classList.remove(contextMenuActive);
        }
    }

    /**
     * Positions the menu properly.
     * 
     * @param {Object} e The event
     */
    function positionMenu(e) {
        clickCoords = getPosition(e);
        clickCoordsX = clickCoords.x;
        clickCoordsY = clickCoords.y;

        menuWidth = menu.offsetWidth + 4;
        menuHeight = menu.offsetHeight + 4;

        windowWidth = window.innerWidth;
        windowHeight = window.innerHeight;

        var parentOffset = $("#dirbody").offset();

        if ((windowWidth - clickCoordsX) < menuWidth) {
            menu.style.left = windowWidth - menuWidth - parentOffset.left + "px";
        } else {
            menu.style.left = clickCoordsX - parentOffset.left + "px";
        }

        if ((windowHeight - clickCoordsY) < menuHeight) {
            menu.style.top = windowHeight - menuHeight - parentOffset.top + "px";
        } else {
            menu.style.top = clickCoordsY - parentOffset.top + "px";
        }
    }

    /**
     * Dummy action function that logs an action when a menu item link is clicked
     * 
     * @param {HTMLElement} link The link that was clicked
     */
    function menuItemListener(link) {
        //  console.log("Task ID - " + taskItemInContext.getAttribute("data-path") + ", Task action - " + link.getAttribute("data-action"));

        var filePath = taskItemInContext.getAttribute("data-path");
        var action = link.getAttribute("data-action");
        switch (action) {
            case "create":
                var newName = prompt("创建子目录", "");
                if (newName.length > 0) {
                    $.ajax({
                        type: "POST",
                        contentType: "application/json",
                        url: "/qnzfinder/CreateDir?filePath=" + filePath + "&dir=" + newName,
                        //  data: JSON.stringify({filePath: filePath }),
                        dataType: 'json',
                        success: function (result) {
                            if (result.status === 1) {

                                toastr.success(result.message, "创建目录")
                                var li = taskItemInContext.closest("li");
                                var urlDir = "/qnzfinder/GetSubDirectories?dir=" + filePath;
                                SIG.getInstance().getSubDirectories(urlDir, $(li));

                            }
                            else {
                                toastr.error(result.message, "创建目录");
                            }

                        }
                    });
                }

                break;
            case "delete":

                $.ajax({
                    type: "POST",
                    contentType: "application/json",
                    url: "/qnzfinder/DeleteDir?filePath=" + filePath,
                    //  data: JSON.stringify({filePath: filePath }),
                    dataType: 'json',
                    success: function (result) {

                        if (result.status === 1) {
                            toastr.success(result.message, "删除目录")
                            var li = taskItemInContext.closest("li"), parentLi = $(li).closest("ul").closest("li"),
                                parentPath = $(li).closest("ul").prevAll("a:first").attr("data-path");

                            var urlDir = "/qnzfinder/GetSubDirectories?dir=" + parentPath
                            SIG.getInstance().getSubDirectories(urlDir, parentLi);


                        }
                        else {
                            toastr.error(result.message, "删除目录")
                        }

                    }
                });

                break;
            case "rename":

                var dirName = filePath.split('/').pop();

                var newName = prompt("重命名", dirName);
                if (newName != null) {
                    var index = filePath.length - dirName.length;
                    var newPath = filePath.substr(0, index) + newName;


                    $.ajax({
                        type: "POST",
                        contentType: "application/json",
                        url: "/qnzfinder/RenameDir?filePath=" + filePath + "&newFilePath=" + newPath,
                        //  data: JSON.stringify({filePath: filePath }),
                        dataType: 'json',
                        success: function (result) {
                            if (result.status === 1) {
                                toastr.success(result.message, "重命名目录")
                                var li = taskItemInContext.closest("li"), parentLi = $(li).closest("ul").closest("li"),
                                    parentPath = $(li).closest("ul").prevAll("a:first").attr("data-path");

                                var urlDir = "/qnzfinder/GetSubDirectories?dir=" + parentPath
                                SIG.getInstance().getSubDirectories(urlDir, parentLi);


                            }
                            else {
                                toastr.error(result.message, "重命名目录")
                            }

                        }
                    });
                    // SIG.getInstance().renameFile(filePath, newPath, download);

                }


                break;
        }

        toggleMenuOff();
    }

    /**
     * Run the app.
     */
    init();

})();


////page js
//function closeUploader() {
//    $("#thelist").html("");
//    $("#picker").text("选择文件")
//    $("#uploadFile").removeClass("show").animate({ top: "-100px" }, 600);
//}

////上传文件
//function uploadFiles(inputId) {
//    var filePath = $("#dirTree a.active").attr("data-path");
//    var serverUrl = filePath !== undefined ? filePath : "";


//    var input = document.getElementById(inputId);
//    var files = input.files;
//    var formData = new FormData();

//    for (var i = 0; i != files.length; i++) {
//        formData.append("files", files[i]);
//    }

//    formData.append("filePath", serverUrl);
//    //debugger;
//    $.ajax(
//        {
//            url: "/Admin/QNZFinder/UploadFiles",
//            data: formData,
//            processData: false,
//            contentType: false,
//            type: "POST",
//            xhr: function () {
//                var xhr = new window.XMLHttpRequest();
//                xhr.upload.addEventListener("progress",
//                    function (evt) {
//                        if (evt.lengthComputable) {
//                            var progress = Math.round((evt.loaded / evt.total) * 100);

//                            console.log(progress);
//                        }
//                    },
//                    false);
//                return xhr;
//            },
//            success: function (data) {
//               // alert("Files Uploaded!");

//                closeUploader();

//                if (filePath !== undefined) {
//                    var url = "/qnzfinder/GetSubFiles?dir=" + filePath;

//                    SIG.getInstance().getFiles(url);
//                    // $("#btnRefresh").attr("data-dir", dir);
//                } else {
//                    //载入初始目录
//                    SIG.getInstance().Initialize();
//                }
//            }
//        }
//    );
//}






//var SIGFinder = {   

//    FilePickerCallback: function(callback, value, meta) {
//        tinymce.activeEditor.windowManager.open({
//            file: '/Admin/QNZFinder/FinderForTinyMce',// use an absolute path!
//            title: 'QNZFinder 1.0',
//            width: 900,
//            height: 450,
//            resizable: 'yes'
//        }, {
//                oninsert: function (file, fm) {
//                    var url, reg, info;

//                    // URL normalization
//                    // url = fm.convAbsUrl(file.url);
//                    url = "/" + file.path;
//                    // Make file info
//                    info = file.name + ' (' + fm.formatSize(file.size) + ')';

//                    // Provide file and text for the link dialog
//                    if (meta.filetype == 'file') {
//                        callback(url, { text: info, title: info });
//                    }

//                    // Provide image and alt text for the image dialog
//                    if (meta.filetype == 'image') {
//                        callback(url, { alt: info });
//                    }

//                    // Provide alternative source and posted for the media dialog
//                    if (meta.filetype == 'media') {
//                        callback(url);
//                    }
//                }
//            });
//            return false;
//        },


//};


var QNZ = {
    ImagesUploadHandler: function (blobInfo, success, failure) {
        var xhr, formData;

        xhr = new XMLHttpRequest();
        xhr.withCredentials = false;
        xhr.open('POST', '/QNZFinder/ImageUpload');

        xhr.onload = function () {
            var json;

            if (xhr.status != 200) {
                failure('HTTP Error: ' + xhr.status);
                return;
            }

            json = JSON.parse(xhr.responseText);

            if (!json || typeof json.location != 'string') {
                failure('Invalid JSON: ' + xhr.responseText);
                return;
            }

            success(json.location);
        };


        var description = '';

        jQuery(tinymce.activeEditor.dom.getRoot()).find('img').not('.loaded-before').each(
            function () {
                description = $(this).attr("alt");
                $(this).addClass('loaded-before');
            });

        formData = new FormData();
        formData.append('file', blobInfo.blob(), blobInfo.filename());
        formData.append('description', description); //found now))

        xhr.send(formData);
    },


    percent: 70,
    baseUrl: "/QNZFinder/SingleFinder",
    selectActionFunction: null,
    elFinderCallback: function (fileUrl) {
        this.selectActionFunction(fileUrl);
    },
    open: function () {
        var w = 1140,
            h = 600; // default sizes
        if (window.screen) {
            w = window.screen.width * this.percent / 100;
            h = window.screen.height * this.percent / 100;
        }
        var x = screen.width / 2 - w / 2;
        var y = screen.height / 2 - h / 2;

        window.open(this.baseUrl, "_blank", 'height=' + h + ',width=' + w + ',left=' + x + ',top=' + y);
    },

    FilePickerCallback: function (callback, value, meta) {
        // Provide file and text for the link dialog
        // if (meta.filetype == 'file') {
        //   callback('mypage.html', {text: 'My text'});
        // }

        // // Provide image and alt text for the image dialog
        //if (meta.filetype == 'image') {

        //   callback('myimage.jpg', {alt: 'My alt text'});
        // }

        // // Provide alternative source and posted for the media dialog
        // if (meta.filetype == 'media') {
        //   callback('movie.mp4', {source2: 'alt.ogg', poster: 'image.jpg'});
        // }
        var finderUrl = '/QNZFinder/FinderForTinyMce';
        tinyMCE.activeEditor.windowManager.openUrl({
            url: finderUrl,
            title: 'QNZFinder 1.0 文件管理',
            width: 1140,
            height: 700
            // onMessage: function (api, data) {
            //     if (data.mceAction === 'FileSelected') {
            //        callback(data.url);
            //        api.close();
            //    }
            //}
        });

        window.addEventListener('message', function (event) {
            var data = event.data;
            callback(data.content);
        });

    },

    // 所有UI事件绑定
    AllUIEventsBind: function () {

        // 拖拽上传 打开弹窗
        var btnDropUpload = document.getElementById("btnDropUpload");
        btnDropUpload.addEventListener("click", function () {

            var uploadbox = document.getElementById("uploadbox");
            uploadbox.style.display = "block";

        });

        // 关闭弹窗
        var btnClose = document.getElementById("btnClose");
        btnClose.addEventListener("click", function () {

            var uploadbox = document.getElementById("uploadbox");
            uploadbox.style.display = "none";

        });




        //$("#btnUploadFiles").click(function (e) {
        //    e.preventDefault();
        //    uploadFiles("FileInput");

        //});

        //$("#btnUpload").on("click", function () {

        //    if ($("#uploadFile").hasClass("show")) return;
        //    $("#uploadFile").animate({ top: "50px" }, 600).addClass("show");

        //});

        //$("#btnClose").on("click", function () {
        //    closeUploader();
        //});


        $("body").delegate("#btnRoot", "click", function (e) {
            e.preventDefault();

            localStorage.clear();  // 清除最后路径

            SIG.getInstance().Initialize();

        });

        $("body").delegate("a.btnDir", "click", function (e) {
            //$(".btnDir").on("click", function (e) {

            e.preventDefault();
            var parent = $(this).closest('li');
            parent.toggleClass('plus');
            parent.toggleClass('minus');
            $(this).children("span").removeClass("icon-minus").addClass("icon-plus");

            var dir = $(this).attr("data-path");
            var isLoaded = $(this).attr("data-loaded")
            if (isLoaded === "0") {

                var urlDir = "/qnzfinder/GetSubDirectories?dir=" + dir;
                SIG.getInstance().getSubDirectories(urlDir, parent);

            }


        });

        $("body").delegate("a.btnFile", "click", function (e) {

            //  $(".btnFile").on("click", function (e) {
            e.preventDefault();

            $("#dirTree a.active").removeClass("active").children("span").removeClass("icon-folder-open-fill").addClass("icon-folder-fill");
            $(this).addClass("active");
            var dir = $(this).attr("data-path"),
                url = "/qnzfinder/GetSubFiles?dir=" + dir;

            localStorage.setItem('lastOpenPath', dir);  //记录最后打开路径

            $(this).children("span").removeClass("icon-folder-fill").addClass("icon-folder-open-fill");

            SIG.getInstance().getFiles(url);

            //$("#btnRefresh").attr("data-dir", dir);
            //$("#filePath").text(dir);
            //var filePath = document.getElementById("filePath");
            //filePath.innerText = dir;

            SIG.getInstance().setCurrentFilePath(dir)
        });

        $("body").delegate("#btnRefresh", "click", function (e) {

            //  $(".btnFile").on("click", function (e) {
            e.preventDefault();

            var filePath = document.getElementById("filePath");
            var dir = filePath.innerText; //$(this).attr("data-dir"),
            var url = "/qnzfinder/GetSubFiles?dir=" + dir;

            SIG.getInstance().getFiles(url);

        });


        $("body").delegate("div.item", "click", function (e) {

            //  $(".btnFile").on("click", function (e) {
            e.preventDefault();

            if ($(this).hasClass("active")) {
                $(this).removeClass("active");
            } else {
                $("#fileList .item.active").removeClass("active");
                $(this).addClass("active");
            }

        });


        $("body").delegate(".rename", "click", function (e) {
            e.preventDefault();
            var download = $(this).closest(".item");
            var filePath = download.attr("data-file");

            var filename = filePath.split('/').pop();

            var newName = prompt("重命名", filename);
            if (newName != null) {

                var index = filePath.length - filename.length;
                var newPath = filePath.substr(0, index) + newName;
                //   var newPath = filePath.replace(filename, newName);
                var oldext = filePath.split('.').pop().toLowerCase();
                var newext = newName.split('.').pop().toLowerCase();

                if (oldext === newext) {
                    SIG.getInstance().renameFile(filePath, newPath, download);

                } else {
                    if (confirm("改变文件后缀名，可能导致文件不可用，是否要修改？")) {
                        SIG.getInstance().renameFile(filePath, newPath, download);
                    }

                }

            }


        });


        $("body").delegate(".download", "click", function (e) {
            e.preventDefault();
            var download = $(this).closest(".item");
            var filePath = download.attr("data-file");
            // debugger;
            location.href = "/qnzfinder/Download?filePath=" + filePath;

        });

        $("body").delegate(".btnDelete", "click", function (e) {
            e.preventDefault();
            var download = $(this).closest(".item");
            var filePath = download.attr("data-file");
            var container = $(this).closest(".itembox");
            // debugger;
            $.ajax({
                type: "POST",
                contentType: "application/json",
                url: "/qnzfinder/DeleteFile?filePath=" + filePath,
                //  data: JSON.stringify({filePath: filePath }),
                dataType: 'json',
                success: function (result) {
                    console.log(result.status);
                    if (result.status === 1) {
                        container.remove();
                        toastr.success(result.message);
                    } else {
                        toastr.error(result.message);
                    }
                }
            });

        });

    },

    //依赖 dropzonejs 组件
    InitDropzone: function () {
        Dropzone.options.dropzoneForm = {
            paramName: "file",
            maxFilesize: 20,
            maxFiles: 5,
            acceptedFiles: "image/*,application/pdf",
            dictMaxFilesExceeded: "Custom max files msg",
            dictDefaultMessage: "拖拽文件到这里上传",
            queuecomplete: function (files) {
                this.removeAllFiles();
                console.log("queuecomplete");
                document.getElementById("uploadbox").style.display = "none";

                var filePath = document.getElementById("filePath");
                var dir = filePath.innerText; //$(this).attr("data-dir"),
                var url = "/qnzfinder/GetSubFiles?dir=" + dir;
                SIG.getInstance().getFiles(url);
            }
        };
    }


};



$(function () {
    SIG.getInstance().Initialize(); //载入初始目录
    QNZ.AllUIEventsBind();  //初始化绑定UI事件  
});

QNZ.InitDropzone();  //初始化拖拽绑定
