import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Heart } from "lucide-react";

export default function NotFound() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Heart className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle className="font-display text-3xl">Lost in the Dots</CardTitle>
          <CardDescription className="text-base">
            This page doesn't exist, but your secret adventure awaits!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            size="lg"
            className="w-full"
            onClick={() => navigate("/")}
            data-testid="button-go-home"
          >
            <Home className="h-4 w-4 mr-2" />
            Go Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
