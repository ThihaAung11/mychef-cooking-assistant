import Navigation from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";
import { preferencesService } from "@/services/preferences.service";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useEffect, useMemo, useRef, useState } from "react";
import { createImagePreview, formatApiError, validateImageFile, getImageUrl } from "@/lib/api-utils";
import { API_CONFIG } from "@/config/api.config";
import { toast } from "@/hooks/use-toast";
import { Loader2, UploadCloud } from "lucide-react";

export default function Profile() {
  const { user, refreshUser, loading: authLoading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadPercent, setUploadPercent] = useState<number>(0);
  const [dragOver, setDragOver] = useState<boolean>(false);
  const [imageLoadError, setImageLoadError] = useState<boolean>(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    name: "",
  });

  const avatarUrl = useMemo(() => {
    if (previewUrl) return previewUrl;
    const raw = (user as any)?.profile_url || user?.profile_image_url;
    if (!raw) return undefined;
    
    let cleaned = typeof raw === 'string' ? raw.trim() : raw;
    cleaned = cleaned.replace(/[?&]$/, '');
    
    if (cleaned.startsWith('http://') || cleaned.startsWith('https://')) {
      return cleaned;
    }
    
    if (API_CONFIG.SUPABASE_URL) {
      const path = cleaned.startsWith('/') ? cleaned : `/${cleaned}`;
      return `${API_CONFIG.SUPABASE_URL}${path}`;
    }
    
    return getImageUrl(cleaned) || undefined;
  }, [previewUrl, user]);

  useEffect(() => {
    setImageLoadError(false);
  }, [avatarUrl]);
  const [prefSaving, setPrefSaving] = useState(false);
  const [prefForm, setPrefForm] = useState({
    language: "en" as "en" | "my",
    spice_level: "medium" as "low" | "medium" | "high" | null,
    diet_type: "omnivore" as "omnivore" | "vegetarian" | "vegan" | null,
    allergies: "",
    preferred_cuisine: "",
    cooking_skill: "beginner" as "beginner" | "intermediate" | "advanced" | null,
  });

  // Prefill form from user
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        email: user.email || "",
        name: user.name || "",
      });
    }
  }, [user]);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["user-stats"],
    queryFn: () => authService.getUserStats(),
    enabled: !!user,
  });

  const { data: prefs, isLoading: prefsLoading } = useQuery({
    queryKey: ["user-preferences"],
    queryFn: () => preferencesService.get(),
    enabled: !!user,
  });

  useEffect(() => {
    if (prefs) {
      setPrefForm({
        language: prefs.language,
        spice_level: prefs.spice_level,
        diet_type: prefs.diet_type,
        allergies: prefs.allergies || "",
        preferred_cuisine: prefs.preferred_cuisine || "",
        cooking_skill: prefs.cooking_skill,
      });
    }
  }, [prefs]);

  const handleFileUpload = async (file?: File) => {
    if (!file) return;

    const valid = validateImageFile(file);
    if (!valid.valid) {
      toast({ title: "Invalid image", description: valid.error, variant: "destructive" });
      return;
    }

    const preview = await createImagePreview(file);
    setPreviewUrl(preview);

    try {
      setUploading(true);
      setUploadPercent(0);
      await authService.uploadProfileImage(file, (p) => setUploadPercent(p));
      toast({ title: "Profile updated", description: "Profile image uploaded successfully." });
      await refreshUser();
      setPreviewUrl(null);
    } catch (err: any) {
      toast({ title: "Upload failed", description: formatApiError(err), variant: "destructive" });
    } finally {
      setUploading(false);
      setUploadPercent(0);
    }
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    await handleFileUpload(file);
  };

  // Show loading state while auth is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-16 md:pt-20 pb-20 md:pb-8">
          <div className="mx-auto w-full max-w-4xl px-4 flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
              <p className="text-muted-foreground">Loading your profile...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-16 md:pt-20 pb-20 md:pb-8">
          <div className="mx-auto w-full max-w-4xl px-4 flex items-center justify-center py-20">
            <Card className="p-8 text-center">
              <h2 className="text-xl font-semibold mb-3">Please Log In</h2>
              <p className="text-sm text-muted-foreground mb-4">You need to be logged in to view your profile.</p>
              <Button asChild>
                <a href="/login">Go to Login</a>
              </Button>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      <main className="pt-16 md:pt-20 pb-20 md:pb-8">
        <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 space-y-6">
          {/* Profile Header Card */}
          <Card className="overflow-hidden">
            {/* Cover Background */}
            <div className="h-32 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent"></div>
            
            {/* Profile Content */}
            <div className="px-6 pb-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 -mt-16 sm:-mt-20">
                {/* Avatar */}
                <div
                  className={`relative ${dragOver ? "ring-4 ring-primary ring-offset-2" : ""} transition-all`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={async (e) => {
                    e.preventDefault();
                    setDragOver(false);
                    const file = e.dataTransfer.files?.[0];
                    await handleFileUpload(file);
                  }}
                >
                  <Avatar className="h-32 w-32 sm:h-36 sm:w-36 border-4 border-background shadow-2xl">
                    <AvatarImage
                      src={avatarUrl}
                      alt={user?.username}
                      onError={() => setImageLoadError(true)}
                      crossOrigin="anonymous"
                      referrerPolicy="no-referrer"
                      className="object-cover"
                    />
                    <AvatarFallback className="text-2xl font-bold bg-white text-black">
                      {user?.username?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  {dragOver && (
                    <div className="absolute inset-0 rounded-full bg-primary/20 flex items-center justify-center">
                      <UploadCloud className="w-10 h-10 text-primary" />
                    </div>
                  )}
                  <Button
                    type="button"
                    size="icon"
                    variant="secondary"
                    className="absolute bottom-0 right-0 h-9 w-9 rounded-full shadow-lg"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    <UploadCloud className="h-4 w-4" />
                  </Button>
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={onFileChange}
                  />
                </div>

                {/* User Info */}
                <div className="flex-1 text-center sm:text-left sm:mt-16">
                  <h1 className="text-lg sm:text-xl font-semibold">{user?.name || user?.username}</h1>
                  <p className="text-sm text-muted-foreground mt-0.5">@{user?.username}</p>
                  <p className="text-xs text-muted-foreground mt-1">{user?.email}</p>
                  {user?.created_at && !isNaN(new Date(user.created_at).getTime()) && (
                    <p className="text-xs text-muted-foreground mt-2 flex items-center justify-center sm:justify-start gap-1">
                      <span>Member since {new Date(user.created_at).toLocaleDateString('en', { month: 'short', year: 'numeric' })}</span>
                    </p>
                  )}
                  
                  {imageLoadError && (
                    <p className="text-xs text-destructive mt-2">Failed to load profile image</p>
                  )}
                  
                  {uploading && (
                    <div className="mt-3">
                      <Progress value={uploadPercent} className="h-1.5" />
                      <p className="text-xs text-muted-foreground mt-1.5">Uploading {uploadPercent}%</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Stats */}
          <Card className="p-5">
            <h2 className="text-sm font-semibold mb-4">Activity Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatItem label="Recipes" value={statsLoading ? "-" : stats?.total_recipes ?? 0} />
              <StatItem label="Saved" value={statsLoading ? "-" : stats?.saved_recipes_count ?? 0} />
              <StatItem label="Sessions" value={statsLoading ? "-" : stats?.cooking_sessions_count ?? 0} />
              <StatItem label="Rating" value={statsLoading ? "-" : (stats?.average_rating ?? 0).toFixed(1)} />
            </div>
          </Card>

          {/* Account Info */}
          <Card className="p-5 space-y-4">
            <h2 className="text-sm font-semibold">Account Information</h2>
            <form
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                setSaving(true);
                try {
                  await authService.updateProfile({
                    username: formData.username,
                    email: formData.email,
                    name: formData.name,
                  });
                  toast({ title: "Profile saved", description: "Your profile has been updated." });
                  await refreshUser();
                } catch (err: any) {
                  toast({ title: "Save failed", description: formatApiError(err), variant: "destructive" });
                } finally {
                  setSaving(false);
                }
              }}
            >
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData((f) => ({ ...f, username: e.target.value }))}
                    disabled={saving}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData((f) => ({ ...f, email: e.target.value }))}
                    disabled={saving}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
                  disabled={saving}
                />
              </div>
              <div className="flex items-center justify-between pt-2">
                <div className="text-xs text-muted-foreground">Member since {user ? new Date(user.created_at).toLocaleDateString() : "-"}</div>
                <Button type="submit" disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Save Changes
                </Button>
              </div>
            </form>
          </Card>

          {/* Preferences */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Cooking Preferences</h2>
              {prefsLoading && (
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin" /> Loading
                </div>
              )}
            </div>

            <form
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                setPrefSaving(true);
                try {
                  await preferencesService.update({
                    language: prefForm.language,
                    spice_level: prefForm.spice_level,
                    diet_type: prefForm.diet_type,
                    allergies: prefForm.allergies || null,
                    preferred_cuisine: prefForm.preferred_cuisine || null,
                    cooking_skill: prefForm.cooking_skill,
                  });
                  toast({ title: "Preferences saved", description: "Your preferences have been updated." });
                } catch (err: any) {
                  toast({ title: "Save failed", description: formatApiError(err), variant: "destructive" });
                } finally {
                  setPrefSaving(false);
                }
              }}
            >
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="language">Language</Label>
                  <select
                    id="language"
                    className="mt-1 w-full h-10 rounded-md border bg-background px-3 text-sm"
                    value={prefForm.language}
                    onChange={(e) => setPrefForm((f) => ({ ...f, language: e.target.value as any }))}
                    disabled={prefSaving}
                  >
                    <option value="en">English</option>
                    <option value="my">Burmese</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="spice_level">Spice Level</Label>
                  <select
                    id="spice_level"
                    className="mt-1 w-full h-10 rounded-md border bg-background px-3 text-sm"
                    value={prefForm.spice_level}
                    onChange={(e) => setPrefForm((f) => ({ ...f, spice_level: e.target.value as any }))}
                    disabled={prefSaving}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="diet_type">Diet Type</Label>
                  <select
                    id="diet_type"
                    className="mt-1 w-full h-10 rounded-md border bg-background px-3 text-sm"
                    value={prefForm.diet_type}
                    onChange={(e) => setPrefForm((f) => ({ ...f, diet_type: e.target.value as any }))}
                    disabled={prefSaving}
                  >
                    <option value="omnivore">Omnivore</option>
                    <option value="vegetarian">Vegetarian</option>
                    <option value="vegan">Vegan</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="cooking_skill">Cooking Skill</Label>
                  <select
                    id="cooking_skill"
                    className="mt-1 w-full h-10 rounded-md border bg-background px-3 text-sm"
                    value={prefForm.cooking_skill}
                    onChange={(e) => setPrefForm((f) => ({ ...f, cooking_skill: e.target.value as any }))}
                    disabled={prefSaving}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="preferred_cuisine">Preferred Cuisine</Label>
                <Input
                  id="preferred_cuisine"
                  placeholder="e.g., Burmese, Thai"
                  value={prefForm.preferred_cuisine}
                  onChange={(e) => setPrefForm((f) => ({ ...f, preferred_cuisine: e.target.value }))}
                  disabled={prefSaving}
                />
              </div>

              <div>
                <Label htmlFor="allergies">Allergies</Label>
                <Input
                  id="allergies"
                  placeholder="e.g., peanuts, shellfish"
                  value={prefForm.allergies}
                  onChange={(e) => setPrefForm((f) => ({ ...f, allergies: e.target.value }))}
                  disabled={prefSaving}
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={prefSaving}>
                  {prefSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Save Preferences
                </Button>
              </div>
            </form>
          </Card>
          
          {/* Change Password */}
          <Card className="p-5 space-y-4">
            <h2 className="text-sm font-semibold">Security</h2>
            <ChangePasswordForm />
          </Card>
        </div>
      </main>
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border p-3 text-center hover:bg-muted/50 transition-colors">
      <div className="text-lg font-bold text-primary">{value}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
    </div>
  );
}

function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({ title: "Missing fields", description: "Please fill in all fields.", variant: "destructive" });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: "Weak password", description: "New password must be at least 6 characters.", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Password mismatch", description: "New password and confirmation do not match.", variant: "destructive" });
      return;
    }

    try {
      setSubmitting(true);
      await authService.changePassword({ current_password: currentPassword, new_password: newPassword });
      toast({ title: "Password updated", description: "Your password has been changed successfully." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast({ title: "Change failed", description: formatApiError(err), variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="current_password">Current Password</Label>
          <Input id="current_password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} disabled={submitting} required />
        </div>
        <div>
          <Label htmlFor="new_password">New Password</Label>
          <Input id="new_password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} disabled={submitting} required />
        </div>
        <div>
          <Label htmlFor="confirm_password">Confirm New Password</Label>
          <Input id="confirm_password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={submitting} required />
        </div>
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={submitting}>
          {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Update Password
        </Button>
      </div>
    </form>
  );
}
