/*!
 * QNZFinder - file manager for web
 * Version 1.0.2 (2020-02-15)
 * http://heiniaozhi.cn
 *
 * Copyright 2012-2020, 黑鸟志
 * Licensed under a 3-clauses BSD license
 */



//右键菜单
var QNZCM = {
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
    clickInsideElement: function (e, className) {
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
    },

    /**
     * Get's exact position of event.
     * 
     * @param {Object} e The event passed in
     * @return {Object} Returns the x and y position
     */
    getPosition: function (e) {
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
    },

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
    contextMenuClassName: "context-menu",
    contextMenuItemClassName: "context-menu__item",
    contextMenuLinkClassName: "context-menu__link",
    contextMenuActive: "context-menu--active",

    taskItemClassName: "btnFile",
    taskItemInContext: null,

    clickCoords: null,
    clickCoordsX: null,
    clickCoordsY: null,

    //    menu : document.querySelector("#context-menu"),
    //    menuItems : menu.querySelectorAll(".context-menu__item");
    menuState: 0,
    menuWidth: null,
    menuHeight: null,
    menuPosition: null,
    menuPositionX: null,
    menuPositionY: null,

    windowWidth: null,
    windowHeight: null,

    /**
     * Initialise our application's code.
     */
    init: function () {
        this.contextListener();
        this.clickListener();
        this.keyupListener();
        this.resizeListener();
    },

    /**
     * Listens for contextmenu events.
     */
    contextListener: function () {

        var $that = this;
        document.addEventListener("contextmenu", function (e) {


            taskItemInContext = $that.clickInsideElement(e, $that.taskItemClassName);

            if (taskItemInContext) {
                e.preventDefault();
                $that.toggleMenuOn();
                $that.positionMenu(e);

            } else {
                taskItemInContext = null;
                $that.toggleMenuOff();

            }
        });
    },

    /**
     * Listens for click events.
     */
    clickListener: function () {
        var $that = this;
        document.addEventListener("click", function (e) {
            var clickeElIsLink = $that.clickInsideElement(e, $that.contextMenuLinkClassName);

            if (clickeElIsLink) {
                e.preventDefault();
                $that.menuItemListener(clickeElIsLink);
            } else {
                var button = e.which || e.button;
                if (button === 1) {
                    $that.toggleMenuOff();
                }
            }
        });
    },

    /**
     * Listens for keyup events.
     */
    keyupListener: function () {
        var $that = this;
        window.onkeyup = function (e) {
            if (e.keyCode === 27) {
                $that.toggleMenuOff();
            }
        }
    },

    /**
     * Window resize event listener
     */
    resizeListener: function () {
        window.onresize = function (e) {
            toggleMenuOff();
        };
    },

    /**
     * Turns the custom context menu on.
     */
    toggleMenuOn: function () {
        if (this.menuState !== 1) {
            this.menuState = 1;
            var menu = document.getElementById("context-menu");
            menu.classList.add(this.contextMenuActive);
        }
    },

    /**
     * Turns the custom context menu off.
     */
    toggleMenuOff: function () {
        if (this.menuState !== 0) {
            this.menuState = 0;
            var menu = document.getElementById("context-menu");
            menu.classList.remove(this.contextMenuActive);
        }
    },

    /**
     * Positions the menu properly.
     * 
     * @param {Object} e The event
     */
    positionMenu: function (e) {
        var menu = document.getElementById("context-menu");

        this.clickCoords = this.getPosition(e);
        this.clickCoordsX = this.clickCoords.x;
        this.clickCoordsY = this.clickCoords.y;

        this.menuWidth = menu.offsetWidth + 4;
        this.menuHeight = menu.offsetHeight + 4;

        this.windowWidth = window.innerWidth;
        this.windowHeight = window.innerHeight;

        var parentOffset = $("#dirbody").offset();


        if ((this.windowWidth - this.clickCoordsX) < this.menuWidth) {
            menu.style.left = this.windowWidth - this.menuWidth - parentOffset.left + "px";
        } else {
            menu.style.left = this.clickCoordsX - parentOffset.left + "px";
        }

        if ((this.windowHeight - this.clickCoordsY) < this.menuHeight) {
            menu.style.top = this.windowHeight - this.menuHeight - parentOffset.top + "px";
        } else {
            menu.style.top = this.clickCoordsY - parentOffset.top + "px";
        }
        // console.log(this.menu);
        // alert("aaa");
    },

    /**
     * Dummy action function that logs an action when a menu item link is clicked
     * 
     * @param {HTMLElement} link The link that was clicked
     */
    menuItemListener: function (link) {
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
                        url: "/QNZFinder/CreateDir?filePath=" + filePath + "&dir=" + newName,
                        //  data: JSON.stringify({filePath: filePath }),
                        dataType: 'json',
                        success: function (result) {
                            if (result.status === 1) {

                                toastr.success(result.message, "创建目录")
                                var li = taskItemInContext.closest("li");
                                var urlDir = "/QNZFinder/GetSubDirectories?dir=" + filePath;
                                QNZ.getSubDirectories(urlDir, li);

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
                    url: "/QNZFinder/DeleteDir?filePath=" + filePath,
                    //  data: JSON.stringify({filePath: filePath }),
                    dataType: 'json',
                    success: function (result) {

                        if (result.status === 1) {
                            toastr.success(result.message, "删除目录")
                            var li = taskItemInContext.closest("li"), parentLi = li.closest("ul").closest("li"),
                                parentPath = $(li).closest("ul").prevAll("a:first").attr("data-path");

                            var urlDir = "/QNZFinder/GetSubDirectories?dir=" + parentPath
                            QNZ.getSubDirectories(urlDir, parentLi);


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
                        url: "/QNZFinder/RenameDir?filePath=" + filePath + "&newFilePath=" + newPath,
                        //  data: JSON.stringify({filePath: filePath }),
                        dataType: 'json',
                        success: function (result) {
                            if (result.status === 1) {
                                toastr.success(result.message, "重命名目录")
                                var li = taskItemInContext.closest("li"), parentLi = li.closest("ul").closest("li"),
                                    parentPath = $(li).closest("ul").prevAll("a:first").attr("data-path");

                                var urlDir = "/QNZFinder/GetSubDirectories?dir=" + parentPath
                                QNZ.getSubDirectories(urlDir, parentLi);


                            }
                            else {
                                toastr.error(result.message, "重命名目录")
                            }

                        }
                    });
                    // QNZ.renameFile(filePath, newPath, download);

                }

                break;
        }

        this.toggleMenuOff();
    }

}





var QNZ = {

    //获取根目录列表
    getDirectories: function (url) {
        var $that = this;

        const xhr = new XMLHttpRequest();        
        xhr.open('GET', url);
        // set response format
        xhr.responseType = 'json';
        xhr.send();
        xhr.onload = () => {
            // get JSON response
            const result = xhr.response;
            var lastOpenPath = localStorage.getItem('lastOpenPath');
            var dirs = '';
            // log details
            //console.log(result);

            result.forEach((item) => {
                // console.log(item);
                var isHidden = item.hasChildren ? "" : "hidden";
                var isplus = item.isOpen ? "minus" : "plus";
                dirs += '<li class="' + isplus + '">';
                dirs += '<div class="exp"><a href="javascript:void(0);"  onclick="QNZ.expFloders(this)" class="btnDir" data-loaded="1" data-path="' + item.dirPath + '" ' + isHidden + '>';
                dirs += '<span class="iconfont icon-' + isplus + ' fa-fw"></span></button></div> ';
                if (lastOpenPath == item.dirPath) {
                    dirs += '<a href="#" class="btnFile active" data-path="' + item.dirPath + '"><span class="iconfont icon-folder-open-fill fa-fw"></span>' + item.name + '</a>';
                } else {
                    dirs += '<a href="#" class="btnFile" data-path="' + item.dirPath + '"><span class="iconfont icon-folder-fill fa-fw"></span>' + item.name + '</a>';
                }

                dirs += $that.loadSubDirectories(item.children);

                dirs += '</li > ';
            });
            document.getElementById("dirTree").innerHTML = dirs;
          
        }
      
    },


    // 递归加载子目录
    loadSubDirectories: function (items) {
        var $that = this;

        var lastOpenPath = localStorage.getItem('lastOpenPath');
        var dirs = '<ul class="subTree">';

        items.forEach((item) => {
            var isHidden = item.hasChildren ? "" : "hidden";
            var isplus = item.isOpen ? "minus" : "plus";
            dirs += '<li class="' + isplus + '">';
            dirs += '<div class="exp"><a href="javascript:void(0);"  onclick="QNZ.expFloders(this)"  class="btnDir" data-loaded="1" data-path="' + item.dirPath + '" ' + isHidden + '>' +
                '<span class="iconfont icon-plus fa-fw"></span>' +
                '</a></div>';
            if (lastOpenPath == item.dirPath) {
                dirs += '<a href="#" class="btnFile active" data-path="' + item.dirPath + '"><span class="iconfont icon-folder-open-fill"></span>' + item.name + '</a>';
            } else {
                dirs += '<a href="#" class="btnFile" data-path="' + item.dirPath + '"><span class="iconfont icon-folder-fill"></span>' + item.name + '</a>';
            }

            dirs += $that.loadSubDirectories(item.children);  // 递归加载
            dirs += '</li>';
        });
        
        dirs += '</ul>';
        return dirs;
    },

    //获取子目录列表
    getSubDirectories: function (url, li) {
        li.getElementsByTagName("ul")[0].remove();          
      //  console.log("子目录start");
      //  console.log(li);

        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        // set response format
        xhr.responseType = 'json';
        xhr.send();
        xhr.onload = () => {
            const result = xhr.response;

            var list = document.createElement("ul");
            list.className = "subTree"
            result.forEach((val) => {
                var isHidden = val.hasChildren ? "" : "hidden";
                var htmldata = '<li>' +
                    '<div class="exp"><a href="javascript:void(0);"  onclick="QNZ.expFloders(this)" class="btnDir" data-loaded="0" data-path="' + val.dirPath + '" ' + isHidden + '>' +
                    '<span class="iconfont icon-plus fa-fw"></span>' +
                    '</a></div>' +
                    '<a href="#" class="btnFile" data-path="' + val.dirPath + '"><span class="iconfont icon-folder-fill"></span>' + val.name + '</a>' +
                    '</li>';

                list.innerHTML += htmldata;
            });

            li.append(list);

            //var exp = li.firstElementChild;
            var alink = li.children[0].children[0];
            alink.setAttribute("data-loaded", "1");
            alink.children[0].className = "iconfont icon-minus";

        }


    },

    expFloders: function(e) {  //打开加载文件夹内容
        // console.log(e.parentNode.parentNode);
        let parentElment = e.parentNode.parentNode;

        //  console.log(parent);
        parentElment.className = parentElment.className == "plus" ? "minus" : "plus";

        e.children[0].className = parentElment.className == "plus" ? "iconfont icon-plus" : "iconfont icon-minus";

        var dir = e.getAttribute("data-path");
        var isLoaded = e.getAttribute("data-loaded")

        if (isLoaded === "0") {

            var urlDir = "/qnzfinder/GetSubDirectories?dir=" + dir;
            this.getSubDirectories(urlDir, parentElment);

        }
        // console.log(parentElment);
    },


    //获取文件列表
    getFiles: function (url) {
        var $that = this;
        $.getJSON(url, function (result) {
            $that.loadFiles(result);
        });
    },



    loadFiles:function(result) {
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
    },


    //打开当前的路径
    //loadCurrentURL:function(url) {
    //    url = url;
    //    var baseUrl = "/Uploads/";


    //    if (url.startsWith(baseUrl)) {
    //        var dir = url.split("/");
    //        var index = url.indexOf(dir[dir.length - 1]) - 1;

    //        var subStr = url.substring(9, index);
    //        var subDir = subStr.split("/");
    //        var goDir = baseUrl;
    //        for (var i = 0; i < subDir.length; i++) {
    //            goDir = goDir + subDir[i];
    //            goDir = goDir;

    //            var li = $("a[data-path='" + goDir + "']").eq(0).closest("li");

    //            if (i < (subDir.length - 1)) {

    //                var urlDir = "/qnzfinder/GetSubDirectories?dir=" + goDir;
    //                QNZ.getSubDirectories(urlDir, li);
    //                goDir = goDir + "/";
    //            } else {

    //                var urlDir = "/qnzfinder/GetSubFiles?dir=" + goDir;

    //                QNZ.getFiles(urlDir);
    //                $("#btnRefresh").attr("data-dir", goDir);

    //                setTimeout(function () {
    //                    $("[data-path='" + goDir + "']").eq(1).addClass("active").children("span").removeClass("icon-folder-fill").addClass("icon-folder-open-fill");
    //                    $("#fileList div[data-file='" + url + "']").addClass("active");
    //                }, 1000);

    //            }


    //        }
    //        //alert(url.substring(9, index));
    //    }

    //},

    renameFile: function(oldpath, newpath, item) {

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
    },


    // 初始化
    Initialize: function (){

        var lastOpenPath = localStorage.getItem('lastOpenPath');
        var url = lastOpenPath != null ? "/qnzfinder/currentdirectories?currentDir=" + lastOpenPath : "/qnzfinder/currentdirectories";
        this.getDirectories(url);

        var url2 = lastOpenPath != null ? "/qnzfinder/GetSubFiles?dir=" + lastOpenPath : "/qnzfinder/GetSubFiles";
        this.getFiles(url2);

        var tdir = lastOpenPath == null ? $("#rootDir").val() : lastOpenPath;

        this.setCurrentFilePath(tdir);

    },

    // 设置当前目录
    setCurrentFilePath:function(filePath) {

        var elFilePath = document.getElementById("filePath");
        elFilePath.innerText = filePath;

        var elFilePath2 = document.getElementById("filePathForm");
        elFilePath2.value = filePath;
    },


    // tinymce 快捷上传调用
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

    SingleCallPageInit: function () {

        function selectImage(fileUrl) {
            //  console.log(fileUrl);
            window.opener.QNZ.elFinderCallback(fileUrl);
            window.close();
        }

        $(function () {

            $("body").delegate("#fileList .itembox .item", "dblclick", function (e) {
                e.preventDefault();
                var fileUrl = $(this).attr("data-file");
                selectImage(fileUrl);

            });


            $("#selectImage").on("click", function () {
                var fileUrl = $("#fileList .item.active").attr("data-file");
                selectImage(fileUrl);
            })
        })
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

    ForTinymcePageInit: function () {

        function selectImage(fileUrl) {
            //  console.log(fileUrl);

            window.parent.postMessage({
                mceAction: 'FileSelected',
                content: fileUrl
            }, '*');

            parent.tinymce.activeEditor.windowManager.close();
        }
        

        $("body").delegate("#fileList .itembox .item", "dblclick", function (e) {
            e.preventDefault();
            var fileUrl = $(this).attr("data-file");
            selectImage(fileUrl);

        });


        $("#selectImage").on("click", function () {
            var fileUrl = $("#fileList .item.active").attr("data-file");
            selectImage(fileUrl);
        })       

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




        $("body").delegate("#btnRoot", "click", function (e) {
            e.preventDefault();
            localStorage.clear();  // 清除最后路径
            QNZ.Initialize();

        });


        //var btnDirs = document.getElementsByClassName("btnDir");

        //var myFunction = function () {
        //    var attribute = this.getAttribute("data-myattribute");
        //     // alert(attribute);
        //    alert("test");
        //};

        //for (var i = 0; i < btnDirs.length; i++) {
        //    btnDirs[i].addEventListener('click', myFunction, false);
        //}


        //$("body").delegate("a.btnDir", "click", function (e) {
        //    //$(".btnDir").on("click", function (e) {

        //    e.preventDefault();
        //    var parent = $(this).closest('li');
        //    parent.toggleClass('plus');
        //    parent.toggleClass('minus');
        //    $(this).children("span").removeClass("icon-minus").addClass("icon-plus");

        //    var dir = $(this).attr("data-path");
        //    var isLoaded = $(this).attr("data-loaded")
        //    if (isLoaded === "0") {

        //        var urlDir = "/qnzfinder/GetSubDirectories?dir=" + dir;
        //        QNZ.getSubDirectories(urlDir, parent);

        //    }

        //});

        $("body").delegate("a.btnFile", "click", function (e) {

            //  $(".btnFile").on("click", function (e) {
            e.preventDefault();

            $("#dirTree a.active").removeClass("active").children("span").removeClass("icon-folder-open-fill").addClass("icon-folder-fill");
            $(this).addClass("active");
            var dir = $(this).attr("data-path"),
                url = "/qnzfinder/GetSubFiles?dir=" + dir;

            localStorage.setItem('lastOpenPath', dir);  //记录最后打开路径

            $(this).children("span").removeClass("icon-folder-fill").addClass("icon-folder-open-fill");

            QNZ.getFiles(url);

            //$("#btnRefresh").attr("data-dir", dir);
            //$("#filePath").text(dir);
            //var filePath = document.getElementById("filePath");
            //filePath.innerText = dir;

            QNZ.setCurrentFilePath(dir)
        });

        $("body").delegate("#btnRefresh", "click", function (e) {

            //  $(".btnFile").on("click", function (e) {
            e.preventDefault();

            var filePath = document.getElementById("filePath");
            var dir = filePath.innerText; //$(this).attr("data-dir"),
            var url = "/qnzfinder/GetSubFiles?dir=" + dir;

            QNZ.getFiles(url);

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
                    QNZ.renameFile(filePath, newPath, download);

                } else {
                    if (confirm("改变文件后缀名，可能导致文件不可用，是否要修改？")) {
                        QNZ.renameFile(filePath, newPath, download);
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
        Dropzone.autoDiscover = false;

        var myDropzone = new Dropzone("#dropzoneForm",
            {
                url: "/QNZFinder/DropzoneUploadFile",
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
                    var url = "/QNZFinder/GetSubFiles?dir=" + dir;
                    QNZ.getFiles(url);
                }
            });
       

        //Dropzone.options.dropzoneForm = {
        //    paramName: "file",
        //    maxFilesize: 20,
        //    maxFiles: 5,
        //    acceptedFiles: "image/*,application/pdf",
        //    dictMaxFilesExceeded: "Custom max files msg",
        //    dictDefaultMessage: "拖拽文件到这里上传",
        //    queuecomplete: function (files) {
        //        this.removeAllFiles();
        //        console.log("queuecomplete");
        //        document.getElementById("uploadbox").style.display = "none";

        //        var filePath = document.getElementById("filePath");
        //        var dir = filePath.innerText; //$(this).attr("data-dir"),
        //        var url = "/qnzfinder/GetSubFiles?dir=" + dir;
        //        QNZ.getFiles(url);
        //    }
        //};
    }


};

//function expFloders(e) {
//   // console.log(e.parentNode.parentNode);
//    let parentElment = e.parentNode.parentNode;
  
//    //  console.log(parent);
//    parentElment.className = parentElment.className == "plus" ? "minus" : "plus";

//    e.children[0].className = parentElment.className == "plus" ? "iconfont icon-plus" :"iconfont icon-minus";

//    var dir = e.getAttribute("data-path");
//    var isLoaded = e.getAttribute("data-loaded")
 
//    if (isLoaded === "0") {

//        var urlDir = "/qnzfinder/GetSubDirectories?dir=" + dir;
//        QNZ.getSubDirectories(urlDir, parentElment);

//    }
//    // console.log(parentElment);
//}


//$(function () {
//    QNZ.Initialize(); //载入初始目录
//    QNZ.AllUIEventsBind();  //初始化绑定UI事件  
//});

//QNZ.InitDropzone();  //初始化拖拽绑定
