import asyncio
from playwright.async_api import async_playwright
import os

async def main():
    async with async_playwright() as p:
        # Launch browser
        browser = await p.chromium.launch(headless=True)
        # Create context
        context = await browser.new_context(
            viewport={"width": 1280, "height": 800}
        )
        page = await context.new_page()

        output_dir = r"C:\Users\Murugan\.gemini\antigravity\brain\d2b3b549-9005-4dee-b203-ffa117564672"
        os.makedirs(output_dir, exist_ok=True)

        print("Navigating to login page...")
        await page.goto("http://localhost:5173/login", wait_until="networkidle")
        await asyncio.sleep(2)
        
        # Take login page screenshot
        login_path = os.path.join(output_dir, "login_page.png")
        await page.screenshot(path=login_path)
        print(f"Saved login page screenshot to {login_path}")

        # List of roles to test
        roles_to_test = [
            {"role_val": "citizen", "email": "citizen@namnadu.gov.in", "filename": "citizen_dashboard.png"},
            {"role_val": "officer", "email": "officer@namnadu.gov.in", "filename": "officer_dashboard.png"},
            {"role_val": "leadership_admin", "email": "leadership@namnadu.gov.in", "filename": "leadership_dashboard.png"},
            {"role_val": "volunteer", "email": "volunteer@namnadu.gov.in", "filename": "volunteer_dashboard.png"}
        ]

        for role in roles_to_test:
            print(f"Logging in as {role['role_val']}...")
            await page.goto("http://localhost:5173/login", wait_until="networkidle")
            await asyncio.sleep(1)

            # Fill identifier
            await page.fill("#login-identifier", role["email"])
            # Fill password
            await page.fill("#login-password", "demo123")
            # Select role
            await page.select_option("#login-role", role["role_val"])
            
            # Click Submit
            await page.click("button[type='submit']")
            
            # Wait for dashboard to load/network to settle
            await asyncio.sleep(5)
            
            # Take screenshot of the dashboard
            screenshot_path = os.path.join(output_dir, role["filename"])
            await page.screenshot(path=screenshot_path)
            print(f"Saved dashboard screenshot to {screenshot_path}")

            # Click Logout
            try:
                await page.click("button:has-text('Logout')")
                await asyncio.sleep(2)
            except Exception as e:
                print(f"Failed to click logout button for {role['role_val']}: {e}")
                # Try navigating directly to login to clear state/cookies or clear context
                await context.clear_cookies()
                
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
