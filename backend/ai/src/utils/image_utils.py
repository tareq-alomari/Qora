import cv2
import numpy as np
from fastapi import UploadFile, HTTPException


async def load_image_from_upload(file: UploadFile) -> np.ndarray:
    contents = await file.read()
    if len(contents) == 0:
        raise HTTPException(status_code=400, detail='Empty file')
    img_array = np.frombuffer(contents, dtype=np.uint8)
    img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
    if img is None:
        raise HTTPException(status_code=400, detail='Could not decode image. Ensure it is a valid JPEG.')
    return img


def to_grayscale(img: np.ndarray) -> np.ndarray:
    if len(img.shape) == 3:
        return cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    return img


def to_hsv(img: np.ndarray) -> np.ndarray:
    return cv2.cvtColor(img, cv2.COLOR_BGR2HSV)


def get_dimensions(img: np.ndarray) -> tuple[int, int]:
    h, w = img.shape[:2]
    return w, h
