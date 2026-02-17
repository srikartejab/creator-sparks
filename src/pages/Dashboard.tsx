import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PostCard } from "@/components/PostCard";
import { EarningsChart } from "@/components/EarningsChart";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { usePosts } from "@/hooks/usePosts";
import { useToast } from "@/hooks/use-toast";
import { User, DollarSign, TrendingUp, AlertTriangle, LogOut } from "lucide-react";

const Dashboard = () => {
  const [selectedView, setSelectedView] = useState<'overview' | 'posts'>('overview');
  const { user, signOut } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: posts = [], isLoading: postsLoading } = usePosts();
  
  // Calculate fraud alerts count (using is_frozen and fraud_alerts)
  const fraudAlerts = posts.reduce((count, post) => {
    let alertCount = 0;
    if (post.is_frozen) alertCount++;
    if (post.fraud_alerts?.length > 0) alertCount += post.fraud_alerts.length;
    return count + (alertCount > 0 ? 1 : 0); // Count posts with any alerts
  }, 0);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
    });
    navigate("/");
  };

  const calculateEarnings = (post: any) => {
    const multiplier = post.bonus_multiplier || 0;
    const bonus = post.base_pay * multiplier;
    const total = post.base_pay + bonus;
    const tikTokCut = total * 0.3; // 30% platform fee
    const creatorEarning = total - tikTokCut;
    
    return {
      basePay: post.base_pay,
      bonus,
      total,
      tikTokCut,
      creatorEarning
    };
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const totalEarnings = posts.reduce((sum, post) => sum + (post.total_earnings || 0), 0);
  const totalViews = posts.reduce((sum, post) => sum + (post.views_count || 0), 0);

  if (profileLoading || postsLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                  <span className="text-lg font-bold text-primary-foreground">T</span>
                </div>
                <h1 className="text-xl font-bold text-foreground">Creator Dashboard</h1>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm">
                  <User className="w-4 h-4 mr-2" />
                  {profile?.username || user?.email?.split('@')[0] || 'User'}
                </Button>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-6">
          {/* Navigation */}
          <div className="flex space-x-4 mb-6">
            <Button 
              variant={selectedView === 'overview' ? 'default' : 'outline'}
              onClick={() => setSelectedView('overview')}
            >
              Overview
            </Button>
            <Button 
              variant={selectedView === 'posts' ? 'default' : 'outline'}
              onClick={() => setSelectedView('posts')}
            >
              My Posts
            </Button>
          </div>

          {selectedView === 'overview' ? (
            <div className="space-y-6">
              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4 bg-card border-border">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-5 h-5 text-success" />
                    <span className="text-sm text-muted-foreground">Total Earnings</span>
                  </div>
                  <p className="text-2xl font-bold text-success">${totalEarnings.toFixed(2)}</p>
                </Card>
                
                <Card className="p-4 bg-card border-border">
                  <div className="flex items-center space-x-2">
                    <User className="w-5 h-5 text-primary" />
                    <span className="text-sm text-muted-foreground">Followers</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{formatNumber(profile?.followers_count || 0)}</p>
                </Card>

                <Card className="p-4 bg-card border-border">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <span className="text-sm text-muted-foreground">Total Views</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{formatNumber(totalViews)}</p>
                </Card>

                <Card className="p-4 bg-card border-border">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-warning" />
                    <span className="text-sm text-muted-foreground">Fraud Alerts</span>
                  </div>
                  <p className="text-2xl font-bold text-destructive">{fraudAlerts}</p>
                </Card>
              </div>

              {/* Earnings Chart */}
              <Card className="p-6 bg-card border-border">
                <h3 className="text-lg font-semibold text-foreground mb-4">Total Earnings Overview</h3>
                <EarningsChart />
              </Card>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground">No posts found. Create your first post to start earning!</p>
                </div>
              ) : (
                posts.map((post) => (
                  <PostCard 
                    key={post.id} 
                    post={post} 
                    earnings={calculateEarnings(post)} 
                  />
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Dashboard;