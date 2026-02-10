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
  Home,
  UploadCloud,
  FolderPlus,
  Trash2,
  AlertTriangle,
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
      setFileError("Could not connect to device. Is it online?");
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
      alert("Error uploading file. Check connection.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // --- 4. Navigation & Actions ---
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
    const deviceUrl = `https://${device!.id}.strct.org`;
    const cleanPath = currentPath === "/" ? "" : currentPath;
    const downloadUrl = `${deviceUrl}/files${cleanPath}/${fileName}`;
    window.open(downloadUrl, "_blank");
  };

  const getFileIcon = (name: string, type: string) => {
    if (type === "folder")
      return <Folder className="text-[#ffc233] fill-[#ffc233]/20" size={24} />;
    const ext = name.split(".").pop()?.toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext || ""))
      return <ImageIcon className="text-purple-500" size={24} />;
    if (["mp4", "mov", "mkv"].includes(ext || ""))
      return <Video className="text-red-500" size={24} />;
    if (["mp3", "wav"].includes(ext || ""))
      return <Music className="text-pink-500" size={24} />;
    if (["pdf", "doc", "txt"].includes(ext || ""))
      return <FileText className="text-blue-500" size={24} />;
    return <File className="text-gray-400" size={24} />;
  };

  // --- Loading / Error States for Page ---
  if (portalLoading || !devices) {
    return (
      <div className="min-h-screen bg-[#f2f2f7] flex items-center justify-center">
        <Loader2 className="animate-spin text-gray-400" size={32} />
      </div>
    );
  }

  if (!device) {
    return (
      <div className="min-h-screen bg-[#f2f2f7] flex flex-col items-center justify-center text-[#1d1d1f]">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
          <HardDrive className="text-gray-400" size={32} />
        </div>
        <h1 className="text-2xl font-bold mb-2">Device Not Found</h1>
        <button
          onClick={() => router.push("/portal/dashboard")}
          className="flex items-center gap-2 px-6 py-3 bg-[#1d1d1f] text-white rounded-full font-bold mt-4"
        >
          <ArrowLeft size={18} /> Return to Dashboard
        </button>
      </div>
    );
  }

  const pathParts = currentPath.split("/").filter(Boolean);

  return (
    <div className="min-h-screen bg-[#f2f2f7] font-sans text-[#1d1d1f]">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      <main className="pt-28 px-6 pb-12 max-w-[1200px] mx-auto min-h-screen">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <button
            onClick={() => router.back()}
            className="group flex items-center gap-2 text-gray-500 hover:text-black mb-6 transition-colors font-medium text-sm"
          >
            <div className="p-1 rounded-full bg-white shadow-sm border border-gray-200 group-hover:border-gray-300">
              <ArrowLeft size={14} />
            </div>
            Back 
          </button>

          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#fffcf0] to-transparent pointer-events-none"></div>

            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-[#1d1d1f] rounded-2xl flex items-center justify-center shadow-xl shadow-gray-200">
                  <HardDrive className="text-[#ffc233]" size={36} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-[#1d1d1f]">
                    {device.friendly_name}
                  </h1>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {/* NEW FOLDER */}
                <button
                  onClick={() => setCreateFolderOpen(true)}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white border border-gray-200 text-[#1d1d1f] font-bold hover:bg-gray-50 transition-all hover:scale-105"
                >
                  <FolderPlus size={18} /> New Folder
                </button>

                {/* UPLOAD */}
                <button
                  onClick={handleUploadClick}
                  disabled={isUploading}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#1d1d1f] hover:bg-black text-white font-bold shadow-lg transition-all hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <UploadCloud size={18} />
                  )}
                  {isUploading ? "Uploading..." : "Upload File"}
                </button>

                {/* SHARE */}
                <button
                  onClick={() => setShareModalOpen(true)}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#ffc233] hover:bg-[#ffcd57] text-[#1d1d1f] font-bold shadow-lg shadow-orange-100 transition-all hover:scale-105"
                >
                  <Share2 size={18} /> Share Files
                </button>

               
              </div>
            </div>
          </div>

          {/* FILE BROWSER AREA */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
            {/* Browser Header / Breadcrumbs */}
            <div className="px-8 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 overflow-x-auto">
                <button
                  onClick={() => setCurrentPath("/")}
                  className={`p-1.5 rounded-md hover:bg-gray-200 transition-colors ${
                    currentPath === "/" ? "text-gray-900" : "text-gray-500"
                  }`}
                >
                  <Home size={18} />
                </button>
                {pathParts.map((part, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 whitespace-nowrap"
                  >
                    <ChevronRight size={14} className="text-gray-300" />
                    <button
                      onClick={() => handleBreadcrumbClick(index)}
                      className="font-medium text-sm hover:text-[#ffc233] transition-colors"
                    >
                      {part}
                    </button>
                  </div>
                ))}
              </div>
              {isUploading && (
                <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                  <Loader2 size={14} className="animate-spin" />
                  Uploading...
                </div>
              )}
            </div>

            {/* Content Area */}
            <div className="flex-1 p-4">
              {loadingFiles ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-3 min-h-[300px]">
                  <Loader2 className="animate-spin" size={32} />
                  <span className="text-sm font-medium">Fetching files...</span>
                </div>
              ) : fileError ? (
                <div className="h-full flex flex-col items-center justify-center text-red-400 gap-3 min-h-[300px]">
                  <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
                    <X size={24} />
                  </div>
                  <span className="text-sm font-medium">{fileError}</span>
                  <button
                    onClick={() => setCurrentPath("/")}
                    className="text-xs underline text-gray-500 hover:text-black"
                  >
                    Try resetting path
                  </button>
                </div>
              ) : files.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2 min-h-[300px]">
                  <Folder size={48} className="opacity-20" />
                  <span className="text-sm">This folder is empty</span>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => setCreateFolderOpen(true)}
                      className="text-[#ffc233] font-bold text-sm hover:underline"
                    >
                      Create Folder
                    </button>
                    <span className="text-gray-300">or</span>
                    <button
                      onClick={handleUploadClick}
                      className="text-[#ffc233] font-bold text-sm hover:underline"
                    >
                      Upload File
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
                      transition={{ delay: idx * 0.03 }}
                      // Remove the onClick from the parent div so clicking buttons doesn't trigger navigation
                      className="group p-4 rounded-2xl border border-gray-100 hover:border-[#ffc233] hover:bg-[#fffcf0] hover:shadow-md transition-all flex items-center justify-between relative"
                    >
                      {/* Clickable Area for Navigation/Download */}
                      <div
                        className="flex items-center gap-3 overflow-hidden flex-1 cursor-pointer"
                        onClick={() =>
                          file.type === "folder"
                            ? handleNavigate(file.name)
                            : handleDownload(file.name)
                        }
                      >
                        <div className="w-10 h-10 rounded-xl bg-gray-50 group-hover:bg-white flex items-center justify-center flex-shrink-0 transition-colors">
                          {getFileIcon(file.name, file.type)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-gray-800 truncate group-hover:text-black">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-400 group-hover:text-gray-500">
                            {file.type === "folder"
                              ? "Folder"
                              : `${file.size} • ${new Date(
                                  file.modifiedAt
                                ).toLocaleDateString()}`}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons (Hidden until hover) */}
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        {/* Delete Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent opening the folder
                            setItemToDelete(file);
                            setDeleteModalOpen(true);
                          }}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-red-100 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>

                        {/* Existing Action Button (Download or Enter) */}
                        {file.type === "file" ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(file.name);
                            }}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-[#ffc233] hover:text-black transition-colors"
                          >
                            <Download size={16} />
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNavigate(file.name);
                            }}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-[#ffc233] hover:text-black transition-colors"
                          >
                            <ChevronRight size={16} />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

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
        </motion.div>
      </main>
    </div>
  );
}

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
      // Construct full path: /current/path/filename
      const fullPath =
        currentPath === "/" ? `/${item.name}` : `${currentPath}/${item.name}`;

      const res = await fetch(
        `https://${deviceId}.strct.org/api/delete?path=${encodeURIComponent(
          fullPath
        )}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) throw new Error("Failed to delete");
      onSuccess();
    } catch (err) {
      alert("Error deleting file");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl text-center"
      >
        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trash2 size={32} />
        </div>

        <h3 className="text-xl font-bold text-gray-900">
          Delete {item.type === "folder" ? "Folder" : "File"}?
        </h3>

        <p className="text-gray-500 mt-2 text-sm">
          Are you sure you want to delete{" "}
          <span className="font-bold text-gray-800">"{item.name}"</span>?
          {item.type === "folder" && (
            <span className="block mt-2 text-red-500 font-medium text-xs bg-red-50 p-2 rounded-lg flex items-center justify-center gap-1">
              <AlertTriangle size={12} /> This will delete all contents inside.
            </span>
          )}
        </p>

        <div className="flex gap-3 justify-center mt-8">
          <button
            onClick={onClose}
            className="px-6 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="px-6 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              "Delete"
            )}
          </button>
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
      if (res.status === 409) throw new Error("Folder already exists");
      if (!res.ok) throw new Error("Failed to create folder");
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Error creating folder");
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
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">New Folder</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-black transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              autoFocus
              type="text"
              placeholder="Folder Name"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffc233] font-medium"
            />
            {error && <p className="text-red-500 text-xs mt-2 ml-1">{error}</p>}
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !folderName.trim()}
              className="px-6 py-2 bg-[#1d1d1f] text-white rounded-lg font-bold hover:bg-black disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              Create
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}


// --- SUB-COMPONENT: Share Modal ---
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
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="relative bg-white rounded-3xl p-10 flex flex-col items-center text-center shadow-2xl"
        >
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
            <Check size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Invitation Sent!</h3>
          <p className="text-gray-500 mt-2">
            They will receive an email shortly.
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
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="bg-gray-50 px-8 py-6 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-[#1d1d1f]">
              Share {deviceName}
            </h3>
            <p className="text-sm text-gray-500">
              Invite friends to access files.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white rounded-full text-gray-400 hover:text-black hover:shadow-md transition-all"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-8">
          <div className="relative mb-8">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">
              Find User
            </label>
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Enter email, username or device ID"
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffc233] focus:bg-white transition-all font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
              Suggested Contacts
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
                      ? "bg-[#fffcf0] border-[#ffc233] ring-1 ring-[#ffc233]"
                      : "hover:bg-gray-50 border-transparent hover:border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={friend.avatar}
                      alt={friend.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <div className="font-bold text-sm text-[#1d1d1f]">
                        {friend.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {friend.email}
                      </div>
                    </div>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectedFriend === friend.id
                        ? "border-[#ffc233] bg-[#ffc233]"
                        : "border-gray-200"
                    }`}
                  >
                    {selectedFriend === friend.id && (
                      <Check size={14} className="text-black" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={!selectedFriend || isSending}
            className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-lg ${
              !selectedFriend
                ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                : "bg-[#1d1d1f] text-white hover:bg-black"
            }`}
          >
            {isSending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
            {isSending ? "Sending..." : "Send Invitation"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
