import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Mail, Lock, User, Phone } from "lucide-react";
import { apiRequest } from "@/lib/api";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  mobile: z.string().regex(/^[6-9]\d{9}$/, "Please enter a valid Indian mobile number"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  emailNotifications: z.boolean().default(true),
  smsNotifications: z.boolean().default(true),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  onSuccess: (user: any) => void;
  onToggleMode: () => void;
}

export default function RegisterForm({ onSuccess, onToggleMode }: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      emailNotifications: true,
      smsNotifications: true,
    },
  });

  const emailNotifications = watch("emailNotifications");
  const smsNotifications = watch("smsNotifications");

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError("");

    try {
      const { confirmPassword, ...registerData } = data;
      const response = await apiRequest("POST", "/auth/register", registerData);
      localStorage.setItem("user", JSON.stringify(response.user));
      localStorage.setItem("token", response.token);
      onSuccess(response.user);
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
        <CardDescription>
          Join SpendTrack to manage your finances
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                className="pl-10"
                {...register("name")}
              />
            </div>
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="pl-10"
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="mobile">Mobile Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="mobile"
                type="tel"
                placeholder="Enter 10-digit mobile number"
                className="pl-10"
                {...register("mobile")}
              />
            </div>
            {errors.mobile && (
              <p className="text-sm text-red-500">{errors.mobile.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                className="pl-10 pr-10"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                className="pl-10 pr-10"
                {...register("confirmPassword")}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
            )}
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Notification Preferences</Label>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="emailNotifications"
                checked={emailNotifications}
                onCheckedChange={(checked) => setValue("emailNotifications", !!checked)}
              />
              <Label htmlFor="emailNotifications" className="text-sm">
                Email notifications for bill reminders
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="smsNotifications"
                checked={smsNotifications}
                onCheckedChange={(checked) => setValue("smsNotifications", !!checked)}
              />
              <Label htmlFor="smsNotifications" className="text-sm">
                SMS notifications for bill reminders
              </Label>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>

          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{" "}
              <button
                type="button"
                onClick={onToggleMode}
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Sign in
              </button>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}