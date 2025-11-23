import { useState } from "react";
import React from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, Eye, EyeOff, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(50, "Username too long"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username too long")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, hyphens, and underscores"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string()
    .min(6, "Password must be at least 6 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
  monthlyIncome: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  monthlyIncome: string;
  createdAt: string;
}

export default function LoginRegister({ onAuthChange }: { onAuthChange?: () => void }) {
  const [, setLocation] = useLocation();
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const { toast } = useToast();

  // Initialize demo user on first load
  React.useEffect(() => {
    const users = localStorage.getItem("finance_users");
    if (!users) {
      const demoUser: User = {
        id: "user_demo",
        username: "demo",
        email: "demo@example.com",
        password: "Demo123",
        monthlyIncome: "5000",
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem("finance_users", JSON.stringify({ user_demo: demoUser }));
    }
  }, []);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
    mode: "onBlur",
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: "", email: "", password: "", confirmPassword: "", monthlyIncome: "" },
    mode: "onBlur",
  });

  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    setApiError(null);
    
    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      const storedUsers = JSON.parse(localStorage.getItem("finance_users") || "{}");
      const user = Object.values(storedUsers).find((u: any) => u.username === data.username) as User | undefined;

      if (!user || user.password !== data.password) {
        setApiError("Invalid username or password");
        toast({
          title: "Login Failed",
          description: "Invalid username or password",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      localStorage.setItem("currentUser", JSON.stringify(user));
      toast({
        title: "Login Successful",
        description: `Welcome back, ${data.username}!`,
      });
      
      if (onAuthChange) onAuthChange();
      setLocation("/dashboard");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      setApiError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (data: RegisterFormData) => {
    setIsLoading(true);
    setApiError(null);

    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      const storedUsers = JSON.parse(localStorage.getItem("finance_users") || "{}");
      const userExists = Object.values(storedUsers).some(
        (u: any) => u.username === data.username || u.email === data.email
      );

      if (userExists) {
        setApiError("Username or email already exists");
        toast({
          title: "Registration Failed",
          description: "Username or email already exists",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const newUser: User = {
        id: `user_${Date.now()}`,
        username: data.username,
        email: data.email,
        password: data.password,
        monthlyIncome: data.monthlyIncome || "0",
        createdAt: new Date().toISOString(),
      };

      storedUsers[newUser.id] = newUser;
      localStorage.setItem("finance_users", JSON.stringify(storedUsers));
      localStorage.setItem("currentUser", JSON.stringify(newUser));

      toast({
        title: "Registration Successful",
        description: `Welcome, ${data.username}!`,
      });

      if (onAuthChange) onAuthChange();
      setLocation("/dashboard");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      setApiError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleMode = () => {
    setIsRegister(!isRegister);
    setApiError(null);
    loginForm.reset();
    registerForm.reset();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center space-y-4 pb-6">
            <div className="flex justify-center">
              <div className="bg-gradient-to-br from-blue-100 to-green-100 dark:from-blue-900 dark:to-green-900 p-4 rounded-xl">
                <DollarSign className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 dark:from-blue-400 dark:to-green-400 bg-clip-text text-transparent">
                FinanceAI
              </CardTitle>
              <CardDescription className="text-base">
                {isRegister ? "Create your account and start managing your finances" : "Sign in to your account"}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {apiError && (
              <Alert variant="destructive" className="border-red-200 bg-red-50 dark:bg-red-950/20">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{apiError}</AlertDescription>
              </Alert>
            )}

            {isRegister ? (
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                  <FormField
                    control={registerForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="john_doe"
                            {...field}
                            data-testid="input-username-register"
                            disabled={isLoading}
                            className="transition"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="you@example.com"
                            {...field}
                            data-testid="input-email"
                            disabled={isLoading}
                            className="transition"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••"
                              {...field}
                              data-testid="input-password-register"
                              disabled={isLoading}
                              className="pr-10 transition"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                              data-testid="button-toggle-password"
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="••••••"
                              {...field}
                              data-testid="input-confirm-password"
                              disabled={isLoading}
                              className="pr-10 transition"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                              data-testid="button-toggle-confirm-password"
                            >
                              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="monthlyIncome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monthly Income (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="5000"
                            {...field}
                            data-testid="input-income"
                            disabled={isLoading}
                            className="transition"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold"
                    disabled={isLoading}
                    data-testid="button-register"
                  >
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>
              </Form>
            ) : (
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username or Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your username"
                            {...field}
                            data-testid="input-username-login"
                            disabled={isLoading}
                            className="transition"
                            autoComplete="username"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••"
                              {...field}
                              data-testid="input-password-login"
                              disabled={isLoading}
                              className="pr-10 transition"
                              autoComplete="current-password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                              data-testid="button-toggle-login-password"
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold"
                    disabled={isLoading}
                    data-testid="button-login"
                  >
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </Form>
            )}

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-slate-950 text-gray-500">
                  {isRegister ? "Already have an account?" : "New to FinanceAI?"}
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={handleToggleMode}
              className="w-full border-blue-200 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-950/30"
              disabled={isLoading}
              data-testid="button-toggle-auth"
            >
              {isRegister ? "Sign In Instead" : "Create New Account"}
            </Button>

            {!isRegister && (
              <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 p-4 space-y-2">
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">Demo Account</p>
                <p className="text-xs text-blue-800 dark:text-blue-300">
                  <span className="font-mono">username: demo</span>
                </p>
                <p className="text-xs text-blue-800 dark:text-blue-300">
                  <span className="font-mono">password: Demo123</span>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>Your financial data is secured and stored locally in your browser</p>
        </div>
      </div>
    </div>
  );
}
