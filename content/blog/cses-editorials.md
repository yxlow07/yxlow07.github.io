---
title: "CSES Editorials"
date: 2025-05-11T12:00:00-00:00
draft: false
description: "A collection of editorials for CSES Problemset."
image: "cp.webp"
author: "Yu Xuan Low"
authorImage: "profile.png"
math: true
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

This problem is fairly simple, just apply the algorithm as stated and output the result. This problem is the [Collatz Conjecture](https://en.wikipedia.org/wiki/Collatz_conjecture), which states that for any positive integer n, the sequence will eventually reach 1. The sequence is defined as follows:
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

## Mathematics
2. Exponentiation
If the algorithm is done naively, the multiplication will take `O(nb)` time, where `n` is the number of test cases and `b` is the number of exponentiation needed to be done on `a`. We can do better. 
We can do better.  

\(a^{b+c} = a^b \cdot a^c\) is a simple bit of exponentiation math, and we can make \(a^{2b} = a^b \cdot a^b = (a^b)^2\). Then we can apply the following algorithm:

$$
a^n = \begin{cases}
1 &\text{if } n == 0 \\
\left(a^{\frac{n}{2}}\right)^2 &\text{if } n > 0 \text{ and } n \text{ even}\\
\left(a^{\frac{n - 1}{2}}\right)^2 \cdot a &\text{if } n > 0 \text{ and } n \text{ odd}\\
\end{cases}
$$

The solution is as follows:
```cpp
int MOD = 1e9+7;

int fastExp(int a, int b) {
    if (b == 0) return 1;
    int res = fastExp(a, b/2);
    int res_square = (res * res) % MOD;
    if (b % 2 == 0) return res_square;
    else return (res_square * a) % MOD;
}

void solve() {
    int a, b; cin >> a >> b;
    cout << fastExp(a,b) << nl;
}
```
> Note that `MOD` is used after every multiplication process, you can read more about it [here](https://en.wikipedia.org/wiki/Modular_arithmetic#Basic_properties).