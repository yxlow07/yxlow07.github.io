---
lastMod: "2025-12-28T12:00:00+08:00"
title: "2nd AICC Competition Editorials (Unofficial)"
date: 2025-12-30T17:00:00+08:00
draft: false
description: "An unofficial collection of editorials for the 2nd AICC competition with solutions by me"
image: "aicc2.png"
author: "Yu Xuan Low"
authorImage: "profile.png"
math: true
tags:
  [
    "algorithms",
    "competitive ai",
  ]
---

# Intro
My first competition in quite a few months! I'm quite new to the scene so don't slam me for the suboptimal solutions here.
The theme for this competition is NLP, Audio and CV. After spending ~10 minutes reading the problem statements, I think the difficulty rank is `Essay Gap < Face Matching < Audio Demixing`.

# Task 1: Essay Gap

## Problem statement (simplified):
Given a cloze task with missing sentence, train/fine-tune a model to choose the best choice from 4 options that maximizes the coherence of the text. 

## Main idea:
Get a small pretrained language model (e.g. DeBERTa-v3-small) and fine-tune it on the training set. 

1. For each training sample, we make 4 copies of it, each filled with one of the options. E.g. `before {opt_X} after`
2. Then we get a model that runs the text through a transformer and get a score for each option. Softmax the scores to get probabilities.
3. Fine-tune the model on the correct labels
4. Then we run the same model on the test set and get max probability option as the prediction.

## Code:
Coming to GitHub soon!

## Improvements
This code runs in ~5 minutes on a laptop GPU with a LB score of 0.97. One of my ideas to improve is simply use a larger model (i.e. `microsoft/deberta-v3-large`)

Simple change, it gets me 1.0 score!

# Task 2: Face Matching
## Problem statement (simplified):
Given some images that is particularly tricky with some sunglasses, poses, clothes differences, cluster them based on the reference images. For this I tried a few techniques and my score progression is roughly: `0.60 -> 0.70 -> 0.89 (BEST)`

## First idea:
**Zero-shot classification**

This sounds like a zero-shot classification problem, the simplest way is to use a CLIP model to extract the image embeddings and use cosine similarity between ref image -> all images and select the max similarity as the prediction.
Simple enought, it gets 0.53 score with 0.80 threshold while decreasing threshold roughly brought it up to 0.60. Interestingly, TTA didn't help much here. (If you know why, please let me know!)

## First improvement
**Take in overall score with respect to statistical significance**

There are some generic photos which caused a lot of high score matches, however, it may be the "highly generic" face caused all the matches to get high scores. To solve this, I normalize the scores using Z-score normalization and compute the statistical significance of each match. This solves the issue of "hoarding" with a little improvement to 0.70 score.

## Second improvement
**Minimizing the "cost" of assignment (Slight improvement only)**

Instead of taking the max similarity, we can treat this as an assignment problem and minimize the overall cost of assignment using Hungarian algorithm. This gives a slight improvement to 0.72 score. It works by prioritizing the "global score" rather than "local max score". I used this to try and combat the tricky poses that have high similarity to the wrong person having the same pose.

## Last improvement
**Larger model...?**

I notice the code runs very fast, so why not swap in a larger clip model? I swapped in `clip-vit-large-patch14` and it got me to 0.89 score! This is probably due to the larger model having better representation and able to catch smaller details.

## Code:
Coming to GitHub soon!

# Task 3: Audio Demixing
_Damn I am not good whatsoever at audio tasks, please suggests resources to study!_

## Problem statement (simplified):
Given an audio with two distinct environment sounds mixed together, separate them into two audios.

## Main idea:
Since there's two audios, we need to implement a loss function that can handle permutation invariant training (PIT). I used the MSE loss as per the problem's evaluation metric. Then for the model, I used a U-Net architecture that takes in the spectrogram of the mixed audio and outputs two spectrograms. 
