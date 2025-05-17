---
title: "CSES Editorials"
date: 2025-05-11T12:00:00-00:00
draft: false
description: "A collection of editorials for CSES Problemset."
image: "cp.webp"
author: "Yu Xuan Low"
authorImage: "profile.png"
math: true
tags:
  [
    "algorithms",
    "competitive programming",
    "dynamic programming",
    "graph theory",
    "ad hoc",
  ]
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

1. **Weird Algorithm**

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

2. **Missing Number**

This problem is also simple, just take the sum of all the provided numbers (`accumulate(a.begin(), a.end(), 0ll)`) and subtract it from the expected sum. You can find the expected sum using the formula \(S_n = \frac{n(n+1)}{2}\).

Code:

```cpp
void solve() {
    ll n; cin >> n;
    vector<ll> a(n-1);
    loop(x, a) cin >> x;
    cout << (n * (n + 1ll) / 2ll) - accumulate(a.begin(), a.end(), 0ll) << nl;
}
```

> `1ll` stands for `1` as a `long long` integer

3. **Repetitions**

This problem can be solved using a simple loop, for each position `i`, check if it `a[i] == a[i-1]`, if it is, increment the count. If not, update the global maximum.

```cpp
void solve() {
    string s; cin >> s;
    int n = s.size();
    int max_count = 1, count = 1;
    ff(i, 1, n-1) {
        if (s[i] == s[i-1]) count++;
        else {
            max_count = max(max_count, count);
            count = 1;
        }
    }
    cout << max(max_count, count) << nl;
}
```

> Note that `max_count` is updated after the loop, in case the longest repetition is at the end of the string.

4. **Increasing Array**

This problem introduces the concept of `greedy`, which is common by taking the local optimum. This problem can be solved by increasing each element to the maximum of the previous element.

```cpp
void solve() {
    int n; cin >> n;
    vector<int> a(n);
    loop(x, a) cin >> x;
    ll ans = 0;
    ff(i, 1, n-1) {
        ans += max(0, a[i-1] - a[i]);
        a[i] = max(a[i], a[i-1]);
    }
    cout << ans << nl;
}
```

> Remember to update the current element to the maximum of the previous element, otherwise the next element will not be correct.

5. **Permutations**

This problem can be solved by trying out the first few test cases. For example:

- For `n = 1`, the only permutation is `1`.
- For `n = 2`, the only permutation is `1 2` or `2 1`. 
- For `n = 3`, the only permutation is `1 2 3` or `3 1 2` or `2 1 3`. All of which are invalid per the condition of the statement.
- However, for `n = 4`, we can arrange it in this way: `2 4 1 3`
- Similarly, for `n = 5`, we can arrange it in this way: `2 4 1 3 5`, notice the pattern?

Code:
```cpp
void solve() {
    int n; cin >> n;
    if (n == 1) cout << 1;
    else if (n == 2 || n == 3) cout << "NO SOLUTION";
    else {
        for (int i = 2; i <= n; i += 2) cout << i << sp;
        for (int i = 1; i <= n; i += 2) cout << i << sp;
    }
}
```

## Mathematics Problems

2. **Exponentiation**

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
