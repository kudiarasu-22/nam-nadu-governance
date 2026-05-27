import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        page.on('response', lambda response: print('<<', response.status, response.url))
        await page.goto('http://localhost:5173/mla/login')
        await page.fill('input[type="text"]', 'TN-MLA-CHENNAI-001')
        await page.fill('input[type="password"]', 'demo123')
        await page.click('button[type="submit"]')
        await page.wait_for_timeout(2000)
        await browser.close()

if __name__ == '__main__':
    asyncio.run(run())
