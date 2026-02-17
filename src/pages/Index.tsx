import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="text-center space-y-6 max-w-2xl mx-auto px-4">
        <div className="space-y-4">
          <div className="w-24 h-24 mx-auto bg-primary rounded-3xl flex items-center justify-center">
            <span className="text-4xl font-bold text-primary-foreground">T</span>
          </div>
          <h1 className="text-4xl font-bold text-foreground">TikTok Creator Dashboard</h1>
          <p className="text-xl text-muted-foreground">
            Track your earnings, analyze your content performance, and grow your creator business
          </p>
        </div>
        
        <div className="space-y-4">
          <Link to="/login">
            <Button size="lg" className="px-8 py-3 text-lg">
              Get Started
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground">
            Connect your TikTok account to start tracking your earnings
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
