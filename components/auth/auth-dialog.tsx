"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/store/auth-store";
import { authLogin, authRegister } from "@/service/auth";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Login fields
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");

  // Register fields
  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [verifyCode, setVerifyCode] = useState("");

  const setAuth = useAuthStore((s) => s.setAuth);

  const handleLogin = async () => {
    if (!account || !password) {
      setError("Please fill in all fields");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await authLogin({ account, password });
      if (res.code === 20000 && res.data) {
        setAuth(res.data.token, { username: res.data.username });
        onOpenChange(false);
        resetFields();
      } else {
        setError(res.message || "Login failed");
      }
    } catch {
      setError("Login request failed");
    } finally {
      setLoading(false);
    }
  };

  const generateVerifyCode = () => {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setVerifyCode(code);
  };

  const handleRegister = async () => {
    if (!regUsername || !regPassword || !regConfirmPassword || !phone || !verifyCode) {
      setError("Please fill in all fields");
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await authRegister({
        username: regUsername,
        password: regPassword,
        phone,
        verifyCode,
      });
      if (res.code === 20000) {
        // Switch to login mode with pre-filled credentials
        setAccount(regUsername);
        setPassword(regPassword);
        setMode("login");
        setError("");
      } else {
        setError(res.message || "Registration failed");
      }
    } catch {
      setError("Registration request failed");
    } finally {
      setLoading(false);
    }
  };

  const resetFields = () => {
    setAccount("");
    setPassword("");
    setRegUsername("");
    setRegPassword("");
    setRegConfirmPassword("");
    setPhone("");
    setVerifyCode("");
    setError("");
  };

  const switchMode = (newMode: "login" | "register") => {
    setMode(newMode);
    setError("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "login" ? "Login" : "Register"}
          </DialogTitle>
          <DialogDescription>
            {mode === "login"
              ? "Sign in to your account to start chatting"
              : "Create a new account"}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="text-destructive text-sm">{error}</div>
        )}

        {mode === "login" ? (
          <div className="flex flex-col gap-3">
            <Input
              placeholder="Account"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
            <Button onClick={handleLogin} disabled={loading} style={{ cursor: "pointer" }}>
              {loading ? "Logging in..." : "Login"}
            </Button>
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground text-sm underline-offset-4 hover:underline"
              style={{ cursor: "pointer" }}
              onClick={() => switchMode("register")}
            >
              Don&apos;t have an account? Register
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Username</label>
              <Input
                placeholder="Username"
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Password</label>
              <Input
                type="password"
                placeholder="Password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Confirm Password</label>
              <Input
                type="password"
                placeholder="Confirm Password"
                value={regConfirmPassword}
                onChange={(e) => setRegConfirmPassword(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Phone</label>
              <Input
                placeholder="Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Verification Code</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Verification Code"
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleRegister()}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={generateVerifyCode}
                  style={{ cursor: "pointer" }}
                  className="shrink-0"
                >
                  Send Code
                </Button>
              </div>
            </div>
            <Button onClick={handleRegister} disabled={loading} style={{ cursor: "pointer" }}>
              {loading ? "Registering..." : "Register"}
            </Button>
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground text-sm underline-offset-4 hover:underline"
              style={{ cursor: "pointer" }}
              onClick={() => switchMode("login")}
            >
              Already have an account? Login
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
