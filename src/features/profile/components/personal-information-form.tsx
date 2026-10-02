"use client";

import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import {
  AuthApiError,
  getVenueOptions,
  updateProfile,
} from "@/features/auth/api";
import { useAuth } from "@/features/auth/auth-provider";
import type {
  AuthFormErrors,
  AuthUser,
  PreferredVenue,
} from "@/features/auth/types";

type ProfileField =
  | "fullName"
  | "mobileNumber"
  | "dateOfBirth"
  | "preferredVenueId";

type ProfileValues = Record<ProfileField, string>;

const inputClassName =
  "h-11 w-full rounded-xl border border-transparent bg-input px-4 text-sm text-white outline-none transition-colors duration-200 placeholder:text-white/[0.42] focus:border-brand disabled:cursor-not-allowed disabled:text-white/[0.62]";

function valuesFromUser(user: AuthUser): ProfileValues {
  return {
    fullName: user.fullName ?? "",
    mobileNumber: user.mobileNumber ?? "",
    dateOfBirth: user.dateOfBirth ?? "",
    preferredVenueId: user.preferredVenue?.id.toString() ?? "",
  };
}

type ProfileFormFieldProps = {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
};

function ProfileFormField({
  id,
  label,
  error,
  hint,
  children,
}: ProfileFormFieldProps) {
  return (
    <div className="grid gap-2">
      <label className="text-xs leading-4 font-semibold text-white" htmlFor={id}>
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-xs leading-4 text-brand" id={`${id}-error`} role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs leading-4 text-white/[0.58]">{hint}</p>
      ) : null}
    </div>
  );
}

export function PersonalInformationForm() {
  const { user, isLoading, openLogin } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      openLogin();
    }
  }, [isLoading, openLogin, user]);

  if (isLoading) {
    return <p className="text-sm text-white/[0.58]">Loading your profile…</p>;
  }

  if (!user) {
    return (
      <p className="text-sm text-white/[0.58]">
        Log in to view and update your profile.
      </p>
    );
  }

  return <AuthenticatedProfileForm key={user.id} user={user} />;
}

function AuthenticatedProfileForm({ user }: { user: AuthUser }) {
  const { openLogin, signOut, updateUser } = useAuth();
  const [values, setValues] = useState<ProfileValues>(() =>
    valuesFromUser(user),
  );
  const [venues, setVenues] = useState<PreferredVenue[]>([]);
  const [fieldErrors, setFieldErrors] = useState<AuthFormErrors>({});
  const [formError, setFormError] = useState<string>();
  const [successMessage, setSuccessMessage] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isCurrent = true;

    getVenueOptions()
      .then((venueOptions) => {
        if (isCurrent) {
          setVenues(venueOptions);
        }
      })
      .catch(() => {
        if (isCurrent && user.preferredVenue) {
          setVenues([user.preferredVenue]);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [user.preferredVenue]);

  function updateField(field: ProfileField) {
    return (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setValues((current) => ({ ...current, [field]: event.target.value }));
      setFieldErrors((current) => {
        const next = { ...current };
        delete next[field];
        return next;
      });
      setFormError(undefined);
      setSuccessMessage(undefined);
    };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});
    setFormError(undefined);
    setSuccessMessage(undefined);
    setIsSubmitting(true);

    try {
      const updatedUser = await updateProfile(new FormData(event.currentTarget));
      updateUser(updatedUser);
      setValues(valuesFromUser(updatedUser));
      setSuccessMessage("Changes saved successfully.");
    } catch (error) {
      if (error instanceof AuthApiError) {
        setFieldErrors(error.fieldErrors ?? {});
        setFormError(error.fieldErrors ? undefined : error.message);

        if (error.status === 401) {
          await signOut();
          openLogin();
        }
      } else {
        setFormError("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="grid w-[880px] gap-5" noValidate onSubmit={handleSubmit}>
      <ProfileFormField
        id="profile-full-name"
        label="Full name"
        error={fieldErrors.fullName?.[0]}
      >
        <input
          id="profile-full-name"
          className={inputClassName}
          name="fullName"
          type="text"
          autoComplete="name"
          placeholder="e.g. Meri Sanikidze"
          value={values.fullName}
          aria-invalid={Boolean(fieldErrors.fullName?.[0])}
          aria-describedby={
            fieldErrors.fullName?.[0] ? "profile-full-name-error" : undefined
          }
          onChange={updateField("fullName")}
        />
      </ProfileFormField>

      <ProfileFormField
        id="profile-email"
        label="Email"
        hint="Set at registration and cannot be changed"
      >
        <input
          id="profile-email"
          className={inputClassName}
          type="email"
          value={user.email}
          disabled
        />
      </ProfileFormField>

      <ProfileFormField
        id="profile-mobile-number"
        label="Mobile number"
        error={fieldErrors.mobileNumber?.[0]}
      >
        <input
          id="profile-mobile-number"
          className={inputClassName}
          name="mobileNumber"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          placeholder="e.g. 599 123 456"
          value={values.mobileNumber}
          aria-invalid={Boolean(fieldErrors.mobileNumber?.[0])}
          aria-describedby={
            fieldErrors.mobileNumber?.[0]
              ? "profile-mobile-number-error"
              : undefined
          }
          onChange={updateField("mobileNumber")}
        />
      </ProfileFormField>

      <ProfileFormField
        id="profile-date-of-birth"
        label="Date of birth"
        error={fieldErrors.dateOfBirth?.[0]}
      >
        <input
          id="profile-date-of-birth"
          className={`${inputClassName} [color-scheme:dark]`}
          name="dateOfBirth"
          type="date"
          value={values.dateOfBirth}
          aria-invalid={Boolean(fieldErrors.dateOfBirth?.[0])}
          aria-describedby={
            fieldErrors.dateOfBirth?.[0]
              ? "profile-date-of-birth-error"
              : undefined
          }
          onChange={updateField("dateOfBirth")}
        />
      </ProfileFormField>

      <ProfileFormField
        id="profile-preferred-venue"
        label="Preferred Venue (Optional)"
        error={fieldErrors.preferredVenueId?.[0]}
      >
        <span className="relative block">
          <select
            id="profile-preferred-venue"
            className={`${inputClassName} cursor-pointer appearance-none pr-11`}
            name="preferredVenueId"
            value={values.preferredVenueId}
            aria-invalid={Boolean(fieldErrors.preferredVenueId?.[0])}
            aria-describedby={
              fieldErrors.preferredVenueId?.[0]
                ? "profile-preferred-venue-error"
                : undefined
            }
            onChange={updateField("preferredVenueId")}
          >
            <option value="">Select a venue</option>
            {venues.map((venue) => (
              <option key={venue.id} value={venue.id}>
                {venue.name}
              </option>
            ))}
          </select>
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-white/[0.65]"
            viewBox="0 0 20 20"
            fill="none"
          >
            <path
              d="m6 8 4 4 4-4"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
            />
          </svg>
        </span>
      </ProfileFormField>

      <div className="mt-3 flex items-center gap-4">
        <button
          type="submit"
          className="inline-flex h-11 cursor-pointer items-center justify-center rounded-full bg-brand px-6 text-sm font-extrabold text-white transition-colors duration-200 hover:bg-brand/[0.85] disabled:cursor-wait disabled:opacity-60"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving…" : "Save changes"}
        </button>

        <p
          className={`text-sm ${formError ? "text-brand" : "text-success"}`}
          role="status"
          aria-live="polite"
        >
          {formError ?? successMessage}
        </p>
      </div>
    </form>
  );
}
