
import os
import torch
from torchvision import transforms
from PIL import Image
import timm
import io
import uvicorn
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import numpy as np

# --- Configuration ---
MAIN_DIR = "./"
MODELS_OUTPUT_DIR = MAIN_DIR
PRETRAINED_MODEL_NAME_FOR_TEST = 'tf_efficientnetv2_s'
SAVED_MODEL_FILENAME = f"best_pytorch_kuih_classifier_{PRETRAINED_MODEL_NAME_FOR_TEST}_finetuned.pth"
SAVED_MODEL_PATH = os.path.join(MODELS_OUTPUT_DIR, SAVED_MODEL_FILENAME)
TRAINING_LABELS_FILENAME = "pytorch_trained_labels.txt"
TRAINING_LABELS_PATH = os.path.join(MODELS_OUTPUT_DIR, TRAINING_LABELS_FILENAME)
IMG_HEIGHT = 512
IMG_WIDTH = 512
imagenet_mean = [0.485, 0.456, 0.406]
imagenet_std = [0.229, 0.224, 0.225]
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# --- Load Labels ---
training_class_names = []
training_idx_to_label = {}
with open(TRAINING_LABELS_PATH, 'r') as f:
    for line in f.readlines():
        parts = line.strip().split(' ', 1)
        if len(parts) == 2:
            idx, name = int(parts[0]), parts[1]
            training_idx_to_label[idx] = name
            training_class_names.append(name)

num_model_output_classes = len(training_class_names)

# --- Load Model ---
model_for_test = timm.create_model(
    PRETRAINED_MODEL_NAME_FOR_TEST,
    pretrained=False,
    num_classes=num_model_output_classes
)
checkpoint = torch.load(SAVED_MODEL_PATH, map_location=device)
state_dict = checkpoint.get('model_state_dict', checkpoint)
if all(key.startswith('module.') for key in state_dict.keys()):
    from collections import OrderedDict
    new_state_dict = OrderedDict()
    for k, v in state_dict.items():
        new_state_dict[k[7:]] = v
    state_dict = new_state_dict
model_for_test.load_state_dict(state_dict)
model_for_test = model_for_test.to(device)
model_for_test.eval()

# --- Image Transformation ---
def load_and_transform_image(image_bytes):
    image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    test_transforms = transforms.Compose([
        transforms.Resize((IMG_HEIGHT, IMG_WIDTH)),
        transforms.ToTensor(),
        transforms.Normalize(mean=imagenet_mean, std=imagenet_std)
    ])
    return test_transforms(image).unsqueeze(0)

# --- FastAPI App ---
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/predict/")
async def predict(file: UploadFile = File(...)):
    image_bytes = await file.read()
    image_tensor = load_and_transform_image(image_bytes)
    image_tensor = image_tensor.to(device)

    with torch.no_grad():
        outputs = model_for_test(image_tensor)
        probabilities = torch.softmax(outputs, dim=1)
        confidence, predicted_idx_tensor = torch.max(probabilities, 1)
        predicted_idx = predicted_idx_tensor.cpu().item()
        predicted_label_name = training_idx_to_label.get(predicted_idx, "Unknown")
        confidence_score = confidence.cpu().item()

    return {
        "filename": file.filename,
        "predicted_label": predicted_label_name,
        "confidence": confidence_score,
    }

@app.get("/")
def read_root():
    return {"message": "Welcome to the Kuih Classifier API"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
