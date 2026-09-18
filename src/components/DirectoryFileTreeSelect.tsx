import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp, ChevronRight, Folder, FileSpreadsheet, X } from "lucide-react";

export interface DirectoryFileTreeSelectProps {
  id?: string;
  mode: "csv" | "dicom" | "image";
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

interface TreeNode {
  id: string;
  name: string;
  path: string;
  isFolder: boolean;
  children?: TreeNode[];
}

const TREE_DATA: Record<"csv" | "dicom" | "image", TreeNode[]> = {
  csv: [
    {
      id: "disk01",
      name: "disk01",
      path: "disk01",
      isFolder: true,
      children: [
        {
          id: "disk01/anonymize",
          name: "anonymize",
          path: "disk01/anonymize",
          isFolder: true,
          children: []
        },
        {
          id: "disk01/data",
          name: "data",
          path: "disk01/data",
          isFolder: true,
          children: [
            {
              id: "disk01/data/csv",
              name: "csv",
              path: "disk01/data/csv",
              isFolder: true,
              children: [
                { id: "disk01/data/csv/test001.csv", name: "test001.csv", path: "test001.csv", isFolder: false },
                { id: "disk01/data/csv/test002.csv", name: "test002.csv", path: "test002.csv", isFolder: false },
                { id: "disk01/data/csv/test9999.csv", name: "test9999.csv", path: "test9999.csv", isFolder: false },
              ]
            },
            {
              id: "disk01/data/dicom",
              name: "dicom",
              path: "disk01/data/dicom",
              isFolder: true,
              children: []
            },
            {
              id: "disk01/data/image",
              name: "image",
              path: "disk01/data/image",
              isFolder: true,
              children: []
            }
          ]
        }
      ]
    }
  ],
  dicom: [
    {
      id: "disk01",
      name: "disk01",
      path: "disk01",
      isFolder: true,
      children: [
        {
          id: "disk01/anonymize",
          name: "anonymize",
          path: "disk01/anonymize",
          isFolder: true,
          children: []
        },
        {
          id: "disk01/data",
          name: "data",
          path: "disk01/data",
          isFolder: true,
          children: [
            {
              id: "disk01/data/csv",
              name: "csv",
              path: "disk01/data/csv",
              isFolder: true,
              children: []
            },
            {
              id: "disk01/data/dicom",
              name: "dicom",
              path: "disk01/data/dicom",
              isFolder: true,
              children: [
                { id: "disk01/data/dicom/p1", name: "p1", path: "disk01/data/dicom/p1", isFolder: true, children: [] },
                { id: "disk01/data/dicom/p2", name: "p2", path: "disk01/data/dicom/p2", isFolder: true, children: [] },
                { id: "disk01/data/dicom/p3", name: "p3", path: "disk01/data/dicom/p3", isFolder: true, children: [] },
                { id: "disk01/data/dicom/p4", name: "p4", path: "disk01/data/dicom/p4", isFolder: true, children: [] },
              ]
            }
          ]
        }
      ]
    }
  ],
  image: [
    {
      id: "disk01",
      name: "disk01",
      path: "disk01",
      isFolder: true,
      children: [
        {
          id: "disk01/anonymize",
          name: "anonymize",
          path: "disk01/anonymize",
          isFolder: true,
          children: []
        },
        {
          id: "disk01/data",
          name: "data",
          path: "disk01/data",
          isFolder: true,
          children: [
            {
              id: "disk01/data/csv",
              name: "csv",
              path: "disk01/data/csv",
              isFolder: true,
              children: []
            },
            {
              id: "disk01/data/dicom",
              name: "dicom",
              path: "disk01/data/dicom",
              isFolder: true,
              children: []
            },
            {
              id: "disk01/data/image",
              name: "image",
              path: "disk01/data/image",
              isFolder: true,
              children: [
                { id: "disk01/data/image/record", name: "record", path: "disk01/data/image/record", isFolder: true, children: [] },
                { id: "disk01/data/image/order", name: "order", path: "disk01/data/image/order", isFolder: true, children: [] },
              ]
            }
          ]
        }
      ]
    }
  ]
};

const MODE_CONFIG = {
  csv: {
    placeholder: "请选择 CSV 文件",
    header: "CSV 文件 · 逐层展开选择",
    defaultExpanded: ["disk01", "disk01/data", "disk01/data/csv"]
  },
  dicom: {
    placeholder: "请选择 DICOM 目录",
    header: "DICOM 目录 · 逐层展开选择",
    defaultExpanded: ["disk01", "disk01/data", "disk01/data/dicom"]
  },
  image: {
    placeholder: "请选择图片目录",
    header: "图片目录 · 逐层展开选择",
    defaultExpanded: ["disk01", "disk01/data"]
  }
};

export const DirectoryFileTreeSelect: React.FC<DirectoryFileTreeSelectProps> = ({
  id,
  mode,
  value,
  onChange,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedNodeIds, setExpandedNodeIds] = useState<Set<string>>(() => {
    return new Set(MODE_CONFIG[mode].defaultExpanded);
  });
  const containerRef = useRef<HTMLDivElement>(null);

  const config = MODE_CONFIG[mode];
  const treeRoots = TREE_DATA[mode];

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const toggleExpand = (nodeId: string) => {
    setExpandedNodeIds(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  const handleSelect = (selectedPath: string) => {
    onChange(selectedPath);
    setIsOpen(false);
  };

  const renderNode = (node: TreeNode, depth: number = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodeIds.has(node.id);

    if (node.isFolder) {
      return (
        <div key={node.id} className="select-none">
          <div
            className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-slate-50 transition-colors group cursor-pointer"
            onClick={() => toggleExpand(node.id)}
          >
            <div className="flex items-center min-w-0 pr-2" style={{ paddingLeft: `${depth * 20}px` }}>
              {/* Expand / Collapse toggle button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpand(node.id);
                }}
                className="w-4 h-4 flex items-center justify-center mr-1 text-slate-400 hover:text-slate-700 bg-transparent border-0 cursor-pointer p-0"
              >
                {hasChildren ? (
                  isExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  )
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 stroke-[2] opacity-40" />
                )}
              </button>

              {/* Folder Icon */}
              <Folder className="w-4 h-4 text-amber-500 fill-amber-500/10 stroke-[2] shrink-0 mr-2" />

              {/* Folder Name */}
              <span className="text-xs font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                {node.name}
              </span>
            </div>

            {/* In DICOM & Image mode, folders can be selected */}
            {(mode === "dicom" || mode === "image") && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect(node.path);
                }}
                className="px-2.5 py-0.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-white border border-blue-200 hover:border-blue-400 hover:bg-blue-50/70 rounded transition-all shadow-3xs cursor-pointer shrink-0"
              >
                选择
              </button>
            )}
          </div>

          {/* Children */}
          {hasChildren && isExpanded && (
            <div className="space-y-0.5">
              {node.children!.map((child) => renderNode(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    // Leaf file node (CSV mode)
    return (
      <div
        key={node.id}
        onClick={() => handleSelect(node.name)}
        className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-emerald-50/70 transition-colors cursor-pointer group select-none"
      >
        <div className="flex items-center min-w-0" style={{ paddingLeft: `${depth * 20 + 20}px` }}>
          <FileSpreadsheet className="w-4 h-4 text-emerald-600 stroke-[2] shrink-0 mr-2" />
          <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 truncate">
            {node.name}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full text-left" ref={containerRef} id={id}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen);
          }
        }}
        className={`w-full py-2.5 px-3.5 rounded-lg border text-left flex items-center justify-between transition-all select-none ${
          disabled
            ? "bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed opacity-90"
            : isOpen
            ? "bg-white text-slate-900 border-blue-500 ring-2 ring-blue-100 shadow-xs cursor-pointer"
            : "bg-white text-slate-800 border-slate-200 hover:border-slate-300 shadow-2xs cursor-pointer"
        }`}
      >
        <span className={`text-xs md:text-sm truncate ${
          value 
            ? (disabled ? "font-bold text-slate-700" : "font-bold text-slate-900") 
            : "text-slate-400 font-medium"
        }`}>
          {value || config.placeholder}
        </span>
        <div className="flex items-center space-x-1 shrink-0 ml-2">
          {value && !disabled && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
              }}
              className="p-0.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer mr-1"
              title="清除选择"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-slate-500 stroke-[2.5]" />
          ) : (
            <ChevronDown className={`w-4 h-4 stroke-[2.5] ${disabled ? "text-slate-400" : "text-slate-500"}`} />
          )}
        </div>
      </button>

      {/* Dropdown Card */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl border border-slate-200 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 min-w-[280px]">
          {/* Header */}
          <div className="px-3.5 py-2.5 bg-slate-50/90 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 tracking-tight">
              {config.header}
            </span>
          </div>

          {/* Tree items */}
          <div className="max-h-64 overflow-y-auto p-2 space-y-0.5 divide-y divide-transparent">
            {treeRoots.map((root) => renderNode(root, 0))}
          </div>
        </div>
      )}
    </div>
  );
};
