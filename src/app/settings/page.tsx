"use client";

import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Settings,
  Building,
  User,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Save,
  Upload,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useAuthStore } from "@/store/auth.store";
import { authService } from "@/services/auth.service";

const BUSINESS_CATEGORIES = [
  "Retail & Boutique",
  "Food & Restaurant / Cafe",
  "Beauty, Salon & Wellness",
  "Healthcare & Clinic",
  "Education & Coaching",
  "Handmade & Artisanal",
  "Local Professional Services",
  "Real Estate & Property",
  "Home Services & Repairs",
  "Other Local Business",
];

const MARKETING_GOALS = [
  "Get more customer enquiries",
  "Increase local brand awareness",
  "Drive more store footfall / visits",
  "Boost repeat orders / retention",
  "Build online reviews & reputation",
  "Grow social media following",
];

const CHANNELS = [
  "Instagram",
  "WhatsApp Business",
  "Google Business Profile",
  "Facebook",
  "YouTube / Shorts",
  "Email / Newsletter",
  "Other",
];

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const { user, organization, updateUser, updateOrganization } = useAuthStore();

  const [userName, setUserName] = useState(user?.name || "");
  const [orgForm, setOrgForm] = useState({
    name: organization?.name || "",
    category: organization?.category || "Retail & Boutique",
    serviceArea: organization?.serviceArea || "",
    primaryGoal: organization?.primaryGoal || "Get more customer enquiries",
    primaryChannel: organization?.primaryChannel || "Instagram",
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user) setUserName(user.name);
    if (organization) {
      setOrgForm({
        name: organization.name,
        category: organization.category,
        serviceArea: organization.serviceArea || "",
        primaryGoal: organization.primaryGoal || "Get more customer enquiries",
        primaryChannel: organization.primaryChannel || "Instagram",
      });
    }
    // Check dummy logo from localStorage
    if (typeof window !== "undefined") {
      const savedLogo = localStorage.getItem("digigrowth_business_logo");
      if (savedLogo) setLogoPreview(savedLogo);
    }
  }, [user, organization]);

  const updateProfileMutation = useMutation({
    mutationFn: () => authService.updateProfile({ name: userName }),
    onSuccess: (data) => {
      updateUser({ name: userName });
      setNotification("User profile updated successfully!");
      setTimeout(() => setNotification(null), 3000);
    },
    onError: (err: any) => {
      setErrorMessage(err.message || "Failed to update profile");
    },
  });

  const updateOrgMutation = useMutation({
    mutationFn: () => authService.updateOrganization(orgForm),
    onSuccess: (data) => {
      updateOrganization(orgForm);
      setNotification("Business workspace settings saved successfully!");
      setTimeout(() => setNotification(null), 3000);
    },
    onError: (err: any) => {
      setErrorMessage(err.message || "Failed to update business workspace");
    },
  });

  // Dummy file upload stored locally (per user request)
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setLogoPreview(base64);
        if (typeof window !== "undefined") {
          localStorage.setItem("digigrowth_business_logo", base64);
        }
        setNotification("Business logo uploaded & saved locally!");
        setTimeout(() => setNotification(null), 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="Business & Account Settings"
        description="Update your business identity, target marketing channels, and profile credentials."
      />

      {notification && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{notification}</span>
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span className="font-semibold">{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Business Profile Form (2 spans) */}
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-600" />
                <div>
                  <CardTitle>Business Workspace Identity</CardTitle>
                  <span className="text-xs text-slate-500">
                    Shapes your tailored learning paths and automated recommendations.
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  updateOrgMutation.mutate();
                }}
                className="space-y-4"
              >
                <Input
                  label="Registered Business Name"
                  required
                  value={orgForm.name}
                  onChange={(e) =>
                    setOrgForm({ ...orgForm, name: e.target.value })
                  }
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Business Category"
                    value={orgForm.category}
                    onChange={(e) =>
                      setOrgForm({ ...orgForm, category: e.target.value })
                    }
                  >
                    {BUSINESS_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </Select>

                  <Select
                    label="Primary Focus Channel"
                    value={orgForm.primaryChannel}
                    onChange={(e) =>
                      setOrgForm({ ...orgForm, primaryChannel: e.target.value })
                    }
                  >
                    {CHANNELS.map((ch) => (
                      <option key={ch} value={ch}>
                        {ch}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Primary Growth Objective"
                    value={orgForm.primaryGoal}
                    onChange={(e) =>
                      setOrgForm({ ...orgForm, primaryGoal: e.target.value })
                    }
                  >
                    {MARKETING_GOALS.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </Select>

                  <Input
                    label="Service Area / City"
                    placeholder="e.g. Indiranagar & 5km radius"
                    value={orgForm.serviceArea}
                    onChange={(e) =>
                      setOrgForm({ ...orgForm, serviceArea: e.target.value })
                    }
                  />
                </div>

                <div className="pt-3 flex justify-end">
                  <Button
                    type="submit"
                    isLoading={updateOrgMutation.isPending}
                    leftIcon={<Save className="w-4 h-4" />}
                  >
                    Save Business Info
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* User Account Details */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                <div>
                  <CardTitle>Owner Account</CardTitle>
                  <span className="text-xs text-slate-500">
                    Your login and administrative contact.
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  updateProfileMutation.mutate();
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    required
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                  />

                  <Input
                    label="Email Address"
                    disabled
                    value={user?.email || ""}
                    helperText="Email is unique and locked to your workspace account"
                  />
                </div>

                <div className="pt-3 flex justify-end">
                  <Button
                    type="submit"
                    isLoading={updateProfileMutation.isPending}
                    leftIcon={<Save className="w-4 h-4" />}
                  >
                    Update Account
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Dummy Media / Logo Upload (per user spec) */}
        <div>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-blue-600" />
                <CardTitle>Business Logo / Media</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-slate-500">
                Upload your shop logo or storefront image for branding.
              </p>

              <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                {logoPreview ? (
                  <div className="space-y-3 text-center">
                    <img
                      src={logoPreview}
                      alt="Business Logo"
                      className="w-24 h-24 object-cover rounded-xl shadow-md mx-auto"
                    />
                    <div className="text-[11px] text-emerald-600 font-semibold">
                      ✓ Logo Stored in Local Storage
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-2">
                    <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-xs text-slate-500 font-medium">
                      Select PNG, JPG, or SVG
                    </p>
                  </div>
                )}

                <label className="mt-4 cursor-pointer">
                  <span className="inline-flex items-center justify-center px-4 py-2 border border-slate-300 shadow-xs text-xs font-semibold rounded-lg text-slate-700 bg-white hover:bg-slate-50">
                    Choose Local File
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
