import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";

interface PasswordGateProps {
  children: React.ReactNode;
  password: string;
  storageKey: string;
  title?: string;
  description?: string;
}

export default function PasswordGate({
  children,
  password,
  storageKey,
  title = "Access Required",
  description = "Enter password to continue",
}: PasswordGateProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");

  useEffect(() => {
    const authStatus = localStorage.getItem(storageKey);
    if (authStatus === "authenticated") {
      setIsAuthenticated(true);
    }
  }, [storageKey]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === password) {
      setIsAuthenticated(true);
      localStorage.setItem(storageKey, "authenticated");
      toast.success("Access granted!");
    } else {
      toast.error("Incorrect password");
      setPasswordInput("");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        
        <div className="container mx-auto px-4 py-8 max-w-md">
          <Card className="mt-20">
            <CardHeader>
              <CardTitle className="text-2xl text-center">{title}</CardTitle>
              <CardDescription className="text-center">
                {description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    autoFocus
                  />
                </div>
                <Button type="submit" className="w-full">
                  Access
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
