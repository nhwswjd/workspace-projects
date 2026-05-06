'use client';

import { useState } from 'react';

interface SettingsProps {
  brandName: string;
  adminPasswords: string[];
  visitorPasswords: string[];
  isSuperAdmin: boolean;
  onUpdate: (key: string, value: string) => Promise<boolean>;
  showToast: (message: string, type?: 'success' | 'error') => void;
  onRefresh: () => void;
}

export default function Settings({
  brandName,
  adminPasswords,
  visitorPasswords,
  isSuperAdmin,
  onUpdate,
  showToast,
  onRefresh
}: SettingsProps) {
  // 网站名称
  const [localBrandName, setLocalBrandName] = useState(brandName);
  const [savingBrandName, setSavingBrandName] = useState(false);

  // 管理员密码
  const [newAdminPassword, setNewAdminPassword] = useState('');

  // 访客密码
  const [newVisitorPassword, setNewVisitorPassword] = useState('');

  // 保存网站名称
  const handleSaveBrandName = async () => {
    if (localBrandName.trim() === brandName) return;
    setSavingBrandName(true);
    const success = await onUpdate('brand_name', localBrandName.trim());
    setSavingBrandName(false);
    if (success) {
      showToast('网站名称已保存');
    }
  };

  // 添加管理员密码
  const handleAddPassword = async () => {
    if (!newAdminPassword.trim()) return;
    if (adminPasswords.includes(newAdminPassword.trim())) {
      showToast('该密码已存在', 'error');
      return;
    }
    const newPasswords = [...adminPasswords, newAdminPassword.trim()];
    const success = await onUpdate('admin_password', JSON.stringify(newPasswords));
    if (success) {
      setNewAdminPassword('');
      showToast('管理员密码已添加');
    }
  };

  // 删除管理员密码
  const handleRemovePassword = async (password: string) => {
    if (adminPasswords.length <= 1) {
      showToast('至少保留一个管理员密码', 'error');
      return;
    }
    if (!confirm(`确定要删除密码 "${password}" 吗？`)) return;
    const newPasswords = adminPasswords.filter(p => p !== password);
    const success = await onUpdate('admin_password', JSON.stringify(newPasswords));
    if (success) {
      showToast('管理员密码已删除');
    }
  };

  // 添加访客密码
  const handleAddVisitorPassword = async () => {
    if (!newVisitorPassword.trim()) return;
    if (visitorPasswords.includes(newVisitorPassword.trim())) {
      showToast('该密码已存在', 'error');
      return;
    }
    const newPasswords = [...visitorPasswords, newVisitorPassword.trim()];
    const success = await onUpdate('visitor_password', JSON.stringify(newPasswords));
    if (success) {
      setNewVisitorPassword('');
      showToast('访客密码已添加');
    }
  };

  // 删除访客密码
  const handleRemoveVisitorPassword = async (password: string) => {
    if (visitorPasswords.length <= 1) {
      showToast('至少保留一个访客密码', 'error');
      return;
    }
    if (!confirm(`确定要删除密码 "${password}" 吗？`)) return;
    const newPasswords = visitorPasswords.filter(p => p !== password);
    const success = await onUpdate('visitor_password', JSON.stringify(newPasswords));
    if (success) {
      showToast('访客密码已删除');
    }
  };

  return (
    <div className="space-y-8">
      {/* 网站名称 */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-medium mb-4">网站名称</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={localBrandName}
            onChange={(e) => setLocalBrandName(e.target.value)}
            className="input input-bordered flex-1"
            placeholder="输入网站名称"
          />
          <button
            onClick={handleSaveBrandName}
            disabled={savingBrandName || localBrandName === brandName}
            className="btn btn-primary"
          >
            {savingBrandName ? '保存中...' : '保存'}
          </button>
        </div>
      </div>

      {/* 管理员密码 */}
      {isSuperAdmin && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-medium mb-4">
            管理员密码
            <span className="text-sm font-normal text-gray-500 ml-2">（仅超级管理员可修改）</span>
          </h3>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newAdminPassword}
              onChange={(e) => setNewAdminPassword(e.target.value)}
              placeholder="输入新的管理员密码"
              className="input input-bordered flex-1"
              onKeyDown={(e) => e.key === 'Enter' && handleAddPassword()}
            />
            <button onClick={handleAddPassword} className="btn btn-primary">添加</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {adminPasswords.map((pwd, index) => (
              <div key={index} className="badge badge-lg badge-error gap-2 p-3">
                {pwd}
                <button
                  onClick={() => handleRemovePassword(pwd)}
                  className="text-error-content hover:text-white"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 访客密码 */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-medium mb-4">访客密码</h3>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newVisitorPassword}
            onChange={(e) => setNewVisitorPassword(e.target.value)}
            placeholder="输入新的访客密码"
            className="input input-bordered flex-1"
            onKeyDown={(e) => e.key === 'Enter' && handleAddVisitorPassword()}
          />
          <button onClick={handleAddVisitorPassword} className="btn btn-primary">添加</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {visitorPasswords.map((pwd, index) => (
            <div key={index} className="badge badge-lg badge-outline gap-2 p-3">
              {pwd}
              <button
                onClick={() => handleRemoveVisitorPassword(pwd)}
                className="text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
