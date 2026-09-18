import React, { useState, useRef, useEffect } from "react";
import { 
  ArrowLeft, 
  UploadCloud, 
  CheckCircle2, 
  Loader2, 
  Trash2, 
  FileImage, 
  AlertCircle
} from "lucide-react";

export interface TestImageItem {
  id: string;
  name: string;
  size: string;
  rawUrl: string;
  anonUrl: string | null;
  status: 'pending' | 'processing' | 'done';
}

interface ImageLabelTestingProps {
  onBack: () => void;
}

// Canvas-based redaction: draw a 2cm*4cm black rectangle in the exact center of the original image
const anonymizeImageOnCanvas = (rawUrl: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const w = img.naturalWidth || img.width || 800;
        const h = img.naturalHeight || img.height || 500;
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(rawUrl);
          return;
        }

        // 1. Draw original base image
        ctx.drawImage(img, 0, 0, w, h);

        // 2. Add a 2cm*4cm black rectangle in the exact center of the original image
        // In standard 96 DPI: 1 inch = 2.54 cm, so 1 cm ≈ 37.795 px
        const cm = 96 / 2.54;
        const scale = Math.max(1, Math.min(w / 800, h / 600));

        // For landscape images: 4cm width, 2cm height. For portrait: 2cm width, 4cm height
        const isLandscape = w >= h;
        const baseW = isLandscape ? 4 : 2;
        const baseH = isLandscape ? 2 : 4;

        let rectW = Math.round(baseW * cm * scale);
        let rectH = Math.round(baseH * cm * scale);

        // Ensure it fits within image bounds
        rectW = Math.min(rectW, Math.round(w * 0.9));
        rectH = Math.min(rectH, Math.round(h * 0.9));

        const rectX = Math.round((w - rectW) / 2);
        const rectY = Math.round((h - rectH) / 2);

        ctx.fillStyle = "#000000";
        ctx.fillRect(rectX, rectY, rectW, rectH);

        resolve(canvas.toDataURL("image/png"));
      } catch (e) {
        resolve(rawUrl);
      }
    };
    img.onerror = () => {
      resolve(rawUrl);
    };
    img.src = rawUrl;
  });
};

export default function ImageLabelTesting({ onBack }: ImageLabelTestingProps) {
  const [images, setImages] = useState<TestImageItem[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const processingIdRef = useRef<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  // Sequential processing queue effect: process one pending image at a time, 2 seconds each
  useEffect(() => {
    if (processingIdRef.current !== null) return;

    const nextItem = images.find(item => item.status === 'pending');
    if (!nextItem) return;

    processingIdRef.current = nextItem.id;

    // Mark current item as processing
    setImages(prev => prev.map(item => 
      item.id === nextItem.id ? { ...item, status: 'processing' } : item
    ));

    setTimeout(async () => {
      const anonResult = await anonymizeImageOnCanvas(nextItem.rawUrl);
      setImages(prev => prev.map(item => 
        item.id === nextItem.id ? { ...item, anonUrl: anonResult, status: 'done' } : item
      ));
      processingIdRef.current = null;
    }, 2000); // 2 seconds per image
  }, [images]);

  // Handle uploaded files (either from input or drop)
  const handleFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    // Filter valid image formats: PNG, JPG, JPEG, BMP
    const validFiles = fileArray.filter(file => {
      const ext = file.name.toLowerCase();
      return (
        ext.endsWith('.png') ||
        ext.endsWith('.jpg') ||
        ext.endsWith('.jpeg') ||
        ext.endsWith('.bmp') ||
        file.type.startsWith('image/')
      );
    });

    if (validFiles.length === 0) {
      showToast("请上传PNG、JPG、JPEG或BMP格式的图片");
      return;
    }

    const currentCount = images.length;
    const remainingSlots = 30 - currentCount;

    if (remainingSlots <= 0) {
      showToast("图片总数已达30张上限，无法继续添加");
      return;
    }

    let filesToAdd = validFiles;
    if (validFiles.length > remainingSlots) {
      filesToAdd = validFiles.slice(0, remainingSlots);
      showToast(`已达到30张上限，已自动追加前${remainingSlots}张图片`);
    } else {
      showToast(`成功添加 ${filesToAdd.length} 张图片`);
    }

    const newItems: TestImageItem[] = filesToAdd.map((file, idx) => ({
      id: `img-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
      name: file.name,
      size: `${(file.size / 1024).toFixed(1)} KB`,
      rawUrl: URL.createObjectURL(file),
      anonUrl: null,
      status: 'pending'
    }));

    setImages(prev => [...prev, ...newItems]);
  };

  const handleRemoveImage = (id: string) => {
    if (processingIdRef.current === id) {
      processingIdRef.current = null;
    }
    setImages(prev => prev.filter(item => item.id !== id));
  };

  const handleClearAll = () => {
    processingIdRef.current = null;
    setImages([]);
    showToast("已清空所有测试图片");
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 space-y-6 animate-fade-in" id="image_label_testing_page">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xl flex items-center space-x-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center space-x-3">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded text-slate-600 border-2 border-slate-200 hover:border-slate-400 transition-all cursor-pointer"
            title="返回图片数据标签配置"
          >
            <ArrowLeft className="w-4.5 h-4.5 stroke-[2.5]" />
          </button>
          <div>
            <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              <span>系统管理</span>
              <span className="text-slate-300">/</span>
              <span>环境参数配置</span>
              <span className="text-slate-300">/</span>
              <span>图片数据标签配置</span>
              <span className="text-slate-300">/</span>
              <span className="text-blue-600 font-black">测试</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              图片数据标签测试
            </h1>
          </div>
        </div>
      </div>

      {/* Compact Upload / Drag-and-Drop Area with Right-Side Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Upload Box */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setIsDragOver(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            if (e.dataTransfer.files) {
              handleFiles(e.dataTransfer.files);
            }
          }}
          onClick={() => {
            if (images.length < 30) {
              fileInputRef.current?.click();
            }
          }}
          className={`flex-1 py-3 px-5 rounded-xl border-2 border-dashed transition-all cursor-pointer flex items-center justify-start gap-3.5 select-none ${
            isDragOver 
              ? 'border-blue-500 bg-blue-50/70 shadow-xs ring-2 ring-blue-100' 
              : images.length >= 30
              ? 'border-slate-200 bg-slate-100 cursor-not-allowed opacity-80'
              : 'border-slate-300 bg-white hover:bg-slate-50/80 hover:border-blue-400 shadow-2xs'
          }`}
        >
          <input 
            ref={fileInputRef}
            type="file"
            multiple
            accept=".png,.jpg,.jpeg,.bmp,image/png,image/jpeg,image/bmp"
            className="hidden"
            onChange={(e) => {
              if (e.target.files) {
                handleFiles(e.target.files);
                e.target.value = "";
              }
            }}
            disabled={images.length >= 30}
          />

          <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
            <UploadCloud className="w-5 h-5 stroke-[2]" />
          </div>

          <div className="text-xs text-slate-800 flex flex-col justify-center min-w-0">
            {images.length >= 30 ? (
              <span className="text-amber-600 font-bold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" /> 已达到30张上限，如需继续上传请先删除或清空部分图片
              </span>
            ) : (
              <>
                <span className="font-bold text-slate-800">
                  点击批量选择或拖拽多个医学图片(.jpg/.jpeg/.png/.bmp)文件
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5 font-normal">
                  单张处理约5-10秒，具体时长与图片大小、环境配置等有关
                </span>
              </>
            )}
          </div>
        </div>

        {/* Right side controls: “已处理x/已添加x//30张” & “清空全部” */}
        <div className="flex items-center gap-2.5 shrink-0 justify-end">
          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3.5 py-3 rounded-xl border border-slate-200 whitespace-nowrap">
            已处理{images.filter(i => i.status === 'done').length}/已添加{images.length}//30张
          </span>
          {images.length > 0 ? (
            <button
              type="button"
              onClick={handleClearAll}
              className="px-3.5 py-3 text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
            >
              清空全部
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="px-3.5 py-3 text-xs font-bold text-slate-400 bg-slate-50 border border-slate-200 rounded-xl cursor-not-allowed opacity-60 whitespace-nowrap"
            >
              清空全部
            </button>
          )}
        </div>
      </div>

      {/* Flat List of Uploaded Images (Scrollable down page) */}
      {images.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 mx-auto flex items-center justify-center text-slate-400 mb-2">
            <FileImage className="w-6 h-6 stroke-[1.5]" />
          </div>
          <p className="text-sm font-bold text-slate-600">暂未添加测试图片</p>
        </div>
      ) : (
        <div className="space-y-4">
          {images.map((item, idx) => {
            return (
              <div 
                key={item.id}
                className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden transition-all"
              >
                {/* Image Card Header */}
                <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <span className="w-6 h-6 rounded-md bg-white border border-slate-200 text-slate-600 text-xs font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-900 truncate" title={item.name}>
                      {item.name}
                    </span>
                    <span className="text-[11px] text-slate-400 whitespace-nowrap shrink-0">
                      ({item.size})
                    </span>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    {item.status === 'done' && (
                      <span className="inline-flex items-center space-x-1 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-bold border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>匿名化完成</span>
                      </span>
                    )}

                    <button
                      onClick={() => handleRemoveImage(item.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                      title="删除此图片"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Side-by-side Dual Image Preview */}
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/30">
                  {/* Left: 原始图片 */}
                  <div className="space-y-2 flex flex-col">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700 flex items-center space-x-1.5">
                        <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                        <span>原始图片</span>
                      </span>
                    </div>
                    <div className="h-64 sm:h-80 bg-white rounded-lg border border-slate-200 flex items-center justify-center p-2 overflow-hidden shadow-3xs">
                      <img 
                        src={item.rawUrl} 
                        alt={`原始图片-${item.name}`} 
                        className="max-h-full max-w-full object-contain rounded select-none"
                      />
                    </div>
                  </div>

                  {/* Right: 匿名化后图片 */}
                  <div className="space-y-2 flex flex-col">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900 flex items-center space-x-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                        <span>匿名化后图片</span>
                      </span>
                    </div>
                    <div className="h-64 sm:h-80 bg-white rounded-lg border border-slate-200 flex items-center justify-center p-2 overflow-hidden relative shadow-3xs">
                      {item.status === 'done' && item.anonUrl ? (
                        <img 
                          src={item.anonUrl} 
                          alt={`匿名化后图片-${item.name}`} 
                          className="max-h-full max-w-full object-contain rounded select-none animate-fade-in"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-slate-400 space-y-2.5">
                          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                          <span className="text-xs font-bold text-slate-700">匿名化处理中</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
