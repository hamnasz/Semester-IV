import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.decomposition import PCA
from imblearn.over_sampling import SMOTE
from sklearn.preprocessing import LabelEncoder
from scipy import stats
import warnings
warnings.simplefilter(action='ignore', category=FutureWarning)
sns.set_style('darkgrid')
train_data = pd.read_csv('Data/train.csv', index_col='Id')
test_data = pd.read_csv('Data/test.csv', index_col='Id')
X_train = train_data.drop(['SalePrice'], axis=1)
y = train_data.SalePrice
X = pd.concat([X_train, test_data], axis=0)
print("Train data's size: ", X_train.shape)
print("Test data's size: ", test_data.shape)
numCols = list(X_train.select_dtypes(exclude='object').columns)
print(f"There are {len(numCols)} numerical features:\n", numCols)
catCols = list(X_train.select_dtypes(include='object').columns)
print(f"There are {len(catCols)} numerical features:\n", catCols)
train_data.head()
train_data.tail()
train_data.shape
train_data.sample()
train_data.info()
train_data.describe()
train_data.isnull().sum()
numeric_cols = train_data.select_dtypes(include=[np.number])
non_numeric_cols = train_data.select_dtypes(exclude=[np.number])
numeric_cols.fillna(numeric_cols.mean(), inplace=True)
train_data = pd.concat([numeric_cols, non_numeric_cols], axis=1)
missing_values = train_data.isnull().sum()
print(missing_values)
numeric_cols = train_data.select_dtypes(include=[np.number])
non_numeric_cols = train_data.select_dtypes(exclude=[np.number])
numeric_cols.fillna(numeric_cols.mean(), inplace=True)
for col in non_numeric_cols.columns:
    non_numeric_cols[col].fillna(non_numeric_cols[col].mode()[0], inplace=True)
train_data = pd.concat([numeric_cols, non_numeric_cols], axis=1)
missing_values = train_data.isnull().sum()
print(missing_values)
train_data.isnull().sum()
train_data.dropna(inplace=True)
missing_values =train_data.isnull().sum()
print(missing_values)
train_data.drop_duplicates(inplace=True)
train_data.shape
numeric_cols = train_data.select_dtypes(include=[np.number])
Q1 = numeric_cols.quantile(0.25)
Q3 = numeric_cols.quantile(0.75)
IQR = Q3 - Q1
train_data_cleaned = train_data[~((numeric_cols < (Q1 - 1.5 * IQR)) | (numeric_cols > (Q3 + 1.5 * IQR))).any(axis=1)]
plt.figure(figsize=(20, 6))
plt.subplot(1, 2, 1)
numeric_cols.boxplot()
plt.title("Before Outlier Removal")
plt.xticks(rotation=90)
plt.tight_layout()
plt.show()
plt.figure(figsize=(20, 6))
plt.subplot(1, 2, 2)
train_data_cleaned.select_dtypes(include=[np.number]).boxplot()
plt.title("After Outlier Removal")
plt.xticks(rotation=90)
plt.tight_layout()
plt.show()
train_data_cleaned.head()
from sklearn.preprocessing import MinMaxScaler
numeric_cols = train_data.select_dtypes(include=[np.number])
non_numeric_cols = train_data.select_dtypes(exclude=[np.number])
scaler = MinMaxScaler()
scaled_numeric_data = scaler.fit_transform(numeric_cols)
scaled_numeric_df = pd.DataFrame(scaled_numeric_data, columns=numeric_cols.columns)
scaled_data = pd.concat([scaled_numeric_df, non_numeric_cols.reset_index(drop=True)], axis=1)
print(scaled_data.shape)
print()
print('*' * 60)
scaled_data.head()
from sklearn.preprocessing import StandardScaler
numeric_cols = train_data.select_dtypes(include=[np.number])
non_numeric_cols = train_data.select_dtypes(exclude=[np.number])
scaler = StandardScaler()
scaled_numeric_data = scaler.fit_transform(numeric_cols)
scaled_numeric_df = pd.DataFrame(scaled_numeric_data, columns=numeric_cols.columns)
scaled_data = pd.concat([scaled_numeric_df, non_numeric_cols.reset_index(drop=True)], axis=1)
print(scaled_data.shape)
print()
print('*' * 60)
scaled_data.head()
train_data["LandContour"].unique()
train_data.Neighborhood.unique()
from sklearn.preprocessing import StandardScaler
cat_features = [feature for feature in train_data.columns if train_data[feature].dtype == 'O']
data1 = pd.get_dummies(cat_features)
data1
cat_features = [feature for feature in train_data.columns if train_data[feature].dtype == 'O']
data1 = pd.get_dummies(train_data, columns=cat_features)
scaled_data = pd.concat([train_data, data1], axis=1)
print(scaled_data.shape)
print()
print('*' * 70)
scaled_data.head()
from sklearn.decomposition import PCA
train_data.fillna(train_data.mean(numeric_only=True), inplace=True)
cat_features = [feature for feature in train_data.columns if train_data[feature].dtype == 'O']
numeric_features = [feature for feature in train_data.columns if train_data[feature].dtype != 'O']
train_data = pd.get_dummies(train_data, columns=cat_features)
scaler = StandardScaler()
train_data[numeric_features] = scaler.fit_transform(train_data[numeric_features].values)
pca = PCA(n_components=15)
train_data_pca = pca.fit_transform(train_data)
print(train_data_pca.shape)
print(train_data_pca[:5])
plt.figure(figsize=(14, 6))
plt.subplot(1, 2, 1)
plt.scatter(train_data[numeric_features[0]], train_data[numeric_features[1]], alpha=0.5)
plt.title('Original train_Data')
plt.xlabel(numeric_features[0])
plt.ylabel(numeric_features[1])
pca = PCA(n_components=15)
train_data_pca = pca.fit_transform(train_data)
plt.subplot(1, 2, 2)
plt.scatter(train_data_pca[:, 0], train_data_pca[:, 1], alpha=0.5)
plt.title('PCA Transformed train_Data')
plt.xlabel('Principal Component 1')
plt.ylabel('Principal Component 2')
plt.tight_layout()
plt.show()
train_data.LotArea.value_counts(True)
train_data = pd.read_csv('Data/train.csv')
train_data.fillna(train_data.mean(numeric_only=True), inplace=True)
if 'HouseStyle' not in train_data.columns:
    raise KeyError("'HouseStyle' column is not present in the dataset.")
house_style = train_data['HouseStyle'].copy()
cat_features = [feature for feature in train_data.columns if train_data[feature].dtype == 'O']
numeric_features = [feature for feature in train_data.columns if train_data[feature].dtype != 'O' and feature != 'HouseStyle']
train_data = pd.get_dummies(train_data, columns=cat_features)
scaler = StandardScaler()
train_data[numeric_features] = scaler.fit_transform(train_data[numeric_features].values)
print(train_data.columns.tolist())
house_style_cols = [col for col in train_data.columns if col.startswith('HouseStyle_')]
y = train_data[house_style_cols].idxmax(axis=1).str.replace('HouseStyle_', '')
X = train_data.drop(columns=house_style_cols)
if len(y.unique()) <= 1:
    raise ValueError("The target 'y' needs to have more than 1 class. Got 1 class instead.")
print("Before SMOTE:", X.shape, y.shape)
smote = SMOTE(random_state=42)
X_resampled, y_resampled = smote.fit_resample(X, y)
train_data_resampled = pd.concat(
    [pd.DataFrame(X_resampled, columns=X.columns), pd.DataFrame(y_resampled, columns=['HouseStyle'])],
    axis=1
)
print("After SMOTE:", X_resampled.shape, y_resampled.shape)
print(train_data_resampled.head())
train_data = pd.read_csv('Data/train.csv')
train_data.fillna(train_data.mean(numeric_only=True), inplace=True)
cat_features = [feature for feature in train_data.columns if train_data[feature].dtype == 'O']
numeric_features = [feature for feature in train_data.columns if train_data[feature].dtype != 'O']
train_data = pd.get_dummies(train_data, columns=cat_features)
scaler = StandardScaler()
train_data[numeric_features] = scaler.fit_transform(train_data[numeric_features].values)
if train_data['SalePrice'].dtype != 'int64' and train_data['SalePrice'].dtype != 'bool':
    train_data['SalePrice'] = (train_data['SalePrice'] > 0.5).astype(int)
X = train_data.drop(columns=['SalePrice'])
y = train_data['LotArea']
if y.dtype == 'O':
    le = LabelEncoder()
    y = le.fit_transform(y)
print(X.shape, y.shape)
upper_limit = train_data['SalePrice'].quantile(0.99)
data = train_data[train_data['SalePrice'] <= upper_limit]
data['SalePrice'] = np.log1p(data['SalePrice'])
data_resampled = pd.concat([pd.DataFrame(X_resampled, columns=X.columns), pd.DataFrame(y_resampled, columns=['SalePrice'])], axis=1)
data_resampled.head()
train_data = pd.read_csv('Data/train.csv', index_col='Id')
test_data = pd.read_csv('Data/test.csv', index_col='Id')
X_train = train_data.drop(['SalePrice'], axis=1)
y = train_data.SalePrice
X = pd.concat([X_train, test_data], axis=0)
plt.figure(figsize=(8,6))
sns.distplot(y)
title = plt.title("House Price Distribution")
print(f"""Skewness: {y.skew()}
Kurtosis: {y.kurt()}""")
corr_mat = train_data.select_dtypes(include='number').corr()['SalePrice'].sort_values(ascending=False)
print(corr_mat.head(11))
from sklearn.feature_selection import RFE
from sklearn.linear_model import LinearRegression
estimator = LinearRegression()
rfe = RFE(estimator, n_features_to_select=10, step=1)
selector = rfe.fit(X_train.fillna(0).select_dtypes(exclude='object'), y)
selectedFeatures = list(
    X_train.select_dtypes(exclude='object').columns[selector.support_])
selectedFeatures
plt.figure(figsize=(8, 6))
sns.boxplot(x='OverallQual', y='SalePrice', data=train_data, palette='GnBu')
title = plt.title('House Price by Overall Quality')
def plotCorrelation(variables):
    print("Correlation: ", train_data[[variables[0], variables[1]]].corr().iloc[1, 0])
    sns.jointplot(
        x=variables[0],
        y=variables[1],
        data=train_data,
        kind='reg',
        height=7,
        scatter_kws={'s': 10},
        marginal_kws={'kde': True}
    )
plotCorrelation(['GrLivArea', 'SalePrice'])
plt.figure(figsize=(8, 6))
sns.boxplot(x='GarageCars', y='SalePrice', data=train_data, palette='GnBu')
title = plt.title('House Price by Garage Size')
plt.figure(figsize=(15, 6))
sns.scatterplot(x='YearBuilt', y='SalePrice', data=train_data)
title = plt.title('House Price by Year Built')
sigCatCols = [
    'Street', 'LandContour', 'LotConfig', 'LandSlope', 'Neighborhood',
    'Condition1', 'Condition2', 'RoofMatl', 'ExterQual', 'BsmtQual',
    'BsmtExposure', 'KitchenQual', 'Functional', 'GarageQual', 'PoolQC'
]
def visualizeCatFeature(feature):
    featOrder = train_data.groupby(
        [feature]).median().SalePrice.sort_values(ascending=False).index
    sns.boxplot(x=feature,
                y='SalePrice',
                data=train_data,
                order=featOrder,
                palette='GnBu_r')
def visualizeCatFeature(col):
    cat_price = train_data.groupby(col)['SalePrice'].median().sort_values()
    plt.bar(cat_price.index, cat_price.values)
    plt.xlabel(col)
    plt.ylabel('Median SalePrice')
plt.figure(figsize=(12, 6))
visualizeCatFeature('SalePrice')
plt.title('House Price by SalePrice')
plt.xticks(rotation=45)
plt.tight_layout()
plt.show()
plt.figure(figsize=(8, 6))
visualizeCatFeature('RoofMatl')
title = plt.title('House Price by Roof Material')
plt.figure(figsize=(8, 6))
visualizeCatFeature('KitchenQual')
title = plt.title('House Price by Kitchen Quality')
numeric_data = train_data.select_dtypes(include='number')
corr_mat = numeric_data.corr()
high_corr_mat = corr_mat[abs(corr_mat) >= 0.5]
plt.figure(figsize=(15, 10))
sns.heatmap(high_corr_mat,
            annot=True,
            fmt='.1f',
            cmap='GnBu',
            vmin=0.5,
            vmax=1)
plt.title('Correlation Heatmap')
plt.show()
missing_data_count = X.isnull().sum()
missing_data_percent = X.isnull().sum() / len(X) * 100
missing_data = pd.DataFrame({
    'Count': missing_data_count,
    'Percent': missing_data_percent
})
missing_data = missing_data[missing_data.Count > 0]
missing_data.sort_values(by='Count', ascending=False, inplace=True)
print(f"There are {missing_data.shape[0]} features having missing data.\n")
print("Top 10 missing value features:")
missing_data.head(10)
plt.figure(figsize=(12, 6))
sns.barplot(y=missing_data.head(18).index,
            x=missing_data.head(18).Count,
            palette='GnBu_r')
title = plt.title("Missing Values")
missing_data_count = X.isnull().sum()
missing_data_percent = X.isnull().sum() / len(X) * 100
missing_data = pd.DataFrame({
    'Count': missing_data_count,
    'Percent': missing_data_percent
})
missing_data = missing_data[missing_data.Count > 0]
missing_data.sort_values(by='Count', ascending=False, inplace=True)
missing_data.head(10)
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