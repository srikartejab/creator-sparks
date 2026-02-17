import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Eye, Heart, MessageCircle, Share, Bookmark, DollarSign, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface PostCardProps {
  post: any; // Supabase post data with quality_assessments and fraud_alerts
  earnings: {
    basePay: number;
    bonus: number;
    total: number;
    tikTokCut: number;
    creatorEarning: number;
  };
}

export const PostCard = ({ post, earnings }: PostCardProps) => {
  const navigate = useNavigate();
  
  // Fetch fraud alerts for this post
  const { data: fraudAlerts } = useQuery({
    queryKey: ['fraudAlerts', post.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fraud_alerts')
        .select('*')
        .eq('post_id', post.id)
        .eq('is_resolved', false);
      
      if (error) throw error;
      return data || [];
    },
  });

  const handleViewDetails = () => {
    navigate(`/post/${post.id}`, { state: { post, earnings } });
  };

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

  const fraudDetected = post.fraud_alerts && post.fraud_alerts.length > 0;
  const qualityAssessment = post.quality_assessments?.[0]; // Get latest assessment
  const grade = qualityAssessment?.overall_grade || 'B';
  const daysAgo = getDaysAgo(post.posted_at);

  return (
    <Card className="bg-card border-border overflow-hidden">
        <div className="relative">
          <img
            src={post.thumbnail_url || `/thumbnails/${post.title.toLowerCase().replace(/\s+/g, '-')}.jpg`}
            alt={post.title}
            className="w-full h-48 object-cover rounded-lg"
          />
          
          {/* Fraud Alert Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {post.is_frozen && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                FROZEN
              </Badge>
            )}
            {fraudAlerts && fraudAlerts.length > 0 && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <Shield className="w-3 h-3" />
                {fraudAlerts.length} ALERT{fraudAlerts.length > 1 ? 'S' : ''}
              </Badge>
            )}
          </div>
          
          {/* Date Badge */}
          <Badge variant="secondary" className="absolute top-2 right-2">
            {getDaysAgo(post.posted_at)} days ago
          </Badge>
        </div>

      <div className="p-4 space-y-4">
        {/* Post Title */}
        <h3 className="font-medium text-foreground truncate">{post.title}</h3>
        
        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center space-x-1 text-muted-foreground">
            <Eye className="w-3 h-3" />
            <span>{formatNumber(post.views_count)}</span>
          </div>
          <div className="flex items-center space-x-1 text-muted-foreground">
            <Heart className="w-3 h-3" />
            <span>{formatNumber(post.likes_count)}</span>
          </div>
          <div className="flex items-center space-x-1 text-muted-foreground">
            <MessageCircle className="w-3 h-3" />
            <span>{formatNumber(post.comments_count)}</span>
          </div>
          <div className="flex items-center space-x-1 text-muted-foreground">
            <Share className="w-3 h-3" />
            <span>{formatNumber(post.shares_count)}</span>
          </div>
        </div>

        {/* Earnings Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Earnings</span>
            <Badge variant={grade === 'A' ? 'default' : 'secondary'}>
              Grade {grade}
            </Badge>
          </div>
          
          {post.is_frozen ? (
            <div className="text-sm text-muted-foreground">
              <span className="line-through">{formatCurrency(earnings.creatorEarning)}</span>
              <p className="text-xs text-destructive mt-1">{post.freeze_reason || 'Amount frozen - contact TikTok to appeal'}</p>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Base Pay:</span>
                <span className="text-foreground">{formatCurrency(earnings.basePay)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Bonus:</span>
                <span className="text-success">{formatCurrency(earnings.bonus)}</span>
              </div>
              <div className="flex justify-between text-sm font-medium">
                <span className="text-foreground">Your Earning:</span>
                <span className="text-success">{formatCurrency(earnings.creatorEarning)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Quality Assessment */}
        {qualityAssessment && (
          <div className="space-y-2">
            <span className="text-sm font-medium text-foreground">Quality Assessment</span>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Engagement</span>
                  <span className="text-foreground">{qualityAssessment.engagement_score || 0}</span>
                </div>
                {fraudDetected && (
                  <p className="text-xs text-destructive mt-1">Suspected botting detected</p>
                )}
              </div>
              
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Video Quality:</span>
                <span className="text-foreground capitalize">{qualityAssessment.video_quality_score || 'good'}</span>
              </div>
              
              {qualityAssessment.originality_score === false && (
                <p className="text-xs text-destructive">Content flagged as not original</p>
              )}
              {qualityAssessment.originality_score === true && (
                <p className="text-xs text-success">Content verified as original</p>
              )}
              {qualityAssessment.originality_score === null && (
                <p className="text-xs text-muted-foreground">Originality check pending...</p>
              )}
            </div>
          </div>
        )}

        <Button 
          onClick={handleViewDetails}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          View Details
        </Button>
      </div>
    </Card>
  );
};