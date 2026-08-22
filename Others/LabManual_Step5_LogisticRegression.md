# Step 5: Logistic Regression for Binary Classification & Model Evaluation using Metrics (R², MAE, MSE)

## Introduction

Logistic Regression is a supervised machine learning algorithm used for binary classification tasks—problems where the target variable has two possible outcomes (like "Yes" or "No"). It models the probability of a certain class or event. Model evaluation metrics help us understand how well our regression or classification models are performing. Common metrics include R² (coefficient of determination), MAE (Mean Absolute Error), and MSE (Mean Squared Error).

---

## Code (from `forlabmanual.py`)

```python
from sklearn.impute import SimpleImputer
group_1 = [
    'PoolQC', 'MiscFeature', 'Alley', 'Fence', 'FireplaceQu', 'GarageType',
    'GarageFinish', 'GarageQual', 'GarageCond', 'BsmtQual', 'BsmtCond',
    'BsmtExposure', 'BsmtFinType1', 'BsmtFinType2', 'MasVnrType'
]
X[group_1] = X[group_1].fillna("None")
group_2 = [
    'GarageArea', 'GarageCars', 'BsmtFinSF1', 'BsmtFinSF2', 'BsmtUnfSF',
    'TotalBsmtSF', 'BsmtFullBath', 'BsmtHalfBath', 'MasVnrArea'
]
X[group_2] = X[group_2].fillna(0)
group_3a = [
    'Functional', 'MSZoning', 'Electrical', 'KitchenQual', 'Exterior1st',
    'Exterior2nd', 'SaleType', 'Utilities'
]
imputer = SimpleImputer(strategy='most_frequent')
X[group_3a] = pd.DataFrame(imputer.fit_transform(X[group_3a]), index=X.index)
X.LotFrontage = X.LotFrontage.fillna(X.LotFrontage.mean())
X.GarageYrBlt = X.GarageYrBlt.fillna(X.YearBuilt)
sum(X.isnull().sum())
sns.set_style('darkgrid')
plt.figure(figsize=(8, 6))
sns.scatterplot(x='GrLivArea', y='SalePrice', data=train_data)
title = plt.title('House Price vs. Living Area')
outlier_index = train_data[(train_data.GrLivArea > 4000)
                           & (train_data.SalePrice < 200000)].index
X.drop(outlier_index, axis=0, inplace=True)
y.drop(outlier_index, axis=0, inplace=True)
X['totalSqFeet'] = X['TotalBsmtSF'] + X['1stFlrSF'] + X['2ndFlrSF']
X['totalBathroom'] = X.FullBath + X.BsmtFullBath + 0.5 * (X.HalfBath + X.BsmtHalfBath)
X['houseAge'] = X.YrSold - X.YearBuilt
X['reModeled'] = np.where(X.YearRemodAdd == X.YearBuilt, 0, 1)
X['isNew'] = np.where(X.YrSold == X.YearBuilt, 1, 0)
label_encoding_cols = [
    "Alley", "BsmtCond", "BsmtExposure", "BsmtFinType1", "BsmtFinType2",
    "BsmtQual", "ExterCond", "ExterQual", "FireplaceQu", "Functional",
    "GarageCond", "GarageQual", "HeatingQC", "KitchenQual", "LandSlope",
    "LotShape", "PavedDrive", "PoolQC", "Street", "Utilities"
]
label_encoder = LabelEncoder()
for col in label_encoding_cols:
    X[col] = label_encoder.fit_transform(X[col])
to_factor_cols = ['YrSold', 'MoSold', 'MSSubClass']
for col in to_factor_cols:
    X[col] = X[col].apply(str)
from scipy.stats import norm
def normality_plot(X):
    fig, axes = plt.subplots(1, 2, figsize=(10, 5))
    sns.distplot(X, fit=norm, ax=axes[0])
    axes[0].set_title('Distribution Plot')
    axes[1] = stats.probplot((X), plot=plt)
    plt.tight_layout()
normality_plot(y)
y = np.log(1 + y)
normality_plot(y)
numeric_data = train_data.select_dtypes(include='number')
skewness = numeric_data.skew().sort_values(ascending=False)
skewness[abs(skewness) > 0.75]
normality_plot(X.GrLivArea)
skewed_cols = list(skewness[abs(skewness) > 0.5].index)
skewed_cols = [
    col for col in skewed_cols if col not in ['MSSubClass', 'SalePrice']
]
for col in skewed_cols:
    X[col] = np.log(1 + X[col])
normality_plot(X.GrLivArea)
from sklearn.preprocessing import RobustScaler
numerical_cols = list(X.select_dtypes(exclude=['object']).columns)
scaler = RobustScaler()
X[numerical_cols] = scaler.fit_transform(X[numerical_cols])
X = pd.get_dummies(X, drop_first=True)
print("X.shape:", X.shape)
ntest = len(test_data)
X_train = X.iloc[:-ntest, :]
X_test = X.iloc[-ntest:, :]
print("X_train.shape:", X_train.shape)
print("X_test.shape:", X_test.shape)
from sklearn.model_selection import KFold, cross_val_score
n_folds = 5
def getRMSLE(model):
    kf = KFold(n_folds, shuffle=True, random_state=42)
    rmse = np.sqrt(-cross_val_score(
        model, X_train, y, scoring="neg_mean_squared_error", cv=kf))
    return rmse.mean()
from sklearn.linear_model import Ridge, Lasso
lambda_list = list(np.linspace(20, 25, 101))
rmsle_ridge = [getRMSLE(Ridge(alpha=lambda_)) for lambda_ in lambda_list]
rmsle_ridge = pd.Series(rmsle_ridge, index=lambda_list)
rmsle_ridge.plot(title="RMSLE by lambda")
plt.xlabel("Lambda")
plt.ylabel("RMSLE")
print("Best lambda:", rmsle_ridge.idxmin())
print("RMSLE:", rmsle_ridge.min())
ridge = Ridge(alpha=22.9)
lambda_list = list(np.linspace(0.0006, 0.0007, 11))
rmsle_lasso = [
    getRMSLE(Lasso(alpha=lambda_, max_iter=100000)) for lambda_ in lambda_list
]
rmsle_lasso = pd.Series(rmsle_lasso, index=lambda_list)
rmsle_lasso.plot(title="RMSLE by lambda")
plt.xlabel("Lambda")
plt.ylabel("RMSLE")
print("Best lambda:", rmsle_lasso.idxmin())
print("RMSLE:", rmsle_lasso.min())
lasso = Lasso(alpha=0.00065, max_iter=100000)
from xgboost import XGBRegressor
xgb = XGBRegressor(
    learning_rate=0.05,
    n_estimators=2100,
    max_depth=2,
    min_child_weight=2,
    gamma=0,
    subsample=0.65,
    colsample_bytree=0.46,
    scale_pos_weight=1,
    reg_alpha=0.464,
    reg_lambda=0.8571,
    random_state=7,
    n_jobs=2,
    verbosity=0 
)
getRMSLE(xgb)
from lightgbm import LGBMRegressor
X_train.columns = X_train.columns.str.replace(' ', '_')
lgb = LGBMRegressor(
    objective='regression',
    learning_rate=0.05,
    n_estimators=730,
    num_leaves=8,
    min_data_in_leaf=4,
    max_depth=3,
    max_bin=55,
    bagging_fraction=0.78,
    bagging_freq=5,
    feature_fraction=0.24,
    feature_fraction_seed=9,
    bagging_seed=9,
    min_sum_hessian_in_leaf=11,
    verbosity=-1
)
getRMSLE(lgb)
from sklearn.base import BaseEstimator, RegressorMixin, TransformerMixin, clone
class AveragingModel(BaseEstimator, RegressorMixin, TransformerMixin):
    def __init__(self, models):
        self.models = models
    def fit(self, X, y):
        self.models_ = [clone(x) for x in self.models]
        for model in self.models_:
            model.fit(X, y)
        return self
    def predict(self, X):
        predictions = np.column_stack(
            [model.predict(X) for model in self.models_])
        return np.mean(predictions, axis=1)
avg_model = AveragingModel(models=(ridge, lasso, xgb, lgb))
getRMSLE(avg_model)
X_test = X_test.reindex(columns=X_train.columns, fill_value=0)
my_model = avg_model
my_model.fit(X_train, y)
predictions = my_model.predict(X_test)
final_predictions = np.exp(predictions) - 1
output = pd.DataFrame({'Id': test_data.index, 'SalePrice': final_predictions})
output.to_csv('submission.csv', index=False)
```

---

## Explanation Table

| Code Line (or Block) | Simple Explanation |
|----------------------|-------------------|
| `from sklearn.impute import SimpleImputer` | Imports a tool for filling missing values. |
| `group_1 = [...]` | Groups columns where missing values will be filled with "None". |
| `X[group_1] = X[group_1].fillna("None")` | Fills missing values in group 1 columns with "None". |
| `group_2 = [...]` | Groups columns where missing values will be filled with 0. |
| `X[group_2] = X[group_2].fillna(0)` | Fills missing values in group 2 columns with 0. |
| `group_3a = [...]` | Groups columns where missing values will be filled with the most frequent value. |
| `imputer = SimpleImputer(strategy='most_frequent')` | Sets up an imputer to fill with the most frequent value. |
| `X[group_3a] = pd.DataFrame(imputer.fit_transform(X[group_3a]), index=X.index)` | Applies imputer to fill missing values in group 3a columns. |
| `X.LotFrontage = X.LotFrontage.fillna(X.LotFrontage.mean())` | Fills missing LotFrontage with the mean. |
| `X.GarageYrBlt = X.GarageYrBlt.fillna(X.YearBuilt)` | Fills missing GarageYrBlt with YearBuilt value. |
| `sum(X.isnull().sum())` | Checks for any remaining missing values. |
| `sns.set_style('darkgrid')` | Sets plot style for better visuals. |
| `plt.figure(figsize=(8, 6)); sns.scatterplot(x='GrLivArea', y='SalePrice', data=train_data)` | Plots living area vs. sale price. |
| `outlier_index = train_data[(train_data.GrLivArea > 4000) & (train_data.SalePrice < 200000)].index` | Finds outliers: large area but low price. |
| `X.drop(outlier_index, axis=0, inplace=True); y.drop(outlier_index, axis=0, inplace=True)` | Removes those outliers from data. |
| `X['totalSqFeet'] = X['TotalBsmtSF'] + X['1stFlrSF'] + X['2ndFlrSF']` | Engineers a new feature: total square feet. |
| `X['totalBathroom'] = X.FullBath + X.BsmtFullBath + 0.5 * (X.HalfBath + X.BsmtHalfBath)` | Creates a new "total bathrooms" feature. |
| `X['houseAge'] = X.YrSold - X.YearBuilt` | Creates a feature for house age. |
| `X['reModeled'] = np.where(X.YearRemodAdd == X.YearBuilt, 0, 1)` | Creates a feature: 1 if remodeled, else 0. |
| `X['isNew'] = np.where(X.YrSold == X.YearBuilt, 1, 0)` | Creates a feature: 1 if new, else 0. |
| `label_encoding_cols = [...]` | Lists columns to be label-encoded. |
| `label_encoder = LabelEncoder(); for col in label_encoding_cols: X[col] = label_encoder.fit_transform(X[col])` | Encodes categorical columns with numbers. |
| `to_factor_cols = ['YrSold', 'MoSold', 'MSSubClass']; for col in to_factor_cols: X[col] = X[col].apply(str)` | Converts some columns to strings. |
| `from scipy.stats import norm; def normality_plot(X): ...` | Defines a function to plot and check for normal distribution. |
| `normality_plot(y)` | Plots the distribution of target variable y. |
| `y = np.log(1 + y)` | Log-transforms the target to reduce skewness. |
| `normality_plot(y)` | Plots the log-transformed target. |
| `numeric_data = train_data.select_dtypes(include='number'); skewness = numeric_data.skew().sort_values(ascending=False); skewness[abs(skewness) > 0.75]` | Checks skewness of numeric features. |
| `normality_plot(X.GrLivArea)` | Plots living area distribution. |
| `skewed_cols = list(skewness[abs(skewness) > 0.5].index); skewed_cols = [col for col in skewed_cols if col not in ['MSSubClass', 'SalePrice']]` | Finds highly skewed columns, excluding some. |
| `for col in skewed_cols: X[col] = np.log(1 + X[col])` | Log-transforms skewed features. |
| `from sklearn.preprocessing import RobustScaler; numerical_cols = list(X.select_dtypes(exclude=['object']).columns); scaler = RobustScaler(); X[numerical_cols] = scaler.fit_transform(X[numerical_cols])` | Scales numerical features robustly. |
| `X = pd.get_dummies(X, drop_first=True)` | One-hot encodes categorical variables. |
| `print("X.shape:", X.shape)` | Prints the shape of the feature set. |
| `ntest = len(test_data); X_train = X.iloc[:-ntest, :]; X_test = X.iloc[-ntest:, :]; print("X_train.shape:", X_train.shape); print("X_test.shape:", X_test.shape)` | Splits data into training and test sets. |
| `from sklearn.model_selection import KFold, cross_val_score; n_folds = 5` | Sets up 5-fold cross-validation for evaluation. |
| `def getRMSLE(model): ...` | Defines function to calculate Root Mean Squared Log Error (RMSLE). |
| `from sklearn.linear_model import Ridge, Lasso` | Imports regression models for evaluation. |
| `lambda_list = list(np.linspace(20, 25, 101)); rmsle_ridge = [getRMSLE(Ridge(alpha=lambda_)) for lambda_ in lambda_list]; rmsle_ridge = pd.Series(rmsle_ridge, index=lambda_list)` | Tests different Ridge regression strengths and records RMSLE. |
| `rmsle_ridge.plot(title="RMSLE by lambda"); plt.xlabel("Lambda"); plt.ylabel("RMSLE")` | Plots RMSLE vs Ridge lambda. |
| `print("Best lambda:", rmsle_ridge.idxmin()); print("RMSLE:", rmsle_ridge.min())` | Prints best lambda and lowest RMSLE for Ridge. |
| `ridge = Ridge(alpha=22.9)` | Sets up best Ridge regression model. |
| `lambda_list = list(np.linspace(0.0006, 0.0007, 11)); rmsle_lasso = [getRMSLE(Lasso(alpha=lambda_, max_iter=100000)) for lambda_ in lambda_list]; rmsle_lasso = pd.Series(rmsle_lasso, index=lambda_list)` | Tests different Lasso regression strengths and records RMSLE. |
| `rmsle_lasso.plot(title="RMSLE by lambda"); plt.xlabel("Lambda"); plt.ylabel("RMSLE")` | Plots RMSLE vs Lasso lambda. |
| `print("Best lambda:", rmsle_lasso.idxmin()); print("RMSLE:", rmsle_lasso.min())` | Prints best lambda and lowest RMSLE for Lasso. |
| `lasso = Lasso(alpha=0.00065, max_iter=100000)` | Sets up best Lasso regression model. |
| `from xgboost import XGBRegressor; xgb = XGBRegressor(...)` | Sets up XGBoost regression model. |
| `getRMSLE(xgb)` | Calculates RMSLE for XGBoost. |
| `from lightgbm import LGBMRegressor; X_train.columns = X_train.columns.str.replace(' ', '_'); lgb = LGBMRegressor(...)` | Sets up LightGBM regression model (with clean column names). |
| `getRMSLE(lgb)` | Calculates RMSLE for LightGBM. |
| `from sklearn.base import BaseEstimator, RegressorMixin, TransformerMixin, clone; class AveragingModel(BaseEstimator, RegressorMixin, TransformerMixin): ...` | Defines a model that averages predictions from several models. |
| `avg_model = AveragingModel(models=(ridge, lasso, xgb, lgb)); getRMSLE(avg_model)` | Sets up and evaluates the model averaging Ridge, Lasso, XGB, and LGBM. |
| `X_test = X_test.reindex(columns=X_train.columns, fill_value=0)` | Ensures test data columns match training data. |
| `my_model = avg_model; my_model.fit(X_train, y); predictions = my_model.predict(X_test); final_predictions = np.exp(predictions) - 1` | Fits the average model and makes predictions, reversing the earlier log transformation. |
| `output = pd.DataFrame({'Id': test_data.index, 'SalePrice': final_predictions}); output.to_csv('submission.csv', index=False)` | Saves predictions in a CSV file for submission. |

---

## Expected Outputs Summary

- Missing values are handled using different strategies depending on the column type.
- Outliers are removed and new features (like total square feet, total bathrooms, etc.) are added.
- Features with high skewness are log-transformed for normality.
- Data is robustly scaled and categorical variables are one-hot encoded.
- The dataset is split into training and testing parts, with their shapes printed.
- Multiple regression models are evaluated using RMSLE (a common regression metric).
- The best-performing regression models are combined using an averaging approach.
- Final predictions are made and saved for submission.
```