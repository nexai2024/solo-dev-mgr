"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, ExternalLink, Github, GitBranch, Star } from "lucide-react";
import { getRepositories, createRepository, updateRepository, deleteRepository } from "@/lib/actions/repository.actions";
import { Repository, RepositoryPlatform } from "@/types";

interface RepositoryListProps {
  appId: string;
}

const RepositoryList = ({ appId }: RepositoryListProps) => {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingRepo, setEditingRepo] = useState<Repository | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    platform: "github" as RepositoryPlatform,
    is_primary: false,
  });

  const fetchRepositories = async () => {
    try {
      setLoading(true);
      const data = await getRepositories(appId);
      setRepositories(data);
    } catch (error) {
      console.error("Failed to fetch repositories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepositories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appId]);

  const getPlatformIcon = (platform: RepositoryPlatform) => {
    switch (platform) {
      case "github":
        return <Github className="w-5 h-5" />;
      case "gitlab":
        return <GitBranch className="w-5 h-5" />;
      case "bitbucket":
        return <GitBranch className="w-5 h-5" />;
      default:
        return <GitBranch className="w-5 h-5" />;
    }
  };

  const getPlatformColor = (platform: RepositoryPlatform) => {
    switch (platform) {
      case "github":
        return "text-gray-800";
      case "gitlab":
        return "text-orange-600";
      case "bitbucket":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createRepository({
        app_id: appId,
        ...formData,
      });
      await fetchRepositories();
      setIsAddDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Failed to create repository:", error);
      alert("Failed to link repository. Please try again.");
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRepo) return;

    try {
      await updateRepository(editingRepo.id, {
        name: formData.name,
        url: formData.url,
        platform: formData.platform,
        is_primary: formData.is_primary,
      });
      await fetchRepositories();
      setEditingRepo(null);
      resetForm();
    } catch (error) {
      console.error("Failed to update repository:", error);
      alert("Failed to update repository. Please try again.");
    }
  };

  const handleDelete = async (repoId: string) => {
    if (!confirm("Are you sure you want to remove this repository link?")) {
      return;
    }

    try {
      await deleteRepository(repoId);
      await fetchRepositories();
    } catch (error) {
      console.error("Failed to delete repository:", error);
      alert("Failed to delete repository. Please try again.");
    }
  };

  const openEditDialog = (repo: Repository) => {
    setEditingRepo(repo);
    setFormData({
      name: repo.name,
      url: repo.url,
      platform: repo.platform,
      is_primary: repo.is_primary,
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      url: "",
      platform: "github",
      is_primary: false,
    });
  };

  if (loading) {
    return <div className="text-center py-8">Loading repositories...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Linked Repositories</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Add Repository
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Link Repository</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <Label htmlFor="name">Repository Name</Label>
                <Input
                  id="name"
                  placeholder="frontend, api, backend"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="url">Repository URL</Label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://github.com/username/repo"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="platform">Platform</Label>
                <Select
                  value={formData.platform}
                  onValueChange={(value) =>
                    setFormData({ ...formData, platform: value as RepositoryPlatform })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="github">GitHub</SelectItem>
                    <SelectItem value="gitlab">GitLab</SelectItem>
                    <SelectItem value="bitbucket">Bitbucket</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_primary"
                  checked={formData.is_primary}
                  onChange={(e) => setFormData({ ...formData, is_primary: e.target.checked })}
                />
                <Label htmlFor="is_primary">Mark as primary repository</Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Repository</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {repositories.length === 0 ? (
        <div className="text-center py-8 border rounded-lg">
          <GitBranch className="w-12 h-12 mx-auto text-gray-400 mb-2" />
          <p className="text-gray-500">No repositories linked yet</p>
          <p className="text-sm text-gray-400">Click &quot;Add Repository&quot; to link your first repository</p>
        </div>
      ) : (
        <div className="space-y-2">
          {repositories.map((repo) => (
            <div key={repo.id} className="border rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={getPlatformColor(repo.platform)}>
                  {getPlatformIcon(repo.platform)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold">{repo.name}</p>
                    {repo.is_primary && (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-yellow-50 text-yellow-700 rounded text-xs font-medium">
                        <Star className="w-3 h-3" />
                        Primary
                      </span>
                    )}
                  </div>
                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline flex items-center gap-1 truncate"
                  >
                    {repo.url}
                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                  </a>
                </div>
              </div>
              <div className="flex gap-1 ml-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openEditDialog(repo)}
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(repo.id)}
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingRepo} onOpenChange={(open) => !open && setEditingRepo(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Repository</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div>
              <Label htmlFor="edit_name">Repository Name</Label>
              <Input
                id="edit_name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit_url">Repository URL</Label>
              <Input
                id="edit_url"
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit_platform">Platform</Label>
              <Select
                value={formData.platform}
                onValueChange={(value) =>
                  setFormData({ ...formData, platform: value as RepositoryPlatform })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="github">GitHub</SelectItem>
                  <SelectItem value="gitlab">GitLab</SelectItem>
                  <SelectItem value="bitbucket">Bitbucket</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="edit_is_primary"
                checked={formData.is_primary}
                onChange={(e) => setFormData({ ...formData, is_primary: e.target.checked })}
              />
              <Label htmlFor="edit_is_primary">Mark as primary repository</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setEditingRepo(null)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RepositoryList;
