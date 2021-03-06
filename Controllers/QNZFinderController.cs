﻿using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using QNZFinder.Infrastructure;
using QNZFinder.Models;

namespace QNZFinder.Controllers
{
    public class QNZFinderController : Controller
    {
        private IWebHostEnvironment _hostingEnvironment;
        private readonly string _rootDirectory;
        private readonly string _extensionDir;
        private readonly string _tempDirectory;
        private readonly int _thumbWidth;
        private readonly int _thumbHeight;

        public QNZFinderController(IWebHostEnvironment hostingEnvironment, IConfiguration config)
        {
            _hostingEnvironment = hostingEnvironment;
            _rootDirectory = config.GetValue<string>("QNZFinder:RootDirectory");
            _extensionDir = config.GetValue<string>("QNZFinder:ExtensionDir");
            _tempDirectory = config.GetValue<string>("QNZFinder:Thumbnails:TempDir");
            _thumbWidth = config.GetValue<int>("QNZFinder:Thumbnails:ThumbWidth");
            _thumbHeight = config.GetValue<int>("QNZFinder:Thumbnails:ThumbHeight");


        }
        public IActionResult Index()
        {
            return View();
        }
        public IActionResult FinderForTinyMce()
        {
            return View();
        }

        public IActionResult SingleFinder()
        {
            return View();
        }
        // GET: api/FileManager/RootDirectories
        [HttpGet]
        public IActionResult RootDirectories()
        {

            var rootPath = _hostingEnvironment.WebRootPath + _rootDirectory.Replace('/', '\\');
            if (!Directory.Exists(rootPath))
            {
                Directory.CreateDirectory(rootPath);
            }

            var vm = GetDirectories(rootPath, _rootDirectory);
            return Json(vm);
        }



        /// <summary>
        /// 获取当前目录
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        public IActionResult CurrentDirectories(string currentDir)
        {
            currentDir = string.IsNullOrEmpty(currentDir) ? _rootDirectory : currentDir;

            if (!currentDir.Contains(_rootDirectory))
                return null;



            var directories = currentDir.Split("/");
            directories = directories.Where(d => d != string.Empty).ToArray();

            if (directories.Any())
            {

                var rootPath = _hostingEnvironment.WebRootPath + _rootDirectory.Replace('/', '\\');
                if (!Directory.Exists(rootPath))
                {
                    Directory.CreateDirectory(rootPath);
                }

                var vm = GetCurrentDirectories(_rootDirectory, currentDir);
                return Json(vm);
            }


            return null;
        }

        /// <summary>
        /// 获取多级目录
        /// </summary>
        /// <param name="rootPath"></param>
        /// <returns></returns>
        public IEnumerable<DirectoryVM> GetCurrentDirectories(string targetPath, string fullPath)
        {
            //   !Directory.EnumerateFiles(filePath).Any() && !Directory.EnumerateDirectories(filePath).Any();
            var rootPath = _hostingEnvironment.WebRootPath + targetPath.Replace('/', '\\');

            return new DirectoryInfo(rootPath).GetDirectories()
                 .Where(dir => !dir.Name.StartsWith("_")).Select(dir => new DirectoryVM
                 {
                     Name = dir.Name,
                     DirPath = string.Format("{0}/{1}", targetPath, dir.Name),
                     HasChildren = Directory.EnumerateDirectories(Path.Combine(rootPath, dir.Name)).Any(),
                     Children = GetCurrentDirectories(string.Format("{0}/{1}", targetPath, dir.Name), fullPath),
                     IsOpen = fullPath.StartsWith(string.Format("{0}/{1}", targetPath, dir.Name))
                 });

        }

        // GET: api/FileManager/RootDirFiles
        [HttpGet]
        public IActionResult RootDirFiles()
        {

            var rootPath = _hostingEnvironment.WebRootPath + _rootDirectory.Replace('/', '\\');
            if (!Directory.Exists(rootPath))
            {
                Directory.CreateDirectory(rootPath);
            }

            IEnumerable<FileVM> vm = GetFileList(rootPath, _rootDirectory);

            return Json(vm);
        }

        /// <summary>
        /// ajax 获取子目录
        /// </summary>
        /// <param name="dir"></param>
        /// <returns></returns>
        [HttpGet]
        public IActionResult GetSubDirectories(string dir)
        {
            var subPath = _hostingEnvironment.WebRootPath + dir.Replace('/', '\\');
            IEnumerable<DirectoryVM> vm = GetDirectories(subPath, dir);
            return Json(vm);
        }

        /// <summary>
        /// ajax 获取子目录文件
        /// </summary>
        /// <param name="dir"></param>
        /// <returns></returns>
        [HttpGet]
        public IActionResult GetSubFiles(string dir)
        {
            dir = string.IsNullOrEmpty(dir) ? _rootDirectory : dir;

            var subPath = _hostingEnvironment.WebRootPath + dir.Replace('/', '\\');
            IEnumerable<FileVM> vm = GetFileList(subPath, dir);
            return Json(vm);
        }

        /// <summary>
        /// 下载文件
        /// </summary>
        /// <param name="filePath"></param>
        /// <returns></returns>
        [HttpGet]
        public async Task<IActionResult> Download(string filePath)
        {

            if (string.IsNullOrEmpty(filePath))
            {
                return Content("路径不能为空");
            }
            //  filePath = filePath.ToLower();


            var path = _hostingEnvironment.WebRootPath + filePath.Replace('/', '\\');

            //var path = Path.Combine(
            //               Directory.GetCurrentDirectory(),
            //               "wwwroot", filename);

            var memory = new MemoryStream();
            using (var stream = new FileStream(path, FileMode.Open))
            {
                await stream.CopyToAsync(memory);
            }
            memory.Position = 0;
            return File(memory, "application/octet-stream", Path.GetFileName(path));


        }


        /// <summary>
        /// 删除文件
        /// </summary>
        /// <param name="filePath"></param>
        /// <returns></returns>
        [HttpPost]
        public IActionResult DeleteFile(string filePath)
        {
            try
            {
                var downPath = _hostingEnvironment.WebRootPath + filePath.Replace('/', '\\');
                System.IO.File.Delete(downPath);


                return Json(new { status = 1, message = "已成功删除文件" });
            }
            catch (Exception er)
            {
                //HttpResponseMessage response = new HttpResponseMessage(HttpStatusCode.BadRequest);
                return Json(new { status = 2, message = "删除文件失败：" + er.Message });
            }

        }



        /// <summary>
        /// 重命名文件
        /// </summary>
        /// <param name="filePath"></param>
        /// <returns></returns>
        [HttpPost]
        public IActionResult RenameFile(string filePath, string newFilePath)
        {

            try
            {
                newFilePath = newFilePath.Replace(" ", "_");

                filePath = _hostingEnvironment.WebRootPath + filePath.Replace('/', '\\'); ;
                newFilePath = _hostingEnvironment.WebRootPath + newFilePath.Replace('/', '\\'); ;

                if (System.IO.File.Exists(newFilePath))
                {
                    // File.Delete(newFilePath);

                    return Json(new { status = 2, message = "此文件名已经存在" });
                }
                System.IO.File.Move(filePath, newFilePath);

                return Json(new { status = 1, message = "已经成功重命名" });
            }
            catch (Exception er)
            {
                return Json(new { status = 2, message = "重命名文件失败：" + er.Message });
            }
        }

        /// <summary>
        /// 创建目录
        /// </summary>
        /// <param name="filePath"></param>
        /// <returns></returns>
        [HttpPost]
        public IActionResult CreateDir(string filePath, string dir)
        {
            try
            {
                dir = dir.Replace(" ", "_");

                var newDir = $"{_hostingEnvironment.WebRootPath}{filePath.Replace('/', '\\')}\\{dir}";
                //newDir = _hostingEnvironment.WebRootPath,  newDir.Replace('/','\\'));
                //var response = Request.CreateResponse(HttpStatusCode.OK, "OK");

                if (Directory.Exists(newDir))
                {
                    // File.Delete(newFilePath);
                    return Json(new { status = 2, message = "此目录名称已经存在" });
                }

                Directory.CreateDirectory(newDir);
                return Json(new { status = 1, message = "已经成功创建目录" });
            }
            catch (Exception er)
            {
                //  LoggingFactory.Error("文件重命名失败！", er);
                return Json(new { status = 2, message = "创建目录失败：" + er.Message });
            }
        }

        /// <summary>
        /// 删除目录
        /// </summary>
        /// <param name="filePath"></param>
        /// <returns></returns>
        [HttpPost]
        public IActionResult DeleteDir(string filePath)
        {
            try
            {


                filePath = $"{_hostingEnvironment.WebRootPath}{filePath.Replace('/', '\\')}";

                // filePath = Path.Combine(_hostingEnvironment.WebRootPath, filePath);
                if (!Directory.Exists(filePath))
                {
                    return Json(new { status = 2, message = "此目录不存在" });
                };

                var isEmpty = !Directory.EnumerateFiles(filePath).Any() && !Directory.EnumerateDirectories(filePath).Any();
                if (!isEmpty)
                {
                    return Json(new { status = 2, message = "此目录存在文件或子目录，不能删除" });
                }

                Directory.Delete(filePath);
                return Json(new { status = 1, message = "已经成功删除目录" });
            }
            catch (Exception er)
            {
                //  LoggingFactory.Error("目录删除失败！", er);
                return Json(new { status = 2, message = "删除目录失败：" + er.Message });
            }



        }


        /// <summary>
        /// 重命名目录
        /// </summary>
        /// <param name="filePath"></param>
        /// <returns></returns>
        [HttpPost]
        public IActionResult RenameDir(string filePath, string newFilePath)
        {
            try
            {
                newFilePath = newFilePath.Replace(" ", "_");

                filePath = $"{_hostingEnvironment.WebRootPath}{filePath.Replace('/', '\\')}"; ;
                newFilePath = $"{_hostingEnvironment.WebRootPath}{newFilePath.Replace('/', '\\')}";

                //   var response = Request.CreateResponse(HttpStatusCode.OK, "OK");

                if (Directory.Exists(newFilePath))
                {
                    // File.Delete(newFilePath);
                    return Json(new { status = 2, message = "此目录名称已经存在" });
                }
                Directory.Move(filePath, newFilePath);


                return Json(new { status = 1, message = "已经成功重命名" });
            }
            catch (Exception er)
            {
                return Json(new { status = 2, message = "重命名目录失败：" + er.Message });
            }
        }


        /// <summary>
        /// 获取目录
        /// </summary>
        /// <param name="rootPath"></param>
        /// <returns></returns>
        public IEnumerable<DirectoryVM> GetDirectories(string rootPath, string webPath)
        {
            //   !Directory.EnumerateFiles(filePath).Any() && !Directory.EnumerateDirectories(filePath).Any();

            return new DirectoryInfo(rootPath).GetDirectories()
                .Where(dir => !dir.Name.StartsWith("_")).Select(dir => new DirectoryVM
                {
                    Name = dir.Name,
                    DirPath = string.Format("{0}/{1}", webPath, dir.Name),
                    HasChildren = Directory.EnumerateDirectories(Path.Combine(rootPath, dir.Name)).Any()
                });
        }




        /// <summary>
        /// 获取文件列表
        /// </summary>
        /// <param name="rootPath"></param>
        /// <param name="webPath"></param>
        /// <returns></returns>
        public IEnumerable<FileVM> GetFileList(string rootPath, string webPath)
        {


            var orgWebPath = "wwwroot" + webPath;
            var oldstr = "wwwroot" + _rootDirectory;
            string _thumbPath = orgWebPath.Replace(oldstr, _tempDirectory);


            var vm = new DirectoryInfo(rootPath).GetFiles()
                .Where(dir => !dir.Name.StartsWith("_")).OrderByDescending(d => d.CreationTime).Select(f => new FileVM
                {
                    Name = f.Name,
                    Extension = f.Extension.Replace(".", ""),
                    CreatedDate = f.CreationTime.ToString(),
                    FilePath = string.Format("{0}/{1}", webPath, f.Name),
                    FileSize = f.Length / 1024,
                    // ImgUrl = ".jpg.png.gif.svg.webp".Contains(f.Extension.Replace(".", "").ToLower()) ? string.Format("{0}/{1}", _thumbPath, f.Name) : string.Format("{0}/{1}.png", _extensionDir, f.Extension.Replace(".", ""))
                    ImgUrl = GetFilePath(f.Extension, f.Name, _thumbPath, webPath)
                });

            foreach (var item in vm)
            {
                if (!item.ImgUrl.StartsWith(_extensionDir))
                {
                    var thumbFile = _hostingEnvironment.WebRootPath + item.ImgUrl.Replace('/', '\\');
                    if (!System.IO.File.Exists(thumbFile))
                    {
                        var orgImage = _hostingEnvironment.WebRootPath + item.FilePath.Replace('/', '\\');
                        ImageHandler.MakeThumbnail2(orgImage, thumbFile, _thumbWidth, _thumbHeight);
                    }
                }
            }

            return vm;
        }

        public string GetFilePath(string ext, string fileName, string thumbPath, string webPath)
        {

            switch (ext)
            {
                case ".jpg":
                case ".png":
                case ".gif":
                    return string.Format("{0}/{1}", thumbPath, fileName);
                //break;
                case ".svg":
                    return string.Format("{0}/{1}", webPath, fileName);
                default:
                    return string.Format("{0}/{1}.png", _extensionDir, ext.Replace(".", ""));

            }

        }

        ///// <summary>
        ///// 上传文件
        ///// </summary>
        ///// <param name="filePath"></param>
        ///// <param name="files"></param>
        ///// <returns></returns>
        //[HttpPost]
        //public async Task<IActionResult> UploadFiles(string filePath, List<IFormFile> files)
        //{
        //    string webRootPath = _hostingEnvironment.WebRootPath;
        //    // var filePath = Path.GetTempFileName();
        //    foreach (var iFormFile in files)
        //    {
        //        if (iFormFile.Length > 0)
        //        {
        //            var orgFileName = Path.GetFileNameWithoutExtension(iFormFile.FileName);
        //            var ex = Path.GetExtension(iFormFile.FileName);
        //            //string filename = ImageHandler.GetRandomFileName(Path.GetExtension(iFormFile.FileName), 10000);
        //            string localPath = webRootPath + (string.IsNullOrEmpty(filePath) ? _rootDirectory.Replace('/', '\\') : filePath.Replace('/', '\\'));

        //            if (!Directory.Exists(localPath))
        //            {
        //                Directory.CreateDirectory(localPath);
        //            }
        //            string fileName = FileHelper.GetFileName(orgFileName, localPath, ex);

        //            string saveFilePath = Path.Combine(localPath, fileName);

        //            var oldstr = "wwwroot" + _rootDirectory.Replace('/', '\\');
        //            var newstr = "wwwroot" + _tempDirectory.Replace('/', '\\');
        //            string _thumbPath = saveFilePath.Replace(oldstr, newstr);

        //            using (var stream = new FileStream(saveFilePath, FileMode.Create))
        //            {
        //                await iFormFile.CopyToAsync(stream);
        //            }
        //            //   ImageHandler.MakeThumbnail2(saveFilePath, _thumbPath, 120, 90, "DB", ex.ToLower());
        //            if (ex.ToLower() == ".jpg" || ex.ToLower() == ".png" || ex.ToLower() == ".gif")
        //            {
        //                ImageHandler.MakeThumbnail2(saveFilePath, _thumbPath, _thumbWidth, _thumbHeight);
        //            }

        //        }
        //    }
        //    //return RedirectToAction("Home");
        //    return StatusCode(StatusCodes.Status200OK, "文件成功上传！ ");
        //}


        /// <summary>
        /// 拖拽上传
        /// </summary>
        /// <param name="vm"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<IActionResult> DropzoneUploadFile(UploadVM vm)
        {
            string webRootPath = _hostingEnvironment.WebRootPath;

            try
            {
                if (vm.file.Length > 0)
                {
                    var orgFileName = Path.GetFileNameWithoutExtension(vm.file.FileName);
                    var ex = Path.GetExtension(vm.file.FileName);
                    //string filename = ImageHandler.GetRandomFileName(Path.GetExtension(iFormFile.FileName), 10000);
                    string localPath = webRootPath + (string.IsNullOrEmpty(vm.filePath) ? _rootDirectory.Replace('/', '\\') : vm.filePath.Replace('/', '\\'));

                    if (!Directory.Exists(localPath))
                    {
                        Directory.CreateDirectory(localPath);
                    }
                    string fileName = FileHelper.GetFileName(orgFileName, localPath, ex);

                    string saveFilePath = Path.Combine(localPath, fileName);

                    var oldstr = "wwwroot" + _rootDirectory.Replace('/', '\\');
                    var newstr = "wwwroot" + _tempDirectory.Replace('/', '\\');
                    string _thumbPath = saveFilePath.Replace(oldstr, newstr);

                    using (var stream = new FileStream(saveFilePath, FileMode.Create))
                    {
                        await vm.file.CopyToAsync(stream);
                    }
                    //   ImageHandler.MakeThumbnail2(saveFilePath, _thumbPath, 120, 90, "DB", ex.ToLower());
                    if (ex.ToLower() == ".jpg" || ex.ToLower() == ".png" || ex.ToLower() == ".gif")
                    {
                        ImageHandler.MakeThumbnail2(saveFilePath, _thumbPath, _thumbWidth, _thumbHeight);
                    }


                }

                return StatusCode(StatusCodes.Status200OK, "文件成功上传！ ");
            }
            catch (Exception er)
            {
                return BadRequest(new { success = false, message = "文件上传失败：" + er.Message });
            }

           
        }


        /// <summary>
        /// tinymce 图片快捷上传
        /// </summary>
        /// <param name="file"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<IActionResult> ImageUpload(IFormFile file)
        {

            string filename = ImageHandler.GetRandomFileName(Path.GetExtension(file.FileName), 10000);
            string relativeloc = _rootDirectory + "/" + filename;
            string webRootPath = _hostingEnvironment.WebRootPath;

            string newPath = Path.Combine(webRootPath + _rootDirectory.Replace('/', '\\'), filename);

            if (file != null && file.Length > 0 && file.ContentType.Contains("image"))
            {


                try
                {
                    //path = Path.Combine(HttpContext.Server.MapPath(saveloc), Path.GetFileName(filename));
                    //file.SaveAs(path);
                    using (var stream = new FileStream(newPath, FileMode.Create))
                    {
                        await file.CopyToAsync(stream);
                    }
                    return Json(new { location = relativeloc });
                }
                catch (Exception e)
                {
                    return StatusCode(StatusCodes.Status400BadRequest, "Upload Failed: " + e.Message);

                }
            }
            else
            {
                return StatusCode(StatusCodes.Status400BadRequest, "Upload Failed: 错误: 只接受图片格式文件！");

            }


        }
    }

   
}