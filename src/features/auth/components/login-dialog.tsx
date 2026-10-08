"use client";

import { useRef, useState, type ChangeEvent, type FormEvent } from "react";

import { FormField } from "@/components/forms/form-field";

import { AuthApiError, login } from "../api";
import type { AuthFormErrors, AuthUser } from "../types";
import { AuthDialog } from "./auth-dialog";

type LoginDialogProps = {
  open: boolean;
  onClose: () => void;
  onShowRegister: () => void;
  onAuthenticated: (user: AuthUser) => void;
};

type LoginField = "email" | "password";
type LoginValues = Record<LoginField, string>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const initialValues: LoginValues = { email: "", password: "" };

function validate(values: LoginValues): AuthFormErrors {
  const errors: AuthFormErrors = {};

  if (!EMAIL_PATTERN.test(values.email)) {
    errors.email = ["Enter a valid email address."];
  }

  if (values.password.length < 3) {
    errors.password = ["At least 3 characters."];
  }

  return errors;
}

export function LoginDialog({
  open,
  onClose,
  onShowRegister,
  onAuthenticated,
}: LoginDialogProps) {
  const submissionInFlightRef = useRef(false);
  const [values, setValues] = useState<LoginValues>(initialValues);
  const [touched, setTouched] = useState<Partial<Record<LoginField, boolean>>>({});
  const [fieldErrors, setFieldErrors] = useState<AuthFormErrors>({});
  const [formError, setFormError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const clientErrors = validate(values);

  function clearErrors() {
    setFieldErrors({});
    setFormError(undefined);
  }

  function resetForm() {
    setValues(initialValues);
    setTouched({});
    clearErrors();
  }

  function closeDialog() {
    resetForm();
    onClose();
  }

  function showRegister() {
    resetForm();
    onShowRegister();
  }

  function updateField(field: LoginField) {
    return (event: ChangeEvent<HTMLInputElement>) => {
      setValues((current) => ({ ...current, [field]: event.target.value }));
      setFieldErrors((current) => {
        const next = { ...current };
        delete next[field];
        return next;
      });
      setFormError(undefined);
    };
  }

  function getFieldError(field: LoginField) {
    return (
      fieldErrors[field]?.[0] ??
      (touched[field] ? clientErrors[field]?.[0] : undefined)
    );
  }

  function isFieldValid(field: LoginField) {
    return Boolean(
      touched[field] &&
        values[field] &&
        !fieldErrors[field] &&
        !clientErrors[field],
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearErrors();
    setTouched({ email: true, password: true });

    if (
      Object.keys(clientErrors).length > 0 ||
      submissionInFlightRef.current
    ) {
      return;
    }

    submissionInFlightRef.current = true;
    setIsSubmitting(true);

    try {
      const user = await login(values);

      resetForm();
      onAuthenticated(user);
    } catch (error) {
      if (error instanceof AuthApiError) {
        setFieldErrors(error.fieldErrors ?? {});
        setFormError(error.fieldErrors ? undefined : error.message);

        if (error.status === 401) {
          setValues((current) => ({ ...current, password: "" }));
          setTouched((current) => ({ ...current, password: false }));
        }
      } else {
        setFormError("Something went wrong. Please try again.");
      }
    } finally {
      submissionInFlightRef.current = false;
      setIsSubmitting(false);
    }
  }

  return (
    <AuthDialog
      open={open}
      title="Log in"
      description="Welcome back to Kino XII"
      titleId="login-dialog-title"
      variant="login"
      onRequestClose={closeDialog}
    >
      <form
        className="flex min-h-0 flex-1 flex-col"
        noValidate
        aria-busy={isSubmitting}
        onSubmit={handleSubmit}
      >
        <div className="grid gap-3.5">
          <FormField
            id="login-email"
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="example@gmail.com"
            value={values.email}
            error={getFieldError("email")}
            valid={isFieldValid("email")}
            compact
            onBlur={() => setTouched((current) => ({ ...current, email: true }))}
            onChange={updateField("email")}
          />

          <FormField
            id="login-password"
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={values.password}
            error={getFieldError("password")}
            valid={isFieldValid("password")}
            compact
            onBlur={() =>
              setTouched((current) => ({ ...current, password: true }))
            }
            onChange={updateField("password")}
          />
        </div>

        {formError ? (
          <p className="mt-2 text-[10px] leading-4 text-brand" role="alert">
            {formError}
          </p>
        ) : null}

        <button
          type="submit"
          className="mt-auto inline-flex h-10 cursor-pointer items-center justify-center rounded-full bg-brand text-xs font-bold text-white transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:bg-disabled disabled:text-white/[0.65] disabled:brightness-100"
          disabled={!values.email || !values.password || isSubmitting}
        >
          {isSubmitting ? "Logging in…" : "Log in"}
        </button>

        <p className="mt-5 text-center text-[11px] leading-4 text-white/[0.5]">
          Don&apos;t have an account?{" "}
          <button
            type="button"
            className="cursor-pointer font-bold text-brand transition hover:brightness-125"
            onClick={showRegister}
          >
            Sign up
          </button>
        </p>
      </form>
    </AuthDialog>
  );
}
