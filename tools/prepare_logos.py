import hashlib
import json
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'public' / 'assets'
OUTPUT = ASSETS / 'logos'
NAMES = ['gpt', 'codex', 'claude', 'google', 'grok', 'stream', 'duolingo', 'X', 'telegram', 'education', 'apple', 'microsoft', 'muse', 'generic-email', 'kyc', 'cursor', 'generic-account', 'gemini', 'instagram', 'verification']
DARK = np.array([25, 61, 49], dtype=np.float32)
VERSION = 3


def remove_white(image):
    pixels = np.asarray(image.convert('RGBA')).astype(np.float32)
    alpha = np.clip((255 - pixels[:, :, :3].min(axis=2)) / 28, 0, 1)
    original_alpha = pixels[:, :, 3] / 255
    rgb = (pixels[:, :, :3] - 255 * (1 - alpha[:, :, None])) / np.maximum(alpha[:, :, None], .001)
    pixels[:, :, :3] = np.clip(rgb, 0, 255)
    pixels[:, :, 3] = alpha * original_alpha * 255
    return Image.fromarray(pixels.astype(np.uint8))


def apply_mask(image, mask, monochrome=False):
    pixels = np.asarray(image.convert('RGBA')).copy()
    pixels[:, :, 3] = (np.clip(mask, 0, 1) * pixels[:, :, 3]).astype(np.uint8)
    if monochrome:
        pixels[:, :, :3] = DARK.astype(np.uint8)
    return Image.fromarray(pixels)


def prepare(name):
    image = Image.open(ASSETS / (name + '.png')).convert('RGBA')
    if name == 'microsoft':
        result = Image.new('RGBA', (320, 320))
        drawing = ImageDraw.Draw(result)
        for box, color in [((10, 10, 150, 150), '#f25022'), ((170, 10, 310, 150), '#7fba00'), ((10, 170, 150, 310), '#00a4ef'), ((170, 170, 310, 310), '#ffb900')]:
            drawing.rectangle(box, fill=color)
        return result
    crops = {'codex': (148, 74, 292, 219), 'grok': (65, 40, 280, 237), 'apple': (135, 65, 345, 230), 'muse': (100, 285, 850, 580), 'education': (12, 12, 566, 560), 'google': (20, 100, 390, 285), 'cursor': (12, 12, 482, 365), 'telegram': (16, 12, 488, 488)}
    if name in crops:
        image = image.crop(crops[name])
    rgb = np.asarray(image)[:, :, :3].astype(np.float32)
    highest, lowest = rgb.max(axis=2), rgb.min(axis=2)
    saturation = highest - lowest
    if name in ['gpt', 'X', 'grok', 'apple', 'generic-email', 'kyc']:
        return apply_mask(image, np.clip((lowest - 65) / 150, 0, 1), True)
    if name == 'codex':
        mask = (saturation > 40) & (rgb[:, :, 2] > rgb[:, :, 0] + 10)
        mask = ndimage.binary_fill_holes(mask)
        labels, count = ndimage.label(mask)
        sizes = np.bincount(labels.ravel())
        mask[sizes[labels] < 50] = False
        return apply_mask(image, np.asarray(Image.fromarray((mask * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(.5))) / 255)
    if name == 'claude':
        mask = ((rgb[:, :, 0] > 140) & (rgb[:, :, 0] - rgb[:, :, 1] > 38) & (rgb[:, :, 1] < 175)) | (highest < 120)
        return apply_mask(image, mask.astype(float))
    if name == 'google':
        mask = np.clip((saturation - 45) / 35, 0, 1)
        labels, count = ndimage.label(mask > 0)
        sizes = np.bincount(labels.ravel())
        mask[sizes[labels] < 50] = 0
        return apply_mask(image, mask)
    if name == 'stream':
        return apply_mask(image, np.clip((195 - highest) / 40, 0, 1), True)
    if name == 'muse':
        result = apply_mask(image, np.clip((highest - 30) / 100, 0, 1))
        pixels = np.asarray(result).copy()
        pixels[saturation < 50, :3] = DARK.astype(np.uint8)
        return Image.fromarray(pixels)
    if name == 'gemini':
        return apply_mask(image, ((highest < 130) | (saturation > 65)).astype(float))
    if name == 'verification':
        return image
    return remove_white(image)


def main():
    OUTPUT.mkdir(parents=True, exist_ok=True)
    mapping = {}
    manifest_path = OUTPUT / 'manifest.json'
    previous = json.loads(manifest_path.read_text('utf-8')) if manifest_path.exists() else {}
    manifest = {}
    for name in NAMES:
        source = ASSETS / (name + '.png')
        if not source.exists():
            continue
        fingerprint = str(VERSION) + ':' + hashlib.sha256(source.read_bytes()).hexdigest()
        target = OUTPUT / source.name
        if previous.get(source.name) != fingerprint or not target.exists():
            result = prepare(name)
            box = result.getchannel('A').getbbox()
            if not box:
                raise ValueError('Empty logo: ' + name)
            result = result.crop(box)
            longest = max(result.size)
            canvas_size = longest + max(12, round(longest * .1))
            canvas = Image.new('RGBA', (canvas_size, canvas_size))
            canvas.paste(result, ((canvas_size - result.width) // 2, (canvas_size - result.height) // 2))
            canvas.save(target)
        mapping['assets/' + source.name] = 'assets/logos/' + source.name
        manifest[source.name] = fingerprint
    manifest_path.write_text(json.dumps(manifest, indent=2), 'utf-8')
    (ROOT / 'src' / 'logo-assets.json').write_text(json.dumps(mapping, indent=2), 'utf-8')
    print('Prepared transparent logos:', len(mapping))


if __name__ == '__main__':
    main()
