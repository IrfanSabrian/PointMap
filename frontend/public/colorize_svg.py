import random
import re

def random_color():
    return "#{:06x}".format(random.randint(0, 0xFFFFFF))

with open("maps.svg", "r", encoding="utf-8") as f:
    svg = f.read()

# Temukan semua <path ...>
paths = re.findall(r'(<path[^>]*>)', svg)
used_colors = set()
new_svg = svg

for path in paths:
    color = random_color()
    while color in used_colors:
        color = random_color()
    used_colors.add(color)
    # Ganti fill lama (atau tambahkan fill jika belum ada)
    if 'fill=' in path:
        new_path = re.sub(r'fill="[^"]*"', f'fill="{color}"', path)
    else:
        # Tambahkan fill setelah <path
        new_path = path.replace('<path', f'<path fill="{color}"', 1)
    new_svg = new_svg.replace(path, new_path, 1)

with open("maps_colored.svg", "w", encoding="utf-8") as f:
    f.write(new_svg)

print("Selesai! Cek file maps_colored.svg")