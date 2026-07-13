"use client";

import { useCallback, useEffect, useState } from "react";

const GYM_NAME_KEY = "gym-name";
const GYM_PHONE_KEY = "gym-phone";
const GYM_EMAIL_KEY = "gym-email";

const DEFAULT_GYM_NAME = "BlackOS Gym";

export type GymProfile = {
  gymName: string;
  phone: string;
  email: string;
};

export function getStoredGymName() {
  if (typeof window === "undefined") return DEFAULT_GYM_NAME;
  try {
    return localStorage.getItem(GYM_NAME_KEY)?.trim() || DEFAULT_GYM_NAME;
  } catch {
    return DEFAULT_GYM_NAME;
  }
}

export function getStoredGymProfile(): GymProfile {
  if (typeof window === "undefined") {
    return { gymName: DEFAULT_GYM_NAME, phone: "", email: "" };
  }
  try {
    return {
      gymName: localStorage.getItem(GYM_NAME_KEY)?.trim() || DEFAULT_GYM_NAME,
      phone: localStorage.getItem(GYM_PHONE_KEY)?.trim() || "",
      email: localStorage.getItem(GYM_EMAIL_KEY)?.trim() || ""
    };
  } catch {
    return { gymName: DEFAULT_GYM_NAME, phone: "", email: "" };
  }
}

function emitProfile(profile: GymProfile) {
  window.dispatchEvent(new CustomEvent("gym-profile-changed", { detail: profile }));
  window.dispatchEvent(new CustomEvent("gym-name-changed", { detail: profile.gymName }));
}

export function useGymName() {
  const [gymName, setGymNameState] = useState(DEFAULT_GYM_NAME);

  useEffect(() => {
    setGymNameState(getStoredGymName());
    const onStorage = (e: StorageEvent) => {
      if (e.key === GYM_NAME_KEY) setGymNameState(e.newValue?.trim() || DEFAULT_GYM_NAME);
    };
    const onCustom = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      if (detail) setGymNameState(detail);
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("gym-name-changed", onCustom);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("gym-name-changed", onCustom);
    };
  }, []);

  const setGymName = useCallback((name: string) => {
    const next = name.trim() || DEFAULT_GYM_NAME;
    localStorage.setItem(GYM_NAME_KEY, next);
    setGymNameState(next);
    emitProfile(getStoredGymProfile());
  }, []);

  return { gymName, setGymName };
}

export function useGymProfile() {
  const [profile, setProfile] = useState<GymProfile>({
    gymName: DEFAULT_GYM_NAME,
    phone: "",
    email: ""
  });

  useEffect(() => {
    setProfile(getStoredGymProfile());
    const sync = () => setProfile(getStoredGymProfile());
    const onCustom = (e: Event) => {
      const detail = (e as CustomEvent<GymProfile>).detail;
      if (detail) setProfile(detail);
    };
    window.addEventListener("storage", sync);
    window.addEventListener("gym-profile-changed", onCustom);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("gym-profile-changed", onCustom);
    };
  }, []);

  const saveProfile = useCallback((next: Partial<GymProfile>) => {
    const current = getStoredGymProfile();
    const merged: GymProfile = {
      gymName: (next.gymName ?? current.gymName).trim() || DEFAULT_GYM_NAME,
      phone: (next.phone ?? current.phone).trim(),
      email: (next.email ?? current.email).trim()
    };
    localStorage.setItem(GYM_NAME_KEY, merged.gymName);
    localStorage.setItem(GYM_PHONE_KEY, merged.phone);
    localStorage.setItem(GYM_EMAIL_KEY, merged.email);
    setProfile(merged);
    emitProfile(merged);
    return merged;
  }, []);

  return { profile, saveProfile };
}
