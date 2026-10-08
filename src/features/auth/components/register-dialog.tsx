"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import { FormError, FormField } from "@/components/forms/form-field";

import { AuthApiError, register } from "../api";
import type { AuthFormErrors, AuthUser } from "../types";
import { AuthDialog } from "./auth-dialog";

const MAX_AVATAR_SIZE = 2 * 1024 * 1024;
const ACCEPTED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type RegisterField =
  | "username"
  | "email"
  | "password"
  | "password_confirmation";

type RegisterValues = Record<RegisterField, string>;
type TouchedFields = Partial<Record<RegisterField, boolean>>;

const initialValues: RegisterValues = {
  username: "",
  email: "",
  password: "",
  password_confirmation: "",
};

function validate(values: RegisterValues): AuthFormErrors {
  const errors: AuthFormErrors = {};

  if (values.username.trim().length < 3) {
    errors.username = ["Username must be at least 3 characters."];
  }

  if (!EMAIL_PATTERN.test(values.email)) {
    errors.email = ["Enter a valid email address."];
  }

  if (values.password.length < 3) {
    errors.password = ["Password must be at least 3 characters."];
  }

  if (values.password_confirmation !== values.password) {
    errors.password_confirmation = ["Passwords do not match."];
  }

  return errors;
}

type RegisterDialogProps = {
  open: boolean;
  onClose: () => void;
  onShowLogin: () => void;
  onAuthenticated: (user: AuthUser) => void;
};

export function RegisterDialog({
  open,
  onClose,
  onShowLogin,
  onAuthenticated,
}: RegisterDialogProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const submissionInFlightRef = useRef(false);
  const [values, setValues] = useState<RegisterValues>(initialValues);
  const [touched, setTouched] = useState<TouchedFields>({});
  const [fieldErrors, setFieldErrors] = useState<AuthFormErrors>({});
  const [formError, setFormError] = useState<string>();
  const [avatarPreview, setAvatarPreview] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const clientErrors = validate(values);

  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  function resetForm() {
    formRef.current?.reset();
    setValues(initialValues);
    setTouched({});
    setFieldErrors({});
    setFormError(undefined);
    setAvatarPreview(undefined);
  }

  function closeDialog() {
    resetForm();
    onClose();
  }

  function showLogin() {
    resetForm();
    onShowLogin();
  }

  function updateField(field: RegisterField) {
    return (event: ChangeEvent<HTMLInputElement>) => {
      setValues((current) => ({
        ...current,
        [field]: event.target.value,
      }));
      setFieldErrors((current) => {
        const next = { ...current };
        delete next[field];
        return next;
      });
      setFormError(undefined);
    };
  }

  function touchField(field: RegisterField) {
    setTouched((current) => ({ ...current, [field]: true }));
  }

  function getFieldError(field: RegisterField) {
    return (
      fieldErrors[field]?.[0] ??
      (touched[field] ? clientErrors[field]?.[0] : undefined)
    );
  }

  function isFieldValid(field: RegisterField) {
    return Boolean(
      touched[field] &&
        values[field] &&
        !fieldErrors[field] &&
        !clientErrors[field],
    );
  }

  function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    setFieldErrors((current) => {
      const next = { ...current };
      delete next.avatar;
      return next;
    });

    if (!file) {
      setAvatarPreview(undefined);
      return;
    }

    if (!ACCEPTED_AVATAR_TYPES.includes(file.type)) {
      setFieldErrors((current) => ({
        ...current,
        avatar: ["Choose a JPG, PNG, or WebP image."],
      }));
      event.target.value = "";
      setAvatarPreview(undefined);
      return;
    }

    if (file.size > MAX_AVATAR_SIZE) {
      setFieldErrors((current) => ({
        ...current,
        avatar: ["The avatar must be no larger than 2MB."],
      }));
      event.target.value = "";
      setAvatarPreview(undefined);
      return;
    }

    setAvatarPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched({
      username: true,
      email: true,
      password: true,
      password_confirmation: true,
    });
    setFormError(undefined);

    if (
      Object.keys(clientErrors).length > 0 ||
      submissionInFlightRef.current
    ) {
      return;
    }

    submissionInFlightRef.current = true;
    setIsSubmitting(true);

    try {
      const user = await register(new FormData(event.currentTarget));
      resetForm();
      onAuthenticated(user);
    } catch (error) {
      if (error instanceof AuthApiError) {
        setFieldErrors(error.fieldErrors ?? {});
        setFormError(error.fieldErrors ? undefined : error.message);
      } else {
        setFormError("Something went wrong. Please try again.");
      }
    } finally {
      submissionInFlightRef.current = false;
      setIsSubmitting(false);
    }
  }

  const hasRequiredValues = Object.values(values).every(Boolean);

  return (
    <AuthDialog
      open={open}
      title="Sign up"
      description="Welcome to Kino XII"
      titleId="register-dialog-title"
      variant="register"
      onRequestClose={closeDialog}
    >
      <form
        ref={formRef}
        className="flex min-h-0 flex-1 flex-col"
        noValidate
        aria-busy={isSubmitting}
        onSubmit={handleSubmit}
      >
        <FormError message={formError} />

        <div className={formError ? "mt-4" : ""}>
          <label
            className="inline-flex cursor-pointer items-center gap-3"
            htmlFor="register-avatar"
          >
            <span className="inline-flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-input text-white/[0.42]">
              {avatarPreview ? (
                // Object URLs are local previews and do not need image optimization.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className="size-full object-cover"
                  src={avatarPreview}
                  alt="Selected avatar preview"
                />
              ) : (
                <svg
                  aria-hidden="true"
                  className="size-4"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    d="M10 13V5m0 0L7 8m3-3 3 3M5 12.5v1.75A1.75 1.75 0 0 0 6.75 16h6.5A1.75 1.75 0 0 0 15 14.25V12.5"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.3"
                  />
                </svg>
              )}
            </span>
            <span className="grid gap-0.5">
              <span className="text-xs leading-4 font-bold text-white">
                Upload avatar (optional)
              </span>
              <span className="text-[10px] leading-3 text-white/[0.5]">
                JPG, PNG or WEBP
              </span>
            </span>
          </label>
          <input
            id="register-avatar"
            className="sr-only"
            name="avatar"
            type="file"
            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
            aria-invalid={Boolean(fieldErrors.avatar?.[0])}
            aria-describedby={
              fieldErrors.avatar?.[0] ? "register-avatar-error" : undefined
            }
            onChange={handleAvatarChange}
          />
          {fieldErrors.avatar?.[0] ? (
            <span
              id="register-avatar-error"
              className="mt-1 block text-[10px] leading-4 text-brand"
            >
              {fieldErrors.avatar[0]}
            </span>
          ) : null}
        </div>

        <div className="mt-5 grid gap-3.5">
          <FormField
            id="register-username"
            label="Username"
            name="username"
            type="text"
            autoComplete="username"
            placeholder="User"
            value={values.username}
            error={getFieldError("username")}
            valid={isFieldValid("username")}
            compact
            onBlur={() => touchField("username")}
            onChange={updateField("username")}
          />

          <FormField
            id="register-email"
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="example@gmail.com"
            value={values.email}
            error={getFieldError("email")}
            valid={isFieldValid("email")}
            compact
            onBlur={() => touchField("email")}
            onChange={updateField("email")}
          />

          <div className="grid grid-cols-2 items-start gap-3">
            <FormField
              id="register-password"
              label="Password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={values.password}
              error={getFieldError("password")}
              valid={isFieldValid("password")}
              compact
              onBlur={() => touchField("password")}
              onChange={updateField("password")}
            />

            <FormField
              id="register-password-confirmation"
              label="Confirm password"
              name="password_confirmation"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={values.password_confirmation}
              error={getFieldError("password_confirmation")}
              valid={isFieldValid("password_confirmation")}
              compact
              onBlur={() => touchField("password_confirmation")}
              onChange={updateField("password_confirmation")}
            />
          </div>
        </div>

        <button
          type="submit"
          className="mt-auto inline-flex h-10 cursor-pointer items-center justify-center rounded-full bg-brand text-xs font-bold text-white transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:bg-disabled disabled:text-white/[0.65] disabled:brightness-100"
          disabled={!hasRequiredValues || isSubmitting}
        >
          {isSubmitting ? "Signing up…" : "Sign up"}
        </button>

        <p className="mt-5 text-center text-[11px] leading-4 text-white/[0.5]">
          Already have an account?{" "}
          <button
            type="button"
            className="cursor-pointer font-bold text-brand transition hover:brightness-125"
            onClick={showLogin}
          >
            Log in
          </button>
        </p>
      </form>
    </AuthDialog>
  );
}
