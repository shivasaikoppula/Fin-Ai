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
import { DollarSign } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  monthlyIncome: z.string().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export default function LoginRegister() {
  const [, setLocation] = useLocation();
  const [isRegister, setIsRegister] = useState(false);
  const { toast } = useToast();

  // Initialize demo user on first load
  React.useEffect(() => {
    const users = localStorage.getItem("finance_users");
    if (!users) {
      const demoUser = {
        id: "user_demo",
        username: "demo",
        email: "demo@example.com",
        password: "demo123",
        monthlyIncome: "5000",
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem("finance_users", JSON.stringify({ user_demo: demoUser }));
    }
  }, []);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: "", email: "", password: "", monthlyIncome: "" },
  });

  const handleLogin = (data: LoginFormData) => {
    const storedUsers = JSON.parse(localStorage.getItem("finance_users") || "{}");
    const user = Object.values(storedUsers).find((u: any) => u.username === data.username);

    if (!user || (user as any).password !== data.password) {
      toast({
        title: "Login Failed",
        description: "Invalid username or password",
        variant: "destructive",
      });
      return;
    }

    localStorage.setItem("currentUser", JSON.stringify(user));
    toast({
      title: "Login Successful",
      description: `Welcome back, ${data.username}!`,
    });
    setLocation("/dashboard");
  };

  const handleRegister = (data: RegisterFormData) => {
    const storedUsers = JSON.parse(localStorage.getItem("finance_users") || "{}");
    const userExists = Object.values(storedUsers).some(
      (u: any) => u.username === data.username || u.email === data.email
    );

    if (userExists) {
      toast({
        title: "Registration Failed",
        description: "Username or email already exists",
        variant: "destructive",
      });
      return;
    }

    const newUser = {
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
    setLocation("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <CardTitle className="text-2xl">FinanceAI</CardTitle>
          <CardDescription>
            {isRegister ? "Create your account" : "Sign in to your account"}
          </CardDescription>
        </CardHeader>

        <CardContent>
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
                        <Input placeholder="Choose a username" {...field} data-testid="input-username-register" />
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
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="your@email.com" {...field} data-testid="input-email" />
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
                        <Input type="password" placeholder="••••••" {...field} data-testid="input-password-register" />
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
                        <Input type="number" placeholder="0" {...field} data-testid="input-income" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" data-testid="button-register">
                  Create Account
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
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your username" {...field} data-testid="input-username-login" />
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
                        <Input type="password" placeholder="••••••" {...field} data-testid="input-password-login" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" data-testid="button-login">
                  Sign In
                </Button>
              </form>
            </Form>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isRegister ? "Already have an account?" : "Don't have an account?"}
            </p>
            <Button
              variant="ghost"
              onClick={() => {
                setIsRegister(!isRegister);
                loginForm.reset();
                registerForm.reset();
              }}
              className="mt-2 text-blue-600 dark:text-blue-400"
              data-testid="button-toggle-auth"
            >
              {isRegister ? "Sign In" : "Create Account"}
            </Button>
          </div>

          {!isRegister && (
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Demo Credentials:</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Username: demo</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Password: demo123</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
