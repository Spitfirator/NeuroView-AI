from fastapi import FastAPI, UploadFile, File, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import tensorflow as tf
import numpy as np
from PIL import Image
import io
import cv2
from typing import List, Dict
from datetime import datetime
from tensorflow.keras.applications.resnet50 import preprocess_input
from openai import OpenAI
import os
from dotenv import load_dotenv
from pydantic import BaseModel

from .utils import generate_gradcam, encode_image, deprocess_image
from .patient_routes import router as patient_router

app = FastAPI()

#  CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# include patient router
app.include_router(patient_router)

# load the model we trained on Kaggle dataset (ResNet50)
model = tf.keras.models.load_model('app/models/Bmodel_v2.keras')

# labels change to no detectable tumour for frontend 
LABELS = ['glioma', 'meningioma', 'notumor', 'pituitary']

# store predictions and their images for similarity matching
case_database: List[Dict] = []

# load environment variables
load_dotenv()

# initialise the OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[Dict[str, str]]
    max_tokens: int = 500

def preprocess_image(image_bytes):
    """preprocess the uploaded image for ResNet50 model prediction."""
    # convert bytes to OpenCV
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    # resize to match model input size
    img = cv2.resize(img, (224, 224))

    # convert BGR to RGB (OpenCV loads in BGR, ResNet expects RGB)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

    # convert to float32 and expand dimensions
    img_array = np.expand_dims(img.astype(np.float32), axis=0)

    # apply ResNet50 preprocessing
    img_array = preprocess_input(img_array)

    return img_array

@app.post("/predict")
async def predict(
    file: UploadFile = File(...),
    target_layer: str = Query(None, description="Optional name of the Conv2D layer to use for Grad-CAM")
):
    """endpoint to predict brain tumour type from MRI scan."""
    try:
        # read and preprocess image
        contents = await file.read()
        img_array = preprocess_image(contents)

        # make prediction
        predictions = model.predict(img_array)
        predicted_idx = np.argmax(predictions[0])
        predicted_class = LABELS[predicted_idx]

        print("Generating GradCAM...")
        try:
            # generate GradCAM visualisation
            original, heatmap, superimposed = generate_gradcam(
                model,
                img_array,
                pred_index=predicted_idx,
                target_layer_name=target_layer
            )

            # deprocess the original image for visualisation
            original = deprocess_image(original)

            # encode images to base64
            heatmap_b64 = encode_image(heatmap)
            superimposed_b64 = encode_image(superimposed)

            print("GradCAM generated successfully")

            return JSONResponse({
                "success": True,
                "prediction": predicted_class,
                "confidence_scores": {
                    label: float(score)
                    for label, score in zip(LABELS, predictions[0])
                },
                "gradcam": {
                    "heatmap": heatmap_b64,
                    "superimposed": superimposed_b64
                }
            })

        except Exception as grad_error:
            print(f"GradCAM generation failed: {str(grad_error)}")
            # return prediction without GradCAM if it fails so doesn't affect the rest of the analysis
            return JSONResponse({
                "success": True,
                "prediction": predicted_class,
                "confidence_scores": {
                    label: float(score)
                    for label, score in zip(LABELS, predictions[0])
                }
            })

    except Exception as e:
        print(f"Prediction failed: {str(e)}")  # debug log
        return JSONResponse({
            "success": False,
            "error": str(e)
        }, status_code=500)

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}

@app.get("/similar-cases/{case_type}")
async def get_similar_cases(case_type: str):
    """Get similar cases for a specific tumour type."""
    try:
        # filter cases by prediction type
        similar_cases = [
            case for case in case_database
            if case["prediction"] == case_type
        ]

        # sort by confidence score for that type
        similar_cases.sort(
            key=lambda x: x["confidence_scores"][case_type],
            reverse=True
        )

        # return top 5 cases
        return JSONResponse({
            "success": True,
            "cases": similar_cases[:5]
        })

    except Exception as e:
        return JSONResponse({
            "success": False,
            "error": str(e)
        }, status_code=500)

@app.post("/chat")
async def chat(request: ChatRequest):
    try:
        messages = request.messages

        # use text-only model 
        model_name = "gpt-4o-mini"

        # make the API call
        response = client.chat.completions.create(
            model=model_name,
            messages=messages,
            max_tokens=request.max_tokens,
        )

        return {
            "response": response.choices[0].message.content
        }

    except Exception as e:
        print(f"Error in chat endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
