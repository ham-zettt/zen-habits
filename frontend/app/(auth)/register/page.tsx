"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { PageLoader } from "@/components/ui/states";
import { useAuth } from "@/context/auth";
import { ApiError } from "@/lib/api";

export default function RegisterPage() {
  const { user, loading, register } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace("/app");
    }
  }, [loading, user, router]);

  if (loading || user) {
    return <PageLoader />;
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register(name, email, password);
      router.replace("/app");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Unable to create your account right now.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h1 className="text-headline text-ink">Create your account</h1>
      <p className="mt-2 text-body-sm text-ink-subtle">
        One place for your tasks, study, reminders, and more.
      </p>

      <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-5">
        <Field label="Name" htmlFor="name">
          <Input
            id="name"
            autoComplete="name"
            required
            maxLength={120}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Your name"
          />
        </Field>

        <Field label="Email" htmlFor="email">
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
          />
        </Field>

        <Field
          label="Password"
          htmlFor="password"
          hint="At least 8 characters."
        >
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
          />
        </Field>

        {error ? (
          <p role="alert" className="text-body-sm text-[#ff6369]">
            {error}
          </p>
        ) : null}

        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-body-sm text-ink-subtle">
        Already have an account?{" "}
        <Link href="/login" className="text-ink hover:text-primary-hover">
          Sign in
        </Link>
      </p>
    </div>
  );
}
