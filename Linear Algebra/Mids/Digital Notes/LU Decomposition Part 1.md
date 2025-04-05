# 🔢 LU Decomposition - Step-by-Step Guide

A beginner-friendly breakdown of LU Decomposition, with memory tips and visuals!

---

## 🔶 What is LU Decomposition?

LU Decomposition means breaking a square matrix **A** into two parts:

- **L** = Lower triangular matrix (with 1’s on the diagonal)  
- **U** = Upper triangular matrix

So,  
> **A = L × U**

This is especially useful for solving systems of equations like **Ax = b** quickly when **A** is reused with multiple **b** vectors.

---

## 🔷 Step-by-Step LU Decomposition (Without Pivoting)

### Example:

Let:

$$
A = \begin{bmatrix}
2 & 3 & 1 \\
4 & 7 & 3 \\
6 & 18 & 5
\end{bmatrix}
$$

We want:

$$
L = \begin{bmatrix}
1 & 0 & 0 \\
l_{21} & 1 & 0 \\
l_{31} & l_{32} & 1
\end{bmatrix}, \quad
U = \begin{bmatrix}
u_{11} & u_{12} & u_{13} \\
0 & u_{22} & u_{23} \\
0 & 0 & u_{33}
\end{bmatrix}
$$

---

### 🧠 Memory Tip:
> **L** has 1s *on* the diagonal.  
> **U** has 0s *below* the diagonal.

---

### ✅ Step 1: Set up U’s first row and L’s first column

From matrix A:

- \( u_{11} = 2 \)
- \( u_{12} = 3 \)
- \( u_{13} = 1 \)

Now calculate:

- \( l_{21} = \frac{4}{2} = 2 \)
- \( l_{31} = \frac{6}{2} = 3 \)

Updated so far:

$$
L = \begin{bmatrix}
1 & 0 & 0 \\
2 & 1 & 0 \\
3 & ? & 1
\end{bmatrix}, \quad
U = \begin{bmatrix}
2 & 3 & 1 \\
0 & ? & ? \\
0 & ? & ?
\end{bmatrix}
$$

---

### ✅ Step 2: Second row of U

For Row 2:

$$
[4, 7, 3] - 2 \times [2, 3, 1] = [0, 1, 1]
$$

So:

- \( u_{22} = 1 \)
- \( u_{23} = 1 \)

For Row 3:

$$
[6, 18, 5] - 3 \times [2, 3, 1] = [0, 9, 2]
$$

Then:

- \( l_{32} = \frac{9}{1} = 9 \)

Updated:

$$
L = \begin{bmatrix}
1 & 0 & 0 \\
2 & 1 & 0 \\
3 & 9 & 1
\end{bmatrix}, \quad
U = \begin{bmatrix}
2 & 3 & 1 \\
0 & 1 & 1 \\
0 & 0 & ?
\end{bmatrix}
$$

---

### ✅ Step 3: Last element of U

Now subtract:

$$
[0, 9, 2] - 9 \times [0, 1, 1] = [0, 0, -7]
$$

So:

- \( u_{33} = -7 \)

Final result:

$$
L = \begin{bmatrix}
1 & 0 & 0 \\
2 & 1 & 0 \\
3 & 9 & 1
\end{bmatrix}, \quad
U = \begin{bmatrix}
2 & 3 & 1 \\
0 & 1 & 1 \\
0 & 0 & -7
\end{bmatrix}
$$

---

## ✅ Final Check

Multiply **L × U** — should reconstruct matrix **A**.  
Would you like help with that step?

---

## 🔁 LU Decomposition Summary (for any 3×3 matrix)

1. Start with \( U = A \), and \( L = I \) (identity matrix)
2. Eliminate below-diagonal entries in U using row operations
3. Store multipliers in L

---

## 💡 Visual Mnemonic

Think of **L** as a **Left staircase**  
Think of **U** as an **Upper triangle**

