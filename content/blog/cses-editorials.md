---
title: "CSES Editorials"
date: 2025-05-11T12:00:00-00:00
draft: false
description: "A collection of editorials for CSES Problemset."
image: "double-pendulum.jpg"
author: "Yu Xuan Low"
authorImage: "profile.png"
tags: ["algorithms", "competitive programming", "dynamic programming", "graph theory", "ad hoc"]
---

## Introduction
CSES Problemset is a collection of competitive programming problems that are frequently used in contests. This blog post contains a collection of editorials for the problems in CSES Problemset. The solutions are written in C++ and are intended to be teach you the concept of the problem. Problems may be accessed at [CSES Problemset](https://cses.fi/problemset/).

## Template I will be using
```cpp
#include <bits/stdc++.h>
using namespace std;

#define ff(i, a, b) for (int i = a; i <= b; i++)
#define fb(i, b, a) for (int i = b; i >= a; i--)
#define loop(a, b) for (auto &a : b)
#define nl '\n'
#define sp ' '
#define ll long long

void solve() {
    // code here
}

signed main()
{
    ios::sync_with_stdio(false); cin.tie(nullptr); cout.tie(nullptr);
    cout << fixed << setprecision(10);
    int tt = 1; 
    // cin >> tt;
    while (tt--) solve();
}

```

## Introductory Problems
1. Weird Algorithm

This problem is fairly simple, just apply the algorithm as stated and output the result. This problem is the Collatz Conjecture, which states that for any positive integer n, the sequence will eventually reach 1. The sequence is defined as follows:
- If n is even, divide it by 2.
- If n is odd, multiply it by 3 and add 1.

Code:
```cpp
void solve() {
    ll n; cin >> n;
    cout << n << sp;
    while (n != 1) {
        if (n % 2 == 0) n /= 2;
        else n = 3 * n + 1;
        cout << n << sp;
    }
}
```
> Note the use of `ll` which represents `long long`, if you use `int`, the number will overflow and cause WA. 
