#!/usr/bin/env python3
"""
Quick test script for QR Creator SharePoint solution
Tests server availability and basic functionality
"""

import requests
import time
import subprocess
import sys
from urllib.parse import urlparse

# Configuration
SERVER_URL = "https://localhost:4321"
SHAREPOINT_TEST_URL = "https://gustafkliniken.sharepoint.com/sites/Test/_layouts/15/workbench.aspx?debug=true&noredir=true&debugManifestsFile=https://localhost:4321/temp/build/manifests.js"

def check_server_running():
    """Check if the development server is running"""
    print("🔍 Checking if development server is running...")
    try:
        # Disable SSL verification for localhost development
        response = requests.get(f"{SERVER_URL}/temp/build/manifests.js", 
                              verify=False, 
                              timeout=5)
        if response.status_code == 200:
            print("✅ Server is running and responding!")
            return True
        else:
            print(f"❌ Server responded with status: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Server is not responding: {str(e)}")
        return False

def start_server():
    """Try to start the development server"""
    print("🚀 Attempting to start development server...")
    try:
        # Run the npm start command
        process = subprocess.Popen(
            ["npm", "run", "serve:nobrowser"],
            cwd="C:\\code\\QRskapare",
            shell=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        
        print("⏳ Waiting for server to start (30 seconds)...")
        time.sleep(30)
        
        # Check if server is now running
        return check_server_running()
        
    except Exception as e:
        print(f"❌ Failed to start server: {str(e)}")
        return False

def test_sharepoint_page():
    """Test if SharePoint test page loads"""
    print("🌐 Testing SharePoint test page access...")
    try:
        # This will likely fail due to CORS/SSL but we can check if it's reachable
        response = requests.get(SHAREPOINT_TEST_URL, timeout=10)
        print(f"✅ SharePoint page responded with status: {response.status_code}")
        return True
    except requests.exceptions.RequestException as e:
        print(f"⚠️  SharePoint page test (expected to fail in script): {str(e)}")
        print("💡 This is normal - SharePoint requires browser authentication")
        return False

def open_test_page():
    """Open the SharePoint test page in default browser"""
    print("🌍 Opening SharePoint test page in browser...")
    try:
        import webbrowser
        webbrowser.open(SHAREPOINT_TEST_URL)
        print("✅ Browser should open with test page!")
        return True
    except Exception as e:
        print(f"❌ Failed to open browser: {str(e)}")
        return False

def main():
    """Main test function"""
    print("=" * 60)
    print("🧪 QR Creator SharePoint Solution Test")
    print("=" * 60)
    
    # Step 1: Check if server is already running
    if not check_server_running():
        # Step 2: Try to start server if not running
        if not start_server():
            print("\n❌ Could not start development server")
            print("💡 Try running manually: npm run serve:nobrowser")
            return False
    
    # Step 3: Test SharePoint page (informational)
    test_sharepoint_page()
    
    # Step 4: Open test page in browser
    open_test_page()
    
    print("\n" + "=" * 60)
    print("📋 Test Summary:")
    print("✅ Server Status: Running")
    print("✅ Test Page: Opened in browser")
    print("🔗 Test URL:", SHAREPOINT_TEST_URL)
    print("\n💡 Manual Testing Steps:")
    print("1. Upload a Word document with placeholders:")
    print("   - {{TITLE_PLACEHOLDER}}")
    print("   - {{BODY_PLACEHOLDER}}")
    print("   - {{QR_CODE_1}}, {{QR_CODE_2}}, etc.")
    print("   - {{QR_TITLE_1}}, {{QR_TITLE_2}}, etc.")
    print("2. Fill in the form fields")
    print("3. Click 'Send' to generate document")
    print("4. Check the downloaded document for QR codes")
    print("=" * 60)
    
    return True

if __name__ == "__main__":
    # Disable SSL warnings for localhost testing
    import urllib3
    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
    
    try:
        main()
    except KeyboardInterrupt:
        print("\n🛑 Test interrupted by user")
    except Exception as e:
        print(f"\n❌ Test failed with error: {str(e)}")
        sys.exit(1)