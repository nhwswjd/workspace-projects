'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, Trash2, Check, X, ArrowLeft, Loader2 } from 'lucide-react';

interface Tag {
  id: string;
  name: string;
  sort_order: number;
  created_at: string;
}

export default function TagsPage() {
  const { isAdmin, isSuperAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTagName, setNewTagName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/');
    }
  }, [authLoading, isAdmin, router]);

  useEffect(() => {
    if (isAdmin) {
      fetchTags();
    }
  }, [isAdmin]);

  const fetchTags = async () => {
    try {
      const res = await fetch('/api/tags');
      const data = await res.json();
      setTags(data.tags || []);
    } catch (error) {
      console.error('获取标签失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = async () => {
    if (!newTagName.trim()) return;
    
    setSaving(true);
    try {
      const res = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: newTagName.trim(),
          sort_order: tags.length + 1
        }),
      });
      
      if (res.ok) {
        setNewTagName('');
        fetchTags();
      } else {
        const data = await res.json();
        alert(data.error || '添加失败');
      }
    } catch (error) {
      console.error('添加标签失败:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (tag: Tag) => {
    setEditingId(tag.id);
    setEditingName(tag.name);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editingName.trim()) return;
    
    setSaving(true);
    try {
      const res = await fetch('/api/tags', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingId, name: editingName.trim() }),
      });
      
      if (res.ok) {
        setEditingId(null);
        setEditingName('');
        fetchTags();
      } else {
        const data = await res.json();
        alert(data.error || '更新失败');
      }
    } catch (error) {
      console.error('更新标签失败:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个标签吗？')) return;
    
    try {
      const res = await fetch(`/api/tags?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchTags();
      }
    } catch (error) {
      console.error('删除标签失败:', error);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.push('/admin')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-semibold">标签管理</h1>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Add New Tag */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex gap-3">
            <input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
              placeholder="输入新标签名称"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <button
              onClick={handleAddTag}
              disabled={saving || !newTagName.trim()}
              className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              添加
            </button>
          </div>
        </div>

        {/* Tags List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {tags.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              暂无标签，点击上方添加
            </div>
          ) : (
            <div className="divide-y">
              {tags.map((tag) => (
                <div key={tag.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                  {editingId === tag.id ? (
                    <>
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit();
                          if (e.key === 'Escape') handleCancelEdit();
                        }}
                        className="flex-1 px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                        autoFocus
                      />
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={handleSaveEdit}
                          disabled={saving}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          disabled={saving}
                          className="p-1.5 text-gray-500 hover:bg-gray-100 rounded"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="text-gray-800">{tag.name}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(tag)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(tag.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
