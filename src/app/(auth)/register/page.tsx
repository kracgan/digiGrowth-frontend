"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TrendingUp, AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";

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

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    businessName: "",
    category: "Retail & Boutique",
    serviceArea: "",
    primaryGoal: "Get more customer enquiries",
    primaryChannel: "Instagram",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const data = await authService.register(formData);
      setAuth(data.user, data.organization, data.accessToken);
      router.push("/");
    } catch (err: any) {
      // Rule: Always display error message from the api response only
      setErrorMessage(err.message || "Failed to create account.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/30 mb-4">
          <TrendingUp className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white">
          Create Your Business Workspace
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Get practical lessons, content planner, and monthly growth tracking.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-8 shadow-2xl rounded-2xl border border-slate-100">
          {errorMessage && (
            <div className="mb-6 p-3.5 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="font-medium">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Your Name"
                required
                placeholder="Rohan Patel"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
              <Input
                label="Email Address"
                type="email"
                required
                placeholder="rohan@artisanbakes.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Business Name"
                required
                placeholder="Artisan Bakery & Cafe"
                value={formData.businessName}
                onChange={(e) =>
                  setFormData({ ...formData, businessName: e.target.value })
                }
              />
              <Input
                label="Password"
                type="password"
                required
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Business Category"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
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
                value={formData.primaryChannel}
                onChange={(e) =>
                  setFormData({ ...formData, primaryChannel: e.target.value })
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
                label="Primary Marketing Goal"
                value={formData.primaryGoal}
                onChange={(e) =>
                  setFormData({ ...formData, primaryGoal: e.target.value })
                }
              >
                {MARKETING_GOALS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </Select>

              <Input
                label="City / Service Area (Optional)"
                placeholder="Indiranagar & 5km radius"
                value={formData.serviceArea}
                onChange={(e) =>
                  setFormData({ ...formData, serviceArea: e.target.value })
                }
              />
            </div>

            <Button
              type="submit"
              className="w-full mt-4"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Start Free Workspace
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-600">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-blue-600 hover:text-blue-700"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
