'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';

interface Tag {
  id: string;
  name: string;
  sort_order: number;
  created_at: string;
}

interface FeaturedOption {
  id: string;
  type: 'featured' | 'featured_right_bottom';
  name: string;
  sort_order: number;
  created_at: string;
}

export default function TagsPage() {
  // 普通标签状态
  const [tags, setTags] = useState<Tag[]>([]);
  const [newTag, setNewTag] = useState('');
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [editingTagName, setEditingTagName] = useState('');
  
  // 右上标签状态
  const [featuredOptions, setFeaturedOptions] = useState<FeaturedOption[]>([]);
  const [newFeatured, setNewFeatured] = useState('');
  const [editingFeatured, setEditingFeatured] = useState<string | null>(null);
  const [editingFeaturedName, setEditingFeaturedName] = useState('');
  
  // 右下标签状态
  const [featuredRightBottomOptions, setFeaturedRightBottomOptions] = useState<FeaturedOption[]>([]);
  const [newFeaturedRightBottom, setNewFeaturedRightBottom] = useState('');
  const [editingFeaturedRightBottom, setEditingFeaturedRightBottom] = useState<string | null>(null);
  const [editingFeaturedRightBottomName, setEditingFeaturedRightBottomName] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 加载所有数据
  useEffect(() => {
    loadTags();
    loadFeaturedOptions();
  }, []);

  // 加载普通标签
  const loadTags = async () => {
    try {
      const res = await fetch('/api/tags');
      const data = await res.json();
      if (data.tags) {
        setTags(data.tags);
      }
    } catch (error) {
      console.error('加载标签失败:', error);
    }
  };

  // 加载右上/右下标签选项
  const loadFeaturedOptions = async () => {
    try {
      const res = await fetch('/api/featured-options');
      const data = await res.json();
      if (data.success) {
        setFeaturedOptions(data.featuredOptions || []);
        setFeaturedRightBottomOptions(data.featuredRightBottomOptions || []);
      }
    } catch (error) {
      console.error('加载标签选项失败:', error);
    }
  };

  // 显示消息
  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  // ========== 普通标签操作 ==========

  // 添加普通标签
  const handleAddTag = async () => {
    if (!newTag.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTag.trim() })
      });
      const data = await res.json();
      if (data.tag) {
        setTags([...tags, data.tag]);
        setNewTag('');
        showMessage('success', '添加成功');
      } else {
        showMessage('error', data.error || '添加失败');
      }
    } catch {
      showMessage('error', '添加失败');
    }
    setLoading(false);
  };

  // 删除普通标签
  const handleDeleteTag = async (id: string) => {
    if (!confirm('确定要删除这个标签吗？')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/tags?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setTags(tags.filter(t => t.id !== id));
        showMessage('success', '删除成功');
      } else {
        showMessage('error', data.error);
      }
    } catch {
      showMessage('error', '删除失败');
    }
    setLoading(false);
  };

  // ========== 右上标签操作 ==========

  // 添加右上标签
  const handleAddFeatured = async () => {
    if (!newFeatured.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/featured-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'featured', name: newFeatured.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setFeaturedOptions([...featuredOptions, data.data]);
        setNewFeatured('');
        showMessage('success', '添加成功');
      } else {
        showMessage('error', data.error);
      }
    } catch {
      showMessage('error', '添加失败');
    }
    setLoading(false);
  };

  // 更新右上标签
  const handleUpdateFeatured = async (id: string) => {
    if (!editingFeaturedName.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/featured-options', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name: editingFeaturedName.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setFeaturedOptions(featuredOptions.map(o => o.id === id ? data.data : o));
        setEditingFeatured(null);
        showMessage('success', '更新成功');
      } else {
        showMessage('error', data.error);
      }
    } catch {
      showMessage('error', '更新失败');
    }
    setLoading(false);
  };

  // 删除右上标签
  const handleDeleteFeatured = async (id: string) => {
    if (!confirm('确定要删除这个标签吗？')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/featured-options?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setFeaturedOptions(featuredOptions.filter(o => o.id !== id));
        showMessage('success', '删除成功');
      } else {
        showMessage('error', data.error);
      }
    } catch {
      showMessage('error', '删除失败');
    }
    setLoading(false);
  };

  // ========== 右下标签操作 ==========

  // 添加右下标签
  const handleAddFeaturedRightBottom = async () => {
    if (!newFeaturedRightBottom.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/featured-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'featured_right_bottom', name: newFeaturedRightBottom.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setFeaturedRightBottomOptions([...featuredRightBottomOptions, data.data]);
        setNewFeaturedRightBottom('');
        showMessage('success', '添加成功');
      } else {
        showMessage('error', data.error);
      }
    } catch {
      showMessage('error', '添加失败');
    }
    setLoading(false);
  };

  // 更新右下标签
  const handleUpdateFeaturedRightBottom = async (id: string) => {
    if (!editingFeaturedRightBottomName.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/featured-options', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name: editingFeaturedRightBottomName.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setFeaturedRightBottomOptions(featuredRightBottomOptions.map(o => o.id === id ? data.data : o));
        setEditingFeaturedRightBottom(null);
        showMessage('success', '更新成功');
      } else {
        showMessage('error', data.error);
      }
    } catch {
      showMessage('error', '更新失败');
    }
    setLoading(false);
  };

  // 删除右下标签
  const handleDeleteFeaturedRightBottom = async (id: string) => {
    if (!confirm('确定要删除这个标签吗？')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/featured-options?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setFeaturedRightBottomOptions(featuredRightBottomOptions.filter(o => o.id !== id));
        showMessage('success', '删除成功');
      } else {
        showMessage('error', data.error);
      }
    } catch {
      showMessage('error', '删除失败');
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">标签管理</h1>
      
      {message && (
        <div className={`mb-4 p-3 rounded ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 普通标签 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">普通标签</CardTitle>
            <CardDescription>用于产品分类筛选</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="输入标签名称"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
              />
              <Button onClick={handleAddTag} disabled={loading || !newTag.trim()}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {tags.map(tag => (
                <div key={tag.id} className="flex items-center justify-between p-2 bg-muted rounded">
                  <span>{tag.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteTag(tag.id)}
                    disabled={loading}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 右上标签 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">右上标签</CardTitle>
            <CardDescription>显示在图片右上角</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="输入标签名称"
                value={newFeatured}
                onChange={(e) => setNewFeatured(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddFeatured()}
              />
              <Button onClick={handleAddFeatured} disabled={loading || !newFeatured.trim()}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {featuredOptions.map(option => (
                <div key={option.id} className="flex items-center justify-between p-2 bg-muted rounded">
                  {editingFeatured === option.id ? (
                    <>
                      <Input
                        value={editingFeaturedName}
                        onChange={(e) => setEditingFeaturedName(e.target.value)}
                        className="flex-1 mr-2"
                        autoFocus
                      />
                      <Button size="sm" onClick={() => handleUpdateFeatured(option.id)}>
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingFeatured(null)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <span className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-orange-100">右上</Badge>
                        {option.name}
                      </span>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingFeatured(option.id);
                            setEditingFeaturedName(option.name);
                          }}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteFeatured(option.id)}
                          disabled={loading}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 右下标签 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">右下标签</CardTitle>
            <CardDescription>显示在图片右下角</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="输入标签名称"
                value={newFeaturedRightBottom}
                onChange={(e) => setNewFeaturedRightBottom(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddFeaturedRightBottom()}
              />
              <Button onClick={handleAddFeaturedRightBottom} disabled={loading || !newFeaturedRightBottom.trim()}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {featuredRightBottomOptions.map(option => (
                <div key={option.id} className="flex items-center justify-between p-2 bg-muted rounded">
                  {editingFeaturedRightBottom === option.id ? (
                    <>
                      <Input
                        value={editingFeaturedRightBottomName}
                        onChange={(e) => setEditingFeaturedRightBottomName(e.target.value)}
                        className="flex-1 mr-2"
                        autoFocus
                      />
                      <Button size="sm" onClick={() => handleUpdateFeaturedRightBottom(option.id)}>
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingFeaturedRightBottom(null)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <span className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-green-100">右下</Badge>
                        {option.name}
                      </span>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingFeaturedRightBottom(option.id);
                            setEditingFeaturedRightBottomName(option.name);
                          }}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteFeaturedRightBottom(option.id)}
                          disabled={loading}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
