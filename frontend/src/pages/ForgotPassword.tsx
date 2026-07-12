import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { Link } from "react-router-dom";
import { ArrowLeft, KeyRound } from "lucide-react";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { showToast } from "../components/Toast";
import { api } from "../services/api";

const schema = zod.object({
  email: zod.string().email("Please enter a valid corporate email address."),
});

type ForgotPasswordFormValues = zod.infer<typeof schema>;

export const ForgotPassword: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsSubmitting(true);
    try {
      await api.post("/auth/forgot-password", { email: data.email });
      setIsSent(true);
      showToast("Password reset request submitted successfully.", "success");
    } catch (error: any) {
      showToast(error.response?.data?.error?.message || "Failed to submit password reset request.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="flex items-center gap-2 mb-6">
        <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-extrabold text-xl shadow-md">
          E
        </div>
        <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">
          EcoPilot Enterprise
        </span>
      </div>

      <div className="w-full max-w-md bg-card text-card-foreground border border-border/80 shadow-premium dark:shadow-premium-dark rounded-2xl p-8">
        <div className="flex flex-col gap-1 mb-6 text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2">
            <KeyRound size={22} />
          </div>
          <h2 className="text-xl font-bold">Reset Password</h2>
          <p className="text-xs text-muted-foreground">
            Enter your email to receive recovery instructions.
          </p>
        </div>

        {isSent ? (
          <div className="flex flex-col gap-4 text-center">
            <p className="text-sm text-foreground/80">
              We've sent a link to your email. Follow the instructions to create a new password.
            </p>
            <Link to="/login" className="w-full mt-2">
              <Button variant="primary" className="w-full">
                Back to Sign In
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Input
              label="Corporate Email"
              type="email"
              placeholder="analyst@ecopilot.com"
              error={errors.email?.message}
              {...register("email")}
            />

            <Button type="submit" variant="primary" isLoading={isSubmitting} className="w-full mt-2">
              Send Reset Link
            </Button>

            <Link
              to="/login"
              className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mt-2"
            >
              <ArrowLeft size={14} />
              <span>Back to Sign In</span>
            </Link>
          </form>
        )}
      </div>
    </div>
  );
};
