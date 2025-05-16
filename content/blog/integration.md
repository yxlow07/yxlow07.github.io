---
title: "Interesting Integration Problems"
date: 2025-05-15T12:00:00-00:00
draft: false
description: "A collection of interesting integration problems with solutions attached."
image: "integration.png"
author: "Yu Xuan Low"
authorImage: "profile.png"
math: true
tags: ["mathematics", "creativity", "problem solving", "integration", "calculus"]
---

## Introduction
Integration is a core part of calculus, often presenting unique challenges that require creative ways to solve. In this post, I will share some of the interesting integration problems I have encountered, along with their solutions. Take some time to try them out before checking out my solutions!

### Problem 1
Evaluate the integral:
<div class="text-2xl">
\[
\int x^\frac{1}{\ln(x)} \, dx
\]
</div>

Solution:
$$
\begin{aligned}
u &= x^{\frac{1}{\ln(x)}} \\
&= e^{\ln(x) \times \frac{1}{\ln(x)}} \\
&= e \\
\int e \, dx &= ex + C
\end{aligned}
$$

