---
date: '2025-07-22T00:00:00+08:00'
draft: false
title: 'National AI Competition'
lastMod: "2025-07-22T00:00:00+08:00"
description: "NAIC experience and insights from the 1st Runner-Up of the Technical Track. Code and resources included."
image: "naic-kuih.png"
author: "Yu Xuan Low"
authorImage: "profile.png"
math: false
tags: ["AI", "image classification", "competition", "education", "EfficientNetV2", "machine learning", "problem solving"]
---
This is the blog detailing how our team, **KThxByte**, managed to get **1st Runner Up** in the **Technical Track** of the National Artificial Intelligence Competition 2025.

## Table of Contents

1. [Introduction and Task Description](#introduction)
2. [Collecting Data](#collecting-data)
3. [Data Preprocessing](#data-preprocessing)
4. [Data Augmentation](#data-augmentation)
5. [Model Selection](#model-selection)
6. [Training the Model](#training-the-model)
7. [Evaluation and Results](#evaluation-and-results)
8. [Conclusion and Future Work](#conclusion-and-future-work)

If you are looking for the link to the classifier, [click here](/kuih-classifier). The model currently is **not** hosted online but you can download it from [this repository](https://github.com/yxlow07/naic-model-2025) and run it locally.

## Introduction and Task Description <a name="introduction"></a>

A summary of the task is to create a *kuih classifier* capable of identifying the predetermined **8 types of kuih** outlined in the [competition guidebook](https://drive.google.com/file/d/10FIKYx8a105FuY49wQJeV5KbrEDe3n2r/view?usp=sharing). We have a few weeks to collect the data and have to train a model (*no specific restrictions*) to classify the kuihs in a private test set. One of the most prominent judging criteria is the **model performance**. More info could be read in the [competition guidebook](https://drive.google.com/file/d/10FIKYx8a105FuY49wQJeV5KbrEDe3n2r/view?usp=sharing).

> Kuihs are traditional Malaysian cakes, often colourful and made with various ingredients, perfect for a snack. The image below shows the 8 types of kuih we are tasked to classify.
> ![Fig 1.0: The 8 types of kuih to classify](/images/naic-kuih.png)

## Collecting Data <a name="collecting-data"></a>

There is a saying in the machine learning (ML) community: **Garbage in, Garbage out**. This means that the quality of the data we feed the model affects the quality of the model. Our primary focus is to curate and collect a high-quality dataset that is devoid of noise and bias. Some of the sources we used were **Google Images**, **cooking blogs and forums**, **publicly available datasets** and most importantly **kuihs we bought**.

In total, we are able to collect over `17,000` images with *kuihs* in various angles, backgrounds, positions, etc., to create a rich dataset.

![](/images/naic-image-count.png)

## Data Preprocessing <a name="data-preprocessing"></a>

The next step is to preprocess the data. Without preprocessing, we will face a lot of issues, such as images with extremely high resolutions, different image colour channels, colour spaces, formats, etc. We had to **learn this the hard way** as we initially thought we could just feed the images into the model. Without preprocessing, the images would also trigger `CUDA out of memory` errors, as some of our phone cameras take images with pixel counts larger than the limit of [`89478485 pixels`](https://pillow.readthedocs.io/en/stable/reference/Image.html#PIL.Image.MAX_IMAGE_PIXELS). A short snippet of code to convert the images to a standard format (`512x512, RGB, PNG`) is shown below:

```python
try:
    img = Image.open(source_path)

    # Convert Colour Space
    if img.mode == 'RGBA' or img.mode == 'P':
        img = img.convert("RGBA")
        background = Image.new("RGB", img.size, (255, 255, 255))
        background.paste(img, mask=img.split()[3]) # Paste with alpha channel to handle transparency
        img = background
    elif img.mode != 'RGB':
        img = img.convert("RGB")

    # Resize using LANCZOS resampling (Very useful algorithm for downscaling)
    resized_img = img.resize(target_size, Image.Resampling.LANCZOS) 

    new_filename = f"{file_counter}.{output_format.lower()}"
    target_path = os.path.join(target_class_dir, new_filename)
    resized_img.save(target_path, format=output_format)
except Exception as e:
    print(f"Error processing {source_path}: {e}")  
```

> **Key Takeaway:** Standardizing and preprocessing makes your life _a ton_ better

## Data Augmentation <a name="data-augmentation"></a>

Augmentation is a crucial step if you want your model to generalise well. We chose a few techniques, including `random flips and rotation`, `colour jittering` and `random erasing`. This is done using the torchvision library, as it provides all the augmentation techniques we need. The code snippet and image below shows how we implemented the augmentation:

```python
transform_flip_rotate = transforms.Compose([
    transforms.RandomHorizontalFlip(p=0.5),
    transforms.RandomVerticalFlip(p=0.5),
    transforms.RandomRotation(degrees=45),
    transforms.ToTensor()
])

transform_color_jitter = transforms.Compose([
    transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2, hue=0.1),
    transforms.ToTensor()
])

transform_random_erasing = transforms.Compose([
    transforms.ToTensor(),
    transforms.RandomErasing(p=0.5, scale=(0.02, 0.1), ratio=(0.3, 3.3), value='random')
])
```

![Augmentation Example](/images/naic-augmentations.png)

During the competition, we learnt that many people applied <red>**a whole list of augmentations**</red>. However, this is <red>**counterproductive**</red> as most of what they used were just noise, making the model hard to converge. By keeping it simple, we were able to achieve greater accuracy and performance.

> **Key Takeaway**: **don't overdo it**. Sometimes, less is more.

## Model Selection <a name="model-selection"></a>

Next up is finally going into the machine learning part. We had a few requirements:

1. The model should be **lightweight** and **fast**.
2. The model should be "complex enough" to learn the features of the kuihs.
3. The model should exceed our baseline accuracy (more on this later).

The easiest way to train a model to classify kuihs is through **transfer learning**. Training a model from scratch requires hyperparameter tuning, modiying the layers of the neural network to improve performance, etc., which is why we ultimately decided against it.

Before we even start deciding the model, we should train a **baseline** in order to assess the *improvement* of our model. We went with **Teachable Machine by Google**, which lets us setup and train in less than 10 minutes. With some runs, the best we manage to get is `57% testing accuracy`, given `~100 images` per kuih class.

Selecting a model is a simple task that is quite *common* in competitions like these. We repeat a simple process to determine the best model for our data and usage.

1. Select a few images (~100 per class)
2. Define the model (loss function doesn't need to be redefined)
3. Train the model (`epoch=20, lr=0.001`) without *fine-tuning* (more on this later)
4. Evaluate the model (`accuracy` is the simplest metric)
5. Repeat steps `2-4` with different models

Some of the models we tried were `ResNet34`, `RestNet50`, `EfficientNetV2`, `Vision Transformers (ViT)`. Through this process, we were able to determine that `EfficientNetV2` is the best at this task. Its model architecture is shown below.

![](/images/naic-efficientnetv2.png)
<cent>EfficientNetV2 Model Architecture</cent>

> **Key takeaway**: Try out different things before jumping into full-on training

## Training the Model <a name="training-the-model"></a>

With the model decision being EfficientNetV2, we start training. Such a large dataset required us to use a lot of **GPU VRAM** just to process the images. On my device with an **NVIDIA Laptop 4050**, it crashed just having a batch size of `8`. We had to turn to **Google Colab** to train the model. We first define some of our hyperparameters as below:

```py
IMG_HEIGHT = 512
IMG_WIDTH = 512
BATCH_SIZE = 32 # Adjust based on GPU VRAM
VAL_SPLIT_RATIO = 0.2 # Validation Split Ratio, 80% validation, 20% test
LEARNING_RATE = 0.001
EPOCHS = 30 # Max epochs; early stopping might trigger sooner
SEED = 42 # For reproducibility
TARGET_ACCURACY_FOR_EARLY_EXIT = 0.98 # Stop if val_accuracy hits 98%
```

Using `datasets.ImageFolder`, we don't need to define our own custom `DataLoader`. Then, we define our model as below:

```py
model = timm.create_model(
        PRETRAINED_MODEL_NAME,
        pretrained=True,
        num_classes=NUM_CLASSES, # This replaces the classifier head to 8 kuihs
        drop_rate=0.3, # Dropout rate for the classifier head
        drop_path_rate=0.2 # Stochastic depth drop path rate
    )

criterion = nn.CrossEntropyLoss(weight=class_weights)
optimizer = optim.AdamW([
    {'params': model.get_classifier().parameters() if hasattr(model, 'get_classifier') else model.classifier.parameters()}
], lr=LEARNING_RATE, weight_decay=0.01) # Better regularization
```

#### Class Imbalances
Due to the dataset being collected from various sources, we noticed there were some classes having less images than others. To fix this, we used the confusion matrix from the testing to determine the class weights. In the end, `2.5` weight was applied to 2 kuihs while the rest remain `1.0`. 

#### Transfer Learning

Since this model is trained through transfer learning, we first split the training into two phases: **train the final output layer**, **fine-tuning deeper layers**. 

#### Training the output layer
In this phase, we only train the final output layer. `GradScaler` is used to prevent overflowing the gradients, common in large model trainings. With `17 epochs`, we noticed that the model stabilises at around `87%` and we manually stopped the training. 

![](/images/naic-initial-training.png)

#### Fine-tuning deeper layers
To acheive better performance, there is two main ways, the first is to tuning the model's hyperparameters, while the second is to fine-tune the deeper layers. We chose the latter as it is easier to implement and faster to train. 

```py
# Unfreezing block 4 onwards
for name, param in model.named_parameters():
    layers = ['blocks.4', 'blocks.5', 'blocks.6', 'conv_head', 'bn2', 'classifier']
    for layer in layers:
        if layer in name:
            param.requires_grad = True
        else:
            param.requires_grad = False

# Using a lower learning rate
FINE_TUNE_LEARNING_RATE = LEARNING_RATE / 10
optimizer_finetune = optim.AdamW(
    filter(lambda p: p.requires_grad, model.parameters()), # Only pass trainable parameters
    lr=FINE_TUNE_LEARNING_RATE,
    weight_decay=0.01
)
```

With just `2 epochs`, we managed to achieve `98% validation accuracy`.

![](/images/naic-finetuning.png)

> **Key takeaway**: **Fine-tuning deeper layers** is a great and easy way to improve model performance.

## Evaluation and Results <a name="evaluation-and-results"></a>

We managed to achieve `validation accuracy` of `98%` and `test accuracy` of `100%`. Classification report and confusion matrix is shown below:

![](/images/naic-validation-classification-report.png)

![](/images/naic-validation-batch-test.png)

## Conclusion and Future Work <a name="conclusion-and-future-work"></a>
We were extremely satisfied with the results of our model, huge shout out to my teammates who gathered this insane amount of data, helped with market research and brought us _kuih_ at 6.30 a.m. for our presentation. 

#### Market Value and etc.

In _kuihs_ shop in Malaysia, we notice there is a lack of manpower in the kitchen, as there is a need for a lot of manpower handling the payments as not all employees are proficient with kuih recognising. By talking to a few shop owners around KL and Penang, they expressed interest in this project as it helps automate the process of buying _kuihs_, allowing more workers to focus on producing high quality _kuihs_.

#### GitHub Repository

The code for this project is available on [GitHub](https://github.com/yxlow07/naic-model-2025/). It includes the posters we used, the model, the API and the requirements. However, the `training code` is not provided. If you have any need for it, please contact me via [email](mailto:yuxuanlow013@gmail.com) as it looks a little messy without cleaning up. I will be happy to share it with you.
