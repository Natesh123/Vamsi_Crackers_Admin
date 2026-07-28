import cv2
import numpy as np
import os

img_path = '/Users/balaji/.gemini/antigravity-ide/brain/f2ef48ce-883a-4322-aa92-ba5922e8dfe4/media__1785166004190.png'
out_dir = '/Users/balaji/Documents/Natesh/Vamsi Crackers/Vamsi_Crackers_Admin/public/assets/images/brands_split'
os.makedirs(out_dir, exist_ok=True)

img = cv2.imread(img_path, cv2.IMREAD_UNCHANGED)

if img.shape[2] == 3:
    img = cv2.cvtColor(img, cv2.COLOR_BGR2BGRA)

gray = cv2.cvtColor(img, cv2.COLOR_BGRA2GRAY)

_, thresh = cv2.threshold(gray, 240, 255, cv2.THRESH_BINARY_INV)

kernel = np.ones((10,10), np.uint8)
dilated = cv2.dilate(thresh, kernel, iterations=1)

contours, _ = cv2.findContours(dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

bounding_boxes = []
for cnt in contours:
    x, y, w, h = cv2.boundingRect(cnt)
    if w > 40 and h > 40:
        bounding_boxes.append((x, y, w, h))

bounding_boxes.sort(key=lambda b: (b[1]//100, b[0]))

print(f"Found {len(bounding_boxes)} logos!")

count = 1
for x, y, w, h in bounding_boxes:
    pad = 10
    x1 = max(0, x - pad)
    y1 = max(0, y - pad)
    x2 = min(img.shape[1], x + w + pad)
    y2 = min(img.shape[0], y + h + pad)
    
    crop = img[y1:y2, x1:x2]
    
    r, g, b, a = cv2.split(crop)
    mask = (r > 240) & (g > 240) & (b > 240)
    a[mask] = 0
    crop = cv2.merge((r, g, b, a))
    
    cv2.imwrite(f"{out_dir}/brand_{count}.png", crop)
    count += 1
