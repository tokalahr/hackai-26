import { Link } from "react-router";
import { motion } from "motion/react";
import { Home, AlertCircle } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full"
      >
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-red-100 rounded-full">
                <AlertCircle className="w-16 h-16 text-red-600" />
              </div>
            </div>
            <CardTitle className="text-3xl">404 - Page Not Found</CardTitle>
            <CardDescription className="text-base">
              Oops! The page you're looking for doesn't exist.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-slate-600">
              The page may have been moved, deleted, or the URL might be incorrect.
            </p>
            <Link to="/home">
              <Button className="w-full" size="lg">
                <Home className="mr-2 w-5 h-5" />
                Return to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
