import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FiArrowLeft,
  FiCalendar,
  FiEdit2,
  FiMail,
  FiSave,
  FiShield,
  FiUser,
  FiX,
} from "react-icons/fi";

import { getProfile, updateProfile } from "../services/profileService.js";

function Profile() {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        const user = data.user;

        setProfile(user);
        setFormData({
          name: user.name || "",
          email: user.email || "",
        });
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleCancel = () => {
    setFormData({
      name: profile.name || "",
      email: profile.email || "",
    });

    setIsEditing(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const name = formData.name.trim();
    const email = formData.email.trim().toLowerCase();

    if (!name || !email) {
      toast.error("Name and email are required");
      return;
    }

    if (name === profile.name && email === profile.email) {
      toast("No changes to save");
      setIsEditing(false);
      return;
    }

    try {
      setSaving(true);

      const data = await updateProfile({ name, email });

      setProfile(data.user);
      setFormData({
        name: data.user.name,
        email: data.user.email,
      });

      setIsEditing(false);
      toast.success(data.message || "Profile updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "Not available";

    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(date));
  };

  if (loading) {
    return (
      <section className="min-h-[70vh] bg-background px-4 py-12">
        <div className="mx-auto max-w-3xl animate-pulse space-y-5">
          <div className="h-8 w-48 rounded-lg bg-surface-muted" />
          <div className="h-64 rounded-2xl bg-surface-muted" />
        </div>
      </section>
    );
  }

  if (!profile) {
    return (
      <section className="flex min-h-[70vh] items-center justify-center bg-background px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">
            Unable to load profile
          </h1>
          <p className="mt-2 text-sm text-muted">
            Please refresh the page or log in again.
          </p>
          <Link
            to="/"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white"
          >
            <FiArrowLeft size={16} />
            Back to Home
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-primary"
        >
          <FiArrowLeft size={16} />
          Back to Home
        </Link>

        <div className="mb-8 mt-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
            My Account
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Profile Settings
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            Manage your personal information and account details.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
          <div className="flex flex-col gap-5 border-b border-border p-6 sm:flex-row sm:items-center">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <FiUser size={30} />
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="break-words text-xl font-bold text-foreground">
                {profile.name}
              </h2>
              <p className="mt-1 break-all text-sm text-muted">
                {profile.email}
              </p>
              <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold capitalize text-primary">
                <FiShield size={13} />
                {profile.role || "user"} account
              </span>
            </div>

            {!isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover"
              >
                <FiEdit2 size={16} />
                Edit Profile
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 p-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Personal Information
              </h3>
              <p className="mt-1 text-sm text-muted">
                Your name and email address are associated with your account.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-foreground"
                >
                  Full Name
                </label>

                <div className="relative">
                  <FiUser
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                  />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!isEditing || saving}
                    required
                    maxLength={100}
                    className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-3 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-70"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-foreground"
                >
                  Email Address
                </label>

                <div className="relative">
                  <FiMail
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                  />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!isEditing || saving}
                    required
                    className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-3 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-70"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-border bg-background p-4">
              <FiCalendar size={18} className="mt-0.5 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  Member since
                </p>
                <p className="mt-1 text-sm text-muted">
                  {formatDate(profile.createdAt)}
                </p>
              </div>
            </div>

            {isEditing && (
              <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-background disabled:opacity-60"
                >
                  <FiX size={16} />
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <FiSave size={16} />
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}

export default Profile;
