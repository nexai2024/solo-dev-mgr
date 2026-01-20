"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff, Copy, Edit, Trash2, Plus } from "lucide-react";
import { getEnvVars, createEnvVar, updateEnvVar, deleteEnvVar } from "@/lib/actions/env-var.actions";
import { EnvironmentVariable, Environment } from "@/types";

interface EnvVarListProps {
  appId: string;
}

interface GroupedEnvVars {
  development: EnvironmentVariable[];
  staging: EnvironmentVariable[];
  production: EnvironmentVariable[];
}

const EnvVarList = ({ appId }: EnvVarListProps) => {
  const [envVars, setEnvVars] = useState<GroupedEnvVars>({
    development: [],
    staging: [],
    production: [],
  });
  const [loading, setLoading] = useState(true);
  const [revealedVars, setRevealedVars] = useState<Set<string>>(new Set());
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingVar, setEditingVar] = useState<EnvironmentVariable | null>(null);

  // Form state for add/edit
  const [formData, setFormData] = useState({
    key_name: "",
    value: "",
    environment: "development" as Environment,
    is_sensitive: true,
  });

  const fetchEnvVars = async () => {
    try {
      setLoading(true);
      const data = await getEnvVars(appId);
      setEnvVars(data);
    } catch (error) {
      console.error("Failed to fetch environment variables:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnvVars();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appId]);

  const toggleReveal = (varId: string) => {
    setRevealedVars((prev) => {
      const next = new Set(prev);
      if (next.has(varId)) {
        next.delete(varId);
      } else {
        next.add(varId);
      }
      return next;
    });
  };

  const copyToClipboard = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      alert("Copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createEnvVar({
        app_id: appId,
        ...formData,
      });
      await fetchEnvVars();
      setIsAddDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Failed to create env var:", error);
      alert("Failed to create environment variable. Please try again.");
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVar) return;

    try {
      await updateEnvVar(editingVar.id, {
        key_name: formData.key_name,
        value: formData.value,
        is_sensitive: formData.is_sensitive,
      });
      await fetchEnvVars();
      setEditingVar(null);
      resetForm();
    } catch (error) {
      console.error("Failed to update env var:", error);
      alert("Failed to update environment variable. Please try again.");
    }
  };

  const handleDelete = async (varId: string) => {
    if (!confirm("Are you sure you want to delete this environment variable?")) {
      return;
    }

    try {
      await deleteEnvVar(varId);
      await fetchEnvVars();
    } catch (error) {
      console.error("Failed to delete env var:", error);
      alert("Failed to delete environment variable. Please try again.");
    }
  };

  const openEditDialog = (envVar: EnvironmentVariable) => {
    setEditingVar(envVar);
    setFormData({
      key_name: envVar.key_name,
      value: envVar.value,
      environment: envVar.environment,
      is_sensitive: envVar.is_sensitive,
    });
  };

  const resetForm = () => {
    setFormData({
      key_name: "",
      value: "",
      environment: "development",
      is_sensitive: true,
    });
  };

  const renderEnvVarSection = (environment: Environment, vars: EnvironmentVariable[]) => {
    const envLabels = {
      development: "Development",
      staging: "Staging",
      production: "Production",
    };

    const envColors = {
      development: "bg-blue-50 text-blue-700",
      staging: "bg-purple-50 text-purple-700",
      production: "bg-green-50 text-green-700",
    };

    return (
      <div key={environment} className="border rounded-lg p-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <span className={`px-2 py-1 rounded text-xs ${envColors[environment]}`}>
            {envLabels[environment]}
          </span>
          <span className="text-sm text-gray-500">({vars.length} variables)</span>
        </h3>
        {vars.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No variables set for this environment</p>
        ) : (
          <div className="space-y-2">
            {vars.map((envVar) => {
              const isRevealed = revealedVars.has(envVar.id);
              const displayValue = isRevealed ? envVar.value : "•".repeat(20);

              return (
                <div key={envVar.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-sm font-medium">{envVar.key_name}</p>
                    <p className="font-mono text-xs text-gray-600 truncate">{displayValue}</p>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleReveal(envVar.id)}
                      title={isRevealed ? "Hide" : "Reveal"}
                    >
                      {isRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(envVar.value)}
                      title="Copy"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(envVar)}
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(envVar.id)}
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return <div className="text-center py-8">Loading environment variables...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Environment Variables</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Add Variable
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Environment Variable</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <Label htmlFor="environment">Environment</Label>
                <Select
                  value={formData.environment}
                  onValueChange={(value) =>
                    setFormData({ ...formData, environment: value as Environment })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="staging">Staging</SelectItem>
                    <SelectItem value="production">Production</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="key_name">Key Name</Label>
                <Input
                  id="key_name"
                  placeholder="DATABASE_URL"
                  value={formData.key_name}
                  onChange={(e) => setFormData({ ...formData, key_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="value">Value</Label>
                <Input
                  id="value"
                  type="text"
                  placeholder="Enter value"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  required
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_sensitive"
                  checked={formData.is_sensitive}
                  onChange={(e) => setFormData({ ...formData, is_sensitive: e.target.checked })}
                />
                <Label htmlFor="is_sensitive">Mark as sensitive (hidden by default)</Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Variable</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {renderEnvVarSection("development", envVars.development)}
        {renderEnvVarSection("staging", envVars.staging)}
        {renderEnvVarSection("production", envVars.production)}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingVar} onOpenChange={(open) => !open && setEditingVar(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Environment Variable</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div>
              <Label>Environment</Label>
              <p className="text-sm text-gray-600 capitalize">{formData.environment}</p>
            </div>
            <div>
              <Label htmlFor="edit_key_name">Key Name</Label>
              <Input
                id="edit_key_name"
                value={formData.key_name}
                onChange={(e) => setFormData({ ...formData, key_name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit_value">Value</Label>
              <Input
                id="edit_value"
                type="text"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                required
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="edit_is_sensitive"
                checked={formData.is_sensitive}
                onChange={(e) => setFormData({ ...formData, is_sensitive: e.target.checked })}
              />
              <Label htmlFor="edit_is_sensitive">Mark as sensitive (hidden by default)</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setEditingVar(null)}>
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

export default EnvVarList;
