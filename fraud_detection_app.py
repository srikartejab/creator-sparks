from supabase import create_client, Client
from flask import Flask, jsonify, request
from datetime import datetime, timedelta
import logging
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Supabase configuration
SUPABASE_URL = os.getenv('SUPABASE_URL')
# Get service role key from environment variable for security
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    raise RuntimeError(
        "Missing SUPABASE_URL or SUPABASE_SERVICE_KEY. Set both environment variables before starting."
    )

# Create Supabase client with service role key (bypasses RLS)
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
app = Flask(__name__)

# Test Supabase connection
def test_supabase_connection():
    try:
        # Test connection by querying a simple table
        result = supabase.table("posts").select("id").limit(1).execute()
        logger.info("Supabase connection successful")
        return True
    except Exception as e:
        logger.error(f"Supabase connection failed: {e}")
        return False

# 1. Detect Suspicious Engagement Patterns
def detect_suspicious_engagement():
    try:
        # Get posts with unusually high engagement rates
        posts = supabase.table("posts").select("*").execute()
        
        alerts = []
        for post in posts.data:
            # Calculate engagement rate
            total_engagement = (post.get('likes_count', 0) + 
                              post.get('comments_count', 0) + 
                              post.get('shares_count', 0))
            views = post.get('views_count', 1)
            engagement_rate = (total_engagement / views) * 100 if views > 0 else 0
            
            # Flag if engagement rate > 15% (unusually high)
            if engagement_rate > 15 and total_engagement > 100:
                alert = {
                    "post_id": post['id'],
                    "alert_type": "Suspicious Engagement",
                    "severity": "high",
                    "description": f"Post has {engagement_rate:.1f}% engagement rate ({total_engagement} total engagements on {views} views)",
                    "detected_at": datetime.now().isoformat(),
                    "is_resolved": False
                }
                
                # Check if alert already exists
                existing = supabase.table("fraud_alerts").select("id").eq("post_id", post['id']).eq("alert_type", "Suspicious Engagement").execute()
                if not existing.data:
                    supabase.table("fraud_alerts").insert(alert).execute()
                    alerts.append(alert)
        
        return alerts
    except Exception as e:
        logger.error(f"Error in detect_suspicious_engagement: {e}")
        return []

# 2. Detect Rapid Earnings Growth
def detect_rapid_earnings_growth():
    try:
        # Get posts with unusually high earnings for their view count
        posts = supabase.table("posts").select("*").execute()
        
        alerts = []
        for post in posts.data:
            views = post.get('views_count', 1)
            earnings = float(post.get('total_earnings', 0))
            
            # Calculate earnings per 1k views
            earnings_per_1k = (earnings / views * 1000) if views > 0 else 0
            
            # Flag if earnings per 1k views > $50 (unusually high)
            if earnings_per_1k > 50 and earnings > 100:
                alert = {
                    "post_id": post['id'],
                    "alert_type": "Suspicious Earnings",
                    "severity": "high",
                    "description": f"Post earning ${earnings_per_1k:.2f} per 1k views (${earnings:.2f} total on {views} views)",
                    "detected_at": datetime.now().isoformat(),
                    "is_resolved": False
                }
                
                # Check if alert already exists
                existing = supabase.table("fraud_alerts").select("id").eq("post_id", post['id']).eq("alert_type", "Suspicious Earnings").execute()
                if not existing.data:
                    supabase.table("fraud_alerts").insert(alert).execute()
                    alerts.append(alert)
        
        return alerts
    except Exception as e:
        logger.error(f"Error in detect_rapid_earnings_growth: {e}")
        return []

# 3. Detect Frozen Account Patterns
def detect_frozen_patterns():
    try:
        # Get user posts grouped by user to detect patterns
        posts = supabase.table("posts").select("*").execute()
        
        # Group by user_id
        user_posts = {}
        for post in posts.data:
            user_id = post['user_id']
            if user_id not in user_posts:
                user_posts[user_id] = []
            user_posts[user_id].append(post)
        
        alerts = []
        for user_id, posts_list in user_posts.items():
            frozen_count = sum(1 for post in posts_list if post.get('is_frozen'))
            total_posts = len(posts_list)
            
            # Flag if >50% of posts are frozen and user has >3 posts
            if total_posts > 3 and frozen_count / total_posts > 0.5:
                # Get profile info
                profile = supabase.table("profiles").select("*").eq("user_id", user_id).execute()
                username = profile.data[0].get('username', 'Unknown') if profile.data else 'Unknown'
                
                alert = {
                    "post_id": posts_list[0]['id'],  # Use first post as reference
                    "alert_type": "Suspicious Account Pattern",
                    "severity": "medium",
                    "description": f"User {username} has {frozen_count}/{total_posts} posts frozen ({frozen_count/total_posts*100:.1f}%)",
                    "detected_at": datetime.now().isoformat(),
                    "is_resolved": False
                }
                
                # Check if alert already exists for this user
                existing = supabase.table("fraud_alerts").select("id").eq("alert_type", "Suspicious Account Pattern").eq("description", alert["description"]).execute()
                if not existing.data:
                    supabase.table("fraud_alerts").insert(alert).execute()
                    alerts.append(alert)
        
        return alerts
    except Exception as e:
        logger.error(f"Error in detect_frozen_patterns: {e}")
        return []

# 4. Detect Low Quality Content
def detect_low_quality_content():
    try:
        # Get posts with quality assessments using proper Supabase client
        posts_with_qa = supabase.table("posts").select("""
            *,
            quality_assessments!inner(
                engagement_score,
                video_quality_score,
                originality_score,
                overall_grade,
                is_final
            )
        """).eq("quality_assessments.is_final", True).execute()
        
        alerts = []
        for post in posts_with_qa.data if posts_with_qa.data else []:
            # Extract quality assessment data
            qa_data = post.get('quality_assessments', [{}])[0] if post.get('quality_assessments') else {}
            # Flag posts with poor overall grades or low engagement
            grade = qa_data.get('overall_grade', '').upper()
            engagement_score = qa_data.get('engagement_score', 100)
            originality_score = qa_data.get('originality_score', True)
            
            # Check for low quality indicators
            if grade in ['D', 'F'] or engagement_score < 30 or not originality_score:
                # Create detailed description based on quality issues
                issues = []
                if grade in ['D', 'F']:
                    issues.append(f"quality grade {grade}")
                if engagement_score < 30:
                    issues.append(f"{engagement_score}% engagement score")
                if not originality_score:
                    issues.append("non-original content")
                
                alert = {
                    "post_id": post['id'],
                    "alert_type": "Low Quality Content",
                    "severity": "medium" if not originality_score else "low",
                    "description": f"Post flagged for: {', '.join(issues)}",
                    "detected_at": datetime.now().isoformat(),
                    "is_resolved": False
                }
                
                # Check if alert already exists
                existing = supabase.table("fraud_alerts").select("id").eq("post_id", post['id']).eq("alert_type", "Low Quality Content").execute()
                if not existing.data:
                    supabase.table("fraud_alerts").insert(alert).execute()
                    alerts.append(alert)
        
        return alerts
    except Exception as e:
        logger.error(f"Error in detect_low_quality_content: {e}")
        return []

# API endpoint to trigger fraud detection
@app.route('/api/detect_fraud', methods=['POST'])
def run_fraud_detection():
    # Test connection first
    if not test_supabase_connection():
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        # Run all fraud detection checks
        suspicious_engagement = detect_suspicious_engagement()
        rapid_earnings = detect_rapid_earnings_growth()
        frozen_patterns = detect_frozen_patterns()
        low_quality = detect_low_quality_content()
        
        # Combine all alerts
        all_alerts = suspicious_engagement + rapid_earnings + frozen_patterns + low_quality
        
        return jsonify({
            "success": True,
            "alerts_created": len(all_alerts),
            "breakdown": {
                "suspicious_engagement": len(suspicious_engagement),
                "rapid_earnings": len(rapid_earnings),
                "frozen_patterns": len(frozen_patterns),
                "low_quality": len(low_quality)
            },
            "alerts": all_alerts
        }), 200
        
    except Exception as e:
        logger.error(f"Error in fraud detection: {e}")
        return jsonify({"error": str(e)}), 500

# API endpoint to get all fraud alerts
@app.route('/api/fraud_alerts', methods=['GET'])
def get_fraud_alerts():
    try:
        # Get fraud alerts with post and profile information
        fraud_alerts = supabase.table("fraud_alerts").select("""
            *,
            posts:post_id(title, user_id, views_count, total_earnings),
            posts.profiles:user_id(username, display_name)
        """).order('created_at', desc=True).execute()
        
        return jsonify({
            "success": True,
            "alerts": fraud_alerts.data
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting fraud alerts: {e}")
        return jsonify({"error": str(e)}), 500

# API endpoint to resolve fraud alert
@app.route('/api/fraud_alerts/<alert_id>/resolve', methods=['POST'])
def resolve_fraud_alert(alert_id):
    if not test_supabase_connection():
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        result = supabase.table("fraud_alerts").update({
            "is_resolved": True,
            "resolved_at": datetime.now().isoformat()
        }).eq("id", alert_id).execute()
        
        return jsonify({
            "success": True,
            "message": "Alert resolved successfully"
        }), 200
        
    except Exception as e:
        logger.error(f"Error resolving alert: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("Starting Fraud Detection Service...")
    print("Configuration:")
    print(f"- Supabase URL: {SUPABASE_URL}")
    print(f"- Service Key: {'Set' if SUPABASE_SERVICE_KEY else 'Missing'}")
    print("\nSetup instructions:")
    print("1. Set SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables")
    print("2. Run on a schedule (cron job) or trigger via webhook")
    print("3. Access endpoints:")
    print("   - POST /api/detect_fraud - run fraud detection")
    print("   - GET /api/fraud_alerts - get all alerts")
    print("   - POST /api/fraud_alerts/<id>/resolve - resolve alert")
    
    # Test connection on startup
    if test_supabase_connection():
        print("Database connection successful")
        app.run(host='0.0.0.0', port=5000, debug=False)
    else:
        print("Database connection failed - check your service key")
        exit(1)
