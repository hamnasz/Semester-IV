# LU Decomposition: A Super Beginner-Friendly Guide 🚀

Let's learn about LU Decomposition step by step! We'll break down a square matrix $A$ into two special matrices: a **Lower triangular matrix** ($L$) and an **Upper triangular matrix** ($U$).

## 🔶 What is LU Decomposition?

Imagine you're taking a puzzle apart. LU Decomposition is like taking a square matrix $A$ and splitting it into two simpler pieces:

* **L (Lower triangular matrix):** This matrix has all zeros above the main diagonal and **1s** on the main diagonal.
* **U (Upper triangular matrix):** This matrix has all zeros below the main diagonal.

So, we can write:

$A = L \times U$

Why is this useful? Well, it makes solving systems of equations (like $Ax = b$) much faster, especially when you have the same $A$ but different $b$'s!

## 🔷 Step-by-Step LU Decomposition (Without Pivoting)

Let's use a simple 3x3 matrix as an example:

Let:
$A = \begin{bmatrix} 2 & 3 & 1 \\ 4 & 7 & 3 \\ 6 & 18 & 5 \end{bmatrix}$

Our goal is to find $L$ and $U$ such that:

$L = \begin{bmatrix} 1 & 0 & 0 \\ l_{21} & 1 & 0 \\ l_{31} & l_{32} & 1 \end{bmatrix}$

$U = \begin{bmatrix} u_{11} & u_{12} & u_{13} \\ 0 & u_{22} & u_{23} \\ 0 & 0 & u_{33} \end{bmatrix}$

🧠 **Memory Tip:**

"**L** has **1**s on the diagonal. **U** has **0**s below the diagonal."

### ✅ Step 1: Set up U’s first row and L’s first column

The first row of $U$ is the same as the first row of $A$:

$u_{11} = 2$
$u_{12} = 3$
$u_{13} = 1$

Now, to find the first column of $L$ (below the 1), we use the formula:

$l_{i1} = \frac{A_{i1}}{u_{11}}$

So:

$l_{21} = \frac{A_{21}}{u_{11}} = \frac{4}{2} = 2$

$l_{31} = \frac{A_{31}}{u_{11}} = \frac{6}{2} = 3$

Updating our matrices:

$L = \begin{bmatrix} 1 & 0 & 0 \\ 2 & 1 & 0 \\ 3 & ? & 1 \end{bmatrix}, \quad U = \begin{bmatrix} 2 & 3 & 1 \\ 0 & ? & ? \\ 0 & ? & ? \end{bmatrix}$

### ✅ Step 2: Second row of U

To get the zeros below the second element on the diagonal in $U$, we subtract multiples of the first row of $U$ from the rows below in $A$. The multipliers we use are the $l_{i1}$ values we just calculated.

For Row 2 of $A$:
$A_{2*} - l_{21} \times U_{1*} = [4, 7, 3] - 2 \times [2, 3, 1] = [4-4, 7-6, 3-2] = [0, 1, 1]$

So, the second row of $U$ is:

$u_{22} = 1, \quad u_{23} = 1$

For Row 3 of $A$:
$A_{3*} - l_{31} \times U_{1*} = [6, 18, 5] - 3 \times [2, 3, 1] = [6-6, 18-9, 5-3] = [0, 9, 2]$

Now, to find $l_{32}$, we look at the first non-zero element in the modified Row 3 (which is 9) and the corresponding element on the diagonal of the current $U$ row we're working on (which is $u_{22} = 1$).

$l_{32} = \frac{\text{first non-zero of modified Row 3}}{\text{diagonal of current U row}} = \frac{9}{1} = 9$

Updating our matrices again:

$L = \begin{bmatrix} 1 & 0 & 0 \\ 2 & 1 & 0 \\ 3 & 9 & 1 \end{bmatrix}, \quad U = \begin{bmatrix} 2 & 3 & 1 \\ 0 & 1 & 1 \\ 0 & 0 & ? \end{bmatrix}$

### ✅ Step 3: Last element of U

Now we need to make the element below the last diagonal of $U$ zero (it already is!). To find the last element $u_{33}$, we use the modified Row 3 we got in the previous step: $[0, 9, 2]$.

We subtract $l_{32}$ times the second row of the current $U$ from this modified Row 3:

$[0, 9, 2] - 9 \times [0, 1, 1] = [0-0, 9-9, 2-9] = [0, 0, -7]$

So, the last element of $U$ is:

$u_{33} = -7$

### ✅ Final:

Now we have our $L$ and $U$ matrices:

$L = \begin{bmatrix} 1 & 0 & 0 \\ 2 & 1 & 0 \\ 3 & 9 & 1 \end{bmatrix}, \quad U = \begin{bmatrix} 2 & 3 & 1 \\ 0 & 1 & 1 \\ 0 & 0 & -7 \end{bmatrix}$

### ✅ Final Check:

If we multiply $L \times U$, we should get back our original matrix $A$.

Would you like me to walk through that multiplication to verify?

## 🔁 LU Decomposition Summary (for any 3x3 matrix):

1.  Start with $U$ looking like $A$, and $L$ as an identity matrix (1s on the diagonal, 0s everywhere else).
2.  Eliminate the entries below the diagonal in $U$ column by column, using row operations.
3.  The multipliers you use in the row operations are the entries that go into the $L$ matrix (below the 1s on the diagonal).

## 💡 Visual Mnemonic:

Think of $L$ as a "Left staircase" and $U$ as a "Upper triangle":
