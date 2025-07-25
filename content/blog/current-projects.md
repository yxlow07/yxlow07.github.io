---
lastMod: "2025-06-01T11:25:20"
title: "Projects List"
date: 2025-05-16T12:00:00-00:00
draft: false
description: "A list of all projects I'm currently working on or is done."
image: "todo.png"
author: "Yu Xuan Low"
authorImage: "profile.png"
math: false
tags: 
---

### Projects List (In Progress / Ideation Stage)
- Double Pendulum Simulator and Balancer in Unity
- ~~AI-Powered Workout App~~
- [AI-Powered Doom Scroller for A Levels](/blog/a-level-doom-scroller/)
- Task Assignment based on Availability
- Group Games VS AI

<div class="py-4">
</div>

### Projects List (Completed / Onhold for Ideas / Improvements)
#### 1. Artificial Intelligence with Reprompting and Code Execution for Problem Solving

**Description**

The project takes in a problem statement, generates code to solve the problem, and then evaluates the code to determine if it meets the requirements. If the code does not meet the requirements, it generates a new prompt to improve the code. This process continues until the code meets the requirements or a maximum number of iterations is reached. This is an extremely simplified version of Google's Alpha Evolve, which includes a component to improve the prompt based on the evaluation of the code. 

**Further Improvements**
1. Add more sophisticated evaluation metrics to determine if the code meets the requirements.
2. Implement a more advanced prompt improvement strategy based on the evaluation results.

**Source code here: [AI with Reprompting and Code Execution](https://github.com/yxlow07/code-reprompter)**

#### 2. CNN Based Malaysian Traditional Cakes Image Classification

**Description**

This project is for a competition [**National AI Competition 2025**](https://hyperbyte.ai/naic/), hosted by **Hyperbyte**. The task was to train a neural network to classify images of Malaysian traditional cakes. The dataset had to be collected by ourselves, and we managed to collect over 5000 images with a variety of lighting, colors and textures. 

Initially, we started with Teachable Machine (TM) as a baseline, yielding a baseline accuracy of ~57% with 80 epochs and 0.0001 LR. In order to achieve a higher accuracy, we need to involve a more complex model compared to MobileNet utilized by TM. We switched to Keras (TensorFlow) using Google Colab and got an accuracy of around 80%. We applied some augmentations to our training images, such as color/contrast jitter, flips and rotations. 

To improve its performance, ... *(will be released after competition ends)*

**Source code here: [GitHub Link will be released after competition ends](https://example.com)**

#### 3. Generative User Interface for Differential Evaluation via Symptom Analysis and Record Keeping

**Description**

This project is based on the issue of overcrowding in hospitals, especially Emergency Departments (ED). The goal is to create a generative user interface that allows patients to input their symptoms and receive a preliminary diagnosis, as well as a record of their symptoms for future reference. This can help reduce the workload of doctors and nurses in EDs, allowing them to focus on more critical cases. **Research** of this project is currently ongoing, and the project has an initial prototype powered by Google's Gemini API. Backend code is currently **private** as more research is needed to improve the accuracy of the diagnosis.

**Source code here: [GUIDE-SHARK](https://github.com/yxlow07/guide-shark-frontend)**

**Video for More Info**
{{< embed src="guide-shark-reel.html" >}}