'use client';

import { StorageStats, OrphanedFile } from './types';

interface BackupProps {
  storageStats: StorageStats;
  orphanedFiles: OrphanedFile[];
  selectedOrphanFiles: Set<string>;
  setSelectedOrphanFiles: React.Dispatch<React.SetStateAction<Set<string>>>;
  isBackingUp: boolean;
  isRestoring: boolean;
  isScanning: boolean;
  isCleaning: boolean;
  totalStorageSize: number;
  onDatabaseBackup: () => void;
  onRestoreDatabase: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onMediaBackup: () => void;
  onFullBackup: () => void;
  onScanStorage: () => void;
  onCleanStorage: () => void;
}

export default function Backup({
  storageStats,
  orphanedFiles,
  selectedOrphanFiles,
  setSelectedOrphanFiles,
  isBackingUp,
  isRestoring,
  isScanning,
  isCleaning,
  totalStorageSize,
  onDatabaseBackup,
  onRestoreDatabase,
  onMediaBackup,
  onFullBackup,
  onScanStorage,
  onCleanStorage,
}: BackupProps) {
  const usedFiles = storageStats.images + storageStats.videos - orphanedFiles.length;
  const usedSize = (totalStorageSize - orphanedFiles.reduce((s, f) => s + f.size, 0)) / 1024 / 1024;

  return (
    <div className="space-y-4">
      {/* 数据库备份 */}
      <div className="bg-white rounded-xl p-4">
        <h3 className="font-medium text-gray-800 mb-2">数据库备份</h3>
        <p className="text-sm text-gray-500 mb-4">包含：产品、分类、标签等所有数据</p>
        <div className="flex gap-3">
          <button
            onClick={onDatabaseBackup}
            disabled={isBackingUp}
            className="flex-1 py-3 bg-[#14b8a6] text-white rounded-xl font-medium hover:bg-[#14b8a6]/90 transition-colors disabled:opacity-50"
          >
            {isBackingUp ? '备份中...' : '下载数据库备份'}
          </button>
          <label className="flex-1 py-3 bg-white border border-[#14b8a6] text-[#14b8a6] rounded-xl font-medium hover:bg-[#14b8a6]/5 transition-colors text-center cursor-pointer">
            {isRestoring ? '恢复中...' : '恢复数据库'}
            <input
              type="file"
              accept=".json"
              onChange={onRestoreDatabase}
              disabled={isRestoring}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* 媒体文件备份 */}
      <div className="bg-white rounded-xl p-4">
        <h3 className="font-medium text-gray-800 mb-2">媒体文件备份</h3>
        <p className="text-sm text-gray-500 mb-4">包含：产品图片、封面图、视频等</p>
        <button
          onClick={onMediaBackup}
          disabled={isBackingUp}
          className="w-full py-3 bg-[#14b8a6] text-white rounded-xl font-medium hover:bg-[#14b8a6]/90 transition-colors disabled:opacity-50"
        >
          {isBackingUp ? '备份中...' : '下载媒体文件备份'}
        </button>
      </div>

      {/* 完整备份 */}
      <div className="bg-gradient-to-r from-[#14b8a6] to-[#0d9488] rounded-xl p-4 text-white">
        <h3 className="font-medium mb-2">一键完整备份</h3>
        <p className="text-sm text-white/80 mb-4">同时下载数据库和媒体文件备份</p>
        <button
          onClick={onFullBackup}
          disabled={isBackingUp}
          className="w-full py-3 bg-white text-[#14b8a6] rounded-xl font-medium hover:bg-white/90 transition-colors disabled:opacity-50"
        >
          {isBackingUp ? '备份中...' : '下载完整备份'}
        </button>
      </div>

      {/* 存储空间清理 */}
      <div className="border-t border-gray-100 pt-4 mt-4">
        <h3 className="font-medium text-gray-800 mb-3">存储空间清理</h3>
        <p className="text-sm text-gray-500 mb-4">扫描并删除孤立的图片/视频文件</p>
        
        {/* 存储空间统计 */}
        {totalStorageSize > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4">
            <p className="text-sm text-blue-600 mb-2 font-medium">存储空间占用</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white rounded-lg p-2">
                <p className="text-gray-500">图片</p>
                <p className="font-medium text-gray-800">{storageStats.images} 个 ({(storageStats.imageSize / 1024 / 1024).toFixed(2)} MB)</p>
              </div>
              <div className="bg-white rounded-lg p-2">
                <p className="text-gray-500">视频</p>
                <p className="font-medium text-gray-800">{storageStats.videos} 个 ({(storageStats.videoSize / 1024 / 1024).toFixed(2)} MB)</p>
              </div>
              <div className="bg-white rounded-lg p-2">
                <p className="text-gray-500">已使用</p>
                <p className="font-medium text-green-600">{usedFiles} 个 ({usedSize.toFixed(2)} MB)</p>
              </div>
              <div className="bg-white rounded-lg p-2">
                <p className="text-gray-500">总占用</p>
                <p className="font-medium text-gray-800">{(totalStorageSize / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
          </div>
        )}
        
        {orphanedFiles.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 mb-4">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-orange-600">发现 {orphanedFiles.length} 个孤立文件，共 {(orphanedFiles.reduce((sum, f) => sum + f.size, 0) / 1024 / 1024).toFixed(2)} MB</p>
              <label className="flex items-center gap-1 text-xs text-orange-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedOrphanFiles.size === orphanedFiles.length && orphanedFiles.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedOrphanFiles(new Set(orphanedFiles.map(f => `${f.bucket}/${f.name}`)));
                    } else {
                      setSelectedOrphanFiles(new Set());
                    }
                  }}
                  className="rounded"
                />
                全选
              </label>
            </div>
            <div className="max-h-60 overflow-y-auto text-xs text-gray-600 space-y-1">
              {orphanedFiles.map((file) => {
                const key = `${file.bucket}/${file.name}`;
                return (
                  <div key={key} className="flex justify-between items-center hover:bg-orange-100 rounded px-1">
                    <label className="flex items-center gap-2 flex-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedOrphanFiles.has(key)}
                        onChange={() => {
                          setSelectedOrphanFiles(prev => {
                            const newSet = new Set(prev);
                            if (newSet.has(key)) {
                              newSet.delete(key);
                            } else {
                              newSet.add(key);
                            }
                            return newSet;
                          });
                        }}
                        className="rounded"
                      />
                      <span className="truncate flex-1">{file.bucket}/{file.name}</span>
                    </label>
                    <span className="ml-2 text-gray-400">{(file.size / 1024).toFixed(1)} KB</span>
                  </div>
                );
              })}
            </div>
            {selectedOrphanFiles.size > 0 && (
              <p className="text-xs text-orange-600 mt-2">已选择 {selectedOrphanFiles.size} 个文件</p>
            )}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onScanStorage}
            disabled={isScanning}
            className="flex-1 py-2.5 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors disabled:opacity-50"
          >
            {isScanning ? '扫描中...' : '扫描孤立文件'}
          </button>
          <button
            onClick={onCleanStorage}
            disabled={isCleaning || selectedOrphanFiles.size === 0}
            className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            {isCleaning ? '删除中...' : `删除选中 (${selectedOrphanFiles.size})`}
          </button>
        </div>
      </div>
    </div>
  );
}
