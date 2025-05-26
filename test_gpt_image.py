#!/usr/bin/env python3
"""
Test script for GPT-image-1 integration
This script tests the basic functionality of the updated application
"""

import os
import sys
import requests
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_api_connection():
    """Test if OpenAI API key is configured and working"""
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key or api_key == "your_openai_api_key_here":
        print("❌ OpenAI API key not configured")
        return False

    print("✅ OpenAI API key found")
    return True

def test_app_startup():
    """Test if the Flask app can start without errors"""
    try:
        # Import the app to check for any import errors
        from app import app, client
        print("✅ App imports successfully")

        # Test OpenAI client initialization
        try:
            models = client.models.list()
            
            # Print available image models
            print("\nAvailable image models:")
            image_models_found = False
            for model in models.data:
                if 'image' in model.id.lower():
                    print(f"  - {model.id}")
                    image_models_found = True
            
            if not image_models_found:
                print("  No models with 'image' in their ID found")
            print("\n✅ OpenAI client connection successful")
        except Exception as e:
            print(f"❌ OpenAI client connection failed: {e}")
            return False

        return True
    except Exception as e:
        print(f"❌ App startup failed: {e}")
        return False

def test_generate_endpoint():
    """Test the /generate endpoint with a simple request"""
    try:
        # Start the app in test mode
        from app import app
        app.config['TESTING'] = True

        with app.test_client() as client:
            # Test data for GPT-image-1
            test_data = {
                "prompt": "A simple red circle on white background",
                "model": "gpt-image-1",
                "size": "1024x1024",
                "quality": "high"
            }

            print("🧪 Testing /generate endpoint...")
            response = client.post('/generate',
                                 data=json.dumps(test_data),
                                 content_type='application/json')

            if response.status_code == 200:
                data = response.get_json()
                if data.get('success'):
                    print("✅ Generate endpoint test successful")
                    return True
                else:
                    print(f"❌ Generate endpoint returned error: {data.get('error')}")
                    return False
            else:
                print(f"❌ Generate endpoint returned status {response.status_code}")
                return False

    except Exception as e:
        print(f"❌ Generate endpoint test failed: {e}")
        return False

def main():
    """Run all tests"""
    print("🚀 Testing GPT-image-1 Integration")
    print("=" * 40)

    tests = [
        ("API Configuration", test_api_connection),
        ("App Startup", test_app_startup),
        ("Generate Endpoint", test_generate_endpoint)
    ]

    passed = 0
    total = len(tests)

    for test_name, test_func in tests:
        print(f"\n📋 Running {test_name} test...")
        if test_func():
            passed += 1
        else:
            print(f"💥 {test_name} test failed")

    print("\n" + "=" * 40)
    print(f"📊 Test Results: {passed}/{total} tests passed")

    if passed == total:
        print("🎉 All tests passed! Your GPT-image-1 integration is ready!")
        return True
    else:
        print("⚠️  Some tests failed. Please check the configuration.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
