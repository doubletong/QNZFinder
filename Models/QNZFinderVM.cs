using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace QNZFinder.Models
{
    public class DirectoryVM
    {
        public string Name { get; set; }
        public string DirPath { get; set; }
        public bool HasChildren { get; set; }
        public bool IsOpen { get; set; }
        public IEnumerable<DirectoryVM> Children { get; set; }
    }

    public class FileVM
    {
        public string Name { get; set; }
        public string Extension { get; set; }
        public string CreatedDate { get; set; }
        public string FilePath { get; set; }
        public double FileSize { get; set; }
        public string ImgUrl { get; set; }
        //{
        //    get
        //    {
        //        return ".jpg.png.gif".Contains(this.Extension.ToLower()) ? this.FilePath + "?width=80&height=80&mode=Crop" : string.Format("{0}/{1}.png", SettingsManager.File.ExtensionDir, this.Extension); 
        //    }
        //}
    }
    public class UploadVM
    {
        public IFormFile file { get; set; }
        public string filePath { get; set; }
    }
}
