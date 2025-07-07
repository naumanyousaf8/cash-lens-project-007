#!/usr/bin/env python3
"""
CashLens.ai - Run Script
Simple script to start the Flask application
"""

import os
import sys

def main():
    """Main function to run the application"""
    print("🚀 Starting CashLens.ai...")
    print("📍 Pakistani Currency Recognition System")
    print("="*50)
    
    # Import and run the Flask app
    try:
        from app import app
        
        print("✅ Flask application imported successfully")
        print("🌐 Server will be available at: http://localhost:5000")
        print("📱 Main page: http://localhost:5000")
        print("📤 Upload page: http://localhost:5000/upload")
        print("🏥 Health check: http://localhost:5000/health")
        print("="*50)
        
        # Run the application
        app.run(debug=True, host='0.0.0.0', port=5000)
        
    except ImportError as e:
        print(f"❌ Import Error: {e}")
        print("💡 Make sure to install dependencies: pip install -r requirements.txt")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error starting application: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 