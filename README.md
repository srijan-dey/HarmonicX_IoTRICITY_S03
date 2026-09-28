# ECG Monitoring and Normal/Abnormal Classification System

**ESP32-E + AD8232 + MATLAB R2024b + Python + Traditional Machine
Learning**

## Project Overview

This is an educational engineering prototype for ECG signal acquisition,
preprocessing, feature extraction, and Normal/Abnormal ECG
classification using traditional machine-learning methods.

> **Important:** The project does not use deep learning. Suitable
> traditional ML models include SVM, Random Forest, KNN, and Logistic
> Regression. Ollama is optional and is used only to explain an existing
> ML result.

## System Architecture

``` text
ECG Electrodes
      |
      v
AD8232 ECG Sensor
      |
      v
ESP32-E
      |
      v
ECG Acquisition
      |
      v
MATLAB R2024b
      |
      +--> Preprocessing
      +--> 60-sample Segmentation
      +--> Feature Extraction
      |
      v
ecg_signal.csv
      |
      v
Python
      |
      +--> Dataset Validation
      +--> Record-Level Train/Test Split
      +--> Feature Scaling
      +--> Traditional ML
      |
      v
NORMAL / ABNORMAL
      |
      v
Optional Ollama Explanation
```

## Hardware

  Component        Purpose
  ---------------- -------------------------------------
  ESP32-E          ECG data acquisition
  AD8232           ECG signal acquisition/conditioning
  ECG electrodes   RA, LA and RL connections
  USB cable        ESP32-E to computer
  Computer         MATLAB and Python

## AD8232 to ESP32-E Connections

  AD8232   ESP32-E             Purpose
  -------- ------------------- --------------------
  3.3V     3V3                 Power
  GND      GND                 Ground
  OUTPUT   GPIO34 / ADC1_CH6   Analog ECG signal
  LO+      GPIO27              Lead-off detection
  LO-      GPIO26              Lead-off detection

GPIO34 is used as the analog ECG input.

**Hardware note:** AD8232 modules can differ in labeling and
implementation. Verify the exact module pin labels, voltage
requirements, and electrical specifications for the hardware being used.

## Electrode Placement

-   **RA** --- Right Arm
-   **LA** --- Left Arm
-   **RL** --- Right Leg/reference

Follow the electrode-placement instructions supplied with the particular
ECG module/electrode system.

## Software

-   MATLAB R2024b
-   Python 3.x
-   NumPy
-   Pandas
-   SciPy
-   Scikit-learn
-   Matplotlib
-   Joblib
-   Optional: Ollama

### MATLAB

MATLAB is used for ECG generation during development,
acquisition/processing, filtering, segmentation, feature extraction, and
CSV generation.

### Python

Python is used for dataset loading and validation, record-level
train/test splitting, feature scaling, traditional ML training,
evaluation, prediction, and model saving/loading.

### Ollama

Ollama is an optional local language-model layer for generating a
human-readable technical explanation of an already-generated ML result.

**Ollama is not responsible for ECG classification and must not replace
the trained ML model.**

## Dataset Format

The CSV structure is:

``` text
mean,std,min,max,range,rms,energy,skewness,kurtosis,prev_rr,next_rr,label,record,sample,ecg_0,ecg_1,...,ecg_59
```

There are **74 columns**:

-   9 statistical features: `mean`, `std`, `min`, `max`, `range`, `rms`,
    `energy`, `skewness`, `kurtosis`
-   2 RR features: `prev_rr`, `next_rr`
-   3 metadata/label fields: `label`, `record`, `sample`
-   60 waveform samples: `ecg_0` through `ecg_59`

Each row represents one 60-sample ECG segment with extracted features
and metadata.

### Sampling

``` text
Fs = 360 Hz
Segment length = 60 samples
Segment duration = 60 / 360 = 0.1667 seconds approximately
```

## MATLAB Development Data

MATLAB can generate synthetic ECG signals during development. Example
labels are:

``` text
SYNTHETIC_NORMAL
SYNTHETIC_ABNORMAL
```

Possible synthetic variations include:

-   heart-rate variation
-   RR-interval irregularity
-   QRS-width variation
-   T-wave variation/inversion
-   R-wave amplitude variation
-   ST-segment variation
-   low-amplitude noise
-   baseline wander
-   small artifacts

**Synthetic labels are not medically validated Normal/Abnormal
diagnoses.** Synthetic data is intended for pipeline development,
testing, debugging, and demonstration.

For final ML evaluation, use a real publicly available labeled ECG
dataset. Do not fabricate clinical accuracy or performance.

## Feature Extraction

The project uses:

-   Mean
-   Standard deviation
-   Minimum
-   Maximum
-   Range
-   RMS
-   Energy
-   Skewness
-   Kurtosis
-   Previous RR
-   Next RR

For a segment `x[1...N]`:

``` text
Mean   = (1/N) * sum(x[i])
Range  = max(x) - min(x)
RMS    = sqrt((1/N) * sum(x[i]^2))
Energy = sum(x[i]^2)
```

The exact RR-feature definition must remain consistent between training
and prediction. When moving to a real ECG dataset, reproduce the
dataset's intended beat/annotation methodology.

## Machine-Learning Pipeline

``` text
Load CSV
   |
Validate dataset
   |
Separate features / labels / metadata
   |
Record-level train/test split
   |
Feature scaling
   |
Train traditional ML model
   |
Evaluate
   |
Save model
   |
Predict new ECG
```

### Supported Traditional ML Models

-   Support Vector Machine (SVM)
-   Random Forest
-   K-Nearest Neighbors (KNN)
-   Logistic Regression

No model should be declared universally best. Select the model using
validation results and the actual dataset.

## Data Leakage Prevention

ECG records can contain many highly correlated segments. Do not randomly
distribute segments from the same record across both training and
testing sets without addressing leakage.

Prefer:

``` text
Record A -> Training
Record B -> Training
Record C -> Training
Record D -> Testing
Record E -> Testing
```

rather than mixing segments from one record into both sets.

## Evaluation

Use:

-   Accuracy
-   Precision
-   Recall
-   F1-score
-   Confusion matrix
-   ROC-AUC where appropriate

Do not invent results.

``` text
Accuracy:  [INSERT ACTUAL ACCURACY]
Precision: [INSERT ACTUAL PRECISION]
Recall:    [INSERT ACTUAL RECALL]
F1-score:  [INSERT ACTUAL F1 SCORE]
ROC-AUC:   [INSERT ACTUAL ROC-AUC]
```

## Prediction

``` text
New ECG
   |
Preprocessing
   |
60-sample segmentation
   |
Feature extraction
   |
Same scaling/preprocessing as training
   |
Trained ML model
   |
NORMAL / ABNORMAL
```

## Optional Ollama Explanation

``` text
ECG Features
     |
SVM / Random Forest
     |
NORMAL / ABNORMAL
     |
Selected features + ML result
     |
Ollama
     |
Human-readable explanation
```

Ollama is an explanation layer only; it is not the ECG classifier.

## Installation

Create a Python environment if desired:

``` bash
python -m venv .venv
```

Install the main dependencies:

``` bash
pip install numpy pandas scipy scikit-learn matplotlib joblib
```

Install/configure MATLAB R2024b and the ESP32 development support
required by the acquisition firmware.

## Suggested Project Structure

``` text
ECG-ML-Project/
|
+-- README.md
|
+-- matlab/
|   +-- generate_ecg_dataset.m
|   +-- preprocess_ecg.m
|   +-- ecg_signal.csv
|
+-- python/
|   +-- train_model.py
|   +-- evaluate_model.py
|   +-- predict_ecg.py
|   +-- preprocess_data.py
|   +-- models/
|
+-- esp32/
|   +-- ecg_acquisition.ino
|
+-- results/
|   +-- confusion_matrix.png
|   +-- metrics.txt
|
+-- hardware/
|   +-- circuit_diagram.png
|
+-- docs/
    +-- workflow.png
```

Filenames shown here are examples and should be changed to match the
actual implementation.

## How to Run

Generate/acquire the ECG dataset in MATLAB and produce:

``` text
ecg_signal.csv
```

Then, assuming the corresponding Python scripts exist:

``` bash
python train_model.py
python evaluate_model.py
python predict_ecg.py
```

## Troubleshooting

### MATLAB CSV Permission Error

If MATLAB cannot write `ecg_signal.csv`:

1.  Close the CSV in Excel or another application.
2.  Check that the output folder is writable.
3.  Try a different output filename.
4.  Avoid a synchronized/restricted folder if it is locking the file.

### ESP32 ADC Problems

Check:

-   AD8232 power
-   common ground
-   OUTPUT to GPIO34
-   ESP32 ADC configuration
-   signal voltage range
-   wiring continuity

### Lead-Off Problems

Check:

``` text
LO+ -> GPIO27
LO- -> GPIO26
```

and verify that the firmware uses the same pins.

### Unexpectedly High ML Performance

Check:

-   record-level train/test splitting
-   duplicate samples
-   feature leakage
-   class imbalance
-   preprocessing consistency
-   label correctness
-   synthetic-versus-real data differences

A very high score is not automatically evidence of clinical usefulness.

## Real-Time / Hardware Status

The project distinguishes between:

1.  MATLAB synthetic/development pipeline
2.  ESP32-E hardware acquisition
3.  Python offline ML training
4.  New ECG prediction
5.  Future/optional near-real-time integration

Do not call the system **real-time** unless continuous acquisition,
processing, prediction, and timing have actually been implemented and
measured.

## Limitations

-   Educational engineering prototype only.
-   Synthetic ECG labels are not clinical diagnoses.
-   Final evaluation should use real labeled ECG data.
-   Model performance depends on dataset quality and feature
    definitions.
-   Segment-level random splitting can cause data leakage.
-   A 60-sample segment at 360 Hz is approximately 0.1667 seconds.
-   RR features depend on the dataset-generation method.
-   Hardware acquisition and prediction may not yet form a continuous
    real-time system.
-   No clinical validation is implied.
-   ML output must not be used for medical decisions.

## Safety and Medical Disclaimer

> **This project is an educational engineering prototype and is not a
> medical device. The system has not been clinically validated and its
> output must not be used for medical diagnosis or treatment
> decisions.**

For human-connected measurements:

-   Use ECG electrodes appropriately.
-   Verify hardware voltage levels.
-   Verify the exact AD8232 module documentation.
-   Do not connect experimental electronics to a person without
    appropriate electrical-safety precautions.
-   Use a properly isolated/approved setup for human-connected
    measurements.
-   Follow the manufacturer's documentation.

## Future Improvements

-   Continuous ECG acquisition from ESP32-E.
-   More robust signal-quality assessment.
-   Improved ECG beat/segment alignment.
-   R-peak detection for RR features.
-   Evaluation on a real public labeled ECG dataset.
-   Record-level cross-validation.
-   Class-imbalance handling where appropriate.
-   Continuous prediction pipeline.
-   MATLAB/Simulink integration.
-   Proteus simulation where practical.
-   Improved ECG visualization.
-   Optional Ollama explanation interface.
-   Model and preprocessing version management.

## Results Template

### Dataset

``` text
Number of records: [INSERT]
Number of segments: [INSERT]
Number of classes: [INSERT]
Sampling frequency: 360 Hz
Segment length: 60 samples
```

### Machine Learning

``` text
Model: [INSERT MODEL]
Accuracy: [INSERT]
Precision: [INSERT]
Recall: [INSERT]
F1-score: [INSERT]
ROC-AUC: [INSERT IF APPROPRIATE]
```

Add the generated confusion matrix at:

``` text
results/confusion_matrix.png
```

## Technology Stack

  Technology      Role
  --------------- ---------------------------------------
  ESP32-E         Embedded ECG acquisition
  AD8232          ECG signal acquisition/conditioning
  MATLAB R2024b   ECG processing and feature extraction
  CSV             Dataset exchange
  Python 3.x      ML pipeline
  NumPy           Numerical processing
  Pandas          Dataset handling
  SciPy           Signal/data processing
  Scikit-learn    Traditional ML
  Matplotlib      Visualization
  Joblib          Model persistence
  Ollama          Optional explanation layer

## Conclusion

This project demonstrates an end-to-end engineering workflow combining
embedded ECG acquisition, signal processing, feature extraction,
structured data preparation, and traditional machine learning.

The core architecture is:

``` text
ESP32-E
   +
AD8232
   +
MATLAB R2024b
   +
CSV Dataset
   +
Python Traditional ML
   +
Optional Ollama Explanation
```

The project is intended for college-level engineering development and
demonstration. Final model performance should be established using
appropriate labeled ECG data and careful record-level validation.

## References

Add the exact references used by the implementation, including:

-   AD8232 documentation/datasheet
-   ESP32-E board documentation
-   MATLAB R2024b documentation
-   Scikit-learn documentation
-   NumPy documentation
-   Pandas documentation
-   SciPy documentation
-   Joblib documentation
-   The official source and citation for the public ECG dataset used for
    final evaluation

------------------------------------------------------------------------

**Educational use only. This project is not a certified medical device
and has not been clinically validated.**
