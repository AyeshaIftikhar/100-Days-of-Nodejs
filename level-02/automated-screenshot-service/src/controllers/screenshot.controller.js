import { newPage } from '../services/puppeteer.js';

/**
 * Take a screenshot of a webpage
 */
export async function takeScreenshotHandler(req, res) {
    try {
        const {
            url,
            width = 1920,
            height = 1080,
            fullPage = false,
            deviceScaleFactor = 1,
            format = 'png',
            quality,
            delayMs = 0,
            waitUntil = 'networkidle0'
        } = req.body;

        const page = await newPage();
        try {
            await page.setViewport({
                width: parseInt(width),
                height: parseInt(height),
                deviceScaleFactor: parseFloat(deviceScaleFactor)
            });

            await page.goto(url, { waitUntil });

            if (delayMs > 0) {
                await new Promise(resolve => setTimeout(resolve, delayMs));
            }

            const screenshot = await page.screenshot({
                fullPage,
                type: format,
                quality: quality ? parseInt(quality) : undefined
            });

            res.type(`image/${format}`);
            res.send(screenshot);
        } finally {
            await page.close();
        }
    } catch (error) {
        console.error('Screenshot error:', error);
        res.status(500).json({
            error: 'Failed to take screenshot',
            message: error.message
        });
    }
}

/**
 * Generate a PDF of a webpage
 */
export async function takePdfHandler(req, res) {
    try {
        const {
            url,
            format = 'A4',
            printBackground = true,
            margin = { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' },
            delayMs = 0,
            waitUntil = 'networkidle0'
        } = req.body;

        const page = await newPage();
        try {
            await page.goto(url, { waitUntil });

            if (delayMs > 0) {
                await new Promise(resolve => setTimeout(resolve, delayMs));
            }

            const pdf = await page.pdf({
                format,
                printBackground,
                margin
            });

            res.type('application/pdf');
            res.send(pdf);
        } finally {
            await page.close();
        }
    } catch (error) {
        console.error('PDF error:', error);
        res.status(500).json({
            error: 'Failed to generate PDF',
            message: error.message
        });
    }
}
