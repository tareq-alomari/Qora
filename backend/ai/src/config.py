from pydantic_settings import BaseSettings, SettingsConfigDict
import cv2


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix='AI_')

    max_file_size: int = 5 * 1024 * 1024
    allowed_formats: list[str] = ['image/jpeg']
    face_cascade_path: str = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
    eye_cascade_path: str = cv2.data.haarcascades + 'haarcascade_eye.xml'
    min_face_size: tuple = (100, 100)
    sharpness_threshold: float = 100.0
    background_s_high: int = 30
    background_v_low: int = 200
    background_h_max: int = 30
    max_photo_size_kb: int = 240
    min_dimension: int = 600
    max_dimension: int = 1200
    face_center_tolerance: float = 0.15
    head_ratio_min: float = 0.50
    head_ratio_max: float = 0.69
    eyes_y_min: float = 0.56
    eyes_y_max: float = 0.69
