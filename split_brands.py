from PIL import Image
import os
import cv2
import numpy as np

# Load image
img_path = '/Users/balaji/.gemini/antigravity-ide/brain/f2ef48ce-883a-4322-aa92-ba5922e8dfe4/media__1785166004190.png'
out_dir = '/Users/balaji/Documents/Natesh/Vamsi Crackers/Vamsi_Crackers_Admin/public/assets/images/brands_split'
os.makedirs(out_dir, exist_ok=True)

img = cv2.imread(img_path)
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

# Threshold to find non-white areas
_, thresh = cv2.threshold(gray, 240, 255, cv2.THRESH_BINARY_INV)

# Find contours
contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

count = 1
for cnt in contours:
    x, y, w, h = cv2.boundingRect(cnt)
    # filter out small noise
    if w > 40 and h > 40:
        crop_img = img[y:y+h, x:x+w]
        # Make white pixels transparent
        rgba = cv2.cvtColor(crop_img, cv2.COLOR_BGR2BGRA)
        # Assuming white background, we set pixels close to white to transparent
        # or we just keep the white background
        cv2.imwrite(f"{out_dir}/brand_{count}.png", crop_img)
        count += 1

print(f"Split {count-1} brands.")
