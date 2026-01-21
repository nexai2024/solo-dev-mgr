"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2, Package } from "lucide-react";
import { getDeployments, createDeployment, updateDeployment, deleteDeployment } from "@/lib/actions/deployment.actions";
import { Deployment } from "@/types";

interface DeploymentListProps {
  appId: string;
}

const DeploymentList = ({ appId }: DeploymentListProps) => {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingDeployment, setEditingDeployment] = useState<Deployment | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    version: "",
    deployed_at: "",
    notes: "",
  });

  const fetchDeployments = async () => {
    try {
      setLoading(true);
      const data = await getDeployments(appId);
      setDeployments(data);
    } catch (error) {
      console.error("Failed to fetch deployments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeployments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appId]);

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createDeployment({
        app_id: appId,
        version: formData.version,
        deployed_at: new Date(formData.deployed_at).toISOString(),
        notes: formData.notes || null,
      });
      await fetchDeployments();
      setIsAddDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Failed to create deployment:", error);
      alert("Failed to record deployment. Please try again.");
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDeployment) return;

    try {
      await updateDeployment(editingDeployment.id, {
        version: formData.version,
        notes: formData.notes || null,
      });
      await fetchDeployments();
      setEditingDeployment(null);
      resetForm();
    } catch (error) {
      console.error("Failed to update deployment:", error);
      alert("Failed to update deployment. Please try again.");
    }
  };

  const handleDelete = async (deploymentId: string) => {
    if (!confirm("Are you sure you want to delete this deployment record?")) {
      return;
    }

    try {
      await deleteDeployment(deploymentId);
      await fetchDeployments();
    } catch (error) {
      console.error("Failed to delete deployment:", error);
      alert("Failed to delete deployment. Please try again.");
    }
  };

  const openEditDialog = (deployment: Deployment) => {
    setEditingDeployment(deployment);
    setFormData({
      version: deployment.version,
      deployed_at: new Date(deployment.deployed_at).toISOString().slice(0, 16),
      notes: deployment.notes || "",
    });
  };

  const resetForm = () => {
    setFormData({
      version: "",
      deployed_at: "",
      notes: "",
    });
  };

  if (loading) {
    return <div className="text-center py-8">Loading deployment history...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Deployment History</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Record Deployment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Deployment</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <Label htmlFor="version">Version</Label>
                <Input
                  id="version"
                  placeholder="v1.2.3 or 1.2.3"
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="deployed_at">Deployment Date & Time</Label>
                <Input
                  id="deployed_at"
                  type="datetime-local"
                  value={formData.deployed_at}
                  onChange={(e) => setFormData({ ...formData, deployed_at: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes (optional)</Label>
                <textarea
                  id="notes"
                  className="w-full min-h-[100px] px-3 py-2 border rounded-md"
                  placeholder="What changed in this deployment?"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Record Deployment</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {deployments.length === 0 ? (
        <div className="text-center py-8 border rounded-lg">
          <Package className="w-12 h-12 mx-auto text-gray-400 mb-2" />
          <p className="text-gray-500">No deployments recorded yet</p>
          <p className="text-sm text-gray-400">Click &quot;Record Deployment&quot; to add your first deployment</p>
        </div>
      ) : (
        <div className="space-y-4">
          {deployments.map((deployment, index) => (
            <div key={deployment.id} className="relative pl-8 pb-6">
              {/* Timeline line */}
              {index < deployments.length - 1 && (
                <div className="absolute left-2 top-6 bottom-0 w-0.5 bg-gray-200" />
              )}

              {/* Timeline dot */}
              <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-blue-500 border-2 border-white" />

              {/* Deployment card */}
              <div className="border rounded-lg p-4 bg-white shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-bold text-lg">{deployment.version}</span>
                      <span className="text-sm text-gray-500">
                        {formatDateTime(deployment.deployed_at)}
                      </span>
                    </div>
                    {deployment.notes && (
                      <p className="text-sm text-gray-700 whitespace-pre-wrap mt-2">{deployment.notes}</p>
                    )}
                  </div>
                  <div className="flex gap-1 ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(deployment)}
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(deployment.id)}
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingDeployment} onOpenChange={(open) => !open && setEditingDeployment(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Deployment</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div>
              <Label htmlFor="edit_version">Version</Label>
              <Input
                id="edit_version"
                value={formData.version}
                onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit_notes">Notes (optional)</Label>
              <textarea
                id="edit_notes"
                className="w-full min-h-[100px] px-3 py-2 border rounded-md"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setEditingDeployment(null)}>
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

export default DeploymentList;
