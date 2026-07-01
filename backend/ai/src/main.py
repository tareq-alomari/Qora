import logging
import time
from contextlib import asynccontextmanager

import cv2
from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from src.config import Settings
from src.models.schemas import ValidationResponse, ValidationCheck, HealthResponse
from src.services.photo_validator import PhotoValidator
from src.utils.image_utils import load_image_from_upload

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
)
logger = logging.getLogger(__name__)

settings = Settings()
validator = PhotoValidator(settings)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info('AI Photo Validation Service starting')
    logger.info('OpenCV version: %s', cv2.__version__)
    if validator.face_cascade.empty():
        logger.warning('Face cascade not loaded - face detection disabled')
    else:
        logger.info('Face cascade loaded successfully')
    yield
    logger.info('AI Photo Validation Service shutting down')


app = FastAPI(
    title='Qor3a AI Photo Validation Service',
    description='DV Lottery photo validation using OpenCV - no pixel modifications',
    version='1.0.0',
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


@app.middleware('http')
async def log_requests(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    duration = time.time() - start
    logger.info('%s %s -> %d (%.3fs)', request.method, request.url.path, response.status_code, duration)
    return response


@app.middleware('http')
async def limit_request_size(request: Request, call_next):
    if request.headers.get('content-type', '').startswith('multipart/form-data'):
        content_length = request.headers.get('content-length')
        if content_length and int(content_length) > settings.max_file_size:
            return JSONResponse(
                status_code=413,
                content={'error': {'code': 'FILE_TOO_LARGE', 'message': 'File exceeds 5MB limit'}},
            )
    return await call_next(request)


@app.get('/health', response_model=HealthResponse)
async def health():
    return HealthResponse(
        status='ok',
        model='opencv',
        version='1.0.0',
    )


@app.post('/api/v1/validate', response_model=ValidationResponse)
async def validate_photo(photo: UploadFile = File(...)):
    if photo.content_type not in settings.allowed_formats:
        raise HTTPException(
            status_code=400,
            detail=f'Invalid format: {photo.content_type}. Only JPEG is supported.',
        )

    contents = await photo.read()
    file_size_kb = len(contents) / 1024.0

    if len(contents) == 0:
        raise HTTPException(status_code=400, detail='Uploaded file is empty')

    if len(contents) > settings.max_file_size:
        raise HTTPException(status_code=413, detail='File exceeds 5MB limit')

    img = await load_image_from_upload(photo)

    result = validator.validate(img, file_size_kb)

    checks = {
        key: ValidationCheck(passed=val['passed'], details=val['details'])
        for key, val in result['checks'].items()
        if isinstance(val, dict) and 'passed' in val
    }

    return ValidationResponse(
        valid=result['valid'],
        confidence=result['confidence'],
        checks=checks,
        reasons=result['reasons'],
        suggestions=result['suggestions'],
    )


if __name__ == '__main__':
    import uvicorn
    uvicorn.run('src.main:app', host='0.0.0.0', port=8000, reload=True)
