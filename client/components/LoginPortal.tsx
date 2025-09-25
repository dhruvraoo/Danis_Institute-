import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { useToast } from "@/hooks/use-toast";

export default function LoginPortal() {
  const [userType, setUserType] = useState('student'); // student, faculty, or principal
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const endpoint = userType === 'student' 
      ? '/api/student/login'
      : userType === 'faculty' 
        ? '/api/faculty/login' 
        : '/api/principal/login';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: data.message,
        });
        
        // Store auth token
        localStorage.setItem('authToken', data.auth_token);
        
        // Redirect based on user type
        if (data.redirect_to) {
          window.location.href = data.redirect_to;
        } else {
          window.location.href = userType === 'student' 
            ? '/student-dashboard'
            : userType === 'faculty' 
              ? '/teacher-dashboard'
              : '/principal-dashboard';
        }
      } else {
        toast({
          title: "Error",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred during login",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-[350px] mx-auto">
      <CardHeader>
        <CardTitle>Welcome Back</CardTitle>
        <CardDescription>Please login to access your dashboard</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <div className="flex gap-4 mb-4">
              <Button
                type="button"
                variant={userType === 'student' ? 'default' : 'outline'}
                onClick={() => setUserType('student')}
              >
                Student
              </Button>
              <Button
                type="button"
                variant={userType === 'faculty' ? 'default' : 'outline'}
                onClick={() => setUserType('faculty')}
              >
                Faculty
              </Button>
              <Button
                type="button"
                variant={userType === 'principal' ? 'default' : 'outline'}
                onClick={() => setUserType('principal')}
              >
                Principal
              </Button>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          <Button type="submit" className="w-full">
            Login as {userType.charAt(0).toUpperCase() + userType.slice(1)}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        {userType === 'student' && (
          <p className="text-sm text-gray-500">
            Don't have an account?{" "}
            <a href="/signup/student" className="text-blue-500 hover:text-blue-700">
              Sign up here
            </a>
          </p>
        )}
      </CardFooter>
    </Card>
  );
}
