import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { ShieldCheck } from "lucide-react";
import { showToast } from "../components/Toast";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      await login(data.email, data.password);
      showToast("Signed in successfully. Welcome back to EcoPilot!", "success");
    } catch (error: any) {
      console.error("Login failed:", error);
      showToast(error.response?.data?.error?.message || "Invalid login credentials.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="flex items-center gap-2 mb-6 animate-fadeIn">
        <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-extrabold text-xl shadow-md">
          E
        </div>
        <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">
          EcoPilot Enterprise
        </span>
      </div>

      <div className="w-full max-w-md bg-card text-card-foreground border border-border/80 shadow-premium dark:shadow-premium-dark rounded-2xl p-8 animate-slideIn">
        <div className="flex flex-col gap-1 mb-6 text-center">
          <h2 className="text-xl font-bold">Sign In</h2>
          <p className="text-xs text-muted-foreground">
            Access your organization's sustainability intelligence metrics.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="Corporate Email"
            type="email"
            placeholder="analyst@ecopilot.com"
            error={errors.email?.message}
            {...register("email")}
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register("password")}
          />

          <div className="flex items-center justify-between text-xs mt-1 mb-2">
            <label className="flex items-center gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground">
              <input
                type="checkbox"
                className="rounded border-border bg-background text-primary focus:ring-primary h-3.5 w-3.5"
                {...register("rememberMe")}
              />
              <span>Remember Me</span>
            </label>
            <Link to="/forgot-password" className="text-primary hover:underline font-medium">
              Forgot Password?
            </Link>
          </div>

          <Button type="submit" variant="primary" isLoading={isSubmitting} className="w-full mt-2">
            Sign In to Dashboard
          </Button>
        </form>

        <div className="mt-6 p-4 border border-border bg-secondary/30 rounded-xl text-xs flex flex-col gap-1">
          <div className="flex items-center gap-1.5 font-semibold text-primary mb-1">
            <ShieldCheck size={14} />
            <span>Architecture Demo Credentials</span>
          </div>
          <div>
            <span className="font-medium text-muted-foreground">Email:</span>{" "}
            <code className="text-[11px] bg-muted/60 px-1 py-0.5 rounded text-foreground">analyst@ecopilot.com</code>
          </div>
          <div>
            <span className="font-medium text-muted-foreground">Password:</span>{" "}
            <code className="text-[11px] bg-muted/60 px-1 py-0.5 rounded text-foreground">password123</code>
          </div>
        </div>
      </div>
    </div>
  );
};
