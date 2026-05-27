import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        await page.goto('http://localhost:5173/mla/login')
        await page.fill('input[type="text"]', 'TN-MLA-CHENNAI-001')
        await page.fill('input[type="password"]', 'demo123')
        await page.click('button[type="submit"]')
        try:
            await page.wait_for_url('**/dashboard/mla*', timeout=5000)
            print('SUCCESS:', page.url)
        except Exception as e:
            print('FAILED:', page.url, e)
            print('Content length:', len(await page.content()))
            await page.screenshot(path='fail.png')
        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
