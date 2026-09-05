# Bundled teaching datasets

The raw benchmark data in this directory is bundled so lessons run without a
network connection. Dataset blocks emit `features`, one-hot or binary
`targets`, and integer `labels` tensors.

- Iris: Fisher, R. (1936), UCI Machine Learning Repository,
  https://doi.org/10.24432/C56C76
- Wine: Aeberhard, S. & Forina, M. (1992), UCI Machine Learning Repository,
  https://doi.org/10.24432/C5PC7J
- Breast Cancer Wisconsin (Diagnostic): Wolberg, W., Mangasarian, O., Street,
  N., & Street, W. (1993), UCI Machine Learning Repository,
  https://doi.org/10.24432/C5DW2B

The Breast Cancer teaching block uses the first four numeric features from the
diagnostic dataset to keep the graph fast and the input dimension approachable.
The UCI datasets are distributed under CC BY 4.0.
