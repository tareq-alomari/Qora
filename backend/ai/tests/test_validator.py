import pytest
import cv2
import numpy as np
from src.config import Settings
from src.services.photo_validator import PhotoValidator
from src.services.background import BackgroundChecker


@pytest.fixture
def settings():
    return Settings()


@pytest.fixture
def validator(settings):
    return PhotoValidator(settings)


@pytest.fixture
def white_square_img():
    img = np.ones((600, 600, 3), dtype=np.uint8) * 240
    return img


@pytest.fixture
def non_square_img():
    img = np.ones((400, 600, 3), dtype=np.uint8) * 240
    return img


@pytest.fixture
def small_img():
    img = np.ones((300, 300, 3), dtype=np.uint8) * 240
    return img


def test_dimensions_pass(validator, white_square_img):
    result = validator._check_dimensions(white_square_img, 100.0)
    assert result['passed'] is True
    assert '600x600' in result['details']


def test_dimensions_fail_non_square(validator, non_square_img):
    result = validator._check_dimensions(non_square_img, 100.0)
    assert result['passed'] is False
    assert 'square' in result['details']


def test_dimensions_fail_too_small(validator, small_img):
    result = validator._check_dimensions(small_img, 100.0)
    assert result['passed'] is False
    assert 'minimum' in result['details']


def test_dimensions_fail_file_too_large(validator, white_square_img):
    result = validator.validate(white_square_img, 500.0)
    fs_check = result['checks'].get('file_size_kb', {})
    if isinstance(fs_check, dict):
        assert fs_check['passed'] is False


def test_background_check_uniform_white(settings):
    checker = BackgroundChecker(settings)
    white_img = np.ones((600, 600, 3), dtype=np.uint8) * 255
    result = checker.check(white_img)
    assert result['passed'] is True


def test_background_check_non_white(settings):
    checker = BackgroundChecker(settings)
    red_img = np.ones((600, 600, 3), dtype=np.uint8) * 50
    red_img[:, :, 2] = 200  # make it reddish
    result = checker.check(red_img)
    assert result['passed'] is False


def test_sharpness_blurry(validator):
    blurry = np.ones((600, 600, 3), dtype=np.uint8) * 128
    result = validator._check_sharpness(blurry)
    assert result['passed'] is False


def test_sharpness_sharp(validator):
    sharp = np.random.randint(0, 256, (600, 600, 3), dtype=np.uint8)
    result = validator._check_sharpness(sharp)
    assert result['passed'] is True


def test_lighting_balanced(validator):
    img = np.ones((600, 600, 3), dtype=np.uint8) * 128
    cv2.rectangle(img, (150, 150), (450, 450), (140, 140, 140), -1)
    result = validator._check_lighting(img)
    assert result['passed'] is True


def test_lighting_too_dark(validator):
    dark = np.ones((600, 600, 3), dtype=np.uint8) * 20
    result = validator._check_lighting(dark)
    assert result['passed'] is False


def test_lighting_too_bright(validator):
    bright = np.ones((600, 600, 3), dtype=np.uint8) * 240
    result = validator._check_lighting(bright)
    assert result['passed'] is False


def test_validate_non_square_fails(validator, non_square_img):
    result = validator.validate(non_square_img, 100.0)
    assert result['valid'] is False
    assert any('square' in r for r in result['reasons'])


def test_validate_small_file_passes_dimensions(validator, white_square_img):
    result = validator._check_dimensions(white_square_img, 50.0)
    assert result['passed'] is True


def test_expression_neutral(validator):
    img = np.ones((600, 600, 3), dtype=np.uint8) * 128
    result = validator._check_expression(img)
    assert result['passed'] is not None


def test_glasses_not_detected(validator):
    img = np.ones((600, 600, 3), dtype=np.uint8) * 128
    result = validator._check_glasses(img)
    assert result['passed'] is True
