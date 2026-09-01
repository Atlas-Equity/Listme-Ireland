import sys
from PIL import Image

def remove_white_bg(img_path, out_path):
    img = Image.open(img_path).convert("RGBA")
    data = img.getdata()
    
    new_data = []
    for item in data:
        # Check if the pixel is white or very close to white (allow some tolerance for anti-aliasing)
        if item[0] > 240 and item[1] > 240 and item[2] > 240:
            # We preserve the color but make it fully transparent.
            new_data.append((255, 255, 255, 0)) 
        else:
            new_data.append(item)
            
    img.putdata(new_data)
    img.save(out_path, "PNG")

if __name__ == "__main__":
    remove_white_bg(sys.argv[1], sys.argv[2])
