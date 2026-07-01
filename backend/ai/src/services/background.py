import cv2
import numpy as np
from src.config import Settings


class BackgroundChecker:
    def __init__(self, settings: Settings):
        self.settings = settings

    def check(self, img: np.ndarray) -> dict:
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        h, w = img.shape[:2]

        border_pixels = self._sample_border_pixels(hsv, h, w)
        white_mask = self._is_white_background(border_pixels)
        white_ratio = float(np.mean(white_mask))

        shadow_detected = self._detect_shadows(hsv, h, w)
        uniformity_ok = self._check_uniformity(border_pixels)

        if white_ratio > 0.85 and not shadow_detected and uniformity_ok:
            return {
                'passed': True,
                'details': 'Uniform white/off-white background'
            }
        elif white_ratio > 0.70 and not shadow_detected:
            return {
                'passed': True,
                'details': 'Mostly white/off-white background, minor variations'
            }
        else:
            reasons = []
            if white_ratio <= 0.70:
                reasons.append('background not predominantly white')
            if shadow_detected:
                reasons.append('shadows detected in background')
            if not uniformity_ok:
                reasons.append('background is not uniform')
            return {
                'passed': False,
                'details': '; '.join(reasons) if reasons else 'Background check failed'
            }

    def _sample_border_pixels(self, hsv: np.ndarray, h: int, w: int) -> np.ndarray:
        border_width = max(10, min(w, h) // 20)
        top = hsv[:border_width, :, :].reshape(-1, 3)
        bottom = hsv[h - border_width:, :, :].reshape(-1, 3)
        left = hsv[:, :border_width, :].reshape(-1, 3)
        right = hsv[:, w - border_width:, :].reshape(-1, 3)
        return np.vstack([top, bottom, left, right])

    def _is_white_background(self, pixels: np.ndarray) -> np.ndarray:
        h, s, v = pixels[:, 0], pixels[:, 1], pixels[:, 2]
        return (
            (h <= self.settings.background_h_max) |
            (h >= 150)  # allow near-red hues (white in shadows)
        ) & (s <= self.settings.background_s_high) & (v >= self.settings.background_v_low)

    def _detect_shadows(self, hsv: np.ndarray, h: int, w: int) -> bool:
        gray = cv2.cvtColor(hsv, cv2.COLOR_HSV2BGR)
        gray = cv2.cvtColor(gray, cv2.COLOR_BGR2GRAY)
        border_width = max(10, min(w, h) // 20)
        border_region = np.zeros_like(gray)
        cv2.rectangle(border_region, (0, 0), (w, border_width), 255, -1)
        cv2.rectangle(border_region, (0, h - border_width), (w, h), 255, -1)
        cv2.rectangle(border_region, (0, 0), (border_width, h), 255, -1)
        cv2.rectangle(border_region, (w - border_width, 0), (w, h), 255, -1)
        border_pixels = gray[border_region == 255]
        if len(border_pixels) == 0:
            return False
        variance = float(np.var(border_pixels))
        return variance > 500

    def _check_uniformity(self, pixels: np.ndarray) -> bool:
        v_channel = pixels[:, 2].astype(float)
        variance = float(np.var(v_channel))
        return variance < 400
