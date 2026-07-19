import shutil, glob, os

artifact_dir = os.path.expanduser('~/.gemini/antigravity/brain/6790fc91-76be-40d5-b38b-274626e5c889')
dest_dir = '/home/amazing/Desktop/crackers_city/public/assets/images/brands'

os.makedirs(dest_dir, exist_ok=True)

brands = {
    'sonny': 'brand_sonny_*.png',
    'starvell': 'brand_starvell_*.png',
    'chettapandian': 'brand_chettapandian_*.png',
    'sss': 'brand_sss_*.png'
}

for name, pattern in brands.items():
    files = glob.glob(os.path.join(artifact_dir, pattern))
    if files:
        # Sort by modification time to get the latest
        latest_file = max(files, key=os.path.getmtime)
        shutil.copy(latest_file, os.path.join(dest_dir, f"{name}.png"))
        print(f"Copied {name}.png")
    else:
        print(f"No files found for {name}")
