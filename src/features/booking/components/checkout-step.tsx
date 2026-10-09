"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";

import { FormField } from "@/components/forms/form-field";
import type { AuthFormErrors, AuthUser } from "@/features/auth/types";
import type { CinemaSession } from "@/features/sessions/types";

import type { CheckoutInput, SeatHold } from "../types";

export type CheckoutValues = Omit<CheckoutInput, "holdId">;

type CheckoutField = keyof CheckoutValues;
type TouchedFields = Partial<Record<CheckoutField, boolean>>;

type CheckoutStepProps = {
  user: AuthUser;
  hold: SeatHold;
  session: CinemaSession;
  movieTitle: string;
  fieldErrors: AuthFormErrors;
  isSubmitting: boolean;
  onClearFieldError: (field: CheckoutField) => void;
  onClearFormError: () => void;
  onSubmit: (values: CheckoutValues) => void;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function stripNonDigits(value: string) {
  return value.replace(/\D/g, "");
}

function formatCardNumber(value: string) {
  return stripNonDigits(value)
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, "$1 ");
}

function formatExpiry(value: string) {
  const digits = stripNonDigits(value).slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

function formatMobileNumber(value: string) {
  const digits = stripNonDigits(value).slice(0, 9);
  return [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 9)]
    .filter(Boolean)
    .join(" ");
}

function isFutureExpiry(value: string) {
  const match = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(value);

  if (!match) {
    return false;
  }

  const expiryMonth = Number(match[1]);
  const expiryYear = 2000 + Number(match[2]);
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  return (
    expiryYear > currentYear ||
    (expiryYear === currentYear && expiryMonth >= currentMonth)
  );
}

function validate(values: CheckoutValues): AuthFormErrors {
  const errors: AuthFormErrors = {};

  if (values.fullName.trim().length < 3) {
    errors.fullName = ["Full name must be at least 3 characters."];
  }

  if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = ["Enter a valid email address."];
  }

  if (!/^5\d{8}$/.test(stripNonDigits(values.mobileNumber))) {
    errors.mobileNumber = ["Enter a valid Georgian mobile number."];
  }

  if (stripNonDigits(values.cardNumber).length !== 16) {
    errors.cardNumber = ["Card number must contain 16 digits."];
  }

  if (!isFutureExpiry(values.expiry)) {
    errors.expiry = ["Enter a valid future expiry date in MM/YY format."];
  }

  if (!/^\d{3}$/.test(values.cvv)) {
    errors.cvv = ["CVV must contain 3 digits."];
  }

  return errors;
}

function formatPrice(price: number) {
  return Number.isInteger(price) ? String(price) : price.toFixed(2);
}

function formatSummaryDate(dateValue: string) {
  const date = new Date(`${dateValue}T12:00:00Z`);

  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(date);
}

function getTicketSummary(hold: SeatHold) {
  const counts = new Map<string, number>();

  hold.seats.forEach((seat) => {
    counts.set(
      seat.ticketType.name,
      (counts.get(seat.ticketType.name) ?? 0) + 1,
    );
  });

  return Array.from(counts.entries())
    .map(([name, count]) => `${count} × ${name}`)
    .join(", ");
}

export function CheckoutStep({
  user,
  hold,
  session,
  movieTitle,
  fieldErrors,
  isSubmitting,
  onClearFieldError,
  onClearFormError,
  onSubmit,
}: CheckoutStepProps) {
  const [values, setValues] = useState<CheckoutValues>(() => ({
    fullName: user.fullName ?? "",
    email: user.email,
    mobileNumber: formatMobileNumber(user.mobileNumber ?? ""),
    cardNumber: "",
    expiry: "",
    cvv: "",
  }));
  const [touched, setTouched] = useState<TouchedFields>({});
  const clientErrors = validate(values);
  const canSubmit = Object.keys(clientErrors).length === 0 && !isSubmitting;

  function getFieldError(field: CheckoutField) {
    return (
      fieldErrors[field]?.[0] ??
      (touched[field] ? clientErrors[field]?.[0] : undefined)
    );
  }

  function isFieldValid(field: CheckoutField) {
    return Boolean(
      values[field].trim() &&
        !fieldErrors[field] &&
        !clientErrors[field],
    );
  }

  function updateField(field: CheckoutField) {
    return (event: ChangeEvent<HTMLInputElement>) => {
      let nextValue = event.target.value;

      if (field === "cardNumber") {
        nextValue = formatCardNumber(nextValue);
      } else if (field === "expiry") {
        nextValue = formatExpiry(nextValue);
      } else if (field === "cvv") {
        nextValue = stripNonDigits(nextValue).slice(0, 3);
      } else if (field === "mobileNumber") {
        nextValue = formatMobileNumber(nextValue);
      }

      setValues((current) => ({ ...current, [field]: nextValue }));
      onClearFieldError(field);
      onClearFormError();
    };
  }

  function touchField(field: CheckoutField) {
    setTouched((current) => ({ ...current, [field]: true }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched({
      fullName: true,
      email: true,
      mobileNumber: true,
      cardNumber: true,
      expiry: true,
      cvv: true,
    });

    if (!canSubmit) {
      return;
    }

    onSubmit({
      ...values,
      fullName: values.fullName.trim(),
      email: values.email.trim(),
    });
  }

  return (
    <form
      className="mt-5 grid min-h-0 flex-1 grid-cols-[780px_1fr] gap-8"
      noValidate
      aria-busy={isSubmitting}
      onSubmit={handleSubmit}
    >
      <section
        className="grid min-h-0 content-start grid-cols-2 gap-x-4 gap-y-4 overflow-y-auto pr-4 pb-2"
        aria-labelledby="payment-details-heading"
      >
        <h3 id="payment-details-heading" className="col-span-2 text-sm font-extrabold">
          Buyer and payment details
        </h3>

        <FormField
          id="checkout-full-name"
          containerClassName="col-span-2"
          label="Full name"
          name="fullName"
          type="text"
          autoComplete="name"
          minLength={3}
          maxLength={50}
          placeholder="e.g. Meri Sanikidze"
          value={values.fullName}
          error={getFieldError("fullName")}
          valid={isFieldValid("fullName")}
          disabled={isSubmitting}
          compact
          onBlur={() => touchField("fullName")}
          onChange={updateField("fullName")}
        />

        <FormField
          id="checkout-email"
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="e.g. name@example.com"
          value={values.email}
          error={getFieldError("email")}
          valid={isFieldValid("email")}
          disabled={isSubmitting}
          compact
          onBlur={() => touchField("email")}
          onChange={updateField("email")}
        />

        <FormField
          id="checkout-mobile-number"
          label="Mobile number"
          name="mobileNumber"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          maxLength={11}
          placeholder="e.g. 599 123 456"
          value={values.mobileNumber}
          error={getFieldError("mobileNumber")}
          valid={isFieldValid("mobileNumber")}
          disabled={isSubmitting}
          compact
          onBlur={() => touchField("mobileNumber")}
          onChange={updateField("mobileNumber")}
        />

        <FormField
          id="checkout-card-number"
          containerClassName="col-span-2"
          label="Card number"
          name="cardNumber"
          type="text"
          inputMode="numeric"
          autoComplete="cc-number"
          maxLength={19}
          placeholder="e.g. 4242 4242 4242 4242"
          value={values.cardNumber}
          error={getFieldError("cardNumber")}
          valid={isFieldValid("cardNumber")}
          disabled={isSubmitting}
          compact
          onBlur={() => touchField("cardNumber")}
          onChange={updateField("cardNumber")}
        />

        <FormField
          id="checkout-expiry"
          label="Expiry"
          name="expiry"
          type="text"
          inputMode="numeric"
          autoComplete="cc-exp"
          maxLength={5}
          placeholder="MM/YY"
          value={values.expiry}
          error={getFieldError("expiry")}
          valid={isFieldValid("expiry")}
          disabled={isSubmitting}
          compact
          onBlur={() => touchField("expiry")}
          onChange={updateField("expiry")}
        />

        <FormField
          id="checkout-cvv"
          label="CVV"
          name="cvv"
          type="password"
          inputMode="numeric"
          autoComplete="cc-csc"
          maxLength={3}
          placeholder="e.g. 123"
          value={values.cvv}
          error={getFieldError("cvv")}
          valid={isFieldValid("cvv")}
          disabled={isSubmitting}
          compact
          onBlur={() => touchField("cvv")}
          onChange={updateField("cvv")}
        />
      </section>

      <aside
        className="flex min-h-0 flex-col border-l border-foreground/[0.1] pl-8"
        aria-labelledby="checkout-summary-heading"
      >
        <h3 id="checkout-summary-heading" className="text-sm font-extrabold">
          Summary
        </h3>

        <div className="mt-4 rounded-xl bg-surface p-4">
          <h4 className="text-xs font-extrabold uppercase">{movieTitle}</h4>
          <p className="mt-1 text-[9px] leading-4 text-foreground/[0.48]">
            Hall {session.hall.name} · {formatSummaryDate(session.date)} · {session.time}
          </p>
          <dl className="mt-4 grid gap-2 text-[10px]">
            <div className="flex items-start justify-between gap-4">
              <dt className="text-foreground/[0.45]">Seats</dt>
              <dd className="text-right font-semibold text-foreground">
                {hold.seats.map((seat) => seat.code).join(", ")}
              </dd>
            </div>
            <div className="flex items-start justify-between gap-4">
              <dt className="text-foreground/[0.45]">Tickets</dt>
              <dd className="text-right font-semibold text-foreground">
                {getTicketSummary(hold)}
              </dd>
            </div>
          </dl>
        </div>

        <div className="mt-auto flex items-end justify-between border-t border-foreground/[0.1] pt-4">
          <span className="text-[10px] font-semibold tracking-[0.05em] text-foreground/[0.55] uppercase">
            Grand total
          </span>
          <strong className="text-xl font-extrabold text-foreground">
            ₾{formatPrice(hold.subtotal)}
          </strong>
        </div>

        <button
          type="submit"
          className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-full bg-brand text-sm font-extrabold text-foreground transition-colors hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:bg-foreground/[0.28] disabled:text-foreground/[0.55]"
          disabled={!canSubmit}
        >
          {isSubmitting ? "Processing payment…" : "Pay & Complete Order"}
        </button>
      </aside>
    </form>
  );
}
