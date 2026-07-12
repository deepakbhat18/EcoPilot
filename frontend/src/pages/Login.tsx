import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { ShieldCheck, Sparkles, Database, CheckCircle2 } from "lucide-react";
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
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-neutral-950 via-zinc-900 to-emerald-950 text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        
        <div className="relative z-10 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-neutral-950 font-black text-xl shadow-lg shadow-emerald-500/20">
            E
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
            EcoPilot Enterprise
          </span>
        </div>

        <div className="relative z-10 max-w-lg my-auto flex flex-col gap-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-xs font-semibold w-fit">
            <Sparkles size={12} />
            <span>Hackathon Release v2.4</span>
          </div>
          
          <h1 className="text-4xl font-extrabold tracking-tight leading-tight">
            The intelligent control plane for corporate <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">ESG compliance</span>.
          </h1>
          
          <p className="text-zinc-400 text-sm leading-relaxed">
            Unify carbon footprint tracking, social responsibility initiatives, and corporate governance audits into a single, SEC-aligned intelligence ledger.
          </p>

          <div className="flex flex-col gap-3 mt-4">
            <div className="flex items-center gap-3 text-xs text-zinc-300 bg-white/5 border border-white/5 rounded-xl p-3 backdrop-blur-md">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
              <span>Real-time Scope 1, 2, and 3 emission ledger calculations</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-zinc-300 bg-white/5 border border-white/5 rounded-xl p-3 backdrop-blur-md">
              <Database size={16} className="text-emerald-400 shrink-0" />
              <span>PostgreSQL auditable datastore with zero-friction reports export</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-zinc-500 flex justify-between border-t border-zinc-800/80 pt-6">
          <span>© 2026 EcoPilot Technologies.</span>
          <span>Security Certified (ISO 27001)</span>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 bg-background">
        <div className="lg:hidden flex items-center gap-2.5 mb-8">
          <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-black text-lg shadow-sm">
            E
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">
            EcoPilot Enterprise
          </span>
        </div>

        <div className="w-full max-w-md flex flex-col gap-6">
          <div className="flex flex-col gap-1.5">
            <h2 className="text-2xl font-bold text-foreground">Welcome back</h2>
            <p className="text-xs text-muted-foreground">
              Please enter your corporate credentials to access the ESG ledger.
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
              <label className="flex items-center gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground select-none">
                <input
                  type="checkbox"
                  className="rounded border-border bg-background text-primary focus:ring-primary h-3.5 w-3.5 transition-all"
                  {...register("rememberMe")}
                />
                <span>Remember Me</span>
              </label>
              <Link to="/forgot-password" className="text-primary hover:underline font-semibold">
                Forgot Password?
              </Link>
            </div>

            <Button type="submit" variant="primary" isLoading={isSubmitting} className="w-full">
              Sign In to Dashboard
            </Button>
          </form>

          <div className="mt-4 p-4 border border-border/80 bg-muted/30 rounded-xl text-xs flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 font-bold text-primary mb-1">
              <ShieldCheck size={14} className="shrink-0" />
              <span>Architecture Demo Credentials</span>
            </div>
            <div className="flex justify-between border-b border-border/40 pb-1.5">
              <span className="text-muted-foreground">Email:</span>
              <code className="text-[11px] font-semibold text-foreground">analyst@ecopilot.com</code>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Password:</span>
              <code className="text-[11px] font-semibold text-foreground">password123</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
