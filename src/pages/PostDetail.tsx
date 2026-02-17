import { useLocation, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EarningsChart } from "@/components/EarningsChart";
import { ArrowLeft, Eye, Heart, MessageCircle, Share, Bookmark, AlertTriangle, DollarSign, TrendingUp, PieChart } from "lucide-react";
const PostDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    post,
    earnings
  } = location.state || {};
  if (!post) {
    return <div>Post not found</div>;
  }
  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };
  const getDaysAgo = (dateString: string) => {
    const postDate = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - postDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Extract data from Supabase structure
  const qualityAssessment = post.quality_assessments?.[0];
  const fraudDetected = post.fraud_alerts?.length > 0 || post.is_frozen;
  const daysAgo = getDaysAgo(post.posted_at);
  const grade = qualityAssessment?.overall_grade || 'B';
  const qualityStatus = daysAgo > 30 ? 'Final Score' : 'Daily Updated Score';
  return <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-xl font-bold text-foreground">Post Analytics</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Fraud Alert */}
        {fraudDetected && <Alert className="border-destructive bg-destructive/10">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-destructive">
              <strong>Fraud Detected!</strong> {post.fraud_alerts?.[0]?.description || 'We have detected botting and suspicious activity on this post.'}
            </AlertDescription>
          </Alert>}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Video and Basic Stats */}
          <div className="space-y-6">
            <Card className="p-4 bg-card border-border">
              <img src={post.thumbnail_url || '/demo-video-1.jpg'} alt="Video thumbnail" className="w-full h-64 object-cover rounded-lg mb-4" />
              <div className="space-y-2 mb-4">
                <h2 className="text-lg font-semibold text-foreground">{post.title}</h2>
                {post.description && <p className="text-sm text-muted-foreground">{post.description}</p>}
              </div>
              <div className="flex items-center justify-between mb-4">
                <Badge variant="secondary">Posted {daysAgo} days ago</Badge>
                <Badge variant={grade === 'A' ? 'default' : 'secondary'}>
                  Grade {grade}
                </Badge>
              </div>
            </Card>

            {/* Engagement Stats */}
            <Card className="p-4 bg-card border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4">Engagement Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Eye className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Views</p>
                    <p className="font-semibold text-foreground">{formatNumber(post.views_count)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Heart className="w-4 h-4 text-tiktok-red" />
                  <div>
                    <p className="text-sm text-muted-foreground">Likes</p>
                    <p className="font-semibold text-foreground">{formatNumber(post.likes_count)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <MessageCircle className="w-4 h-4 text-tiktok-blue" />
                  <div>
                    <p className="text-sm text-muted-foreground">Comments</p>
                    <p className="font-semibold text-foreground">{formatNumber(post.comments_count)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Share className="w-4 h-4 text-success" />
                  <div>
                    <p className="text-sm text-muted-foreground">Shares</p>
                    <p className="font-semibold text-foreground">{formatNumber(post.shares_count)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Bookmark className="w-4 h-4 text-warning" />
                  <div>
                    <p className="text-sm text-muted-foreground">Saves</p>
                    <p className="font-semibold text-foreground">{formatNumber(post.saves_count)}</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Earnings and Quality */}
          <div className="space-y-6">
            {/* Earnings Breakdown */}
            <Card className="p-4 bg-card border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-success" />
                Earnings Breakdown
              </h3>
              
              {post.is_frozen ? <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total Earnings:</span>
                    <span className="font-bold text-muted-foreground line-through">
                      {formatCurrency(earnings?.creatorEarning || post.total_earnings)}
                    </span>
                  </div>
                  <Alert className="border-destructive bg-destructive/10">
                    <AlertDescription className="text-destructive">
                      {post.freeze_reason || 'Amount frozen - contact TikTok to appeal'}
                    </AlertDescription>
                  </Alert>
                </div> : <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Base Pay:</span>
                    <span className="font-semibold text-foreground">{formatCurrency(earnings?.basePay || post.base_pay)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Quality Bonus ({grade === 'A' ? '20%' : '10%'}):</span>
                    <span className="font-semibold text-success">+{formatCurrency(earnings?.bonus || post.base_pay * post.bonus_multiplier)}</span>
                  </div>
                  <div className="border-t border-border pt-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Gross:</span>
                      <span className="font-semibold text-foreground">{formatCurrency(earnings?.total || post.total_earnings)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">TikTok Fee:</span>
                      <span className="font-semibold text-destructive">-{formatCurrency(earnings?.tikTokCut || post.total_earnings * 0.3)}</span>
                    </div>
                  </div>
                  <div className="border-t border-border pt-2">
                    <div className="flex justify-between">
                      <span className="font-semibold text-foreground">Your Earnings:</span>
                      <span className="font-bold text-success text-lg">{formatCurrency(earnings?.creatorEarning || post.total_earnings * 0.7)}</span>
                    </div>
                  </div>
                </div>}
            </Card>

            {/* Quality Assessment */}
            <Card className="p-4 bg-card border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-primary" />
                Quality Assessment
              </h3>
              <p className="text-sm text-muted-foreground mb-4">{qualityStatus}</p>
              
              {qualityAssessment ? <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-foreground">Engagement Rate</span>
                      <span className="text-sm font-semibold text-foreground">
                        {((qualityAssessment.engagement_score || 0) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={(qualityAssessment.engagement_score || 0) * 100} className="h-2" />
                    {fraudDetected && <p className="text-xs text-destructive mt-1">Suspected botting detected</p>}
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm text-foreground">Video Quality:</span>
                    <span className="text-sm font-semibold text-success capitalize">
                      {qualityAssessment.video_quality_score || 'good'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-foreground">Originality:</span>
                    {qualityAssessment.originality_score ? <Badge variant="default" className="bg-success text-success-foreground">Original</Badge> : <Badge variant="destructive">Not Original</Badge>}
                  </div>

                  {!qualityAssessment.originality_score && <Alert className="border-warning bg-warning/10">
                      <AlertDescription className="text-white">
                        Your content may not be original. This affects your quality score.
                      </AlertDescription>
                    </Alert>}
                </div> : <div className="text-center py-4">
                  <p className="text-muted-foreground">Quality assessment not available</p>
                </div>}
            </Card>
          </div>
        </div>

        {/* Weekly Earnings Chart */}
        <Card className="p-6 bg-card border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
            <PieChart className="w-5 h-5 mr-2 text-primary" />
            Weekly Earnings Trend
          </h3>
          <EarningsChart />
        </Card>
      </div>
    </div>;
};
export default PostDetail;