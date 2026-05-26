import urllib.request
import json
import sys

def main():
    print("Running QA TASK 1 & 2: Backend and Swagger Audit...")
    try:
        # Check health
        req = urllib.request.Request("http://127.0.0.1:8000/api/v1/health")
        try:
            with urllib.request.urlopen(req) as response:
                if response.status != 200:
                    print(f"FAIL: /health returned {response.status}")
                    sys.exit(1)
        except Exception as e:
            print(f"FAIL: /health request failed: {e}")
            sys.exit(1)
        
        print("PASS: Backend is running and serving traffic.")

        # Check Swagger
        req = urllib.request.Request("http://127.0.0.1:8000/openapi.json")
        try:
            with urllib.request.urlopen(req) as response:
                if response.status != 200:
                    print(f"FAIL: /openapi.json returned {response.status}")
                    sys.exit(1)
                data = json.loads(response.read().decode('utf-8'))
        except Exception as e:
            print(f"FAIL: /openapi.json request failed: {e}")
            sys.exit(1)
        paths = data.get("paths", {})
        
        # Verify required tags/routers exist
        required_tags = {"Authentication", "Master Data", "Complaints", "Officer", "Leadership", "Volunteer", "Projects", "Notifications", "Analytics"}
        found_tags = set()
        
        for path, methods in paths.items():
            for method, details in methods.items():
                for tag in details.get("tags", []):
                    found_tags.add(tag)
        
        missing_tags = required_tags - found_tags
        if missing_tags:
            print(f"FAIL: Missing routers/tags in Swagger: {missing_tags}")
            sys.exit(1)
            
        print("PASS: All required Swagger API routers are registered and healthy.")
        print("QA TASK 1 & 2 COMPLETED SUCCESSFULLY.")
        
    except Exception as e:
        print(f"FAIL: Exception during test: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
