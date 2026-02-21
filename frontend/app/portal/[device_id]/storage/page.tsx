"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  HardDrive,
  Search,
  ArrowLeft,
  Share2,
  X,
  Send,
  Check,
  Loader2,
  Folder,
  FileText,
  Download,
  ChevronRight,
  File,
  Image as ImageIcon,
  Music,
  Video,
  UploadCloud,
  FolderPlus,
  Trash2,
  AlertTriangle,
  Terminal,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePortal } from "@/providers/PortalProvider";

interface FileItem {
  name: string;
  size: string;
  type: "file" | "folder";
  modifiedAt: string;
}

const FRIENDS = [
  {
    id: 1,
    name: "Sarah Miller",
    email: "sarah.m@design.co",
    avatar: "https://i.pravatar.cc/150?u=1",
  },
  {
    id: 2,
    name: "David Chen",
    email: "d.chen@arch.studio",
    avatar: "https://i.pravatar.cc/150?u=2",
  },
];

export default function Storage() {
  const params = useParams();
  const router = useRouter();
  const { devices, isLoading: portalLoading } = usePortal();

  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<FileItem | null>(null);
  const [currentPath, setCurrentPath] = useState("/");
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const deviceId = params.device_id as string;
  const device = devices?.find((d) => d?.id === deviceId);

  const fetchFiles = useCallback(async () => {
    if (!device) return;

    setLoadingFiles(true);
    setFileError(null);

    const deviceUrl = `https://${device.id}.strct.org`;
    const endpoint = `${deviceUrl}/api/files?path=${encodeURIComponent(
      currentPath
    )}`;

    try {
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error("Failed to load files");
      const data = await res.json();
      setFiles(data.files || []);
    } catch (err) {
      console.error(err);
      setFileError("Could not connect to node. Connection severed.");
      setFiles([]);
    } finally {
      setLoadingFiles(false);
    }
  }, [device, currentPath]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const sortedFiles = useMemo(() => {
    return [...files].sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === "folder" ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
  }, [files]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !device) return;

    setIsUploading(true);
    const uploadUrl = `https://${
      device.id
    }.strct.org/strct_agent/fs/upload?path=${encodeURIComponent(currentPath)}`;
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(uploadUrl, { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      fetchFiles(); // Refresh list
    } catch (err) {
      const error = err as Error;
      alert(`Error uploading file. Check connection. (${error.message})`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleNavigate = (folderName: string) => {
    const newPath =
      currentPath === "/" ? `/${folderName}` : `${currentPath}/${folderName}`;
    setCurrentPath(newPath);
  };

  const handleBreadcrumbClick = (index: number) => {
    const parts = currentPath.split("/").filter(Boolean);
    const newPath = "/" + parts.slice(0, index + 1).join("/");
    setCurrentPath(newPath);
  };

  const handleDownload = (fileName: string) => {
    if (!device) return;
    const deviceUrl = `https://${device.id}.strct.org`;
    const cleanPath = currentPath === "/" ? "" : currentPath;
    const downloadUrl = `${deviceUrl}/files${cleanPath}/${fileName}`;
    window.open(downloadUrl, "_blank");
  };

  const getFileIcon = (name: string, type: string) => {
    if (type === "folder")
      return <Folder className="text-[#7b8cde]" size={20} />;
    const ext = name.split(".").pop()?.toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext || ""))
      return <ImageIcon className="text-[#a78bde]" size={20} />;
    if (["mp4", "mov", "mkv"].includes(ext || ""))
      return <Video className="text-[#f87171]" size={20} />;
    if (["mp3", "wav"].includes(ext || ""))
      return <Music className="text-[#f472b6]" size={20} />;
    if (["pdf", "doc", "txt"].includes(ext || ""))
      return <FileText className="text-[#60a5fa]" size={20} />;
    return <File className="text-[#555]" size={20} />;
  };

  if (portalLoading || !devices) {
    return (
      <div className="min-h-screen bg-[#080810] flex items-center justify-center font-mono">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-[#7b8cde]" size={24} />
          <span className="text-[10px] text-[#555] uppercase tracking-widest">
            Establishing Link...
          </span>
        </div>
      </div>
    );
  }

  if (!device) {
    return (
      <div className="min-h-screen bg-[#080810] flex flex-col items-center justify-center font-mono">
        <div className="w-16 h-16 bg-[#1a0a0a] border border-[#f87171]/30 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(248,113,113,0.1)]">
          <HardDrive className="text-[#f87171]" size={32} />
        </div>
        <h1 className="text-sm font-bold text-[#dde1f0] uppercase tracking-widest mb-2">
          Volume Unreachable
        </h1>
        <button
          onClick={() => router.push("/portal/dashboard")}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#0a0a14] border border-[#1a1a28] hover:border-[#7b8cde]/40 text-[#dde1f0] rounded-xl font-bold mt-4 text-xs uppercase tracking-widest transition-all"
        >
          <ArrowLeft size={14} /> Return to Fleet
        </button>
      </div>
    );
  }

  const pathParts = currentPath.split("/").filter(Boolean);

  return (
    <div
      className="min-h-screen bg-[#080810] text-[#dde1f0] font-mono selection:bg-[#7b8cde]/30 selection:text-[#dde1f0]"
      style={{ fontFamily: "'IBM Plex Mono', 'JetBrains Mono', monospace" }}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Header */}
      <header className="border-b border-[#151520] sticky top-0 z-40 bg-[#080810]/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="text-[#444] hover:text-[#dde1f0] transition-colors flex items-center gap-1.5 text-sm uppercase tracking-widest font-bold"
            >
              <ArrowLeft size={14} /> Hub
            </button>
            <div className="w-px h-4 bg-[#1a1a2a]" />
            <div className="flex items-center gap-2">
              <Terminal size={14} className="text-[#7b8cde]" />
              <div>
                <h1 className="text-xs font-bold tracking-widest uppercase text-[#7b8cde]">
                  Storage
                </h1>
                <p className="text-[9px] text-[#555] mt-0.5 uppercase tracking-widest">
                  {device.friendly_name}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 min-h-screen space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="space-y-6"
        >
          {/* Action Bar */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#151522] pb-6">
            <div>
              <h2 className="text-xl font-bold text-[#dde1f0] mb-2 flex items-center gap-3">
                Volume Mount
              </h2>
              <p className="text-[11px] text-[#555] uppercase tracking-widest flex items-center gap-2">
                <span className="text-[#7b8cde]">{currentPath || "/"}</span>
                <span className="text-[#333]">/</span>
                Manage stored data objects
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setCreateFolderOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#0a0a14] border border-[#1a1a28] hover:border-[#7b8cde]/40 text-[#dde1f0] rounded-xl font-bold transition-all text-xs uppercase tracking-widest shadow-sm"
              >
                <FolderPlus size={14} className="text-[#7b8cde]" /> MkDir
              </button>

              <button
                onClick={handleUploadClick}
                disabled={isUploading}
                className="flex items-center gap-2 bg-[#7b8cde] hover:bg-[#8d9de8] text-[#080810] px-5 py-2.5 rounded-xl font-bold transition-all text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(123,140,222,0.15)] hover:shadow-[0_0_25px_rgba(123,140,222,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <Loader2 size={14} className="animate-spin text-[#080810]" />
                ) : (
                  <UploadCloud size={14} />
                )}
                {isUploading ? "Transferring..." : "Upload"}
              </button>
            </div>
          </div>

          {/* FILE BROWSER AREA */}
          <div className="bg-[#0c0c16] rounded-2xl border border-[#151522] overflow-hidden min-h-[500px] flex flex-col shadow-2xl relative">
            {/* Breadcrumb Header */}
            <div className="px-6 py-4 bg-[#0a0a14] border-b border-[#1a1a28] flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 overflow-x-auto text-[11px] uppercase tracking-widest font-bold text-[#555]">
                <button
                  onClick={() => setCurrentPath("/")}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors ${
                    currentPath === "/"
                      ? "text-[#7b8cde] bg-[#7b8cde]/10 border border-[#7b8cde]/20"
                      : "hover:text-[#dde1f0] hover:bg-[#11111a] border border-transparent"
                  }`}
                >
                  root <span className="text-[#333]">/</span>
                </button>
                {pathParts.map((part, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 whitespace-nowrap"
                  >
                    <ChevronRight size={10} className="text-[#333]" />
                    <button
                      onClick={() => handleBreadcrumbClick(index)}
                      className={`px-2 py-1 rounded-md transition-colors ${
                        index === pathParts.length - 1
                          ? "text-[#dde1f0]"
                          : "hover:text-[#dde1f0] hover:bg-[#11111a]"
                      }`}
                    >
                      {part}
                    </button>
                  </div>
                ))}
              </div>
              {isUploading && (
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-[#7b8cde] animate-pulse">
                  <Loader2 size={12} className="animate-spin" />
                  Writing...
                </div>
              )}
            </div>

            {/* Content Area */}
            <div className="flex-1 p-5">
              {loadingFiles ? (
                <div className="h-full flex flex-col items-center justify-center text-[#555] gap-4 min-h-[350px]">
                  <Loader2 className="animate-spin text-[#7b8cde]" size={28} />
                  <span className="text-[10px] uppercase tracking-widest font-bold">
                    Indexing Files...
                  </span>
                </div>
              ) : fileError ? (
                <div className="h-full flex flex-col items-center justify-center text-[#f87171] gap-4 min-h-[350px]">
                  <div className="w-12 h-12 bg-[#1a0a0a] border border-[#f87171]/30 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(248,113,113,0.1)]">
                    <AlertTriangle size={24} />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest">
                    {fileError}
                  </span>
                  <button
                    onClick={() => setCurrentPath("/")}
                    className="text-[10px] text-[#888] hover:text-[#dde1f0] border border-[#1a1a28] bg-[#0a0a14] px-4 py-2 rounded-lg transition-colors uppercase tracking-widest"
                  >
                    Reinitialize Root
                  </button>
                </div>
              ) : files.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-[#555] gap-3 min-h-[350px]">
                  <Folder size={40} className="opacity-20 mb-2" />
                  <span className="text-[10px] uppercase tracking-widest font-bold">
                    Directory Empty
                  </span>
                  <div className="flex gap-4 mt-2">
                    <button
                      onClick={() => setCreateFolderOpen(true)}
                      className="text-[10px] text-[#7b8cde] font-bold uppercase tracking-widest hover:text-[#8d9de8] transition-colors"
                    >
                      [ MkDir ]
                    </button>
                    <button
                      onClick={handleUploadClick}
                      className="text-[10px] text-[#7b8cde] font-bold uppercase tracking-widest hover:text-[#8d9de8] transition-colors"
                    >
                      [ Upload ]
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {sortedFiles.map((file, idx) => (
                    <motion.div
                      key={`${file.name}-${idx}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      className="group p-4 rounded-xl bg-[#0a0a14] border border-[#1a1a28] hover:border-[#7b8cde]/40 transition-all flex items-center justify-between relative cursor-pointer hover:bg-[#0c0c1a]"
                      onClick={() =>
                        file.type === "folder"
                          ? handleNavigate(file.name)
                          : handleDownload(file.name)
                      }
                    >
                      {/* Clickable Area */}
                      <div className="flex items-center gap-3 overflow-hidden flex-1">
                        <div className="w-10 h-10 rounded-lg bg-[#0c0c16] border border-[#151522] flex items-center justify-center flex-shrink-0 group-hover:border-[#7b8cde]/20 transition-colors">
                          {getFileIcon(file.name, file.type)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-[#dde1f0] truncate group-hover:text-[#fff]">
                            {file.name}
                          </p>
                          <p className="text-[10px] text-[#555] uppercase tracking-widest mt-0.5">
                            {file.type === "folder"
                              ? "DIR"
                              : `${file.size} • ${new Date(
                                  file.modifiedAt
                                ).toLocaleDateString()}`}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setItemToDelete(file);
                            setDeleteModalOpen(true);
                          }}
                          className="w-8 h-8 rounded-lg border border-[#1a1a28] bg-[#0c0c16] flex items-center justify-center text-[#555] hover:border-[#f87171]/50 hover:bg-[#1a0a0a] hover:text-[#f87171] transition-colors"
                        >
                          <Trash2 size={12} />
                        </button>

                        {file.type === "file" ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(file.name);
                            }}
                            className="w-8 h-8 rounded-lg border border-[#1a1a28] bg-[#0c0c16] flex items-center justify-center text-[#555] hover:border-[#7b8cde]/50 hover:bg-[#0a0c1a] hover:text-[#7b8cde] transition-colors"
                          >
                            <Download size={12} />
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNavigate(file.name);
                            }}
                            className="w-8 h-8 rounded-lg border border-[#1a1a28] bg-[#0c0c16] flex items-center justify-center text-[#555] hover:border-[#7b8cde]/50 hover:bg-[#0a0c1a] hover:text-[#7b8cde] transition-colors"
                          >
                            <ChevronRight size={12} />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {shareModalOpen && (
          <ShareModal
            onClose={() => setShareModalOpen(false)}
            deviceName={device.friendly_name}
          />
        )}
        {createFolderOpen && device && (
          <CreateFolderModal
            onClose={() => setCreateFolderOpen(false)}
            currentPath={currentPath}
            deviceId={device.id}
            onSuccess={() => {
              setCreateFolderOpen(false);
              fetchFiles();
            }}
          />
        )}
        {deleteModalOpen && itemToDelete && device && (
          <DeleteModal
            onClose={() => {
              setDeleteModalOpen(false);
              setItemToDelete(null);
            }}
            item={itemToDelete}
            currentPath={currentPath}
            deviceId={device.id}
            onSuccess={() => {
              setDeleteModalOpen(false);
              setItemToDelete(null);
              fetchFiles();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Modals ───────────────────────────────────────────────────────────────────

function DeleteModal({
  onClose,
  item,
  currentPath,
  deviceId,
  onSuccess,
}: {
  onClose: () => void;
  item: FileItem;
  currentPath: string;
  deviceId: string;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const fullPath =
        currentPath === "/" ? `/${item.name}` : `${currentPath}/${item.name}`;

      const res = await fetch(
        `https://${deviceId}.strct.org/api/delete?path=${encodeURIComponent(
          fullPath
        )}`,
        { method: "DELETE" }
      );

      if (!res.ok) throw new Error("Failed to delete");
      onSuccess();
    } catch (err) {
      const error = err as Error;
      alert(`Error deleting object: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-[#080810]/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        className="relative bg-[#0c0c16] border border-[#151522] rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden"
      >
        <div className="bg-[#0a0a14] border-b border-[#1a1a28] px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 text-[#f87171] text-xs font-bold uppercase tracking-widest">
            <AlertTriangle size={14} /> Confirm Deletion
          </div>
        </div>

        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-[#1a0a0a] border border-[#f87171]/30 text-[#f87171] rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-[0_0_20px_rgba(248,113,113,0.1)]">
            <Trash2 size={24} />
          </div>

          <h3 className="text-sm font-bold text-[#dde1f0] mb-2 truncate px-2">
            Destroy &quot;{item.name}&quot;?
          </h3>

          <p className="text-[11px] text-[#555] leading-relaxed mb-6 px-2">
            This action is irreversible and will permanently remove the data from the volume.
            {item.type === "folder" && (
              <span className="block mt-3 text-[#f87171] border border-[#f87171]/20 bg-[#1a0a0a] p-2 rounded-lg text-[10px] uppercase tracking-widest">
                Warning: Directory is not empty
              </span>
            )}
          </p>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-[#0a0a14] border border-[#1a1a28] hover:border-[#2a2a3a] hover:bg-[#11111a] text-[#888] hover:text-[#dde1f0] rounded-lg text-xs font-bold uppercase tracking-widest transition-colors"
            >
              Abort
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-[#1a0a0a] border border-[#f87171]/50 text-[#f87171] hover:bg-[#f87171] hover:text-[#080810] rounded-lg text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(248,113,113,0.15)] disabled:opacity-50"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              Confirm
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function CreateFolderModal({
  onClose,
  currentPath,
  deviceId,
  onSuccess,
}: {
  onClose: () => void;
  currentPath: string;
  deviceId: string;
  onSuccess: () => void;
}) {
  const [folderName, setFolderName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`https://${deviceId}.strct.org/api/mkdir`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: currentPath, name: folderName.trim() }),
      });
      if (res.status === 409) throw new Error("Directory already exists");
      if (!res.ok) throw new Error("Failed to create directory");
      onSuccess();
    } catch (err) {
      const error = err as Error;
      setError(error.message || "Execution error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-[#080810]/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        className="relative bg-[#0c0c16] border border-[#151522] rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden"
      >
        <div className="bg-[#0a0a14] border-b border-[#1a1a28] px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 text-[#7b8cde] text-xs font-bold uppercase tracking-widest">
            <FolderPlus size={14} /> Allocate Directory
          </div>
          <button onClick={onClose} className="text-[#555] hover:text-[#dde1f0] transition-colors">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label className="text-[10px] font-bold text-[#555] uppercase tracking-widest block mb-2">
              Directory Name
            </label>
            <input
              autoFocus
              type="text"
              placeholder="new_folder"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              className="w-full bg-[#0a0a14] border border-[#1a1a28] hover:border-[#252535] focus:border-[#7b8cde]/40 rounded-lg px-3 py-2.5 text-sm font-mono text-[#dde1f0] focus:outline-none transition-colors placeholder-[#2a2a3a]"
            />
            {error && <p className="text-[#f87171] text-[10px] mt-2 font-mono">&gt; {error}</p>}
          </div>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-[#0a0a14] border border-[#1a1a28] hover:border-[#2a2a3a] hover:bg-[#11111a] text-[#888] hover:text-[#dde1f0] rounded-lg text-xs font-bold uppercase tracking-widest transition-colors"
            >
              Abort
            </button>
            <button
              type="submit"
              disabled={loading || !folderName.trim()}
              className="px-5 py-2.5 bg-[#7b8cde] text-[#080810] hover:bg-[#8d9de8] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(123,140,222,0.15)]"
            >
              {loading && <Loader2 size={12} className="animate-spin" />}
              Execute
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function ShareModal({
  onClose,
  deviceName,
}: {
  onClose: () => void;
  deviceName: string;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFriend, setSelectedFriend] = useState<number | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    if (!selectedFriend) return;
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setSent(true);
      setTimeout(onClose, 1500);
    }, 1500);
  };

  if (sent) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-[#080810]/80 backdrop-blur-sm" />
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative bg-[#0c0c16] border border-[#1a4a1a] rounded-2xl p-10 flex flex-col items-center text-center shadow-[0_0_30px_rgba(74,222,128,0.1)]"
        >
          <div className="w-16 h-16 bg-[#0a1a0a] border border-[#1a4a1a] text-[#4ade80] rounded-full flex items-center justify-center mb-4">
            <Check size={32} />
          </div>
          <h3 className="text-sm font-bold text-[#4ade80] uppercase tracking-widest mb-2">
            Keys Distributed
          </h3>
          <p className="text-[10px] text-[#555] uppercase tracking-widest">
            Client authorized for remote access.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-[#080810]/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-lg bg-[#0c0c16] border border-[#151522] rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="bg-[#0a0a14] border-b border-[#1a1a28] px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 text-[#7b8cde] text-xs font-bold uppercase tracking-widest">
            <Share2 size={14} /> Distribute Access
          </div>
          <button onClick={onClose} className="text-[#555] hover:text-[#dde1f0] transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-6">
          <div className="relative mb-6">
            <label className="text-[10px] font-bold text-[#555] uppercase tracking-widest mb-2 block">
              Query Identity
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#444]" size={16} />
              <input
                type="text"
                placeholder="email, username, or client_id"
                className="w-full pl-10 pr-4 py-2.5 bg-[#0a0a14] border border-[#1a1a28] hover:border-[#252535] focus:border-[#7b8cde]/40 rounded-lg text-sm font-mono text-[#dde1f0] focus:outline-none transition-colors placeholder-[#2a2a3a]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-bold text-[#555] uppercase tracking-widest">
              Available Nodes
            </label>
            <div className="space-y-2">
              {FRIENDS.filter((f) =>
                f.name.toLowerCase().includes(searchTerm.toLowerCase())
              ).map((friend) => (
                <div
                  key={friend.id}
                  onClick={() => setSelectedFriend(friend.id)}
                  className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer border transition-all ${
                    selectedFriend === friend.id
                      ? "bg-[#0a0c1a] border-[#7b8cde]/50 shadow-[0_0_15px_rgba(123,140,222,0.1)]"
                      : "bg-[#0a0a14] border-[#1a1a28] hover:border-[#2a2a3a]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={friend.avatar} alt={friend.name} className="w-10 h-10 rounded-lg border border-[#2a2a3a] grayscale" />
                    <div>
                      <div className="font-bold text-xs text-[#dde1f0] uppercase tracking-widest mb-0.5">
                        {friend.name}
                      </div>
                      <div className="text-[10px] text-[#555]">
                        {friend.email}
                      </div>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded border flex items-center justify-center ${
                      selectedFriend === friend.id
                        ? "border-[#7b8cde] bg-[#7b8cde]/20"
                        : "border-[#333]"
                    }`}
                  >
                    {selectedFriend === friend.id && <Check size={12} className="text-[#7b8cde]" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-[#1a1a28] bg-[#0a0a14] px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg font-bold text-[#888] hover:text-[#dde1f0] text-xs uppercase tracking-widest transition-colors"
          >
            Abort
          </button>
          <button
            onClick={handleSend}
            disabled={!selectedFriend || isSending}
            className={`px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all text-xs uppercase tracking-widest ${
              !selectedFriend
                ? "bg-[#11111a] text-[#444] border border-[#1a1a28] cursor-not-allowed"
                : "bg-[#7b8cde] text-[#080810] hover:bg-[#8d9de8] shadow-[0_0_15px_rgba(123,140,222,0.15)]"
            }`}
          >
            {isSending ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
            {isSending ? "Authorizing..." : "Grant Access"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}