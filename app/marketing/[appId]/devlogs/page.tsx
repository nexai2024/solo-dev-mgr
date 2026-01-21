'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getDevLogs, createDevLog, updateDevLog, deleteDevLog } from '@/lib/actions/marketing.actions';
import { generateAutoDevLog } from '@/lib/actions/marketing-ai.actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, Edit, Trash2, Sparkles, Eye } from 'lucide-react';
import { toast } from 'sonner';
import type { DevLog } from '@/types';

export default function DevLogsPage() {
  const params = useParams();
  const appId = params.appId as string;

  const [devlogs, setDevlogs] = useState<DevLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDevlog, setEditingDevlog] = useState<DevLog | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    milestone_name: '',
    milestone_progress: 0,
    tags: '',
    is_published: false,
  });

  useEffect(() => {
    loadDevLogs();
  }, [appId]);

  const loadDevLogs = async () => {
    setLoading(true);
    const result = await getDevLogs(appId);
    if (result.success && result.data) {
      setDevlogs(result.data);
    } else {
      toast.error('Failed to load devlogs');
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      ...formData,
      marketing_app_id: appId,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      published_at: formData.is_published ? new Date().toISOString() : null,
      auto_generated: false,
      content_html: null,
      source_data: null,
    };

    try {
      let result;
      if (editingDevlog) {
        result = await updateDevLog(editingDevlog.id, data);
      } else {
        result = await createDevLog(data);
      }

      if (result.success) {
        toast.success(editingDevlog ? 'DevLog updated!' : 'DevLog created!');
        setIsDialogOpen(false);
        resetForm();
        loadDevLogs();
      } else {
        toast.error(result.error || 'Failed to save devlog');
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleEdit = (devlog: DevLog) => {
    setEditingDevlog(devlog);
    setFormData({
      title: devlog.title,
      content: devlog.content,
      milestone_name: devlog.milestone_name || '',
      milestone_progress: devlog.milestone_progress,
      tags: devlog.tags.join(', '),
      is_published: devlog.is_published,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this devlog?')) return;

    const result = await deleteDevLog(id);
    if (result.success) {
      toast.success('DevLog deleted');
      loadDevLogs();
    } else {
      toast.error(result.error || 'Failed to delete devlog');
    }
  };

  const handleAIGenerate = async () => {
    setIsGenerating(true);
    try {
      const result = await generateAutoDevLog({
        sourceType: 'manual',
        sourceData: { note: 'User requested AI generation' },
        appName: 'Your App', // Would come from context
      });

      setFormData({
        title: result.title,
        content: result.content,
        milestone_name: result.milestone_name || '',
        milestone_progress: result.milestone_progress,
        tags: result.tags.join(', '),
        is_published: false,
      });

      toast.success('AI-generated devlog ready!');
    } catch (error: any) {
      toast.error('Failed to generate devlog: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      milestone_name: '',
      milestone_progress: 0,
      tags: '',
      is_published: false,
    });
    setEditingDevlog(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Build in Public - DevLogs</h1>
          <p className="text-muted-foreground">Share your development journey with your audience</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              New DevLog
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingDevlog ? 'Edit DevLog' : 'Create DevLog'}</DialogTitle>
              <DialogDescription>
                Share what you've been working on with your community
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="What did you build this week?"
                  required
                />
              </div>

              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Share the details of your progress..."
                  rows={10}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="milestone_name">Milestone</Label>
                  <Input
                    id="milestone_name"
                    value={formData.milestone_name}
                    onChange={(e) => setFormData({ ...formData, milestone_name: e.target.value })}
                    placeholder="e.g., Alpha Build"
                  />
                </div>
                <div>
                  <Label htmlFor="milestone_progress">Progress (%)</Label>
                  <Input
                    id="milestone_progress"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.milestone_progress}
                    onChange={(e) => setFormData({ ...formData, milestone_progress: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="gamedev, indiedev, unity"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_published"
                  checked={formData.is_published}
                  onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="is_published">Publish immediately</Label>
              </div>

              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAIGenerate}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      AI Generate
                    </>
                  )}
                </Button>
                <Button type="submit">
                  {editingDevlog ? 'Update' : 'Create'} DevLog
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {devlogs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No devlogs yet. Start building in public!</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First DevLog
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {devlogs.map((devlog) => (
            <Card key={devlog.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {devlog.title}
                      {devlog.is_published ? (
                        <Badge variant="default">
                          <Eye className="w-3 h-3 mr-1" />
                          Published
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Draft</Badge>
                      )}
                      {devlog.auto_generated && (
                        <Badge variant="outline">
                          <Sparkles className="w-3 h-3 mr-1" />
                          AI
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                      {new Date(devlog.created_at).toLocaleDateString()} • {devlog.view_count} views
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(devlog)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(devlog.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap mb-4">{devlog.content.slice(0, 300)}...</p>

                {devlog.milestone_name && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="font-medium">{devlog.milestone_name}</span>
                      <span className="text-muted-foreground">{devlog.milestone_progress}%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${devlog.milestone_progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {devlog.tags.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {devlog.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
