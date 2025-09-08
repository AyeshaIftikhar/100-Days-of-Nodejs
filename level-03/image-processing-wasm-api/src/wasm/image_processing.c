#include <stdio.h>
#include <stdlib.h>
#include <emscripten.h>

// Helper function to access pixel data
EMSCRIPTEN_KEEPALIVE
unsigned char* getPixelData(unsigned char* data, int width, int height, int x, int y, int channels) {
    return data + (y * width + x) * channels;
}

// Grayscale conversion function
EMSCRIPTEN_KEEPALIVE
void grayscale(unsigned char* data, int width, int height, int channels) {
    for (int y = 0; y < height; y++) {
        for (int x = 0; x < width; x++) {
            unsigned char* pixel = getPixelData(data, width, height, x, y, channels);
            
            // Standard grayscale conversion formula
            unsigned char gray = (unsigned char)(0.299 * pixel[0] + 0.587 * pixel[1] + 0.114 * pixel[2]);
            
            // Set all RGB channels to the same gray value
            for (int c = 0; c < 3 && c < channels; c++) {
                pixel[c] = gray;
            }
            // Preserve alpha channel if it exists
        }
    }
}

// Blur function using box blur algorithm
EMSCRIPTEN_KEEPALIVE
void blur(unsigned char* data, int width, int height, int channels, int radius) {
    // Create a temporary buffer to hold the processed image
    unsigned char* temp = (unsigned char*)malloc(width * height * channels);
    if (!temp) return;
    
    // Copy the original data
    memcpy(temp, data, width * height * channels);
    
    for (int y = 0; y < height; y++) {
        for (int x = 0; x < width; x++) {
            int r = 0, g = 0, b = 0, a = 0;
            int count = 0;
            
            // Calculate average of neighboring pixels
            for (int ky = -radius; ky <= radius; ky++) {
                for (int kx = -radius; kx <= radius; kx++) {
                    int nx = x + kx;
                    int ny = y + ky;
                    
                    if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                        unsigned char* pixel = getPixelData(temp, width, height, nx, ny, channels);
                        r += pixel[0];
                        g += pixel[1];
                        b += pixel[2];
                        if (channels > 3) a += pixel[3];
                        count++;
                    }
                }
            }
            
            // Write average values to the output
            unsigned char* outPixel = getPixelData(data, width, height, x, y, channels);
            outPixel[0] = r / count;
            outPixel[1] = g / count;
            outPixel[2] = b / count;
            if (channels > 3) outPixel[3] = a / count;
        }
    }
    
    free(temp);
}

// Edge detection using simple Sobel operator
EMSCRIPTEN_KEEPALIVE
void edgeDetection(unsigned char* data, int width, int height, int channels, int threshold) {
    // Create a temporary buffer for the grayscale image
    unsigned char* gray = (unsigned char*)malloc(width * height);
    if (!gray) return;
    
    // Convert to grayscale first
    for (int y = 0; y < height; y++) {
        for (int x = 0; x < width; x++) {
            unsigned char* pixel = getPixelData(data, width, height, x, y, channels);
            gray[y * width + x] = (unsigned char)(0.299 * pixel[0] + 0.587 * pixel[1] + 0.114 * pixel[2]);
        }
    }
    
    // Create a temporary buffer for the output
    unsigned char* temp = (unsigned char*)malloc(width * height * channels);
    memcpy(temp, data, width * height * channels);
    
    // Sobel kernels
    int sobelX[3][3] = {{-1, 0, 1}, {-2, 0, 2}, {-1, 0, 1}};
    int sobelY[3][3] = {{-1, -2, -1}, {0, 0, 0}, {1, 2, 1}};
    
    // Apply edge detection
    for (int y = 1; y < height - 1; y++) {
        for (int x = 1; x < width - 1; x++) {
            int gx = 0, gy = 0;
            
            // Apply Sobel operators
            for (int ky = -1; ky <= 1; ky++) {
                for (int kx = -1; kx <= 1; kx++) {
                    int val = gray[(y + ky) * width + (x + kx)];
                    gx += val * sobelX[ky+1][kx+1];
                    gy += val * sobelY[ky+1][kx+1];
                }
            }
            
            // Calculate gradient magnitude
            int mag = (int)sqrt(gx * gx + gy * gy);
            
            // Apply threshold
            unsigned char edgeValue = mag > threshold ? 255 : 0;
            
            // Set pixel in output
            unsigned char* outPixel = getPixelData(data, width, height, x, y, channels);
            outPixel[0] = outPixel[1] = outPixel[2] = edgeValue;
            // Preserve alpha if it exists
            if (channels > 3) outPixel[3] = getPixelData(temp, width, height, x, y, channels)[3];
        }
    }
    
    free(gray);
    free(temp);
}

// Simple brightness adjustment
EMSCRIPTEN_KEEPALIVE
void adjustBrightness(unsigned char* data, int width, int height, int channels, int adjustment) {
    for (int y = 0; y < height; y++) {
        for (int x = 0; x < width; x++) {
            unsigned char* pixel = getPixelData(data, width, height, x, y, channels);
            
            // Adjust RGB channels
            for (int c = 0; c < 3 && c < channels; c++) {
                int newVal = pixel[c] + adjustment;
                pixel[c] = (newVal < 0) ? 0 : (newVal > 255) ? 255 : newVal;
            }
            // Alpha channel is not modified
        }
    }
}

// Helper function to resize image
EMSCRIPTEN_KEEPALIVE
void resizeImage(unsigned char* srcData, int srcWidth, int srcHeight, 
                 unsigned char* destData, int destWidth, int destHeight, int channels) {
    float xRatio = (float)srcWidth / destWidth;
    float yRatio = (float)srcHeight / destHeight;
    
    for (int y = 0; y < destHeight; y++) {
        for (int x = 0; x < destWidth; x++) {
            // Nearest neighbor interpolation
            int srcX = (int)(x * xRatio);
            int srcY = (int)(y * yRatio);
            
            unsigned char* srcPixel = getPixelData(srcData, srcWidth, srcHeight, srcX, srcY, channels);
            unsigned char* destPixel = getPixelData(destData, destWidth, destHeight, x, y, channels);
            
            // Copy all channels
            for (int c = 0; c < channels; c++) {
                destPixel[c] = srcPixel[c];
            }
        }
    }
}
