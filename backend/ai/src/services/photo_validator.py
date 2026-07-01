import cv2
import numpy as np
import logging
from src.config import Settings
from src.services.background import BackgroundChecker

logger = logging.getLogger(__name__)


class PhotoValidator:
    def __init__(self, settings: Settings):
        self.settings = settings
        self.face_cascade = cv2.CascadeClassifier(settings.face_cascade_path)
        self.eye_cascade = cv2.CascadeClassifier(settings.eye_cascade_path)
        self.background_checker = BackgroundChecker(settings)

        if self.face_cascade.empty():
            logger.warning('Face cascade not loaded - face checks will be unavailable')
        if self.eye_cascade.empty():
            logger.warning('Eye cascade not loaded - eye checks will be unavailable')

    def validate(self, img: np.ndarray, file_size_kb: float) -> dict:
        checks = {}
        reasons = []
        suggestions = []

        dim_check = self._check_dimensions(img, file_size_kb)
        checks['dimensions'] = dim_check
        if not dim_check['passed']:
            reasons.append(dim_check['details'])

        bg_check = self.background_checker.check(img)
        checks['background'] = bg_check
        if not bg_check['passed']:
            reasons.append(bg_check['details'])

        checks['file_size_kb'] = {'passed': True, 'details': f'{file_size_kb:.1f}KB'}
        if file_size_kb > self.settings.max_photo_size_kb:
            checks['file_size_kb'] = {'passed': False, 'details': f'{file_size_kb:.1f}KB exceeds 240KB limit'}
            reasons.append(f'File size {file_size_kb:.1f}KB exceeds 240KB')

        face_check = self._check_face(img)
        checks['face_position'] = face_check
        if not face_check['passed']:
            reasons.append(face_check['details'])

        light_check = self._check_lighting(img)
        checks['lighting'] = light_check
        if not light_check['passed']:
            reasons.append(light_check['details'])

        sharp_check = self._check_sharpness(img)
        checks['sharpness'] = sharp_check
        if not sharp_check['passed']:
            reasons.append(sharp_check['details'])

        expr_check = self._check_expression(img)
        checks['expression'] = expr_check
        if not expr_check['passed']:
            reasons.append(expr_check['details'])

        glasses_check = self._check_glasses(img)
        checks['glasses'] = glasses_check
        if not glasses_check['passed']:
            reasons.append(glasses_check['details'])

        passed_count = sum(1 for c in checks.values() if isinstance(c, dict) and c.get('passed'))
        total = len(checks)
        confidence = passed_count / max(total, 1)

        if not face_check.get('face_detected', True):
            suggestions.append('Ensure face is clearly visible and facing forward')

        return {
            'valid': all(
                c.get('passed', False) for c in checks.values()
                if isinstance(c, dict)
            ),
            'confidence': round(confidence, 2),
            'checks': checks,
            'reasons': reasons,
            'suggestions': suggestions,
        }

    def _check_dimensions(self, img: np.ndarray, file_size_kb: float) -> dict:
        h, w = img.shape[:2]
        if h != w:
            return {'passed': False, 'details': f'{w}x{h}px - image must be square'}
        if w < self.settings.min_dimension:
            return {'passed': False, 'details': f'{w}x{h}px - minimum {self.settings.min_dimension}px required'}
        if w > self.settings.max_dimension:
            return {'passed': False, 'details': f'{w}x{h}px - maximum {self.settings.max_dimension}px allowed'}
        return {'passed': True, 'details': f'{w}x{h}px'}

    def _check_face(self, img: np.ndarray) -> dict:
        if self.face_cascade.empty():
            return {'passed': True, 'details': 'Face detection unavailable', 'face_detected': False}

        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        faces = self.face_cascade.detectMultiScale(
            gray, scaleFactor=1.1, minNeighbors=5, minSize=self.settings.min_face_size
        )

        if len(faces) == 0:
            return {
                'passed': False,
                'details': 'No face detected',
                'face_detected': False,
            }

        face = faces[0]
        x, y, fw, fh = face
        img_h, img_w = img.shape[:2]

        face_cx = x + fw / 2
        img_cx = img_w / 2
        center_offset = abs(face_cx - img_cx) / img_w
        if center_offset > self.settings.face_center_tolerance:
            return {
                'passed': False,
                'details': f'Face off-center (offset {center_offset:.0%}, max {self.settings.face_center_tolerance:.0%})',
                'face_detected': True,
            }

        head_ratio = fh / img_h
        if head_ratio < self.settings.head_ratio_min:
            return {
                'passed': False,
                'details': f'Head too small ({head_ratio:.0%}, need {self.settings.head_ratio_min:.0%}-{self.settings.head_ratio_max:.0%})',
                'face_detected': True,
            }
        if head_ratio > self.settings.head_ratio_max:
            return {
                'passed': False,
                'details': f'Head too large ({head_ratio:.0%}, need {self.settings.head_ratio_min:.0%}-{self.settings.head_ratio_max:.0%})',
                'face_detected': True,
            }

        eyes_ok = self._check_eye_position(gray, face)
        if not eyes_ok:
            return {
                'passed': False,
                'details': 'Eyes not in expected position (looking away or tilted)',
                'face_detected': True,
            }

        return {
            'passed': True,
            'details': f'Centered, {head_ratio:.0%} head ratio',
            'face_detected': True,
        }

    def _check_eye_position(self, gray: np.ndarray, face: tuple) -> bool:
        if self.eye_cascade.empty():
            return True
        x, y, w, h = face
        face_roi = gray[y:y + h, x:x + w]
        eyes = self.eye_cascade.detectMultiScale(face_roi, scaleFactor=1.1, minNeighbors=5, minSize=(20, 20))
        if len(eyes) < 1:
            return False

        for (ex, ey, ew, eh) in eyes:
            eye_center_y = (ey + eh / 2) / h
            if eye_center_y < (1 - self.settings.eyes_y_max) or eye_center_y > (1 - self.settings.eyes_y_min):
                return False
        return True

    def _check_lighting(self, img: np.ndarray) -> dict:
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        hist = cv2.calcHist([gray], [0], None, [256], [0, 256]).flatten()
        total = gray.size

        low_bin = int(hist[:50].sum() / total * 100)
        high_bin = int(hist[200:].sum() / total * 100)
        mid_bin = int(hist[50:200].sum() / total * 100)

        if low_bin > 30:
            return {'passed': False, 'details': 'Too dark (underexposed)'}
        if high_bin > 30:
            return {'passed': False, 'details': 'Too bright (overexposed/blown out)'}
        if mid_bin < 40:
            return {'passed': False, 'details': 'Poor contrast distribution'}

        face_brightness = self._check_face_brightness(gray)
        if not face_brightness['passed']:
            return face_brightness

        return {'passed': True, 'details': 'Balanced'}

    def _check_face_brightness(self, gray: np.ndarray) -> dict:
        faces = self.face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5)
        if len(faces) == 0:
            return {'passed': True, 'details': 'Face brightness check skipped (no face)'}

        x, y, w, h = faces[0]
        face_roi = gray[y:y + h, x:x + w]
        mean_brightness = float(np.mean(face_roi))
        std_brightness = float(np.std(face_roi))

        if mean_brightness < 80:
            return {'passed': False, 'details': 'Face region too dark'}
        if mean_brightness > 220:
            return {'passed': False, 'details': 'Face region too bright'}
        if std_brightness > 60:
            return {'passed': False, 'details': 'Harsh shadows on face'}
        return {'passed': True, 'details': 'Face brightness OK'}

    def _check_sharpness(self, img: np.ndarray) -> dict:
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()

        if laplacian_var < self.settings.sharpness_threshold:
            return {'passed': False, 'details': f'Blurry (sharpness {laplacian_var:.1f})'}
        if laplacian_var < self.settings.sharpness_threshold * 1.5:
            return {'passed': True, 'details': 'Adequate'}
        return {'passed': True, 'details': 'Clear'}

    def _check_expression(self, img: np.ndarray) -> dict:
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        faces = self.face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5)
        if len(faces) == 0:
            return {'passed': True, 'details': 'Expression check skipped (no face)'}

        x, y, w, h = faces[0]
        mouth_y_start = y + int(h * 0.65)
        mouth_y_end = y + int(h * 0.90)
        mouth_roi = gray[mouth_y_start:mouth_y_end, x:x + w]
        if mouth_roi.size == 0:
            return {'passed': True, 'details': 'Expression check skipped (region too small)'}

        mouth_edges = cv2.Canny(mouth_roi, 50, 150)
        edge_density = float(np.sum(mouth_edges > 0)) / mouth_roi.size

        if edge_density > 0.12:
            return {'passed': False, 'details': 'Smile detected, neutral expression required'}
        return {'passed': True, 'details': 'Neutral'}

    def _check_glasses(self, img: np.ndarray) -> dict:
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        faces = self.face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5)
        if len(faces) == 0:
            return {'passed': True, 'details': 'Glasses check skipped (no face)'}

        x, y, w, h = faces[0]
        eye_region_y_start = y + int(h * 0.15)
        eye_region_y_end = y + int(h * 0.45)
        eye_region = gray[eye_region_y_start:eye_region_y_end, x:x + w]
        if eye_region.size == 0:
            return {'passed': True, 'details': 'Glasses check skipped (region too small)'}

        edges = cv2.Canny(eye_region, 30, 100)
        lines = cv2.HoughLinesP(edges, rho=1, theta=np.pi / 180, threshold=30, minLineLength=20, maxLineGap=10)

        if lines is not None:
            horizontal_count = 0
            for line in lines:
                x1, y1, x2, y2 = line[0]
                angle = abs(np.degrees(np.arctan2(y2 - y1, x2 - x1)))
                if angle < 20 or angle > 160:
                    horizontal_count += 1
            if horizontal_count > 5:
                return {'passed': False, 'details': 'Glasses detected'}
        return {'passed': True, 'details': 'No glasses detected'}
