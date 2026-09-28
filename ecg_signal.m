clc;
clear;
close all;

%% ============================================================
% ECG SIGNAL GENERATION AND ML DATASET CREATION
%
% Output file:
%     ecg_signal.csv
%
% Output columns:
% mean, std, min, max, range, rms, energy,
% skewness, kurtosis, prev_rr, next_rr,
% label, record, sample,
% ecg_0 ... ecg_59
%
% IMPORTANT:
% The MATLAB ECG is synthetic and is NOT assigned a medical
% Normal/Abnormal ground-truth label.
%% ============================================================


%% ============================================================
% 1. PARAMETERS
%% ============================================================

Fs = 360;                  % Sampling frequency (Hz)
duration = 10;             % ECG duration (seconds)
heartRate = 75;            % Heart rate (BPM)

segmentLength = 60;        % Number of ECG samples per ML row

recordName = "MATLAB_001";

% Synthetic data is only for pipeline testing.
% Do NOT use this as a real medical label.
labelName = "SYNTHETIC_TEST";


%% ============================================================
% 2. TIME VECTOR
%% ============================================================

numSamples = round(Fs * duration);

t = (0:numSamples-1)' / Fs;


%% ============================================================
% 3. GENERATE SYNTHETIC ECG
%% ============================================================

ecg = zeros(numSamples,1);

beatPeriod = 60 / heartRate;

for i = 1:numSamples

    phase = mod(t(i), beatPeriod);

    % ---------------------------------------------------------
    % P wave
    % ---------------------------------------------------------
    P = 0.15 * exp(-((phase - 0.12) / 0.025)^2);

    % ---------------------------------------------------------
    % Q wave
    % ---------------------------------------------------------
    Q = -0.15 * exp(-((phase - 0.25) / 0.012)^2);

    % ---------------------------------------------------------
    % R wave
    % ---------------------------------------------------------
    R = 1.20 * exp(-((phase - 0.27) / 0.015)^2);

    % ---------------------------------------------------------
    % S wave
    % ---------------------------------------------------------
    S = -0.25 * exp(-((phase - 0.30) / 0.015)^2);

    % ---------------------------------------------------------
    % T wave
    % ---------------------------------------------------------
    T = 0.30 * exp(-((phase - 0.48) / 0.06)^2);

    % Complete ECG beat
    ecg(i) = P + Q + R + S + T;

end


%% ============================================================
% 4. ADD NOISE
%% ============================================================

noiseLevel = 0.05;

noise = noiseLevel * randn(size(ecg));

noisyECG = ecg + noise;


%% ============================================================
% 5. BANDPASS FILTER
%% ============================================================

lowCutoff = 0.5;
highCutoff = 40;

[b,a] = butter(4, ...
    [lowCutoff highCutoff] / (Fs/2), ...
    'bandpass');

filteredECG = filtfilt(b,a,noisyECG);


%% ============================================================
% 6. DISPLAY ECG SIGNALS
%% ============================================================

figure('Name','ECG Signal Processing');

subplot(3,1,1);

plot(t,ecg,'LineWidth',1);

xlabel('Time (seconds)');
ylabel('Amplitude');

title('Clean Synthetic ECG');

grid on;

xlim([0 min(5,duration)]);


subplot(3,1,2);

plot(t,noisyECG,'LineWidth',1);

xlabel('Time (seconds)');
ylabel('Amplitude');

title('Noisy Synthetic ECG');

grid on;

xlim([0 min(5,duration)]);


subplot(3,1,3);

plot(t,filteredECG,'LineWidth',1);

xlabel('Time (seconds)');
ylabel('Amplitude');

title('Filtered Synthetic ECG');

grid on;

xlim([0 min(5,duration)]);


%% ============================================================
% 7. CHECK SEGMENT SIZE
%% ============================================================

numSegments = floor(numSamples / segmentLength);

if numSegments < 1
    error('The ECG signal is shorter than one 60-sample segment.');
end

usableSamples = numSegments * segmentLength;

% Remove incomplete samples at the end if necessary
filteredECG = filteredECG(1:usableSamples);


fprintf('\n');
fprintf('============================================\n');
fprintf('ECG SIGNAL INFORMATION\n');
fprintf('============================================\n');

fprintf('Sampling frequency : %d Hz\n',Fs);
fprintf('Duration            : %.2f seconds\n',duration);
fprintf('Heart rate          : %.2f BPM\n',heartRate);
fprintf('Total samples       : %d\n',numSamples);
fprintf('Samples per segment : %d\n',segmentLength);
fprintf('Number of segments  : %d\n',numSegments);


%% ============================================================
% 8. PREALLOCATE FEATURE ARRAYS
%% ============================================================

meanFeature     = zeros(numSegments,1);
stdFeature      = zeros(numSegments,1);
minFeature      = zeros(numSegments,1);
maxFeature      = zeros(numSegments,1);
rangeFeature    = zeros(numSegments,1);
rmsFeature      = zeros(numSegments,1);
energyFeature   = zeros(numSegments,1);
skewFeature     = zeros(numSegments,1);
kurtosisFeature = zeros(numSegments,1);

prevRR = zeros(numSegments,1);
nextRR = zeros(numSegments,1);

recordColumn = strings(numSegments,1);
labelColumn  = strings(numSegments,1);

sampleColumn = (1:numSegments)';

% 60 ECG values for every row
ecgMatrix = zeros(numSegments,segmentLength);


%% ============================================================
% 9. RR INTERVAL
%% ============================================================

% The synthetic ECG has a fixed heart rate.
%
% RR interval:
%
%       RR = 60 / heartRate
%
% For 75 BPM:
%
%       RR = 0.8 seconds
%
% This is a synthetic value and is not obtained from
% R-peak detection.

RR = 60 / heartRate;


%% ============================================================
% 10. FEATURE EXTRACTION
%% ============================================================

for k = 1:numSegments

    % ---------------------------------------------------------
    % Determine segment indexes
    % ---------------------------------------------------------

    startIndex = (k-1) * segmentLength + 1;

    endIndex = startIndex + segmentLength - 1;

    segment = filteredECG(startIndex:endIndex);


    % ---------------------------------------------------------
    % Store 60 ECG samples
    % ---------------------------------------------------------

    ecgMatrix(k,:) = segment';


    % ---------------------------------------------------------
    % Statistical features
    % ---------------------------------------------------------

    meanFeature(k) = mean(segment);

    stdFeature(k) = std(segment);

    minFeature(k) = min(segment);

    maxFeature(k) = max(segment);

    rangeFeature(k) = max(segment) - min(segment);

    rmsFeature(k) = sqrt(mean(segment.^2));

    energyFeature(k) = sum(segment.^2);

    skewFeature(k) = skewness(segment);

    kurtosisFeature(k) = kurtosis(segment);


    % ---------------------------------------------------------
    % RR features
    % ---------------------------------------------------------

    prevRR(k) = RR;

    nextRR(k) = RR;


    % ---------------------------------------------------------
    % Record information
    % ---------------------------------------------------------

    recordColumn(k) = recordName;


    % ---------------------------------------------------------
    % Label
    % ---------------------------------------------------------

    labelColumn(k) = labelName;

end


%% ============================================================
% 11. CREATE MAIN TABLE
%% ============================================================

ECG_Data = table( ...
    meanFeature, ...
    stdFeature, ...
    minFeature, ...
    maxFeature, ...
    rangeFeature, ...
    rmsFeature, ...
    energyFeature, ...
    skewFeature, ...
    kurtosisFeature, ...
    prevRR, ...
    nextRR, ...
    labelColumn, ...
    recordColumn, ...
    sampleColumn);


%% ============================================================
% 12. RENAME MAIN COLUMNS
%% ============================================================

ECG_Data.Properties.VariableNames = { ...
    'mean', ...
    'std', ...
    'min', ...
    'max', ...
    'range', ...
    'rms', ...
    'energy', ...
    'skewness', ...
    'kurtosis', ...
    'prev_rr', ...
    'next_rr', ...
    'label', ...
    'record', ...
    'sample'};


%% ============================================================
% 13. ADD ecg_0 TO ecg_59
%% ============================================================

for n = 1:segmentLength

    columnName = sprintf('ecg_%d',n-1);

    ECG_Data.(columnName) = ecgMatrix(:,n);

end


%% ============================================================
% 14. VERIFY COLUMN COUNT
%% ============================================================

expectedColumns = 14 + segmentLength;

actualColumns = width(ECG_Data);

if actualColumns ~= expectedColumns

    error( ...
        'Column count error. Expected %d columns but found %d.', ...
        expectedColumns,actualColumns);

end


%% ============================================================
% 15. SAVE CSV
%% ============================================================

outputFile = 'ecg_signal.csv';

writetable(ECG_Data,outputFile);


%% ============================================================
% 16. DISPLAY FINAL INFORMATION
%% ============================================================

fprintf('\n');
fprintf('============================================\n');
fprintf('ML DATASET CREATED SUCCESSFULLY\n');
fprintf('============================================\n');

fprintf('Output file        : %s\n',outputFile);
fprintf('Number of rows     : %d\n',height(ECG_Data));
fprintf('Number of columns  : %d\n',width(ECG_Data));

fprintf('\n');

fprintf('Columns:\n');

disp(ECG_Data.Properties.VariableNames');


%% ============================================================
% 17. DISPLAY FIRST ROW
%% ============================================================

fprintf('\n');
fprintf('First row of dataset:\n');

disp(ECG_Data(1,:));


%% ============================================================
% 18. FINAL MESSAGE
%% ============================================================

fprintf('\n');
fprintf('============================================\n');
fprintf('DONE\n');
fprintf('============================================\n');

fprintf('The file has been saved as:\n');
fprintf('%s\n',outputFile);

fprintf('\n');
fprintf('IMPORTANT:\n');
fprintf(['This MATLAB signal is synthetic and is marked ' ...
         'as SYNTHETIC_TEST.\n']);

fprintf(['It should be used to test the ML pipeline, ' ...
         'not as ground-truth medical training data.\n']);

fprintf('============================================\n');